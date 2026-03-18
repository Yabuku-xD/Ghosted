"""
Import multiple H1B LCA CSV files from a directory.
"""
import fnmatch
import os
import re

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError

from h1b_data.models import H1BApplication


FISCAL_YEAR_PATTERN = re.compile(r'FY(\d{4})', re.IGNORECASE)


class Command(BaseCommand):
    help = 'Import every matching H1B LCA CSV file in a directory'

    def add_arguments(self, parser):
        parser.add_argument('directory', type=str, help='Directory containing H1B CSV files')
        parser.add_argument(
            '--pattern',
            type=str,
            default='LCA_Disclosure_Data_FY*.csv',
            help='Filename glob to match (default: LCA_Disclosure_Data_FY*.csv)',
        )
        parser.add_argument(
            '--recursive',
            action='store_true',
            help='Search subdirectories recursively',
        )
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip existing case numbers while importing each file',
        )
        parser.add_argument(
            '--skip-imported-years',
            action='store_true',
            help='Skip files whose fiscal year is already present in the database',
        )
        parser.add_argument(
            '--start-year',
            type=int,
            help='Only import files at or after this fiscal year',
        )
        parser.add_argument(
            '--end-year',
            type=int,
            help='Only import files at or before this fiscal year',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of records to insert per batch (default: 1000)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='List matching files without importing them',
        )
        parser.add_argument(
            '--recalculate-scores',
            action='store_true',
            help='Recalculate visa-fair scores after all imports finish',
        )

    def handle(self, *args, **options):
        directory = options['directory']
        pattern = options['pattern']
        recursive = options['recursive']
        dry_run = options['dry_run']
        skip_existing = options['skip_existing']
        skip_imported_years = options['skip_imported_years']
        start_year = options.get('start_year')
        end_year = options.get('end_year')
        batch_size = options['batch_size']
        recalculate_scores = options['recalculate_scores']

        if not os.path.isdir(directory):
            raise CommandError(f'Directory not found: {directory}')

        existing_years = set()
        if skip_imported_years:
            existing_years = set(
                H1BApplication.objects.values_list('fiscal_year', flat=True).distinct()
            )

        matching_files = []
        walker = os.walk(directory) if recursive else [(directory, [], os.listdir(directory))]

        for root, _, filenames in walker:
            for filename in filenames:
                if not fnmatch.fnmatch(filename, pattern):
                    continue

                fiscal_year = self.extract_fiscal_year(filename)
                if not fiscal_year:
                    self.stdout.write(self.style.WARNING(f'Skipping {filename}: could not detect fiscal year'))
                    continue

                if start_year and fiscal_year < start_year:
                    continue
                if end_year and fiscal_year > end_year:
                    continue
                if skip_imported_years and fiscal_year in existing_years:
                    self.stdout.write(f'Skipping FY{fiscal_year}: already imported')
                    continue

                matching_files.append((fiscal_year, os.path.join(root, filename)))

            if not recursive:
                break

        matching_files.sort(key=lambda item: item[0])

        if not matching_files:
            raise CommandError('No matching files found for the requested range/pattern.')

        self.stdout.write(self.style.SUCCESS(f'Found {len(matching_files)} file(s) to process:'))
        for fiscal_year, path in matching_files:
            self.stdout.write(f'  FY{fiscal_year}: {path}')

        if dry_run:
            self.stdout.write(self.style.WARNING('Dry run only. No imports were executed.'))
            return

        for fiscal_year, path in matching_files:
            self.stdout.write('')
            self.stdout.write(self.style.SUCCESS(f'Importing FY{fiscal_year} from {path}'))
            call_command(
                'import_h1b_data',
                path,
                fiscal_year=fiscal_year,
                batch_size=batch_size,
                skip_existing=skip_existing,
            )

        if recalculate_scores:
            self.stdout.write('')
            self.stdout.write('Recalculating visa-fair scores...')
            call_command('calculate_scores')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Imported {len(matching_files)} file(s) successfully.'))

    def extract_fiscal_year(self, filename):
        match = FISCAL_YEAR_PATTERN.search(filename)
        if match:
            return int(match.group(1))
        return None
