from __future__ import annotations

import re
from collections import Counter
from datetime import timedelta
from typing import Iterable

from django.utils import timezone
from sklearn.feature_extraction.text import CountVectorizer


SKILL_CONTEXT_PATTERNS = (
    re.compile(
        r'(?:experience with|experienced in|expertise in|expert in|proficient in|proficiency in|'
        r'skilled in|knowledge of|familiarity with|hands-on experience with|working knowledge of|'
        r'tools? such as|technologies? such as|stack includes|background in)\s+([^.;:\n]+)',
        flags=re.IGNORECASE,
    ),
    re.compile(r'(?:skills?|technologies|tooling)\s*[:\-]\s*([^\n]+)', flags=re.IGNORECASE),
)

SKILL_LINE_PATTERNS = (
    re.compile(
        r'^(?:languages?(?:/tools?)?|tools?|frameworks?(?:/libraries?)?|libraries?|technologies|databases?|'
        r'platforms?|cloud|infrastructure)\s*[:\-]\s*(.+)$',
        flags=re.IGNORECASE,
    ),
)

SKILL_STOPWORDS = {
    'ability', 'abilities', 'about', 'across', 'advanced', 'analysis', 'analytical', 'and', 'any', 'architecture',
    'background', 'best', 'business', 'candidate', 'clients', 'collaboration', 'collaborative', 'communication',
    'company', 'complex', 'cross', 'customer', 'customers', 'data', 'delivery', 'demonstrated', 'design', 'develop',
    'development', 'driven', 'education', 'effective', 'environment', 'engineering', 'ensure', 'excellent', 'experience',
    'experienced', 'field', 'focus', 'for', 'from', 'functional', 'good', 'hands', 'have', 'high', 'in', 'including',
    'innovative', 'internal', 'job', 'knowledge', 'leadership', 'level', 'management', 'manager', 'methodologies',
    'modern', 'multiple', 'operations', 'organization', 'passion', 'platform', 'plus', 'preferred', 'problem', 'process',
    'product', 'products', 'professional', 'program', 'project', 'quality', 'related', 'requirements', 'responsibilities',
    'results', 'role', 'scalable', 'self', 'services', 'skills', 'solutions', 'software', 'strong', 'systems', 'team',
    'teams', 'technical', 'technology', 'their', 'through', 'tools', 'track', 'using', 'various', 'with', 'work',
    'working', 'written', 'years',
}

COMMON_FILLER_PHRASES = {
    'degree',
    'bachelor',
    'master',
    'computer science',
    'preferred qualifications',
    'required qualifications',
    'nice to have',
    'problem solving',
    'time management',
}

GENERIC_SKILL_BLACKLIST = {
    'automated',
    'automation',
    'built',
    'deployment',
    'developer',
    'education',
    'feedback',
    'frameworks',
    'github',
    'gmail',
    'inbox',
    'intelligence',
    'learn',
    'learning',
    'libraries',
    'linkedin',
    'real',
    'research',
    'seattle',
    'stack',
    'technologies',
    'technology',
    'time',
    'using',
    'washington',
}

MONTH_WORDS = {
    'jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april', 'may', 'jun', 'june',
    'jul', 'july', 'aug', 'august', 'sep', 'sept', 'september', 'oct', 'october', 'nov',
    'november', 'dec', 'december',
}

FAMILY_KEYWORDS = {
    'software-engineering': (
        'software engineer',
        'backend',
        'frontend',
        'full stack',
        'developer',
        'platform',
        'infrastructure',
        'site reliability',
        'sre',
        'devops',
        'application engineer',
    ),
    'data': (
        'data engineer',
        'data scientist',
        'data analyst',
        'analytics',
        'machine learning',
        'ml engineer',
        'business intelligence',
        'statistician',
    ),
    'product': (
        'product manager',
        'program manager',
        'project manager',
        'technical program manager',
        'product operations',
    ),
    'design': (
        'designer',
        'design',
        'ux',
        'ui',
        'user research',
        'ux research',
        'design research',
    ),
    'sales': (
        'sales',
        'account executive',
        'account manager',
        'solutions architect',
        'customer success',
        'partnerships',
    ),
    'operations': (
        'operations',
        'business operations',
        'strategy',
        'finance',
        'supply chain',
        'people operations',
    ),
    'security': (
        'security',
        'cybersecurity',
        'compliance',
        'risk',
        'trust',
    ),
    'legal': (
        'legal',
        'counsel',
        'paralegal',
        'contracts',
    ),
}

FAMILY_DISPLAY = {
    'software-engineering': 'Software Engineering',
    'data': 'Data & Analytics',
    'product': 'Product & Program',
    'design': 'Design & Research',
    'sales': 'Sales & Solutions',
    'operations': 'Operations & Finance',
    'security': 'Security & Compliance',
    'legal': 'Legal',
    'general': 'Generalist',
}

