from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, JobApplication


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'visa_status', 'nationality', 'years_of_experience', 'is_staff']
    list_filter = ['visa_status', 'nationality', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Visa Information', {
            'fields': ('visa_status', 'nationality', 'years_of_experience', 'current_location', 'target_location')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Visa Information', {
            'fields': ('visa_status', 'nationality')
        }),
    )


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'position_title', 'status', 'applied_date']
    list_filter = ['status', 'applied_date']
    search_fields = ['position_title', 'company__name', 'user__username']
    date_hierarchy = 'applied_date'
