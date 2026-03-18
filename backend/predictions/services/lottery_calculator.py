"""
H-1B Lottery Risk Calculator

Calculates lottery selection probability based on:
- Country of birth (per-country caps)
- Education level (Masters Cap eligibility)
- Historical lottery data
- Current year projections
"""
from typing import Dict, Optional
from django.db.models import Avg
from h1b_data.models import LotteryYear, CountryCapStatus


class LotteryRiskCalculator:
    """Calculate H-1B lottery risk"""
    
    # Country cap categories
    BACKLOGGED_COUNTRIES = ['india', 'china']
    
    # Historical selection rates by category
    MASTERS_CAP_ADVANTAGE = 1.5  # Masters cap typically has ~1.5x better odds
    
    def __init__(self, fiscal_year: Optional[int] = None):
        self.fiscal_year = fiscal_year or self._get_current_fy()
        self.historical_data = self._load_historical_data()
    
    def _get_current_fy(self) -> int:
        """Get current fiscal year (Oct 1 - Sept 30)"""
        from datetime import datetime
        now = datetime.now()
        if now.month >= 10:
            return now.year + 1
        return now.year
    
    def _load_historical_data(self) -> Dict:
        """Load historical lottery statistics"""
        # Get last 5 years of data
        years = LotteryYear.objects.filter(
            fiscal_year__gte=self.fiscal_year - 5,
            fiscal_year__lt=self.fiscal_year
        ).order_by('-fiscal_year')
        
        if not years.exists():
            # Use default values if no data
            return {
                'avg_selection_rate': 25.0,
                'regular_cap_rate': 20.0,
                'masters_cap_rate': 35.0,
                'trend': 'stable'
            }
        
        avg_rate = years.aggregate(Avg('overall_selection_rate'))['overall_selection_rate__avg']
        avg_regular = years.aggregate(Avg('regular_cap_selection_rate'))['regular_cap_selection_rate__avg']
        avg_masters = years.aggregate(Avg('masters_cap_selection_rate'))['masters_cap_selection_rate__avg']
        
        # Calculate trend
        recent = years.first()
        oldest = years.last()
        if recent and oldest:
            recent_rate = float(recent.overall_selection_rate)
            oldest_rate = float(oldest.overall_selection_rate)
            if recent_rate > oldest_rate * 1.1:
                trend = 'increasing'
            elif recent_rate < oldest_rate * 0.9:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        return {
            'avg_selection_rate': float(avg_rate or 25.0),
            'regular_cap_rate': float(avg_regular or 20.0),
            'masters_cap_rate': float(avg_masters or 35.0),
            'trend': trend
        }
    
    def calculate_risk(
        self,
        country_of_birth: str,
        has_masters_degree: bool,
        us_masters_degree: bool,
        visa_type: str = 'h1b'
    ) -> Dict:
        """
        Calculate lottery risk for a profile.
        """
        # Base selection rate
        base_rate = self.historical_data['avg_selection_rate']
        
        # Determine cap type probabilities
        if us_masters_degree:
            # Eligible for both caps - use weighted average
            regular_prob = self.historical_data['regular_cap_rate']
            masters_prob = self.historical_data['masters_cap_rate']
            
            # Masters cap has higher odds, so try there first
            # If not selected in masters, go to regular
            combined_prob = masters_prob + (regular_prob * (100 - masters_prob) / 100)
            
            cap_probabilities = {
                'regular_cap': regular_prob,
                'masters_cap': masters_prob,
            }
        elif has_masters_degree:
            # Has masters but not from US - regular cap only
            combined_prob = self.historical_data['regular_cap_rate']
            cap_probabilities = {
                'regular_cap': combined_prob,
                'masters_cap': None,
            }
        else:
            # Bachelor's only - regular cap
            combined_prob = self.historical_data['regular_cap_rate']
            cap_probabilities = {
                'regular_cap': combined_prob,
                'masters_cap': None,
            }
        
        # Adjust for renewal/transfers (higher approval rates)
        if visa_type in ['h1b_renewal', 'h1b_transfer']:
            combined_prob = min(combined_prob * 1.2, 95.0)
            if cap_probabilities['regular_cap']:
                cap_probabilities['regular_cap'] = min(cap_probabilities['regular_cap'] * 1.2, 95.0)
            if cap_probabilities['masters_cap']:
                cap_probabilities['masters_cap'] = min(cap_probabilities['masters_cap'] * 1.2, 95.0)
        
        # Determine risk level
        if combined_prob >= 35:
            risk_level = 'low'
        elif combined_prob >= 20:
            risk_level = 'medium'
        else:
            risk_level = 'high'
        
        # Calculate green card timeline
        gc_timeline = self._calculate_green_card_timeline(country_of_birth)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            country_of_birth,
            has_masters_degree,
            us_masters_degree,
            combined_prob,
            risk_level
        )
        
        return {
            'fiscal_year': self.fiscal_year,
            'selection_probability': round(combined_prob, 1),
            'risk_level': risk_level,
            'cap_probabilities': cap_probabilities,
            'green_card_timeline': gc_timeline,
            'historical_context': self.historical_data,
            'recommendations': recommendations
        }
    
    def _calculate_green_card_timeline(self, country: str) -> Dict:
        """Calculate green card wait time based on country"""
        if country in self.BACKLOGGED_COUNTRIES:
            # India and China have significant backlogs
            if country == 'india':
                wait_years = 8.5
                priority_date_current = False
                notes = "EB-2 and EB-3 categories have significant backlogs for India."
            else:  # China
                wait_years = 4.5
                priority_date_current = False
                notes = "EB-2 has moderate backlog; EB-3 has longer wait for China."
        else:
            # Rest of world is current
            wait_years = 0.0
            priority_date_current = True
            notes = "Priority dates are current for most countries (Rest of World)."
        
        return {
            'estimated_wait_years': wait_years,
            'priority_date_current': priority_date_current,
            'notes': notes
        }
    
    def _generate_recommendations(
        self,
        country: str,
        has_masters: bool,
        us_masters: bool,
        probability: float,
        risk_level: str
    ) -> list:
        """Generate personalized recommendations"""
        recommendations = []
        
        # Masters cap recommendation
        if has_masters and not us_masters:
            recommendations.append(
                "Consider pursuing a US Master's degree for Masters Cap eligibility (better odds)"
            )
        elif us_masters:
            recommendations.append(
                "Your US Master's degree makes you eligible for the Masters Cap (higher selection rate)"
            )
        
        # Risk-based recommendations
        if risk_level == 'high':
            recommendations.extend([
                "Have backup plans ready: Day 1 CPT, other visa categories (O-1, L-1)",
                "Consider employers with strong immigration support and backup options",
                "Look into cap-exempt employers (universities, non-profits, research institutes)"
            ])
        elif risk_level == 'medium':
            recommendations.extend([
                "Prepare contingency plans in case of non-selection",
                "Research alternative visa pathways as backup"
            ])
        
        # Country-specific recommendations
        if country == 'india':
            recommendations.extend([
                "Long green card wait time - consider EB-1 if you have extraordinary ability",
                "Explore options like National Interest Waiver (NIW) if qualified"
            ])
        elif country == 'china':
            recommendations.extend([
                "EB-1 remains current for China - fastest path if eligible",
                "Consider EB-2 NIW to bypass PERM process"
            ])
        
        # General recommendations
        recommendations.extend([
            "Register as early as possible when the window opens",
            "Ensure all documentation is accurate and complete",
            "Work with experienced immigration attorney"
        ])
        
        return recommendations


def calculate_lottery_risk(
    country_of_birth: str,
    has_masters_degree: bool,
    us_masters_degree: bool,
    visa_type: str = 'h1b',
    fiscal_year: Optional[int] = None
) -> Dict:
    """
    Convenience function for lottery risk calculation.
    """
    calculator = LotteryRiskCalculator(fiscal_year)
    return calculator.calculate_risk(
        country_of_birth=country_of_birth,
        has_masters_degree=has_masters_degree,
        us_masters_degree=us_masters_degree,
        visa_type=visa_type
    )
