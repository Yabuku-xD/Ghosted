from celery import shared_task

from companies.services.jobs import (
    bootstrap_job_sources,
    deactivate_stale_jobs,
    sync_all_company_jobs,
)
from companies.services.resume_matching import (
    cleanup_expired_resume_artifacts,
    process_resume_match_session,
)


@shared_task
def discover_job_sources_task(limit: int = 250):
    return bootstrap_job_sources(limit=limit, probe_network=True)


@shared_task
def sync_job_postings_task(limit: int = 250):
    return sync_all_company_jobs(limit=limit)


@shared_task
def deactivate_stale_jobs_task(days: int = 3):
    return deactivate_stale_jobs(days=days)


@shared_task
def process_resume_match_session_task(session_id: str):
    return process_resume_match_session(session_id)


@shared_task
def cleanup_resume_sessions_task():
    return cleanup_expired_resume_artifacts()
