# KEYSTONE — COMPREHENSIVE TESTING SCRIPT
## For Web Claude QA Testing

**Duration:** 3-4 hours estimated
**URL:** https://keystonebuild.vercel.app
**Scope:** Full app testing EXCEPT Stripe payments and PDF/CSV exports
**Goal:** Find every bug, data mismatch, UX issue, and dead end

---

## PHASE 1: FRESH USER EXPERIENCE (30 min)

### 1.1 Landing Page Audit
- [ ] Load the landing page. Record: load time, first visual impression, above-the-fold content
- [ ] Check the headline, subheadline, and CTA buttons ("Start your project", "Analyze a deal")
- [ ] Scroll through ALL sections. For each section record: purpose, content quality, any dead links
- [ ] Check the FAQ section — click each accordion item, verify answers make sense
- [ ] Check the pricing section — verify 4 tiers (Starter, Builder, Developer, Enterprise) with correct prices
- [ ] Check the About section — verify founder info, email link works (should open mailto: with real email)
- [ ] Check the footer — verify all links work (Terms, Privacy, email)
- [ ] Click Terms of Service — opens in new tab? Content loads? Email link works?
- [ ] Click Privacy Policy — opens in new tab? Content loads? Email link works?
- [ ] Resize browser to mobile width (375px). Check: nav hamburger works, sections stack properly, no horizontal overflow, pricing cards readable
- [ ] Check the "See it in action" interactive demo:
  - Click each tab (Analyze, Plan, Build, Track, Complete)
  - Does auto-rotation PAUSE when you click a tab?
  - Does each tab show different content?
- [ ] If logged in: does the nav show "Go to Dashboard" instead of "Sign in"?
- [ ] Check mobile nav when logged in — same auth-aware behavior?

### 1.2 Registration Flow
- [ ] Navigate to /register
- [ ] Try submitting the form completely empty — do inline errors appear for EACH field?
- [ ] Enter an invalid email (e.g., "notanemail") — does inline error show "Please enter a valid email address"?
- [ ] Enter a password less than 6 characters — does the strength indicator show "too short" in red?
- [ ] Enter a valid password (8+ chars) — does indicator change to "fair" or "strong"?
- [ ] Check the Terms checkbox — does it stay checked if you trigger a validation error on another field?
- [ ] Click Terms of Service link — does it open in a NEW TAB (not navigate away from the form)?
- [ ] Click Privacy Policy link — same new tab behavior?
- [ ] Go back to the form — is all your entered data still there?
- [ ] Select each market option (USA, Togo, Ghana, Benin, Ivory Coast, Senegal) — all 6 present?
- [ ] Create a test account with: valid name, valid email (use a test email), 8+ char password, USA market, Terms checked
- [ ] Verify: redirect to Dashboard, no errors
- [ ] Record the account email for later use

### 1.3 Login Flow
- [ ] Log out (if possible) and navigate to /login
- [ ] Try logging in with wrong password — error message appears?
- [ ] Try logging in with non-existent email — error message appears?
- [ ] Log in with the correct credentials — redirects to Dashboard?
- [ ] Check "Forgot password" link — navigates to forgot password page?
- [ ] On forgot password page: enter invalid email — inline error?
- [ ] Enter valid email — success message with "Check your email"?
- [ ] Is there a "Back to login" link?

---

## PHASE 2: DASHBOARD & NAVIGATION (20 min)

### 2.1 Dashboard First Load
- [ ] Record what's visible on first load: greeting (time-of-day aware?), date, Getting Started checklist
- [ ] Getting Started checklist: how many items? Which are checked? Do unchecked items have working links?
- [ ] Is the demo project (Robinson Residence) visible?
- [ ] Click into the demo project — does it load? What phase is it in?
- [ ] Go back to Dashboard

### 2.2 Dashboard Elements
- [ ] Verify the greeting matches the time of day (Good morning/afternoon/evening)
- [ ] Check Quick Actions: New Project, Deal Analyzer, Learn, Export Reports — do all links work?
- [ ] "Export Reports" — where does it link? Does the destination make sense?
- [ ] Check notifications bell — click it, do notifications appear? What do they say?
- [ ] Click notification items — do they navigate to the right page?
- [ ] Check the Mentor tip — is it contextual? Does the "Why this matters" expand?
- [ ] Search (Ctrl+K or click search) — does the modal open? Type a search term — results appear?
- [ ] Check the sidebar: Dashboard, Vault, Deal Analyzer, Learn, Settings, New project — all navigate correctly?
- [ ] Collapse the sidebar — does it collapse to icons? Do icons work?
- [ ] Expand the sidebar — back to normal?

