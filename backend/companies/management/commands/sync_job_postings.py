from django.core.management.base import BaseCommand

from companies.services.jobs import bootstrap_job_sources, deactivate_stale_jobs, sync_all_company_jobs


class Command(BaseCommand):
    help = 'Discover, sync, and prune public job-board data across supported ATS providers'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=250, help='Maximum companies to process')
        parser.add_argument(
            '--providers',
            nargs='*',
            help='Optional subset of providers to sync (greenhouse lever ashby)',
        )
        parser.add_argument(
            '--skip-discovery',
            action='store_true',
            help='Skip provider/token discovery before syncing',
        )
        parser.add_argument(
            '--stale-days',
            type=int,
            default=3,
            help='Deactivate active jobs unseen for at least this many days',
        )

    def handle(self, *args, **options):
        limit = options['limit']
        providers = options.get('providers')
        skip_discovery = options['skip_discovery']
        stale_days = options['stale_days']

        if not skip_discovery:
            discovered = bootstrap_job_sources(limit=limit, probe_network=True)
            self.stdout.write(self.style.SUCCESS(f'Discovered or confirmed {discovered} job sources'))

        result = sync_all_company_jobs(limit=limit, providers=providers)
        self.stdout.write(self.style.SUCCESS(
            f'Synced {result["total_jobs"]} jobs across {result["synced_companies"]} companies'
        ))
        if result['errors']:
            self.stdout.write(self.style.WARNING(f'Encountered {result["errors"]} sync errors'))

        stale = deactivate_stale_jobs(days=stale_days)
        self.stdout.write(self.style.SUCCESS(f'Deactivated {stale} stale jobs'))
