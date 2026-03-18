from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid


class CustomUser(AbstractUser):
    VISA_CHOICES = [
        ('f1', 'F-1 Student'),
        ('opt', 'F-1 OPT'),
        ('stem_opt', 'F-1 STEM OPT'),
        ('h1b', 'H-1B'),
        ('h4', 'H-4'),
        ('l1', 'L-1'),
        ('l2', 'L-2'),
        ('o1', 'O-1'),
        ('green_card', 'Green Card'),
        ('citizen', 'US Citizen'),
        ('other', 'Other'),
    ]

    NATIONALITY_CHOICES = [
        ('india', 'India'),
        ('china', 'China'),
        ('canada', 'Canada'),
        ('mexico', 'Mexico'),
        ('uk', 'United Kingdom'),
        ('other', 'Other'),
    ]

    # Profile fields
    full_name = models.CharField(max_length=200, blank=True)
    company = models.CharField(max_length=200, blank=True)
    job_title = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)

    # Visa and work status
    visa_status = models.CharField(
        max_length=20,
        choices=VISA_CHOICES,
        blank=True,
        null=True
    )
    nationality = models.CharField(
        max_length=50,
        choices=NATIONALITY_CHOICES,
        blank=True,
        null=True
    )
    country_of_birth = models.CharField(max_length=100, blank=True)

    # Professional info
    years_of_experience = models.PositiveIntegerField(blank=True, null=True)
    current_location = models.CharField(max_length=100, blank=True)
    target_location = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)

    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(null=True, blank=True)

    # Password reset
    password_reset_token = models.UUIDField(null=True, blank=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.email})"

    def generate_email_verification_token(self):
        self.email_verification_token = uuid.uuid4()
        self.save()
        return self.email_verification_token

    def generate_password_reset_token(self):
        from django.utils import timezone
        import datetime
        self.password_reset_token = uuid.uuid4()
        self.password_reset_expires = timezone.now() + datetime.timedelta(hours=1)
        self.save()
        return self.password_reset_token


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('screening', 'Phone Screening'),
        ('interview', 'Interview'),
        ('offer', 'Offer Received'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('withdrawn', 'Withdrawn'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applications')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='applications')
    position_title = models.CharField(max_length=200)
    location = models.CharField(max_length=100, blank=True)
    salary_range_min = models.PositiveIntegerField(blank=True, null=True)
    salary_range_max = models.PositiveIntegerField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    referral = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date']

    def __str__(self):
        return f"{self.position_title} at {self.company.name}"
