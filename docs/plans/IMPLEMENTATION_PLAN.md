# Ghosted - Implementation Plan
## AI-Powered Job Intelligence Platform for International Talent

---

## Architecture Overview

**Backend:** Django + Django REST Framework + PostgreSQL
**Frontend:** React + TypeScript + Tailwind CSS
**ML/AI:** Python scikit-learn / simple heuristics initially
**Infrastructure:** Docker, AWS (future deployment)
**Data Sources:** Myvisajobs.com, H1Bdata.info, user submissions, web scraping

---

## Phase 1: Project Foundation & Core Infrastructure

### 1.1 Django Backend Setup
**File:** Entire backend/ directory structure
- Action: Initialize Django project with apps: users, companies, offers, predictions, h1b_data
- Why: Core foundation for all features
- Dependencies: None
- Risk: Low

### 1.2 Database Models
**Files:** 
- backend/users/models.py (CustomUser with visa_status, nationality)
- backend/companies/models.py (Company with sponsorship_history, visa_fair_score)
- backend/offers/models.py (Offer with salary, location, visa_type)
- backend/h1b_data/models.py (H1BApplication, LotteryStats)
- Action: Design comprehensive schema for all features
- Why: Data foundation for predictions and analytics
- Dependencies: 1.1
- Risk: Medium (schema changes are costly)

