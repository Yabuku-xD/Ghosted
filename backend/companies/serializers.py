from rest_framework import serializers
from .models import Company, CompanyBenefit, CompanyReview, JobPosting


class CompanySerializer(serializers.ModelSerializer):
    industry_display = serializers.CharField(source='get_industry_display', read_only=True)
    company_size_display = serializers.CharField(source='get_company_size_display', read_only=True)
    offer_count = serializers.SerializerMethodField()
    verified_offer_count = serializers.SerializerMethodField()
    community_offer_count = serializers.SerializerMethodField()
    imported_offer_count = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    h1b_record_count = serializers.SerializerMethodField()
    data_coverage_years = serializers.SerializerMethodField()
    data_confidence = serializers.SerializerMethodField()
    data_sources = serializers.SerializerMethodField()
    latest_offer_at = serializers.SerializerMethodField()
    latest_h1b_decision_date = serializers.SerializerMethodField()
    active_job_count = serializers.SerializerMethodField()
    benefit_count = serializers.SerializerMethodField()
    actionable_insights = serializers.SerializerMethodField()

    def _get_count(self, obj, attribute, fallback_queryset):
        annotated_value = getattr(obj, attribute, None)
        if annotated_value is not None:
            return annotated_value
        return fallback_queryset.count()

    def get_offer_count(self, obj):
        return self._get_count(obj, 'offer_count', obj.offers.all())

    def get_verified_offer_count(self, obj):
        return self._get_count(obj, 'verified_offer_count', obj.offers.filter(is_verified=True))

    def get_community_offer_count(self, obj):
        return self._get_count(obj, 'community_offer_count', obj.offers.filter(submitted_by__isnull=False))

    def get_imported_offer_count(self, obj):
        return self._get_count(obj, 'imported_offer_count', obj.offers.filter(submitted_by__isnull=True))

    def get_review_count(self, obj):
        return self._get_count(obj, 'review_count', obj.reviews.all())

    def get_h1b_record_count(self, obj):
        return self._get_count(obj, 'h1b_record_count', obj.h1b_applications.all())

    def get_active_job_count(self, obj):
        return self._get_count(obj, 'active_job_count', obj.job_postings.filter(is_active=True))

    def get_benefit_count(self, obj):
        return self._get_count(obj, 'benefit_count', obj.benefits.all())

    def get_data_coverage_years(self, obj):
        if obj.first_filing_year and obj.last_filing_year:
            return (obj.last_filing_year - obj.first_filing_year) + 1
        return 0

    def get_data_confidence(self, obj):
        filings = obj.total_h1b_filings or self.get_h1b_record_count(obj)
        coverage_years = self.get_data_coverage_years(obj)
        verified_offers = self.get_verified_offer_count(obj)
        community_signals = self.get_community_offer_count(obj) + self.get_review_count(obj)

        confidence_score = 0

        if filings >= 500:
            confidence_score += 2
        elif filings >= 100:
            confidence_score += 1

        if coverage_years >= 3:
            confidence_score += 2
        elif coverage_years >= 1:
            confidence_score += 1

        if verified_offers >= 20:
            confidence_score += 2
        elif verified_offers >= 5:
            confidence_score += 1

        if community_signals >= 10:
            confidence_score += 1

        if confidence_score >= 5:
            return 'high'
        if confidence_score >= 3:
            return 'good'
        if confidence_score >= 1:
            return 'emerging'
        return 'limited'

    def get_data_sources(self, obj):
        sources = []

        if (obj.total_h1b_filings or self.get_h1b_record_count(obj)) > 0:
            sources.append('Department of Labor filings')
        if self.get_imported_offer_count(obj) > 0:
            sources.append('Government-derived salary records')
        if self.get_community_offer_count(obj) > 0:
            sources.append('Community salary submissions')
        if self.get_review_count(obj) > 0:
            sources.append('Community reviews')
        if self.get_active_job_count(obj) > 0:
            sources.append('Live job board data')
        if self.get_benefit_count(obj) > 0:
            sources.append('Benefits coverage')

        return sources

    def get_latest_offer_at(self, obj):
        annotated_value = getattr(obj, 'latest_offer_at', None)
        if annotated_value is not None:
            return annotated_value
        latest_offer = obj.offers.order_by('-submitted_at').values_list('submitted_at', flat=True).first()
        return latest_offer

    def get_latest_h1b_decision_date(self, obj):
        annotated_value = getattr(obj, 'latest_h1b_decision_date', None)
        if annotated_value is not None:
            return annotated_value
        latest_decision = obj.h1b_applications.order_by('-decision_date').values_list('decision_date', flat=True).first()
        return latest_decision

    def get_actionable_insights(self, obj):
        insights = []
        filings = obj.total_h1b_filings or self.get_h1b_record_count(obj)
        approval_rate = float(obj.h1b_approval_rate or 0)
        active_jobs = self.get_active_job_count(obj)
        salary_records = self.get_offer_count(obj)

        if filings >= 500:
            insights.append(
                f"High-volume sponsor with {filings:,} historical filings and {approval_rate:.1f}% approvals."
            )
        elif filings >= 50:
            insights.append(
                f"Established sponsor with {filings:,} filings across {self.get_data_coverage_years(obj)} fiscal years."
            )
        else:
            insights.append('Sponsorship footprint is still limited, so treat employer trends as directional.')

        if active_jobs > 0:
            insights.append(
                f"{active_jobs} live job posting{'s' if active_jobs != 1 else ''} tracked right now."
            )

        if salary_records >= 10:
            insights.append(
                f"Salary coverage is reasonably strong with {salary_records:,} offer records."
            )
        elif salary_records > 0:
            insights.append(
                f"Salary data exists, but the sample is still small at {salary_records:,} record{'s' if salary_records != 1 else ''}."
            )
        else:
            insights.append('No salary records yet, so compensation guidance is still thin.')

        return insights[:3]

    class Meta:
        model = Company
        fields = ['id', 'name', 'slug', 'description', 'website', 'company_domain',
                  'domain_source', 'domain_confidence', 'logo_url', 'logo_provider',
                  'logo_confidence', 'logo_last_checked_at', 'linkedin_url', 'careers_url',
                  'headquarters', 'company_size', 'company_size_display', 'industry',
                  'industry_display', 'visa_fair_score',
                  'h1b_approval_rate', 'avg_salary_percentile', 'sponsorship_consistency_score',
                  'year_founded', 'employee_count_estimate',
                  'total_h1b_filings', 'total_h1b_approvals', 'first_filing_year',
                  'last_filing_year', 'offer_count', 'verified_offer_count',
                  'community_offer_count', 'imported_offer_count', 'review_count',
                  'h1b_record_count', 'active_job_count', 'benefit_count',
                  'data_coverage_years', 'data_confidence',
                  'data_sources', 'latest_offer_at', 'latest_h1b_decision_date',
                  'actionable_insights', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class CompanyListSerializer(CompanySerializer):
    def get_data_confidence(self, obj):
        filings = obj.total_h1b_filings or 0
        coverage_years = self.get_data_coverage_years(obj)
        offer_count = self.get_offer_count(obj)
        review_count = self.get_review_count(obj)

        confidence_score = 0

        if filings >= 500:
            confidence_score += 2
        elif filings >= 100:
            confidence_score += 1

        if coverage_years >= 3:
            confidence_score += 2
        elif coverage_years >= 1:
            confidence_score += 1

        if offer_count >= 20:
            confidence_score += 2
        elif offer_count >= 5:
            confidence_score += 1

        if review_count >= 3:
            confidence_score += 1

        if confidence_score >= 5:
            return 'high'
        if confidence_score >= 3:
            return 'good'
        if confidence_score >= 1:
            return 'emerging'
        return 'limited'

    def get_data_sources(self, obj):
        sources = []
        if (obj.total_h1b_filings or 0) > 0:
            sources.append('Department of Labor filings')
        if self.get_offer_count(obj) > 0:
            sources.append('Salary records')
        if self.get_review_count(obj) > 0:
            sources.append('Community reviews')
        if self.get_active_job_count(obj) > 0:
            sources.append('Live jobs')
        return sources

    class Meta:
        model = Company
        fields = ['id', 'name', 'slug', 'logo_url', 'logo_provider', 'logo_confidence',
                  'website', 'company_domain', 'careers_url',
                  'visa_fair_score', 'h1b_approval_rate',
                  'industry', 'industry_display', 'headquarters', 'company_size',
                  'company_size_display', 'total_h1b_filings', 'first_filing_year',
                  'last_filing_year', 'offer_count', 'review_count',
                  'active_job_count', 'benefit_count',
                  'data_coverage_years', 'data_confidence',
                  'data_sources']


class JobPostingSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_slug = serializers.CharField(source='company.slug', read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'id',
            'company',
            'company_name',
            'company_slug',
            'title',
            'team',
            'location',
            'remote_policy',
            'employment_type',
            'url',
            'source',
            'source_board',
            'salary_min',
            'salary_max',
            'currency',
            'posted_at',
            'visa_sponsorship_signal',
            'is_active',
        ]


class CompanyBenefitSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)

    class Meta:
        model = CompanyBenefit
        fields = [
            'id',
            'company',
            'title',
            'description',
            'category',
            'category_display',
            'value',
            'source',
            'source_display',
            'source_url',
            'confidence',
            'is_verified',
            'created_at',
        ]


class CompanyReviewSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = CompanyReview
        fields = ['id', 'company', 'company_name', 'sponsorship_experience_rating',
                  'salary_fairness_rating', 'overall_rating', 'review_text',
                  'visa_type', 'years_at_company', 'is_anonymous', 'is_verified',
                  'created_at']
        read_only_fields = ['id', 'is_verified', 'created_at']
