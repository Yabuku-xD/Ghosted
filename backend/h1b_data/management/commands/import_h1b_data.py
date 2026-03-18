"""
Import H1B LCA data from CSV files.
Data source: https://www.dol.gov/agencies/eta/foreign-labor/performance
"""
import csv
import os
import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Min, Max
from companies.models import Company
from h1b_data.models import H1BApplication

COMPANY_NAME_ALIASES = {
    'GOOGLE LLC': 'Google',
    'GOOGLE PUBLIC SECTOR LLC': 'Google',
    'AMAZON.COM SERVICES LLC': 'Amazon',
    'AMAZON DATA SERVICES, INC.': 'Amazon',
    'AMAZON DEVELOPMENT CENTER U.S., INC.': 'Amazon',
    'MICROSOFT CORPORATION': 'Microsoft',
    'META PLATFORMS, INC.': 'Meta',
    'FACEBOOK, INC.': 'Meta',
    'APPLE INC.': 'Apple',
    'NVIDIA CORPORATION': 'NVIDIA',
    'SALESFORCE, INC.': 'Salesforce',
    'ORACLE AMERICA, INC.': 'Oracle',
    'INTERNATIONAL BUSINESS MACHINES CORPORATION': 'IBM',
    'TATA CONSULTANCY SERVICES LIMITED': 'Tata Consultancy Services',
    'INFOSYS LIMITED': 'Infosys',
    'WIPRO LIMITED': 'Wipro',
    'COGNIZANT TECHNOLOGY SOLUTIONS U.S. CORPORATION': 'Cognizant',
    'ACCENTURE LLP': 'Accenture',
    'DELOITTE CONSULTING LLP': 'Deloitte',
    'PRICEWATERHOUSECOOPERS LLP': 'PwC',
    'ERNST & YOUNG U.S. LLP': 'Ernst & Young',
    'JPMORGAN CHASE & CO.': 'JPMorgan Chase',
}

COMPANY_STOP_WORDS = {
    'THE', 'A', 'AN', 'AND', 'OF',
    'LLC', 'INC', 'INCORPORATED', 'CORP', 'CORPORATION', 'CO', 'COMPANY',
    'LTD', 'LIMITED', 'LLP', 'LP', 'PLC',
}