SENIORITY_PATTERNS = (
    ('executive', (r'\bchief\b', r'\bvp\b', r'\bvice president\b', r'\bdirector\b', r'\bhead of\b')),
    ('manager', (r'\bmanager\b', r'\blead\b', r'\bsupervisor\b')),
    ('principal', (r'\bprincipal\b', r'\bdistinguished\b')),
    ('staff', (r'\bstaff\b', r'\bsenior staff\b')),
    ('senior', (r'\bsenior\b', r'\bsr\.?\b')),
    ('entry', (r'\bentry\b', r'\bjunior\b', r'\bassociate\b', r'\bnew grad\b', r'\bintern\b')),
)

SENIORITY_ORDER = {
    'entry': 1,
    'mid': 2,
    'senior': 3,
    'staff': 4,
    'principal': 5,
    'manager': 6,
    'executive': 7,
}

YEAR_PATTERNS = (
    re.compile(r'(\d{1,2})\s*\+\s*(?:years?|yrs?)', flags=re.IGNORECASE),
    re.compile(r'at least\s+(\d{1,2})\s+(?:years?|yrs?)', flags=re.IGNORECASE),
    re.compile(r'min(?:imum)?\.?\s+of\s+(\d{1,2})\s+(?:years?|yrs?)', flags=re.IGNORECASE),
    re.compile(r'(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years?|yrs?)', flags=re.IGNORECASE),
    re.compile(r'(\d{1,2})\s+(?:years?|yrs?)\s+of\s+experience', flags=re.IGNORECASE),
)


def normalize_blob(*parts: str) -> str:
    combined = ' '.join(part for part in parts if part)
    return re.sub(r'\s+', ' ', combined).strip().lower()


def extract_skills(text: str, limit: int = 12) -> list[str]:
    normalized = normalize_blob(text)
    if not normalized:
        return []

    candidates: Counter[str] = Counter()

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        for pattern in SKILL_LINE_PATTERNS:
            match = pattern.match(stripped)
            if not match:
                continue
            fragment = match.group(1)
            for part in re.split(r',|/|;|\||\band\b|\bor\b', fragment, flags=re.IGNORECASE):
                phrase = clean_skill_phrase(part, source='explicit')
                if phrase:
                    candidates[phrase] += 6

    for pattern in SKILL_CONTEXT_PATTERNS:
        for match in pattern.finditer(text):
            fragment = match.group(1)
            for part in re.split(r',|/|;|\||\band\b|\bor\b', fragment, flags=re.IGNORECASE):
                phrase = clean_skill_phrase(part, source='context')
                if phrase:
                    candidates[phrase] += 4

    try:
        vectorizer = CountVectorizer(
            stop_words='english',
            ngram_range=(1, 3),
            token_pattern=r'(?u)\b[a-zA-Z][a-zA-Z0-9.+#/-]{1,}\b',
            lowercase=True,
        )
        matrix = vectorizer.fit_transform([normalized])
        for term, score in zip(vectorizer.get_feature_names_out(), matrix.toarray()[0]):
            if not score:
                continue
            phrase = clean_skill_phrase(term, source='ngram')
            if phrase:
                candidates[phrase] += int(score)
    except ValueError:
        pass

    ranked = sorted(
        candidates.items(),
        key=lambda item: (
            item[1],
            any(char.isupper() for char in item[0]),
            len(item[0].split()) > 1,
            len(item[0]),
        ),
        reverse=True,
    )
    return [label for label, _ in ranked[:limit]]


def clean_skill_phrase(raw: str, source: str = 'generic') -> str | None:
    phrase = re.sub(r'\b([A-Z])\s+(?=[A-Za-z]{2,}\b)', r'\1', raw or '').strip()
    phrase = re.sub(r'^[•*\-\s]+', '', phrase).strip()
    phrase = re.sub(r'\([^)]*\)', '', phrase)
    phrase = re.sub(r'[^A-Za-z0-9.+#/\-\s]', ' ', phrase)
    phrase = re.sub(r'\s+', ' ', phrase).strip()
    if not phrase:
        return None

    lowered = phrase.lower()
    if (
        lowered in COMMON_FILLER_PHRASES
        or lowered in GENERIC_SKILL_BLACKLIST
        or lowered in MONTH_WORDS
        or '@' in raw
        or '.com' in lowered
        or '.org' in lowered
        or '.net' in lowered
        or 'http' in lowered
        or 'www.' in lowered
    ):
        return None

    words = lowered.split()
    if not words or len(words) > 4:
        return None
    if source == 'ngram' and len(words) == 1:
        return None
    if all(word in SKILL_STOPWORDS for word in words):
        return None
    if sum(1 for word in words if word in SKILL_STOPWORDS) > max(1, len(words) - 1):
        return None
    if len(words) == 1 and words[0] in GENERIC_SKILL_BLACKLIST:
        return None

    cleaned_words = [word for word in words if word not in SKILL_STOPWORDS]
    if not cleaned_words:
        return None
    if any(word in MONTH_WORDS for word in cleaned_words):
        return None
    if len(cleaned_words) == 1 and cleaned_words[0] in GENERIC_SKILL_BLACKLIST:
        return None
    if source == 'ngram' and len(cleaned_words) == 1:
        return None

    title = ' '.join(format_skill_token(word) for word in cleaned_words)
    if len(title) < 2:
        return None
    return title