### 2.3 Vault Page
- [ ] Navigate to /vault — does it load without errors?
- [ ] Use browser back button — does it crash? (This was a known bug)
- [ ] Check page header — does it say "Vault" (not "Portfolio")?
- [ ] Check filters: All, Active, Paused, Done — do they filter correctly?
- [ ] Check market filters: All, USA, W. Africa — correct filtering?
- [ ] Check sort options: Priority, Recent, Progress — do they reorder?
- [ ] Does the search box work?
- [ ] Does the stat line at top update when filters are applied?

---

## PHASE 3: PROJECT CREATION WIZARD (45 min)

### 3.1 Create a USA "Build to Occupy" Project
- [ ] Click "New project" from Dashboard or sidebar
- [ ] Step 1 (Goal): Select "Build to occupy" — mentor tip appears?
- [ ] Step 2 (Market): Select "United States" — description shows wood-frame construction?
- [ ] Step 3 (Location): Enter ZIP code 77002 (Houston, TX)
  - Does Location Intelligence panel appear?
  - Shows cost index, labor rates, lot prices, climate data?
  - Does the "Next" button enable?
- [ ] Step 4 (Property type): Select "Single-family home"
- [ ] Step 5 (Size):
  - Select a size range (e.g., 1,200-2,000 sqft)
  - Set bedrooms: 4, bathrooms: 3, stories: 2
  - Toggle features: garage, porch — do costs update?
  - Does the construction cost estimate show?
  - Does the mentor tip say "square foot" (not "square meter" for USA)?
- [ ] Step 6 (Land): Select "Still looking" — does it estimate land cost?
  - OR select "Known price" and enter $80,000
- [ ] Step 7 (Financing): Select "Construction loan"
  - Down payment % (try 20%)
  - Interest rate (try 7.5%)
  - Timeline (try 18 months)
- [ ] Step 8 (Financials): Review the cost breakdown
  - Are all categories shown (Land, Construction, Soft costs, Financing, Contingency)?
  - Does the donut chart render without text clipping?
  - Is the total reasonable for the specs entered?
- [ ] Step 9 (Deal Score):
  - What score is shown? (Record it)
  - Are scoring factors visible?
  - Do risk warnings make sense?
- [ ] Step 10 (Name):
  - Is the default name something OTHER than "Robinson Residence"?
  - Enter a custom name: "Houston Family Home"
  - Click "Create project"
  - Does it succeed? Redirect to Overview?
  - Does a welcome banner appear?

### 3.2 Create a Togo "Build to Rent" Project
- [ ] Start a new project
- [ ] Goal: "Build to rent"
- [ ] Market: "Togo" — description mentions reinforced concrete, CFA zone?
- [ ] Location: Enter "Lome"
- [ ] Property type: "Duplex"
- [ ] Size: Select a range, set 3 bed / 2 bath / 1 story
  - Does it say "square meters" (not sqft)?
  - Does the mentor tip say "square meter"?
- [ ] Land: "Estimate for me"
- [ ] Financing: "Phased cash (build as you go)"
  - No down payment or interest rate fields shown?
  - "Family pooling" option available?
- [ ] Financials: Check the breakdown
  - Currency is FCFA?
  - No financing costs for cash?
- [ ] Deal Score: Record the score
- [ ] Name: "Lome Rental Duplex" — create
- [ ] Verify: redirects to Overview, welcome banner shows

### 3.3 Wizard Edge Cases
- [ ] Try navigating backward in the wizard (click Back button) — does data persist?
- [ ] Click step indicator dots at the top — do they navigate? Do completed steps keep their checkmarks?
- [ ] Try clicking Cancel — does a confirmation dialog appear ("Are you sure?")?
- [ ] Refresh the page mid-wizard — is all data lost? (Known limitation)
- [ ] Try creating a project with "Build to sell" goal — does it succeed? (This was the critical bug)

---

## PHASE 4: OVERVIEW PAGE DEEP DIVE (30 min)