### 1.3 Django REST API Setup
**Files:**
- backend/*/serializers.py
- backend/*/views.py
- backend/*/urls.py
- Action: REST endpoints for CRUD operations
- Why: API layer for React frontend
- Dependencies: 1.2
- Risk: Low

### 1.4 React + TypeScript Frontend Setup
**File:** Entire frontend/ directory
- Action: Vite + React + TypeScript + Tailwind + React Query
- Why: Modern, fast frontend stack
- Dependencies: None (parallel with backend)
- Risk: Low

### 1.5 Docker & Docker Compose
**Files:** docker-compose.yml, backend/Dockerfile, frontend/Dockerfile
- Action: Containerize entire stack for easy development
- Why: Consistent dev environment
- Dependencies: 1.1, 1.4
- Risk: Low

---

## Phase 2: Data Collection & Company Intelligence

### 2.1 H1B Data Import Pipeline
**Files:**
- backend/h1b_data/management/commands/import_h1b_data.py
- backend/h1b_data/services.py
- Action: Import DOL H1B disclosure data (public dataset)
- Why: Historical sponsorship data powers all predictions
- Dependencies: 1.2
- Risk: Medium (data quality issues)

### 2.2 Company Scoring Algorithm
**Files:**
- backend/companies/services/scoring.py
- backend/companies/management/commands/calculate_scores.py
- Action: Calculate visa-fair scores based on:
  - H1B approval rates
  - Salary competitiveness
  - Sponsorship consistency over years
  - Job level distribution
- Why: Core feature - visa-fair company scoring
- Dependencies: 2.1
- Risk: Medium (algorithm tuning needed)

### 2.3 Company Search & Filter API
**Files:**
- backend/companies/views.py (search endpoint)
- backend/companies/filters.py
- Action: Full-text search, filtering by score, location, industry
- Why: Users need to find and evaluate companies
- Dependencies: 2.2
- Risk: Low

### 2.4 Company Frontend Pages
**Files:**
- frontend/src/pages/CompanyList.tsx
- frontend/src/pages/CompanyDetail.tsx
- frontend/src/components/CompanyCard.tsx
- frontend/src/components/VisaFairScore.tsx
- Action: Display company profiles with visa-fair scores
- Why: User interface for company discovery
- Dependencies: 2.3
- Risk: Low

---

## Phase 3: Offer Database & Prediction Engine

### 3.1 Offer Data Model Extensions
**Files:**
- backend/offers/models.py (add fields for visa_type, experience_level, negotiation_notes)
- Action: Support rich offer data for predictions
- Why: Power the offer prediction feature
- Dependencies: 1.2
- Risk: Low

### 3.2 Offer Submission API
**Files:**
- backend/offers/views.py (create endpoint)
- backend/offers/permissions.py (privacy controls)
- Action: Anonymous and authenticated offer submissions
- Why: Crowdsource real offer data
- Dependencies: 3.1
- Risk: Medium (spam/abuse prevention needed)

### 3.3 Salary Prediction Model
**Files:**
- backend/predictions/services/salary_predictor.py
- backend/predictions/models.py (PredictionResult)
- Action: Simple ML model (linear regression) predicting salary based on:
  - Company
  - Role/level
  - Location
  - Visa status
  - Years of experience
- Why: Core feature - offer prediction by visa status
- Dependencies: 3.2 (needs training data)
- Risk: High (ML model accuracy)

### 3.4 Prediction API Endpoints
**Files:**
- backend/predictions/views.py
- Action: GET /api/predict/salary - returns prediction with confidence
- Why: API for frontend prediction feature
- Dependencies: 3.3
- Risk: Low

### 3.5 Offer Database Frontend
**Files:**
- frontend/src/pages/Offers.tsx
- frontend/src/components/OfferCard.tsx
- frontend/src/components/SalaryChart.tsx
- Action: Browse offers, submit new offers, view analytics
- Why: Interface for offer database feature
- Dependencies: 3.2, 3.4
- Risk: Low

### 3.6 Salary Predictor UI
**Files:**
- frontend/src/components/SalaryPredictor.tsx
- Action: Form to input details and get salary prediction
- Why: User interface for prediction feature
- Dependencies: 3.4
- Risk: Low

---

## Phase 4: H1B Lottery & Sponsorship Intelligence

### 4.1 H1B Lottery Data Model
**Files:**
- backend/h1b_data/models.py (LotteryYear, RegistrationStats)
- Action: Store historical lottery statistics by year
- Why: Power the lottery risk calculator
- Dependencies: 1.2
- Risk: Low

### 4.2 Lottery Data Import
**Files:**
- backend/h1b_data/management/commands/import_lottery_data.py
- Action: Import USCIS lottery statistics
- Why: Historical data for risk calculation
- Dependencies: 4.1
- Risk: Medium (USCIS data format changes)

### 4.3 Lottery Risk Calculator
**Files:**
- backend/predictions/services/lottery_calculator.py
- Action: Calculate risk based on:
  - Historical selection rates by country (India, China caps)
  - Master's vs Bachelor's advantage
  - Year-over-year trends
  - Current year projections
- Why: Core feature - H1B lottery risk calculator
- Dependencies: 4.2
- Risk: Medium (prediction accuracy)

### 4.4 Sponsorship Likelihood Tracker
**Files:**
- backend/companies/services/sponsorship_tracker.py
- Action: Calculate sponsorship likelihood based on:
  - Historical H1B filings
  - Approval rates
  - Job category patterns
  - Recent hiring trends
- Why: Core feature - sponsorship likelihood tracker
- Dependencies: 2.1
- Risk: Medium

### 4.5 Lottery & Sponsorship API
**Files:**
- backend/predictions/views.py (lottery-risk, sponsorship-likelihood endpoints)
- Action: Expose calculators via REST API
- Why: Frontend access to calculations
- Dependencies: 4.3, 4.4
- Risk: Low

### 4.6 Lottery Calculator UI
**Files:**
- frontend/src/pages/LotteryCalculator.tsx
- Action: Input form + visualization of lottery odds
- Why: User interface for lottery risk feature
- Dependencies: 4.5
- Risk: Low

### 4.7 Sponsorship Tracker UI
**Files:**
- frontend/src/components/SponsorshipLikelihood.tsx
- Action: Display likelihood score with contributing factors
- Why: User interface for sponsorship feature
- Dependencies: 4.5
- Risk: Low

---

## Phase 5: User Features & Polish

### 5.1 Authentication System
**Files:**
- backend/users/views.py (JWT auth)
- frontend/src/contexts/AuthContext.tsx
- frontend/src/pages/Login.tsx, Register.tsx
- Action: Email/password auth, profile management
- Why: User accounts for personalized features
- Dependencies: 1.2
- Risk: Low

### 5.2 Job Application Tracker
**Files:**
- backend/users/models.py (JobApplication model)
- frontend/src/pages/Applications.tsx
- Action: Track applications, statuses, interviews
- Why: Complement intelligence with tracking
- Dependencies: 5.1
- Risk: Low

### 5.3 Dashboard
**Files:**
- frontend/src/pages/Dashboard.tsx
- Action: Overview of applications, saved companies, predictions
- Why: Central hub for users
- Dependencies: 5.2
- Risk: Low

### 5.4 Search & Discovery
**Files:**
- frontend/src/pages/Search.tsx
- Action: Unified search across companies, offers, articles
- Why: Discovery experience
- Dependencies: All previous
- Risk: Low

---

## Testing Strategy

### Backend Tests
- Unit tests for all models
- API endpoint tests with Django REST test client
- ML model validation tests
- Data import pipeline tests

### Frontend Tests
- Component tests with React Testing Library
- Integration tests for key user flows
- E2E tests for critical paths (optional v1)

### Test Data
- Fixtures for companies, offers, H1B data
- Mock prediction responses for frontend testing

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ML model accuracy | High | Start with heuristics, iterate with real data |
| Data quality issues | Medium | Validate imports, manual spot-checks |
| Schema changes | Medium | Design carefully upfront, use migrations |
| Scope creep | High | Follow this plan strictly, v2 features separately |
| Performance with large datasets | Medium | Database indexing, pagination, caching |

---

## Success Criteria

1. User can search companies and see visa-fair scores
2. User can view and submit offers with salary data
3. Salary predictions show reasonable accuracy (±20%)
4. Lottery calculator shows historical odds by profile
5. Sponsorship tracker displays likelihood for companies
6. User can track job applications
7. Docker compose brings up full stack with one command
8. All critical paths have passing tests

---

## V2 Features (Future)

- Real-time job board scraping
- Email alerts for new sponsors
- Interview question database
- Negotiation script generator
- Mobile app
- Browser extension for job boards

---

Estimated Timeline: 2-3 weeks for MVP with full dedication