def format_skill_token(token: str) -> str:
    lowered = token.lower()
    if lowered in {'aws', 'gcp', 'sql', 'api', 'apis', 'ux', 'ui', 'ml', 'ai', 'etl', 'seo', 'jwt', 'ssl', 'tls', 'ci', 'cd', 'mvc', 'ood'}:
        return lowered.upper()
    if lowered == 'javascript':
        return 'JavaScript'
    if lowered == 'typescript':
        return 'TypeScript'
    if lowered in {'node', 'node.js'}:
        return 'Node.js'
    if lowered in {'react', 'react.js'}:
        return 'React'
    if lowered == 'postgresql':
        return 'PostgreSQL'
    if lowered == 'mysql':
        return 'MySQL'
    if lowered == 'mongodb':
        return 'MongoDB'
    if lowered == 'github':
        return 'GitHub'
    if lowered == 'figma':
        return 'Figma'
    if lowered == 'numpy':
        return 'NumPy'
    if lowered == 'pandas':
        return 'Pandas'
    if lowered == 'faiss':
        return 'FAISS'
    if lowered == 'power' or lowered == 'bi':
        return token.title()
    if '+' in token or '#' in token or '.' in token or '/' in token:
        return token
    return token.title()


def infer_role_family(*parts: str) -> str:
    normalized = normalize_blob(*parts)
    if not normalized:
        return 'general'

    scores: Counter[str] = Counter()
    for family, keywords in FAMILY_KEYWORDS.items():
        for keyword in keywords:
            keyword_pattern = r'\b' + re.escape(keyword).replace(r'\ ', r'\s+') + r'\b'
            if re.search(keyword_pattern, normalized, flags=re.IGNORECASE):
                scores[family] += 1

    if not scores:
        return 'general'

    return scores.most_common(1)[0][0]


def role_family_display(family: str) -> str:
    return FAMILY_DISPLAY.get(family or 'general', 'Generalist')


def infer_seniority(*parts: str) -> str:
    normalized = normalize_blob(*parts)
    for label, patterns in SENIORITY_PATTERNS:
        if any(re.search(pattern, normalized, flags=re.IGNORECASE) for pattern in patterns):
            return label
    return 'mid'


def parse_required_years(*parts: str) -> int | None:
    normalized = normalize_blob(*parts)
    candidates: list[int] = []

    for pattern in YEAR_PATTERNS:
        for match in pattern.finditer(normalized):
            values = [int(value) for value in match.groups() if value is not None]
            if values:
                candidates.append(max(values))

    if not candidates:
        return None

    capped = min(max(candidates), 20)
    return capped


def trust_level_from_score(score: int) -> str:
    if score >= 78:
        return 'high'
    if score >= 58:
        return 'good'
    if score >= 38:
        return 'emerging'
    return 'limited'


def compute_job_trust(job) -> dict:
    score = 0
    notes = []
    stale_warning = None
    now = timezone.now()

    if getattr(job, 'source', '') in {'greenhouse', 'lever', 'ashby'}:
        score += 34
        notes.append('Imported from a structured ATS source.')

    last_seen_at = getattr(job, 'last_seen_at', None)
    if last_seen_at:
        age = now - last_seen_at
        if age <= timedelta(days=2):
            score += 24
            notes.append('Refreshed within the last 48 hours.')
        elif age <= timedelta(days=7):
            score += 16
            notes.append('Refreshed within the last week.')
        else:
            stale_warning = 'Refresh is getting older, so verify the role on the source board.'
    else:
        stale_warning = 'Last refresh time is unavailable for this job.'

    if getattr(job, 'posted_at', None):
        score += 8

    if getattr(job, 'salary_min', None) or getattr(job, 'salary_max', None):
        score += 12
        notes.append('Compensation is posted directly on the listing.')
    elif getattr(job, 'company_offer_count', 0):
        score += 6
        notes.append('Historical salary data exists for this employer.')

    company = getattr(job, 'company', None)
    if company is not None:
        if getattr(company, 'total_h1b_filings', 0) >= 25:
            score += 10
            notes.append('Employer maps to a historical sponsorship record.')
        if getattr(company, 'company_domain', ''):
            score += 6

    score = min(score, 100)
    return {
        'score': score,
        'level': trust_level_from_score(score),
        'notes': notes[:3],
        'stale_warning': stale_warning,
    }


def relevant_skill_overlap(candidate_skills: Iterable[str], job_skills: Iterable[str]) -> list[str]:
    candidate_lookup = {skill.lower(): skill for skill in candidate_skills}
    overlap = []
    for skill in job_skills:
        matched = candidate_lookup.get(skill.lower())
        if matched:
            overlap.append(matched)
    return overlap


def seniority_gap(candidate_seniority: str, job_seniority: str) -> int:
    return SENIORITY_ORDER.get(candidate_seniority or 'mid', 2) - SENIORITY_ORDER.get(job_seniority or 'mid', 2)
