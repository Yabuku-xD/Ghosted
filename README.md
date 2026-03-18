# Ghosted

Ghosted is a visa-aware job intelligence platform for international candidates. It combines public H-1B/LCA data with company insights, salary intelligence, and live hiring signals in a Dockerized full-stack app.

## Version

Current tracked release: `v0.3.4`

## Stack

- Backend: Django, Django REST Framework, Celery, PostgreSQL, Redis
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query
- Infra: Docker Compose

## Product Highlights

- Sponsorship-focused company discovery with visa-fair scoring
- Offer browsing with trust metadata and responsive pagination
- Domain and logo enrichment with graceful fallback rendering
- Live hiring signals from public ATS boards and side-by-side company comparison
- Salary prediction and lottery risk tools
- Public, no-login browsing flow centered on four core areas: Companies, Offers, Compare, and Predictions
- Lighter frontend boot path with reduced refetching and smaller search payloads
- H-1B data import pipeline and company enrichment commands

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

## Running Locally

### Docker

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000/api](http://localhost:8000/api)
- Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

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

## Data Setup

Raw H-1B source files are intentionally not committed. Put them in [`backend/data/`](backend/data/) and follow the instructions in [`backend/data/README.md`](backend/data/README.md) when you want to seed local data.

Useful enrichment commands:

```bash
cd backend
python manage.py import_h1b_directory ./data --skip-existing --recalculate-scores
python manage.py enrich_company_branding --limit 10000
python manage.py import_greenhouse_jobs --limit 10
```

For full company logos, add a Logo.dev publishable key to `frontend/.env` as `VITE_LOGO_DEV_PUBLISHABLE_KEY`. Without it, the UI falls back to favicon-based branding when a company domain is known.

## Useful Docs

- [Changelog](CHANGELOG.md)
- [Plans](docs/plans/)
- [Status Notes](docs/status/)
- [Verification Assets](docs/verification/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
