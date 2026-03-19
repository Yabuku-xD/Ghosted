from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone as dt_timezone
from io import BytesIO
from pathlib import Path
from tempfile import gettempdir
from typing import Any

from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Value
from django.db.models.functions import Coalesce
from django.http import FileResponse, Http404
from django.utils import timezone
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

from companies.models import JobPosting
from companies.services.job_intelligence import (
    clean_skill_phrase,
    compute_job_trust,
    extract_skills,
    infer_role_family,
    infer_seniority,
    normalize_blob,
    parse_required_years,
    relevant_skill_overlap,
    role_family_display,
    seniority_gap,
)
from offers.models import Offer


MAX_BULLET_COUNT = 6
RESUME_MATCH_SESSION_VERSION = 3
SECTION_HEADINGS = {
    'summary': {'summary', 'professional summary', 'profile', 'objective'},
    'skills': {'skills', 'technical skills', 'core skills', 'competencies'},
    'experience': {'experience', 'professional experience', 'work experience', 'employment history'},
    'education': {'education', 'academic background'},
    'projects': {'projects', 'selected projects'},
    'certifications': {'certifications', 'licenses'},
}
DATE_RANGE_PATTERN = re.compile(
    r'(?P<start>(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+)?(?P<start_year>20\d{2}|19\d{2})'
    r'\s*(?:-|–|—|to)\s*'
    r'(?P<end>(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+)?(?:20\d{2}|19\d{2})|present|current|now)',
    flags=re.IGNORECASE,
)
PHONE_PATTERN = re.compile(r'(\+?\(?\d[\d\s().-]{8,}\d)')
EMAIL_PATTERN = re.compile(
    r'([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+?\.(?:com|edu|org|net|io|co|ai|in|us))'
    r'(?=$|[^A-Za-z0-9]|(?=[A-Za-z0-9._%+-]+@))',
    flags=re.IGNORECASE,
)
LINKEDIN_PATTERN = re.compile(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+', flags=re.IGNORECASE)
ACTION_VERBS = (
    'built',
    'created',
    'designed',
    'developed',
    'drove',
    'implemented',
    'improved',
    'launched',
    'led',
    'managed',
    'optimized',
    'owned',
    'scaled',
    'shipped',
)
GENERIC_OVERLAP_TERMS = {
    'candidate', 'candidates', 'company', 'companies', 'com', 'customer', 'customers', 'data', 'design',
    'engineer', 'engineers', 'engineering', 'experience', 'experiences', 'features', 'platform', 'product',
    'products', 'role', 'roles', 'skills', 'software', 'system', 'systems', 'team', 'teams', 'worked',
    'workflows', 'tools', 'technology', 'technologies',
}
MONTH_MAP = {
    'jan': 1,
    'feb': 2,
    'mar': 3,
    'apr': 4,
    'may': 5,
    'jun': 6,
    'jul': 7,
    'aug': 8,
    'sep': 9,
    'sept': 9,
    'oct': 10,
    'nov': 11,
    'dec': 12,
}
LIGATURE_REPLACEMENTS = {
    '\u0000': '',
    '\ufb00': 'ff',
    '\ufb01': 'fi',
    '\ufb02': 'fl',
    '\ufb03': 'ffi',
    '\ufb04': 'ffl',
}
CONTACT_LINE_MARKERS = ('envelope', 'phone', 'mailto', 'http://', 'https://', 'www.', 'linkedin.com/', 'github.com/')
LOW_SIGNAL_MATCH_SKILLS = {'API', 'APIS', 'CD', 'CI', 'JWT', 'MVC', 'OOD', 'SSL', 'TLS'}
FRONTEND_SIGNAL_TERMS = {
    'frontend', 'front end', 'front-end', 'full stack', 'full-stack', 'fullstack',
    'react', 'typescript', 'javascript', 'ui', 'web', 'html', 'css',
}
BACKEND_SIGNAL_TERMS = {
    'backend', 'back end', 'back-end', 'full stack', 'full-stack', 'fullstack',
    'python', 'node.js', 'node', 'go', 'golang', 'django', 'django rest framework',
    'flask', 'apis', 'api', 'sql', 'postgresql', 'redis', 'services',
}
SUSPICIOUS_SESSION_TOKENS = (
    'gmail.com',
    'linkedin',
    'github',
    'envelope',
    'mailto',
    '.com',
)


@dataclass
class ExperienceBlock:
    text: str
    months: int
    family: str


@dataclass
class CandidateProfile:
    contact_name: str
    email: str
    phone: str
    linkedin: str
    overall_years: float
    overall_months: int
    experience_by_family: dict[str, float]
    experience_by_family_months: dict[str, int]
    seniority: str
    skills: list[str]
    highlights: list[str]
    education: list[str]
    certifications: list[str]
    skills_text: str
    experience_text: str
    projects_text: str
    analysis_text: str


def resume_storage_dir() -> Path:
    path = Path(getattr(settings, 'RESUME_SESSION_STORAGE_DIR', Path(gettempdir()) / 'ghosted_resume_sessions'))
    path.mkdir(parents=True, exist_ok=True)
    return path


def resume_session_ttl() -> int:
    return int(getattr(settings, 'RESUME_SESSION_TTL_SECONDS', 3600))


def resume_session_key(session_id: str) -> str:
    return f'ghosted:resume-session:{session_id}'


def _default_filters(filters: dict[str, Any] | None) -> dict[str, Any]:
    raw = filters or {}
    normalized: dict[str, Any] = {}
    for key in (
        'search',
        'location',
        'company_slug',
        'source',
        'remote_policy',
        'visa_sponsorship_signal',
        'posted_within_days',
    ):
        value = (raw.get(key) or '').strip() if isinstance(raw.get(key), str) else raw.get(key)
        if value:
            normalized[key] = value
    if str(raw.get('has_salary', '')).lower() in {'1', 'true', 'yes', 'on'}:
        normalized['has_salary'] = True
    return normalized


def _session_timestamp(offset_seconds: int = 0) -> str:
    return (timezone.now() + timedelta(seconds=offset_seconds)).isoformat()


def _session_path(session_id: str, suffix: str) -> Path:
    return resume_storage_dir() / f'{session_id}-{suffix}'


def _clean_up_file(path_value: str | None) -> None:
    if not path_value:
        return
    path = Path(path_value)
    if path.exists():
        path.unlink(missing_ok=True)


def _looks_like_suspicious_session_value(value: str) -> bool:
    normalized = normalize_blob(value)
    if not normalized:
        return False

    compact = normalized.replace(' ', '')
    return (
        any(token in compact for token in SUSPICIOUS_SESSION_TOKENS)
        or compact.count('gmail') > 1
        or compact.count('linkedin') > 1
        or compact.count('github') > 1
    )


def _session_payload_is_invalid(payload: dict[str, Any]) -> bool:
    if payload.get('match_engine_version') != RESUME_MATCH_SESSION_VERSION:
        return True

    if payload.get('status') != 'completed':
        return False

    profile_summary = payload.get('profile_summary') or {}
    for value in profile_summary.get('top_skills') or []:
        if _looks_like_suspicious_session_value(str(value)):
            return True

    target_cluster = payload.get('target_cluster') or {}
    for value in target_cluster.get('top_skills') or []:
        if _looks_like_suspicious_session_value(str(value)):
            return True

    for match in payload.get('high_matches') or []:
        for value in match.get('matched_skills') or []:
            if _looks_like_suspicious_session_value(str(value)):
                return True
        for value in match.get('resume_match_reasons') or []:
            if _looks_like_suspicious_session_value(str(value)):
                return True

    return False


def create_resume_match_session(uploaded_file, filters: dict[str, Any] | None = None) -> dict[str, Any]:
    session_id = uuid.uuid4().hex
    raw_bytes = b''.join(chunk for chunk in uploaded_file.chunks())
    resume_text = extract_pdf_text_from_bytes(raw_bytes)

    payload = {
        'session_id': session_id,
        'status': 'processing',
        'created_at': _session_timestamp(),
        'expires_at': _session_timestamp(resume_session_ttl()),
        'resume_uploaded': True,
        'match_engine_version': RESUME_MATCH_SESSION_VERSION,
        'privacy_note': 'Resume uploads are temporary, processed asynchronously, and removed automatically after matching.',
        'filters': _default_filters(filters),
        'resume_text': resume_text,
        'resume_file_name': 'tailored-resume.pdf',
    }
    cache.set(resume_session_key(session_id), payload, timeout=resume_session_ttl())
    return {
        'session_id': session_id,
        'status': 'processing',
        'created_at': payload['created_at'],
        'expires_at': payload['expires_at'],
        'privacy_note': payload['privacy_note'],
    }


def get_resume_match_session(session_id: str) -> dict[str, Any] | None:
    payload = cache.get(resume_session_key(session_id))
    if not payload:
        return None
    if _session_payload_is_invalid(payload):
        cache.delete(resume_session_key(session_id))
        return None

    filtered = {key: value for key, value in payload.items() if key not in {'resume_text', 'output_bytes'}}
    if payload.get('output_bytes'):
        filtered['has_download'] = True
    return filtered


def clear_resume_match_session(session_id: str) -> bool:
    cache.delete(resume_session_key(session_id))
    return True


def cleanup_expired_resume_artifacts() -> int:
    removed = 0
    threshold = timezone.now() - timedelta(seconds=resume_session_ttl())
    for artifact in resume_storage_dir().glob('*'):
        modified_at = datetime.fromtimestamp(artifact.stat().st_mtime, tz=dt_timezone.utc)
        if modified_at < threshold:
            artifact.unlink(missing_ok=True)
            removed += 1
    return removed


def resume_download_response(session_id: str) -> FileResponse:
    payload = cache.get(resume_session_key(session_id))
    if (
        not payload
        or _session_payload_is_invalid(payload)
        or payload.get('status') != 'completed'
        or not payload.get('output_bytes')
    ):
        raise Http404('Resume session unavailable')

    return FileResponse(
        BytesIO(payload['output_bytes']),
        as_attachment=True,
        filename=payload.get('resume_file_name', 'ghosted-tailored-resume.pdf'),
        content_type='application/pdf',
    )


def process_resume_match_session(session_id: str) -> dict[str, Any]:
    payload = cache.get(resume_session_key(session_id))
    if not payload:
        return {'status': 'missing'}
    if _session_payload_is_invalid(payload):
        cache.delete(resume_session_key(session_id))
        return {'status': 'missing'}

    resume_text = payload.get('resume_text', '')
    if not resume_text:
        payload.update({
            'status': 'failed',
            'error': 'Uploaded resume text could not be found for processing.',
        })
        cache.set(resume_session_key(session_id), payload, timeout=resume_session_ttl())
        return payload

    try:
        candidate = build_candidate_profile(resume_text)
        high_matches, filtered_low_matches = find_high_match_jobs(candidate, payload.get('filters') or {})
        target_cluster = choose_target_cluster(high_matches)
        output_bytes = None

        if target_cluster and target_cluster['jobs']:
            output_bytes = build_tailored_resume_pdf(
                session_id=session_id,
                candidate=candidate,
                target_family=target_cluster['family'],
                jobs=target_cluster['jobs'],
            )

        payload.update({
            'status': 'completed',
            'completed_at': _session_timestamp(),
            'profile_summary': {
                'estimated_years_experience': candidate.overall_years,
                'estimated_experience_label': format_experience_label(candidate.overall_months),
                'seniority': candidate.seniority,
                'top_skills': candidate.skills[:8],
                'target_families': [
                    role_family_display(family)
                    for family, years in sorted(candidate.experience_by_family.items(), key=lambda item: item[1], reverse=True)
                    if years > 0
                ][:3] or ['Generalist'],
            },
            'high_match_count': len(high_matches),
            'filtered_low_match_count': filtered_low_matches,
            'high_matches': high_matches[:10],
            'target_cluster': {
                'family': role_family_display(target_cluster['family']) if target_cluster else None,
                'job_count': len(target_cluster['jobs']) if target_cluster else 0,
                'average_match_score': target_cluster['average_score'] if target_cluster else None,
                'top_skills': target_cluster['top_skills'] if target_cluster else [],
            } if target_cluster else None,
            'resume_ready': bool(output_bytes),
            'resume_file_name': build_resume_file_name(candidate.contact_name, target_cluster['family'] if target_cluster else 'general'),
            'output_bytes': output_bytes,
        })
        if _session_payload_is_invalid(payload):
            payload.update({
                'status': 'failed',
                'error': 'Resume parsing picked up invalid contact noise. Please upload again for a fresh shortlist.',
            })
            payload.pop('output_bytes', None)
    except Exception as exc:
        payload.update({
            'status': 'failed',
            'error': str(exc)[:255],
        })
    finally:
        payload.pop('resume_text', None)
        cache.set(resume_session_key(session_id), payload, timeout=resume_session_ttl())

    return get_resume_match_session(session_id) or {'status': payload.get('status', 'failed')}


def extract_pdf_text_from_bytes(raw_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(raw_bytes))
    max_pages = int(getattr(settings, 'RESUME_MAX_PAGES', 4))
    if len(reader.pages) > max_pages:
        raise ValueError(f'Please upload a PDF with {max_pages} pages or fewer.')

    chunks = []
    for page in reader.pages:
        chunks.append(page.extract_text() or '')

    text = '\n'.join(chunks)
    normalized = normalize_resume_text(text)
    if not normalized:
        raise ValueError('No readable text was found in the uploaded PDF.')
    return normalized


def normalize_resume_text(text: str) -> str:
    normalized = text or ''
    for original, replacement in LIGATURE_REPLACEMENTS.items():
        normalized = normalized.replace(original, replacement)
    normalized = normalized.replace('\r', '')
    normalized = re.sub(r'[^\S\n]+', ' ', normalized)
    normalized = re.sub(r' *\n *', '\n', normalized)
    normalized = re.sub(r'\n{3,}', '\n\n', normalized)
    return normalized.strip()


def months_to_years(months: int) -> float:
    if months <= 0:
        return 0.0
    return round(months / 12, 1)


def format_experience_label(months: int) -> str:
    if months <= 0:
        return 'Limited direct experience'
    if months < 6:
        return f'~{months} month{"s" if months != 1 else ""}'
    if months < 12:
        return '<1 year'

    years = round(months / 12, 1)
    if float(years).is_integer():
        whole_years = int(years)
        return f'{whole_years} year{"s" if whole_years != 1 else ""}'
    return f'~{years:.1f} years'


def build_candidate_profile(text: str) -> CandidateProfile:
    lines = [normalize_resume_line(line) for line in text.splitlines()]
    lines = [line for line in lines if line]
    contact_name = extract_contact_name(lines)
    content_lines = extract_resume_content_lines(lines, contact_name)
    sections = split_into_sections(content_lines)
    experience_blocks = extract_experience_blocks(sections.get('experience', []))

    email = extract_primary_email(text)
    phone = extract_primary_phone(text)
    linkedin = extract_primary_linkedin(text)

    merged_months = merge_experience_months(experience_blocks)
    fallback_years = estimate_years_from_text(' '.join(sections.get('experience', []) + sections.get('projects', [])))
    overall_months = merged_months or (fallback_years * 12)
    overall_years = months_to_years(overall_months)

    experience_by_family_months: dict[str, int] = {}
    for block in experience_blocks:
        if block.family == 'general':
            continue
        experience_by_family_months[block.family] = experience_by_family_months.get(block.family, 0) + max(block.months, 0)

    experience_by_family = {
        family: months_to_years(months)
        for family, months in experience_by_family_months.items()
    }

    skills_text = ' '.join(sections.get('skills', []))
    experience_text = ' '.join(sections.get('experience', []))
    projects_text = ' '.join(sections.get('projects', []))

    skills = merge_unique_strings(
        extract_explicit_resume_skills(sections.get('skills', [])),
        extract_skills(skills_text, limit=12),
        extract_skills(projects_text, limit=10),
        extract_skills(experience_text, limit=10),
        limit=18,
    )
    seniority = infer_seniority(' '.join(lines[:12]), f'{overall_years} years experience')
    highlights = extract_highlights(sections, content_lines)
    education = [line for line in sections.get('education', []) if len(line) <= 120][:4]
    certifications = [line for line in sections.get('certifications', []) if len(line) <= 120][:4]
    analysis_text = '\n'.join(
        part for part in [
            ' '.join(sections.get('summary', [])),
            skills_text,
            experience_text,
            projects_text,
            ' '.join(skills),
        ] if part
    )

    return CandidateProfile(
        contact_name=contact_name,
        email=email,
        phone=phone,
        linkedin=linkedin,
        overall_years=overall_years,
        overall_months=overall_months,
        experience_by_family=experience_by_family,
        experience_by_family_months=experience_by_family_months,
        seniority=seniority,
        skills=skills,
        highlights=highlights,
        education=education,
        certifications=certifications,
        skills_text=skills_text,
        experience_text=experience_text,
        projects_text=projects_text,
        analysis_text=analysis_text or text,
    )


def split_into_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {}
    current = 'general'
    sections[current] = []

    for line in lines:
        normalized = line.lower().strip(':').strip()
        if len(normalized.split()) <= 4:
            for section, names in SECTION_HEADINGS.items():
                if normalized in names:
                    current = section
                    sections.setdefault(current, [])
                    break
            else:
                sections.setdefault(current, []).append(line)
        else:
            sections.setdefault(current, []).append(line)

    return sections


def extract_contact_name(lines: list[str]) -> str:
    for line in lines[:6]:
        if is_contact_or_noise_line(line):
            continue
        if 1 < len(line.split()) <= 4 and len(line) <= 60 and not any(char.isdigit() for char in line):
            return line.title()
    return 'Candidate'


def normalize_resume_line(line: str) -> str:
    collapsed = re.sub(r'\b([A-Z])\s+(?=[A-Za-z]{2,}\b)', r'\1', line or '')
    collapsed = re.sub(r'\s+', ' ', collapsed).strip().strip('|')
    return collapsed


def extract_resume_content_lines(lines: list[str], contact_name: str) -> list[str]:
    content_lines = []
    for index, line in enumerate(lines):
        if index < 6 and (line == contact_name or is_contact_or_noise_line(line)):
            continue
        content_lines.append(line)
    return content_lines


def is_contact_or_noise_line(line: str) -> bool:
    lowered = line.lower()
    compact = re.sub(r'\s+', '', line)
    return (
        bool(EMAIL_PATTERN.search(compact))
        or bool(PHONE_PATTERN.search(line))
        or any(marker in lowered for marker in CONTACT_LINE_MARKERS)
    )


def extract_primary_email(text: str) -> str:
    compact = re.sub(r'\s+', '', text or '')
    match = EMAIL_PATTERN.search(compact)
    if not match:
        return ''

    email = match.group(1).lower()
    for prefix in ('envelope', 'email', 'mailto'):
        if email.startswith(prefix):
            email = email[len(prefix):]
    return email


def extract_primary_phone(text: str) -> str:
    match = PHONE_PATTERN.search(text or '')
    if not match:
        return ''

    digits = re.sub(r'\D', '', match.group(1))
    if len(digits) == 11 and digits.startswith('1'):
        digits = digits[1:]
    if len(digits) == 10:
        return f'({digits[:3]}) {digits[3:6]}-{digits[6:]}'
    return match.group(1).strip()


def extract_primary_linkedin(text: str) -> str:
    compact = re.sub(r'\s+', '', text or '')
    match = LINKEDIN_PATTERN.search(compact)
    return match.group(0) if match else ''


def merge_unique_strings(*groups: list[str], limit: int = 18) -> list[str]:
    merged = []
    seen = set()
    for group in groups:
        for value in group:
            normalized = normalize_blob(value)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            merged.append(value)
            if len(merged) == limit:
                return merged
    return merged


def extract_explicit_resume_skills(lines: list[str]) -> list[str]:
    explicit_skills: list[str] = []
    seen = set()

    for line in lines:
        fragment = line.split(':', 1)[1] if ':' in line else line
        for part in re.split(r',|/|;|\||\band\b', fragment, flags=re.IGNORECASE):
            phrase = clean_skill_phrase(part, source='explicit')
            normalized = normalize_blob(phrase or '')
            if not phrase or not normalized or normalized in seen:
                continue
            seen.add(normalized)
            explicit_skills.append(phrase)

    return explicit_skills


def parse_resume_date(token: str) -> date | None:
    cleaned = token.strip().lower()
    if cleaned in {'present', 'current', 'now'}:
        return timezone.now().date()

    parts = cleaned.split()
    if not parts:
        return None

    if len(parts) == 1 and parts[0].isdigit():
        return date(int(parts[0]), 1, 1)

    if len(parts) >= 2:
        month = MONTH_MAP.get(parts[0][:4], 1)
        year = int(parts[1])
        return date(year, month, 1)

    return None


def extract_experience_blocks(lines: list[str]) -> list[ExperienceBlock]:
    blocks: list[ExperienceBlock] = []
    for index, line in enumerate(lines):
        match = DATE_RANGE_PATTERN.search(line)
        if not match:
            continue

        start = parse_resume_date(f"{match.group('start') or ''}{match.group('start_year')}")
        end = parse_resume_date(match.group('end'))
        if not start or not end:
            continue

        months = max(((end.year - start.year) * 12) + (end.month - start.month), 1)
        window = lines[max(0, index - 2):min(len(lines), index + 6)]
        block_text = ' '.join(window)
        blocks.append(
            ExperienceBlock(
                text=block_text,
                months=months,
                family=infer_role_family(block_text),
            )
        )
    return blocks


def merge_experience_months(blocks: list[ExperienceBlock]) -> int:
    intervals = []
    for block in blocks:
        match = DATE_RANGE_PATTERN.search(block.text)
        if not match:
            continue
        start = parse_resume_date(f"{match.group('start') or ''}{match.group('start_year')}")
        end = parse_resume_date(match.group('end'))
        if start and end:
            intervals.append((start, end))

    if not intervals:
        return 0

    intervals.sort(key=lambda item: item[0])
    merged: list[tuple[date, date]] = [intervals[0]]
    for current_start, current_end in intervals[1:]:
        last_start, last_end = merged[-1]
        if current_start <= last_end:
            merged[-1] = (last_start, max(last_end, current_end))
        else:
            merged.append((current_start, current_end))

    return sum(max(((end.year - start.year) * 12) + (end.month - start.month), 1) for start, end in merged)


def estimate_years_from_text(text: str) -> int:
    candidates = [int(value) for value in re.findall(r'(\d{1,2})\+?\s+(?:years?|yrs?)', text, flags=re.IGNORECASE)]
    if candidates:
        return min(max(candidates), 25)
    return 1


def extract_highlights(sections: dict[str, list[str]], lines: list[str]) -> list[str]:
    source_lines = sections.get('experience') or sections.get('projects') or lines
    highlights = []
    for line in source_lines:
        normalized = line.strip('•- ').strip()
        lowered = normalized.lower()
        if len(normalized) < 35 or len(normalized) > 180:
            continue
        if any(lowered.startswith(verb) for verb in ACTION_VERBS) or line.strip().startswith(('•', '-', '*')):
            highlights.append(normalized)
    return highlights[:12]


def filtered_jobs_queryset(filters: dict[str, Any]):
    offer_count_subquery = (
        Offer.objects.filter(
            company_id=OuterRef('company_id'),
            is_verified=True,
        )
        .values('company_id')
        .annotate(total=Count('id'))
        .values('total')[:1]
    )

    queryset = JobPosting.objects.filter(is_active=True).select_related('company').annotate(
        company_offer_count=Coalesce(Subquery(offer_count_subquery, output_field=IntegerField()), Value(0)),
    ).only(
        'id',
        'company_id',
        'company__name',
        'company__slug',
        'company__logo_url',
        'company__company_domain',
        'company__visa_fair_score',
        'company__h1b_approval_rate',
        'company__total_h1b_filings',
        'title',
        'team',
        'location',
        'remote_policy',
        'employment_type',
        'url',
        'source',
        'source_board',
        'description',
        'salary_min',
        'salary_max',
        'currency',
        'posted_at',
        'last_seen_at',
        'visa_sponsorship_signal',
    )

    search = (filters.get('search') or '').strip()
    location = (filters.get('location') or '').strip()
    company_slug = (filters.get('company_slug') or '').strip()
    source = (filters.get('source') or '').strip()
    remote_policy = (filters.get('remote_policy') or '').strip()
    visa_signal = (filters.get('visa_sponsorship_signal') or '').strip()
    posted_within_days = filters.get('posted_within_days')

    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(team__icontains=search)
            | Q(company__name__icontains=search)
            | Q(description__icontains=search)
        )

    if location:
        queryset = queryset.filter(location__icontains=location)
    if company_slug:
        queryset = queryset.filter(company__slug=company_slug)
    if filters.get('has_salary'):
        queryset = queryset.filter(Q(salary_min__isnull=False) | Q(salary_max__isnull=False))
    if source:
        queryset = queryset.filter(source=source)
    if remote_policy:
        queryset = queryset.filter(remote_policy=remote_policy)
    if visa_signal:
        queryset = queryset.filter(visa_sponsorship_signal=visa_signal)
    if posted_within_days:
        try:
            queryset = queryset.filter(posted_at__gte=timezone.now() - timedelta(days=int(posted_within_days)))
        except (TypeError, ValueError):
            pass

    return queryset.distinct()


