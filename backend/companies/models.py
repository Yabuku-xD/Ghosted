from decimal import Decimal
from django.db import models

JOB_PROVIDER_CHOICES = [
    ("greenhouse", "Greenhouse"),
    ("lever", "Lever"),
    ("ashby", "Ashby"),
    ("manual", "Manual"),
]


class Company(models.Model):
    DATA_CONFIDENCE_CHOICES = [
        ("limited", "Limited"),
        ("emerging", "Emerging"),
        ("good", "Good"),
        ("high", "High"),
    ]

    COMPANY_SIZE_CHOICES = [
        ("startup", "Startup (1-50)"),
        ("small", "Small (51-200)"),
        ("mid", "Mid-size (201-1000)"),
        ("large", "Large (1000-5000)"),
        ("enterprise", "Enterprise (5000+)"),
    ]

    INDUSTRY_CHOICES = [
        ("tech", "Technology"),
        ("finance", "Finance"),
        ("healthcare", "Healthcare"),
        ("consulting", "Consulting"),
        ("ecommerce", "E-commerce"),
        ("ai", "AI/ML"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    company_domain = models.CharField(max_length=255, blank=True, db_index=True)
    domain_source = models.CharField(max_length=50, blank=True)
    domain_confidence = models.CharField(
        max_length=20,
        choices=DATA_CONFIDENCE_CHOICES,
        blank=True,
    )
    logo_url = models.URLField(blank=True, help_text="URL to company logo image")
    logo_provider = models.CharField(max_length=50, blank=True)
    logo_confidence = models.CharField(
        max_length=20,
        choices=DATA_CONFIDENCE_CHOICES,
        blank=True,
    )
    logo_last_checked_at = models.DateTimeField(null=True, blank=True)
    linkedin_url = models.URLField(blank=True)
    careers_url = models.URLField(blank=True)
    jobs_provider = models.CharField(
        max_length=20, choices=JOB_PROVIDER_CHOICES, blank=True, db_index=True
    )
    jobs_board_token = models.CharField(max_length=120, blank=True, db_index=True)
    jobs_sync_enabled = models.BooleanField(default=True)
    jobs_last_synced_at = models.DateTimeField(null=True, blank=True)
    jobs_last_discovered_at = models.DateTimeField(null=True, blank=True)
    jobs_sync_error = models.CharField(max_length=255, blank=True)
    headquarters = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(
        max_length=20, choices=COMPANY_SIZE_CHOICES, blank=True
    )
    industry = models.CharField(max_length=20, choices=INDUSTRY_CHOICES, blank=True)
    year_founded = models.PositiveIntegerField(null=True, blank=True)
    employee_count_estimate = models.PositiveIntegerField(null=True, blank=True)

    # Visa-fair scoring fields
    visa_fair_score = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )
    h1b_approval_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    avg_salary_percentile = models.PositiveIntegerField(null=True, blank=True)
    sponsorship_consistency_score = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )

    # Metadata
    total_h1b_filings = models.PositiveIntegerField(default=0)
    total_h1b_approvals = models.PositiveIntegerField(default=0)
    total_h1b_denials = models.PositiveIntegerField(default=0)
    first_filing_year = models.PositiveIntegerField(null=True, blank=True)
    last_filing_year = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "companies"
        ordering = ["-visa_fair_score", "name"]
        indexes = [
            models.Index(fields=["-visa_fair_score", "name"]),
            models.Index(fields=["-total_h1b_filings", "name"]),
            models.Index(fields=["-last_filing_year", "name"]),
        ]

    def __str__(self):
        return self.name

    def calculate_approval_rate(self):
        total = self.total_h1b_approvals + self.total_h1b_denials
        if total > 0:
            return (self.total_h1b_approvals / total) * 100
        return Decimal("0.00") if total == 0 else None


class CompanyReview(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="reviews"
    )
    author = models.ForeignKey(
        "users.CustomUser", on_delete=models.SET_NULL, null=True, blank=True
    )

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
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review of {self.company.name}"


class CompanyBenefit(models.Model):
    CATEGORY_CHOICES = [
        ("health", "Health"),
        ("retirement", "Retirement"),
        ("equity", "Equity"),
        ("time_off", "Time Off"),
        ("family", "Family"),
        ("immigration", "Immigration"),
        ("learning", "Learning"),
        ("other", "Other"),
    ]

    SOURCE_CHOICES = [
        ("community", "Community"),
        ("company", "Company"),
        ("manual_research", "Manual Research"),
    ]

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="benefits"
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="other"
    )
    value = models.CharField(max_length=120, blank=True)
    source = models.CharField(
        max_length=20, choices=SOURCE_CHOICES, default="community"
    )
    source_url = models.URLField(blank=True)
    confidence = models.CharField(
        max_length=20,
        choices=Company.DATA_CONFIDENCE_CHOICES,
        default="emerging",
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_verified", "category", "title"]
        unique_together = ["company", "title", "category"]

    def __str__(self):
        return f"{self.title} ({self.company.name})"


class JobPosting(models.Model):
    SOURCE_CHOICES = JOB_PROVIDER_CHOICES

    REMOTE_POLICY_CHOICES = [
        ("remote", "Remote"),
        ("hybrid", "Hybrid"),
        ("onsite", "On-site"),
        ("unknown", "Unknown"),
    ]

    VISA_SIGNAL_CHOICES = [
        ("historically_sponsors", "Historically Sponsors"),
        ("likely", "Likely"),
        ("unknown", "Unknown"),
    ]

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="job_postings"
    )
    title = models.CharField(max_length=200)
    team = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=150, blank=True)
    remote_policy = models.CharField(
        max_length=20, choices=REMOTE_POLICY_CHOICES, default="unknown"
    )
    employment_type = models.CharField(max_length=50, blank=True)
    url = models.URLField()
    source = models.CharField(
        max_length=20, choices=SOURCE_CHOICES, default="greenhouse"
    )
    source_board = models.CharField(max_length=100, blank=True)
    external_job_id = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    currency = models.CharField(max_length=10, default="USD")
    posted_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    visa_sponsorship_signal = models.CharField(
        max_length=30,
        choices=VISA_SIGNAL_CHOICES,
        default="unknown",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-posted_at", "title"]
        unique_together = ["company", "source", "external_job_id"]
        indexes = [
            models.Index(fields=["source", "source_board"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["posted_at"]),
            models.Index(fields=["remote_policy"]),
            models.Index(fields=["company", "is_active"]),
            models.Index(fields=["is_active", "-posted_at"]),
            models.Index(fields=["source", "is_active"]),
        ]

    def __str__(self):
        return f"{self.title} at {self.company.name}"
