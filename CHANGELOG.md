# Changelog

All notable changes to this project will be documented in this file.

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