def normalized_skill_set(skills: list[str]) -> set[str]:
    return {normalize_blob(skill) for skill in skills if normalize_blob(skill)}


def stack_match_count(skills: list[str], terms: set[str]) -> int:
    return sum(1 for skill in normalized_skill_set(skills) if skill in terms)


def text_contains_stack_terms(text: str, terms: set[str]) -> bool:
    normalized = normalize_blob(text)
    return any(term in normalized for term in terms)


def build_job_profile(job) -> dict[str, Any]:
    role_family = infer_role_family(job.title, job.team, job.description)
    job_skills = extract_skills(' '.join(filter(None, [job.title, job.team, job.description])), limit=10)
    required_years = parse_required_years(job.title, job.description)
    seniority = infer_seniority(job.title, job.description)
    trust = compute_job_trust(job)
    job_text = ' '.join(filter(None, [job.title, job.team, job.description]))
    requires_frontend = text_contains_stack_terms(job_text, FRONTEND_SIGNAL_TERMS)
    requires_backend = text_contains_stack_terms(job_text, BACKEND_SIGNAL_TERMS)
    return {
        'family': role_family,
        'skills': job_skills,
        'required_years': required_years,
        'seniority': seniority,
        'trust': trust,
        'requires_frontend': requires_frontend,
        'requires_backend': requires_backend,
    }


