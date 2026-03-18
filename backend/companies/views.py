from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Max, Min, Q
from django.db.models.functions import Lower
from .models import Company, CompanyReview
from .serializers import CompanySerializer, CompanyListSerializer, CompanyReviewSerializer
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

        if self.action == 'retrieve':
            queryset = queryset.annotate(
                offer_count=Count('offers', distinct=True),
                verified_offer_count=Count('offers', filter=Q(offers__is_verified=True), distinct=True),
                community_offer_count=Count('offers', filter=Q(offers__submitted_by__isnull=False), distinct=True),
                imported_offer_count=Count('offers', filter=Q(offers__submitted_by__isnull=True), distinct=True),
                review_count=Count('reviews', distinct=True),
                h1b_record_count=Count('h1b_applications', distinct=True),
                latest_offer_at=Max('offers__submitted_at'),
                latest_h1b_decision_date=Max('h1b_applications__decision_date'),
            )
        elif self.action == 'list' or 'offer_count' in ordering or 'review_count' in ordering:
            queryset = queryset.annotate(
                offer_count=Count('offers', distinct=True),
                review_count=Count('reviews', distinct=True),
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
    def insights(self, request):
        """Return aggregate coverage and trust metadata for the directory."""
        company_stats = Company.objects.aggregate(
            total_companies=Count('id'),
            sponsor_companies=Count('id', filter=Q(total_h1b_filings__gt=0)),
        )
        offer_stats = Offer.objects.aggregate(
            total_offers=Count('id'),
            verified_offers=Count('id', filter=Q(is_verified=True)),
            community_offers=Count('id', filter=Q(submitted_by__isnull=False)),
            companies_with_salary_data=Count('company', distinct=True),
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
