from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.db import transaction
from django.utils import timezone

from companies.models import Company, JobPosting

USER_AGENT = 'Ghosted Jobs Sync/1.0'

KNOWN_JOB_BOARD_HINTS = {
    'anthropic': ('greenhouse', 'anthropic'),
    'vercel': ('greenhouse', 'vercel'),
    'datadog': ('greenhouse', 'datadog'),
    'figma': ('greenhouse', 'figma'),
    'cloudflare': ('greenhouse', 'cloudflare'),
    'databricks': ('greenhouse', 'databricks'),
    'snowflake': ('greenhouse', 'snowflake'),
    'stripe': ('greenhouse', 'stripe'),
}


def strip_html(value: str, limit: int = 10000) -> str:
    if not value:
        return ''
    cleaned = re.sub(r'<[^>]+>', ' ', value)
    cleaned = html.unescape(cleaned)
    return re.sub(r'\s+', ' ', cleaned).strip()[:limit]


def parse_datetime_value(value) -> datetime | None:
    if not value:
        return None

    if isinstance(value, (int, float)):
        timestamp = float(value)
        if timestamp > 10_000_000_000:
            timestamp /= 1000
        return datetime.fromtimestamp(timestamp, tz=timezone.utc)

    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            return None

    return None


def infer_remote_policy(*parts: str) -> str:
    combined = ' '.join(filter(None, parts)).lower()
    if 'remote' in combined:
        return 'remote'
    if 'hybrid' in combined:
        return 'hybrid'
    if combined.strip():
        return 'onsite'
    return 'unknown'


def fetch_json(url: str, timeout: int = 20):
    request = Request(
        url,
        headers={
            'User-Agent': USER_AGENT,
            'Accept': 'application/json',
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))


def extract_greenhouse_metadata(metadata, keys: Iterable[str]) -> str:
    if isinstance(metadata, dict):
        for key in keys:
            value = metadata.get(key)
            if value:
                return str(value)[:50]
        return ''

    normalized_keys = {key.lower() for key in keys}
    if isinstance(metadata, list):
        for item in metadata:
            if not isinstance(item, dict):
                continue
            name = str(item.get('name', '')).strip().lower()
            if name in normalized_keys:
                return str(item.get('value', '') or '')[:50]
    return ''


def extract_greenhouse_salary(job: dict) -> tuple[int | None, int | None, str]:
    ranges = job.get('pay_input_ranges') or []
    for item in ranges:
        if not isinstance(item, dict):
            continue
        currency = str(item.get('currency_type') or item.get('currencyCode') or 'USD')
        minimum = item.get('min_cents') or item.get('min')
        maximum = item.get('max_cents') or item.get('max')
        if minimum is not None and maximum is not None:
            divisor = 100 if item.get('min_cents') is not None or item.get('max_cents') is not None else 1
            return int(minimum) // divisor, int(maximum) // divisor, currency[:10]
    return None, None, 'USD'


def extract_lever_salary(job: dict) -> tuple[int | None, int | None, str]:
    salary_range = job.get('salaryRange') or {}
    if not isinstance(salary_range, dict):
        return None, None, 'USD'
    minimum = salary_range.get('min')
    maximum = salary_range.get('max')
    currency = salary_range.get('currency') or 'USD'
    if minimum is None and maximum is None:
        return None, None, currency[:10]
    return (
        int(minimum) if minimum is not None else None,
        int(maximum) if maximum is not None else None,
        str(currency)[:10],
    )


def sponsorship_signal_for_company(company: Company) -> str:
    if (company.total_h1b_filings or 0) >= 25:
        return 'historically_sponsors'
    if float(company.visa_fair_score or 0) >= 60:
        return 'likely'
    return 'unknown'


def board_token_candidates(company: Company) -> list[str]:
    candidates = []
    if company.jobs_board_token:
        candidates.append(company.jobs_board_token)
    if company.slug:
        candidates.append(company.slug)
        candidates.append(company.slug.replace('-', ''))
    if company.company_domain:
        primary = company.company_domain.split('.')[0]
        if len(primary) >= 5:
            candidates.append(primary)
            candidates.append(primary.replace('-', ''))

    seen = set()
    normalized = []
    for candidate in candidates:
        value = (candidate or '').strip().lower()
        if value and value not in seen:
            normalized.append(value)
            seen.add(value)
    return normalized[:4]


