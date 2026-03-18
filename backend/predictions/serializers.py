from rest_framework import serializers
from .models import SalaryPrediction, LotteryRiskAssessment, SponsorshipLikelihood


class SalaryPredictionInputSerializer(serializers.Serializer):
    company_id = serializers.IntegerField(required=False, allow_null=True)
    company_name = serializers.CharField(required=False, allow_blank=True)
    position_title = serializers.CharField(required=True)
    location = serializers.CharField(required=True)
    experience_level = serializers.CharField(required=True)
    years_of_experience = serializers.IntegerField(required=True, min_value=0)
    visa_status = serializers.CharField(required=False, allow_blank=True)


class SalaryPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryPrediction
        fields = ['id', 'predicted_base_salary', 'salary_range_low', 'salary_range_high',
                  'confidence_score', 'similar_offers_count', 'market_percentile', 'created_at']


class LotteryRiskInputSerializer(serializers.Serializer):
    visa_type = serializers.ChoiceField(choices=['h1b', 'h1b_masters', 'h1b_renewal', 'h1b_transfer'])
    country_of_birth = serializers.CharField(required=True)
    has_masters_degree = serializers.BooleanField(default=False)
    us_masters_degree = serializers.BooleanField(default=False)
    fiscal_year = serializers.IntegerField(required=True)


class LotteryRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = LotteryRiskAssessment
        fields = ['id', 'selection_probability', 'risk_level', 'regular_cap_probability',
                  'masters_cap_probability', 'green_card_wait_years', 'priority_date_current',
                  'historical_avg_selection_rate', 'year_over_year_trend', 'recommendations']


class SponsorshipLikelihoodSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = SponsorshipLikelihood
        fields = ['company', 'company_name', 'likelihood_score', 'likelihood_percentage',
                  'historical_filing_volume_score', 'approval_rate_score', 'consistency_score',
                  'recent_trend_score', 'similar_job_approvals', 'similar_job_denials']
