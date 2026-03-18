from django.contrib import admin
from .models import Company, CompanyReview


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'visa_fair_score', 'h1b_approval_rate', 'total_h1b_filings', 'industry', 'company_size']
    list_filter = ['industry', 'company_size', 'visa_fair_score']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['total_h1b_filings', 'total_h1b_approvals', 'total_h1b_denials']


@admin.register(CompanyReview)
class CompanyReviewAdmin(admin.ModelAdmin):
    list_display = ['company', 'overall_rating', 'sponsorship_experience_rating', 'is_verified', 'created_at']
    list_filter = ['overall_rating', 'is_verified', 'created_at']
    search_fields = ['company__name', 'review_text']
