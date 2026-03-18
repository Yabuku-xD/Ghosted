from django.contrib import admin
from .models import Company, CompanyBenefit, CompanyReview, JobPosting


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'company_domain',
        'visa_fair_score',
        'h1b_approval_rate',
        'total_h1b_filings',
        'industry',
        'company_size',
    ]
    list_filter = ['industry', 'company_size', 'visa_fair_score', 'logo_confidence', 'domain_confidence']
    search_fields = ['name', 'description', 'company_domain', 'website']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['total_h1b_filings', 'total_h1b_approvals', 'total_h1b_denials', 'logo_last_checked_at']


@admin.register(CompanyReview)
class CompanyReviewAdmin(admin.ModelAdmin):
    list_display = ['company', 'overall_rating', 'sponsorship_experience_rating', 'is_verified', 'created_at']
    list_filter = ['overall_rating', 'is_verified', 'created_at']
    search_fields = ['company__name', 'review_text']


@admin.register(CompanyBenefit)
class CompanyBenefitAdmin(admin.ModelAdmin):
    list_display = ['company', 'title', 'category', 'source', 'confidence', 'is_verified']
    list_filter = ['category', 'source', 'confidence', 'is_verified']
    search_fields = ['company__name', 'title', 'description']


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['company', 'title', 'source', 'location', 'remote_policy', 'is_active', 'posted_at']
    list_filter = ['source', 'remote_policy', 'is_active', 'visa_sponsorship_signal']
    search_fields = ['company__name', 'title', 'location', 'team']
