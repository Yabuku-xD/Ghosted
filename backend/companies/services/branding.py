from urllib.parse import quote, urlencode, urlparse

from companies.management.commands.populate_company_data import COMPANY_DOMAINS


def normalize_company_name(company_name):
    return ' '.join((company_name or '').strip().split()).lower()


def extract_domain(value):
    if not value:
        return ''

    parsed = urlparse(value if '://' in value else f'https://{value}')
    domain = parsed.netloc.lower() or parsed.path.lower()
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain.strip('/')


def infer_domain_from_name(company_name):
    normalized = normalize_company_name(company_name)
    if not normalized:
        return None

    ranked_domains = sorted(COMPANY_DOMAINS.items(), key=lambda item: len(item[0]), reverse=True)
    for alias, domain in ranked_domains:
        if alias in normalized:
            return domain
    return None


def build_logo_dev_url(company_name, company_domain='', token='', size=128, fmt='png'):
    if not token:
        return None

    query = urlencode({
        'token': token,
        'size': size,
        'format': fmt,
        'retina': 'true',
    })

    if company_domain:
        identifier = quote(company_domain, safe='')
        return f'https://img.logo.dev/{identifier}?{query}'

    company_name = (company_name or '').strip()
    if not company_name:
        return None

    identifier = quote(company_name, safe='')
    return f'https://img.logo.dev/name/{identifier}?{query}'
