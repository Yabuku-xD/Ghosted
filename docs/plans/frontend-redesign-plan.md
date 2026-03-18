# Ghosted Frontend Redesign Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Completely rebuild the Ghosted frontend with proper Tailwind CSS, neo-brutalist design system, and working navigation/pages.

**Architecture:** React + TypeScript + Tailwind CSS + Vite. Neo-brutalist theme with sharp edges, solid shadows, and terracotta accent color (#c73e1d).

**Tech Stack:** React 19, TypeScript, Tailwind CSS 3.4, Vite, React Query, React Router, Lucide Icons

---

## Phase 1: Setup & Configuration

### Task 1: Verify Tailwind Configuration

**Objective:** Ensure Tailwind CSS is properly configured and working

**Files:**
- Verify: `tailwind.config.js`
- Verify: `postcss.config.js`
- Modify: `src/index.css`

**Step 1: Check existing config files**

Read the files to verify they exist and have correct content:
- `tailwind.config.js` should have content paths and custom colors
- `postcss.config.js` should have tailwindcss and autoprefixer plugins

**Step 2: Update index.css with proper structure**

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg: #faf9f7;
    --color-bg-secondary: #f5f5f0;
    --color-text: #1a1a1a;
    --color-text-muted: #6b6b6b;
    --color-accent: #c73e1d;
    --color-accent-hover: #a83218;
    --color-success: #2d6a4f;
    --color-warning: #d4a373;
    --color-danger: #9b2226;
    --color-border: #1a1a1a;
  }
  
  body {
    @apply bg-[#faf9f7] text-[#1a1a1a] antialiased;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c73e1d] text-white font-semibold border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none;
  }
  
  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none;
  }
  
  .card {
    @apply bg-white border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000];
  }
  
  .card-static {
    @apply bg-white border-2 border-black;
  }
  
  .bento-card {
    @apply bg-[#f5f5f0] border-2 border-black p-6 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000];
  }
  
  .input-field {
    @apply w-full px-4 py-3 bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#c73e1d] focus:border-black;
  }
}

@layer utilities {
  .font-display {
    font-family: 'Playfair Display', Georgia, serif;
  }
  .font-mono {
    font-family: 'Space Mono', 'SF Mono', Monaco, monospace;
  }
}
```

**Step 3: Verify build works**

Run: `npm run build`
Expected: Build successful with no errors

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "config: setup Tailwind with neo-brutalist theme"
```

---

## Phase 2: Core Components

### Task 2: Create Layout Component with Navigation

**Objective:** Build the main layout with navbar and footer

**Files:**
- Create/Modify: `src/components/Layout.tsx`

**Step 1: Write the Layout component**

Complete implementation with:
- Logo (G in red square with shadow)
- Desktop navigation (Companies, Offers, Predictions)
- Auth buttons (Sign In, Get Started)
- Mobile menu with hamburger
- Footer with links

Use Tailwind classes throughout. No custom CSS classes.

Key styling:
- Navbar: `sticky top-0 z-50 bg-white border-b-2 border-black`
- Logo: `w-10 h-10 bg-[#c73e1d] text-white flex items-center justify-center border-2 border-black shadow-[3px_3px_0_0_#000]`
- Nav links: `font-mono text-sm uppercase tracking-wider`
- Active state: `bg-[#f5f5f0] border-2 border-black shadow-[3px_3px_0_0_#000]`

**Step 2: Test the component**

Run dev server: `npm run dev`
Verify: Navbar displays correctly at top

**Step 3: Commit**

```bash
git add src/components/Layout.tsx
git commit -m "feat: add Layout component with navigation"
```

---

### Task 3: Create ProtectedRoute Component

**Objective:** Add authentication guard component

**Files:**
- Create/Modify: `src/components/ProtectedRoute.tsx`

**Step 1: Write the component**

Simple component that:
- Uses useAuth hook to check authentication
- Shows loading spinner while checking
- Redirects to login if not authenticated
- Renders children if authenticated

**Step 2: Commit**

```bash
git add src/components/ProtectedRoute.tsx
git commit -m "feat: add ProtectedRoute component"
```

---

## Phase 3: Page Components

### Task 4: Create Home Page

**Objective:** Build the homepage with hero section and feature cards

