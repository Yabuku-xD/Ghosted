from django.core.management.base import BaseCommand

from companies.models import Company
from companies.services.jobs import sync_all_company_jobs, sync_company_jobs


class Command(BaseCommand):
    help = 'Backwards-compatible wrapper that syncs Greenhouse jobs through the generic jobs pipeline'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=10, help='Maximum companies to sync')
        parser.add_argument('--company-slug', type=str, help='Sync a specific company slug')

    def handle(self, *args, **options):
        company_slug = options.get('company_slug')
        limit = options['limit']

        if company_slug:
            try:
                company = Company.objects.get(slug=company_slug)
            except Company.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'Company "{company_slug}" not found'))
                return

            synced = sync_company_jobs(company, discover_if_missing=True)
            self.stdout.write(self.style.SUCCESS(f'Synced {synced} jobs for {company.name}'))
            return

        result = sync_all_company_jobs(limit=limit, providers=['greenhouse'])
        self.stdout.write(self.style.SUCCESS(
            f'Synced {result["total_jobs"]} jobs across {result["synced_companies"]} Greenhouse company boards'
        ))
