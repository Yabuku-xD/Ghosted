from django.contrib import admin
from .models import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['position_title', 'company', 'base_salary', 'total_compensation', 'experience_level', 'visa_type', 'is_verified']
    list_filter = ['experience_level', 'visa_type', 'employment_type', 'is_verified', 'submitted_at']
    search_fields = ['position_title', 'company__name']
    date_hierarchy = 'submitted_at'
    readonly_fields = ['total_compensation']
