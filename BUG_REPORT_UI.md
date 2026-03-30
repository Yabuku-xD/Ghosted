# Ghosted UI/UX Bug Report

## Executive Summary

The Ghosted frontend has a solid foundation with good design tokens, but contains **critical inconsistencies** between declared and implemented design systems, typography violations, and scattered anti-patterns that should be addressed during the redesign.

**Overall Assessment**: 6.5/10 — Good bones with significant polish needed.

---

## Critical Issues (Fix First)

### 1. Font Mismatch: Inter vs Geist

**Files**: 
- `frontend/src/index.css:7`
- `frontend/src/index.css:73,644-645`
- `frontend/tailwind.config.js:54-57`

**Current State**:
```css
/* index.css imports Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* But tailwind.config.js declares Geist */
fontFamily: {
  display: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
  sans: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
}
```

**Problem**: The codebase claims to use Geist (premium, modern) but actually loads Inter (generic AI default). This is a critical brand inconsistency.

**Impact**: Violates stitch-design-taste principle: *"Inter is BANNED for premium/creative contexts."*

**Fix**: 
1. Import Geist from Google Fonts: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap')`
2. Or self-host Geist for better performance
3. Remove Inter import entirely

---

### 2. Utility Class Inconsistency: Custom vs Tailwind

**Files**: Multiple across `frontend/src/pages/` and `frontend/src/components/`

**Current State**:
The CSS defines custom utility shortcuts:
```css
/* index.css utilities layer */
.text-muted { color: var(--color-text-muted); }
.bg-secondary { background-color: var(--color-bg-secondary); }
.text-primary { color: var(--color-text-primary); }
```

But files use Tailwind-style naming:
```tsx
<span className="text-sm text-text-muted">...</span>
<div className="bg-bg-secondary">...</div>
```

**Problem**: 
- Tailwind config defines `text: { primary: '#18181b', secondary: '#52525b', muted: '#a1a1aa' }`
- But these are NOT being used consistently
- Mix of `text-primary` vs `text-text-primary` throughout codebase
- This creates 149+ inconsistent color usages

**Impact**: Maintainability nightmare, potential for subtle color mismatches.

**Fix**:
1. Standardize on Tailwind's native `text-primary`, `text-secondary`, `text-muted`
2. Remove custom `.text-muted`, `.text-primary` utilities from index.css
3. Use `bg-secondary` consistently (Tailwind will map to `#f4f4f5`)
4. Audit and fix all 149+ inconsistent usages

---

### 3. Spinner Uses Linear Easing (Performance Anti-Pattern)

**File**: `frontend/src/index.css:394-399`

**Current State**:
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
/* Applied with: */
animation: spin 0.8s linear infinite;
```

**Problem**: Linear easing is jerky and mechanical. Violates spring physics principles defined elsewhere in the codebase (`--transition-base: 250ms cubic-bezier(0.16, 1, 0.3, 1)`).

**Fix**:
```css
animation: spin 0.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
```

---

## High Priority Issues

### 4. Responsive Grid Anti-Pattern: Equal 3-Column Features

**File**: `frontend/src/pages/Home.tsx:279`

**Current State**:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
```

**Problem**: Generic "3 equal cards horizontally" is an AI design cliché banned by stitch-design-taste.

**Recommended Fix**: Use asymmetric layout:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
  <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">...</div>
  {/* Or: grid-cols-[1.5fr_1fr_1fr] */}
</div>
```

Or use horizontal scroll variant:
```tsx
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
```

---

### 5. Card Elevation: Shadow-Heavy Hover States

**File**: `frontend/src/index.css:240-242`

**Current State**:
```css
.card:hover {
  @apply shadow-diffusion-lg -translate-y-1;
}
```

**Problem**: 
- Animating shadow depth on hover creates CPU-intensive repaints
- Should use `transform` only for performance

**Fix**: Reduce shadow animation, rely more on transform:
```css
.card:hover {
  @apply -translate-y-1;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
}
```

---

### 6. Stagger Animation: Fixed Delays

**File**: `frontend/src/index.css:629-636`

**Current State**:
```css
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
/* ... fixed 50ms increments */
```

**Problem**: Fixed delays feel mechanical. Per stitch-design-taste, should use more organic staggering.

**Fix**: Consider CSS Grid with `animation-delay: calc(var(--index, 0) * 100ms)` pattern or use spring-based delays.

---

### 7. CompanyDetail: Mixed Tailwind and Inline Styles

**File**: `frontend/src/pages/CompanyDetail.tsx`

**Current State**: Uses a mix of:
- Tailwind classes: `className="text-sm text-secondary"`
- Custom CSS classes: `className="company-score-card"`
- Inline styles: `style={{ animationDelay: ... }}`

**Problem**: Inconsistent styling approach. Custom CSS classes like `company-score-card`, `company-story-section` are defined elsewhere (not visible in audit).

**Fix**: Consolidate to Tailwind + CSS custom properties layer. Remove scattered custom class names.

---

## Medium Priority Issues

### 8. Body Line-Height: Too Relaxed

**File**: `frontend/src/index.css:76`

**Current State**:
```css
body {
  line-height: 1.6;
}
```

**Problem**: Body text line-height of 1.6 is generous. Display typography should use tighter leading.

**Fix**: Keep body at 1.5-1.6, but ensure display headlines use `leading-tight` (1.15) or `leading-none` (1).

---

### 9. Focus States: Could Be More Distinctive

**File**: `frontend/src/index.css:86-89`

**Current State**:
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**Problem**: Generic focus ring. Could be more branded.

**Fix**:
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
```

