"""
Sponsorship Likelihood Tracker

Calculates the likelihood of a company sponsoring H-1B for a specific role
based on historical data, approval rates, and recent trends.
"""
from typing import Dict, Optional, List
from decimal import Decimal
from datetime import datetime
from django.db.models import Count, Q, Avg, Max
from companies.models import Company
from h1b_data.models import H1BApplication


class SponsorshipTracker:
    """Track and calculate sponsorship likelihood for companies"""
    
    # Score weights
    WEIGHTS = {
        'volume': Decimal('0.25'),      # Historical filing volume
        'approval_rate': Decimal('0.30'),  # H-1B approval rate
        'consistency': Decimal('0.20'),    # Year-over-year consistency
        'recency': Decimal('0.15'),        # Recent activity
        'role_match': Decimal('0.10'),     # Similar role history
    }
    
    def __init__(self, lookback_years: int = 5):
        self.lookback_years = lookback_years
        self.current_year = datetime.now().year
        self.start_year = self.current_year - lookback_years
    
    def calculate_likelihood(
        self,
        company: Company,
        job_title: Optional[str] = None,
        experience_level: Optional[str] = None
    ) -> Dict:
        """
        Calculate sponsorship likelihood for a company and optional role.
        Returns score (0-10) and detailed breakdown.
        """
        # Get historical H1B data
        h1b_data = H1BApplication.objects.filter(
            employer=company,
            fiscal_year__gte=self.start_year
        )
        
        total_apps = h1b_data.count()
        
        if total_apps == 0:
            return {
                'likelihood_score': Decimal('0.0'),
                'likelihood_percentage': 0,
                'risk_level': 'unknown',
                'message': 'No sponsorship history found for this company',
                'components': {},
                'recommendations': [
                    'Research company immigration policies directly',
                    'Ask recruiter about sponsorship during initial screening',
                    'Check job posting for sponsorship mentions'
                ]
            }
        
        # Calculate component scores
        volume_score = self._calculate_volume_score(h1b_data, total_apps)
        approval_score = self._calculate_approval_score(h1b_data)
        consistency_score = self._calculate_consistency_score(h1b_data)
        recency_score = self._calculate_recency_score(h1b_data)
        role_match_score = self._calculate_role_match_score(
            h1b_data, job_title, experience_level
        )
        
        # Calculate weighted total (0-10 scale)
        total_score = (
            volume_score * self.WEIGHTS['volume'] +
            approval_score * self.WEIGHTS['approval_rate'] +
            consistency_score * self.WEIGHTS['consistency'] +
            recency_score * self.WEIGHTS['recency'] +
            role_match_score * self.WEIGHTS['role_match']
        ) * Decimal('10')  # Scale to 0-10
        
        # Determine risk level
        if total_score >= 7:
            risk_level = 'excellent'
        elif total_score >= 5:
            risk_level = 'good'
        elif total_score >= 3:
            risk_level = 'moderate'
        else:
            risk_level = 'poor'
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            total_score, volume_score, approval_score, consistency_score,
            job_title, h1b_data
        )
        
        return {
            'likelihood_score': round(total_score, 1),
            'likelihood_percentage': int(total_score * 10),
            'risk_level': risk_level,
            'total_historical_apps': total_apps,
            'data_period': f'FY{self.start_year}-FY{self.current_year}',
            'components': {
                'volume': {
                    'score': round(volume_score, 2),
                    'weight': float(self.WEIGHTS['volume']),
                    'description': 'Historical filing volume'
                },
                'approval_rate': {
                    'score': round(approval_score, 2),
                    'weight': float(self.WEIGHTS['approval_rate']),
                    'description': 'H-1B approval rate'
                },
                'consistency': {
                    'score': round(consistency_score, 2),
                    'weight': float(self.WEIGHTS['consistency']),
                    'description': 'Year-over-year consistency'
                },
                'recency': {
                    'score': round(recency_score, 2),
                    'weight': float(self.WEIGHTS['recency']),
                    'description': 'Recent sponsorship activity'
                },
                'role_match': {
                    'score': round(role_match_score, 2),
                    'weight': float(self.WEIGHTS['role_match']),
                    'description': 'Similar role history'
                },
            },
            'recommendations': recommendations,
            'similar_role_approvals': h1b_data.filter(
                job_title__icontains=job_title or '',
                case_status='certified'
            ).count() if job_title else 0
        }
    
    def _calculate_volume_score(self, h1b_data, total_apps: int) -> Decimal:
        """Score based on total filing volume"""
        if total_apps == 0:
            return Decimal('0.0')
        
        # Score: 10 for 1000+ apps, scaling down
        if total_apps >= 1000:
            return Decimal('1.0')
        elif total_apps >= 500:
            return Decimal('0.9')
        elif total_apps >= 200:
            return Decimal('0.8')
        elif total_apps >= 100:
            return Decimal('0.7')
        elif total_apps >= 50:
            return Decimal('0.6')
        elif total_apps >= 20:
            return Decimal('0.5')
        elif total_apps >= 10:
            return Decimal('0.4')
        else:
            return Decimal('0.3')
    
    def _calculate_approval_score(self, h1b_data) -> Decimal:
        """Score based on H-1B approval rate"""
        decided = h1b_data.filter(case_status__in=['certified', 'denied'])
        
        if decided.count() < 5:
            # Not enough data - neutral score
            return Decimal('0.7')
        
        approvals = decided.filter(case_status='certified').count()
        rate = approvals / decided.count()
        
        # Score linearly: 0.5 for 70%, 1.0 for 95%+
        if rate >= 0.95:
            return Decimal('1.0')
        elif rate >= 0.70:
            return Decimal('0.5') + Decimal((rate - 0.70) / 0.50)
        else:
            return Decimal('0.5') * (rate / 0.70)
    
    def _calculate_consistency_score(self, h1b_data) -> Decimal:
        """Score based on year-over-year sponsorship consistency"""
        yearly_counts = h1b_data.values('fiscal_year').annotate(
            count=Count('id')
        ).order_by('fiscal_year')
        
        if not yearly_counts:
            return Decimal('0.0')
        
        active_years = yearly_counts.count()
        total_years = self.lookback_years
        
        # Calculate consistency ratio
        consistency_ratio = active_years / total_years
        
        # Check variance in yearly volumes
        counts = [y['count'] for y in yearly_counts]
        if len(counts) > 1:
            avg_count = sum(counts) / len(counts)
            variance = sum((c - avg_count) ** 2 for c in counts) / len(counts)
            std_dev = variance ** 0.5
            
            # Lower variance = higher consistency
            consistency_factor = max(0, 1 - (std_dev / avg_count if avg_count > 0 else 0))
        else:
            consistency_factor = 0.5
        
        return Decimal(str(min(consistency_ratio * consistency_factor * 1.2, 1.0)))
    
    def _calculate_recency_score(self, h1b_data) -> Decimal:
        """Score based on recent sponsorship activity"""
        recent_years = h1b_data.filter(fiscal_year__gte=self.current_year - 2)
        older_years = h1b_data.filter(
            fiscal_year__lt=self.current_year - 2,
            fiscal_year__gte=self.start_year
        )
        
        recent_count = recent_years.count()
        older_count = older_years.count()
        
        if recent_count == 0:
            return Decimal('0.0') if older_count > 0 else Decimal('0.5')
        
        if older_count == 0:
            return Decimal('0.7')  # New sponsor
        
        recent_avg = recent_count / 2
        older_avg = older_count / (self.lookback_years - 2)
        
        trend = recent_avg / older_avg if older_avg > 0 else 1.0
        
        # Score based on trend
        if trend >= 1.5:
            return Decimal('1.0')  # Growing
        elif trend >= 1.0:
            return Decimal('0.8')  # Stable/positive
        elif trend >= 0.5:
            return Decimal('0.6')  # Moderate decline
        else:
            return Decimal('0.4')  # Significant decline
    
    def _calculate_role_match_score(
        self,
        h1b_data,
        job_title: Optional[str],
        experience_level: Optional[str]
    ) -> Decimal:
        """Score based on similar role history"""
        if not job_title:
            return Decimal('0.5')  # Neutral if no job title
        
        # Search for similar job titles
        similar_roles = h1b_data.filter(
            job_title__icontains=job_title
        )
        
        if similar_roles.count() >= 20:
            return Decimal('1.0')
        elif similar_roles.count() >= 10:
            return Decimal('0.8')
        elif similar_roles.count() >= 5:
            return Decimal('0.6')
        elif similar_roles.count() >= 1:
            return Decimal('0.4')
        else:
            return Decimal('0.2')
    
    def _generate_recommendations(
        self,
        total_score: Decimal,
        volume_score: Decimal,
        approval_score: Decimal,
        consistency_score: Decimal,
        job_title: Optional[str],
        h1b_data
    ) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if total_score >= 7:
            recommendations.append(
                "Excellent sponsorship history - strong candidate for H-1B support"
            )
        elif total_score >= 5:
            recommendations.append(
                "Good sponsorship track record - likely to support H-1B"
            )
        elif total_score >= 3:
            recommendations.append(
                "Moderate sponsorship activity - verify with recruiter"
            )
        else:
            recommendations.append(
                "Limited sponsorship history - confirm policy early in process"
            )
        
        if volume_score < 0.5:
            recommendations.append(
                "Small company with limited sponsorship experience - ask about their immigration attorney"
            )
        
        if approval_score < 0.6:
            recommendations.append(
                "Lower than average approval rate - ensure strong case preparation"
            )
        
        if consistency_score < 0.5:
            recommendations.append(
                "Inconsistent sponsorship activity - verify current policy"
            )
        
        if job_title:
            similar_approvals = h1b_data.filter(
                job_title__icontains=job_title,
                case_status='certified'
            ).count()
            if similar_approvals >= 5:
                recommendations.append(
                    f"Company has successfully sponsored {similar_approvals} similar positions"
                )
        
        recommendations.extend([
            "Ask about timeline for H-1B filing during offer negotiations",
            "Request clarity on green card sponsorship policy"
        ])
        
        return recommendations


def get_company_sponsorship_likelihood(
    company_id: int,
    job_title: Optional[str] = None,
    experience_level: Optional[str] = None
) -> Optional[Dict]:
    """
    Convenience function to get sponsorship likelihood.
    """
    try:
        company = Company.objects.get(id=company_id)
        tracker = SponsorshipTracker()
        return tracker.calculate_likelihood(company, job_title, experience_level)
    except Company.DoesNotExist:
        return None


def get_top_sponsors(
    industry: Optional[str] = None,
    limit: int = 10
) -> List[Dict]:
    """
    Get top companies with best sponsorship track records.
    """
    tracker = SponsorshipTracker()
    
    queryset = Company.objects.filter(total_h1b_filings__gte=10)
    
    if industry:
        queryset = queryset.filter(industry=industry)
    
    results = []
    for company in queryset[:50]:  # Limit initial set
        likelihood = tracker.calculate_likelihood(company)
        results.append({
            'company': company,
            'likelihood': likelihood
        })
    
    # Sort by score
    results.sort(key=lambda x: x['likelihood']['likelihood_score'], reverse=True)
    
    return results[:limit]