def score_job_match(
    candidate: CandidateProfile,
    job,
    job_profile: dict[str, Any],
    text_similarity: float,
    overlap_terms: list[str],
) -> dict[str, Any] | None:
    professional_matches = matched_job_keywords(candidate.experience_text, candidate.skills, job_profile['skills'])
    project_matches = [
        skill
        for skill in matched_job_keywords(candidate.projects_text, candidate.skills, job_profile['skills'])
        if normalize_blob(skill) not in {normalize_blob(value) for value in professional_matches}
    ]
    overlap = merge_unique_strings(
        professional_matches,
        project_matches,
        relevant_skill_overlap(candidate.skills, job_profile['skills']),
        limit=8,
    )
    allowed_terms = {normalize_blob(skill): skill for skill in candidate.skills if skill}
    for term in overlap_terms:
        mapped = allowed_terms.get(normalize_blob(term))
        if mapped and mapped not in overlap:
            overlap.append(mapped)
    high_signal_overlap = [
        skill for skill in overlap
        if normalize_blob(skill).upper() not in LOW_SIGNAL_MATCH_SKILLS
    ]
    overlap_count = len(high_signal_overlap) or len(overlap)
    required_years = job_profile['required_years']
    family = job_profile['family']
    relevant_months = candidate.experience_by_family_months.get(family) or candidate.overall_months
    relevant_years = months_to_years(relevant_months)
    required_months = (required_years * 12) if required_years is not None else None
    seniority_delta = seniority_gap(candidate.seniority, job_profile['seniority'])
    candidate_families = {family_name for family_name, months in candidate.experience_by_family_months.items() if months > 0}
    family_aligned = not candidate_families or family in candidate_families or family == 'general'
    professional_overlap_count = len(professional_matches)
    project_overlap_count = len(project_matches)

    professional_frontend = stack_match_count(professional_matches, FRONTEND_SIGNAL_TERMS)
    professional_backend = stack_match_count(professional_matches, BACKEND_SIGNAL_TERMS)
    project_frontend = stack_match_count(project_matches, FRONTEND_SIGNAL_TERMS)
    project_backend = stack_match_count(project_matches, BACKEND_SIGNAL_TERMS)
    has_frontend_evidence = (professional_frontend + project_frontend) > 0
    has_backend_evidence = (professional_backend + project_backend) > 0
    full_stack_role = job_profile['requires_frontend'] and job_profile['requires_backend']

    if required_months is not None and relevant_months + 6 < required_months:
        return None

    if job_profile['seniority'] in {'manager', 'executive'} and seniority_delta < -1:
        return None

    if not family_aligned and text_similarity < 0.18:
        return None

    if overlap_count < 2 and text_similarity < 0.16:
        return None

    if professional_overlap_count == 0 and text_similarity < 0.2:
        return None

    if full_stack_role and not (has_frontend_evidence and has_backend_evidence):
        return None

    skill_score = min((professional_overlap_count * 10) + (project_overlap_count * 5), 26)
    family_score = (
        16 if family in candidate.experience_by_family_months and family != 'general'
        else 9 if family_aligned and family != 'general'
        else 6 if family == 'general'
        else 2
    )

    if required_months is None:
        experience_score = 10 if relevant_months >= 12 else 6 if relevant_months >= 6 else 2
    elif relevant_months >= required_months:
        experience_score = 18
    elif relevant_months + 6 >= required_months:
        experience_score = 10
    else:
        experience_score = 3

    seniority_score = 10 if seniority_delta >= 0 else 4 if seniority_delta == -1 else 0
    sponsorship_score = 4 if getattr(job, 'visa_sponsorship_signal', '') == 'historically_sponsors' else 1
    salary_score = 2 if (job.salary_min or job.salary_max) else 1 if getattr(job.company, 'total_h1b_filings', 0) else 0
    trust_score = round(job_profile['trust']['score'] * 0.05)
    similarity_score = min(round(text_similarity * 100), 18)
    stack_score = 0
    if full_stack_role:
        if professional_frontend and professional_backend:
            stack_score = 8
        elif has_frontend_evidence and has_backend_evidence:
            stack_score = 2
        else:
            stack_score = -6

    total = (
        skill_score
        + family_score
        + experience_score
        + seniority_score
        + sponsorship_score
        + salary_score
        + trust_score
        + similarity_score
        + stack_score
    )
    if total < 68 or (not high_signal_overlap and text_similarity < 0.2):
        return None

    reasons = []
    displayed_overlap = high_signal_overlap or overlap
    if displayed_overlap:
        reasons.append(
            f'Matched {len(displayed_overlap)} requirement{"s" if len(displayed_overlap) != 1 else ""} from the description: '
            f'{", ".join(displayed_overlap[:4])}.'
        )
    if required_years is not None:
        reasons.append(
            f'Your directly relevant experience looks closer to {format_experience_label(relevant_months).lower()} '
            f'against a {required_years}+ year requirement.'
        )
    elif full_stack_role and professional_overlap_count == 0 and project_overlap_count > 0:
        reasons.append('Most of the full-stack overlap comes from project work rather than direct professional experience.')
    elif professional_overlap_count > 0:
        reasons.append('Some overlap is backed by direct work experience, not only resume keywords.')
    else:
        reasons.append(f'Role aligns with a {role_family_display(family).lower()} background.')
    if getattr(job, 'visa_sponsorship_signal', '') == 'historically_sponsors':
        reasons.append('Employer has a strong historical sponsorship footprint.')
    if job_profile['trust']['notes']:
        reasons.append(job_profile['trust']['notes'][0])

    return {
        'job': job,
        'job_profile': job_profile,
        'resume_match_score': min(total, 100),
        'resume_match_band': 'high' if total >= 80 else 'good',
        'resume_match_reasons': reasons[:4],
        'candidate_years_experience': relevant_years,
        'candidate_experience_label': format_experience_label(relevant_months),
        'required_years_experience': required_years,
        'matched_skills': displayed_overlap[:6],
    }


