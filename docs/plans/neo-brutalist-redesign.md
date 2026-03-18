# Neo-Brutalist Redesign Plan - WHITE + ORANGE

> **Use superpowers-workflow + frontend-design skills**

**Goal:** Redesign Ghosted with a proper neo-brutalist aesthetic - WHITE background with ORANGE accent (#ff6b35), sharp edges, brutalist shadows.

**Theme:**
- Background: Pure white (#ffffff) 
- Accent: Vibrant orange (#ff6b35)
- Text: Near-black (#0a0a0a)
- Borders: Thick black (2-3px)
- Shadows: Hard offset shadows (4-6px, no blur)
- Typography: Space Grotesk (bold, geometric) + JetBrains Mono

---

## Design System

### Colors
```css
--bg: #ffffff
--bg-secondary: #f5f5f5
--accent: #ff6b35 (vibrant orange)
--accent-hover: #e85a2b
--text: #0a0a0a
--text-muted: #525252
--border: #0a0a0a
```

### Typography
- Display: "Space Grotesk", sans-serif (bold, geometric)
- Body: "Inter", sans-serif
- Mono: "JetBrains Mono", monospace

### Components
- Buttons: Sharp corners, 3px border, 4px offset shadow, orange bg
- Cards: White bg, 3px black border, 4px shadow, hover lift
- Inputs: Sharp borders, black outline on focus

---

## Implementation Tasks

### Task 1: Update Design Tokens
**Files:**
- tailwind.config.js - Add orange color palette
- src/index.css - Update CSS variables, Google Fonts

### Task 2: Rebuild Layout Component
**File:** src/components/Layout.tsx
- White navbar with thick black border-bottom
- Orange logo accent
- Sharp nav items with hover states
- Mobile menu with same styling

### Task 3: Rebuild Home Page
**File:** src/pages/Home.tsx
- White background
- Orange accent text
- Feature cards with brutalist shadows
- All neo-brutalist styling

### Task 4: Rebuild All Other Pages
**Files:**
- src/pages/Companies.tsx
- src/pages/CompanyDetail.tsx
- src/pages/Offers.tsx
- src/pages/Predictions.tsx
- src/pages/Dashboard.tsx
- src/pages/Login.tsx
- src/pages/Register.tsx
- src/pages/LotteryCalculator.tsx

### Task 5: Browser Testing
- Use browser snapshots to verify design
- Check all pages render correctly
- Verify mobile responsive

---

## Success Criteria
- [ ] White background throughout
- [ ] Orange (#ff6b35) accent color
- [ ] Sharp edges (no rounded corners)
- [ ] Thick black borders
- [ ] Hard offset shadows
- [ ] Space Grotesk typography
- [ ] Consistent neo-brutalist aesthetic
- [ ] All pages tested in browser
