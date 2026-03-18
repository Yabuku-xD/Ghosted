from rest_framework import serializers
from .models import H1BApplication, LotteryYear, CountryCapStatus


class H1BApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = H1BApplication
        fields = ['id', 'case_number', 'case_status', 'received_date', 'decision_date',
                  'employer_name', 'employer_city', 'employer_state', 'job_title',
                  'soc_code', 'soc_title', 'wage_rate_of_pay_from', 'wage_rate_of_pay_to',
                  'wage_unit_of_pay', 'prevailing_wage', 'visa_class', 'full_time_position',
                  'fiscal_year']


class LotteryYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = LotteryYear
        fields = ['id', 'fiscal_year', 'total_registrations', 'selected_registrations',
                  'regular_cap_registrations', 'regular_cap_selected', 'masters_cap_registrations',
                  'masters_cap_selected', 'overall_selection_rate', 'regular_cap_selection_rate',
                  'masters_cap_selection_rate', 'country_stats']


class CountryCapStatusSerializer(serializers.ModelSerializer):
    approval_rate = serializers.DecimalField(source='approval_rate', max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = CountryCapStatus
        fields = ['id', 'country', 'fiscal_year', 'total_applications', 'approved',
                  'denied', 'pending', 'approval_rate', 'priority_date_current',
                  'priority_date_notes']