def find_high_match_jobs(candidate: CandidateProfile, filters: dict[str, Any]) -> tuple[list[dict[str, Any]], int]:
    jobs = list(filtered_jobs_queryset(filters))
    if not jobs:
        return [], 0

    candidate_families = {family for family, years in candidate.experience_by_family.items() if years > 0}
    inferred_family = infer_role_family(candidate.analysis_text)
    if inferred_family != 'general':
        candidate_families.add(inferred_family)

    focus_skills = [skill.lower() for skill in candidate.skills[:8]]
    scoped_jobs = []
    for job in jobs:
        preview = normalize_blob(job.title, job.team, (job.description or '')[:1200])
        job_family = infer_role_family(job.title, job.team, (job.description or '')[:900])
        skill_hits = sum(1 for skill in focus_skills if skill and skill in preview)
        if not candidate_families or job_family in candidate_families or skill_hits >= 2:
            scoped_jobs.append(job)

    if scoped_jobs:
        jobs = scoped_jobs

    documents = [
        ' '.join(filter(None, [job.title, job.team, (job.description or '')[:1800]]))
        for job in jobs
    ]
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=2800)
    matrix = vectorizer.fit_transform([candidate.analysis_text] + documents)
    feature_names = vectorizer.get_feature_names_out()
    resume_vector = matrix[0]

    matches = []
    filtered_low_matches = 0

    for index, job in enumerate(jobs):
        job_vector = matrix[index + 1]
        text_similarity = float(linear_kernel(resume_vector, job_vector).ravel()[0])
        overlap_terms = top_overlap_terms(resume_vector, job_vector, feature_names)
        job_profile = build_job_profile(job)
        scored = score_job_match(candidate, job, job_profile, text_similarity=text_similarity, overlap_terms=overlap_terms)
        if scored is None:
            filtered_low_matches += 1
            continue
        matches.append(serialize_job_match(scored))

    matches.sort(key=lambda item: (item['resume_match_score'], item['trust_score'], item['job_score']), reverse=True)
    return matches, filtered_low_matches


