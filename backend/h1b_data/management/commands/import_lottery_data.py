"""
Import H1B lottery statistics from CSV.
Data source: USCIS and historical records.
"""
import csv
from django.core.management.base import BaseCommand, CommandError
from h1b_data.models import LotteryYear


class Command(BaseCommand):
    help = 'Import H1B lottery statistics'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        
        records_created = 0
        records_updated = 0
        
        with open(csv_file, 'r') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                fiscal_year = int(row['fiscal_year'])
                
                defaults = {
                    'total_registrations': int(row.get('total_registrations', 0)),
                    'selected_registrations': int(row.get('selected_registrations', 0)),
                    'regular_cap_registrations': int(row.get('regular_cap_registrations', 0) or 0),
                    'regular_cap_selected': int(row.get('regular_cap_selected', 0) or 0),
                    'masters_cap_registrations': int(row.get('masters_cap_registrations', 0) or 0),
                    'masters_cap_selected': int(row.get('masters_cap_selected', 0) or 0),
                    'overall_selection_rate': float(row.get('overall_selection_rate', 0)),
                    'regular_cap_selection_rate': float(row.get('regular_cap_selection_rate', 0) or 0) or None,
                    'masters_cap_selection_rate': float(row.get('masters_cap_selection_rate', 0) or 0) or None,
                    'country_stats': row.get('country_stats', '{}'),
                    'notes': row.get('notes', ''),
                }
                
                obj, created = LotteryYear.objects.update_or_create(
                    fiscal_year=fiscal_year,
                    defaults=defaults
                )
                
                if created:
                    records_created += 1
                else:
                    records_updated += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'Imported {records_created} new, updated {records_updated} lottery records'
        ))