### 4.1 KPI Strip Verification
For EACH of your created projects + the demo project:
- [ ] Progress %: does it match the task fraction shown? (e.g., 0% = 0/X tasks)
- [ ] Budget: matches the Budget page total?
- [ ] Spent: matches the Budget page spent?
- [ ] Timeline: shows "Wk X of est. Y wks"?
- [ ] Team: matches the number of contacts on the Team page?
- [ ] Tasks left: shows only incomplete tasks (not punch list items)?
- [ ] Click Budget KPI — navigates to Budget page?
- [ ] Click Timeline KPI — navigates to Schedule page?
- [ ] Click Team KPI — navigates to Team page?

### 4.2 Task Workflow
- [ ] Are tasks grouped under milestones?
- [ ] Are milestone headers visible (e.g., "Goals and purpose defined")?
- [ ] For a new project: are "Review" badges showing on wizard-derived tasks?
- [ ] Click a "Review" task — does the completion form open?
- [ ] Is the evidence pre-filled from wizard data?
- [ ] Can you edit the pre-filled text?
- [ ] Enter a note and click "Complete" — task marks as done?
- [ ] Does the next task auto-expand?
- [ ] Click a completed task — can you see the completion note?
- [ ] Can you click "Reopen" to undo a completion?
- [ ] After reopening: is the previous note still visible in the form?
- [ ] Can you remove individual photos from evidence?
- [ ] Complete ALL tasks in a phase — does the Phase Gate appear?
- [ ] Does it say "Move to [next phase]" with a button?
- [ ] Click "Move to [next phase]" — celebration appears?
- [ ] Celebration shows correct phase names?
- [ ] Click "Get started" — new phase tasks visible?
- [ ] Does the Schedule page now reflect the completed phase?

### 4.3 Review Banner
- [ ] If review items exist: does the review banner show at top?
- [ ] Click a review item button — does it scroll to AND open that task?
- [ ] After completing all review items — does the banner disappear?

### 4.4 Optional Cost Tracking
- [ ] When completing a task: is the optional "Cost" field visible?
- [ ] Enter a cost amount and complete the task
- [ ] Does the toast show the amount logged?
- [ ] Check the Budget page — did totalSpent increase?
- [ ] Check the Overview KPI — did "Spent" update?

### 4.5 Welcome Banner
- [ ] On a newly created project: welcome banner visible?
- [ ] Does it have links to Budget, Timeline, Documents?
- [ ] Can you dismiss it with the X button?
- [ ] Does it NOT reappear after dismissal?

### 4.6 Right Sidebar
- [ ] Budget widget: shows correct spent/total?
- [ ] Deal Score: shows the wizard's deal score?
- [ ] Recent Activity: shows task completions, daily logs, photos?
- [ ] Insights: are they relevant to the project state?
- [ ] Quick links: Budget, Schedule, Team, Financials, Documents, Photos, Daily Log, Inspections — all 8 present? All navigate correctly?

---

## PHASE 5: BUDGET PAGE (15 min)

### 5.1 Layout & Data
- [ ] Donut chart visible and not clipping text?
- [ ] Donut center text readable (compact format, not overflow)?
- [ ] KPIs next to donut: Budget, Spent, Remaining, Utilization — correct values?
- [ ] AI insight present? Relevant?
- [ ] Category table visible with columns: Category, Estimated, Actual, Variance, Progress?
- [ ] Each row has a colored dot matching the donut slice?
- [ ] Sort by each column header — does it work?
- [ ] Click "Show ranges" — market benchmark ranges appear?

### 5.2 Budget Editing
- [ ] Click "+ Add" button — add item form appears?
- [ ] Add a new category with an estimated amount — saves?
- [ ] Click an existing category to expand — edit form visible?
- [ ] Change the estimated amount — saves on blur/button?
- [ ] Change the actual amount — variance updates?
- [ ] Delete a category — confirmation? Item removed?

### 5.3 Sticky Footer
- [ ] Scroll down — footer bar stays visible?
- [ ] Shows: Budget, Spent, Left, Contingency (budget line item)?
- [ ] Values match the top KPI strip?

### 5.4 Mobile Responsiveness
- [ ] Resize to mobile width — donut stacks above KPIs? No overflow?

---

## PHASE 6: SCHEDULE PAGE (15 min)

