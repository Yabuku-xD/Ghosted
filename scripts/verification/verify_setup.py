#!/usr/bin/env python3
"""
Ghosted Project Setup Verification Script

This script verifies that all components of the Ghosted project are properly configured.
Run this after setting up the project to ensure everything is working.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_file_exists(path, description):
    """Check if a file exists"""
    if Path(path).exists():
        print(f"✓ {description}")
        return True
    else:
        print(f"✗ {description} - MISSING: {path}")
        return False

def check_directory_exists(path, description):
    """Check if a directory exists"""
    if Path(path).is_dir():
        print(f"✓ {description}")
        return True
    else:
        print(f"✗ {description} - MISSING: {path}")
        return False

def main():
    print("=" * 60)
    print("GHOSTED PROJECT SETUP VERIFICATION")
    print("=" * 60)
    print()
    
    all_checks_passed = True
    
    # Project structure checks
    print("PROJECT STRUCTURE:")
    all_checks_passed &= check_directory_exists("backend", "Backend directory")
    all_checks_passed &= check_directory_exists("frontend", "Frontend directory")
    all_checks_passed &= check_file_exists("docker-compose.yml", "Docker Compose config")
    all_checks_passed &= check_file_exists("README.md", "README file")
    print()
    
    # Backend checks
    print("BACKEND:")
    all_checks_passed &= check_file_exists("backend/manage.py", "Django manage.py")
    all_checks_passed &= check_file_exists("backend/requirements.txt", "Python requirements")
    all_checks_passed &= check_file_exists("backend/ghosted/settings.py", "Django settings")
    
    # Django apps
    apps = ["users", "companies", "offers", "predictions", "h1b_data"]
    for app in apps:
        all_checks_passed &= check_directory_exists(f"backend/{app}", f"{app} app")
        all_checks_passed &= check_file_exists(f"backend/{app}/models.py", f"  - {app} models")
        all_checks_passed &= check_file_exists(f"backend/{app}/views.py", f"  - {app} views")
    print()
    
    # Backend services
    print("BACKEND SERVICES:")
    all_checks_passed &= check_file_exists("backend/companies/services/scoring.py", "Company scoring service")
    all_checks_passed &= check_file_exists("backend/predictions/services/salary_predictor.py", "Salary predictor")
    all_checks_passed &= check_file_exists("backend/predictions/services/lottery_calculator.py", "Lottery calculator")
    all_checks_passed &= check_file_exists("backend/predictions/services/sponsorship_tracker.py", "Sponsorship tracker")
    print()
    
    # Management commands
    print("MANAGEMENT COMMANDS:")
    all_checks_passed &= check_file_exists("backend/h1b_data/management/commands/import_h1b_data.py", "Import H1B data")
    all_checks_passed &= check_file_exists("backend/companies/management/commands/calculate_scores.py", "Calculate scores")
    all_checks_passed &= check_file_exists("backend/companies/management/commands/create_sample_data.py", "Create sample data")
    print()
    
    # Frontend checks
    print("FRONTEND:")
    all_checks_passed &= check_file_exists("frontend/package.json", "Package.json")
    all_checks_passed &= check_file_exists("frontend/vite.config.ts", "Vite config")
    all_checks_passed &= check_file_exists("frontend/src/App.tsx", "App.tsx")
    all_checks_passed &= check_file_exists("frontend/src/index.css", "Tailwind CSS")
    print()
    
    # Frontend pages
    print("FRONTEND PAGES:")
    pages = ["Home", "Companies", "CompanyDetail", "Offers", "Predictions", "LotteryCalculator", "Dashboard", "Login", "Register"]
    for page in pages:
        all_checks_passed &= check_file_exists(f"frontend/src/pages/{page}.tsx", f"  - {page}")
    print()
    
    # Frontend components
    print("FRONTEND COMPONENTS:")
    components = ["Layout", "OfferForm", "SalaryPredictor", "SponsorshipTracker", "ProtectedRoute", "JobApplicationForm"]
    for component in components:
        all_checks_passed &= check_file_exists(f"frontend/src/components/{component}.tsx", f"  - {component}")
    
    # Contexts
    print("CONTEXTS:")
    all_checks_passed &= check_file_exists("frontend/src/contexts/AuthContext.tsx", "  - AuthContext")
    print()
    
    # Summary
    print("=" * 60)
    if all_checks_passed:
        print("✓ ALL CHECKS PASSED!")
        print()
        print("Next steps:")
        print("  1. Run: docker-compose up --build")
        print("  2. Run: docker-compose exec backend python manage.py migrate")
        print("  3. Run: docker-compose exec backend python manage.py create_sample_data")
        print("  4. Run: docker-compose exec backend python manage.py calculate_scores")
        print("  5. Visit: http://localhost:5173")
        return 0
    else:
        print("✗ SOME CHECKS FAILED")
        print("Please review the errors above and fix missing files.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
