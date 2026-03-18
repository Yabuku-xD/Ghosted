# Ghosted

Ghosted is a visa-aware job intelligence platform for international candidates. It combines public H-1B/LCA data with company insights, salary intelligence, and application tracking in a Dockerized full-stack app.

## Version

Current tracked release: `v0.1.0`

## Stack

- Backend: Django, Django REST Framework, Celery, PostgreSQL, Redis
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query
- Infra: Docker Compose

## Product Highlights

- Sponsorship-focused company discovery with visa-fair scoring
- Offer browsing with trust metadata and responsive pagination
- Salary prediction and lottery risk tools
- Authenticated dashboard with job application tracking
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

## Useful Docs

- [Changelog](CHANGELOG.md)
- [Plans](docs/plans/)
- [Status Notes](docs/status/)
- [Verification Assets](docs/verification/)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
