# Ghosted Project Bug Report

## Summary

Analysis performed on the Ghosted project (Visa-aware job intelligence platform). Multiple issues identified across security, configuration, code quality, and performance categories.

---

## CRITICAL ISSUES (Fixed)

### 1. Empty .gitignore File
**Severity**: CRITICAL  
**File**: `.gitignore`

**Issue**: The `.gitignore` file was completely empty, exposing sensitive files to version control.

**Impact**: 
- Secrets and credentials could be committed
- Database files (`*.db`, `.chunkhound.db`) could be committed  
- Personal resume data in `tmp/` could be committed
- Python bytecode cache files (`__pycache__`) cluttering repositories

**Fix Applied**: Created comprehensive `.gitignore` covering:
- Environment files (`.env`)
- Python artifacts (`__pycache__`, `*.pyc`, etc.)
- Database files (`*.db`, `*.sqlite`)
- Node modules and build artifacts
- IDE files and OS artifacts
- Temporary files and local data
- Celery beat schedule files

---

### 2. Sensitive Personal Data Leaked
**Severity**: CRITICAL  
**File**: `tmp/pdfs/resume.txt`

**Issue**: A real person's resume containing personal information (name, email, phone, LinkedIn, work history) was stored in the repository.

**Impact**: Privacy violation. Personal information exposed.

**Recommendation**: Remove this file and add `tmp/` to `.gitignore`.

---

### 3. Hardcoded Secrets in Docker Compose
**Severity**: HIGH  
**File**: `docker-compose.yml`

**Issue**: 
- `SECRET_KEY=dev-secret-key` hardcoded in multiple services
- `POSTGRES_PASSWORD=postgres` hardcoded
- `DEBUG=True` hardcoded

**Impact**: If deployed with these defaults, JWT tokens can be forged and database credentials are compromised.

**Fix Applied**: 
- Changed to require environment variables: `${SECRET_KEY:?SECRET_KEY is required}`
- Made DEBUG configurable: `${DEBUG:-False}`
- Made DB password configurable: `${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}`

---

### 4. Debug Mode Enabled by Default
**Severity**: HIGH  
**File**: `backend/ghosted/settings.py`

**Issue**: `DEBUG = os.getenv('DEBUG', 'True')` defaulted to True.

**Impact**: Stack traces, sensitive settings, and debugging info exposed in production.

**Fix Applied**: 
- Changed default to False: `DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")`
- Added validation to fail startup if SECRET_KEY not provided
- Added production security settings (HSTS, secure cookies, etc.)

---

### 5. Password Reset Token Exposure
**Severity**: HIGH  
**File**: `backend/users/views.py`

**Issue**: The `forgot_password` endpoint exposed reset tokens when `debug` query param was present:
```python
"token": str(token) if request.query_params.get('debug') else None
```

**Impact**: Attackers could obtain password reset tokens via social engineering (tricking users to add `?debug`).

**Fix Applied**: 
- Removed token exposure entirely
- Made response generic (doesn't reveal if email exists)

---

### 6. Missing SECRET_KEY Validation
**Severity**: HIGH  
**File**: `backend/ghosted/settings.py`

**Issue**: SECRET_KEY defaulted to insecure value if not set.

**Impact**: If env var forgotten, app runs with predictable secret.

**Fix Applied**: Added startup validation:
```python
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required.")
```

---

## MEDIUM ISSUES (Fixed)

### 7. Potential Division by Zero
**Severity**: MEDIUM  
**File**: `backend/companies/models.py`

**Issue**: `calculate_approval_rate()` could return inconsistent values when `total_h1b_denials` is 0.

**Fix Applied**: Added explicit handling for zero denominator case.

---

### 8. Missing Input Validation on Query Parameters
**Severity**: MEDIUM  
**Files**: `backend/companies/views.py`, `backend/offers/views.py`

**Issue**: Query parameters like `min_score` and `min_salary` were used directly without type validation.

**Impact**: Could cause database errors with malformed input.

**Fix Applied**: Added try/except blocks to validate and safely convert query params:
- `min_score` validated as float in range 0-100
- `min_salary` validated as positive integer

---

### 9. Insecure Default Database Password
**Severity**: MEDIUM  
**File**: `backend/ghosted/settings.py`

**Issue**: `DB_PASSWORD` had insecure fallback default.

**Fix Applied**: Added validation to require password when using PostgreSQL:
```python
db_password = os.getenv("DB_PASSWORD")
if not db_password:
    raise ValueError("DB_PASSWORD environment variable is required when using PostgreSQL.")
```

---

## CONFIGURATION IMPROVEMENTS (Fixed)

### 10. Missing .env Example File
**Severity**: LOW  
**File**: None (was missing)

**Issue**: No template for developers to configure their environment.

**Fix Applied**: Created `.env.example` with all required variables documented.

---

## CODE QUALITY ISSUES (Noted)

### 11. N+1 Query Potential
**Location**: `backend/companies/serializers.py`

**Issue**: `CompanySerializer` has multiple `SerializerMethodField` calls that execute separate queries per field per object.

**Recommendation**: Use `prefetch_related` or `select_related` in viewsets, or use annotations.

---

### 12. Missing Rate Limiting
**Location**: Multiple endpoints

**Issue**: No rate limiting on public endpoints like `/jobs/resume-match/`.

**Recommendation**: Add `django-ratelimit` or similar for production.

---

### 13. No File Scanning
**Location**: Resume upload endpoint

**Issue**: Uploaded PDFs are not scanned for malware.

**Recommendation**: Integrate with ClamAV or similar for production.

---

### 14. Serializer Meta Class Issue
**Location**: `backend/companies/serializers.py`

**Issue**: `CompanyListSerializer.Meta` defined fields independently instead of inheriting.

**Fix Applied**: Changed to inherit from `CompanySerializer.Meta`.

---

## FILES MODIFIED

1. `.gitignore` - Created comprehensive gitignore
2. `.env.example` - Created environment template
3. `docker-compose.yml` - Made secrets required via env vars
4. `backend/ghosted/settings.py` - Security hardening
5. `backend/users/views.py` - Fixed token exposure
6. `backend/companies/models.py` - Fixed division handling
7. `backend/companies/views.py` - Added input validation
8. `backend/offers/views.py` - Added input validation
9. `backend/companies/serializers.py` - Fixed Meta inheritance

---

## RECOMMENDATIONS FOR FUTURE IMPROVEMENTS

1. **Add Rate Limiting**: Implement `django-ratelimit` for public endpoints
2. **Add File Scanning**: Integrate ClamAV for uploaded files
3. **Add Audit Logging**: Log sensitive operations (login, password reset, etc.)
4. **Add Email Verification**: Require email verification before allowing offer submissions
5. **Add CSRF Protection**: Ensure CSRF tokens on public forms
6. **Add Request ID Logging**: For debugging production issues
7. **Add Health Check Endpoint**: For container orchestration

---

*Report generated: March 2026*
