# KEYSTONE — TOTAL EVALUATION SCRIPT
## Technical QA + Business Analysis + Market Research + Gap Finding

**URL:** https://keystonebuild.vercel.app
**Duration:** 6-8 hours (full evaluation) or pick sections as needed
**Scope:** Every feature, every button, every page, every flow — plus business viability, market positioning, and competitive analysis
**Goal:** Score the app 0-100 across multiple dimensions, find every issue, and produce an actionable improvement roadmap

---

# PART A: TECHNICAL QA (Score: /40)

---

## A1: LANDING PAGE & MARKETING SITE (30 min)

### A1.1 First Impression & Performance
- [ ] Load keystonebuild.vercel.app — record time to first meaningful paint
- [ ] Lighthouse score: Performance, Accessibility, Best Practices, SEO (run in incognito)
- [ ] Does the page load correctly on: Chrome, Firefox, Safari, Edge?
- [ ] Mobile viewport (375px): any horizontal overflow? Text readable? Touch targets 44px+?
- [ ] Tablet viewport (768px): layout correct? No awkward gaps?
- [ ] Record: headline text, subheadline, primary CTA, secondary CTA
- [ ] Is the value proposition clear within 5 seconds of landing?
- [ ] Does the page clearly communicate WHAT Keystone does, WHO it's for, and WHY it's different?

### A1.2 Navigation & Links
- [ ] Sticky nav: appears on scroll? Logo links to top? All nav items work?
- [ ] "How it works" link scrolls to correct section?
- [ ] "About" link scrolls to founder section?
- [ ] "Sign in" navigates to /login?
- [ ] "Start free" navigates to /register?
- [ ] Dark mode toggle in nav: works? Persists on refresh?
- [ ] When LOGGED IN: nav shows "Go to Dashboard" instead of "Sign in"?
- [ ] Mobile hamburger menu: opens/closes? All links work? Auth-aware?

### A1.3 Content Sections (scroll through ALL)
- [ ] Hero section: headline, subheadline, 2 CTAs, hero image/demo
- [ ] "Three steps" section: 3 cards, numbered, icons, descriptions
- [ ] "See it in action" interactive demo:
  - [ ] 5 tabs (Analyze, Plan, Build, Track, Complete) all switch content?
  - [ ] Auto-rotation works? Pauses on click?
  - [ ] Browser mockup renders correctly?
  - [ ] Content in each tab is different and relevant?
- [ ] "Everything you need" feature grid: 6 feature cards with icons
- [ ] "Building from abroad" diaspora section: bullet points, CTA, live monitor mockup
- [ ] Pricing section:
  - [ ] 4 tiers: Starter ($0), Builder ($19), Developer ($49), Enterprise ($149)
  - [ ] Annual pricing shown with savings %?
  - [ ] "Most popular" badge on Developer?
  - [ ] Feature lists accurate? Match the Settings > Plan page?
  - [ ] CTA buttons all work?
  - [ ] Enterprise "Contact us" opens mailto?
  - [ ] Section has `id="pricing"` anchor?
- [ ] FAQ section:
  - [ ] All 6 accordion items expand/collapse?
  - [ ] Answers are accurate and helpful?
  - [ ] Section has `id="faq"` anchor?
- [ ] About/Founder section:
  - [ ] Photo, name, title, bio text
  - [ ] Story is compelling and authentic?
