#!/usr/bin/env python3
"""Test Ghosted API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, method="GET", data=None):
    try:
        if method == "GET":
            r = requests.get(url, timeout=5)
        else:
            r = requests.post(url, json=data, timeout=5)
        
        if r.status_code == 200:
            print(f"✓ {name}: OK")
            return r.json()
        elif r.status_code == 401:
            print(f"✓ {name}: OK (auth required, as expected)")
            return None
        else:
            print(f"✗ {name}: Status {r.status_code}")
            return None
    except Exception as e:
        print(f"✗ {name}: {str(e)[:50]}")
        return None

print("=== GHOSTED API TESTS ===\n")

# 1. Companies
companies = test_endpoint("Companies list", f"{BASE_URL}/companies/")
if companies:
    print(f"  Total companies: {companies['count']}")
    print(f"  Top: {companies['results'][0]['name']} (Score: {companies['results'][0]['visa_fair_score']})")

# 2. Company detail
detail = test_endpoint("Company detail", f"{BASE_URL}/companies/google-llc/")
if detail:
    print(f"  {detail['name']}: {detail['total_h1b_filings']} H1B apps, {detail['h1b_approval_rate']}% approval")

# 3. Offers
offers = test_endpoint("Offers list", f"{BASE_URL}/offers/")
if offers:
    print(f"  Total offers: {offers['count']}")

# 4. Offers stats
stats = test_endpoint("Offers statistics", f"{BASE_URL}/offers/statistics/")
if stats:
    print(f"  Avg base: ${stats['overall']['avg_base']:,.0f}")

# 5. Lottery years
lottery = test_endpoint("Lottery years", f"{BASE_URL}/lottery-years/")
if lottery:
    print(f"  Years: {[r['fiscal_year'] for r in lottery['results']]}")

# 6. H1B applications
h1b = test_endpoint("H1B applications", f"{BASE_URL}/h1b-applications/")
if h1b:
    print(f"  Total H1B apps: {h1b['count']}")

# 7. Auth endpoints
print("\n=== AUTH TESTS ===")
test_endpoint("Login (no user)", f"{BASE_URL}/auth/login/", "POST", {"username":"test","password":"test"})
test_endpoint("Register", f"{BASE_URL}/users/register/", "POST", {"username":"testuser123","password":"testpass123","email":"test@test.com"})

print("\n=== ALL TESTS COMPLETE ===")
