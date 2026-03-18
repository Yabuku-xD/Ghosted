#!/usr/bin/env python3
"""Create sample offers for testing salary predictor"""
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghosted.settings')
django.setup()

from companies.models import Company
from offers.models import Offer

print('Creating sample offers...')

companies = list(Company.objects.all())
positions = [
    ('Software Engineer', 'entry', 1, 90000),
    ('Software Engineer', 'mid', 4, 140000),
    ('Software Engineer', 'senior', 8, 190000),
    ('Software Engineer', 'staff', 12, 280000),
    ('Data Scientist', 'mid', 3, 135000),
    ('Data Scientist', 'senior', 7, 185000),
    ('Product Manager', 'mid', 5, 150000),
    ('Product Manager', 'senior', 9, 210000),
    ('ML Engineer', 'mid', 4, 160000),
    ('ML Engineer', 'senior', 7, 220000),
    ('Backend Engineer', 'mid', 4, 145000),
    ('Frontend Engineer', 'mid', 3, 130000),
    ('DevOps Engineer', 'senior', 6, 170000),
    ('Security Engineer', 'senior', 8, 200000),
]

locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote']
visa_types = ['h1b', 'opt', 'green_card', '']

created = 0
for company in companies:
    # Create 2-5 offers per company
    for _ in range(random.randint(2, 5)):
        pos, level, years, base = random.choice(positions)
        
        # Add some variance
        base_salary = base + random.randint(-15000, 25000)
        signing = random.choice([0, 10000, 15000, 20000, 25000])
        bonus_pct = random.choice([0, 10, 15, 20])
        stock = random.choice([0, 50000, 100000, 150000, 200000])
        
        Offer.objects.create(
            company=company,
            position_title=pos,
            location=random.choice(locations),
            is_remote=random.choice([True, False]),
            base_salary=base_salary,
            signing_bonus=signing if signing > 0 else None,
            annual_bonus_pct=bonus_pct if bonus_pct > 0 else None,
            stock_grant=stock if stock > 0 else None,
            stock_grant_years=4 if stock > 0 else None,
            experience_level=level,
            years_of_experience=years,
            visa_type=random.choice(visa_types),
            employment_type='full_time',
            is_anonymous=True,
            is_verified=True
        )
        created += 1

print(f'✓ Created {created} sample offers')
