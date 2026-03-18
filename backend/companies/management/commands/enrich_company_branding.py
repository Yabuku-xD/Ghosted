from django.core.management.base import BaseCommand
from django.utils import timezone

from companies.models import Company
from companies.services.branding import extract_domain, infer_domain_from_name


class Command(BaseCommand):
    help = 'Backfill company domains and logo metadata for frontend logo rendering'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=5000, help='Maximum companies to process')
        parser.add_argument('--overwrite', action='store_true', help='Replace existing domain metadata')

    def handle(self, *args, **options):
        limit = options['limit']
        overwrite = options['overwrite']
        updated = 0

        companies = Company.objects.order_by('-total_h1b_filings', 'name')[:limit]

        for company in companies:
            current_domain = company.company_domain or extract_domain(company.website)
            inferred_domain = current_domain or infer_domain_from_name(company.name)

            updates = []
            now = timezone.now()

            if inferred_domain and (overwrite or not company.company_domain):
                company.company_domain = inferred_domain
                updates.append('company_domain')

                if current_domain:
                    company.domain_source = 'website'
                    company.domain_confidence = 'high'
                else:
                    company.domain_source = 'alias_map'
                    company.domain_confidence = 'good'

                updates.extend(['domain_source', 'domain_confidence'])

                if not company.website:
                    company.website = f'https://www.{inferred_domain}'
                    updates.append('website')

            if (company.company_domain or company.logo_url) and (overwrite or not company.logo_provider):
                company.logo_provider = 'logo.dev'
                company.logo_confidence = company.domain_confidence or 'emerging'
                company.logo_last_checked_at = now
                updates.extend(['logo_provider', 'logo_confidence', 'logo_last_checked_at'])

            if updates:
                company.save(update_fields=sorted(set(updates)))
                updated += 1

        domain_count = Company.objects.exclude(company_domain='').count()
        logo_ready_count = Company.objects.exclude(company_domain='').count() + Company.objects.exclude(logo_url='').count()

        self.stdout.write(self.style.SUCCESS(f'Updated {updated} companies'))
        self.stdout.write(f'Companies with domains: {domain_count}')
        self.stdout.write(f'Companies ready for logo rendering: {logo_ready_count}')
