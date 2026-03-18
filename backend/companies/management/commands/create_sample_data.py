"""
Create sample company and H1B data for testing.
"""
import random
from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from companies.models import Company
from h1b_data.models import H1BApplication


class Command(BaseCommand):
    help = 'Create sample company and H1B data'

    COMPANIES = [
        {'name': 'Google LLC', 'industry': 'tech', 'size': 'enterprise'},
        {'name': 'Microsoft Corporation', 'industry': 'tech', 'size': 'enterprise'},
        {'name': 'Amazon.com Services', 'industry': 'tech', 'size': 'enterprise'},
        {'name': 'Apple Inc.', 'industry': 'tech', 'size': 'enterprise'},
        {'name': 'Meta Platforms', 'industry': 'tech', 'size': 'enterprise'},
        {'name': 'Netflix', 'industry': 'tech', 'size': 'large'},
        {'name': 'Uber Technologies', 'industry': 'tech', 'size': 'large'},
        {'name': 'Airbnb', 'industry': 'tech', 'size': 'mid'},
        {'name': 'Stripe', 'industry': 'fintech', 'size': 'large'},
        {'name': 'Coinbase', 'industry': 'fintech', 'size': 'mid'},
        {'name': 'JPMorgan Chase', 'industry': 'finance', 'size': 'enterprise'},
        {'name': 'Goldman Sachs', 'industry': 'finance', 'size': 'enterprise'},
        {'name': 'McKinsey & Company', 'industry': 'consulting', 'size': 'large'},
        {'name': 'Boston Consulting', 'industry': 'consulting', 'size': 'large'},
        {'name': 'Pfizer', 'industry': 'healthcare', 'size': 'enterprise'},
        {'name': 'Johnson & Johnson', 'industry': 'healthcare', 'size': 'enterprise'},
        {'name': 'Databricks', 'industry': 'ai', 'size': 'large'},
        {'name': 'OpenAI', 'industry': 'ai', 'size': 'mid'},
        {'name': 'Scale AI', 'industry': 'ai', 'size': 'mid'},
        {'name': 'Anthropic', 'industry': 'ai', 'size': 'mid'},
    ]

    JOB_TITLES = [
        'Software Engineer',
        'Senior Software Engineer',
        'Staff Software Engineer',
        'Data Scientist',
        'Machine Learning Engineer',
        'Product Manager',
        'Data Analyst',
        'DevOps Engineer',
        'Site Reliability Engineer',
        'Full Stack Developer',
        'Backend Engineer',
        'Frontend Engineer',
        'Mobile Engineer',
        'Security Engineer',
        'Cloud Architect',
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            '--applications-per-company',
            type=int,
            default=50,
            help='Number of H1B applications to create per company'
        )
        parser.add_argument(
            '--fiscal-years',
            type=int,
            default=5,
            help='Number of fiscal years to generate data for'
        )

    def handle(self, *args, **options):
        apps_per_company = options['applications_per_company']
        num_years = options['fiscal_years']
        
        self.stdout.write('Creating sample data...')
        
        current_year = date.today().year
        fiscal_years = list(range(current_year - num_years + 1, current_year + 1))
        
        created_companies = []
        
        # Create companies
        for company_data in self.COMPANIES:
            company, created = Company.objects.get_or_create(
                name=company_data['name'],
                defaults={
                    'slug': company_data['name'].lower().replace(' ', '-').replace('.', '').replace('&', 'and')[:50],
                    'industry': company_data['industry'],
                    'company_size': company_data['size'],
                    'headquarters': random.choice([
                        'Mountain View, CA',
                        'Seattle, WA',
                        'San Francisco, CA',
                        'New York, NY',
                        'Austin, TX',
                        'Boston, MA',
                    ]),
                    'description': f"Leading {company_data['industry']} company with strong H-1B sponsorship program.",
                }
            )
            created_companies.append(company)
            
            if created:
                self.stdout.write(f'  Created: {company.name}')
            else:
                self.stdout.write(f'  Exists: {company.name}')
        
        # Create H1B applications
        total_created = 0
        
        for company in created_companies:
            for fy in fiscal_years:
                # Determine approval rate based on company tier
                if company.name in ['Google LLC', 'Microsoft Corporation', 'Apple Inc.']:
                    approval_rate = 0.98
                    avg_salary = 180000
                elif company.company_size == 'enterprise':
                    approval_rate = 0.92
                    avg_salary = 150000
                else:
                    approval_rate = 0.85
                    avg_salary = 130000
                
                # Create applications for this fiscal year
                num_apps = random.randint(
                    apps_per_company // 2,
                    apps_per_company
                )
                
                for i in range(num_apps):
                    # Random variation in salary
                    salary = avg_salary + random.randint(-30000, 50000)
                    prevailing = salary * 0.85
                    
                    # Determine status
                    is_approved = random.random() < approval_rate
                    status = 'certified' if is_approved else random.choice([
                        'denied', 'withdrawn', 'certified_withdrawn'
                    ])
                    
                    # Create dates
                    received = date(fy - 1, random.randint(4, 12), random.randint(1, 28))
                    decided = date(fy - 1, random.randint(5, 12), random.randint(1, 28))
                    
                    H1BApplication.objects.create(
                        case_number=f'I-200-{fy}-{random.randint(100000, 999999)}-{i}',
                        case_status=status,
                        received_date=received,
                        decision_date=decided,
                        employer=company,
                        employer_name=company.name,
                        employer_city=company.headquarters.split(',')[0] if company.headquarters else 'Unknown',
                        employer_state=company.headquarters.split(',')[1].strip() if company.headquarters and ',' in company.headquarters else 'CA',
                        job_title=random.choice(self.JOB_TITLES),
                        soc_code=f'15-{random.randint(1100, 1299)}',
                        soc_title='Software Developers, Applications',
                        wage_rate_of_pay_from=Decimal(str(salary)),
                        wage_rate_of_pay_to=None,
                        wage_unit_of_pay='Year',
                        prevailing_wage=Decimal(str(int(prevailing))),
                        visa_class='H-1B',
                        full_time_position=True,
                        fiscal_year=fy
                    )
                    total_created += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCreated {len(created_companies)} companies'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Created {total_created} H1B applications across {len(fiscal_years)} fiscal years'
        ))
        
        self.stdout.write('\nNow run: python manage.py calculate_scores')
