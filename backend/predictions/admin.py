from django.contrib import admin
from .models import SalaryPrediction, LotteryRiskAssessment, SponsorshipLikelihood


@admin.register(SalaryPrediction)
class SalaryPredictionAdmin(admin.ModelAdmin):
    list_display = ['position_title', 'predicted_base_salary', 'confidence_score', 'created_at']
    list_filter = ['confidence_score', 'created_at']
    search_fields = ['position_title', 'company__name']


@admin.register(LotteryRiskAssessment)
class LotteryRiskAssessmentAdmin(admin.ModelAdmin):
    list_display = ['fiscal_year', 'visa_type', 'country_of_birth', 'selection_probability', 'risk_level']
    list_filter = ['fiscal_year', 'risk_level', 'has_masters_degree']


@admin.register(SponsorshipLikelihood)
class SponsorshipLikelihoodAdmin(admin.ModelAdmin):
    list_display = ['company', 'likelihood_score', 'likelihood_percentage', 'calculation_date']
    list_filter = ['likelihood_score', 'calculation_date']
    search_fields = ['company__name']
