# Changelog

All notable changes to this project will be documented in this file.

## [0.3.14] - 2026-03-18

### Changed
- Reworked the README hero to mirror the Hermes structure: a full-width `assets/banner.png` image, then a plain `# Ghosted` heading, then a centered badge row.
- Swapped the intro badges to a `for-the-badge` style and added a dedicated data-source badge for Department of Labor plus community data.

## [0.3.13] - 2026-03-18

### Changed
- Updated the homepage data-source strip to list only the actual source categories instead of mixing in the salary-record count.
- Added community submissions explicitly alongside Department of Labor in the homepage source copy.

## [0.3.12] - 2026-03-18

### Changed
- Replaced the README's plain ASCII heading with a reference-style Ghosted wordmark that more closely matches the requested retro stacked-letter treatment.
- Added a dedicated heading asset for the README hero while keeping the badge row and homepage preview layout intact.

## [0.3.11] - 2026-03-18

### Changed
- Replaced the README heading image with terminal-style Ghosted ASCII art so the main heading now comes directly from text-based diagram output.
- Removed the old SVG heading banner from the README flow after switching to the ASCII heading treatment.

## [0.3.10] - 2026-03-18

### Changed
- Reworked the README intro so the Ghosted art itself is the main heading and the badge row sits beneath it.
- Replaced the favicon with a Ghosted-specific monogram that matches the product palette.
- Simplified the browser tab title to `Ghosted` while keeping metadata branding aligned.

## [0.3.9] - 2026-03-18

### Changed
- Added README badges for the current release, license, frontend stack, backend stack, and Docker-based infrastructure.
- Added a themed `Ghosted` ASCII banner asset at the top of the README using the site's accent palette.

## [0.3.8] - 2026-03-18

### Changed
- Moved the homepage screenshot to the top of `README.md` so the preview appears immediately instead of later in the document.
- Removed the separate preview section and kept the table of contents aligned with the new README flow.

## [0.3.7] - 2026-03-18

### Changed
- Updated the repository-facing project description to match Ghosted's public product focus instead of the older generic monorepo wording.
- Added a homepage screenshot preview to `README.md` using `assets/home.png`.
- Removed explicit `localhost` service URLs from the public README and kept the Docker setup wording generic.

## [0.3.6] - 2026-03-18

### Changed
- Rebuilt `README.md` around the Standard Readme structure with clearer background, install, usage, configuration, data-import, and contributing sections.
- Updated the documented local workflow so setup and product entry points are easier to scan for new contributors.

## [0.3.5] - 2026-03-18

### Fixed
- Collapsed single-year company filing ranges on the company detail page so `Active Years` now shows `2025` instead of duplicated values like `2025-2025`.
- Kept multi-year ranges unchanged while preserving the existing responsive company-detail layout.

## [0.3.4] - 2026-03-18

### Changed
- Hid community-submission messaging and filters anywhere the live dataset still reports zero community records.
- Removed empty benefits surfaces from the public experience until real benefits data exists, including sparse company pages and benefit-count summaries.
- Replaced the home enrichment `Benefits` stat with a more truthful `Salary-backed` signal while benefits coverage remains empty.

### Fixed
- Stopped company-detail pages from fetching benefits data when a company has no tracked benefits.
- Verified home, offers, and company-detail layouts on desktop and narrow mobile widths with no horizontal overflow after the cleanup.

## [0.3.3] - 2026-03-18

### Changed
- Reworked the homepage and companies summary metrics into lighter editorial strips instead of repeating the same boxed stat card treatment.
- Restyled company-detail applicant guidance, live jobs, and benefits sections to read more like narrative product surfaces and less like empty placeholder panels.

### Fixed
- Verified the refreshed home, companies, and company-detail layouts on desktop and narrow mobile widths with no horizontal overflow.

## [0.3.2] - 2026-03-17

### Changed
- Redesigned the predictions page hero into a richer editorial layout with dynamic tool context, dataset callouts, and stronger visual hierarchy.
- Upgraded the salary predictor and sponsorship odds tabs into card-style selectors with clearer labels and active states.
- Reworked the predictions sidebar guidance into structured "how it works" and interpretation panels so the page feels more intentional and useful.

### Fixed
- Verified the refreshed predictions experience on desktop and narrow mobile widths with no horizontal overflow in either tab state.

## [0.3.1] - 2026-03-17

### Fixed
- Removed the public tracker/dashboard surface so the app now stays focused on the four primary product areas.
- Tightened homepage, companies, offers, and company-detail presentation to better match the intended alignment from the latest UI pass.
- Replaced the remaining native-looking filter controls with the custom dropdown treatment across the affected browsing pages.
- Fixed mobile pagination overflow on company and offer listings by stacking controls cleanly on narrow screens.

### Changed
- Renamed the sponsorship calculator component surface from tracker-style naming to sponsorship odds naming in the frontend flow.
- Updated repository docs to reflect the four-area public experience and the latest release version.

## [0.3.0] - 2026-03-17

### Added
- A no-login local application tracker that stores saved applications in the browser and supports JSON export.

### Changed
- Removed login, register, password reset, and profile flows from the frontend product surface.
- Replaced the authenticated dashboard flow with a public `/tracker` experience and redirected old `/dashboard` links.
- Updated homepage and navigation CTAs to reflect the tracker-first, no-account product direction.
- Reduced frontend startup overhead by removing auth boot logic, disabling aggressive React Query refetch defaults, shrinking search suggestion payloads, and removing React StrictMode from the local app shell.

### Notes
- Tracker data now stays in the local browser instead of syncing to the backend.
- Verified the homepage, `/tracker`, and `/dashboard` redirect in the browser, plus local tracker creation without sign-in.

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
