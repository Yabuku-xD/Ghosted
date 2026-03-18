"""
Normalize company names and job titles in the H1B data.
This script cleans and standardizes all data for consistency.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from companies.models import Company
from offers.models import Offer
from h1b_data.models import H1BApplication
import re
from collections import defaultdict

# Company name normalization mapping
# Maps variations to canonical name
COMPANY_NORMALIZATION = {
    # Amazon
    'AMAZON ADVERTISING LLC': 'Amazon',
    'AMAZON DATA SERVICES INC': 'Amazon',
    'AMAZON DATA SERVICES, INC': 'Amazon',
    'AMAZON DATA SERVICES, INC.': 'Amazon',
    'AMAZON DEVELOPMENT CENTER U.S. INC': 'Amazon',
    'AMAZON DEVELOPMENT CENTER U.S., INC': 'Amazon',
    'AMAZON DEVELOPMENT CENTER U.S., INC.': 'Amazon',
    'AMAZON DEVELOPMENT CENTER US, INC': 'Amazon',
    'AMAZON FRESH LLC': 'Amazon',
    'AMAZON FULFILLMENT CENTER (BF14)': 'Amazon',
    'AMAZON LLC': 'Amazon',
    'AMAZON PAYMENTS, INC': 'Amazon',
    'AMAZON PAYMENTS INC': 'Amazon',
    'AMAZON PAYMENTS INC.': 'Amazon',
    'AMAZON RETAIL LLC': 'Amazon',
    'AMAZON STUDIOS LLC': 'Amazon',
    'AMAZON STUDIOS, LLC': 'Amazon',
    'AMAZON WEB SERVICES, INC': 'Amazon',
    'AMAZON WEB SERVICES, INC.': 'Amazon',
    'AMAZON WEB SERVICES': 'Amazon',
    'AMAZON.COM SERVICES LLC': 'Amazon',
    'AMAZON.COM SERVICES': 'Amazon',
    'AMAZON.COM SERVICES INC.': 'Amazon',
    'AMAZON.COM.CA, INC': 'Amazon',
    'AMAZON.COM.CA INC': 'Amazon',
    'AMAZON.COM.CA, INC.': 'Amazon',

    # Google
    'GOOGLE LLC': 'Google',
    'GOOGLE PUBLIC SECTOR LLC': 'Google',
    'GOOGLE TECHNOLOGY COMPANY': 'Google',

    # Microsoft
    'MICROSOFT CORPORATION': 'Microsoft',

    # Apple
    'APPLE INC': 'Apple',
    'APPLE INC.': 'Apple',

    # Meta/Facebook
    'META PLATFORMS, INC': 'Meta',
    'META PLATFORMS, INC.': 'Meta',
    'META PLATFORMS': 'Meta',
    'FACEBOOK INC': 'Meta',
    'FACEBOOK, INC': 'Meta',

    # TCS
    'TATA CONSULTANCY SERVICES LIMITED': 'Tata Consultancy Services',
    'TCS E SERVE INTERNATIONAL LIMITED': 'Tata Consultancy Services',

    # Infosys
    'INFOSYS LIMITED': 'Infosys',
    'INFOSYS BPM LIMITED': 'Infosys',
    'INFOSYS MCCAMISH SYSTEMS, LLC': 'Infosys',
    'INFOSYS NOVA HOLDINGS': 'Infosys',
    'INFOSYS NOVA HOLDINGS LLC': 'Infosys',
    'INFOSYS PUBLIC SERVICES, INC': 'Infosys',

    # IBM
    'IBM CORPORATION': 'IBM',
    'INTERNATIONAL BUSINESS MACHINES CORPORATION': 'IBM',

    # Oracle
    'ORACLE AMERICA, INC': 'Oracle',
    'ORACLE AMERICA, INC.': 'Oracle',
    'ORACLE CORPORATION': 'Oracle',

    # Salesforce
    'SALESFORCE, INC': 'Salesforce',
    'SALESFORCE, INC.': 'Salesforce',

    # NVIDIA
    'NVIDIA CORPORATION': 'NVIDIA',

    # Intel
    'INTEL CORPORATION': 'Intel',

    # Tesla
    'TESLA, INC': 'Tesla',
    'TESLA, INC.': 'Tesla',

    # Walmart
    'WAL-MART ASSOCIATES, INC': 'Walmart',
    'WAL-MART ASSOCIATES, INC.': 'Walmart',
    'WALMART INC': 'Walmart',
    'WALMART INC.': 'Walmart',

    # JPMorgan
    'JPMORGAN CHASE & CO': 'JPMorgan Chase',
    'JPMORGAN CHASE & CO.': 'JPMorgan Chase',
    'JPMORGAN CHASE BANK, N A': 'JPMorgan Chase',
    'JPMORGAN CHASE BANK, N.A.': 'JPMorgan Chase',

    # Citibank
    'CITIBANK, N A': 'Citibank',
    'CITIBANK, N.A.': 'Citibank',
    'CITIGROUP INC': 'Citibank',
    'CITIGROUP INC.': 'Citibank',

    # Deloitte
    'DELOITTE CONSULTING LLP': 'Deloitte',
    'DELOITTE LLP': 'Deloitte',
    'DELOITTE TAX LLP': 'Deloitte',
    'DELOITTE & TOUCHE LLP': 'Deloitte',

    # EY
    'ERNST & YOUNG U S LLP': 'Ernst & Young',
    'ERNST & YOUNG U.S. LLP': 'Ernst & Young',
    'ERNST & YOUNG LLP': 'Ernst & Young',

    # KPMG
    'KPMG LLP': 'KPMG',
    'KPMG INTERNATIONAL': 'KPMG',

    # PwC
    'PRICEWATERHOUSECOOPERS LLP': 'PwC',
    'PRICEWATERHOUSECOOPERS ADVISORY SERVICES LLC': 'PwC',

    # Accenture
    'ACCENTURE LLP': 'Accenture',
    'ACCENTURE INC': 'Accenture',
    'ACCENTURE INC.': 'Accenture',

    # Cognizant
    'COGNIZANT TECHNOLOGY SOLUTIONS US CORP': 'Cognizant',
    'COGNIZANT TECHNOLOGY SOLUTIONS U.S. CORPORATION': 'Cognizant',
    'COGNIZANT TECHNOLOGY SOLUTIONS': 'Cognizant',

    # HCL
    'HCL AMERICA INC': 'HCL Technologies',
    'HCL AMERICA INC.': 'HCL Technologies',
    'HCL TECHNOLOGIES LIMITED': 'HCL Technologies',
    'HCL AMERICA': 'HCL Technologies',

    # Capgemini
    'CAPGEMINI AMERICA INC': 'Capgemini',
    'CAPGEMINI AMERICA INC.': 'Capgemini',
    'CAPGEMINI US LLC': 'Capgemini',
    'CAPGEMINI AMERICA': 'Capgemini',

    # Wipro
    'WIPRO LIMITED': 'Wipro',
    'WIPRO TECHNOLOGIES LTD': 'Wipro',
    'WIPRO LLC': 'Wipro',
    'WIPRO': 'Wipro',

    # NVIDIA
    'NVIDIA CORPORATION': 'NVIDIA',
    'NVIDIA CORP': 'NVIDIA',
}

# Job title normalization patterns
JOB_TITLE_PATTERNS = [
    # Remove tracking codes and job IDs
    (r'\s*[-–]\s*[A-Z]{2,}\d{5,}[-–]\d+.*$', ''),  # Remove codes like - KBGFJG08053-21
    (r'\s*\([A-Z]{2,}\d+\)$', ''),  # Remove codes like (STRLLGX0006)
    (r'\s*\".*$', ''),  # Remove weird quote artifacts
    (r'\s*\d+$', ''),  # Remove trailing numbers like "Software Engineer 3"
    (r'\s*-\s*Sr\.?\s*Consultant.*$', ''),  # Remove level suffixes
    (r'\s*JC\d+.*$', ''),  # Remove JC codes
]

# Job title standardization mapping
JOB_TITLE_STANDARDIZATION = {
    # Software Engineering
    'SR SOFTWARE ENGINEER': 'Senior Software Engineer',
    'SR. SOFTWARE ENGINEER': 'Senior Software Engineer',
    'SENIOR SWE': 'Senior Software Engineer',
    'SWE': 'Software Engineer',
    'SOFTWARE ENG': 'Software Engineer',
    'SOFTWARE DEVELOPER': 'Software Engineer',
    'SR SOFTWARE DEVELOPER': 'Senior Software Engineer',
    'SOFTWARE DEVELOPMENT ENGINEER': 'Software Engineer',
    'SR SOFTWARE DEVELOPMENT ENGINEER': 'Senior Software Engineer',
    'SDE': 'Software Engineer',
    'SDE II': 'Software Engineer',
    'SDE III': 'Senior Software Engineer',
    'STAFF SWE': 'Staff Software Engineer',
    'PRINCIPAL SWE': 'Principal Software Engineer',

    # Data
    'SR DATA ENGINEER': 'Senior Data Engineer',
    'SR. DATA ENGINEER': 'Senior Data Engineer',
    'DATA SCIENTIST': 'Data Scientist',
    'SR DATA SCIENTIST': 'Senior Data Scientist',

    # Product Management
    'SR PRODUCT MANAGER': 'Senior Product Manager',
    'SR. PRODUCT MANAGER': 'Senior Product Manager',
    'PM': 'Product Manager',

    # Technical Lead
    'TECH LEAD': 'Technical Lead',
    'TECHNICAL LEAD': 'Technical Lead',
    'LEAD ENGINEER': 'Lead Engineer',
    'LEAD SOFTWARE ENGINEER': 'Lead Software Engineer',

    # Architecture
    'SOFTWARE ARCHITECT': 'Software Architect',
    'SOLUTIONS ARCHITECT': 'Solutions Architect',
    'SOLUTION ARCHITECT': 'Solutions Architect',
    'TECHNICAL ARCHITECT': 'Technical Architect',

    # Management
    'ENG MANAGER': 'Engineering Manager',
    'ENGINEERING MANAGER': 'Engineering Manager',
    'MANAGER SOFTWARE DEV': 'Engineering Manager',
    'MANAGER III SOFTWARE DEV': 'Engineering Manager',
    'MANAGER JC50': 'Engineering Manager',

    # Analyst
    'SR BUSINESS ANALYST': 'Senior Business Analyst',
    'SR. BUSINESS ANALYST': 'Senior Business Analyst',
    'BUSINESS SYSTEMS ANALYST': 'Business Analyst',
    'SYSTEMS ANALYST': 'Systems Analyst',
    'SR SYSTEMS ANALYST': 'Senior Systems Analyst',
    'DATA ANALYST': 'Data Analyst',
    'SR DATA ANALYST': 'Senior Data Analyst',

    # Computer Programmer variations
    'COMPUTER PROGRAMMER': 'Software Engineer',
    'COMPUTER PROGRAMMER II': 'Software Engineer',
    'SR COMPUTER PROGRAMMER': 'Senior Software Engineer',

    # DevOps/Infrastructure
    'DEVOPS ENGINEER': 'DevOps Engineer',
    'SR DEVOPS ENGINEER': 'Senior DevOps Engineer',
    'SRE': 'Site Reliability Engineer',
    'SITE RELIABILITY ENGINEER': 'Site Reliability Engineer',

    # Quality
    'QA ENGINEER': 'QA Engineer',
    'QUALITY ASSURANCE ENGINEER': 'QA Engineer',
    'SR QA ENGINEER': 'Senior QA Engineer',
    'TEST ENGINEER': 'QA Engineer',
    'SR TEST ENGINEER': 'Senior QA Engineer',

    # Machine Learning / AI
    'ML ENGINEER': 'Machine Learning Engineer',
    'MACHINE LEARNING ENGINEER': 'Machine Learning Engineer',
    'AI ENGINEER': 'AI Engineer',
    'ARTIFICIAL INTELLIGENCE ENGINEER': 'AI Engineer',
    'PRINCIPAL AI ENGINEER': 'Principal AI Engineer',
}

def normalize_company_name(name):
    """Normalize company name to a consistent format."""
    if not name:
        return name

    # Uppercase for lookup
    upper_name = name.upper().strip()

    # Check direct mapping
    if upper_name in COMPANY_NORMALIZATION:
        return COMPANY_NORMALIZATION[upper_name]

    # Clean up common issues
    normalized = name.strip()

    # Remove newlines and other whitespace characters
    normalized = re.sub(r'[\r\n\t]+', ' ', normalized)

    # Remove extra spaces
    normalized = re.sub(r'\s+', ' ', normalized)

    # Remove trailing punctuation
    normalized = normalized.rstrip('.,')

    # Title case for display
    # But preserve known acronyms
    words = normalized.split()
    result = []
    for word in words:
        if word.upper() in ['LLC', 'INC', 'LTD', 'CORP', 'CO', 'LLP']:
            result.append(word.upper() if word.upper() in ['LLC', 'INC', 'LTD', 'LLP'] else word)
        elif len(word) <= 2:
            result.append(word.upper())
        else:
            result.append(word.title())

    return ' '.join(result)

def normalize_job_title(title):
    """Normalize job title to a consistent format."""
    if not title:
        return title

    normalized = title.strip()

    # Remove newlines and other whitespace characters
    normalized = re.sub(r'[\r\n\t]+', ' ', normalized)

    # Apply regex patterns to clean up
    for pattern, replacement in JOB_TITLE_PATTERNS:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)

    # Clean up extra spaces
    normalized = re.sub(r'\s+', ' ', normalized).strip()

    # Remove trailing punctuation
    normalized = normalized.rstrip('.,-–')

    # Standardize Sr./Sr to Senior
    normalized = re.sub(r'^Sr\.?\s+', 'Senior ', normalized, flags=re.IGNORECASE)
    normalized = re.sub(r'\s+Sr\.?\s+', ' Senior ', normalized, flags=re.IGNORECASE)

    # Check standardization mapping
    upper_title = normalized.upper()
    if upper_title in JOB_TITLE_STANDARDIZATION:
        return JOB_TITLE_STANDARDIZATION[upper_title]

    # Capitalize properly
    words = normalized.split()
    result = []
    for i, word in enumerate(words):
        # Keep certain words uppercase
        if word.upper() in ['II', 'III', 'IV', 'VP', 'CEO', 'CTO', 'CFO', 'API', 'AWS', 'AI', 'ML']:
            result.append(word.upper())
        # Keep certain words lowercase (except first word)
        elif i > 0 and word.lower() in ['of', 'and', 'the', 'for', 'to', 'in', 'at']:
            result.append(word.lower())
        else:
            result.append(word.title())

    return ' '.join(result)

def normalize_location(location):
    """Normalize location format."""
    if not location:
        return location

    # Clean up - remove newlines and other whitespace characters
    normalized = location.strip()
    normalized = re.sub(r'[\r\n\t]+', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized)

    # Standardize state abbreviations
    state_abbrevs = {
        'CALIFORNIA': 'CA', 'TEXAS': 'TX', 'NEW YORK': 'NY', 'FLORIDA': 'FL',
        'ILLINOIS': 'IL', 'PENNSYLVANIA': 'PA', 'OHIO': 'OH', 'GEORGIA': 'GA',
        'NORTH CAROLINA': 'NC', 'MICHIGAN': 'MI', 'NEW JERSEY': 'NJ',
        'VIRGINIA': 'VA', 'WASHINGTON': 'WA', 'ARIZONA': 'AZ', 'MASSACHUSETTS': 'MA',
        'TENNESSEE': 'TN', 'INDIANA': 'IN', 'MARYLAND': 'MD', 'MISSOURI': 'MO',
        'WISCONSIN': 'WI', 'COLORADO': 'CO', 'MINNESOTA': 'MN', 'SOUTH CAROLINA': 'SC',
        'ALABAMA': 'AL', 'LOUISIANA': 'LA', 'KENTUCKY': 'KY', 'OREGON': 'OR',
        'OKLAHOMA': 'OK', 'CONNECTICUT': 'CT', 'UTAH': 'UT', 'IOWA': 'IA',
        'NEVADA': 'NV', 'ARKANSAS': 'AR', 'MISSISSIPPI': 'MS', 'KANSAS': 'KS',
        'NEW MEXICO': 'NM', 'NEBRASKA': 'NE', 'IDAHO': 'ID', 'WEST VIRGINIA': 'WV',
        'HAWAII': 'HI', 'NEW HAMPSHIRE': 'NH', 'MAINE': 'ME', 'MONTANA': 'MT',
        'RHODE ISLAND': 'RI', 'DELAWARE': 'DE', 'SOUTH DAKOTA': 'SD', 'NORTH DAKOTA': 'ND',
        'ALASKA': 'AK', 'VERMONT': 'VT', 'WYOMING': 'WY', 'DISTRICT OF COLUMBIA': 'DC',
    }

    # Title case the location
    normalized = normalized.title()

    # Replace full state names with abbreviations
    for full, abbrev in state_abbrevs.items():
        pattern = r',?\s*' + full.title() + r'$'
        normalized = re.sub(pattern, f', {abbrev}', normalized, flags=re.IGNORECASE)

    return normalized

def normalize_visa_type(visa_type):
    """Normalize visa type."""
    if not visa_type:
        return 'H-1B'

    normalized = visa_type.upper().strip()
    normalized = re.sub(r'[\-\s]+', '-', normalized)

    # Standardize
    mapping = {
        'H1B': 'H-1B',
        'H1-B': 'H-1B',
        'H-1B1': 'H-1B',
        'L1': 'L-1',
        'L1A': 'L-1A',
        'L1B': 'L-1B',
        'O1': 'O-1',
        'TN': 'TN',
        'E3': 'E-3',
        'GREEN_CARD': 'Green Card',
        'GREENCARD': 'Green Card',
    }

    return mapping.get(normalized, normalized)

def normalize_experience_level(level):
    """Normalize experience level."""
    if not level:
        return None

    normalized = level.lower().strip()

    mapping = {
        'entry': 'entry',
        'entry level': 'entry',
        'junior': 'entry',
        'jr': 'entry',
        'mid': 'mid',
        'mid level': 'mid',
        'mid-level': 'mid',
        'intermediate': 'mid',
        'senior': 'senior',
        'sr': 'senior',
        'sr.': 'senior',
        'lead': 'lead',
        'staff': 'staff',
        'principal': 'principal',
        'executive': 'executive',
        'director': 'executive',
        'vp': 'executive',
        'c-level': 'executive',
    }

    return mapping.get(normalized, normalized)

class Command(BaseCommand):
    help = 'Normalize company names and job titles for consistency'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - No changes will be made'))

        # Step 1: Normalize company names (rename without merging)
        self.stdout.write('Normalizing company names...')
        company_rename_count = 0
        for company in Company.objects.all():
            new_name = normalize_company_name(company.name)
            if new_name != company.name:
                # Check if the new name already exists
                existing = Company.objects.filter(name=new_name).exclude(id=company.id).first()
                if existing:
                    # Merge into existing company
                    if dry_run:
                        self.stdout.write(f'  Would merge: {company.name} -> {new_name}')
                    else:
                        # Update related records
                        Offer.objects.filter(company=company).update(company=existing)
                        H1BApplication.objects.filter(employer=company).update(employer=existing)
                        existing.total_h1b_filings = (existing.total_h1b_filings or 0) + (company.total_h1b_filings or 0)
                        existing.total_h1b_approvals = (existing.total_h1b_approvals or 0) + (company.total_h1b_approvals or 0)
                        existing.total_h1b_denials = (existing.total_h1b_denials or 0) + (company.total_h1b_denials or 0)
                        existing.save()
                        company.delete()
                        company_rename_count += 1
                else:
                    # Just rename
                    if dry_run:
                        self.stdout.write(f'  Would rename: {company.name} -> {new_name}')
                    else:
                        company.name = new_name
                        company.save()
                        company_rename_count += 1

        self.stdout.write(f'  {company_rename_count} companies normalized')

        # Step 2: Merge duplicate companies
        self.stdout.write('\nMerging duplicate companies...')
        company_merge_count = self.merge_duplicate_companies(dry_run)

        self.stdout.write(f'  {company_merge_count} companies merged')

        # Step 3: Normalize offers
        self.stdout.write('\nNormalizing offers...')
        offer_count = 0

        for offer in Offer.objects.all():
            changed = False
            changes = []

            # Normalize job title
            if offer.position_title:
                new_title = normalize_job_title(offer.position_title)
                if new_title != offer.position_title:
                    changes.append(f'title: {offer.position_title} -> {new_title}')
                    offer.position_title = new_title
                    changed = True

            # Normalize location
            if offer.location:
                new_location = normalize_location(offer.location)
                if new_location != offer.location:
                    changes.append(f'location: {offer.location} -> {new_location}')
                    offer.location = new_location
                    changed = True

            # Normalize visa type
            if offer.visa_type:
                new_visa = normalize_visa_type(offer.visa_type)
                if new_visa != offer.visa_type:
                    changes.append(f'visa: {offer.visa_type} -> {new_visa}')
                    offer.visa_type = new_visa
                    changed = True

            # Normalize experience level
            if offer.experience_level:
                new_level = normalize_experience_level(offer.experience_level)
                if new_level and new_level != offer.experience_level.lower():
                    changes.append(f'level: {offer.experience_level} -> {new_level}')
                    offer.experience_level = new_level
                    changed = True

            if changed:
                offer_count += 1
                if dry_run and len(changes) <= 3:
                    self.stdout.write(f'  Offer {offer.id}: {", ".join(changes)}')

            if not dry_run and changed:
                offer.save()

        self.stdout.write(f'  {offer_count} offers normalized')

        # Step 4: Normalize H1B applications
        self.stdout.write('\nNormalizing H1B applications...')
        app_count = 0

        for app in H1BApplication.objects.all():
            changed = False

            # Normalize employer name
            if app.employer_name:
                new_name = normalize_company_name(app.employer_name)
                if new_name != app.employer_name:
                    app.employer_name = new_name
                    changed = True

            # Normalize job title
            if app.job_title:
                new_title = normalize_job_title(app.job_title)
                if new_title != app.job_title:
                    app.job_title = new_title
                    changed = True

            # Normalize employer city
            if app.employer_city:
                new_city = app.employer_city.title().strip()
                if new_city != app.employer_city:
                    app.employer_city = new_city
                    changed = True

            if changed:
                app_count += 1
                if not dry_run:
                    app.save()

        self.stdout.write(f'  {app_count} H1B applications normalized')

        if dry_run:
            self.stdout.write(self.style.WARNING('\nDRY RUN complete. Run without --dry-run to apply changes.'))
        else:
            self.stdout.write(self.style.SUCCESS('\nNormalization complete!'))

    def merge_duplicate_companies(self, dry_run):
        """Merge companies that have the same normalized name."""
        from django.db.models import Sum, Count

        merged_count = 0

        # Group companies by their normalized name
        company_groups = defaultdict(list)
        for company in Company.objects.all():
            normalized_name = normalize_company_name(company.name)
            company_groups[normalized_name].append(company)

        # Process each group
        for normalized_name, companies in company_groups.items():
            if len(companies) <= 1:
                continue

            # Check if a company with the normalized name already exists (in or outside this group)
            company_ids = [c.id for c in companies]
            existing_in_group = None
            for c in companies:
                if c.name == normalized_name:
                    existing_in_group = c
                    break

            existing_outside = Company.objects.filter(name=normalized_name).exclude(
                id__in=company_ids
            ).first()

            # Determine the target company
            if existing_outside:
                # Merge all companies into the existing one outside the group
                target = existing_outside
                if dry_run:
                    self.stdout.write(f'  Would merge {len(companies)} companies into existing: {normalized_name}')
                else:
                    for company in companies:
                        # Update all related offers
                        Offer.objects.filter(company=company).update(company=target)

                        # Update all related H1B applications
                        H1BApplication.objects.filter(employer=company).update(employer=target)

                        # Aggregate stats to target
                        target.total_h1b_filings = (target.total_h1b_filings or 0) + (company.total_h1b_filings or 0)
                        target.total_h1b_approvals = (target.total_h1b_approvals or 0) + (company.total_h1b_approvals or 0)
                        target.total_h1b_denials = (target.total_h1b_denials or 0) + (company.total_h1b_denials or 0)

                        # Delete the duplicate
                        company.delete()
                        merged_count += 1

                    target.save()
            else:
                # Use the company that already has the normalized name, or the first one
                if existing_in_group:
                    target = existing_in_group
                    needs_rename = False
                else:
                    target = companies[0]
                    needs_rename = target.name != normalized_name

                if dry_run:
                    if needs_rename:
                        self.stdout.write(f'  Would rename: {target.name} -> {normalized_name}')
                    self.stdout.write(f'  Would merge {len(companies) - 1} companies into: {normalized_name}')

                if not dry_run:
                    if needs_rename:
                        target.name = normalized_name
                        target.save()

                    # Merge all other companies into the target
                    for company in companies:
                        if company.id == target.id:
                            continue

                        # Update all related offers
                        Offer.objects.filter(company=company).update(company=target)

                        # Update all related H1B applications
                        H1BApplication.objects.filter(employer=company).update(employer=target)

                        # Aggregate stats to target
                        target.total_h1b_filings = (target.total_h1b_filings or 0) + (company.total_h1b_filings or 0)
                        target.total_h1b_approvals = (target.total_h1b_approvals or 0) + (company.total_h1b_approvals or 0)
                        target.total_h1b_denials = (target.total_h1b_denials or 0) + (company.total_h1b_denials or 0)

                        # Delete the duplicate
                        company.delete()
                        merged_count += 1

                    target.save()

        return merged_count