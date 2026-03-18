#!/usr/bin/env python3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghosted.settings')
django.setup()

from companies.models import Company
from h1b_data.models import H1BApplication, LotteryYear
from offers.models import Offer

print('=== GHOSTED DATA VERIFICATION ===\n')

print('TOP 5 COMPANIES BY VISA-FAIR SCORE:')
for c in Company.objects.order_by('-visa_fair_score')[:5]:
    h1b_count = H1BApplication.objects.filter(employer=c).count()
    print(f'  {c.name}: {c.visa_fair_score}/10 ({h1b_count} H1B apps, {c.h1b_approval_rate}% approval)')

print(f'\nSTATISTICS:')
print(f'  Total companies: {Company.objects.count()}')
print(f'  Total H1B applications: {H1BApplication.objects.count()}')
print(f'  Lottery years: {list(LotteryYear.objects.values_list("fiscal_year", flat=True))}')
print(f'  Total offers: {Offer.objects.count()}')

print('\n✓ Data verification complete!')
