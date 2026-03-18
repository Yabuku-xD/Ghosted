from django.db import models


class Company(models.Model):
    COMPANY_SIZE_CHOICES = [
        ('startup', 'Startup (1-50)'),
        ('small', 'Small (51-200)'),
        ('mid', 'Mid-size (201-1000)'),
        ('large', 'Large (1000-5000)'),
        ('enterprise', 'Enterprise (5000+)'),
    ]

    INDUSTRY_CHOICES = [
        ('tech', 'Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('consulting', 'Consulting'),
        ('ecommerce', 'E-commerce'),
        ('ai', 'AI/ML'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    logo_url = models.URLField(blank=True, help_text="URL to company logo image")
    linkedin_url = models.URLField(blank=True)
    headquarters = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZE_CHOICES, blank=True)
    industry = models.CharField(max_length=20, choices=INDUSTRY_CHOICES, blank=True)
    
    # Visa-fair scoring fields
    visa_fair_score = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    h1b_approval_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    avg_salary_percentile = models.PositiveIntegerField(null=True, blank=True)
    sponsorship_consistency_score = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Metadata
    total_h1b_filings = models.PositiveIntegerField(default=0)
    total_h1b_approvals = models.PositiveIntegerField(default=0)
    total_h1b_denials = models.PositiveIntegerField(default=0)
    first_filing_year = models.PositiveIntegerField(null=True, blank=True)
    last_filing_year = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'companies'
        ordering = ['-visa_fair_score', 'name']
    
    def __str__(self):
        return self.name
    
    def calculate_approval_rate(self):
        total = self.total_h1b_approvals + self.total_h1b_denials
        if total > 0:
            return (self.total_h1b_approvals / total) * 100
        return None


class CompanyReview(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Ratings (1-5)
    sponsorship_experience_rating = models.PositiveSmallIntegerField()
    salary_fairness_rating = models.PositiveSmallIntegerField()
    overall_rating = models.PositiveSmallIntegerField()
    
    review_text = models.TextField()
    visa_type = models.CharField(max_length=20, blank=True)
    years_at_company = models.PositiveIntegerField(null=True, blank=True)
    
    is_anonymous = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review of {self.company.name}"
