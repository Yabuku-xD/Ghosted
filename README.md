<p align="center">
  <img src="assets/banner.png" alt="Ghosted" width="100%">
</p>

# Ghosted

<p align="center">
  <a href="docs/"><img src="https://img.shields.io/badge/Docs-Repository%20Guide-6B7280?style=for-the-badge" alt="Docs" /></a>
  <a href="backend/data/README.md"><img src="https://img.shields.io/badge/Data-DOL%20%2B%20Community-FFD700?style=for-the-badge" alt="Data sources" /></a>
  <a href="https://github.com/Yabuku-xD/Ghosted/releases"><img src="https://img.shields.io/github/v/release/Yabuku-xD/Ghosted?display_name=tag&label=Release&color=C73E1D&style=for-the-badge" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-2D6A4F?style=for-the-badge" alt="License MIT" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%2019-1D4E89?style=for-the-badge" alt="Frontend React 19" /></a>
  <a href="https://www.djangoproject.com/"><img src="https://img.shields.io/badge/Backend-Django%20%2B%20DRF-2D6A4F?style=for-the-badge" alt="Backend Django and DRF" /></a>
</p>

Visa-aware job intelligence platform with H-1B data, live jobs, salary insights, company comparison, and prediction tools.

Ghosted combines public H-1B/LCA data with salary records, company enrichment, and live hiring signals in a Dockerized full-stack app. The product is now built around five public workflows: company discovery, live jobs, salary intelligence, company comparison, and prediction tools for compensation and sponsorship odds.

Current tracked release: `v0.5.0`

![Ghosted homepage](assets/home.png)

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Data Imports](#data-imports)
- [Repository Layout](#repository-layout)
- [Docs](#docs)
- [Contributing](#contributing)
- [License](#license)

## Background

Ghosted exists to answer a practical question for international candidates: which companies are likely to sponsor, how strong is the salary signal, and where are there active hiring opportunities right now?

The stack currently includes:

- Backend: Django, Django REST Framework, Celery, PostgreSQL, Redis
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query
- Infra: Docker Compose

Core product capabilities:

- Sponsorship-focused company discovery with visa-fair scoring
- Live jobs browsing with source-linked outbound apply flows
- Offer browsing with trust metadata and responsive pagination
- Domain and logo enrichment with graceful fallback rendering
- Automated ATS sync and discovery from supported public job boards
- Side-by-side company comparison
- Salary prediction and sponsorship-odds tools

## Install

### Dependencies

For the default local setup, install:

- Docker Desktop with Docker Compose

For manual development instead of Docker, also install:

- Python 3.12+
- Node.js 20+
- npm

### Docker

```bash
docker compose up --build
```

This starts the frontend, backend API, database, cache, Celery worker, Celery Beat scheduler, and the supporting local services defined in [`docker-compose.yml`](docker-compose.yml).

### Manual Development

Backend:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Usage

Once the app is running, the public product surface centers on five areas:

- `Companies`: browse sponsorship-friendly employers, visa scores, trust signals, and company detail pages
- `Jobs`: search live ATS roles with visa-aware ranking, freshness, and salary evidence signals
- `Offers`: explore salary records with source metadata, filters, and pagination
- `Compare`: evaluate two companies side by side on sponsorship strength, salary coverage, and live jobs
- `Predictions`: estimate salary expectations and sponsorship odds from the currently available market data

Useful local verification commands:

```bash
docker compose exec frontend npm run build
docker compose exec backend python manage.py check
```

## Configuration

### Local Data

Raw source files are intentionally not committed. Put them in [`backend/data/`](backend/data/) and follow [`backend/data/README.md`](backend/data/README.md) when you want to seed or refresh local data.

### Branding And Logos

For fuller company-logo coverage, add a Logo.dev publishable key to `frontend/.env`:

```bash
VITE_LOGO_DEV_PUBLISHABLE_KEY=your_key_here
```

Without that key, the UI falls back to favicon-based branding when a known company domain is available.

## Data Imports

Run import and enrichment commands from `backend/`:

```bash
python manage.py import_h1b_directory ./data --skip-existing --recalculate-scores
python manage.py enrich_company_branding --limit 10000
python manage.py sync_job_postings --limit 100
```

These commands are useful when you want to:

- load multiple DOL disclosure files
- enrich company domains and branding metadata
- discover and refresh jobs from supported Greenhouse, Lever, and Ashby boards
- let the app infer public job boards from company websites and careers pages

After deployment, recurring job discovery and refresh are scheduled through Celery Beat so the jobs surface can keep itself fresh without manual reruns.

## Repository Layout

```text
ghosted/
├── backend/                  # Django apps, API, import commands, services
├── frontend/                 # React application
├── docs/                     # Plans, status notes, verification assets
├── CHANGELOG.md              # Release notes
├── LICENSE                   # MIT license
└── docker-compose.yml        # Local multi-service setup
```

## Docs

- [Changelog](CHANGELOG.md)
- [Plans](docs/plans/)
- [Status Notes](docs/status/)
- [Verification Assets](docs/verification/)

## Contributing

Issues and focused pull requests are welcome. When proposing a change:

- keep the README and changelog aligned with the actual code changes
- include the relevant verification steps or results
- avoid documenting features that are not implemented yet

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