- [ ] Footer:
  - [ ] Logo + tagline
  - [ ] Product column: Features (#how-it-works), Pricing (#pricing), About (#about) — all anchor links work?
  - [ ] Support column: Pricing, FAQ (#faq), Learn (/learn), email — all work?
  - [ ] Legal column: Privacy (/privacy, new tab), Terms (/terms, new tab)
  - [ ] Copyright: "© 2026 Keystone. All rights reserved."
  - [ ] All mailto links use correct email?

### A1.4 Legal Pages
- [ ] /privacy: loads? Professional content? Contact email?
- [ ] /terms: loads? Professional content? Contact email?
- [ ] Both accessible without login?
- [ ] Back navigation works from both?

### A1.5 SEO & Meta
- [ ] Page title: "Keystone"?
- [ ] Meta description present and descriptive?
- [ ] Open Graph tags: title, description, type?
- [ ] Twitter card meta tags?
- [ ] Favicon loads correctly?
- [ ] manifest.json linked? PWA-installable on mobile?

---

## A2: AUTHENTICATION FLOWS (20 min)

### A2.1 Registration
- [ ] /register page loads correctly
- [ ] Submit empty form: inline error on EVERY required field?
- [ ] Invalid email ("notanemail"): specific error message?
- [ ] Short password (<6 chars): strength indicator shows "too short"?
- [ ] Valid password (8+ chars): indicator shows "fair" or "strong"?
- [ ] Password with uppercase + number + special: shows "strong"?
- [ ] Terms checkbox: stays checked when other field errors fire?
- [ ] Terms link: opens in NEW TAB? (not navigate away)
- [ ] Privacy link: same new tab behavior?
- [ ] Tab back to form: data still there?
- [ ] Market options: USA, Togo, Ghana, Benin, Ivory Coast, Senegal — all 6 present?
- [ ] Submit valid form: redirects to Dashboard? No console errors?
- [ ] Email verification banner appears?
- [ ] Onboarding tour appears for new user?
- [ ] Demo project auto-created?

### A2.2 Login
- [ ] /login page loads
- [ ] Wrong password: error message? Doesn't reveal if email exists?
- [ ] Non-existent email: same generic error?
- [ ] Correct credentials: redirects to Dashboard?
- [ ] "Show password" toggle works?
- [ ] "Forgot password" link works?

### A2.3 Forgot Password
- [ ] /forgot-password page loads
- [ ] Invalid email: inline error?
- [ ] Valid email: success message ("Check your email")?
- [ ] "Back to login" link works?

### A2.4 Auth Guards
- [ ] Visit /dashboard while logged out: redirects to /login?
- [ ] Visit /project/[id]/overview while logged out: redirects?
- [ ] Visit /settings while logged out: redirects?
- [ ] After login, redirects back to intended page?

### A2.5 Session Management
- [ ] Open app in two tabs: both authenticated?
- [ ] Sign out in one tab: other tab redirects to login?
- [ ] Close browser, reopen: still logged in? (persistent session)

---

## A3: DASHBOARD & GLOBAL NAVIGATION (20 min)

### A3.1 Dashboard Page
- [ ] Greeting: matches time of day? Shows user name?
- [ ] Date shown correctly?
- [ ] Getting Started checklist: items present? Checked items match completed actions?
- [ ] Quick Actions: New Project, Deal Analyzer, Learn, Export — all navigate correctly?
- [ ] Project cards: each shows name, market badge, phase, progress ring, budget, last active
- [ ] Click project card: navigates to project Overview?
- [ ] Kebab menu (⋮) on project card: View, Set Priority, Delete — all work?
- [ ] Delete project: confirmation dialog? Requires typing project name? Works?
- [ ] Priority setting: P1/P2/P3/Clear — persists?
- [ ] Pinned projects sort to top?
- [ ] Multiple projects: all visible? Different markets show correct currencies?

### A3.2 Sidebar Navigation
- [ ] All items present: Dashboard, Vault, Deal Analyzer, Learn, Settings, New Project
- [ ] When inside a project: project-specific nav appears (Overview, Budget, Schedule, etc.)
- [ ] Active item highlighted?
- [ ] Sidebar collapse (Ctrl+B or button): collapses to icons?
- [ ] Collapsed tooltips appear on hover?
- [ ] Expand: back to full sidebar?
- [ ] Mobile: hamburger opens sidebar overlay? Clicking outside closes it?
- [ ] User info at bottom: name, plan badge?
- [ ] Sign out button works?

### A3.3 Topbar
- [ ] Shows page title and context badge?
- [ ] Notification bell: shows count? Click opens notification panel?
- [ ] Notifications: relevant to project state? Click navigates to correct page?
- [ ] Dismiss single notification works?
- [ ] "Dismiss all" works?
- [ ] Search (Ctrl+K): modal opens? Type query: results appear? Click result navigates?

### A3.4 Global Features
- [ ] Dark mode toggle: all pages render correctly in dark mode?
- [ ] Keystone Mentor: appears on pages? Context-aware tips? Dismissable?
- [ ] Offline banner: appears when disconnected? Disappears when reconnected?
- [ ] Email verify banner: appears if unverified? Dismiss works? Resend works?
- [ ] Trial banner: appears if trialing? Shows expiry? "Upgrade now" link works?

### A3.5 Vault Page
- [ ] /vault loads without errors
- [ ] All projects listed (not just current project's data)
- [ ] Filters: All, Active, Paused, Done — all work?
- [ ] Market filters: All, USA, W. Africa — correct?
- [ ] Sort: Priority, Recent, Progress — reorders correctly?
- [ ] Search box: filters by project name?
- [ ] Stats line at top: updates when filters applied?
- [ ] Grid view vs List view toggle (if exists)?
- [ ] Browser back button: no crash?

### A3.6 Learn Page
- [ ] /learn loads
- [ ] 9 construction phases listed with educational content?
- [ ] Click a phase: content expands?
- [ ] Content is educational, accurate, market-aware?
- [ ] Glossary terms linked/highlighted?
- [ ] Disclaimer present at bottom?

---

## A4: PROJECT CREATION WIZARD (45 min)

### A4.1 USA "Build to Occupy" Project
For each step, check: mentor tip visible, back button preserves data, step dots navigable

- [ ] Step 1 (Goal): 3 options (Occupy, Rent, Sell). Select "Build to occupy"
- [ ] Step 2 (Market): USA selected. Description mentions wood-frame construction
- [ ] Step 3 (Location): Enter ZIP 77002 (Houston, TX)
  - [ ] Location Intelligence panel loads with real data?
  - [ ] Cost index, labor rates, lot prices, climate zone shown?
  - [ ] Loading spinner while fetching? Error handling if API fails?
- [ ] Step 4 (Property): Single-family home selected
- [ ] Step 5 (Size):
  - [ ] Size ranges correct for USA (sqft, not sqm)?
  - [ ] Bedrooms/bathrooms/stories steppers work? Min/max enforced?
  - [ ] Feature toggles: Garage, Porch, Pool, Basement, Solar, etc.
  - [ ] **VERIFY: Toggling features CHANGES the cost estimate** (was Bug #5)
  - [ ] Construction cost estimate displayed and reasonable?
- [ ] Step 6 (Land): "Still looking" estimates land cost? "Known price" allows entry?
- [ ] Step 7 (Financing): Construction loan selected
  - [ ] Down payment %, interest rate, timeline fields
  - [ ] Monthly payment estimate shown?
- [ ] Step 8 (Financials): Cost breakdown with donut chart
  - [ ] All categories: Land, Construction, Soft costs, Financing, Contingency?
  - [ ] Donut chart renders without clipping?
  - [ ] Total reasonable for specs entered?
- [ ] Step 9 (Deal Score): Score shown with factors and risks?
- [ ] Step 10 (Name): Default name generated? Can customize? Create succeeds?
- [ ] Redirects to Overview with welcome banner?

### A4.2 Togo "Build to Rent" Project
- [ ] Goal: "Build to rent" selected
- [ ] Market: "Togo" — description mentions reinforced concrete, CFA zone?
- [ ] Location: "Lome" entered — location data loads?
- [ ] Property: "Duplex" selected
- [ ] Size: uses **m²** (not sqft)? (was Bug #15)
- [ ] Financing: "Phased cash" — no loan fields shown?
- [ ] Financials: currency is FCFA? No financing costs for cash?
- [ ] Create succeeds? Overview loads?

### A4.3 Edge Cases
- [ ] "Build to sell" goal: creates successfully?
- [ ] Ghana project: works end-to-end?
- [ ] Benin project: works end-to-end?
- [ ] Back button in wizard: data preserved?
- [ ] Step indicator dots: clickable? Completed steps show checkmarks?
- [ ] Cancel wizard: confirmation dialog? Returns to dashboard?
- [ ] Refresh page mid-wizard: data lost? (acceptable)
- [ ] Enter extremely large/small values: handled gracefully?

---

## A5: PROJECT PAGES — FULL AUDIT (90 min)

### A5.1 Overview Page
- [ ] KPI strip: Progress %, Budget, Spent, Timeline, Team count, Tasks left
- [ ] Each KPI clickable: navigates to the correct page?
- [ ] Progress % matches actual task completion (completed/total)?
- [ ] Phase badge shows correct current phase?
- [ ] Phase tracker visualization: correct phase highlighted?
- [ ] Tasks grouped by milestone? Milestone headers visible?
- [ ] Review banner: shows items needing review? Click navigates?
- [ ] Task completion flow:
  - [ ] Click task: inline form opens?
  - [ ] Pre-filled evidence from wizard data?
  - [ ] Can edit evidence text?
  - [ ] Optional cost field: enter amount, complete — budget updates?
  - [ ] Can attach photos to task evidence?
  - [ ] Task marks as done? Next task auto-expands?
  - [ ] Can reopen a completed task?
  - [ ] Previous completion note still visible?
- [ ] Complete ALL tasks in a phase: Phase Gate appears?
  - [ ] "Move to [next phase]" button works?
  - [ ] Celebration modal shows correct phase names?
  - [ ] New phase tasks visible after advancing?
- [ ] Welcome banner (new project): links work? Dismissable? Stays dismissed?
- [ ] Right sidebar: Budget widget, Deal Score, Recent Activity, Insights, Quick links
- [ ] Phase education card: relevant content for current phase?

### A5.2 Budget Page
- [ ] Donut chart: renders without clipping? Center text readable?
- [ ] KPIs: Budget, Spent, Remaining, Utilization — correct values?
- [ ] AI insight present and relevant?
- [ ] Category table: Category, Estimated, Actual, Variance, Progress columns?
- [ ] Colored dots match donut slices?
- [ ] Sort by each column header: works?
- [ ] "Show ranges" button: market benchmark ranges appear?
- [ ] Add item: form appears? Save works?
- [ ] Edit item: click to expand? Change values? Save on blur/button?
- [ ] **Variance formatting: consistent compact format** (was Bug #4)?
- [ ] Delete item: confirmation? Removed?
- [ ] Sticky footer: Budget, Spent, Left, Contingency — visible on scroll? Values correct?
- [ ] Mobile: donut stacks above KPIs? No overflow?

### A5.3 Schedule Page
- [ ] Phase cards: horizontal scroll? Current phase highlighted?
- [ ] Each card: phase name, duration range, milestone count?
- [ ] Click different phase: expands with milestone list?
- [ ] Milestone checkboxes: interactive?
- [ ] Check milestone on Schedule: Overview tasks show "Review" badge?
- [ ] Complete all Overview tasks for a milestone: Schedule auto-checks?
- [ ] Milestone Timeline visualization renders?
- [ ] "Set date" on milestone: date picker works?
- [ ] "Add to Calendar": generates ICS file?
- [ ] Week number matches Overview KPI?

### A5.4 Financials Page
- [ ] KPI strip: Budget, Spent, Remaining, Safety cushion (adjusted)?
- [ ] "Safety cushion" label (NOT just "Contingency")?
- [ ] Contingency analysis: base rate, adjusted rate, reserve amount?
- [ ] Adjustment factors with +/- percentages?
- [ ] "Show formula" link expands?
- [ ] USA project — Loan Calculator:
  - [ ] Income/debts fields EMPTY (not hardcoded)?
  - [ ] Down payment pre-filled from wizard?
  - [ ] Interest rate pre-filled (or live rate)?
  - [ ] "Live: X%" hint shown?
  - [ ] Calculate: DTI ratio, Max loan, Monthly PITI, Status?
  - [ ] DTI tooltip explains "Debt-to-Income ratio"?
  - [ ] Draw schedule: milestone payments? Sum ~100%?
- [ ] Togo project — Phased Funding:
  - [ ] "Phased funding" section (not loan calculator)?
  - [ ] Progress bars per construction phase?
  - [ ] Currency converter: USD → FCFA works? Live rate badge?
- [ ] Rental project — Yield Calculator:
  - [ ] Monthly rent field pre-filled?
  - [ ] Calculate: cap rate, net yield, cash flow, break-even?
  - [ ] Cash flow color: green positive, red negative?

### A5.5 Team Page
- [ ] Add contact: modal opens? Fill name, role, phone — saves?
- [ ] Empty email/WhatsApp: saves without error?
- [ ] Contact card: correct info? Star rating? Edit? Delete?
- [ ] Trades Needed tab: required trades for current phase? Matched/unmatched?
- [ ] Performance tab: table with ratings?

### A5.6 Documents Page
- [ ] Two tabs: "My Documents" and "Templates"?
- [ ] **Dates show correct year** (not 2001)? (was Bug #1)
- [ ] **File sizes show actual values** (not "--")? (was Bug #2)
- [ ] **Separator uses em dash** (—, not --)? (was Bug #8)
- [ ] Templates tab: phase filter pills? Template cards with generate button?
- [ ] Upload: file picker opens? Type/phase dropdowns? Upload succeeds?
- [ ] Missing documents alert: shows for required but missing docs?

### A5.7 Photos Page
- [ ] Upload: drag-and-drop zone? File picker? Phase auto-selected?
- [ ] **Pluralization: "1 photo" not "1 photos"** (was Bug #3)?
- [ ] Grid: 4 columns desktop? Phase badge on each?
- [ ] Filter pills: All, By Phase, By Milestone, By Date?
- [ ] Lightbox: click photo opens fullscreen? Metadata sidebar? Nav arrows?
- [ ] Edit caption? Delete photo? Close lightbox?
- [ ] Keyboard navigation (arrow keys)?

### A5.8 Daily Log Page
- [ ] Stats strip: Total entries, This week, Avg crew, Since last entry?
- [ ] "Since last entry" shows "N/A" when no entries?
- [ ] Week calendar strip: Mon-Sun, navigate with arrows, dots for entries?
- [ ] Add entry: weather presets, temperature, crew size, content?
- [ ] Temperature unit: F for USA, C for Togo?
- [ ] Quick tags visible?
- [ ] Entry interaction: expand, edit, delete?

### A5.9 Inspections Page
- [ ] Stats: Passed, Failed, Pending, Total?
- [ ] **Defaults to current project phase** (not Define)? (was Bug #5 from first QA)
- [ ] Phase tabs with counts?
- [ ] Record result: Pass/Fail/Conditional, inspector name, date, notes?
- [ ] Add custom inspection: saves and persists on refresh?

### A5.10 Punch List Page
- [ ] Empty state: beginner-friendly text?
- [ ] Add item: description, trade, severity, notes? Saves?
- [ ] Status filters: Open, In Progress, Resolved?
- [ ] Severity filters: Critical, Major, Minor?
- [ ] Change status works?

### A5.11 Monitor Page (Diaspora Remote Monitoring)
- [ ] Live camera section: empty state? Add camera? Feed displays?
- [ ] Photo evidence feed: project photos? Date filters (All, 7d, 30d)?
- [ ] Milestone payment tracker: milestones with amounts? Progress bar?
- [ ] Weekly summary: 6 KPIs match other pages?
- [ ] Activity log: merged timeline of logs + photos?
- [ ] Material tracker: add material? Discrepancy alerts?

### A5.12 AI Assistant
- [ ] 5 topic tabs: General, Budget, Schedule, Risk, Contract?
- [ ] Different placeholder per tab?
- [ ] Send message: response appears? Markdown renders?
- [ ] **Error message descriptive** (not generic "unable to reach")? (was Bug #2)
- [ ] **Tab badges exclude errors from count**? (was Bug #6)
- [ ] Per-tab conversations preserved when switching?
- [ ] Query counter visible? Only increments on success?

---

## A6: DEAL ANALYZER (15 min)

- [ ] Select goal, market, location, property, size, features, financing
- [ ] Real-time results update as inputs change?
- [ ] Deal score with factors and risk warnings?
- [ ] Cost breakdown chart?
- [ ] Sensitivity analysis?
- [ ] "Create Project" from analysis: works?
- [ ] "What Can I Afford" mode: enter budget, see results?
- [ ] **West Africa: size units show m²** (not sqft)? (was Bug #15)
- [ ] Timeline selection: analysis updates?
- [ ] Save analysis: works? Load saved analysis: works?

---

## A7: SETTINGS PAGE (15 min)

- [ ] Profile: name, timezone, currency, language — save works?
- [ ] Plan tab: current plan shown? 4 tiers with correct pricing?
- [ ] Trial code input: invalid code shows error? Valid code upgrades?
- [ ] Notifications tab: toggles persist on refresh?
- [ ] Data tab:
  - [ ] **"Reset Demo Project" button exists** (was Bug #4)? Works?
  - [ ] "Reset All Data": confirmation dialog? Destructive styling?
  - [ ] Delete account: requires typing "DELETE"? Cancel works?
- [ ] Mentor toggle: can disable floating Mentor button?

---

## A8: CROSS-PAGE DATA CONSISTENCY (20 min)

For EACH project, record and verify these match across pages:

| Data Point | Overview | Budget | Financials | Dashboard | Vault |
|---|---|---|---|---|---|
| Budget total | | | | | |
| Amount spent | | | | | |
| Progress % | | | | | |
| Phase name | | | | | |
| Team count | | | | | |

Additional checks:
- [ ] Contingency (Budget page, footer): labeled "budget line item"?
- [ ] Safety Cushion (Financials page): labeled "adjusted"? Different value than raw contingency?
- [ ] Task completion on Overview → progress updates everywhere?
- [ ] Budget edit on Budget page → KPI updates on Overview?
- [ ] Contact add on Team → count updates on Overview KPI?
- [ ] **Togo project: phase labels in English only** (no mixed languages)? (was Bug #13)

---

## A9: RESPONSIVE & MOBILE (15 min)

Test at each breakpoint: 375px (phone), 768px (tablet), 1024px (small desktop), 1440px (desktop)

- [ ] Landing page: no overflow, readable text, stacking correct?
- [ ] Dashboard: project cards stack on mobile?
- [ ] Sidebar: hamburger on mobile? Overlay closes on tap outside?
- [ ] Budget: donut chart stacks above table? No overflow?
- [ ] Schedule: phase cards scroll horizontally?
- [ ] Financials: calculator fields usable on mobile?
- [ ] AI Assistant: chat input not covered by Mentor popup?
- [ ] All modals: visible within viewport? Not cut off?
- [ ] Touch targets: all buttons minimum 44px tap area?

---

## A10: DARK MODE (10 min)

Toggle dark mode and check every page category:
- [ ] Landing page: all sections readable?
- [ ] Dashboard: cards, progress rings, badges?
- [ ] Overview: KPIs, task cards, phase tracker?
- [ ] Budget: donut chart colors, table rows?
- [ ] Schedule: phase cards, milestone items?
- [ ] Financials: calculator, draw schedule?
- [ ] Team: contact cards, modals?
- [ ] Documents: table rows, preview modal?
- [ ] Photos: grid, lightbox?
- [ ] AI Assistant: chat bubbles, input field?
- [ ] Settings: tabs, form fields, buttons?
- [ ] Any unreadable text, missing contrast, invisible borders?
- [ ] Toggle back to light: returns to normal? No flash?

---

## A11: PERFORMANCE & ERROR HANDLING (10 min)

- [ ] Navigate rapidly between 10+ pages: any crashes?
- [ ] Browser back/forward: all pages load correctly?
- [ ] Open same page in 2 tabs: data consistent? No conflicts?
- [ ] Refresh any page: data persists? No errors?
- [ ] Slow network (throttle to 3G): loading states shown? No timeouts?
- [ ] Disconnect network: offline banner? Data still visible? Reconnect syncs?
- [ ] Console errors: check for any JavaScript errors on each page
- [ ] Large data: add 20+ budget items, 10+ contacts — performance OK?

---

## A12: ACCESSIBILITY QUICK CHECK (5 min)

- [ ] Tab through main navigation: visible focus rings?
- [ ] All buttons have text or aria-labels?
- [ ] Color contrast: all text readable (especially muted on cream/dark)?
- [ ] Form inputs all have labels?
- [ ] Error messages: text-based (not just color)?
- [ ] Screen reader: page structure makes sense? Headings in order?
- [ ] Skip-to-content link (if any)?

---

# PART B: BUSINESS & PRODUCT ANALYSIS (Score: /30)

---

## B1: VALUE PROPOSITION CLARITY (10 min)

- [ ] Can a first-time visitor understand what Keystone does in 5 seconds?
- [ ] Is the "zero construction knowledge" target user clearly communicated?
- [ ] Is the dual-market (USA + West Africa) positioning clear?
- [ ] Is the diaspora builder use case prominently featured?
- [ ] Does the pricing make sense for the target market?
  - [ ] $0 starter: enough to experience value?
  - [ ] $19 builder: justified by features?
  - [ ] $49 developer: clear upgrade path?
  - [ ] $149 enterprise: what additional value?
- [ ] Is there a clear "aha moment" in the first 5 minutes of using the app?
- [ ] Does the onboarding tour explain HOW to use the tool, not just what it does?
- [ ] Is the educational content genuinely helpful for a novice?

## B2: USER JOURNEY ANALYSIS (15 min)

Map the complete user journey for each persona and rate the experience:

### Persona 1: First-time US home builder
- [ ] Discovers Keystone → registers → creates project → tracks budget → hires contractors → monitors construction → moves in
- [ ] Pain points in this journey?
- [ ] Where does the user get stuck?
- [ ] Where does the user feel confident?
- [ ] What's missing from this journey?

### Persona 2: Diaspora builder (in US, building in Togo)
- [ ] Discovers Keystone → registers → creates Togo project → manages remotely → tracks payments in CFA → verifies via photos
- [ ] Does the remote monitoring page provide enough visibility?
- [ ] Is the currency handling seamless?
- [ ] Does the contractor link sharing work for remote management?
- [ ] What's missing for this persona?

### Persona 3: Small-scale real estate developer
- [ ] Manages 3-5 projects simultaneously → tracks budgets → compares deals → generates documents
- [ ] Is the multi-project dashboard sufficient?
- [ ] Does the deal analyzer help with investment decisions?
- [ ] Is the reporting/export capability sufficient?
- [ ] What's missing for this persona?

## B3: PRICING ANALYSIS (10 min)

- [ ] Is the free tier generous enough to demonstrate value?
- [ ] What's the key feature that drives upgrade from Starter → Builder?
- [ ] Is there a clear "must-have" feature behind the paywall?
- [ ] Compare pricing with alternatives (Buildertrend: $199/mo, CoConstruct: $99/mo, Procore: enterprise)
- [ ] For West African market: is $19/mo affordable? What about local alternatives?
- [ ] Is annual pricing discount (20%) enough to incentivize commitment?
- [ ] Would a "per project" pricing model work better than subscription?
- [ ] Is there room for a $9/mo tier between Starter and Builder?

## B4: MONETIZATION GAPS

- [ ] What features should be free vs paid?
- [ ] Is AI query limiting (10/day free, 50/day paid) the right balance?
- [ ] Should document generation be a paid feature?
- [ ] Should the deal analyzer be a standalone product?
- [ ] Are there upsell opportunities within the app?
- [ ] Is there a referral program or affiliate structure?
- [ ] Could contractor partnerships generate revenue?

---

# PART C: MARKET RESEARCH & COMPETITIVE ANALYSIS (Score: /15)

---

## C1: COMPETITIVE LANDSCAPE

Rate Keystone vs each competitor on: Features, Price, Ease of Use, Target Market Fit

### US Market Competitors
- [ ] **Buildertrend** ($199-599/mo): How does Keystone compare? What does BT have that Keystone doesn't?
- [ ] **CoConstruct** ($99+/mo): Overlap in owner-builder market?
- [ ] **BuildBook** (free-$199/mo): Similar novice-friendly positioning?
- [ ] **Houzz Pro** ($65-399/mo): Design + project management overlap?
- [ ] **Monday.com / Asana**: Generic PM tools being used for construction?
- [ ] **Spreadsheets**: What % of owner-builders use Excel/Google Sheets?

### West Africa Market Competitors
- [ ] Are there ANY digital construction management tools in Togo/Ghana/Benin?
- [ ] What do diaspora builders currently use? (WhatsApp groups? Spreadsheets? Nothing?)
- [ ] Is there a first-mover advantage in the West Africa market?
- [ ] Local alternatives: any Francophone construction apps?

### Key Differentiators
- [ ] What does Keystone offer that NO competitor offers?
  - [ ] Dual-market intelligence (USA + West Africa)?
  - [ ] Education-first UI for novices?
  - [ ] AI construction advisor?
  - [ ] Diaspora remote monitoring?
  - [ ] Phase-based progressive disclosure?
- [ ] What do competitors offer that Keystone lacks?
  - [ ] Subcontractor bid management?
  - [ ] Material procurement/ordering?
  - [ ] Plan review/markup tools?
  - [ ] Scheduling with Gantt charts?
  - [ ] Integration with accounting software?
  - [ ] Multi-user collaboration?
  - [ ] Mobile-native app?

## C2: MARKET SIZE & OPPORTUNITY

- [ ] US owner-builder market: how many people build their own homes per year?
- [ ] Togo/Ghana/Benin construction market: growth rate? Digital adoption?
- [ ] Diaspora remittance to West Africa: size of market? % used for construction?
- [ ] Total addressable market (TAM)?
- [ ] Serviceable addressable market (SAM)?
- [ ] Realistic first-year target?

## C3: GO-TO-MARKET READINESS

- [ ] Is the landing page optimized for conversion?
- [ ] Is there an email capture for non-registering visitors?
- [ ] Is there a blog or content marketing strategy?
- [ ] Social media presence? (LinkedIn, Twitter, YouTube)
- [ ] Is the app discoverable via search? (Google "construction project management for beginners")
- [ ] Is there a Product Hunt / Launch strategy?
- [ ] Community building: Discord, Facebook group, forum?
- [ ] Partner channel: real estate agents, architects, lenders?

---

# PART D: GAP ANALYSIS & IMPROVEMENT ROADMAP (Score: /15)

---

## D1: MISSING FEATURES (Critical)

- [ ] **Mobile app**: React Native/Expo app for offline photo uploads on construction sites
- [ ] **Offline data**: Local SQLite/WatermelonDB for full CRUD without internet (critical for West Africa)
- [ ] **Multi-user collaboration**: Currently single-user only — contractors, architects, lenders need access
- [ ] **Real notifications**: Push notifications, email digests, SMS alerts for milestone payments
- [ ] **Subcontractor bid management**: RFQ generation, bid comparison, award tracking
- [ ] **Integration with accounting**: QuickBooks, Wave, Xero export

## D2: MISSING FEATURES (Important)

- [ ] **Photo comparison**: Side-by-side before/after views by location
- [ ] **Weather integration**: Automatic weather logging from API (not manual entry)
- [ ] **Material procurement**: Connect to suppliers, track orders, delivery scheduling
- [ ] **Plan markup**: Upload floor plans, annotate with notes/issues
- [ ] **Video walkthrough**: Upload and organize video tours by phase
- [ ] **Gantt chart**: Visual timeline with dependencies (not just phase cards)
- [ ] **Budget forecasting**: Project future spend based on current burn rate
- [ ] **Payment processing**: In-app milestone payments to contractors (Stripe Connect)
- [ ] **Custom inspection templates**: Beyond the built-in market-specific ones
- [ ] **Warranty tracker**: Post-occupancy warranty management and reminders
- [ ] **Property insurance integration**: Connect with insurance providers
- [ ] **Tax document preparation**: Track construction expenses for tax deductions

## D3: MISSING FEATURES (Nice-to-Have)

- [ ] **Community forum**: Connect owner-builders in same market/region
- [ ] **Contractor marketplace**: Find and rate contractors
- [ ] **Material price tracker**: Track lumber, concrete, steel prices over time
- [ ] **AR/VR visualization**: View designs in augmented reality
- [ ] **Voice notes**: Record audio notes on construction site
- [ ] **Automated progress photos**: Integration with site cameras for daily snapshots
- [ ] **Lender portal**: Share project progress with construction loan officers
- [ ] **Energy modeling**: Predict utility costs based on design choices
- [ ] **Resale value estimator**: Project post-completion property value

## D4: TECHNICAL DEBT & CLEANUP

- [ ] Zustand stores created but not wired into all pages (still using Context in many places)
- [ ] TanStack Query hooks created but most pages still use raw Firebase subscriptions
- [ ] React Hook Form schemas created but forms still use manual useState
- [ ] Middleware is API-only — page-level CSP headers not enforced
- [ ] No Playwright e2e tests
- [ ] No Sentry DSN configured (monitoring infrastructure exists but inactive)
- [ ] Service worker caching strategy needs tuning for optimal offline experience
- [ ] `unsafe-eval` in CSP should be removed for production
- [ ] Firebase Security Rules should be audited for admin-only paths
- [ ] No rate limiting per-user on non-AI endpoints

## D5: CONTENT & LOCALIZATION

- [ ] French translation: complete or partial?
- [ ] Ewe (Togo): not started — critical for local market
- [ ] Twi (Ghana): not started
- [ ] Fon (Benin): not started
- [ ] Educational content: reviewed by construction professionals?
- [ ] Cost benchmarks: how current? Quarterly update process?
- [ ] Legal templates: reviewed by lawyers in each market?
- [ ] Construction terminology glossary: comprehensive enough?

## D6: BUSINESS MODEL GAPS

- [ ] No email marketing / drip campaign for onboarding
- [ ] No in-app feedback mechanism (NPS, feature requests)
- [ ] No analytics dashboard for founder (user counts, feature usage, conversion)
- [ ] No A/B testing infrastructure
- [ ] No customer support beyond email
- [ ] No SLA or uptime guarantees for paid tiers
- [ ] No data export for users leaving the platform (data portability)
- [ ] No API for third-party integrations

---

# SCORING RUBRIC

| Category | Weight | Score Range | Your Score |
|---|---|---|---|
| **A: Technical QA** | 40% | 0-40 | /40 |
| A1-A2: Landing + Auth | 8% | 0-8 | |
| A3: Dashboard + Navigation | 6% | 0-6 | |
| A4: Project Wizard | 6% | 0-6 | |
| A5: Project Pages (12 pages) | 10% | 0-10 | |
| A6-A7: Analyzer + Settings | 4% | 0-4 | |
| A8: Cross-page consistency | 3% | 0-3 | |
| A9-A12: Responsive + Dark + Perf + A11y | 3% | 0-3 | |
| **B: Business & Product** | 30% | 0-30 | /30 |
| B1: Value proposition | 8% | 0-8 | |
| B2: User journeys | 10% | 0-10 | |
| B3-B4: Pricing + Monetization | 12% | 0-12 | |
| **C: Market & Competitive** | 15% | 0-15 | /15 |
| C1: Competitive landscape | 8% | 0-8 | |
| C2-C3: Market size + GTM | 7% | 0-7 | |
| **D: Gaps & Roadmap** | 15% | 0-15 | /15 |
| D1-D3: Missing features | 8% | 0-8 | |
| D4-D6: Tech debt + Content + Business | 7% | 0-7 | |
| **TOTAL** | 100% | 0-100 | **/100** |

---

# REPORT TEMPLATE

## For each bug found:
```
**Bug #X: [Short title]**
- Location: [Page / URL]
- Steps: [How to reproduce]
- Expected: [What should happen]
- Actual: [What actually happens]
- Severity: CRITICAL / MAJOR / MINOR
```

## Final deliverables:
1. Bug list sorted by severity
2. Cross-page consistency scorecard (table format)
3. Business analysis with scoring
4. Competitive comparison matrix
5. Gap analysis with prioritized roadmap
6. Overall score: /100 with breakdown by category
7. Top 10 items to fix/build before public launch
8. Top 5 items to fix/build before beta (50 users)
9. 30-60-90 day improvement plan