**Files:**
- Create/Modify: `src/pages/Home.tsx`

**Step 1: Write the Home component**

Sections:
1. Hero with headline "Know your worth. Anywhere."
2. Featured companies card (Amazon, Microsoft, Google)
3. 4 feature cards (Company Database, Salary Intelligence, Lottery Calculator, Sponsorship Tracker)
4. CTA section

Use Tailwind classes:
- Hero text: `text-5xl md:text-6xl font-bold font-display`
- Accent text: `text-[#c73e1d]`
- Buttons: `btn-primary` and `btn-secondary`
- Feature cards: `bento-card`

**Step 2: Test**

Navigate to home page
Verify: All sections display correctly

**Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat: add Home page with hero and features"
```

---

### Task 5: Create Companies Page

**Objective:** Build company listing page with search and filters

**Files:**
- Create/Modify: `src/pages/Companies.tsx`

**Step 1: Write the component**

Features:
- Search input
- Filter dropdowns (score, sponsors only)
- Company cards grid
- Each card shows: logo (first letter), name, visa score, H-1B count

Use Tailwind:
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Cards: `card` class
- Search: `input-field`

**Step 2: Test**

Navigate to /companies
Verify: Companies load and display

**Step 3: Commit**

```bash
git add src/pages/Companies.tsx
git commit -m "feat: add Companies listing page"
```

---

### Task 6: Create Company Detail Page

**Objective:** Build individual company detail view

**Files:**
- Create/Modify: `src/pages/CompanyDetail.tsx`

**Step 1: Write the component**

Sections:
- Company header with logo and name
- Visa Fair Score with progress bar
- H-1B stats (filings, approved, denied, rate)
- Recent offers list

Use Tailwind for all styling.

**Step 2: Commit**

```bash
git add src/pages/CompanyDetail.tsx
git commit -m "feat: add CompanyDetail page"
```

---

### Task 7: Create Offers Page (FIX OVERFLOW)

**Objective:** Build offers database page with FIXED stat boxes

**Files:**
- Create/Modify: `src/pages/Offers.tsx`

**Step 1: Write the component**

CRITICAL - Fix the overflow issue:
- 4 stat boxes at top: Avg Salary, Total Offers, Companies, Median
- Use `min-w-0` on each box
- Use `truncate` on numbers
- Responsive text sizes

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <div className="bg-[#f5f5f0] border-2 border-black p-4 min-w-0">
    <div className="text-xl lg:text-2xl font-bold font-mono truncate">
      ${Math.round(avgSalary).toLocaleString()}
    </div>
  </div>
  {/* ... 3 more boxes ... */}
</div>
```

Table with offers data below.

**Step 2: Test**

Navigate to /offers
Verify: Numbers stay inside boxes, no overflow

**Step 3: Commit**

```bash
git add src/pages/Offers.tsx
git commit -m "feat: add Offers page with fixed stat boxes"
```

---

### Task 8: Create Predictions Page

**Objective:** Build predictions page with tabs

**Files:**
- Create/Modify: `src/pages/Predictions.tsx`

**Step 1: Write the component**

Tabs:
- Salary Predictor
- Sponsorship Tracker

Use Tailwind for tab styling.

**Step 2: Commit**

```bash
git add src/pages/Predictions.tsx
git commit -m "feat: add Predictions page with tabs"
```

---

### Task 9: Create SalaryPredictor Component

**Objective:** Build salary prediction form

**Files:**
- Create/Modify: `src/components/SalaryPredictor.tsx`

**Step 1: Write the component**

Form with:
- Job title input
- Location input
- Years experience
- Education level
- Visa type
- Results display with min/expected/max

**Step 2: Commit**

```bash
git add src/components/SalaryPredictor.tsx
git commit -m "feat: add SalaryPredictor component"
```

---

### Task 10: Create SponsorshipTracker Component

**Objective:** Build sponsorship likelihood checker

**Files:**
- Create/Modify: `src/components/SponsorshipTracker.tsx`

**Step 1: Write the component**

Form with job title and experience level.
Shows likelihood score and recommendations.

**Step 2: Commit**

```bash
git add src/components/SponsorshipTracker.tsx
git commit -m "feat: add SponsorshipTracker component"
```

---

### Task 11: Create Dashboard Page

**Objective:** Build user dashboard