def infer_board_from_url(url: str) -> tuple[str, str] | None:
    if not url:
        return None

    patterns = [
        ('greenhouse', r'(?:job-boards|boards)\.greenhouse\.io/([^/?#]+)'),
        ('lever', r'jobs\.lever\.co/([^/?#]+)'),
        ('ashby', r'jobs\.ashbyhq\.com/([^/?#]+)'),
    ]

    for provider, pattern in patterns:
        match = re.search(pattern, url, flags=re.IGNORECASE)
        if match:
            return provider, match.group(1).strip().lower()
    return None


@dataclass
class NormalizedJob:
    external_job_id: str
    title: str
    team: str
    location: str
    remote_policy: str
    employment_type: str
    url: str
    source: str
    source_board: str
    description: str
    salary_min: int | None
    salary_max: int | None
    currency: str
    posted_at: datetime | None


class BaseAdapter:
    provider = ''

    def jobs_url(self, token: str) -> str:
        raise NotImplementedError

    def board_url(self, token: str) -> str:
        raise NotImplementedError

    def fetch_jobs(self, token: str) -> list[NormalizedJob]:
        raise NotImplementedError


class GreenhouseAdapter(BaseAdapter):
    provider = 'greenhouse'

    def jobs_url(self, token: str) -> str:
        return f'https://boards-api.greenhouse.io/v1/boards/{token}/jobs?{urlencode({"content": "true"})}'

    def board_url(self, token: str) -> str:
        return f'https://job-boards.greenhouse.io/{token}'

    def fetch_jobs(self, token: str) -> list[NormalizedJob]:
        payload = fetch_json(self.jobs_url(token))
        jobs = []
        for job in payload.get('jobs', []):
            location = (job.get('location') or {}).get('name', '')
            salary_min, salary_max, currency = extract_greenhouse_salary(job)
            jobs.append(
                NormalizedJob(
                    external_job_id=str(job.get('id')),
                    title=str(job.get('title', ''))[:200],
                    team=', '.join(
                        department.get('name', '')
                        for department in job.get('departments', [])
                        if department.get('name')
                    )[:120],
                    location=location[:150],
                    remote_policy=infer_remote_policy(location, job.get('title', '')),
                    employment_type=extract_greenhouse_metadata(
                        job.get('metadata'),
                        ['employment type', 'employment_type'],
                    ),
                    url=job.get('absolute_url') or self.board_url(token),
                    source=self.provider,
                    source_board=token,
                    description=strip_html(job.get('content', '')),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    currency=currency,
                    posted_at=parse_datetime_value(job.get('updated_at') or job.get('first_published')),
                )
            )
        return jobs


class LeverAdapter(BaseAdapter):
    provider = 'lever'

    def jobs_url(self, token: str) -> str:
        return f'https://api.lever.co/v0/postings/{token}?mode=json'

    def board_url(self, token: str) -> str:
        return f'https://jobs.lever.co/{token}'

    def fetch_jobs(self, token: str) -> list[NormalizedJob]:
        payload = fetch_json(self.jobs_url(token))
        jobs = []
        for job in payload:
            categories = job.get('categories') or {}
            location = (
                categories.get('location')
                or ', '.join(job.get('workplaceType') or [])
                or ''
            )
            salary_min, salary_max, currency = extract_lever_salary(job)
            jobs.append(
                NormalizedJob(
                    external_job_id=str(job.get('id')),
                    title=str(job.get('text', ''))[:200],
                    team=str(categories.get('team') or categories.get('department') or '')[:120],
                    location=str(location)[:150],
                    remote_policy=infer_remote_policy(str(location), str(job.get('text', ''))),
                    employment_type=str(categories.get('commitment') or '')[:50],
                    url=job.get('hostedUrl') or job.get('applyUrl') or self.board_url(token),
                    source=self.provider,
                    source_board=token,
                    description=strip_html(job.get('descriptionPlain') or job.get('description') or ''),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    currency=currency,
                    posted_at=parse_datetime_value(job.get('createdAt')),
                )
            )
        return jobs


ADAPTERS = {
    'greenhouse': GreenhouseAdapter(),
    'lever': LeverAdapter(),
}


def discover_job_source_for_company(company: Company, probe_network: bool = True) -> tuple[str, str] | None:
    if company.jobs_provider and company.jobs_board_token:
        return company.jobs_provider, company.jobs_board_token

    known_hint = KNOWN_JOB_BOARD_HINTS.get(company.slug)
    if known_hint:
        return known_hint

    for url in [company.careers_url, company.website]:
        inferred = infer_board_from_url(url)
        if inferred:
            return inferred

    if not probe_network:
        return None

    for token in board_token_candidates(company):
        if len(token) < 5:
            continue
        for provider, adapter in ADAPTERS.items():
            try:
                payload = fetch_json(adapter.jobs_url(token), timeout=8)
            except (HTTPError, URLError, TimeoutError, ValueError):
                continue

            if provider == 'greenhouse' and isinstance(payload, dict) and payload.get('jobs'):
                return provider, token
            if provider == 'lever' and isinstance(payload, list) and payload:
                return provider, token

    return None