---

### 10. Container Max-Width: Could Be Tighter

**File**: `frontend/src/index.css:693-695`

**Current State**:
```css
.container {
  max-width: 1280px;
}
```

**Problem**: 1280px is standard, but for a data-heavy app, 1400px could improve information density on wide screens.

**Fix**: Consider `max-width: 1400px` or `max-width: 80rem` for large displays.

---

## Low Priority / Polish

### 11. Skeleton Shimmer: Uses `ease-in-out`

**File**: `frontend/src/index.css:408-414`

**Current State**:
```css
animation: shimmer 1.5s ease-in-out infinite;
```

**Problem**: Minor, but could use more spring-like easing.

**Fix**: `animation: shimmer 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;`

---

### 12. Section Padding: Could Use `clamp()`

**Files**: Multiple page components

**Current State**:
```css
.section-padding {
  @apply py-12 sm:py-16 lg:py-24;
}
```

**Problem**: Discrete steps vs fluid scaling.

**Fix**: Use `clamp()` for fluid section spacing:
```css
.section-padding {
  padding-top: clamp(3rem, 8vw, 6rem);
  padding-bottom: clamp(3rem, 8vw, 6rem);
}
```

---

### 13. NotFound Page: Large Text Needs `clamp()`

**File**: `frontend/src/pages/NotFound.tsx:11`

**Current State**:
```tsx
<div className="text-[180px] font-display font-bold text-secondary opacity-10 leading-none">
```

**Problem**: Fixed 180px text won't scale fluidly.

**Fix**: Use `text-[clamp(6rem,20vw,180px)]`

---

### 14. Button Active State: Could Be More Tactile

**File**: `frontend/src/index.css:176-177`

**Current State**:
```css
.active:translate-y-0 active:shadow-diffusion-sm
```

**Problem**: The -1px translate on hover is good, but active state could be more obviously "pressed."

**Fix**: 
```css
.active:translate-y-0.5 active:shadow-none
```

---

## Positive Findings (Keep These)

The following are correctly implemented and should be preserved:

| Pattern | Location | Notes |
|---------|----------|-------|
| `min-h-[100dvh]` | Multiple | Correct for iOS Safari |
| CSS Grid layouts | Multiple | Not using flexbox percentage hacks |
| Diffusion shadows | index.css | Proper subtle shadow system |
| `prefers-reduced-motion` | index.css:92-100 | Good accessibility |
| Emerald accent (desaturated) | index.css:18-22 | Professional, not neon |
| No pure black | Throughout | Using Zinc-950 |
| Spring easing variables | index.css:56-62 | Consistent animation feel |
| Skip link for a11y | Layout.tsx:29 | Good accessibility |
| ARIA attributes | Multiple | Proper semantic HTML |
| Tap targets (44px) | index.css:727 | Good touch support |
| No emojis | Throughout | Clean, professional tone |
| No generic names | Throughout | Real data feels authentic |

---

## Recommended Priority Order

1. **Font Fix** (Critical) — Inter → Geist
2. **Utility Consolidation** (High) — Fix 149+ inconsistent color usages
3. **Spinner Easing** (Medium) — Linear → Spring
4. **Card Shadow Animation** (Medium) — Reduce on hover
5. **Grid Anti-Patterns** (Medium) — Asymmetric feature layouts
6. **Fluid Typography** (Low) — Add `clamp()` for large text
7. **Polish** (Low) — Stagger delays, button states

---

## Appendix: Files Audited

- `frontend/src/index.css`
- `frontend/src/App.tsx`
- `frontend/src/components/Layout.tsx`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Select.tsx`
- `frontend/src/components/ui/Badge.tsx`
- `frontend/src/components/ui/Tabs.tsx`
- `frontend/src/components/ui/Progress.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Companies.tsx`
- `frontend/src/pages/CompanyDetail.tsx`
- `frontend/src/pages/CompareCompanies.tsx`
- `frontend/src/pages/Predictions.tsx`
- `frontend/src/pages/NotFound.tsx`
- `frontend/tailwind.config.js`
