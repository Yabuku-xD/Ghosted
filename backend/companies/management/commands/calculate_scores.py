"""
Calculate visa-fair scores for companies.
"""
from django.core.management.base import BaseCommand
from companies.services.scoring import score_all_companies, CompanyScorer
from companies.models import Company


class Command(BaseCommand):
    help = 'Calculate visa-fair scores for companies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--company-id',
            type=int,
            help='Calculate score for a specific company'
        )
        parser.add_argument(
            '--lookback-years',
            type=int,
            default=5,
            help='Number of years to look back (default: 5)'
        )

    def handle(self, *args, **options):
        lookback_years = options['lookback_years']
        company_id = options.get('company_id')
        
        if company_id:
            # Score single company
            try:
                company = Company.objects.get(id=company_id)
                scorer = CompanyScorer(lookback_years)
                result = scorer.calculate_score(company)
                
                self.stdout.write(self.style.SUCCESS(
                    f'\nScore for {company.name}:'
                ))
                self.stdout.write(f'  Overall Score: {result["visa_fair_score"]}/10')
                self.stdout.write('\n  Component Breakdown:')
                for name, data in result['components'].items():
                    self.stdout.write(
                        f'    {name.replace("_", " ").title()}: '
                        f'{data["score"]}/10 (weight: {data["weight"]*100:.0f}%)'
                    )
                
                scorer.update_company_score(company, save=True)
                self.stdout.write(self.style.SUCCESS('\nSaved to database.'))
                
            except Company.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Company with id {company_id} not found')
                )
        else:
            # Score all companies
            self.stdout.write(
                f'Calculating scores for all companies (lookback: {lookback_years} years)...'
            )
            
            stats = score_all_companies(lookback_years)
            
            self.stdout.write(self.style.SUCCESS('\nComplete!'))
            self.stdout.write(f'  Total companies: {stats["total"]}')
            self.stdout.write(f'  Updated: {stats["updated"]}')
            if stats['failed'] > 0:
                self.stdout.write(
                    self.style.WARNING(f'  Failed: {stats["failed"]}')
                )
