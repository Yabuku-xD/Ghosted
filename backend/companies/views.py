from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Max, Min, Q
from django.db.models.functions import Lower
from .models import Company, CompanyBenefit, CompanyReview, JobPosting
from .serializers import (
    CompanyBenefitSerializer,
    CompanyListSerializer,
    CompanyReviewSerializer,
    CompanySerializer,
    JobPostingSerializer,
)
from .services.scoring import get_company_score_breakdown, CompanyScorer
from offers.models import Offer
from h1b_data.models import H1BApplication


def is_truthy(value):
    return str(value).lower() in {'1', 'true', 'yes', 'on'}


class CompanyViewSet(viewsets.ModelViewSet):
    class CompanyPagination(PageNumberPagination):
        page_size = 15
        page_size_query_param = 'page_size'
        max_page_size = 15

    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = 'slug'
    pagination_class = CompanyPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['industry', 'company_size', 'visa_fair_score']
    ordering_fields = [
        'visa_fair_score',
        'h1b_approval_rate',
        'name',
        'total_h1b_filings',
        'offer_count',
        'review_count',
        'active_job_count',
        'last_filing_year',
    ]

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        return CompanySerializer

    def get_queryset(self):
        queryset = Company.objects.annotate(
            name_lower=Lower('name'),
        )

        params = self.request.query_params
        search_term = params.get('search', '').strip()
        min_score = params.get('min_score')
        ordering = params.get('ordering', 'name').strip()

        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term)
                | Q(description__icontains=search_term)
                | Q(industry__icontains=search_term)
                | Q(headquarters__icontains=search_term)
            )

        if min_score:
            queryset = queryset.filter(visa_fair_score__gte=min_score)

        if is_truthy(params.get('sponsors_only')):
            queryset = queryset.filter(total_h1b_filings__gt=0)

        if is_truthy(params.get('has_offers')):
            queryset = queryset.filter(offers__isnull=False).distinct()

        if is_truthy(params.get('has_jobs')):
            queryset = queryset.filter(job_postings__is_active=True).distinct()

        if self.action == 'list' or 'offer_count' in ordering or 'review_count' in ordering or 'active_job_count' in ordering:
            queryset = queryset.annotate(
                offer_count=Count('offers', distinct=True),
                review_count=Count('reviews', distinct=True),
                active_job_count=Count('job_postings', filter=Q(job_postings__is_active=True), distinct=True),
                benefit_count=Count('benefits', distinct=True),
            )

        ordering_map = {
            'name': ('name_lower', 'id'),
            '-name': ('-name_lower', '-id'),
            'visa_fair_score': ('visa_fair_score', 'name_lower', 'id'),
            '-visa_fair_score': ('-visa_fair_score', 'name_lower', 'id'),
            'h1b_approval_rate': ('h1b_approval_rate', 'name_lower', 'id'),
            '-h1b_approval_rate': ('-h1b_approval_rate', 'name_lower', 'id'),
            'total_h1b_filings': ('total_h1b_filings', 'name_lower', 'id'),
            '-total_h1b_filings': ('-total_h1b_filings', 'name_lower', 'id'),
            'offer_count': ('offer_count', 'name_lower', 'id'),
            '-offer_count': ('-offer_count', 'name_lower', 'id'),
            'review_count': ('review_count', 'name_lower', 'id'),
            '-review_count': ('-review_count', 'name_lower', 'id'),
            'active_job_count': ('active_job_count', 'name_lower', 'id'),
            '-active_job_count': ('-active_job_count', 'name_lower', 'id'),
            'last_filing_year': ('last_filing_year', 'name_lower', 'id'),
            '-last_filing_year': ('-last_filing_year', 'name_lower', 'id'),
        }

        return queryset.order_by(*ordering_map.get(ordering, ('name_lower', 'id')))

    @action(detail=True, methods=['post'])
    def review(self, request, slug=None):
        company = self.get_object()
        serializer = CompanyReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        company = self.get_object()
        reviews = company.reviews.all()
        serializer = CompanyReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def jobs(self, request, slug=None):
        company = self.get_object()
        jobs = company.job_postings.filter(is_active=True).order_by('-posted_at', 'title')
        serializer = JobPostingSerializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def benefits(self, request, slug=None):
        company = self.get_object()
        benefits = company.benefits.all()
        serializer = CompanyBenefitSerializer(benefits, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def similar(self, request, slug=None):
        company = self.get_object()
        queryset = Company.objects.exclude(pk=company.pk)

        if company.industry:
            queryset = queryset.filter(industry=company.industry)

        queryset = queryset.annotate(
            active_job_count=Count('job_postings', filter=Q(job_postings__is_active=True), distinct=True),
            benefit_count=Count('benefits', distinct=True),
            offer_count=Count('offers', distinct=True),
            review_count=Count('reviews', distinct=True),
        ).order_by('-visa_fair_score', '-active_job_count', 'name')[:6]

        serializer = CompanyListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def score_breakdown(self, request, slug=None):
        """Get detailed visa-fair score breakdown"""
        company = self.get_object()
        breakdown = get_company_score_breakdown(company.id)
        
        if breakdown:
            return Response(breakdown)
        return Response(
            {'error': 'Could not calculate score breakdown'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @action(detail=True, methods=['post'])
    def recalculate_score(self, request, slug=None):
        """Recalculate company's visa-fair score"""
        company = self.get_object()
        scorer = CompanyScorer()
        scorer.update_company_score(company, save=True)
        
        serializer = self.get_serializer(company)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_sponsors(self, request):
        """Get top visa-friendly companies"""
        top_companies = Company.objects.filter(
            total_h1b_filings__gt=0
        ).order_by('-total_h1b_filings', '-h1b_approval_rate', 'name')[:10]

        serializer = CompanyListSerializer(top_companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_hiring(self, request):
        companies = Company.objects.annotate(
            active_job_count=Count('job_postings', filter=Q(job_postings__is_active=True), distinct=True),
            offer_count=Count('offers', distinct=True),
            review_count=Count('reviews', distinct=True),
            benefit_count=Count('benefits', distinct=True),
        ).filter(active_job_count__gt=0).order_by('-active_job_count', '-total_h1b_filings', 'name')[:10]
        serializer = CompanyListSerializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def compare(self, request):
        left_slug = request.query_params.get('left')
        right_slug = request.query_params.get('right')

        if not left_slug or not right_slug:
            return Response(
                {'error': 'Both "left" and "right" company slugs are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        companies = list(
            Company.objects.filter(slug__in=[left_slug, right_slug]).annotate(
                offer_count=Count('offers', distinct=True),
                review_count=Count('reviews', distinct=True),
                active_job_count=Count('job_postings', filter=Q(job_postings__is_active=True), distinct=True),
                benefit_count=Count('benefits', distinct=True),
            )
        )
        company_map = {company.slug: company for company in companies}
        left = company_map.get(left_slug)
        right = company_map.get(right_slug)

        if not left or not right:
            return Response(
                {'error': 'One or both companies could not be found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        comparisons = [
            ('visa_fair_score', 'Visa Fair Score'),
            ('h1b_approval_rate', 'Approval Rate'),
            ('total_h1b_filings', 'H-1B Filings'),
            ('offer_count', 'Salary Records'),
            ('active_job_count', 'Active Jobs'),
            ('benefit_count', 'Benefits'),
        ]
        winner_summary = []

        for field, label in comparisons:
            left_value = getattr(left, field, 0) or 0
            right_value = getattr(right, field, 0) or 0
            left_numeric = float(left_value)
            right_numeric = float(right_value)

            if left_numeric == right_numeric:
                winner = 'tie'
            elif left_numeric > right_numeric:
                winner = left.slug
            else:
                winner = right.slug

            winner_summary.append({
                'field': field,
                'label': label,
                'left_value': left_numeric,
                'right_value': right_numeric,
                'winner': winner,
            })

        return Response({
            'left': CompanySerializer(left).data,
            'right': CompanySerializer(right).data,
            'comparison': winner_summary,
        })

    @action(detail=False, methods=['get'])
    def insights(self, request):
        """Return aggregate coverage and trust metadata for the directory."""
        company_stats = Company.objects.aggregate(
            total_companies=Count('id', distinct=True),
            sponsor_companies=Count('id', filter=Q(total_h1b_filings__gt=0), distinct=True),
            companies_with_domains=Count('id', filter=Q(company_domain__gt=''), distinct=True),
            companies_with_websites=Count('id', filter=Q(website__gt=''), distinct=True),
            companies_with_logos=Count('id', filter=Q(company_domain__gt='') | Q(logo_url__gt=''), distinct=True),
            companies_with_jobs=Count('id', filter=Q(job_postings__is_active=True), distinct=True),
            companies_with_benefits=Count('id', filter=Q(benefits__isnull=False), distinct=True),
        )
        offer_stats = Offer.objects.aggregate(
            total_offers=Count('id'),
            verified_offers=Count('id', filter=Q(is_verified=True)),
            community_offers=Count('id', filter=Q(submitted_by__isnull=False)),
            companies_with_salary_data=Count('company', distinct=True),
        )
        job_stats = JobPosting.objects.aggregate(
            total_jobs=Count('id', filter=Q(is_active=True)),
            latest_job_posting_at=Max('posted_at'),
        )
        benefit_stats = CompanyBenefit.objects.aggregate(
            total_benefits=Count('id'),
            verified_benefits=Count('id', filter=Q(is_verified=True)),
        )
        h1b_stats = H1BApplication.objects.aggregate(
            total_h1b_records=Count('id'),
            earliest_fiscal_year=Min('fiscal_year'),
            latest_fiscal_year=Max('fiscal_year'),
            latest_case_decision_date=Max('decision_date'),
            latest_imported_at=Max('created_at'),
        )

        review_count = CompanyReview.objects.count()
        first_year = h1b_stats['earliest_fiscal_year']
        last_year = h1b_stats['latest_fiscal_year']

        return Response({
            **company_stats,
            **offer_stats,
            **job_stats,
            **benefit_stats,
            'total_reviews': review_count,
            'total_h1b_records': h1b_stats['total_h1b_records'],
            'coverage_years': {
                'first': first_year,
                'last': last_year,
                'span': ((last_year - first_year) + 1) if first_year and last_year else 0,
            },
            'latest_case_decision_date': h1b_stats['latest_case_decision_date'],
            'latest_imported_at': h1b_stats['latest_imported_at'],
        })


class CompanyReviewViewSet(viewsets.ModelViewSet):
    queryset = CompanyReview.objects.all()
    serializer_class = CompanyReviewSerializer
