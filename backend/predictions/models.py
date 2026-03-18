from django.db import models


class SalaryPrediction(models.Model):
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Input parameters
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    company_name_input = models.CharField(max_length=200, blank=True)
    position_title = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    experience_level = models.CharField(max_length=20)
    years_of_experience = models.PositiveIntegerField()
    visa_status = models.CharField(max_length=20, blank=True)
    
    # Prediction results
    predicted_base_salary = models.PositiveIntegerField()
    salary_range_low = models.PositiveIntegerField()
    salary_range_high = models.PositiveIntegerField()
    confidence_score = models.DecimalField(max_digits=4, decimal_places=2)
    
    # Model metadata
    model_version = models.CharField(max_length=20, default='v1.0')
    training_data_size = models.PositiveIntegerField()
    
    # Context
    similar_offers_count = models.PositiveIntegerField()
    market_percentile = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Prediction: {self.position_title} - ${self.predicted_base_salary:,}"


class LotteryRiskAssessment(models.Model):
    VISA_TYPE_CHOICES = [
        ('h1b', 'H-1B'),
        ('h1b_masters', 'H-1B Masters Cap'),
        ('h1b_renewal', 'H-1B Renewal'),
        ('h1b_transfer', 'H-1B Transfer'),
    ]
    
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Input
    visa_type = models.CharField(max_length=20, choices=VISA_TYPE_CHOICES)
    country_of_birth = models.CharField(max_length=50)
    has_masters_degree = models.BooleanField(default=False)
    us_masters_degree = models.BooleanField(default=False)
    fiscal_year = models.PositiveIntegerField()
    
    # Results
    selection_probability = models.DecimalField(max_digits=5, decimal_places=2)
    risk_level = models.CharField(max_length=20)  # low, medium, high
    
    # Breakdown
    regular_cap_probability = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    masters_cap_probability = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Green card backlog info
    green_card_wait_years = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    priority_date_current = models.BooleanField(default=False)
    
    # Historical context
    historical_avg_selection_rate = models.DecimalField(max_digits=5, decimal_places=2)
    year_over_year_trend = models.CharField(max_length=10)  # increasing, decreasing, stable
    
    # Recommendations
    recommendations = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Lottery Risk FY{self.fiscal_year} - {self.selection_probability}%"


class SponsorshipLikelihood(models.Model):
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='sponsorship_likelihoods'
    )
    
    # Calculation context
    job_title = models.CharField(max_length=200, blank=True)
    experience_level = models.CharField(max_length=20, blank=True)
    
    # Results
    likelihood_score = models.DecimalField(max_digits=3, decimal_places=1)  # 0-10
    likelihood_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # 0-100%
    
    # Breakdown factors
    historical_filing_volume_score = models.DecimalField(max_digits=3, decimal_places=1)
    approval_rate_score = models.DecimalField(max_digits=3, decimal_places=1)
    consistency_score = models.DecimalField(max_digits=3, decimal_places=1)
    recent_trend_score = models.DecimalField(max_digits=3, decimal_places=1)
    
    # Supporting data
    similar_job_approvals = models.PositiveIntegerField(default=0)
    similar_job_denials = models.PositiveIntegerField(default=0)
    
    # Timeframe
    based_on_years = models.PositiveIntegerField(default=5)
    calculation_date = models.DateField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-likelihood_score']
    
    def __str__(self):
        return f"{self.company.name} - {self.likelihood_percentage}% likelihood"
