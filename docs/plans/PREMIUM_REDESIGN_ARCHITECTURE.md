# Premium UI/UX Redesign Architecture
## Ghosted - Visa-Aware Job Intelligence Platform

> **From Neo-Brutalist to Premium Editorial**
> Elevating the current design while preserving its distinctive character.

---

## Executive Summary

The current Neo-Brutalist design (white + orange, sharp corners, hard shadows) provides a strong foundation. This redesign elevates it to premium quality by:
1. **Refining the color system** - Moving from flat orange to a sophisticated multi-accent palette
2. **Introducing motion design** - Adding purposeful micro-interactions and transitions
3. **Improving typography hierarchy** - Better contrast and rhythm
4. **Enhancing component depth** - Layered surfaces with subtle elevation
5. **Implementing Bento 2.0 patterns** - Modern dashboard layouts with perpetual motion

---

## 1. Design System Overhaul

### 1.1 Color System (CSS Variables)

**Current State:**
```css
--color-accent: #c73e1d (flat orange)
--color-bg-primary: #faf9f7 (warm white)
--color-border: #1a1a1a (flat black)
```

**Proposed Premium System:**
```css
:root {
  /* === SURFACE LAYERS === */
  --surface-0: #ffffff;           /* Base - pure white */
  --surface-1: #fafafa;          /* Elevated - subtle lift */
  --surface-2: #f5f5f5;          /* Card background */
  --surface-3: #eeeeee;          /* Inset/pressed */
  --surface-inverted: #0a0a0a;   /* Dark mode base */
  
  /* === BRAND ACCENT PALETTE === */
  --accent-primary: #ff6b35;     /* Primary CTA - vibrant orange */
  --accent-primary-hover: #e85a2b;
  --accent-primary-subtle: rgba(255, 107, 53, 0.08);
  --accent-secondary: #1d4e89;  /* Secondary - deep blue for data */
  --accent-secondary-subtle: rgba(29, 78, 137, 0.08);
  --accent-tertiary: #2d6a4f;   /* Success - forest green */
  --accent-tertiary-subtle: rgba(45, 106, 79, 0.08);
  
  /* === TEXT HIERARCHY === */
  --text-primary: #0a0a0a;      /* Headlines, primary text */
  --text-secondary: #525252;    /* Body, descriptions */
  --text-tertiary: #737373;     /* Captions, labels */
  --text-muted: #a3a3a3;       /* Disabled, placeholders */
  
  /* === SEMANTIC COLORS === */
  --semantic-success: #059669;
  --semantic-success-bg: rgba(5, 150, 105, 0.06);
  --semantic-warning: #d97706;
  --semantic-warning-bg: rgba(217, 119, 6, 0.06);
  --semantic-error: #dc2626;
  --semantic-error-bg: rgba(220, 38, 38, 0.06);
  --semantic-info: #2563eb;
  --semantic-info-bg: rgba(37, 99, 235, 0.06);
  
  /* === BORDER SYSTEM === */
  --border-default: rgba(0, 0, 0, 0.12);
  --border-subtle: rgba(0, 0, 0, 0.06);
  --border-strong: #0a0a0a;
  --border-accent: rgba(255, 107, 53, 0.4);
  
  /* === SHADOW SYSTEM === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.12);
  --shadow-solid: 4px 4px 0 0 var(--border-strong);  /* Brutalist accent */
  --shadow-solid-accent: 4px 4px 0 0 var(--accent-primary);
  --shadow-glow-accent: 0 0 0 3px var(--accent-primary-subtle);
  
  /* === MOTION === */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
}
```

### 1.2 Typography System

**Current:** Playfair Display (display) + Space Grotesk (body) + JetBrains Mono (mono)

