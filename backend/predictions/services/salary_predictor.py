"""
Salary Prediction Service

Uses historical offer data to predict salary ranges based on:
- Company
- Position/Job title
- Location
- Experience level
- Visa status
"""
from decimal import Decimal
from typing import Dict, Optional, List, Tuple
import statistics
from django.db.models import Avg, StdDev, Count, Min, Max
from companies.models import Company
from offers.models import Offer


class SalaryPredictor:
    """Predict salary ranges based on historical data"""
    
    MIN_SAMPLE_SIZE = 5
    CONFIDENCE_THRESHOLD = 10  # minimum samples for high confidence
    
    def __init__(self):
        pass
    
    def predict(
        self,
        position_title: str,
        location: str,
        experience_level: str,
        company: Optional[Company] = None,
        visa_status: Optional[str] = None,
        years_of_experience: Optional[int] = None
    ) -> Dict:
        """
        Predict salary for a given profile.
        Returns prediction with confidence metrics.
        """
        # Build query based on available filters
        queryset = Offer.objects.all()
        
        # Filter by position (use contains for flexibility)
        if position_title:
            queryset = queryset.filter(position_title__icontains=position_title)
        
        # Filter by location
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by experience level
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        
        # Filter by company
        if company:
            queryset = queryset.filter(company=company)
        
        # Filter by visa status (field is visa_type in model)
        if visa_status:
            queryset = queryset.filter(visa_type=visa_status)
        
        # Filter by years of experience (±1 year)
        if years_of_experience is not None:
            queryset = queryset.filter(
                years_of_experience__gte=years_of_experience - 1,
                years_of_experience__lte=years_of_experience + 1
            )
        
        # Get statistics
        stats = queryset.aggregate(
            avg_salary=Avg('base_salary'),
            std_dev=StdDev('base_salary'),
            count=Count('id'),
            min_salary=Min('base_salary'),
            max_salary=Max('base_salary'),
            avg_total=Avg('total_compensation')
        )
        
        count = stats['count'] or 0
        
        if count < self.MIN_SAMPLE_SIZE:
            return self._fallback_prediction(
                position_title, experience_level, count
            )
        
        avg_salary = float(stats['avg_salary'] or 0)
        std_dev = float(stats['std_dev'] or 0)
        
        # Calculate confidence based on sample size
        if count >= self.CONFIDENCE_THRESHOLD:
            confidence = 0.85
        elif count >= self.MIN_SAMPLE_SIZE * 2:
            confidence = 0.75
        else:
            confidence = 0.65
        
        # Calculate range (±1 std dev for 68% confidence)
        if std_dev > 0:
            low = max(avg_salary - std_dev, stats['min_salary'] or avg_salary * 0.7)
            high = min(avg_salary + std_dev, stats['max_salary'] or avg_salary * 1.3)
        else:
            low = avg_salary * 0.85
            high = avg_salary * 1.15
        
        # Calculate percentile (simplified)
        percentile = self._calculate_percentile(
            avg_salary, position_title, experience_level
        )
        
        return {
            'predicted_base_salary': int(avg_salary),
            'salary_range_low': int(low),
            'salary_range_high': int(high),
            'confidence_score': round(confidence, 2),
            'similar_offers_count': count,
            'market_percentile': percentile,
            'average_total_comp': int(stats['avg_total'] or avg_salary * 1.15),
            'filters_used': {
                'position_title': position_title,
                'location': location,
                'experience_level': experience_level,
                'company': company.name if company else None,
                'visa_status': visa_status,
            }
        }
    
    def _fallback_prediction(
        self,
        position_title: str,
        experience_level: str,
        count: int
    ) -> Dict:
        """Provide fallback prediction when not enough data"""
        # Use broader search - just experience level
        queryset = Offer.objects.filter(experience_level=experience_level)
        
        stats = queryset.aggregate(
            avg_salary=Avg('base_salary'),
            count=Count('id')
        )
        
        if stats['count'] and stats['count'] >= self.MIN_SAMPLE_SIZE:
            avg_salary = float(stats['avg_salary'] or 0)
            return {
                'predicted_base_salary': int(avg_salary),
                'salary_range_low': int(avg_salary * 0.75),
                'salary_range_high': int(avg_salary * 1.25),
                'confidence_score': 0.55,
                'similar_offers_count': count,
                'market_percentile': 50,
                'average_total_comp': int(avg_salary * 1.15),
                'note': 'Based on broader market data (insufficient exact matches)',
                'fallback': True
            }
        
        # Last resort: industry averages
        return self._get_industry_average(experience_level)
    
    def _get_industry_average(self, experience_level: str) -> Dict:
        """Return industry average as last resort"""
        # Simplified averages based on experience level
        averages = {
            'entry': 85000,
            'mid': 130000,
            'senior': 180000,
            'staff': 250000,
        }
        
        base = averages.get(experience_level, 120000)
        
        return {
            'predicted_base_salary': base,
            'salary_range_low': int(base * 0.7),
            'salary_range_high': int(base * 1.3),
            'confidence_score': 0.40,
            'similar_offers_count': 0,
            'market_percentile': 50,
            'average_total_comp': int(base * 1.15),
            'note': 'Based on industry averages (no matching data)',
            'fallback': True
        }
    
    def _calculate_percentile(
        self,
        salary: float,
        position_title: str,
        experience_level: str
    ) -> int:
        """Calculate rough market percentile"""
        # This is a simplified calculation
        # Real implementation would use market benchmark data
        
        # Get all salaries for this experience level
        all_salaries = Offer.objects.filter(
            experience_level=experience_level
        ).values_list('base_salary', flat=True)
        
        if not all_salaries:
            return 50
        
        # Count how many are below this salary
        below = sum(1 for s in all_salaries if s < salary)
        total = len(all_salaries)
        
        percentile = int((below / total) * 100) if total > 0 else 50
        return min(percentile, 99)
    
    def get_market_summary(self, experience_level: Optional[str] = None) -> Dict:
        """Get market-wide salary summary"""
        queryset = Offer.objects.all()
        
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        
        stats = queryset.aggregate(
            avg=Avg('base_salary'),
            median=Avg('base_salary'),  # Django doesn't have median
            count=Count('id'),
            min=Min('base_salary'),
            max=Max('base_salary')
        )
        
        # Calculate actual median
        salaries = list(queryset.values_list('base_salary', flat=True).order_by('base_salary'))
        median = statistics.median(salaries) if salaries else 0
        
        return {
            'average': int(stats['avg'] or 0),
            'median': int(median),
            'min': stats['min'],
            'max': stats['max'],
            'count': stats['count'],
        }


def predict_salary(
    position_title: str,
    location: str,
    experience_level: str,
    company_id: Optional[int] = None,
    visa_status: Optional[str] = None,
    years_of_experience: Optional[int] = None
) -> Dict:
    """
    Convenience function for salary prediction.
    """
    predictor = SalaryPredictor()
    
    company = None
    if company_id:
        try:
            company = Company.objects.get(id=company_id)
        except Company.DoesNotExist:
            pass
    
    return predictor.predict(
        position_title=position_title,
        location=location,
        experience_level=experience_level,
        company=company,
        visa_status=visa_status,
        years_of_experience=years_of_experience
    )