**Files:**
- Create/Modify: `src/pages/Dashboard.tsx`

**Step 1: Write the component**

Stats cards + recent applications list.

**Step 2: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: add Dashboard page"
```

---

### Task 12: Create Login Page

**Objective:** Build login form

**Files:**
- Create/Modify: `src/pages/Login.tsx`

**Step 1: Write the component**

Form with username/password.
Link to register.

**Step 2: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: add Login page"
```

---

### Task 13: Create Register Page

**Objective:** Build registration form

**Files:**
- Create/Modify: `src/pages/Register.tsx`

**Step 1: Write the component**

Form with username, email, password, confirm password.

**Step 2: Commit**

```bash
git add src/pages/Register.tsx
git commit -m "feat: add Register page"
```

---

### Task 14: Create LotteryCalculator Page

**Objective:** Build H-1B lottery calculator

**Files:**
- Create/Modify: `src/pages/LotteryCalculator.tsx`

**Step 1: Write the component**

Form with country, masters degree checkboxes.
Shows lottery odds and timeline.

**Step 2: Commit**

```bash
git add src/pages/LotteryCalculator.tsx
git commit -m "feat: add LotteryCalculator page"
```

---

## Phase 4: Routing & Integration

### Task 15: Update App.tsx with Routes

**Objective:** Wire up all routes

**Files:**
- Modify: `src/App.tsx`

**Step 1: Write the router configuration**

All routes:
- / -> Home
- /companies -> Companies
- /companies/:id -> CompanyDetail
- /offers -> Offers
- /predictions -> Predictions
- /lottery-calculator -> LotteryCalculator
- /dashboard -> Dashboard (protected)
- /login -> Login
- /register -> Register

**Step 2: Test navigation**

Click through all routes
Verify: Each page loads correctly

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add routing configuration"
```

---

## Phase 5: Verification

### Task 16: Build and Verify

**Objective:** Ensure everything builds without errors

**Step 1: Run build**

```bash
npm run build
```

Expected: No TypeScript errors, no build errors

**Step 2: Run dev server and manual test**

```bash
npm run dev
```

Test:
- Homepage loads
- Navigation works
- Companies page loads data
- Offers page shows stat boxes without overflow
- All buttons work
- Mobile menu works

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete frontend redesign with Tailwind"
```

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Homepage renders with hero, stats, features
- [ ] Navbar shows on all pages
- [ ] Mobile menu opens/closes
- [ ] Companies page loads company cards
- [ ] Company detail page shows stats
- [ ] Offers page shows 4 stat boxes without overflow
- [ ] Predictions page has working tabs
- [ ] Login/Register forms work
- [ ] Dashboard loads (when authenticated)
- [ ] All buttons have hover effects
- [ ] No console errors

### Visual Checks

- [ ] Neo-brutalist theme applied consistently
- [ ] Sharp edges (no rounded corners)
- [ ] Solid shadows on buttons and cards
- [ ] Terracotta accent color (#c73e1d)
- [ ] Typography hierarchy clear
- [ ] Responsive on mobile

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| TypeScript errors | Fix type issues immediately, use `any` sparingly |
| Tailwind not applying | Verify config paths, rebuild |
| API not connecting | Check API client base URL |
| Overflow issues | Use min-w-0 and truncate classes |
| Build fails | Check for unused imports/variables |

---

## Success Criteria

- [ ] All 14 tasks complete
- [ ] Build succeeds with no errors
- [ ] All pages load correctly
- [ ] Navigation works (desktop + mobile)
- [ ] Stat boxes don't overflow
- [ ] Neo-brutalist theme consistent
- [ ] No Tailwind class errors
- [ ] Responsive design works

---

## Notes for Implementer

1. **Use Tailwind classes only** - No custom CSS classes
2. **Follow the design system** - Colors, shadows, borders as specified
3. **Test overflow** - Especially on Offers page stat boxes
4. **Mobile first** - All components should work on mobile
5. **Commit after each task** - Don't batch changes
6. **Copy-pasteable code** - Each task has complete code examples

When in doubt, refer to the neo-brutalist design principles:
- Sharp corners (no rounded corners)
- Solid black shadows (not blur)
- High contrast
- Bold typography
- Terracotta accent (#c73e1d)