**Proposed Premium Stack:**
```css
/* === DISPLAY / HEADLINES === */
/* Replace Playfair Display with a more modern geometric serif */
--font-display: 'Cabinet Grotesk', 'Satoshi', system-ui, sans-serif;
/* Alternative for editorial moments: 'Newsreader', Georgia, serif; */

/* === BODY TEXT === */
--font-body: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;

/* === MONOSPACE === */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'SF Mono', monospace;

/* === TYPE SCALE === */
--text-xs: 0.75rem;      /* 12px - captions, labels */
--text-sm: 0.875rem;     /* 14px - secondary text */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px - lead paragraphs */
--text-xl: 1.25rem;      /* 20px - small headings */
--text-2xl: 1.5rem;      /* 24px - section headings */
--text-3xl: 1.875rem;    /* 30px - large headings */
--text-4xl: 2.25rem;     /* 36px - display small */
--text-5xl: 3rem;        /* 48px - display medium */
--text-6xl: 3.75rem;     /* 60px - display large */

/* === LETTER SPACING === */
--tracking-tighter: -0.025em;
--tracking-tight: -0.015em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;  /* For uppercase labels */
```

### 1.3 Spacing System

```css
/* === SPACING SCALE === */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* === CONTAINER WIDTHS === */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;
```

### 1.4 Border Radius System

**Current:** All sharp corners (0 radius)

**Proposed:** Refined radius system while maintaining brutalist edge:
```css
--radius-none: 0;
--radius-sm: 2px;      /* Subtle softening */
--radius-md: 4px;      /* Buttons, inputs */
--radius-lg: 8px;      /* Cards */
--radius-xl: 12px;     /* Large containers */
--radius-2xl: 16px;    /* Hero cards */
--radius-full: 9999px; /* Pills, avatars */

/* Keep brutalist accent for key elements */
--brutalist-shadow: 4px 4px 0 0 var(--border-strong);
```

---

## 2. Component Library Improvements

### 2.1 Button Component

**Current Issues:**
- Flat appearance lacks depth
- No loading state animation
- Hover feedback is minimal

**Premium Enhancement:**
```tsx
// Button variants with premium micro-interactions
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'brutalist';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// CSS classes for premium buttons
.btn {
  /* Base */
  @apply inline-flex items-center justify-center gap-2
         font-medium text-sm tracking-wide
         transition-all duration-[var(--duration-fast)]
         disabled:opacity-50 disabled:cursor-not-allowed;
  
  /* Premium depth */
  @apply relative overflow-hidden;
  
  /* Tactile feedback */
  @apply active:scale-[0.98] active:translate-y-[1px];
}

.btn-primary {
  @apply bg-[var(--accent-primary)] text-white
         shadow-[var(--shadow-md)]
         hover:bg-[var(--accent-primary-hover)]
         hover:shadow-[var(--shadow-lg)]
         focus-visible:ring-2 focus-visible:ring-offset-2;
}

.btn-brutalist {
  /* Preserve brutalist aesthetic */
  @apply bg-white text-[var(--text-primary)]
         border-2 border-[var(--border-strong)]
         shadow-[var(--brutalist-shadow)]
         hover:-translate-x-0.5 hover:-translate-y-0.5
         hover:shadow-[6px_6px_0_0_var(--border-strong)]
         active:translate-x-1 active:translate-y-1 active:shadow-none;
}

/* Magnetic hover effect for primary CTAs */
.btn-magnetic {
  /* Uses Framer Motion useMotionValue for performance */
}
```

### 2.2 Card Component

**Current Issues:**
- Static appearance
- No elevation hierarchy
- Hover state is abrupt

**Premium Enhancement:**
```tsx
// Card with liquid glass effect option
interface CardProps {
  variant: 'default' | 'bento' | 'glass' | 'brutalist';
  elevation?: 0 | 1 | 2 | 3;
  hover?: 'lift' | 'glow' | 'border' | 'none';
  interactive?: boolean;
}

.card {
  @apply bg-white border border-[var(--border-default)]
         transition-all duration-[var(--duration-normal)];
}

.card-elevation-1 {
  @apply shadow-[var(--shadow-sm)];
}

.card-elevation-2 {
  @apply shadow-[var(--shadow-md)];
}

.card-hover-lift {
  @apply hover:-translate-y-1 hover:shadow-[var(--shadow-lg)];
}

.card-glass {
  /* Liquid glass effect */
  @apply backdrop-blur-xl bg-white/80
         border border-white/20
         shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
         shadow-[var(--shadow-md)];
}

/* Bento grid card with perpetual motion */
.card-bento {
  @apply rounded-[var(--radius-2xl)]
         bg-white border border-[var(--border-subtle)]
         p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)];
}
```

