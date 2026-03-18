from django.db import models


class Offer(models.Model):
    VISA_TYPE_CHOICES = [
        ('h1b', 'H-1B'),
        ('h1b_transfer', 'H-1B Transfer'),
        ('green_card', 'Green Card Sponsorship'),
        ('opt', 'OPT'),
        ('stem_opt', 'STEM OPT'),
        ('no_sponsorship', 'No Sponsorship'),
        ('tn', 'TN Visa'),
        ('e3', 'E-3 Visa'),
    ]
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', 'Entry Level (0-2 years)'),
        ('mid', 'Mid Level (3-5 years)'),
        ('senior', 'Senior (6-10 years)'),
        ('staff', 'Staff/Principal (10+ years)'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('contract', 'Contract'),
        ('intern', 'Internship'),
    ]
    
    # Core fields
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='offers')
    position_title = models.CharField(max_length=200)
    location = models.CharField(max_length=100)
    is_remote = models.BooleanField(default=False)
    
    # Compensation
    base_salary = models.PositiveIntegerField()
    signing_bonus = models.PositiveIntegerField(null=True, blank=True)
    annual_bonus_pct = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    stock_grant = models.PositiveIntegerField(null=True, blank=True)
    stock_grant_years = models.PositiveIntegerField(null=True, blank=True)
    other_compensation = models.TextField(blank=True)
    
    # Calculated total compensation
    total_compensation = models.PositiveIntegerField(null=True, blank=True)
    
    # Profile context
    visa_type = models.CharField(max_length=20, choices=VISA_TYPE_CHOICES, blank=True)
    visa_stage = models.CharField(max_length=100, blank=True)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES)
    years_of_experience = models.PositiveIntegerField()
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full_time')
    
    # Negotiation
    initial_offer = models.PositiveIntegerField(null=True, blank=True)
    negotiated_increase = models.PositiveIntegerField(null=True, blank=True)
    negotiation_notes = models.TextField(blank=True)
    
    # Submission
    submitted_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_anonymous = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.position_title} at {self.company.name} - ${self.base_salary:,}"
    
    def calculate_total_comp(self):
        total = self.base_salary
        if self.signing_bonus:
            total += self.signing_bonus
        if self.annual_bonus_pct:
            total += int(self.base_salary * (self.annual_bonus_pct / 100))
        if self.stock_grant and self.stock_grant_years:
            total += self.stock_grant // self.stock_grant_years
        return total
    
    def save(self, *args, **kwargs):
        self.total_compensation = self.calculate_total_comp()
        super().save(*args, **kwargs)
