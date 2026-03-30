# Ghosted UI Bug Report & Technical Debt Analysis

**Date**: March 30, 2026  
**Analyst**: Claude Code  
**Frontend Stack**: React 19 + TypeScript + Vite + Tailwind CSS + React Query + React Router  
**Overall Assessment**: 5/10 — Critical runtime errors plus significant design system inconsistencies

---

## EXECUTIVE SUMMARY

The Ghosted frontend has **2 critical runtime errors** causing application crashes, **design system mismatches** between declared and implemented tokens, and **199+ instances of undefined CSS classes**. The codebase needs immediate bug fixes before any redesign work can proceed effectively.

---

## CRITICAL ISSUES (Must Fix First)

### 1. Missing AuthContext Provider — RUNTIME CRASH

**Severity**: P0 - Application Crashes  
**Files**: `frontend/src/components/Layout.tsx`  
**Console Error**:
```
Error: useAuth must be used within an AuthProvider
    at useAuth (http://localhost:5173/src/contexts/AuthContext.tsx:81:9)
    at Layout (http://localhost:5173/src/components/Layout.tsx:11:27)
```

**Root Cause**: 
- `Layout.tsx` imports and uses `useAuth` hook
- But `AuthContext.tsx` file doesn't exist or isn't provided in `App.tsx`
- The entire application crashes on any route

**Evidence**: Console log `.playwright-mcp/console-2026-03-17T04-31-58-353Z.log`

**Fix**: 
1. If auth is not needed: Remove `useAuth` usage from Layout.tsx
2. If auth is needed: Create AuthContext and wrap App with AuthProvider

---

### 2. TypeError: offers?.filter is not a function — RUNTIME CRASH

**Severity**: P0 - Application Crashes  
**File**: `frontend/src/pages/Offers.tsx:20`  
**Console Error**:
```
TypeError: offers?.filter is not a function
    at Offers (http://localhost:5173/src/pages/Offers.tsx:20:33)
```

**Root Cause**: 
- `offers` is assigned from `data?.results || []` (line 19)
- But earlier code tries to call `offers?.filter()` before the assignment
- The API returns paginated response `{ count, next, previous, results }` not an array

**Evidence**: Console log `.playwright-mcp/console-2026-03-17T04-31-58-353Z.log`

**Fix**: Ensure `.filter()` is called on the correct array after assignment, not before.

---

### 3. Clearbit Logo API Failures — 30+ Resource Errors Per Load

**Severity**: P1 - Network/DNS Errors  
**Console Errors**:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED @ https://logo.clearbit.com/www.amazon.com?size=128
Failed to load resource: net::ERR_NAME_NOT_RESOLVED @ https://logo.clearbit.com/www.google.com?size=128
... (30+ identical errors per page load)
```

**Root Cause**: 
- Clearbit's DNS is not resolving in the environment
- Every company logo fallback triggers Clearbit requests
- No error handling for failed logo loads

**Impact**: 
- 30+ console errors per page load
- Broken company logos throughout the app
- Poor user experience

**Fix**: 
1. Add error boundary around CompanyLogo component
2. Use Logo.dev as primary (check for `VITE_LOGO_DEV_PUBLISHABLE_KEY`)
3. Remove Clearbit dependency entirely
4. Add fallback cascade that doesn't waterfall to failed services

---

## HIGH PRIORITY ISSUES

### 4. Font Mismatch: Inter Declared, Geist Implemented

**Severity**: P1 - Design System Violation  
**Files**:
- `frontend/src/index.css:7` — Imports Inter
- `frontend/tailwind.config.js:54-57` — Declares Geist

```css
/* index.css imports Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* But tailwind.config.js declares Geist */
fontFamily: {
  display: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
  sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
}
```

**Problem**: 
- Brand guidelines specify Geist (premium)
- CSS actually loads Inter (generic AI default)
- Inconsistency violates design principles

**Fix**: 
1. Import Geist from Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap')`
2. Or self-host Geist for performance
3. Remove Inter import entirely

---

### 5. 199+ Undefined CSS Classes — Missing Definitions

**Severity**: P1 - Broken Styles  
**Files**: Multiple across `src/pages/` and `src/components/`

**Unresolved Classes Found**:

