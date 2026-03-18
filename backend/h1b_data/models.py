from django.db import models


class H1BApplication(models.Model):
    CASE_STATUS_CHOICES = [
        ('certified', 'Certified'),
        ('certified_withdrawn', 'Certified-Withdrawn'),
        ('denied', 'Denied'),
        ('withdrawn', 'Withdrawn'),
    ]
    
    VISA_CLASS_CHOICES = [
        ('H-1B', 'H-1B'),
        ('H-1B1', 'H-1B1 (Chile/Singapore)'),
        ('E-3', 'E-3 (Australia)'),
    ]
    
    # Case information
    case_number = models.CharField(max_length=50, unique=True)
    case_status = models.CharField(max_length=30, choices=CASE_STATUS_CHOICES)
    received_date = models.DateField()
    decision_date = models.DateField()
    
    # Employer information
    employer = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='h1b_applications',
        null=True,
        blank=True
    )
    employer_name = models.CharField(max_length=200)
    employer_city = models.CharField(max_length=100)
    employer_state = models.CharField(max_length=10)
    
    # Job information
    job_title = models.CharField(max_length=200)
    soc_code = models.CharField(max_length=20, blank=True)
    soc_title = models.CharField(max_length=200, blank=True)
    
    # Wage information
    wage_rate_of_pay_from = models.DecimalField(max_digits=12, decimal_places=2)
    wage_rate_of_pay_to = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    wage_unit_of_pay = models.CharField(max_length=10)
    prevailing_wage = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Visa information
    visa_class = models.CharField(max_length=20, choices=VISA_CLASS_CHOICES, default='H-1B')
    full_time_position = models.BooleanField(default=True)
    
    # Metadata
    fiscal_year = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fiscal_year', '-decision_date']
        indexes = [
            models.Index(fields=['fiscal_year']),
            models.Index(fields=['employer_name']),
            models.Index(fields=['case_status']),
        ]
    
    def __str__(self):
        return f"{self.case_number} - {self.job_title} at {self.employer_name}"


class LotteryYear(models.Model):
    fiscal_year = models.PositiveIntegerField(unique=True)
    
    # Registration statistics
    total_registrations = models.PositiveIntegerField()
    selected_registrations = models.PositiveIntegerField()
    
    # Breakdown by type
    regular_cap_registrations = models.PositiveIntegerField(null=True, blank=True)
    regular_cap_selected = models.PositiveIntegerField(null=True, blank=True)
    masters_cap_registrations = models.PositiveIntegerField(null=True, blank=True)
    masters_cap_selected = models.PositiveIntegerField(null=True, blank=True)
    
    # Selection rates
    overall_selection_rate = models.DecimalField(max_digits=5, decimal_places=2)
    regular_cap_selection_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    masters_cap_selection_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Country-specific data (JSON for flexibility)
    country_stats = models.JSONField(default=dict, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    data_source = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-fiscal_year']
    
    def __str__(self):
        return f"FY{self.fiscal_year} H-1B Lottery"
    
    def calculate_selection_rate(self):
        if self.total_registrations > 0:
            return (self.selected_registrations / self.total_registrations) * 100
        return 0


class CountryCapStatus(models.Model):
    COUNTRY_CHOICES = [
        ('india', 'India'),
        ('china', 'China'),
        ('mexico', 'Mexico'),
        ('philippines', 'Philippines'),
        ('canada', 'Canada'),
        ('other', 'Other'),
    ]
    
    country = models.CharField(max_length=20, choices=COUNTRY_CHOICES)
    fiscal_year = models.PositiveIntegerField()
    
    # Statistics
    total_applications = models.PositiveIntegerField()
    approved = models.PositiveIntegerField()
    denied = models.PositiveIntegerField()
    pending = models.PositiveIntegerField(default=0)
    
    # Employment-based green card backlog info
    priority_date_current = models.BooleanField(default=False)
    priority_date_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['country', 'fiscal_year']
        ordering = ['country', '-fiscal_year']
        verbose_name_plural = 'country cap statuses'
    
    def __str__(self):
        return f"{self.country} - FY{self.fiscal_year}"
    
    def approval_rate(self):
        total = self.approved + self.denied
        if total > 0:
            return (self.approved / total) * 100
        return 0
