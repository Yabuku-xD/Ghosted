"""
Create sample H1B lottery statistics for testing.
"""
from django.core.management.base import BaseCommand
from h1b_data.models import LotteryYear, CountryCapStatus


class Command(BaseCommand):
    help = 'Create sample H1B lottery statistics'

    LOTTERY_DATA = [
        {
            'fiscal_year': 2026,
            'total_registrations': 450000,
            'selected_registrations': 110000,
            'regular_cap_registrations': 350000,
            'regular_cap_selected': 85000,
            'masters_cap_registrations': 100000,
            'masters_cap_selected': 25000,
        },
        {
            'fiscal_year': 2025,
            'total_registrations': 470000,
            'selected_registrations': 120000,
            'regular_cap_registrations': 370000,
            'regular_cap_selected': 95000,
            'masters_cap_registrations': 100000,
            'masters_cap_selected': 25000,
        },
        {
            'fiscal_year': 2024,
            'total_registrations': 780000,
            'selected_registrations': 188000,
            'regular_cap_registrations': 600000,
            'regular_cap_selected': 144000,
            'masters_cap_registrations': 180000,
            'masters_cap_selected': 44000,
        },
        {
            'fiscal_year': 2023,
            'total_registrations': 483000,
            'selected_registrations': 127000,
            'regular_cap_registrations': 370000,
            'regular_cap_selected': 97000,
            'masters_cap_registrations': 113000,
            'masters_cap_selected': 30000,
        },
        {
            'fiscal_year': 2022,
            'total_registrations': 308000,
            'selected_registrations': 131000,
            'regular_cap_registrations': 235000,
            'regular_cap_selected': 100000,
            'masters_cap_registrations': 73000,
            'masters_cap_selected': 31000,
        },
    ]

    COUNTRY_DATA = [
        # FY2026
        {'country': 'india', 'fiscal_year': 2026, 'total': 280000, 'approved': 68000, 'denied': 2000},
        {'country': 'china', 'fiscal_year': 2026, 'total': 95000, 'approved': 23000, 'denied': 800},
        {'country': 'canada', 'fiscal_year': 2026, 'total': 15000, 'approved': 4500, 'denied': 100},
        {'country': 'mexico', 'fiscal_year': 2026, 'total': 8000, 'approved': 2500, 'denied': 50},
        {'country': 'other', 'fiscal_year': 2026, 'total': 52000, 'approved': 12000, 'denied': 300},
        # FY2025
        {'country': 'india', 'fiscal_year': 2025, 'total': 295000, 'approved': 75000, 'denied': 2500},
        {'country': 'china', 'fiscal_year': 2025, 'total': 98000, 'approved': 25000, 'denied': 900},
        {'country': 'canada', 'fiscal_year': 2025, 'total': 16000, 'approved': 5000, 'denied': 120},
        {'country': 'other', 'fiscal_year': 2025, 'total': 61000, 'approved': 15000, 'denied': 400},
        # FY2024
        {'country': 'india', 'fiscal_year': 2024, 'total': 480000, 'approved': 115000, 'denied': 5000},
        {'country': 'china', 'fiscal_year': 2024, 'total': 165000, 'approved': 39000, 'denied': 1800},
        {'country': 'other', 'fiscal_year': 2024, 'total': 135000, 'approved': 34000, 'denied': 1200},
    ]

    def handle(self, *args, **options):
        self.stdout.write('Creating lottery statistics...')
        
        # Create lottery year data
        for data in self.LOTTERY_DATA:
            total = data['total_registrations']
            selected = data['selected_registrations']
            regular_rate = (data['regular_cap_selected'] / data['regular_cap_registrations'] * 100) if data['regular_cap_registrations'] else 0
            masters_rate = (data['masters_cap_selected'] / data['masters_cap_registrations'] * 100) if data['masters_cap_registrations'] else 0
            
            LotteryYear.objects.update_or_create(
                fiscal_year=data['fiscal_year'],
                defaults={
                    'total_registrations': total,
                    'selected_registrations': selected,
                    'regular_cap_registrations': data['regular_cap_registrations'],
                    'regular_cap_selected': data['regular_cap_selected'],
                    'masters_cap_registrations': data['masters_cap_registrations'],
                    'masters_cap_selected': data['masters_cap_selected'],
                    'overall_selection_rate': (selected / total) * 100,
                    'regular_cap_selection_rate': regular_rate,
                    'masters_cap_selection_rate': masters_rate,
                }
            )
            self.stdout.write(f'  FY{data["fiscal_year"]}: {total:,} registrations, {(selected/total)*100:.1f}% selection rate')
        
        # Create country cap status data
        for data in self.COUNTRY_DATA:
            CountryCapStatus.objects.update_or_create(
                country=data['country'],
                fiscal_year=data['fiscal_year'],
                defaults={
                    'total_applications': data['total'],
                    'approved': data['approved'],
                    'denied': data['denied'],
                    'pending': 0,
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'\nCreated {len(self.LOTTERY_DATA)} lottery year records'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(self.COUNTRY_DATA)} country cap status records'))
