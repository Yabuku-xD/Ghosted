from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg, Count, Q
from django.db.models.functions import Lower
from ghosted.pagination import CachedCountPaginator
from .models import Offer
from .serializers import OfferSerializer, OfferCreateSerializer, OfferSummarySerializer


def is_truthy(value):
    return str(value).lower() in {"1", "true", "yes", "on"}


class OfferViewSet(viewsets.ModelViewSet):
    class OfferPagination(PageNumberPagination):
        page_size = 10
        page_size_query_param = "page_size"
        max_page_size = 10
        django_paginator_class = CachedCountPaginator

    queryset = Offer.objects.filter(is_verified=True)
    pagination_class = OfferPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        "company",
        "experience_level",
        "visa_type",
        "employment_type",
        "is_remote",
    ]
    ordering_fields = [
        "base_salary",
        "total_compensation",
        "submitted_at",
        "company__name",
        "position_title",
        "location",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return OfferCreateSerializer
        elif self.action == "list":
            return OfferSummarySerializer
        return OfferSerializer

    def get_queryset(self):
        queryset = Offer.objects.select_related("company").annotate(
            company_name_lower=Lower("company__name"),
            position_title_lower=Lower("position_title"),
        )

        if self.action in {"list", "statistics"}:
            queryset = queryset.only(
                "id",
                "company_id",
                "position_title",
                "location",
                "base_salary",
                "total_compensation",
                "experience_level",
                "visa_type",
                "submitted_at",
                "submitted_by_id",
                "is_verified",
                "company__name",
                "company__slug",
                "company__logo_url",
                "company__company_domain",
            )

        if not self.request.query_params.get("include_unverified"):
            queryset = queryset.filter(is_verified=True)

        params = self.request.query_params
        search_term = params.get("search", "").strip()
        location = params.get("location", "").strip()
        min_salary = params.get("min_salary")
        source = params.get("source", "").strip().lower()

        if search_term:
            queryset = queryset.filter(
                Q(position_title__icontains=search_term)
                | Q(company__name__icontains=search_term)
                | Q(location__icontains=search_term)
            )

        if location:
            queryset = queryset.filter(location__icontains=location)

        if min_salary:
            try:
                min_salary_int = int(min_salary)
                if min_salary_int > 0:
                    queryset = queryset.filter(base_salary__gte=min_salary_int)
            except (ValueError, TypeError):
                pass

        if source == "community":
            queryset = queryset.filter(submitted_by__isnull=False)
        elif source == "government":
            queryset = queryset.filter(submitted_by__isnull=True)

        return queryset.order_by("company_name_lower", "position_title_lower", "id")

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(submitted_by=self.request.user, is_verified=False)
            return
        serializer.save(is_verified=False)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Return aggregate salary statistics"""
        queryset = self.filter_queryset(self.get_queryset())

        stats = queryset.aggregate(
            avg_base=Avg("base_salary"),
            avg_total=Avg("total_compensation"),
            total_offers=Count("id"),
            company_count=Count("company", distinct=True),
        )

        # Add breakdown by experience level
        by_experience = queryset.values("experience_level").annotate(
            avg_salary=Avg("base_salary"), count=Count("id")
        )
        by_source = [
            {
                "data_source": "government_derived",
                "count": queryset.filter(submitted_by__isnull=True).count(),
            },
            {
                "data_source": "community_submission",
                "count": queryset.filter(submitted_by__isnull=False).count(),
            },
        ]

        return Response(
            {
                "overall": stats,
                "by_experience": list(by_experience),
                "by_source": by_source,
            }
        )