### 6.1 Phase Cards
- [ ] Horizontal scrollable row of phase cards visible?
- [ ] Current phase highlighted/expanded?
- [ ] Each card shows: phase name, duration range, milestone count?
- [ ] Click a different phase — expands with milestone list?
- [ ] Milestone checkboxes — are they interactive?
- [ ] Check a milestone on Schedule — does the Overview task status change to "pending-review"?
- [ ] Uncheck a milestone — do tasks reopen on Overview?
- [ ] Complete all Overview tasks for a milestone — does the Schedule milestone auto-check?

### 6.2 Milestone Detail
- [ ] Milestone Timeline visualization renders?
- [ ] "Set date" button on milestones — date picker appears?
- [ ] "Add to Calendar" button — does it generate an ICS file?

### 6.3 Cross-Page Consistency
- [ ] Week number matches Overview KPI?
- [ ] Phase highlighted matches Overview phase badge?

---

## PHASE 7: FINANCIALS PAGE (15 min)

### 7.1 Layout
- [ ] KPI strip: Budget, Spent, Remaining, Safety cushion (adjusted)?
- [ ] "Safety cushion" label (NOT just "Contingency")?
- [ ] Contingency analysis: base rate, adjusted rate, reserve amount?
- [ ] Adjustment factors listed with +/- percentages?
- [ ] "Show formula" link — expands with formula text?

### 7.2 USA Project — Loan Calculator
- [ ] Income and debts fields are EMPTY (not hardcoded)?
- [ ] Down payment % pre-filled from wizard data?
- [ ] Interest rate pre-filled from wizard data (or live rate)?
- [ ] "Live: X%" hint shown under interest rate?
- [ ] Enter income/debts, click Calculate
- [ ] Results: DTI ratio, Max loan, Monthly PITI, Status (Qualified/Not)?
- [ ] DTI has tooltip explaining "Debt-to-Income ratio"?
- [ ] Draw schedule visible with milestone payments?
- [ ] Draw schedule percentages sum to ~100%?

### 7.3 Togo Project — Phased Funding
- [ ] "Phased funding" section visible (not loan calculator)?
- [ ] Progress bars for each construction phase?
- [ ] Can enter funded amounts per phase?
- [ ] Save/Cancel buttons appear when editing?
- [ ] Currency converter visible?
- [ ] Enter a USD amount, click Convert — shows FCFA result?
- [ ] Live/Approx rate badge shown?
- [ ] Refresh rate button works?

### 7.4 Rental Project — Yield Calculator
- [ ] Monthly rent field pre-filled from wizard if "build to rent"?
- [ ] Enter rent, vacancy %, expenses %
- [ ] Calculate: cap rate, net yield, monthly cash flow, break-even?
- [ ] Cash flow color: green if positive, red if negative?

---

## PHASE 8: TEAM PAGE (15 min)

### 8.1 Add Contacts
- [ ] Click "Add contact" — modal opens?
- [ ] Fill: Name, Role, Phone — save successfully?
- [ ] Fill: Name, Role (leave email/WhatsApp empty) — save without error? (This was a critical bug)
- [ ] Contact card appears with correct info?
- [ ] Edit a contact — modal pre-filled? Save works?
- [ ] Delete a contact — confirmation? Removed?
- [ ] Star rating: click stars — rating updates?

### 8.2 Trades Needed Tab
- [ ] Shows required trades for the current phase?
- [ ] Matched trades show the contact name?
- [ ] Unmatched trades show "Add" button?

### 8.3 Performance Tab
- [ ] Shows contacts in a table?
- [ ] Ratings displayed?
- [ ] Note about "Performance data populates as tasks are assigned"?

---

## PHASE 9: DOCUMENTS PAGE (15 min)

### 9.1 Two-Tab Layout
- [ ] "My Documents" tab active by default?
- [ ] "Templates" tab clickable?
- [ ] Tab count badges accurate?

### 9.2 Templates
- [ ] Switch to Templates tab
- [ ] Phase filter pills visible? Click different phases?
- [ ] Template cards show: name, description, type badge, phase badge?
- [ ] "Generate" button on templates — does it open a form/preview?
- [ ] Required templates marked differently?

### 9.3 Upload
- [ ] "Upload document" button visible and prominent?
- [ ] Click upload — file picker opens?
- [ ] Upload form: type dropdown, phase dropdown, contractor link dropdown?
- [ ] After upload: document appears in My Documents list?