| Class Pattern | Files Using | Status |
|--------------|-------------|--------|
| `stat-box-responsive` | Offers.tsx | **MISSING** |
| `stat-value-responsive` | Offers.tsx | **MISSING** |
| `mobile-table-card` | Offers.tsx | **MISSING** |
| `mobile-table-card-header` | Offers.tsx | **MISSING** |
| `mobile-table-card-row` | Offers.tsx | **MISSING** |
| `mobile-table-card-label` | Offers.tsx | **MISSING** |
| `mobile-table-card-value` | Offers.tsx | **MISSING** |
| `company-score-card` | CompanyDetail.tsx | **MISSING** |
| `company-score-value` | CompanyDetail.tsx | **MISSING** |
| `stat-box-responsive` | CompanyDetail.tsx | **MISSING** |
| `company-story-section` | CompanyDetail.tsx | **MISSING** |
| `jobs-hero-grid` | Jobs.tsx | **MISSING** |
| `jobs-hero-panel` | Jobs.tsx | **MISSING** |
| `jobs-resume-grid` | Jobs.tsx | **MISSING** |
| `jobs-filter-field` | Jobs.tsx | **MISSING** |
| `border-b-3` | Multiple | **MISSING** (Tailwind default is 2px) |
| `text-primary` | Multiple | **MISSING** (should be `text-text-primary`) |
| `text-secondary` | Multiple | **MISSING** (should be `text-text-secondary`) |
| `text-muted` | Multiple | **MISSING** (should be `text-text-muted`) |
| `bg-secondary` | Multiple | **MISSING** (should be `bg-bg-secondary`) |
| `text-primary` | CompanyDetail.tsx | **MISSING** (in inline styles) |

**Evidence**: Grep search found 199+ matches for `className="[a-z-]+-[a-z]+-[a-z]+"` patterns that don't resolve to Tailwind classes.

**Fix**: 
1. Define all missing classes in `index.css`
2. Or migrate to standard Tailwind utilities
3. Add CSS build step to catch undefined classes

---

### 6. Color Utility Inconsistency: 149+ Instances

**Severity**: P1 - Maintainability Nightmare  
**Files**: Throughout codebase

**Problem**: 
- Tailwind defines `text: { primary: '#18181b', ... }`
- But code uses both `text-primary` AND `text-text-primary`
- No enforcement mechanism

```tsx
// Inconsistent throughout:
<span className="text-sm text-text-muted">  // Correct
<span className="text-sm text-secondary">      // Wrong (uses CSS var, not Tailwind)
<span className="text-sm text-muted">         // Wrong (undefined)
```

**Fix**: 
1. Standardize on `text-text-primary`, `text-text-secondary`, `text-text-muted`
2. Remove custom `.text-muted`, `.text-primary` from index.css
3. Add ESLint rule to enforce consistent naming

---

## MEDIUM PRIORITY ISSUES

### 7. Spinner Uses Linear Easing — Performance Anti-Pattern

**File**: `frontend/src/index.css:394-399`

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 0.8s linear infinite;  /* ❌ Mechanical */
}
```

**Fix**:
```css
animation: spin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
```

---

### 8. Card Hover Shadow Animation — CPU Intensive

**File**: `frontend/src/index.css:240-242`

```css
.card:hover {
  @apply shadow-diffusion-lg -translate-y-1;  /* Shadow animation = repaints */
}
```

**Problem**: Animating shadow depth triggers layout recalculations.

**Fix**: Reduce shadow change, rely on transform:
```css
.card:hover {
  @apply -translate-y-1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
}
```

---

### 9. Grid Anti-Pattern: Equal 3-Column Features

**File**: `frontend/src/pages/Home.tsx:279`

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

**Problem**: Generic "3 equal cards" is an AI design cliché.

**Fix**: Use asymmetric layout or horizontal scroll variant.

---

### 10. Skeleton Shimmer Uses ease-in-out

**File**: `frontend/src/index.css:408-414`

```css
animation: shimmer 1.5s ease-in-out infinite;
```

**Fix**: Use spring easing for consistency.

---

## LOW PRIORITY / POLISH

### 11. Body Line-Height: 1.6 Too Relaxed
**File**: `frontend/src/index.css:76`

### 12. Focus States: Generic Ring
**File**: `frontend/src/index.css:86-89`

### 13. Container Max-Width: 1280px
**File**: `frontend/src/index.css:693-695` — Consider 1400px for data-heavy app

### 14. NotFound Page: Fixed 180px Text
**File**: `frontend/src/pages/NotFound.tsx:11` — Should use `clamp()`

### 15. Section Padding: Discrete Steps
**File**: `frontend/src/index.css` — Consider `clamp()` for fluid spacing

---

## ACCESSIBILITY ISSUES

### 16. Missing ARIA Labels on Interactive Elements

Some icon-only buttons lack descriptive labels:
```tsx
// Needs aria-label or visible text
<button className="...">
  <Menu className="w-5 h-5" />
