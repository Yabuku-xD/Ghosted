import json
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.core.management.base import BaseCommand
from django.utils import timezone

from companies.models import Company, JobPosting


GREENHOUSE_BOARD_TOKENS = {
    'openai': 'openai',
    'anthropic': 'anthropic',
    'vercel': 'vercel',
    'datadog': 'datadog',
    'figma': 'figma',
    'cloudflare': 'cloudflare',
    'databricks': 'databricks',
    'snowflake': 'snowflake',
    'stripe': 'stripe',
}


def parse_timestamp(value):
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return None


def infer_remote_policy(location_name, title):
    combined = ' '.join(filter(None, [location_name, title])).lower()
    if 'remote' in combined:
        return 'remote'
    if 'hybrid' in combined:
        return 'hybrid'
    if location_name:
        return 'onsite'
    return 'unknown'


def extract_employment_type(metadata):
    if isinstance(metadata, dict):
        value = metadata.get('employment_type')
        return (value or '')[:50]

    if isinstance(metadata, list):
        for item in metadata:
            if not isinstance(item, dict):
                continue
            name = str(item.get('name', '')).lower()
            if name in {'employment type', 'employment_type'}:
                return str(item.get('value', '') or '')[:50]

    return ''


class Command(BaseCommand):
    help = 'Import live public Greenhouse jobs for known companies'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=10, help='Maximum board tokens to fetch')
        parser.add_argument('--board-token', type=str, help='Fetch a specific Greenhouse board token')
        parser.add_argument('--company-slug', type=str, help='Company slug for a specific board token')

    def handle(self, *args, **options):
        limit = options['limit']
        board_token = options.get('board_token')
        company_slug = options.get('company_slug')

        if board_token and not company_slug:
            self.stderr.write('When using --board-token you must also provide --company-slug')
            return

        board_map = (
            {company_slug: board_token}
            if board_token and company_slug
            else dict(list(GREENHOUSE_BOARD_TOKENS.items())[:limit])
        )

        imported_jobs = 0
        updated_companies = 0

        for slug, token in board_map.items():
            try:
                company = Company.objects.get(slug=slug)
            except Company.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Skipping {slug}: company not found'))
                continue

            endpoint = f'https://boards-api.greenhouse.io/v1/boards/{token}/jobs?{urlencode({"content": "true"})}'

            try:
                with urlopen(endpoint, timeout=20) as response:
                    payload = json.loads(response.read().decode('utf-8'))
            except (HTTPError, URLError, TimeoutError) as exc:
                self.stdout.write(self.style.WARNING(f'Skipping {slug}: {exc}'))
                continue

            jobs = payload.get('jobs', [])
            active_external_ids = []

            for job in jobs:
                external_job_id = str(job.get('id'))
                active_external_ids.append(external_job_id)
                location = (job.get('location') or {}).get('name', '')

                defaults = {
                    'title': job.get('title', '')[:200],
                    'team': ', '.join(
                        department.get('name', '')
                        for department in job.get('departments', [])
                        if department.get('name')
                    )[:120],
                    'location': location[:150],
                    'remote_policy': infer_remote_policy(location, job.get('title', '')),
                    'employment_type': extract_employment_type(job.get('metadata')),
                    'url': job.get('absolute_url') or company.careers_url or company.website or 'https://boards.greenhouse.io/',
                    'source': 'greenhouse',
                    'source_board': token,
                    'description': (job.get('content') or '')[:10000],
                    'posted_at': parse_timestamp(job.get('updated_at')),
                    'visa_sponsorship_signal': (
                        'historically_sponsors' if company.total_h1b_filings > 0 else 'unknown'
                    ),
                    'is_active': True,
                }

                JobPosting.objects.update_or_create(
                    company=company,
                    source='greenhouse',
                    external_job_id=external_job_id,
                    defaults=defaults,
                )
                imported_jobs += 1

            JobPosting.objects.filter(
                company=company,
                source='greenhouse',
                source_board=token,
            ).exclude(external_job_id__in=active_external_ids).update(
                is_active=False,
                last_seen_at=timezone.now(),
            )

            if jobs:
                company.careers_url = company.careers_url or f'https://boards.greenhouse.io/{token}'
                company.save(update_fields=['careers_url'])
                updated_companies += 1

        self.stdout.write(self.style.SUCCESS(f'Imported or refreshed {imported_jobs} job posting records'))
        self.stdout.write(self.style.SUCCESS(f'Updated careers URLs for {updated_companies} companies'))
