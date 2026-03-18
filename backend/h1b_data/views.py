from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import H1BApplication, LotteryYear, CountryCapStatus
from .serializers import H1BApplicationSerializer, LotteryYearSerializer, CountryCapStatusSerializer


class H1BApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = H1BApplication.objects.all()
    serializer_class = H1BApplicationSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['employer_name', 'job_title', 'soc_title']
    filterset_fields = ['case_status', 'fiscal_year', 'visa_class', 'employer_state']
    ordering_fields = ['decision_date', 'wage_rate_of_pay_from', 'fiscal_year']


class LotteryYearViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LotteryYear.objects.all()
    serializer_class = LotteryYearSerializer
    lookup_field = 'fiscal_year'
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, fiscal_year=None):
        """Get detailed statistics for a lottery year"""
        lottery = self.get_object()
        
        # Calculate additional statistics
        from django.db.models import Count, Avg
        from h1b_data.models import H1BApplication
        
        year_stats = H1BApplication.objects.filter(fiscal_year=fiscal_year).aggregate(
            total_cases=Count('id'),
            avg_wage=Avg('wage_rate_of_pay_from')
        )
        
        top_employers = H1BApplication.objects.filter(
            fiscal_year=fiscal_year
        ).values('employer_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'lottery': LotteryYearSerializer(lottery).data,
            'statistics': year_stats,
            'top_employers': list(top_employers)
        })


class CountryCapStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CountryCapStatus.objects.all()
    serializer_class = CountryCapStatusSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['country', 'fiscal_year']