### 2.3 Input Component

**Current Issues:**
- Focus state is harsh
- No validation feedback animation
- Placeholder styling is inconsistent

**Premium Enhancement:**
```tsx
.input {
  @apply w-full px-4 py-3
         bg-white text-[var(--text-primary)]
         border-2 border-[var(--border-default)]
         rounded-[var(--radius-md)]
         transition-all duration-[var(--duration-fast)]
         placeholder:text-[var(--text-muted)];
}

.input:focus {
  @apply border-[var(--accent-primary)]
         shadow-[var(--shadow-glow-accent)]
         outline-none;
}

/* Floating label variant */
.input-floating {
  @apply relative;
}

.input-floating-label {
  @apply absolute left-4 top-1/2 -translate-y-1/2
         text-[var(--text-muted)] pointer-events-none
         transition-all duration-[var(--duration-fast)];
}

.input-floating:focus-within .input-floating-label,
.input-floating:not(:placeholder-shown) .input-floating-label {
  @apply -top-0 left-3 text-xs bg-white px-1
         text-[var(--accent-primary)];
}
```

### 2.4 Badge Component

**Current Issues:**
- All badges look similar
- No animation on state changes

**Premium Enhancement:**
```tsx
.badge {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1
         text-xs font-semibold tracking-wide uppercase
         rounded-[var(--radius-full)]
         transition-all duration-[var(--duration-fast)];
}

.badge-accent {
  @apply bg-[var(--accent-primary)] text-white
         shadow-[var(--shadow-xs)];
}

.badge-success {
  @apply bg-[var(--semantic-success)] text-white;
}

.badge-outline {
  @apply bg-transparent border border-[var(--border-default)]
         text-[var(--text-secondary)];
}

/* Animated badge for live data */
.badge-live {
  @apply relative;
}

.badge-live::before {
  content: '';
  @apply absolute -left-1 top-1/2 -translate-y-1/2
         w-2 h-2 rounded-full bg-[var(--semantic-success)]
         animate-pulse;
}
```

### 2.5 Progress Component

**Current Issues:**
- Static bar
- No animation on value change
- Lacks visual hierarchy

**Premium Enhancement:**
```tsx
.progress {
  @apply w-full h-2 bg-[var(--surface-2)]
         rounded-[var(--radius-full)] overflow-hidden;
}

.progress-bar {
  @apply h-full rounded-[var(--radius-full)]
         transition-all duration-[var(--duration-slow)]
         ease-[var(--ease-out)];
  
  /* Gradient for premium look */
  background: linear-gradient(
    90deg,
    var(--accent-primary) 0%,
    var(--accent-primary-hover) 100%
  );
}

/* Animated shimmer for loading states */
.progress-bar-indeterminate {
  @apply relative overflow-hidden;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

---

## 3. Page-by-Page Redesign Priorities

### Priority 1: Homepage (Critical)

**Current Issues:**
- Hero section lacks visual hierarchy
- Stats grid is flat
- No motion or interactivity
- Feature cards are generic

**Redesign Approach:**

```tsx
// Homepage Hero - Asymmetric Split Layout
<section className="min-h-[100dvh] relative overflow-hidden">
  {/* Background gradient mesh */}
  <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--surface-1)] to-white" />
  
  {/* Asymmetric content */}
  <div className="container grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
    {/* Left: Content */}
    <div className="space-y-8">
      <div className="section-marker">
        <span>Job Intelligence for International Talent</span>
      </div>
      
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
        Know your worth.
        <br />
        <span className="text-[var(--accent-primary)]">With better evidence.</span>
      </h1>
      
      {/* Animated stats with perpetual motion */}
      <StatsGrid />
    </div>
    
    {/* Right: Featured Bento Panel */}
    <div className="relative">
      <FeaturedSponsorsCard />
    </div>
  </div>
</section>

