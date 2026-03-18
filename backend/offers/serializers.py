from rest_framework import serializers
from .models import Offer


class OfferSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_slug = serializers.CharField(source='company.slug', read_only=True)
    company_logo_url = serializers.CharField(source='company.logo_url', read_only=True)
    company_domain = serializers.CharField(source='company.company_domain', read_only=True)
    visa_type_display = serializers.CharField(source='get_visa_type_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    data_source = serializers.SerializerMethodField()

    def get_data_source(self, obj):
        if obj.submitted_by_id:
            return 'community_submission'
        return 'government_derived'

    class Meta:
        model = Offer
        fields = ['id', 'company', 'company_name', 'company_slug', 'company_logo_url', 'company_domain',
                  'position_title', 'location',
                  'is_remote', 'base_salary', 'signing_bonus', 'annual_bonus_pct',
                  'stock_grant', 'stock_grant_years', 'other_compensation',
                  'total_compensation', 'visa_type', 'visa_type_display', 'visa_stage',
                  'experience_level', 'experience_level_display',
                  'years_of_experience', 'employment_type', 'initial_offer',
                  'negotiated_increase', 'negotiation_notes', 'is_anonymous',
                  'is_verified', 'submitted_at', 'data_source']
        read_only_fields = ['id', 'total_compensation', 'is_verified', 'submitted_at']


class OfferCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['company', 'position_title', 'location', 'is_remote', 'base_salary',
                  'signing_bonus', 'annual_bonus_pct', 'stock_grant', 'stock_grant_years',
                  'other_compensation', 'visa_type', 'visa_stage', 'experience_level',
                  'years_of_experience', 'employment_type', 'initial_offer',
                  'negotiated_increase', 'negotiation_notes', 'is_anonymous']


class OfferSummarySerializer(OfferSerializer):
    class Meta:
        model = Offer
        fields = ['id', 'company', 'company_name', 'company_slug', 'company_logo_url', 'company_domain',
                  'position_title', 'location', 'base_salary', 'total_compensation',
                  'experience_level', 'experience_level_display', 'visa_type',
                  'visa_type_display', 'submitted_at', 'data_source']