def serialize_job_match(scored: dict[str, Any]) -> dict[str, Any]:
    job = scored['job']
    trust = scored['job_profile']['trust']
    return {
        'id': job.id,
        'company': job.company_id,
        'company_name': job.company.name,
        'company_slug': job.company.slug,
        'company_logo_url': job.company.logo_url,
        'company_domain': job.company.company_domain,
        'company_visa_fair_score': float(job.company.visa_fair_score) if job.company.visa_fair_score is not None else None,
        'company_h1b_approval_rate': float(job.company.h1b_approval_rate) if job.company.h1b_approval_rate is not None else None,
        'company_offer_count': getattr(job, 'company_offer_count', 0),
        'title': job.title,
        'team': job.team,
        'location': job.location,
        'remote_policy': job.remote_policy,
        'employment_type': job.employment_type,
        'url': job.url,
        'source': job.source,
        'source_board': job.source_board,
        'salary_min': job.salary_min,
        'salary_max': job.salary_max,
        'currency': job.currency,
        'posted_at': job.posted_at.isoformat() if job.posted_at else None,
        'last_seen_at': job.last_seen_at.isoformat() if job.last_seen_at else None,
        'visa_sponsorship_signal': job.visa_sponsorship_signal,
        'is_active': job.is_active,
        'job_score': getattr(job, 'job_score', None) or 0,
        'job_family': role_family_display(scored['job_profile']['family']),
        'required_years_experience': scored['required_years_experience'],
        'candidate_years_experience': scored['candidate_years_experience'],
        'candidate_experience_label': scored['candidate_experience_label'],
        'resume_match_score': scored['resume_match_score'],
        'resume_match_band': scored['resume_match_band'],
        'resume_match_reasons': scored['resume_match_reasons'],
        'matched_skills': scored['matched_skills'],
        'trust_level': trust['level'],
        'trust_score': trust['score'],
        'trust_notes': trust['notes'],
        'stale_warning': trust['stale_warning'],
    }