### 9.4 Missing Documents Alert
- [ ] If current phase requires documents not uploaded: warning banner at top?

---

## PHASE 10: PHOTOS PAGE (10 min)

### 10.1 Upload
- [ ] Drag-and-drop upload zone visible?
- [ ] Click zone — file picker opens?
- [ ] Select photo: preview shown? Phase auto-selected?
- [ ] Upload completes? Photo appears in grid?

### 10.2 Grid & Filtering
- [ ] Photo grid: 4 columns on desktop?
- [ ] Phase badge on each photo?
- [ ] Filter pills: All, By Phase, By Milestone, By Date?
- [ ] Click a phase filter — grid filters?

### 10.3 Lightbox
- [ ] Click a photo — lightbox opens?
- [ ] Metadata sidebar: date, phase, GPS coords, caption?
- [ ] Previous/Next navigation arrows?
- [ ] Edit caption works?
- [ ] Delete photo works?
- [ ] Close lightbox — back to grid?
- [ ] Keyboard navigation (arrow keys)?

---

## PHASE 11: DAILY LOG PAGE (10 min)

### 11.1 Stats Strip
- [ ] Total entries, This week, Avg crew, Since last entry?
- [ ] "Since last entry" shows "N/A" when no entries (not "Today")?

### 11.2 Week Strip
- [ ] Mon-Sun calendar strip visible?
- [ ] Navigate weeks with < > arrows?
- [ ] Days with entries have filled dots?
- [ ] Click a day — filters the list?
- [ ] "Today" button returns to current week?

### 11.3 Add Entry
- [ ] Add entry form: weather presets, temperature, crew size?
- [ ] Temperature unit: F for USA, C for Togo?
- [ ] Quick tags visible?
- [ ] Save entry — appears in list?
- [ ] Entry shows: day number, date, weather, crew, content preview?

### 11.4 Entry Interaction
- [ ] Click entry — expands with full content?
- [ ] Edit button — opens edit form?
- [ ] Delete button — confirmation? Entry removed?
- [ ] Photo count shown if photos exist for that date?

---

## PHASE 12: INSPECTIONS PAGE (10 min)

### 12.1 Layout
- [ ] Stats strip: Passed, Failed, Pending, Total?
- [ ] Phase tabs with inspection counts?
- [ ] Current phase pre-selected?
- [ ] Formal/Informal legend visible?

### 12.2 Inspection Actions
- [ ] Click "Record result" — inline panel opens?
- [ ] Pass/Fail/Conditional radio buttons?
- [ ] Inspector name, date, notes fields?
- [ ] Save result — status updates?

### 12.3 Custom Inspections
- [ ] "+ Add inspection" button at bottom?
- [ ] Add form: name, type (formal/informal), phase?
- [ ] Save — inspection appears in list?
- [ ] Refresh page — custom inspection PERSISTS? (Was a critical bug)

---

## PHASE 13: PUNCH LIST PAGE (10 min)

### 13.1 Empty State
- [ ] Beginner-friendly text (not jargon)?
- [ ] "Add item" button visible?

### 13.2 Add Items
- [ ] Click "Add item" — form appears?
- [ ] Fields: description, trade, severity, notes?
- [ ] Save — item appears in list?
- [ ] Status filters: Open, In Progress, Resolved?
- [ ] Severity filters: Critical, Major, Minor?
- [ ] Change item status — updates?

### 13.3 Page Header
- [ ] Subtitle: "Items to fix or complete before final handoff"?

---

## PHASE 14: MONITOR PAGE (15 min)

### 14.1 Live Camera
- [ ] "Live site cameras" section visible?
- [ ] Empty state with "Connect a camera" button?
- [ ] Click setup — form appears?
- [ ] Add a camera with any URL — saves?
- [ ] Camera feed displays (or placeholder)?
- [ ] Remove camera — confirmation? Removed?

### 14.2 Photo Evidence Feed
- [ ] Shows project photos?
- [ ] Date filters: All, 7d, 30d?
- [ ] "Request photo update" button?

### 14.3 Milestone Payment Tracker
- [ ] Shows milestones with payment amounts?
- [ ] Progress bar: Verified % vs Remaining %?

### 14.4 Weekly Summary
- [ ] 6 KPIs: activity days, crew-days, photos, spent, progress, open items?
- [ ] Values match other pages?

