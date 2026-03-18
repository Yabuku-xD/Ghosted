# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-03-17

### Fixed
- Compare-company search selections now lock in immediately after a click instead of leaving the suggestion dropdown open.
- Both compare pickers now preserve the chosen company card while async comparison data catches up, preventing the UI from feeling unselected.

### Notes
- Verified live in the browser with Amazon and Microsoft selections on the compare page.

## [0.2.0] - 2026-03-17

### Added
- Company enrichment support for domains, logo metadata, careers links, live jobs, and benefits coverage.
- A new compare flow for side-by-side company evaluation on sponsorship strength, salary coverage, and active jobs.
- Import commands for branding enrichment and public Greenhouse job ingestion.
- Frontend logo fallback logic that can use explicit logos, Logo.dev, favicon-based branding, or initials.

### Changed
- Company detail pages now surface careers links, live jobs, similar companies, trust details, and actionable applicant guidance.
- Company and offer APIs now expose richer domain and branding metadata for UI rendering.
- Home and companies pages now highlight hiring activity, enrichment progress, and comparison entry points.
- Local environment examples and Docker Compose now document the optional Logo.dev publishable key.

### Notes
- This release is intended as the first richer data/enrichment milestone after the initial MVP.
- Full Logo.dev-powered coverage still requires a `VITE_LOGO_DEV_PUBLISHABLE_KEY` in the frontend environment.

## [0.1.0] - 2026-03-17

### Added
- Full-stack Ghosted application with Django, Django REST Framework, React, and Docker Compose.
- Visa-focused company discovery, offer browsing, salary prediction, and user dashboard flows.
- Supporting project documentation, setup notes, plans, and verification assets under `docs/`.

### Changed
- Aligned frontend and backend API contracts for auth, predictions, company detail, dashboard flows, and application creation.
- Improved responsive behavior across key pages, especially `Offers` and `Companies`.
- Standardized pagination to 15 items per page on company and offer listings.
- Defaulted company and offer browsing to predictable alphabetical ordering where appropriate.
- Added repo-level Git hygiene with ignores for local runtime files, caches, logs, and raw data drops.

### Notes
- Raw H-1B source files and local SQLite/runtime artifacts are intentionally excluded from Git.
- The initial tracked release is tagged as `v0.1.0`.
