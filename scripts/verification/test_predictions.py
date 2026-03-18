#!/usr/bin/env python3
"""Test Ghosted prediction endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

print("=== PREDICTION API TESTS ===\n")

# 1. Salary prediction
print("1. Salary Predictor:")
r = requests.post(f"{BASE_URL}/predictions/salary/", json={
    "position_title": "Software Engineer",
    "location": "San Francisco, CA",
    "experience_level": "mid",
    "years_of_experience": 5,
    "visa_status": "h1b"
}, timeout=10)

if r.status_code == 200:
    data = r.json()
    pred = data['prediction']
    print(f"  ✓ Predicted: ${pred['predicted_base_salary']:,}")
    print(f"  ✓ Range: ${pred['salary_range_low']:,} - ${pred['salary_range_high']:,}")
    print(f"  ✓ Confidence: {float(pred['confidence_score'])*100:.0f}%")
    print(f"  ✓ Based on {pred['similar_offers_count']} similar offers")
else:
    print(f"  ✗ Error: {r.status_code}")
    print(f"  {r.text[:200]}")

# 2. Lottery risk
print("\n2. Lottery Risk Calculator:")
r = requests.post(f"{BASE_URL}/predictions/lottery_risk/", json={
    "country_of_birth": "india",
    "has_masters_degree": True,
    "us_masters_degree": True,
    "visa_type": "h1b",
    "fiscal_year": 2026
}, timeout=10)

if r.status_code == 200:
    data = r.json()
    assessment = data['assessment']
    print(f"  ✓ Selection probability: {assessment['selection_probability']}%")
    print(f"  ✓ Risk level: {assessment['risk_level']}")
    print(f"  ✓ Green card wait: {assessment['green_card_wait_years']} years")
    print(f"  ✓ {len(data['details']['recommendations'])} recommendations")
else:
    print(f"  ✗ Error: {r.status_code}")
    print(f"  {r.text[:200]}")

# 3. Sponsorship likelihood
print("\n3. Sponsorship Likelihood (Google, Software Engineer):")
r = requests.post(f"{BASE_URL}/sponsorship-likelihood/calculate/", json={
    "company_id": 1,
    "job_title": "Software Engineer",
    "experience_level": "mid"
}, timeout=10)

if r.status_code == 200:
    data = r.json()
    likelihood = data['likelihood']
    print(f"  ✓ Score: {likelihood['likelihood_score']}/10")
    print(f"  ✓ Percentage: {likelihood['likelihood_percentage']}%")
    print(f"  ✓ Risk level: {data['details']['risk_level']}")
else:
    print(f"  ✗ Error: {r.status_code}")
    print(f"  {r.text[:200]}")

print("\n=== PREDICTION TESTS COMPLETE ===")