def bootstrap_job_source(company: Company, probe_network: bool = True) -> bool:
    discovered = discover_job_source_for_company(company, probe_network=probe_network)
    if not discovered:
        return False

    provider, token = discovered
    company.jobs_provider = provider
    company.jobs_board_token = token
    company.jobs_last_discovered_at = timezone.now()
    company.jobs_sync_error = ''
    if not company.careers_url and provider in ADAPTERS:
        company.careers_url = ADAPTERS[provider].board_url(token)
    company.save(
        update_fields=[
            'jobs_provider',
            'jobs_board_token',
            'jobs_last_discovered_at',
            'jobs_sync_error',
            'careers_url',
        ]
    )
    return True


def bootstrap_job_sources(limit: int = 250, probe_network: bool = True) -> int:
    updated = 0
    queryset = Company.objects.filter(jobs_sync_enabled=True).order_by('-total_h1b_filings', 'name')[:limit]
    for company in queryset:
        if bootstrap_job_source(company, probe_network=probe_network):
            updated += 1
    return updated


def sync_company_jobs(company: Company, discover_if_missing: bool = True) -> int:
    if discover_if_missing and not (company.jobs_provider and company.jobs_board_token):
        bootstrap_job_source(company, probe_network=True)
        company.refresh_from_db()

    if not company.jobs_provider or not company.jobs_board_token:
        return 0

    adapter = ADAPTERS.get(company.jobs_provider)
    if not adapter:
        company.jobs_sync_error = f'Unsupported provider: {company.jobs_provider}'
        company.save(update_fields=['jobs_sync_error'])
        return 0

    jobs = adapter.fetch_jobs(company.jobs_board_token)
    active_ids = []

    with transaction.atomic():
        for job in jobs:
            active_ids.append(job.external_job_id)
            JobPosting.objects.update_or_create(
                company=company,
                source=job.source,
                external_job_id=job.external_job_id,
                defaults={
                    'title': job.title,
                    'team': job.team,
                    'location': job.location,
                    'remote_policy': job.remote_policy,
                    'employment_type': job.employment_type,
                    'url': job.url,
                    'source': job.source,
                    'source_board': job.source_board,
                    'description': job.description,
                    'salary_min': job.salary_min,
                    'salary_max': job.salary_max,
                    'currency': job.currency,
                    'posted_at': job.posted_at,
                    'visa_sponsorship_signal': sponsorship_signal_for_company(company),
                    'is_active': True,
                },
            )

        JobPosting.objects.filter(
            company=company,
            source=company.jobs_provider,
            source_board=company.jobs_board_token,
        ).exclude(external_job_id__in=active_ids).update(
            is_active=False,
            last_seen_at=timezone.now(),
        )

    company.jobs_last_synced_at = timezone.now()
    company.jobs_sync_error = ''
    company.careers_url = company.careers_url or adapter.board_url(company.jobs_board_token)
    company.save(update_fields=['jobs_last_synced_at', 'jobs_sync_error', 'careers_url'])
    return len(jobs)


def sync_all_company_jobs(limit: int = 250, providers: Iterable[str] | None = None) -> dict:
    queryset = Company.objects.filter(jobs_sync_enabled=True).order_by('-total_h1b_filings', 'name')
    if providers:
        queryset = queryset.filter(jobs_provider__in=list(providers))

    companies = list(queryset[:limit])
    synced_companies = 0
    total_jobs = 0
    errors = 0

    for company in companies:
        try:
            count = sync_company_jobs(company, discover_if_missing=True)
            total_jobs += count
            if count or company.jobs_provider:
                synced_companies += 1
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            company.jobs_sync_error = str(exc)[:255]
            company.save(update_fields=['jobs_sync_error'])
            errors += 1

    return {
        'companies': len(companies),
        'synced_companies': synced_companies,
        'total_jobs': total_jobs,
        'errors': errors,
    }


def deactivate_stale_jobs(days: int = 3) -> int:
    threshold = timezone.now() - timedelta(days=days)
    return JobPosting.objects.filter(is_active=True, last_seen_at__lt=threshold).update(is_active=False)