def choose_target_cluster(high_matches: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not high_matches:
        return None

    grouped: dict[str, list[dict[str, Any]]] = {}
    for match in high_matches:
        family = infer_role_family(match['title'], match.get('team', ''), ' '.join(match.get('resume_match_reasons', [])))
        grouped.setdefault(family, []).append(match)

    family, jobs = max(
        grouped.items(),
        key=lambda item: (
            len(item[1]),
            sum(match['resume_match_score'] for match in item[1]) / len(item[1]),
        ),
    )

    top_skills = []
    seen = set()
    for match in jobs:
        for skill in match.get('matched_skills', []):
            normalized = skill.lower()
            if normalized not in seen:
                seen.add(normalized)
                top_skills.append(skill)
    average_score = round(sum(match['resume_match_score'] for match in jobs) / len(jobs), 1)

    return {
        'family': family,
        'jobs': jobs[:6],
        'top_skills': top_skills[:8],
        'average_score': average_score,
    }


def build_resume_file_name(contact_name: str, family: str) -> str:
    base_name = re.sub(r'[^a-z0-9]+', '-', contact_name.lower()).strip('-') or 'candidate'
    family_name = re.sub(r'[^a-z0-9]+', '-', family.lower()).strip('-') or 'general'
    return f'{base_name}-ghosted-{family_name}-resume.pdf'


def build_tailored_resume_pdf(session_id: str, candidate: CandidateProfile, target_family: str, jobs: list[dict[str, Any]]) -> bytes:
    output_buffer = BytesIO()
    document = SimpleDocTemplate(
        output_buffer,
        pagesize=letter,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'GhostedTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=8,
    )
    meta_style = ParagraphStyle(
        'GhostedMeta',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#5f5f5f'),
        spaceAfter=10,
    )
    section_style = ParagraphStyle(
        'GhostedSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#c73e1d'),
        spaceAfter=6,
        spaceBefore=8,
    )
    body_style = ParagraphStyle(
        'GhostedBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#1a1a1a'),
    )

    target_titles = [job['title'] for job in jobs[:3]]
    target_companies = [job['company_name'] for job in jobs[:3]]
    top_skills = []
    for job in jobs:
        for skill in job.get('matched_skills', []):
            if skill in candidate.skills and skill not in top_skills:
                top_skills.append(skill)
    if not top_skills:
        top_skills = candidate.skills[:10]

    summary_bits = [
        format_experience_label(candidate.overall_months) if candidate.overall_months else "Experience aligned to this role family",
        f"focused on {role_family_display(target_family).lower()} roles",
    ]
    if top_skills:
        summary_bits.append(f"with strengths in {', '.join(top_skills[:5])}")

    story = []
    story.append(Paragraph(candidate.contact_name or 'Candidate', title_style))

    contact_parts = [part for part in [candidate.email, candidate.phone, candidate.linkedin] if part]
    if contact_parts:
        story.append(Paragraph(' | '.join(contact_parts), meta_style))

    story.append(Paragraph('Professional Summary', section_style))
    story.append(Paragraph(
        f"Candidate profile tailored for high-match {role_family_display(target_family).lower()} opportunities. "
        f"{'. '.join(bit.capitalize() for bit in summary_bits)}. "
        f"Generated against active roles including {', '.join(target_companies)}.",
        body_style,
    ))

    story.append(Paragraph('Target Role Focus', section_style))
    story.append(Paragraph(
        f"Primary target family: <b>{role_family_display(target_family)}</b><br/>"
        f"Top aligned roles: {', '.join(target_titles)}",
        body_style,
    ))

    if top_skills:
        story.append(Paragraph('Core Skills', section_style))
        story.append(Paragraph(', '.join(top_skills[:10]), body_style))

    selected_highlights = score_highlights(candidate.highlights, top_skills, target_titles)
    if selected_highlights:
        story.append(Paragraph('Selected Experience Highlights', section_style))
        story.append(
            ListFlowable(
                [
                    ListItem(Paragraph(highlight, body_style))
                    for highlight in selected_highlights[:MAX_BULLET_COUNT]
                ],
                bulletType='bullet',
                start='circle',
                bulletColor=colors.HexColor('#c73e1d'),
                leftPadding=14,
            )
        )

    if candidate.education:
        story.append(Paragraph('Education', section_style))
        for line in candidate.education:
            story.append(Paragraph(line, body_style))

    if candidate.certifications:
        story.append(Paragraph('Certifications', section_style))
        for line in candidate.certifications:
            story.append(Paragraph(line, body_style))

    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(
        'Prepared by Ghosted from a temporary resume upload. Review and edit before sending.',
        meta_style,
    ))

    document.build(story)
    return output_buffer.getvalue()


