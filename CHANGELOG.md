# Changelog

All notable changes to this project will be documented in this file.

## [0.5.4] - 2026-03-18

### Changed
- Updated the Dockerized backend runtime to prefer PostgreSQL automatically when a database host is configured, and switched the API service from Django's development server to Gunicorn for faster paginated requests.
- Documented the Postgres-backed Compose behavior in the README so the runtime matches the published setup notes.

### Fixed
- Added cached paginator counts for filtered list endpoints so repeated page navigation no longer redoes the same expensive count work on Companies, Offers, and Jobs.
- Trimmed the Jobs list queryset by dropping the unused `description` field from paginated row loading and reusing the same cached next/previous-page prefetch path across the paginated pages.
- Added performance-oriented database indexes for company ordering, active job listings, and verified offer lookups to reduce cold pagination latency under Postgres.
- Widened the `Company.slug` field so the existing dataset loads cleanly into PostgreSQL without truncation failures.

## [0.5.3] - 2026-03-18

### Changed
- Standardized the paginated list surfaces to 10 items per page across Companies, Offers, and Jobs.

### Fixed
- Added next-page and previous-page prefetching plus non-blocking page transitions on the main paginated pages so clicking `Next` feels much faster once the current page settles.
- Reworked the Companies list query to use lighter company-level subqueries instead of heavier multi-join count annotations, which substantially improves directory pagination responsiveness.
- Trimmed the Jobs list query and replaced the expensive salary-record join count with a cheaper company-level subquery to reduce page-fetch overhead while keeping the ranking data intact.

## [0.5.2] - 2026-03-18

### Fixed
- Balanced the Jobs results grid by letting the last card span the full row when a 15-item page ends on an odd card count, so the layout no longer leaves a dead empty half-column.
- Replaced the old tab icon with a simpler Ghosted monogram favicon and refreshed the icon links with a new versioned URL so browsers pick up the new asset instead of stale cached branding.

## [0.5.1] - 2026-03-18

### Fixed
- Increased the Jobs filter control widths, heights, and placeholder copy so search and select labels stay readable instead of clipping into tiny boxes.
- Reworked the Jobs result cards for common desktop widths by stacking the apply action later, widening the content area, and simplifying reason callouts into clearer readable rows.
- Kept the updated Jobs layout responsive with no horizontal overflow on mobile or desktop while preserving the existing Ghosted theme.

## [0.5.0] - 2026-03-18

### Added
- Added Ashby public job-board support alongside the existing Greenhouse and Lever ingestion paths.
- Added careers-page and website-based board discovery so job sources can be found from company domains instead of depending almost entirely on hardcoded hints.

### Changed
- Aligned Jobs pagination with the Companies and Offers pages so the browse experience consistently serves 15 items per page with the same pagination layout.
- Tuned background job discovery batches for automated deployment use so recurring sync stays practical without manual babysitting.
- Updated the README to document the broader ATS coverage and automated discovery behavior.

### Fixed
- Reworked the jobs filter bar into a roomier responsive grid so the search and filter controls stay readable on desktop instead of collapsing into tiny columns.
- Increased the jobs filter control height and spacing so inputs, selects, and the salary toggle feel consistent across desktop and mobile layouts.
- Prevented duplicate company records from claiming the same ATS board token, which avoids double-counting jobs across near-duplicate employers.

## [0.4.1] - 2026-03-18

### Fixed
- Reworked the jobs filter bar into a roomier responsive grid so the search and filter controls stay readable on desktop instead of collapsing into tiny columns.
- Increased the jobs filter control height and spacing so inputs, selects, and the salary toggle feel consistent across desktop and mobile layouts.

## [0.4.0] - 2026-03-18

### Added
- Added a first-class `Jobs` product surface with a dedicated `/jobs` route, responsive filters, server-side pagination, visa-aware ranking, company context, and source-linked apply actions.
- Added a public jobs API with searchable listing, ranking metadata, company salary-evidence context, and aggregate statistics for the jobs page.
- Added provider-aware ATS sync infrastructure for supported public boards, including reusable jobs services, Celery tasks, and a new `sync_job_postings` management command.
- Added scheduled job discovery, sync, and stale-job cleanup via Celery Beat in the deployment stack.

### Changed
- Integrated jobs into the main navigation, homepage calls to action, and company detail pages so hiring data is no longer only a secondary enrichment snippet.
- Updated the README to document the new jobs workflow, automated scheduler, and job-sync command.

### Fixed
- Tightened job-board discovery so ambiguous short board tokens are no longer auto-matched to the wrong employer during automated sync.

## [0.3.17] - 2026-03-18

### Changed
- Regenerated the README banner with a transparent background so GitHub's own page color shows through instead of the image carrying a visible panel.
- Kept the Press Start 2P banner workflow and Ghosted palette while removing the opaque canvas.

## [0.3.16] - 2026-03-18

### Changed
- Regenerated the README banner with a `#0d1117` background so it blends cleanly into GitHub's dark page chrome.
- Kept the Press Start 2P generator workflow intact while adjusting only the banner background tone.

## [0.3.15] - 2026-03-18

### Changed
- Regenerated the README hero banner with the Press Start 2P workflow and retuned it to Ghosted's site palette instead of Hermes' yellow-heavy colors.
- Added the banner generator script and bundled Press Start 2P font so the hero can be recreated from code.

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