// Stats with animated counters
function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border-default)]">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden"
        >
          {/* Perpetual pulse animation */}
          <div className="absolute top-0 left-0 w-16 h-[3px] bg-[var(--accent-primary)]" />
          
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
            <stat.icon className="w-4 h-4 text-[var(--accent-primary)]" />
            {stat.label}
          </div>
          
          <motion.div
            className="mt-4 text-4xl font-bold tracking-tight"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <AnimatedNumber value={stat.value} />
          </motion.div>
          
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-[17ch]">
            {stat.detail}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
```

### Priority 2: Companies Page (High)

**Current Issues:**
- Filter grid is cluttered
- Company cards lack visual distinction
- No skeleton loading states
- Pagination is basic

**Redesign Approach:**

```tsx
// Companies Page - Enhanced Filter + Card Grid
<section className="min-h-screen bg-[var(--surface-0)]">
  {/* Sticky filter bar with glass effect */}
  <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-[var(--border-subtle)]">
    <div className="container py-4">
      <FilterBar />
    </div>
  </div>
  
  {/* Results with staggered animation */}
  <div className="container py-8">
    <AnimatePresence mode="wait">
      {isLoading ? (
        <CompanyGridSkeleton count={6} />
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CompanyCard company={company} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Premium pagination */}
    <Pagination />
  </div>
</section>

// Company Card with hover reveal
function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group block p-6 bg-white rounded-[var(--radius-xl)]
                 border border-[var(--border-subtle)]
                 shadow-[var(--shadow-sm)]
                 hover:shadow-[var(--shadow-lg)]
                 hover:-translate-y-1
                 transition-all duration-[var(--duration-normal)]"
    >
      {/* Header with logo */}
      <div className="flex items-start gap-4 mb-4">
        <CompanyLogo {...company} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate group-hover:text-[var(--accent-primary)] transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] truncate">
            {company.industry} • {company.headquarters}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* Score badge with gradient */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
            Visa Score
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{company.visa_fair_score}</span>
            <Badge variant={getScoreVariant(company.visa_fair_score)}>
              {getScoreLabel(company.visa_fair_score)}
            </Badge>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
            H-1B Count
          </div>
          <div className="text-2xl font-bold font-mono">
            {company.total_h1b_filings.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Hover reveal metrics */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]
                      opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)]">
        <div className="text-sm">
          <span className="text-[var(--text-tertiary)]">Coverage:</span>
          <span className="font-semibold ml-1">{company.coverage_years}</span>
        </div>
        <div className="text-sm">
          <span className="text-[var(--text-tertiary)]">Salary Records:</span>
          <span className="font-semibold ml-1">{company.offer_count.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}