def score_highlights(highlights: list[str], skills: list[str], titles: list[str]) -> list[str]:
    scored = []
    keywords = [value.lower() for value in [*skills, *titles] if value]
    for highlight in highlights:
        lowered = highlight.lower()
        score = sum(2 for keyword in keywords if keyword and keyword in lowered)
        score += 1 if any(verb in lowered for verb in ACTION_VERBS) else 0
        scored.append((score, highlight))
    scored.sort(key=lambda item: (item[0], len(item[1])), reverse=True)
    return [highlight for _, highlight in scored[:MAX_BULLET_COUNT]]


def keyword_in_text(keyword: str, text: str) -> bool:
    escaped = re.escape(keyword.lower()).replace(r'\ ', r'\s+')
    return bool(re.search(rf'\b{escaped}\b', text.lower()))


def matched_job_keywords(candidate_text: str, candidate_skills: list[str], job_skills: list[str]) -> list[str]:
    candidate_lookup = {normalize_blob(skill): skill for skill in candidate_skills if skill}
    matches: list[str] = []
    seen = set()

    for skill in job_skills:
        normalized = normalize_blob(skill)
        if not normalized or normalized in seen:
            continue
        matched = candidate_lookup.get(normalized)
        if matched:
            seen.add(normalized)
            matches.append(matched)
            continue
        if keyword_in_text(skill, candidate_text):
            seen.add(normalized)
            matches.append(skill)

    return matches[:6]


def top_overlap_terms(resume_vector, job_vector, feature_names) -> list[str]:
    overlapping = resume_vector.multiply(job_vector)
    if overlapping.nnz == 0:
        return []

    scored = list(zip(overlapping.indices, overlapping.data))
    scored.sort(key=lambda item: item[1], reverse=True)
    terms = []
    for index, _ in scored:
        term = feature_names[index].strip()
        if not term or term in GENERIC_OVERLAP_TERMS:
            continue
        if any(part in GENERIC_OVERLAP_TERMS for part in term.split()):
            continue
        formatted = term.title()
        if formatted not in terms:
            terms.append(formatted)
        if len(terms) == 6:
            break
    return terms