### 14.5 Activity Log
- [ ] Merged timeline of daily logs + photos?
- [ ] Sorted by date descending?

### 14.6 Material Tracker
- [ ] "Add material" button?
- [ ] Form: name, qty ordered, qty delivered, unit price, supplier, status?
- [ ] Discrepancy alerts when delivered < ordered?

---

## PHASE 15: AI ASSISTANT (10 min)

### 15.1 Chat Interface
- [ ] 5 topic tabs: General, Budget, Schedule, Risk, Contract?
- [ ] Each tab has different placeholder text?
- [ ] Send a message — response appears?
- [ ] Markdown renders correctly (headings, bold, lists)?
- [ ] Response includes construction-specific advice?

### 15.2 Per-Tab Conversations
- [ ] Send a message in "Budget" tab
- [ ] Switch to "Schedule" tab — different conversation?
- [ ] Switch back to "Budget" — original message still there?
- [ ] Tab badges show message counts?

### 15.3 Query Counter
- [ ] AI query counter visible on Mentor button? (e.g., "3/10")
- [ ] Counter increments after sending a message?

---

## PHASE 16: SETTINGS PAGE (10 min)

### 16.1 Profile Tab
- [ ] Name, timezone, currency, language fields?
- [ ] Change name — save — toast appears?
- [ ] Change timezone — saves?

### 16.2 Plan Tab
- [ ] Current plan shown (Starter)?
- [ ] 4 tier cards with correct pricing?
- [ ] Trial code input field?
- [ ] Enter a trial code — feedback shown? (Error if invalid, success if valid)

### 16.3 Notifications Tab
- [ ] Toggle switches for different notification types?
- [ ] Toggles persist after page refresh?

### 16.4 Data Tab
- [ ] Export data option?
- [ ] Reset demo data option?
- [ ] Delete account:
  - Click delete — confirmation appears?
  - Type "DELETE" — delete button enables?
  - No password field required?
  - Cancel — closes confirmation?

### 16.5 Keystone Mentor Toggle
- [ ] Is there a setting to disable the floating Mentor button?

---

## PHASE 17: DEAL ANALYZER (15 min)

### 17.1 Analyze Mode
- [ ] Select a goal (Build to sell)
- [ ] Select a market (USA)
- [ ] Enter ZIP code — location intelligence loads?
- [ ] Select property type and size
- [ ] Configure features
- [ ] Set financing
- [ ] Results update in real-time?
- [ ] Deal score visible?
- [ ] Cost breakdown chart?
- [ ] Sensitivity analysis?
- [ ] "Create Project" button — creates a project from analysis?

### 17.2 What Can I Afford Mode
- [ ] Switch to "What Can I Afford?" tab
- [ ] Enter a budget amount
- [ ] Select market
- [ ] Results show what you can build?

### 17.3 Timeline Selection
- [ ] Change timeline (6mo, 9mo, 12mo, etc.)
- [ ] Does the analysis update?
- [ ] Does "+6 months" sensitivity row show a non-zero cost impact?

---

## PHASE 18: CROSS-PAGE DATA CONSISTENCY (30 min)

### 18.1 Budget/Spent Consistency
For EACH project, record and compare:
- [ ] Overview Budget KPI
- [ ] Budget page total
- [ ] Financials page budget
- [ ] Dashboard card budget
- [ ] Vault card budget
All should match exactly.

### 18.2 Progress Consistency
For EACH project, record and compare:
- [ ] Overview Progress %
- [ ] Overview task fraction (X/Y)
- [ ] Dashboard progress ring %
- [ ] Vault card progress ring %
- [ ] Verify: Progress % = completed tasks / total tasks

### 18.3 Phase Consistency
For EACH project:
- [ ] Overview phase badge
- [ ] Schedule highlighted phase
- [ ] Dashboard card phase badge
- [ ] Vault card phase badge
All should show the same phase.

### 18.4 Task-Milestone Sync
- [ ] Complete a task on Overview
- [ ] Check Schedule — milestone auto-checked if all tasks for it are done?
- [ ] Check a milestone on Schedule
- [ ] Check Overview — tasks show "Review" badge?
- [ ] Uncheck milestone on Schedule
- [ ] Check Overview — tasks reopened?