```

### Priority 3: Company Detail Page (High)

**Current Issues:**
- Information density is overwhelming
- Score visualization is basic
- No clear visual hierarchy
- Similar companies section is buried

**Redesign Approach:**

```tsx
// Company Detail - Dashboard-style layout
function CompanyDetail() {
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      {/* Hero with score card */}
      <CompanyHero company={company} />
      
      {/* Bento grid layout */}
      <div className="container py-12">
        <div className="grid grid-cols-12 gap-6">
          {/* Main content - 8 columns */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Score breakdown with animated progress */}
            <ScoreBreakdownCard company={company} />
            
            {/* H-1B history with chart */}
            <H1BHistoryCard company={company} />
            
            {/* Recent offers */}
            <RecentOffersCard offers={offers} />
            
            {/* Applicant insights */}
            <ApplicantInsightsCard insights={insights} />
          </div>
          
          {/* Sidebar - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Quick actions */}
            <QuickActionsCard company={company} />
            
            {/* Company info */}
            <CompanyInfoCard company={company} />
            
            {/* Similar companies */}
            <SimilarCompaniesCard companies={similarCompanies} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Score breakdown with animated progress bars
function ScoreBreakdownCard({ company }: { company: Company }) {
  const metrics = [
    { label: 'Approval Rate', value: company.h1b_approval_rate, color: 'var(--accent-primary)' },
    { label: 'Salary vs Market', value: company.avg_salary_percentile, color: 'var(--accent-secondary)' },
    { label: 'Consistency', value: company.sponsorship_consistency_score, color: 'var(--accent-tertiary)' },
  ];
  
  return (
    <Card variant="bento">
      <CardBody className="p-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--accent-primary)]" />
          Visa Fair Score Breakdown
        </h2>
        
        <div className="flex items-center gap-6 mb-8">
          <motion.div
            className="text-6xl font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {company.visa_fair_score.toFixed(1)}
          </motion.div>
          <Badge variant={getScoreVariant(company.visa_fair_score)} size="lg">
            {getScoreLabel(company.visa_fair_score)}
          </Badge>
        </div>
        
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">{metric.label}</span>
                <span className="font-mono font-semibold">{metric.value}%</span>
              </div>
              <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
```

### Priority 4: Jobs Page (Medium)

**Current Issues:**
- Resume upload section is basic
- Job cards lack visual hierarchy
- No filtering animation
- Match score display is flat

**Redesign Approach:**

```tsx
// Jobs Page - Enhanced job matching
function JobsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      {/* Hero with resume upload */}
      <JobsHero />
      
      {/* Filters with animation */}
      <FiltersBar />
      
      {/* Job results */}
      <div className="container py-8">
        <AnimatePresence>
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard job={job} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Job card with match score
function JobCard({ job }: { job: Job }) {
  return (
    <Card className="group p-6 hover:shadow-[var(--shadow-lg)] transition-all duration-[var(--duration-normal)]">
      <div className="flex gap-6">
        {/* Match score - prominent */}
        <div className="flex-shrink-0 w-20">
          <div className="flex flex-col items-center justify-center
                          w-20 h-20 rounded-[var(--radius-lg)]
                          border-2 border-[var(--border-strong)]
                          bg-white">
            <motion.span
              className="text-2xl font-bold font-mono text-[var(--accent-primary)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {job.match_score}
            </motion.span>
            <span className="text-xs font-mono uppercase text-[var(--text-tertiary)]">Match</span>
          </div>
        </div>
        
        {/* Job details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold group-hover:text-[var(--accent-primary)] transition-colors">
                {job.title}
              </h3>
              <p className="text-[var(--text-secondary)] mt-1">
                {job.company} • {job.location}
              </p>
            </div>
            <Badge variant={job.remote_policy === 'remote' ? 'success' : 'outline'}>
              {job.remote_policy}
            </Badge>
          </div>
          
          {/* Evidence grid */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <div>
              <span className="text-xs font-mono uppercase text-[var(--text-tertiary)]">Salary Range</span>
              <p className="font-semibold mt-1">{job.salary_range}</p>
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-[var(--text-tertiary)]">Visa Support</span>
              <p className="font-semibold mt-1">{job.visa_support}</p>
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-[var(--text-tertiary)]">Source</span>
              <p className="font-semibold mt-1">{job.source}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

### Priority 5: Offers/Predictions Page (Medium)

**Current Issues:**
- Calculator is basic
- No visual feedback on calculation
- Results display is flat

**Redesign Approach:**

```tsx
// Lottery Calculator with animated results
function LotteryCalculator() {
  const [result, setResult] = useState(null);
  
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input form */}
          <Card variant="bento">
            <CardBody className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Calculate Your Odds</h2>
              <LotteryForm onSubmit={handleCalculate} />
            </CardBody>
          </Card>
          
          {/* Results with animation */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card variant="bento" className="h-full">
                  <CardBody className="p-8">
                    <h2 className="text-2xl font-semibold mb-6">Your Results</h2>
                    
                    {/* Animated probability */}
                    <div className="text-center py-8">
                      <motion.div
                        className="text-6xl font-bold text-[var(--accent-primary)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      >
                        {result.probability}%
                      </motion.div>
                      <p className="text-[var(--text-secondary)] mt-2">
                        Estimated lottery success rate
                      </p>
                    </div>
                    
                    {/* Breakdown */}
                    <div className="space-y-4">
                      {result.factors.map((factor, index) => (
                        <motion.div
                          key={factor.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[var(--text-secondary)]">{factor.label}</span>
                          <span className="font-semibold">{factor.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Animation/Motion Strategy

### 4.1 Motion Principles

1. **Purposeful Motion** - Every animation serves a purpose (feedback, guidance, delight)
2. **Performance First** - Use `transform` and `opacity` only, no layout thrashing
3. **Spring Physics** - Natural, bouncy animations with spring easing
4. **Staggered Reveals** - Sequential entrance for lists and grids
5. **Perpetual Micro-interactions** - Subtle continuous animations for "alive" feel

### 4.2 Framer Motion Implementation

```tsx
// Install framer-motion if not present
// npm install framer-motion

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

// Spring configuration for premium feel
const springConfig = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};

// Usage example
function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      transition={{ ...springConfig, delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

// Perpetual pulse for live data
function LiveDataIndicator() {
  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-[var(--semantic-success)]"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Number counter animation
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <CountUp from={0} to={value} duration={1} />
    </motion.span>
  );
}
```

### 4.3 Page Transitions

```tsx
// App-level page transitions
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes>
          {/* ... routes */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 4.4 Micro-interactions

```tsx
// Button hover with magnetic effect
function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.1);
    y.set((e.clientY - centerY) * 0.1);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.button
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

// Card hover lift
function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// Skeleton shimmer loading
function SkeletonShimmer() {
  return (
    <div className="relative overflow-hidden bg-[var(--surface-2)] rounded-[var(--radius-md)]">
      <motion.div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
        animate={{ x: ['0%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
```

---

## 5. Backend Changes Required

### 5.1 API Enhancements for UI

**Current:** Basic REST endpoints with pagination

**Required:**

```python
# backend/companies/views.py

# Add prefetch for logo URLs
class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        return Company.objects.prefetch_related(
            'benefits',
            'jobs'
        ).select_related(
            'logo'
        ).annotate(
            active_job_count=Count('jobs', filter=Q(jobs__is_active=True)),
            benefit_count=Count('benefits')
        )

# Add bulk endpoint for compare page
@action(detail=False, methods=['post'])
def bulk(self, request):
    """Get multiple companies by slug for comparison"""
    slugs = request.data.get('slugs', [])
    companies = self.get_queryset().filter(slug__in=slugs)
    serializer = self.get_serializer(companies, many=True)
    return Response(serializer.data)

# Add search suggestions endpoint
@action(detail=False, methods=['get'])
def suggestions(self, request):
    """Autocomplete suggestions for search"""
    query = request.query_params.get('q', '')[:50]
    companies = self.get_queryset().filter(
        name__icontains=query
    ).values('id', 'name', 'slug', 'logo_url')[:10]
    return Response(list(companies))
```

### 5.2 New Endpoints

```python
# backend/companies/views.py

@action(detail=False, methods=['get'])
def insights(self, request):
    """Aggregated platform statistics for homepage"""
    return Response({
        'total_companies': Company.objects.count(),
        'total_h1b_records': H1BRecord.objects.count(),
        'total_offers': Offer.objects.count(),
        'total_jobs': JobPosting.objects.filter(is_active=True).count(),
        'coverage_years': {
            'first': H1BRecord.objects.aggregate(first=Min('fiscal_year'))['first'],
            'last': H1BRecord.objects.aggregate(last=Max('fiscal_year'))['last'],
        },
        'latest_imported_at': H1BRecord.objects.aggregate(
            latest=Max('imported_at')
        )['latest'],
        'companies_with_domains': Company.objects.exclude(
            company_domain=''
        ).count(),
        'companies_with_logos': Company.objects.exclude(
            logo_url=''
        ).count(),
        'companies_with_salary_data': Company.objects.filter(
            offer_count__gt=0
        ).count(),
    })

# Add WebSocket for real-time updates (optional)
# backend/asgi.py
# Add channels for live job updates
```

### 5.3 Performance Optimizations

```python
# backend/ghosted/settings.py

# Add caching for expensive queries
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'TIMEOUT': 300,  # 5 minutes
    }
}

# Cache company insights
@method_decorator(cache_page(300))
@action(detail=False, methods=['get'])
def insights(self, request):
    # ...

# Add database indexes for common queries
class Company(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['visa_fair_score']),
            models.Index(fields=['-total_h1b_filings']),
            models.Index(fields=['-last_filing_year']),
            models.Index(fields=['industry', 'headquarters']),
        ]
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Update CSS variables and design tokens
- [ ] Install and configure Framer Motion
- [ ] Update Tailwind config with new design system
- [ ] Create new typography classes
- [ ] Update color palette across all components

### Phase 2: Core Components (Week 3-4)
- [ ] Redesign Button component with variants
- [ ] Redesign Card component with elevation system
- [ ] Redesign Input component with floating labels
- [ ] Redesign Badge component with animations
- [ ] Redesign Progress component with gradients
- [ ] Create Skeleton component with shimmer

### Phase 3: Pages - High Priority (Week 5-7)
- [ ] Redesign Homepage with Bento layout
- [ ] Redesign Companies page with staggered animations
- [ ] Redesign Company Detail with dashboard layout
- [ ] Add page transitions

### Phase 4: Pages - Medium Priority (Week 8-9)
- [ ] Redesign Jobs page with match score display
- [ ] Redesign Offers page with enhanced data visualization
- [ ] Redesign Predictions/Lottery Calculator

### Phase 5: Polish & Performance (Week 10)
- [ ] Add micro-interactions throughout
- [ ] Optimize animations for 60fps
- [ ] Add loading states and error boundaries
- [ ] Performance audit and optimization
- [ ] Cross-browser testing

### Phase 6: Backend Updates (Parallel)
- [ ] Add bulk endpoint for compare page
- [ ] Add search suggestions endpoint
- [ ] Add caching for expensive queries
- [ ] Add database indexes
- [ ] Consider WebSocket for real-time updates

---

## 7. File Structure for New Components

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Enhanced button
│   │   ├── Card.tsx           # Enhanced card with variants
│   │   ├── Input.tsx          # Enhanced input with floating label
│   │   ├── Badge.tsx          # Enhanced badge with animations
│   │   ├── Progress.tsx       # Enhanced progress with gradient
│   │   ├── Skeleton.tsx       # Skeleton with shimmer
│   │   └── ...
│   ├── layout/
│   │   ├── PageTransition.tsx  # Page transition wrapper
│   │   ├── BentoGrid.tsx      # Bento grid layout
│   │   └── ...
│   ├── motion/
│   │   ├── AnimatedNumber.tsx  # Number counter
│   │   ├── MagneticButton.tsx  # Magnetic hover
│   │   ├── HoverCard.tsx      # Hover lift effect
│   │   ├── LiveDataIndicator.tsx
│   │   └── ...
│   └── ...
├── styles/
│   ├── design-tokens.css      # CSS variables
│   ├── animations.css         # Keyframe animations
│   └── utilities.css          # Custom utilities
└── ...
```

---

## 8. Success Metrics

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Animation frame rate = 60fps

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratio >= 4.5:1
- [ ] Focus indicators visible

### User Experience
- [ ] Visual hierarchy clear on all pages
- [ ] Interactive elements have feedback
- [ ] Loading states for all async operations
- [ ] Error states with recovery actions
- [ ] Empty states with guidance

---

## 9. Anti-Patterns to Avoid

Based on the design-taste-frontend skill:

1. **NO Inter font** - Use Geist, Satoshi, or Cabinet Grotesk instead
2. **NO pure black (#000000)** - Use off-black (#0a0a0a)
3. **NO neon glows** - Use subtle shadows and borders
4. **NO 3-column card layouts** - Use asymmetric grids
5. **NO generic names** - Use realistic, contextual data
6. **NO emojis** - Use Phosphor or Radix icons
7. **NO centered heroes** - Use asymmetric layouts
8. **NO oversaturated accents** - Desaturate to blend elegantly
9. **NO h-screen** - Use min-h-[100dvh] for mobile safety
10. **NO complex flex math** - Use CSS Grid instead

---

## 10. Conclusion

This redesign transforms Ghosted from a functional Neo-Brutalist interface into a premium, polished experience while preserving its distinctive character. The key improvements are:

1. **Refined Visual System** - Sophisticated color palette with proper elevation
2. **Purposeful Motion** - Micro-interactions that guide and delight
3. **Better Information Architecture** - Dashboard-style layouts for data-heavy pages
4. **Performance-First** - 60fps animations with proper memoization
5. **Accessibility** - WCAG AA compliance throughout

The result will be a visa-aware job intelligence platform that feels premium, trustworthy, and distinctly modern.