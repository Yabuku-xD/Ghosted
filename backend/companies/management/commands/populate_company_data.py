"""
Populate company websites and generate offers from H1B data.
"""
import re
import random
from urllib.parse import urlparse
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count, Avg
from companies.models import Company
from offers.models import Offer
from h1b_data.models import H1BApplication

# Known company domains for logo support
COMPANY_DOMAINS = {
    # Big Tech
    'google': 'google.com',
    'amazon': 'amazon.com',
    'microsoft': 'microsoft.com',
    'apple': 'apple.com',
    'meta': 'meta.com',
    'facebook': 'facebook.com',
    'netflix': 'netflix.com',
    'tesla': 'tesla.com',
    'nvidia': 'nvidia.com',
    'adobe': 'adobe.com',

    # Tech Companies
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'intel': 'intel.com',
    'cisco': 'cisco.com',
    'vmware': 'vmware.com',
    'sap': 'sap.com',
    'servicenow': 'servicenow.com',
    'workday': 'workday.com',
    'splunk': 'splunk.com',
    'atlassian': 'atlassian.com',
    'zoom': 'zoom.us',
    'slack': 'slack.com',
    'dropbox': 'dropbox.com',
    'airbnb': 'airbnb.com',
    'uber': 'uber.com',
    'lyft': 'lyft.com',
    'doordash': 'doordash.com',
    'instacart': 'instacart.com',
    'stripe': 'stripe.com',
    'square': 'squareup.com',
    'coinbase': 'coinbase.com',
    'robinhood': 'robinhood.com',
    'twitter': 'twitter.com',
    'linkedin': 'linkedin.com',
    'pinterest': 'pinterest.com',
    'snap': 'snap.com',
    'snapchat': 'snap.com',
    'spotify': 'spotify.com',
    'shopify': 'shopify.com',
    'twilio': 'twilio.com',
    'datadog': 'datadoghq.com',
    'mongodb': 'mongodb.com',
    'gitlab': 'gitlab.com',
    'github': 'github.com',
    'figma': 'figma.com',
    'notion': 'notion.so',
    'canva': 'canva.com',
    'discord': 'discord.com',
    'reddit': 'reddit.com',
    'quora': 'quora.com',
    'yelp': 'yelp.com',
    'glassdoor': 'glassdoor.com',
    'indeed': 'indeed.com',
    'expedia': 'expedia.com',
    'booking': 'booking.com',
    'paypal': 'paypal.com',
    'venmo': 'venmo.com',
    'intuit': 'intuit.com',
    'autodesk': 'autodesk.com',
    'ansys': 'ansys.com',
    'mathworks': 'mathworks.com',
    'nvidia': 'nvidia.com',
    'qualcomm': 'qualcomm.com',
    'broadcom': 'broadcom.com',
    'amd': 'amd.com',
    'texas instruments': 'ti.com',
    'micron': 'micron.com',
    'applied materials': 'amat.com',

    # Consulting
    'deloitte': 'deloitte.com',
    'pwc': 'pwc.com',
    'ernst & young': 'ey.com',
    'ey': 'ey.com',
    'kpmg': 'kpmg.com',
    'mckinsey': 'mckinsey.com',
    'boston consulting': 'bcg.com',
    'bcg': 'bcg.com',
    'bain': 'bain.com',
    'accenture': 'accenture.com',
    'capgemini': 'capgemini.com',
    'infosys': 'infosys.com',
    'tcs': 'tcs.com',
    'tata consultancy': 'tcs.com',
    'wipro': 'wipro.com',
    'hcl': 'hcltech.com',
    'cognizant': 'cognizant.com',

    # Finance
    'goldman sachs': 'goldmansachs.com',
    'morgan stanley': 'morganstanley.com',
    'jpmorgan': 'jpmorgan.com',
    'jp morgan': 'jpmorgan.com',
    'bank of america': 'bankofamerica.com',
    'wells fargo': 'wellsfargo.com',
    'citigroup': 'citigroup.com',
    'citi': 'citigroup.com',
    'barclays': 'barclays.com',
    'credit suisse': 'credit-suisse.com',
    'ubs': 'ubs.com',
    'deutsche bank': 'db.com',
    'blackrock': 'blackrock.com',
    'bridgewater': 'bridgewater.com',
    'citadel': 'citadel.com',
    'two sigma': 'twosigma.com',
    'jane street': 'janestreet.com',
    'hudson river trading': 'hudsonrivertrading.com',

    # Healthcare
    'johnson & johnson': 'jnj.com',
    'pfizer': 'pfizer.com',
    'merck': 'merck.com',
    'abbvie': 'abbvie.com',
    'bristol-myers squibb': 'bms.com',
    'eli lilly': 'lilly.com',
    'amgen': 'amgen.com',
    'gilead': 'gilead.com',
    'moderna': 'moderna.com',
    'regeneron': 'regeneron.com',
    'biogen': 'biogen.com',
    'vertex': 'vrtx.com',
    'illumina': 'illumina.com',

    # Retail/E-commerce
    'walmart': 'walmart.com',
    'target': 'target.com',
    'costco': 'costco.com',
    'home depot': 'homedepot.com',
    'lowes': 'lowes.com',
    'best buy': 'bestbuy.com',
    'ebay': 'ebay.com',
    'etsy': 'etsy.com',
    'wayfair': 'wayfair.com',

    # Automotive
    'ford': 'ford.com',
    'general motors': 'gm.com',
    'gm': 'gm.com',
    'toyota': 'toyota.com',
    'honda': 'honda.com',
    'bmw': 'bmw.com',
    'mercedes': 'mercedes-benz.com',
    'volkswagen': 'vw.com',
    'hyundai': 'hyundai.com',

    # Media/Entertainment
    'disney': 'thewaltdisneycompany.com',
    'warner bros': 'warnerbros.com',
    'paramount': 'paramount.com',
    'comcast': 'comcastcorporation.com',
    'nbcuniversal': 'nbcuniversal.com',
    'sony': 'sony.com',
    'activision': 'activisionblizzard.com',
    'electronic arts': 'ea.com',
    'ea': 'ea.com',
    'blizzard': 'blizzard.com',

    # Other notable
    'boeing': 'boeing.com',
    'lockheed martin': 'lockheedmartin.com',
    'raytheon': 'raytheon.com',
    'northrop grumman': 'northropgrumman.com',
    'space x': 'spacex.com',
    'spacex': 'spacex.com',
    'openai': 'openai.com',
    'anthropic': 'anthropic.com',
    'databricks': 'databricks.com',
    'snowflake': 'snowflake.com',
    'palantir': 'palantir.com',
    'plaid': 'plaid.com',
    'notion': 'notion.so',
    'linear': 'linear.app',
    'vercel': 'vercel.com',
    'cloudflare': 'cloudflare.com',
    'fastly': 'fastly.com',
    'akamai': 'akamai.com',
    'confluent': 'confluent.io',
    'elastic': 'elastic.co',
    'hashicorp': 'hashicorp.com',
    'grafana': 'grafana.com',
    'pagerduty': 'pagerduty.com',
}


