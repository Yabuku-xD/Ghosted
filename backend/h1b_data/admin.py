from django.contrib import admin
from .models import H1BApplication, LotteryYear, CountryCapStatus


@admin.register(H1BApplication)
class H1BApplicationAdmin(admin.ModelAdmin):
    list_display = ['case_number', 'employer_name', 'job_title', 'case_status', 'fiscal_year']
    list_filter = ['case_status', 'fiscal_year', 'visa_class']
    search_fields = ['case_number', 'employer_name', 'job_title']
    date_hierarchy = 'decision_date'


@admin.register(LotteryYear)
class LotteryYearAdmin(admin.ModelAdmin):
    list_display = ['fiscal_year', 'total_registrations', 'selected_registrations', 'overall_selection_rate']
    readonly_fields = ['overall_selection_rate']


@admin.register(CountryCapStatus)
class CountryCapStatusAdmin(admin.ModelAdmin):
    list_display = ['country', 'fiscal_year', 'total_applications', 'approved', 'approval_rate']
    list_filter = ['country', 'fiscal_year']