### 18.5 Contingency Differentiation
- [ ] Budget page footer: says "Contingency (budget line item)"?
- [ ] Financials page: says "Safety cushion (adjusted)"?
- [ ] Values are DIFFERENT (adjusted vs raw)?
- [ ] Both are clearly labeled so user knows which is which?

### 18.6 Open Items / Tasks Left
- [ ] Overview "Tasks left" KPI — shows only incomplete tasks (no punch list items mixed in)?
- [ ] Does NOT link to punch list (it stays on overview)?
- [ ] Dashboard "Needs Your Attention" — shows "Task:" prefix with checkbox icon?

---

## PHASE 19: LANGUAGE & LOCALIZATION (15 min)

### 19.1 English User + Togo Project
- [ ] User language set to English in Settings
- [ ] Navigate to the Togo project
- [ ] Sidebar labels: are they in ENGLISH (not French)?
- [ ] Section headers (PLANNING, EXECUTION, etc.): English?
- [ ] Page titles: English?
- [ ] Construction terms: use Togo-specific terms (poteau-poutre, titre foncier) with English explanations?
- [ ] Currency: shows FCFA correctly?
- [ ] Temperature in Daily Log: Celsius?
- [ ] Size units in wizard: square meters?

### 19.2 Naming Consistency
- [ ] Sidebar says "Vault" (not "Portfolio")?
- [ ] Dashboard card says "My Vault"?
- [ ] Vault page header says "Vault"?
- [ ] URL is /vault/?
- [ ] All 4 match?

---

## PHASE 20: DARK MODE (5 min)

- [ ] Toggle dark mode (look for theme toggle in header or settings)
- [ ] Check each page category: does dark mode render correctly?
  - [ ] Dashboard
  - [ ] Overview
  - [ ] Budget (donut chart)
  - [ ] Schedule
  - [ ] Financials
  - [ ] Team
  - [ ] Documents
  - [ ] Photos
  - [ ] AI Assistant
  - [ ] Settings
- [ ] Any unreadable text or missing contrast?
- [ ] Toggle back to light mode — returns to normal?

---

## PHASE 21: EDGE CASES & ERROR HANDLING (15 min)

### 21.1 Empty States
- [ ] Team page with 0 contacts — helpful empty state?
- [ ] Photos with 0 photos — upload prompt?
- [ ] Daily Log with 0 entries — "Since last entry: N/A"?
- [ ] Punch List with 0 items — beginner-friendly text?
- [ ] Inspections with 0 results — meaningful empty state?

### 21.2 Navigation Resilience
- [ ] Navigate rapidly between pages — any crashes?
- [ ] Use browser back/forward buttons — pages load correctly?
- [ ] Open the same page in two tabs — data consistent?
- [ ] Refresh any page — data persists?

### 21.3 Demo Project Integrity
- [ ] Robinson Residence: is it clearly marked as [Demo]?
- [ ] Does it have realistic data across ALL pages?
- [ ] Budget: 16+ categories with estimated amounts?
- [ ] Schedule: milestones across phases?
- [ ] Team: 6 contractors?
- [ ] Daily Log: 3 entries?
- [ ] Photos: at least 1?
- [ ] Can demo data be reset from Settings > Data tab?

### 21.4 Multi-Project Dashboard
- [ ] With 3+ projects: Dashboard shows all active projects?
- [ ] Projects from different markets show correct currencies?
- [ ] W. Africa filter in Vault isolates only WA projects?
- [ ] USA filter shows only USA projects?

---

## PHASE 22: ACCESSIBILITY QUICK CHECK (5 min)

- [ ] Tab through the main navigation — visible focus rings?
- [ ] All buttons have visible text or aria-labels?
- [ ] Color contrast: can you read all text? (especially muted text on cream backgrounds)
- [ ] All form inputs have labels?
- [ ] Error messages are announced (not just color-coded)?

---

## REPORTING FORMAT

For each issue found, record:

```
**Bug #X: [Short title]**
- Location: [Page / URL]
- Steps: [How to reproduce]
- Expected: [What should happen]
- Actual: [What actually happens]
- Severity: CRITICAL / MAJOR / MINOR
- Screenshot: [If applicable]
```

At the end, provide:
1. Summary table of all issues by severity
2. Cross-page consistency scorecard (matching the format in previous audits)
3. Overall assessment: is the app ready for 50 beta users?
4. Top 5 must-fix items before launch