class Command(BaseCommand):
    help = 'Populate company websites and generate offers from H1B data'

    def add_arguments(self, parser):
        parser.add_argument('--websites-only', action='store_true', help='Only update websites')
        parser.add_argument('--offers-only', action='store_true', help='Only generate offers')
        parser.add_argument('--overwrite-existing', action='store_true', help='Replace existing websites when a better match is found')
        parser.add_argument('--clear-unmatched', action='store_true', help='Clear existing heuristic websites when no confident domain match exists')
        parser.add_argument('--limit', type=int, default=50000, help='Max offers to generate')

    def handle(self, *args, **options):
        websites_only = options['websites_only']
        offers_only = options['offers_only']
        overwrite_existing = options['overwrite_existing']
        clear_unmatched = options['clear_unmatched']
        limit = options['limit']

        if not offers_only:
            self.update_websites(
                overwrite_existing=overwrite_existing,
                clear_unmatched=clear_unmatched,
            )

        if not websites_only:
            self.generate_offers(limit)

    def normalize_company_tokens(self, name):
        normalized = re.sub(r'[^a-z0-9]+', ' ', (name or '').lower()).strip()
        return [token for token in normalized.split() if token]

    def match_company_domain(self, company_name):
        company_tokens = self.normalize_company_tokens(company_name)
        if not company_tokens:
            return None

        company_token_set = set(company_tokens)
        ranked_domains = sorted(
            COMPANY_DOMAINS.items(),
            key=lambda item: len(self.normalize_company_tokens(item[0])),
            reverse=True,
        )

        for alias, domain in ranked_domains:
            alias_tokens = self.normalize_company_tokens(alias)
            if alias_tokens and set(alias_tokens).issubset(company_token_set):
                return domain

        return None

    def extract_domain(self, website):
        if not website:
            return ''
        parsed = urlparse(website)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain

    def update_websites(self, overwrite_existing=False, clear_unmatched=False):
        """Update company websites based on known domains"""
        self.stdout.write('Updating company websites...')

        updated = 0
        cleared = 0
        companies = Company.objects.all()
        known_domains = set(COMPANY_DOMAINS.values())

        for company in companies:
            domain = self.match_company_domain(company.name)
            if not domain:
                current_domain = self.extract_domain(company.website)
                if overwrite_existing and clear_unmatched and current_domain in known_domains:
                    company.website = ''
                    company.save(update_fields=['website'])
                    cleared += 1
                continue

            website = f'https://www.{domain}'
            if overwrite_existing or not company.website:
                if company.website != website:
                    company.website = website
                    company.save(update_fields=['website'])
                    updated += 1

        self.stdout.write(self.style.SUCCESS(f'Updated {updated} company websites'))
        if cleared:
            self.stdout.write(self.style.SUCCESS(f'Cleared {cleared} low-confidence websites'))

        # Show companies with websites
        total_with_website = Company.objects.exclude(website='').count()
        self.stdout.write(f'Total companies with websites: {total_with_website}')

    def generate_offers(self, limit):
        """Generate offers from H1B application data"""
        self.stdout.write('Generating offers from H1B data...')

        # Get certified H1B applications with good data
        applications = H1BApplication.objects.filter(
            case_status='certified',
            wage_rate_of_pay_from__gt=0,
        ).exclude(
            job_title='',
        ).select_related('employer').order_by('-decision_date')[:limit]

        self.stdout.write(f'Found {applications.count()} certified applications to process')

        offers_to_create = []
        seen_combos = set()

        # Experience level mapping based on job title
        senior_keywords = ['senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director', 'head']
        junior_keywords = ['junior', 'entry', 'intern', 'associate', 'graduate']

        for app in applications:
            # Skip duplicates
            combo = (app.employer_name, app.job_title, str(app.wage_rate_of_pay_from))
            if combo in seen_combos:
                continue
            seen_combos.add(combo)

            # Determine experience level
            job_title_lower = app.job_title.lower()
            if any(kw in job_title_lower for kw in senior_keywords):
                experience_level = 'senior'
                years_exp = random.randint(6, 10)
            elif any(kw in job_title_lower for kw in junior_keywords):
                experience_level = 'entry'
                years_exp = random.randint(0, 2)
            else:
                experience_level = random.choice(['entry', 'mid', 'senior'])
                if experience_level == 'entry':
                    years_exp = random.randint(0, 2)
                elif experience_level == 'mid':
                    years_exp = random.randint(3, 5)
                else:
                    years_exp = random.randint(6, 10)

            # Determine visa type - map to Offer model choices
            if app.visa_class == 'H-1B':
                visa_type = 'h1b'
            elif app.visa_class == 'E-3':
                visa_type = 'e3'
            else:
                visa_type = 'h1b'

            # Calculate total compensation (base + ~20% for senior roles)
            base_salary = float(app.wage_rate_of_pay_from)
            if experience_level == 'senior':
                total_comp = int(base_salary * 1.3)
            elif experience_level == 'mid':
                total_comp = int(base_salary * 1.15)
            else:
                total_comp = int(base_salary * 1.05)

            # Get or create company
            company = app.employer  # Already linked via FK
            if not company:
                # Try to find company by name
                try:
                    company = Company.objects.get(name__iexact=app.employer_name)
                except Company.DoesNotExist:
                    continue  # Skip if no company found

            offer = Offer(
                company=company,
                position_title=app.job_title[:200],
                location=f"{app.employer_city}, {app.employer_state}" if app.employer_city and app.employer_state else "USA",
                base_salary=int(base_salary),
                total_compensation=total_comp,
                experience_level=experience_level,
                years_of_experience=years_exp,
                visa_type=visa_type,
                is_verified=True,
            )
            offers_to_create.append(offer)

            if len(offers_to_create) >= 10000:
                break

        # Bulk create offers
        self.stdout.write(f'Creating {len(offers_to_create)} offers...')

        # Clear existing sample offers first
        Offer.objects.all().delete()

        Offer.objects.bulk_create(offers_to_create, batch_size=1000)

        self.stdout.write(self.style.SUCCESS(f'Created {len(offers_to_create)} offers from real H1B data'))

        # Stats
        avg_salary = Offer.objects.aggregate(avg=Avg('base_salary'))['avg'] or 0
        total_offers = Offer.objects.count()
        self.stdout.write(f'Average salary: ${avg_salary:,.0f}')
        self.stdout.write(f'Total offers: {total_offers}')
