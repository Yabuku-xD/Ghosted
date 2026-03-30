from datetime import timedelta, timezone

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import (
    Case,
    Count,
    IntegerField,
    Max,
    Min,
    OuterRef,
    Q,
    Subquery,
    Value,
    When,
)
from django.db.models.functions import Coalesce, Lower
from ghosted.pagination import CachedCountPaginator
from .models import Company, CompanyBenefit, CompanyReview, JobPosting
from .serializers import (
    CompanyBenefitSerializer,
    CompanyListSerializer,
    CompanyReviewSerializer,
    CompanySerializer,
    JobPostingSerializer,
    ResumeMatchUploadSerializer,
)
from .services.resume_matching import (
    clear_resume_match_session,
    create_resume_match_session,
    get_resume_match_session,
    process_resume_match_session,
    resume_download_response,
)
from .tasks import process_resume_match_session_task
from .services.scoring import get_company_score_breakdown, CompanyScorer
from offers.models import Offer
from h1b_data.models import H1BApplication


def is_truthy(value):
    return str(value).lower() in {"1", "true", "yes", "on"}


class CompanyViewSet(viewsets.ModelViewSet):
    class CompanyPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = "page_size"
        max_page_size = 10
        django_paginator_class = CachedCountPaginator

    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = "slug"
    pagination_class = CompanyPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["industry", "company_size", "visa_fair_score"]
    ordering_fields = [
        "visa_fair_score",
        "h1b_approval_rate",
        "name",
        "total_h1b_filings",
        "offer_count",
        "review_count",
        "active_job_count",
        "last_filing_year",
    ]

    def get_serializer_class(self):
        if self.action == "list":
            return CompanyListSerializer
        return CompanySerializer

    def get_queryset(self):
        queryset = Company.objects.annotate(
            name_lower=Lower("name"),
        )

        params = self.request.query_params
        search_term = params.get("search", "").strip()
        min_score = params.get("min_score")
        ordering = params.get("ordering", "name").strip()

        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term)
                | Q(description__icontains=search_term)
                | Q(industry__icontains=search_term)
                | Q(headquarters__icontains=search_term)
            )

        if min_score:
            try:
                min_score_float = float(min_score)
                if 0 <= min_score_float <= 100:
                    queryset = queryset.filter(visa_fair_score__gte=min_score_float)
            except (ValueError, TypeError):
                pass

        if is_truthy(params.get("sponsors_only")):
            queryset = queryset.filter(total_h1b_filings__gt=0)

        if is_truthy(params.get("has_offers")):
            queryset = queryset.filter(offers__isnull=False).distinct()

        if is_truthy(params.get("has_jobs")):
            queryset = queryset.filter(job_postings__is_active=True).distinct()

        if (
            self.action == "list"
            or "offer_count" in ordering
            or "review_count" in ordering
            or "active_job_count" in ordering
        ):
            offer_count_subquery = (
                Offer.objects.filter(company_id=OuterRef("pk"))
                .values("company_id")
                .annotate(total=Count("id"))
                .values("total")[:1]
            )
            review_count_subquery = (
                CompanyReview.objects.filter(company_id=OuterRef("pk"))
                .values("company_id")
                .annotate(total=Count("id"))
                .values("total")[:1]
            )
            active_job_count_subquery = (
                JobPosting.objects.filter(company_id=OuterRef("pk"), is_active=True)
                .values("company_id")
                .annotate(total=Count("id"))
                .values("total")[:1]
            )
            benefit_count_subquery = (
                CompanyBenefit.objects.filter(company_id=OuterRef("pk"))
                .values("company_id")
                .annotate(total=Count("id"))
                .values("total")[:1]
            )

            queryset = queryset.annotate(
                offer_count=Coalesce(
                    Subquery(offer_count_subquery, output_field=IntegerField()),
                    Value(0),
                ),
                review_count=Coalesce(
                    Subquery(review_count_subquery, output_field=IntegerField()),
                    Value(0),
                ),
                active_job_count=Coalesce(
                    Subquery(active_job_count_subquery, output_field=IntegerField()),
                    Value(0),
                ),
                benefit_count=Coalesce(
                    Subquery(benefit_count_subquery, output_field=IntegerField()),
                    Value(0),
                ),
            ).only(
                "id",
                "name",
                "slug",
                "logo_url",
                "logo_provider",
                "logo_confidence",
                "website",
                "company_domain",
                "careers_url",
                "jobs_provider",
                "visa_fair_score",
                "h1b_approval_rate",
                "industry",
                "headquarters",
                "company_size",
                "total_h1b_filings",
                "first_filing_year",
                "last_filing_year",
            )

        ordering_map = {
            "name": ("name_lower", "id"),
            "-name": ("-name_lower", "-id"),
            "visa_fair_score": ("visa_fair_score", "name_lower", "id"),
            "-visa_fair_score": ("-visa_fair_score", "name_lower", "id"),
            "h1b_approval_rate": ("h1b_approval_rate", "name_lower", "id"),
            "-h1b_approval_rate": ("-h1b_approval_rate", "name_lower", "id"),
            "total_h1b_filings": ("total_h1b_filings", "name_lower", "id"),
            "-total_h1b_filings": ("-total_h1b_filings", "name_lower", "id"),
            "offer_count": ("offer_count", "name_lower", "id"),
            "-offer_count": ("-offer_count", "name_lower", "id"),
            "review_count": ("review_count", "name_lower", "id"),
            "-review_count": ("-review_count", "name_lower", "id"),
            "active_job_count": ("active_job_count", "name_lower", "id"),
            "-active_job_count": ("-active_job_count", "name_lower", "id"),
            "last_filing_year": ("last_filing_year", "name_lower", "id"),
            "-last_filing_year": ("-last_filing_year", "name_lower", "id"),
        }

        return queryset.order_by(*ordering_map.get(ordering, ("name_lower", "id")))

    @action(detail=True, methods=["post"])
    def review(self, request, slug=None):
        company = self.get_object()
        serializer = CompanyReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(company=company, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def reviews(self, request, slug=None):
        company = self.get_object()
        reviews = company.reviews.all()
        serializer = CompanyReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def jobs(self, request, slug=None):
        company = self.get_object()
        jobs = company.job_postings.filter(is_active=True).order_by(
            "-posted_at", "title"
        )
        serializer = JobPostingSerializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def benefits(self, request, slug=None):
        company = self.get_object()
        benefits = company.benefits.all()
        serializer = CompanyBenefitSerializer(benefits, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def similar(self, request, slug=None):
        company = self.get_object()
        queryset = Company.objects.exclude(pk=company.pk)

        if company.industry:
            queryset = queryset.filter(industry=company.industry)

        queryset = queryset.annotate(
            active_job_count=Count(
                "job_postings", filter=Q(job_postings__is_active=True), distinct=True
            ),
            benefit_count=Count("benefits", distinct=True),
            offer_count=Count("offers", distinct=True),
            review_count=Count("reviews", distinct=True),
        ).order_by("-visa_fair_score", "-active_job_count", "name")[:6]

        serializer = CompanyListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def score_breakdown(self, request, slug=None):
        """Get detailed visa-fair score breakdown"""
        company = self.get_object()
        breakdown = get_company_score_breakdown(company.id)

        if breakdown:
            return Response(breakdown)
        return Response(
            {"error": "Could not calculate score breakdown"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    @action(detail=True, methods=["post"])
    def recalculate_score(self, request, slug=None):
        """Recalculate company's visa-fair score"""
        company = self.get_object()
        scorer = CompanyScorer()
        scorer.update_company_score(company, save=True)

        serializer = self.get_serializer(company)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def top_sponsors(self, request):
        """Get top visa-friendly companies"""
        top_companies = Company.objects.filter(total_h1b_filings__gt=0).order_by(
            "-total_h1b_filings", "-h1b_approval_rate", "name"
        )[:10]

        serializer = CompanyListSerializer(top_companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def top_hiring(self, request):
        companies = (
            Company.objects.annotate(
                active_job_count=Count(
                    "job_postings",
                    filter=Q(job_postings__is_active=True),
                    distinct=True,
                ),
                offer_count=Count("offers", distinct=True),
                review_count=Count("reviews", distinct=True),
                benefit_count=Count("benefits", distinct=True),
            )
            .filter(active_job_count__gt=0)
            .order_by("-active_job_count", "-total_h1b_filings", "name")[:10]
        )
        serializer = CompanyListSerializer(companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def compare(self, request):
        left_slug = request.query_params.get("left")
        right_slug = request.query_params.get("right")

        if not left_slug or not right_slug:
            return Response(
                {"error": 'Both "left" and "right" company slugs are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        companies = list(
            Company.objects.filter(slug__in=[left_slug, right_slug]).annotate(
                offer_count=Count("offers", distinct=True),
                review_count=Count("reviews", distinct=True),
                active_job_count=Count(
                    "job_postings",
                    filter=Q(job_postings__is_active=True),
                    distinct=True,
                ),
                benefit_count=Count("benefits", distinct=True),
            )
        )
        company_map = {company.slug: company for company in companies}
        left = company_map.get(left_slug)
        right = company_map.get(right_slug)

        if not left or not right:
            return Response(
                {"error": "One or both companies could not be found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        comparisons = [
            ("visa_fair_score", "Visa Fair Score"),
            ("h1b_approval_rate", "Approval Rate"),
            ("total_h1b_filings", "H-1B Filings"),
            ("offer_count", "Salary Records"),
            ("active_job_count", "Active Jobs"),
            ("benefit_count", "Benefits"),
        ]
        winner_summary = []

        for field, label in comparisons:
            left_value = getattr(left, field, 0) or 0
            right_value = getattr(right, field, 0) or 0
            left_numeric = float(left_value)
            right_numeric = float(right_value)

            if left_numeric == right_numeric:
                winner = "tie"
            elif left_numeric > right_numeric:
                winner = left.slug
            else:
                winner = right.slug

            winner_summary.append(
                {
                    "field": field,
                    "label": label,
                    "left_value": left_numeric,
                    "right_value": right_numeric,
                    "winner": winner,
                }
            )

        return Response(
            {
                "left": CompanySerializer(left).data,
                "right": CompanySerializer(right).data,
                "comparison": winner_summary,
            }
        )

    @action(detail=False, methods=["get"])
    def insights(self, request):
        """Return aggregate coverage and trust metadata for the directory."""
        company_stats = Company.objects.aggregate(
            total_companies=Count("id", distinct=True),
            sponsor_companies=Count(
                "id", filter=Q(total_h1b_filings__gt=0), distinct=True
            ),
            companies_with_domains=Count(
                "id", filter=Q(company_domain__gt=""), distinct=True
            ),
            companies_with_websites=Count(
                "id", filter=Q(website__gt=""), distinct=True
            ),
            companies_with_logos=Count(
                "id",
                filter=Q(company_domain__gt="") | Q(logo_url__gt=""),
                distinct=True,
            ),
            companies_with_jobs=Count(
                "id", filter=Q(job_postings__is_active=True), distinct=True
            ),
            companies_with_benefits=Count(
                "id", filter=Q(benefits__isnull=False), distinct=True
            ),
        )
        offer_stats = Offer.objects.aggregate(
            total_offers=Count("id"),
            verified_offers=Count("id", filter=Q(is_verified=True)),
            community_offers=Count("id", filter=Q(submitted_by__isnull=False)),
            companies_with_salary_data=Count("company", distinct=True),
        )
        job_stats = JobPosting.objects.aggregate(
            total_jobs=Count("id", filter=Q(is_active=True)),
            latest_job_posting_at=Max("posted_at"),
        )
        benefit_stats = CompanyBenefit.objects.aggregate(
            total_benefits=Count("id"),
            verified_benefits=Count("id", filter=Q(is_verified=True)),
        )
        h1b_stats = H1BApplication.objects.aggregate(
            total_h1b_records=Count("id"),
            earliest_fiscal_year=Min("fiscal_year"),
            latest_fiscal_year=Max("fiscal_year"),
            latest_case_decision_date=Max("decision_date"),
            latest_imported_at=Max("created_at"),
        )

        review_count = CompanyReview.objects.count()
        first_year = h1b_stats["earliest_fiscal_year"]
        last_year = h1b_stats["latest_fiscal_year"]

        return Response(
            {
                **company_stats,
                **offer_stats,
                **job_stats,
                **benefit_stats,
                "total_reviews": review_count,
                "total_h1b_records": h1b_stats["total_h1b_records"],
                "coverage_years": {
                    "first": first_year,
                    "last": last_year,
                    "span": ((last_year - first_year) + 1)
                    if first_year and last_year
                    else 0,
                },
                "latest_case_decision_date": h1b_stats["latest_case_decision_date"],
                "latest_imported_at": h1b_stats["latest_imported_at"],
            }
        )


class CompanyReviewViewSet(viewsets.ModelViewSet):
    queryset = CompanyReview.objects.all()
    serializer_class = CompanyReviewSerializer


class JobPostingViewSet(viewsets.ReadOnlyModelViewSet):
    class JobPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = "page_size"
        max_page_size = 10
        django_paginator_class = CachedCountPaginator

    serializer_class = JobPostingSerializer
    pagination_class = JobPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["source", "remote_policy", "visa_sponsorship_signal", "company"]

    def get_queryset(self):
        offer_count_subquery = (
            Offer.objects.filter(company_id=OuterRef("company_id"), is_verified=True)
            .values("company_id")
            .annotate(total=Count("id"))
            .values("total")[:1]
        )

        queryset = (
            JobPosting.objects.filter(is_active=True)
            .select_related("company")
            .only(
                "id",
                "company_id",
                "title",
                "team",
                "location",
                "remote_policy",
                "employment_type",
                "url",
                "source",
                "source_board",
                "salary_min",
                "salary_max",
                "currency",
                "posted_at",
                "last_seen_at",
                "visa_sponsorship_signal",
                "is_active",
                "company__name",
                "company__slug",
                "company__logo_url",
                "company__company_domain",
                "company__visa_fair_score",
                "company__h1b_approval_rate",
                "company__total_h1b_filings",
            )
            .annotate(
                company_name_lower=Lower("company__name"),
                company_offer_count=Coalesce(
                    Subquery(offer_count_subquery, output_field=IntegerField()),
                    Value(0),
                ),
            )
        )

        params = self.request.query_params
        search_term = params.get("search", "").strip()
        location = params.get("location", "").strip()
        company_slug = params.get("company_slug", "").strip()
        ordering = params.get("ordering", "-job_score").strip()
        posted_within_days = params.get("posted_within_days")
        now = timezone.now()

        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term)
                | Q(team__icontains=search_term)
                | Q(company__name__icontains=search_term)
                | Q(description__icontains=search_term)
            )

        if location:
            queryset = queryset.filter(location__icontains=location)

        if company_slug:
            queryset = queryset.filter(company__slug=company_slug)

        if is_truthy(params.get("has_salary")):
            queryset = queryset.filter(
                Q(salary_min__isnull=False) | Q(salary_max__isnull=False)
            )

        if posted_within_days and posted_within_days.isdigit():
            queryset = queryset.filter(
                posted_at__gte=now - timedelta(days=int(posted_within_days))
            )

        if params.get("source"):
            queryset = queryset.filter(source=params["source"])

        if params.get("remote_policy"):
            queryset = queryset.filter(remote_policy=params["remote_policy"])

        if params.get("visa_sponsorship_signal"):
            queryset = queryset.filter(
                visa_sponsorship_signal=params["visa_sponsorship_signal"]
            )

        search_score = Value(0, output_field=IntegerField())
        if search_term:
            search_score = Case(
                When(title__icontains=search_term, then=Value(40)),
                When(company__name__icontains=search_term, then=Value(28)),
                When(team__icontains=search_term, then=Value(18)),
                When(description__icontains=search_term, then=Value(12)),
                default=Value(0),
                output_field=IntegerField(),
            )

        location_score = Value(0, output_field=IntegerField())
        if location:
            location_score = Case(
                When(location__icontains=location, then=Value(16)),
                default=Value(0),
                output_field=IntegerField(),
            )

        freshness_score = Case(
            When(posted_at__gte=now - timedelta(days=7), then=Value(14)),
            When(posted_at__gte=now - timedelta(days=30), then=Value(8)),
            When(posted_at__isnull=False, then=Value(4)),
            default=Value(1),
            output_field=IntegerField(),
        )
        sponsorship_score = Case(
            When(company__total_h1b_filings__gte=500, then=Value(24)),
            When(company__total_h1b_filings__gte=100, then=Value(18)),
            When(company__total_h1b_filings__gte=25, then=Value(12)),
            When(company__visa_fair_score__gte=80, then=Value(10)),
            When(company__visa_fair_score__gte=60, then=Value(7)),
            default=Value(2),
            output_field=IntegerField(),
        )
        salary_score = Case(
            When(
                Q(salary_min__isnull=False) | Q(salary_max__isnull=False),
                then=Value(10),
            ),
            When(company_offer_count__gte=20, then=Value(7)),
            When(company_offer_count__gte=5, then=Value(4)),
            default=Value(0),
            output_field=IntegerField(),
        )
        remote_score = Case(
            When(remote_policy="remote", then=Value(6)),
            When(remote_policy="hybrid", then=Value(3)),
            default=Value(0),
            output_field=IntegerField(),
        )

        queryset = queryset.annotate(
            job_score=search_score
            + location_score
            + freshness_score
            + sponsorship_score
            + salary_score
            + remote_score
        )

        ordering_map = {
            "-job_score": ("-job_score", "-posted_at", "company_name_lower", "title"),
            "job_score": ("job_score", "-posted_at", "company_name_lower", "title"),
            "-posted_at": ("-posted_at", "-job_score", "company_name_lower", "title"),
            "posted_at": ("posted_at", "-job_score", "company_name_lower", "title"),
            "company": ("company_name_lower", "title"),
            "-company": ("-company_name_lower", "title"),
            "title": ("title", "company_name_lower"),
            "-title": ("-title", "company_name_lower"),
        }

        return queryset.order_by(
            *ordering_map.get(ordering, ordering_map["-job_score"])
        )

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        queryset = self.get_queryset()
        stats = queryset.aggregate(
            total_jobs=Count("id", distinct=True),
            company_count=Count("company", distinct=True),
            remote_jobs=Count("id", filter=Q(remote_policy="remote"), distinct=True),
            salary_visible_jobs=Count(
                "id",
                filter=Q(salary_min__isnull=False) | Q(salary_max__isnull=False),
                distinct=True,
            ),
            latest_job_posting_at=Max("posted_at"),
        )
        by_source = list(
            queryset.values("source")
            .annotate(count=Count("id", distinct=True))
            .order_by("-count", "source")
        )
        return Response(
            {
                **stats,
                "by_source": by_source,
            }
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="resume-match",
        permission_classes=[AllowAny],
        parser_classes=[MultiPartParser, FormParser],
    )
    def resume_match(self, request):
        serializer = ResumeMatchUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        filters = {
            key: validated.get(key)
            for key in (
                "search",
                "location",
                "company_slug",
                "source",
                "remote_policy",
                "visa_sponsorship_signal",
                "posted_within_days",
                "has_salary",
            )
        }
        try:
            session = create_resume_match_session(validated["resume"], filters=filters)
        except ValueError as exc:
            return Response({"resume": [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)
        session_id = session["session_id"]

        try:
            process_resume_match_session_task.delay(session_id)
        except Exception:
            process_resume_match_session(session_id)

        current = get_resume_match_session(session_id) or session
        return Response(current, status=status.HTTP_202_ACCEPTED)

    @action(
        detail=False,
        methods=["get", "delete"],
        url_path=r"resume-match/(?P<session_id>[^/.]+)",
        permission_classes=[AllowAny],
    )
    def resume_match_session(self, request, session_id=None):
        if request.method.lower() == "delete":
            clear_resume_match_session(session_id)
            return Response(status=status.HTTP_204_NO_CONTENT)

        session = get_resume_match_session(session_id)
        if not session:
            return Response(
                {"detail": "Resume match session not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(session)

    @action(
        detail=False,
        methods=["get"],
        url_path=r"resume-match/(?P<session_id>[^/.]+)/download",
        permission_classes=[AllowAny],
    )
    def resume_match_download(self, request, session_id=None):
        return resume_download_response(session_id)
