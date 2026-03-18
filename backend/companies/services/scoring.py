"""
Company Visa-Fair Scoring Algorithm

This module calculates a comprehensive visa-fair score for companies
based on multiple factors related to H-1B sponsorship practices.

Scoring Factors (each 0-10 scale, weighted):
1. H-1B Approval Rate (weight: 30%)
2. Sponsorship Volume/Consistency (weight: 25%)
3. Salary Competitiveness (weight: 25%)
4. Sponsorship Stability (weight: 20%)

Final Score: Weighted average, scaled to 0-10
"""
from decimal import Decimal
from typing import Optional, Dict, Any
from django.db.models import Avg, Count, Q, Min, Max
from django.utils import timezone
from companies.models import Company
from h1b_data.models import H1BApplication


class CompanyScorer:
    """Calculate visa-fair scores for companies"""
    
    # Weights for scoring components
    WEIGHTS = {
        'approval_rate': Decimal('0.30'),
        'consistency': Decimal('0.25'),
        'salary': Decimal('0.25'),
        'stability': Decimal('0.20'),
    }
    
    def __init__(self, lookback_years: int = 5):
        self.lookback_years = lookback_years
        self.current_year = timezone.now().year
        self.start_year = self.current_year - lookback_years
    
    def calculate_score(self, company: Company) -> Dict[str, Any]:
        """
        Calculate complete visa-fair score for a company.
        Returns dict with scores and component breakdown.
        """
        # Get H1B data for the company
        h1b_data = H1BApplication.objects.filter(
            employer=company,
            fiscal_year__gte=self.start_year
        )
        
        # Calculate component scores
        approval_score = self._calculate_approval_rate_score(h1b_data)
        consistency_score = self._calculate_consistency_score(h1b_data)
        salary_score = self._calculate_salary_score(h1b_data)
        stability_score = self._calculate_stability_score(h1b_data)
        
        # Calculate weighted total
        total_score = (
            approval_score * self.WEIGHTS['approval_rate'] +
            consistency_score * self.WEIGHTS['consistency'] +
            salary_score * self.WEIGHTS['salary'] +
            stability_score * self.WEIGHTS['stability']
        )
        
        return {
            'visa_fair_score': round(total_score * 10, 1),  # Scale to 0-100
            'components': {
                'approval_rate': {
                    'score': round(approval_score * 10, 1),  # Scale to 0-100
                    'weight': float(self.WEIGHTS['approval_rate']),
                    'weighted_score': round(approval_score * self.WEIGHTS['approval_rate'] * 10, 2)
                },
                'consistency': {
                    'score': round(consistency_score * 10, 1),  # Scale to 0-100
                    'weight': float(self.WEIGHTS['consistency']),
                    'weighted_score': round(consistency_score * self.WEIGHTS['consistency'] * 10, 2)
                },
                'salary': {
                    'score': round(salary_score * 10, 1),  # Scale to 0-100
                    'weight': float(self.WEIGHTS['salary']),
                    'weighted_score': round(salary_score * self.WEIGHTS['salary'] * 10, 2)
                },
                'stability': {
                    'score': round(stability_score * 10, 1),  # Scale to 0-100
                    'weight': float(self.WEIGHTS['stability']),
                    'weighted_score': round(stability_score * self.WEIGHTS['stability'] * 10, 2)
                },
            },
            'total_applications': h1b_data.count(),
            'data_period': f"FY{self.start_year}-FY{self.current_year}"
        }
    
    def _calculate_approval_rate_score(self, h1b_data) -> Decimal:
        """
        Score based on H-1B approval rate.
        95%+ = 10, 90-95% = 9, 80-90% = 7-8, 70-80% = 5-6, <70% = 0-4
        """
        decided = h1b_data.filter(
            case_status__in=['certified', 'denied']
        )
        
        if decided.count() < 10:
            # Not enough data - neutral score
            return Decimal('5.0')
        
        approvals = decided.filter(case_status='certified').count()
        rate = (approvals / decided.count()) * 100
        
        # Convert to 0-10 score
        if rate >= 95:
            return Decimal('10.0')
        elif rate >= 90:
            return Decimal('9.0') + Decimal(rate - 90) / Decimal('5')
        elif rate >= 80:
            return Decimal('7.0') + Decimal(rate - 80) / Decimal('10')
        elif rate >= 70:
            return Decimal('5.0') + Decimal(rate - 70) / Decimal('10')
        else:
            return Decimal('4.0') * Decimal(rate) / Decimal('70')
    
    def _calculate_consistency_score(self, h1b_data) -> Decimal:
        """
        Score based on consistent sponsorship over years.
        Rewards companies that sponsor every year vs. sporadic filers.
        """
        yearly_counts = h1b_data.values('fiscal_year').annotate(
            count=Count('id')
        ).order_by('fiscal_year')
        
        if not yearly_counts:
            return Decimal('0.0')
        
        total_years = self.lookback_years
        active_years = yearly_counts.count()
        
        # Calculate consistency ratio
        consistency_ratio = active_years / total_years
        
        # Calculate average volume per active year
        avg_volume = sum(y['count'] for y in yearly_counts) / active_years
        
        # Score: max 10 for sponsoring every year with high volume
        # Volume bonus: up to +2 points for high volume sponsors (>50/year)
        base_score = consistency_ratio * 8  # Max 8 for consistency
        volume_bonus = min(avg_volume / 25, 2)  # Max 2 bonus
        
        return Decimal(str(min(base_score + volume_bonus, 10)))
    
    def _calculate_salary_score(self, h1b_data) -> Decimal:
        """
        Score based on salary competitiveness.
        Compares company's average wage to prevailing wage.
        """
        salaries = h1b_data.filter(
            wage_rate_of_pay_from__gt=0,
            prevailing_wage__gt=0
        ).aggregate(
            avg_wage=Avg('wage_rate_of_pay_from'),
            avg_prevailing=Avg('prevailing_wage'),
            count=Count('id')
        )
        
        if salaries['count'] < 5:
            return Decimal('5.0')  # Neutral if not enough data
        
        avg_wage = float(salaries['avg_wage'] or 0)
        avg_prevailing = float(salaries['avg_prevailing'] or 1)
        
        # Calculate premium over prevailing wage
        premium_ratio = avg_wage / avg_prevailing
        
        # Score: 10 for 150%+ of prevailing, 5 for 100%, 0 for <80%
        if premium_ratio >= 1.5:
            return Decimal('10.0')
        elif premium_ratio >= 1.0:
            # Linear scale from 5 to 10
            return Decimal('5.0') + Decimal((premium_ratio - 1.0) * 10)
        elif premium_ratio >= 0.8:
            # Linear scale from 0 to 5
            return Decimal((premium_ratio - 0.8) * 25)
        else:
            return Decimal('0.0')
    
    def _calculate_stability_score(self, h1b_data) -> Decimal:
        """
        Score based on sponsorship stability.
        Rewards consistent recent activity, penalizes decline.
        """
        # Get recent vs. older data
        recent_years = h1b_data.filter(fiscal_year__gte=self.current_year - 2)
        older_years = h1b_data.filter(
            fiscal_year__lt=self.current_year - 2,
            fiscal_year__gte=self.start_year
        )
        
        recent_count = recent_years.count()
        older_count = older_years.count()
        
        if recent_count == 0:
            # No recent activity - significant penalty
            return Decimal('0.0') if older_count > 0 else Decimal('5.0')
        
        if older_count == 0:
            # Only recent data - moderate score
            return Decimal('6.0')
        
        # Calculate trend
        recent_avg = recent_count / 2  # 2 recent years
        older_avg = older_count / (self.lookback_years - 2)  # older years
        
        trend_ratio = recent_avg / older_avg if older_avg > 0 else 1.0
        
        # Score based on trend
        if trend_ratio >= 1.5:
            # Growing - excellent
            return Decimal('10.0')
        elif trend_ratio >= 1.0:
            # Stable - good
            return Decimal('7.0') + Decimal((trend_ratio - 1.0) * 6)
        elif trend_ratio >= 0.5:
            # Declining - moderate
            return Decimal('4.0') + Decimal((trend_ratio - 0.5) * 6)
        else:
            # Significant decline - poor
            return Decimal('2.0') + Decimal(trend_ratio * 4)
    
    def update_company_score(self, company: Company, save: bool = True) -> Company:
        """
        Calculate and optionally save score to company.
        """
        result = self.calculate_score(company)
        
        company.visa_fair_score = result['visa_fair_score']
        company.sponsorship_consistency_score = result['components']['consistency']['score']
        
        # Calculate overall approval rate
        h1b_data = H1BApplication.objects.filter(employer=company)
        decided = h1b_data.filter(case_status__in=['certified', 'denied'])
        if decided.count() > 0:
            approvals = decided.filter(case_status='certified').count()
            company.h1b_approval_rate = Decimal(
                (approvals / decided.count()) * 100
            ).quantize(Decimal('0.01'))
        
        # Calculate salary percentile (simplified - would need market data)
        avg_salary = h1b_data.filter(
            wage_rate_of_pay_from__gt=0
        ).aggregate(avg=Avg('wage_rate_of_pay_from'))['avg']
        
        if avg_salary:
            # This is a simplified placeholder - real implementation
            # would compare to market data
            company.avg_salary_percentile = min(
                int((float(avg_salary) / 150000) * 100),
                99
            )
        
        if save:
            company.save()
        
        return company


def score_all_companies(lookback_years: int = 5) -> Dict[str, int]:
    """
    Recalculate scores for all companies.
    Returns statistics about the operation.
    """
    scorer = CompanyScorer(lookback_years)
    companies = Company.objects.all()
    
    updated = 0
    failed = 0
    
    for company in companies:
        try:
            scorer.update_company_score(company, save=True)
            updated += 1
        except Exception as e:
            failed += 1
            # Log error but continue
            print(f"Failed to score {company.name}: {e}")
    
    return {
        'total': companies.count(),
        'updated': updated,
        'failed': failed
    }


def get_company_score_breakdown(company_id: int) -> Optional[Dict]:
    """
    Get detailed score breakdown for a specific company.
    """
    try:
        company = Company.objects.get(id=company_id)
        scorer = CompanyScorer()
        return scorer.calculate_score(company)
    except Company.DoesNotExist:
        return None