class Command(BaseCommand):
    help = 'Import H1B LCA data from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')
        parser.add_argument(
            '--fiscal-year',
            type=int,
            help='Override fiscal year (auto-detected from filename if not provided)'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of records to insert per batch (default: 1000)'
        )
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip records that already exist'
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        batch_size = options['batch_size']
        skip_existing = options['skip_existing']
        
        if not os.path.exists(csv_file):
            raise CommandError(f'File not found: {csv_file}')
        
        # Determine fiscal year
        fiscal_year = options.get('fiscal_year')
        if not fiscal_year:
            # Try to extract from filename (e.g., LCA_Disclosure_Data_FY2024.csv)
            filename = os.path.basename(csv_file)
            if 'FY' in filename:
                try:
                    fy_start = filename.index('FY') + 2
                    fiscal_year = int(filename[fy_start:fy_start+4])
                except (ValueError, IndexError):
                    pass
        
        if not fiscal_year:
            raise CommandError(
                'Could not determine fiscal year from filename. '
                'Please provide --fiscal-year option.'
            )
        
        self.stdout.write(f'Importing H1B data for FY{fiscal_year}...')
        self.stdout.write(f'File: {csv_file}')
        
        records_created = 0
        records_skipped = 0
        records_failed = 0
        
        # Track companies by a normalized lookup key so new imports merge cleanly.
        company_cache = self.build_company_cache()
        existing_case_numbers = set()
        
        if skip_existing:
            existing_case_numbers = set(
                H1BApplication.objects.filter(fiscal_year=fiscal_year)
                .values_list('case_number', flat=True)
            )
            self.stdout.write(f'Found {len(existing_case_numbers)} existing records')
        
        batch = []
        
        with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Map CSV columns to model fields
                    case_number = row.get('CASE_NUMBER', '').strip()
                    
                    if not case_number:
                        continue
                    
                    if skip_existing and case_number in existing_case_numbers:
                        records_skipped += 1
                        continue
                    
                    # Parse dates
                    received_date = self.parse_date(row.get('RECEIVED_DATE', ''))
                    decision_date = self.parse_date(row.get('DECISION_DATE', ''))
                    
                    # Parse wage
                    wage_from = self.parse_wage(row.get('WAGE_RATE_OF_PAY_FROM', ''))
                    wage_to = self.parse_wage(row.get('WAGE_RATE_OF_PAY_TO', ''))
                    prevailing_wage = self.parse_wage(row.get('PREVAILING_WAGE', ''))
                    
                    # Employer info
                    employer_name = row.get('EMPLOYER_NAME', '').strip()
                    employer_city = row.get('EMPLOYER_CITY', '').strip()
                    employer_state = row.get('EMPLOYER_STATE', '').strip()
                    
                    # Get or create company
                    company = self.get_company(employer_name, company_cache)
                    
                    application = H1BApplication(
                        case_number=case_number,
                        case_status=row.get('CASE_STATUS', '').strip().lower().replace(' ', '_'),
                        received_date=received_date,
                        decision_date=decision_date,
                        employer=company,
                        employer_name=employer_name,
                        employer_city=employer_city,
                        employer_state=employer_state,
                        job_title=row.get('JOB_TITLE', '').strip()[:200],
                        soc_code=row.get('SOC_CODE', '').strip()[:20],
                        soc_title=row.get('SOC_TITLE', '').strip()[:200],
                        wage_rate_of_pay_from=wage_from,
                        wage_rate_of_pay_to=wage_to,
                        wage_unit_of_pay=row.get('WAGE_UNIT_OF_PAY', '').strip()[:10],
                        prevailing_wage=prevailing_wage,
                        visa_class=row.get('VISA_CLASS', 'H-1B').strip(),
                        full_time_position=row.get('FULL_TIME_POSITION', 'Y').upper() == 'Y',
                        fiscal_year=fiscal_year
                    )
                    
                    batch.append(application)
                    
                    if len(batch) >= batch_size:
                        records_created += self.save_batch(batch)
                        batch = []
                        self.stdout.write(f'  Processed {records_created} records...')
                
                except Exception as e:
                    records_failed += 1
                    if records_failed <= 10:  # Only show first 10 errors
                        self.stdout.write(
                            self.style.WARNING(f'Row {row_num}: {str(e)}')
                        )
        
        # Save remaining batch
        if batch:
            records_created += self.save_batch(batch)
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Import complete!'))
        self.stdout.write(f'  Created: {records_created}')
        self.stdout.write(f'  Skipped: {records_skipped}')
        self.stdout.write(f'  Failed:  {records_failed}')
        
        # Update company statistics
        self.stdout.write('')
        self.stdout.write('Updating company statistics...')
        self.update_company_stats(fiscal_year)
        self.stdout.write(self.style.SUCCESS('Done!'))
    
    def parse_date(self, date_str):
        """Parse date from various formats"""
        if not date_str:
            return None
        
        formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d-%m-%Y',
            '%m/%y/%d',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt).date()
            except ValueError:
                continue
        
        return None
    
    def parse_wage(self, wage_str):
        """Parse wage string to Decimal"""
        if not wage_str:
            return Decimal('0')
        
        # Remove currency symbols and commas
        cleaned = wage_str.replace('$', '').replace(',', '').strip()
        
        try:
            return Decimal(cleaned)
        except InvalidOperation:
            return Decimal('0')
    
    def get_company(self, employer_name, cache):
        """Get company from cache or create new"""
        if not employer_name:
            return None

        display_name = self.normalize_company_name(employer_name)
        lookup_key = self.company_lookup_key(display_name)

        if lookup_key in cache:
            return cache[lookup_key]

        existing_company = Company.objects.filter(name__iexact=display_name).first()
        if existing_company:
            cache[lookup_key] = existing_company
            return existing_company

        company = Company.objects.create(
            name=display_name,
            slug=self.build_unique_slug(display_name),
        )
        cache[lookup_key] = company
        return company

    def build_company_cache(self):
        cache = {}
        for company in Company.objects.only('id', 'name', 'slug'):
            cache.setdefault(self.company_lookup_key(company.name), company)
        return cache

    def normalize_company_name(self, name):
        normalized = re.sub(r'[\r\n\t]+', ' ', name or '').strip().rstrip('.,')
        normalized = re.sub(r'\s+', ' ', normalized)
        alias = COMPANY_NAME_ALIASES.get(normalized.upper())
        if alias:
            return alias

        words = normalized.split()
        cleaned_words = []
        for word in words:
            upper_word = word.upper().strip('.,')
            if upper_word in {'LLC', 'INC', 'LTD', 'LLP'}:
                cleaned_words.append(upper_word)
            elif len(upper_word) <= 2:
                cleaned_words.append(upper_word)
            else:
                cleaned_words.append(word.title())
        return ' '.join(cleaned_words)

    def company_lookup_key(self, name):
        normalized = re.sub(r'[^A-Z0-9]+', ' ', (name or '').upper()).strip()
        tokens = [token for token in normalized.split() if token not in COMPANY_STOP_WORDS]
        if tokens:
            return ' '.join(tokens)
        return normalized

    def build_unique_slug(self, name):
        base_slug = self.slugify(name) or 'company'
        slug = base_slug
        suffix = 2
        while Company.objects.filter(slug=slug).exists():
            slug = f'{base_slug[:180]}-{suffix}'
            suffix += 1
        return slug

    def slugify(self, name):
        """Simple slugify for company names"""
        slug = re.sub(r'[^\w\s-]', '', name).strip().lower()
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug[:200]
    
    def save_batch(self, batch):
        """Save batch of applications, handling duplicates"""
        try:
            with transaction.atomic():
                H1BApplication.objects.bulk_create(
                    batch,
                    ignore_conflicts=True
                )
            return len(batch)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Batch save failed: {e}'))
            # Fall back to individual saves
            count = 0
            for app in batch:
                try:
                    app.save()
                    count += 1
                except Exception:
                    pass
            return count
    
    def update_company_stats(self, fiscal_year):
        """Update company statistics based on H1B data"""
        from django.db.models import Count, Q
        
        companies = Company.objects.filter(
            h1b_applications__fiscal_year=fiscal_year
        ).distinct()
        
        for company in companies:
            stats = company.h1b_applications.aggregate(
                total=Count('id'),
                approved=Count('id', filter=Q(case_status='certified')),
                denied=Count('id', filter=Q(case_status='denied'))
            )
            
            company.total_h1b_filings = stats['total']
            company.total_h1b_approvals = stats['approved']
            company.total_h1b_denials = stats['denied']
            
            # Calculate approval rate
            total_decided = stats['approved'] + stats['denied']
            if total_decided > 0:
                company.h1b_approval_rate = (
                    stats['approved'] / total_decided
                ) * 100
            
            # Update year range
            years = company.h1b_applications.aggregate(
                min_year=Min('fiscal_year'),
                max_year=Max('fiscal_year')
            )
            company.first_filing_year = years['min_year']
            company.last_filing_year = years['max_year']
            
            company.save()