</button>
```

### 17. Focus Management on Route Changes

When navigating between pages, focus should move to main content or page title for screen readers.

### 18. Color Contrast in Muted Text

`--color-text-muted: #a1a1aa` on white background may fail WCAG AA for small text.

---

## PERFORMANCE ISSUES

### 19. Company Logo Waterfall

Each logo tries multiple services sequentially on failure:
1. First-party logo_url
2. Logo.dev (if key exists)
3. Clearbit (fails, DNS error)
4. Favicon fallback
5. Initial avatar

**Fix**: Remove Clearbit, use Logo.dev as primary with local fallback.

### 20. No Image Lazy Loading Enforcement

Some above-fold images may not be lazy loaded.

### 21. Missing Error Boundaries

Individual page components lack granular error boundaries.

---

## POSITIVE FINDINGS (Keep These)

| Pattern | Location | Notes |
|---------|----------|-------|
| `min-h-[100dvh]` | Multiple | Correct for iOS Safari |
| CSS Grid layouts | Multiple | Not using flexbox percentage hacks |
| Diffusion shadows | index.css | Proper subtle shadow system |
| `prefers-reduced-motion` | index.css:92-100 | Good accessibility |
| Emerald accent (desaturated) | index.css:18-22 | Professional |
| No pure black | Throughout | Using Zinc-950 |
| Spring easing variables | index.css:56-62 | Consistent animation feel |
| Skip link for a11y | Layout.tsx:29 | Good accessibility |
| ARIA attributes | Multiple | Proper semantic HTML |
| Tap targets (44px) | index.css:727 | Good touch support |

---

## RECOMMENDED PRIORITY ORDER

### Phase 1: Critical Fixes (Before Redesign)
1. Fix `useAuth` error — Remove or provide AuthContext
2. Fix `offers?.filter` error — Correct array handling
3. Remove Clearbit dependency — Fix 30+ resource errors
4. Define all missing CSS classes — 199+ undefined classes

### Phase 2: Design System Cleanup
5. Font Fix — Inter → Geist
6. Color Utility Consolidation — Fix 149+ inconsistent usages
7. Spinner Easing — Linear → Spring
8. Card Shadow Animation — Reduce on hover

### Phase 3: Polish (During Redesign)
9. Grid Anti-Patterns — Asymmetric feature layouts
10. Fluid Typography — Add `clamp()` for large text
11. Focus State Improvements — More distinctive styling
12. Accessibility Enhancements — ARIA labels, focus management

---

## FILES AUDITED

### Core Files
- `frontend/src/index.css` — Design system definitions
- `frontend/src/App.tsx` — Main app with providers
- `frontend/src/components/Layout.tsx` — Navigation and layout
- `frontend/tailwind.config.js` — Tailwind configuration

### Pages
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Companies.tsx`
- `frontend/src/pages/CompanyDetail.tsx`
- `frontend/src/pages/Offers.tsx`
- `frontend/src/pages/Jobs.tsx`
- `frontend/src/pages/CompareCompanies.tsx`
- `frontend/src/pages/Predictions.tsx`
- `frontend/src/pages/NotFound.tsx`

### Components
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/CompanyLogo.tsx`
- `frontend/src/components/ui/Skeleton.tsx`

### API
- `frontend/src/api/services.ts`
- `frontend/src/types/index.ts`

### Console Logs Analyzed
- `.playwright-mcp/console-2026-03-17T04-39-00-158Z.log`
- `.playwright-mcp/console-2026-03-17T04-31-58-353Z.log`
- `.playwright-mcp/console-2026-03-17T04-31-11-499Z.log`

---

## ESTIMATED EFFORT

| Phase | Issues | Estimated Time |
|-------|--------|----------------|
| Phase 1: Critical | 4 | 4-6 hours |
| Phase 2: Design System | 4 | 6-8 hours |
| Phase 3: Polish | 4 | 4-6 hours |
| **Total** | **12** | **14-20 hours** |

---

## APPENDIX: Console Errors (Raw)

```
[258378ms] [ERROR] Error caught by boundary: Error: useAuth must be used within an AuthProvider
[258778ms] [ERROR] Error caught by boundary: TypeError: offers?.filter is not a function
[536ms] [ERROR] Failed to load resource: net::ERR_NAME_NOT_RESOLVED @ https://logo.clearbit.com/www.goldmansachs.com?size=128
[536ms] [ERROR] Failed to load resource: net::ERR_NAME_NOT_RESOLVED @ https://logo.clearbit.com/www.bcg.com?size=128
[536ms] [ERROR] Failed to load resource: net::ERR_NAME_NOT_RESOLVED @ https://logo.clearbit.com/www.pfizer.com?size=128
... (30+ similar errors)
```
