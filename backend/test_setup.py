#!/usr/bin/env python
"""
Simple test script to verify the backend setup.
Run: python test_setup.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ghosted.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
    print("✓ Django setup successful")
except Exception as e:
    print(f"✗ Django setup failed: {e}")
    sys.exit(1)

# Test imports
from companies.models import Company
from h1b_data.models import H1BApplication
from offers.models import Offer
from predictions.models import SalaryPrediction
from users.models import CustomUser

print("✓ All models imported successfully")

# Test services
from companies.services.scoring import CompanyScorer
from predictions.services.salary_predictor import SalaryPredictor
from predictions.services.lottery_calculator import LotteryRiskCalculator

print("✓ All services imported successfully")

# Test serializers
from companies.serializers import CompanySerializer
from h1b_data.serializers import H1BApplicationSerializer
from offers.serializers import OfferSerializer

print("✓ All serializers imported successfully")

print("\n" + "="*50)
print("All tests passed! Backend is ready.")
print("="*50)
