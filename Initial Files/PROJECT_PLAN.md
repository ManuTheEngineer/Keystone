# KEYSTONE
## The Complete Construction Project Lifecycle Platform
### From First Idea to Final Key — One System, Two Continents

---

## EXECUTIVE SUMMARY

**Keystone** is a full-lifecycle construction project management platform designed for first-time owner-builders, diaspora investors, and small-scale real estate developers operating in the **United States** and **West Africa** (Togo, Ghana, Benin, and expandable to the broader region). It is the single application a user needs from the moment they conceive of building a home to the moment they hand over the keys, collect their first rent check, or close the sale.

No existing product serves this user. Buildertrend ($499-$1,099/month) targets professional US contractors. Procore targets commercial construction firms. Build Africa (Nigeria) handles material price discovery but not project management. AlphaBridge (Kenya) is a diaspora construction *service*, not software. Addakus (Ghana) is a construction *company*, not a platform. The owner-builder who knows nothing about construction, needs education at every step, operates across two fundamentally different markets, and needs to manage a project remotely from another continent — that person has no tool.

**Keystone is that tool.**

---

## COMPETITIVE LANDSCAPE ANALYSIS

### What Exists Today

| Product | Market | User | Pricing | Gap |
|---------|--------|------|---------|-----|
| **Buildertrend** | USA only | Professional contractors | $499-$1,099/mo | Not for novices; no education; no W. Africa; assumes construction expertise |
| **Procore** | USA/Global commercial | Enterprise GCs | Custom enterprise | Massive overkill for residential; no owner-builder flow |
| **JobTread** | USA | Home builders | ~$149/mo | Professional-focused; no guided education; USA only |
| **Contractor Foreman** | USA | Small contractors | $49/mo+ | Budget tool; no novice guidance; USA only |
| **Build Africa** | Nigeria | Builders/investors | Free/freemium | Material pricing only; no project management; no lifecycle |
| **AlphaBridge** | Kenya | Diaspora investors | Service fees | A service company, not software; Kenya only |
| **Addakus** | Ghana | Diaspora investors | Project-based | Construction company with client portal, not a platform |
| **Monday.com** | Global | Any industry | $8-$16/seat/mo | Generic; no construction intelligence; no education |

### The Gap Keystone Fills

No existing product combines:
- **Novice education** embedded in every workflow step
- **Dual-market intelligence** (US building codes + West African construction practices)
- **Full lifecycle management** (idea → land → design → permits → construction → occupancy → rental/sale)
- **Diaspora remote monitoring** (photo verification, milestone-based payment release, contractor management)
- **AI-powered guidance** (budget estimation, schedule generation, risk flagging, document drafting)
- **Regulatory compliance** for both US and West African jurisdictions
- **Financial modeling** (loan qualification, rental yield projection, currency hedging for cross-border builds)
- **Document generation** (contracts, bid requests, punch lists, inspection checklists, legal forms)

---

## TARGET USERS

### Primary Personas

**1. The American Owner-Builder**
- Age 28-55, first-time builder in the USA
- Has equity or savings, wants to save the 15-25% GC markup
- Zero construction knowledge; needs education at every step
- Needs loan qualification help, contractor discovery, and inspection scheduling

**2. The Diaspora Developer**
- Born in West Africa, living in USA/Canada/Europe
- Wants to build rental property, family home, or spec home in Togo/Ghana/Benin
- Cannot be on-site; needs remote monitoring and milestone payment controls
- Deals with currency conversion, time zones, and trust gaps with local contractors
- Needs land verification guidance and legal compliance support

**3. The Local West African Builder**
- Lives in Lomé, Accra, or Cotonou
- Building incrementally with cash as funds become available
- Needs budget tracking, material price monitoring, and quality checklists
- May have limited smartphone data; needs offline-first capability

**4. The Small-Scale Developer**
- Building 2-10 units per year in either market
- Needs portfolio management across multiple simultaneous projects
- Needs financial modeling for investment returns and cash flow projection
- Wants to scale from owner-builder to small developer

---

## PRODUCT ARCHITECTURE

### System Overview

```
KEYSTONE PLATFORM
├── PROJECT ENGINE (Core)
│   ├── Project Creation Wizard
│   ├── Phase State Machine (8 phases, 40+ milestones)
│   ├── Task Dependency Graph
│   └── Multi-Project Portfolio Dashboard
│
├── KNOWLEDGE BASE (Education Layer)
│   ├── Construction Encyclopedia (500+ terms, both markets)
│   ├── Step-by-Step Guided Workflows
│   ├── Contextual Learning Cards (appear at each phase)
│   ├── Video/Photo Reference Library
│   └── Regional Construction Method Guides (wood-frame vs. poteau-poutre)
│
├── FINANCIAL ENGINE
│   ├── Loan Qualification Calculator (DTI, LTC, monthly payment)
│   ├── Budget Builder (line-item with regional cost benchmarks)
│   ├── Bid Comparison Matrix
│   ├── Draw Schedule Manager
│   ├── Real-Time Budget vs. Actual Tracker
│   ├── Currency Converter with Rate Alerts (XOF/GHS/USD/EUR)
│   ├── ROI / Cap Rate / Cash Flow Projector
│   └── Expense Receipt Capture (OCR from photos)
│
├── PEOPLE ENGINE (CRM)
│   ├── Contractor Directory (by trade, by region, by rating)
│   ├── Contractor Evaluation Scorecards
│   ├── Supplier Directory with Price Tracking
│   ├── Architect/Engineer Directory
│   ├── Lawyer/Notaire Directory
│   ├── Realtor/Land Agent Directory
│   ├── Inspector/Surveyor Directory
│   └── Contact Communication Log (calls, messages, emails)
│
├── DOCUMENT ENGINE
│   ├── Contract Generator (13+ templates by type and jurisdiction)
│   ├── Bid Request Generator
│   ├── Change Order Forms
│   ├── Lien Waiver Generator
│   ├── Punch List Generator
│   ├── Inspection Checklists (by phase, by market)
│   ├── Payment Receipt Generator
│   ├── Budget Export (PDF/Excel/CSV)
│   ├── Progress Report Generator (for banks/lenders)
│   └── Custom Document Templates
│
├── CONSTRUCTION TRACKER
│   ├── Phase Progress Visualization (0-100% per phase)
│   ├── Daily Log (text + photos + weather + crew)
│   ├── Photo Documentation (geotagged, timestamped, phase-tagged)
│   ├── Milestone Verification Workflow
│   ├── Inspection Scheduling & Results Tracker
│   ├── Material Delivery Tracker
│   ├── Weather Integration (rain delay planning)
│   └── Punch List Manager with Photo Evidence
│
├── AI ENGINE
│   ├── Project Setup Assistant (interview-style project definition)
│   ├── Budget Estimator (from plan dimensions + location)
│   ├── Schedule Generator (auto-sequence trades with dependencies)
│   ├── Risk Analyzer (flags common issues at each phase)
│   ├── Contract Reviewer (AI analysis of contractor agreements)
│   ├── Natural Language Q&A ("What rebar size for a 3m column span?")
│   ├── Photo Analysis (progress verification from site photos)
│   ├── Cost Overrun Predictor (ML on budget trajectory)
│   └── Market Comparable Finder (rental/sale price estimation)
│
├── COMMUNICATION HUB
│   ├── In-App Messaging (by project, by contact)
│   ├── WhatsApp Integration (critical for West Africa)
│   ├── Email Integration
│   ├── SMS Notifications
│   ├── Push Notifications (milestone alerts, payment due, inspection due)
│   └── Shared Project View (give contractor/bank/family read access)
│
└── DATA LAYER
    ├── Import: CSV, Excel, PDF plans, photos, bank statements
    ├── Export: PDF reports, Excel budgets, CSV data, JSON API
    ├── Offline Mode (full CRUD, sync on reconnect)
    ├── Cloud Backup (encrypted, multi-region)
    ├── Multi-Language (English, French, Ewe, Twi, Fon)
    └── API for third-party integrations
```

---

## THE 8 PROJECT PHASES — Detailed Breakdown

Every Keystone project moves through 8 sequential phases. Each phase contains milestones, tasks, educational content, documents, financial checkpoints, and quality gates. A project cannot advance to the next phase until the quality gate is satisfied.

### PHASE 0: DEFINE
**Purpose:** Establish what you are building, why, and whether it is financially viable.

| Component | Detail |
|-----------|--------|
| **Tasks** | Select build purpose (occupy/rent/sell), choose market (USA/Togo/Ghana/Benin), define property type (SFH/duplex/apartment), set preliminary size range, research comparable properties |
| **AI Assist** | Interview-style wizard asks 25+ questions to define the project scope; generates a Project Brief document |
| **Education** | Interactive modules on: build-to-rent vs. build-to-sell economics, tax implications by strategy, market analysis methods, zoning basics |
| **Financial** | Preliminary feasibility calculator: "Can I afford this?" using income, savings, and target location |
| **Documents** | Project Brief (auto-generated), Market Research Summary, Feasibility Report |
| **Quality Gate** | User has confirmed: purpose, market, property type, preliminary budget range, and financing approach |

### PHASE 1: FINANCE
**Purpose:** Secure funding or confirm cash availability. Establish a detailed budget.

| Component | Detail |
|-----------|--------|
| **Tasks** | (USA) Calculate DTI, research loan types, apply for pre-approval, receive pre-approval letter. (WA) Confirm available cash, establish funding tranches, set up transfer mechanism (Wave/Wise/bank), open local currency account if needed |
| **AI Assist** | Loan qualification calculator; auto-fills pre-approval application data; generates budget template populated with regional cost benchmarks |
| **Education** | Deep modules on: construction loan types (C2P, FHA, VA, hard money, commercial), draw schedules, interest-only payments during construction, West African self-funding strategies, phased building economics, currency hedging for diaspora |
| **Financial** | Full budget builder with 60+ line items, contingency calculator, monthly payment projector, break-even analysis for rental properties |
| **Documents** | Pre-Approval Checklist, Income Documentation Checklist, Budget Spreadsheet (exportable), Funding Plan for phased builds |
| **Quality Gate** | Financing confirmed (pre-approval letter uploaded or cash verification) AND detailed budget completed with contingency |

### PHASE 2: LAND
**Purpose:** Find, verify, and acquire the building site.

| Component | Detail |
|-----------|--------|
| **Tasks** | (USA) Hire realtor, search MLS/Zillow/LandWatch, tour properties, run due diligence (10-point checklist), make offer, close. (WA) Engage lawyer/notaire, search via agents/platforms, physical site visit, government registry verification (DCCFE/Lands Commission/ANDF), surveyor confirmation, negotiate, notarize, register title |
| **AI Assist** | Due diligence checklist auto-adapts to jurisdiction; risk scorer flags issues (flood zone, easements, disputed title history); land cost comparator against market benchmarks |
| **Education** | Modules on: title insurance, boundary surveys, zoning verification, soil testing, utility access assessment, West African land tenure systems (customary vs. statutory), titre foncier process, double-selling scam prevention, elder consent requirements |
| **Financial** | Land purchase cost tracker, closing cost estimator, utility extension cost calculator |
| **Documents** | Offer Letter Template, Due Diligence Checklist (interactive), Land Purchase Agreement Template, Title Search Request Form, Survey Request Form |
| **Quality Gate** | Land acquired AND title/ownership documented AND survey completed AND zoning confirmed for intended use |

### PHASE 3: DESIGN
**Purpose:** Create complete building plans with an architect and engineer.

| Component | Detail |
|-----------|--------|
| **Tasks** | Find and hire architect, define style and requirements, review floor plans, review elevations, review site plan, review structural plans, review MEP plans, approve final plan set, obtain engineer stamp |
| **AI Assist** | Room size advisor (suggests dimensions based on use), plan review checklist generator, architect brief generator (from Phase 0 project definition), climate-responsive design recommendations by location |
| **Education** | Modules on: reading floor plans, understanding elevations, site plan requirements, structural plan basics, electrical plan symbols, plumbing plan conventions, West African design for tropical climate (cross-ventilation, overhang, high ceilings, mosquito protection) |
| **Financial** | Architect fee tracker, plan revision cost tracker, structural engineering fee tracker |
| **Documents** | Architect Brief (auto-generated from project definition), Design Requirements Checklist, Plan Review Checklist, Material Spec Sheet Template |
| **Quality Gate** | Complete plan set received AND reviewed against checklist AND structural engineering complete AND plans stored in document vault |

### PHASE 4: APPROVE
**Purpose:** Obtain all government permits and HOA/ACC approvals.

| Component | Detail |
|-----------|--------|
| **Tasks** | (USA) Submit to building department, pay permit fees, pay impact fees, obtain utility permits, obtain HOA approval if applicable. (WA) Submit through registered architect to Direction de l'Urbanisme (Togo) / District Assembly (Ghana) / Mairie (Benin), pay permit fees, track approval status |
| **AI Assist** | Permit requirement checker by jurisdiction, fee estimator, document checklist generator, timeline predictor based on jurisdiction |
| **Education** | Modules on: permit types and costs, inspection schedule triggered by permits, HOA/ACC approval process, West African permit requirements by country, consequences of building without permits |
| **Financial** | Permit and impact fee tracker, updated budget reconciliation |
| **Documents** | Permit Application Checklist (by jurisdiction), HOA Submission Package Template, Fee Payment Receipts |
| **Quality Gate** | Building permit obtained AND all required approvals documented AND inspection schedule established |

### PHASE 5: ASSEMBLE
**Purpose:** Find, evaluate, select, and contract all subcontractors and material suppliers.

| Component | Detail |
|-----------|--------|
| **Tasks** | Identify 3-5 candidates per trade (12-15 trades), request bids from all, organize bids in comparison matrix, check references/licenses/insurance, select winners, execute contracts, confirm material suppliers, lock material pricing where possible |
| **AI Assist** | Bid request email generator (customized per trade), bid comparison analyzer (flags outliers, missing scope items, unusual payment terms), contract clause reviewer, trade sequencing advisor |
| **Education** | Modules on: the 12-15 trades and what each does, how to read a bid, red flags in contractor proposals, what to include in a contract, payment schedules that protect you, lien waiver requirements, West African contractor evaluation (visiting past projects, testing completed work) |
| **Financial** | Bid comparison matrix (auto-populated from bid uploads), final build budget (populated from accepted bids — should be 95-98% accurate), payment schedule builder |
| **Documents** | Bid Request Template (by trade), Contractor Agreement Template (USA and WA versions), Subcontractor Evaluation Scorecard, Material Supply Agreement Template, Lien Waiver Templates |
| **Quality Gate** | All trades have accepted contracts AND all material suppliers confirmed AND final build budget complete AND budget reconciled against financing |

### PHASE 6: BUILD
**Purpose:** Execute the physical construction from site prep to final finishes.

This is the longest and most complex phase. It contains **7 sub-phases** (USA) or **5 sub-phases** (West Africa), each with their own milestones, inspection requirements, and payment triggers.

**USA Sub-Phases:**
1. Site Preparation (clearing, grading, erosion control, temp utilities)
2. Foundation (survey, excavation, plumbing underground, rebar, pour, cure)
3. Framing (walls, floors, roof structure, sheathing)
4. Exterior Envelope (house wrap, siding, windows, doors, roofing)
5. Mechanical Rough-In (HVAC, plumbing, electrical — in that order)
6. Interior Finishes (insulation, drywall, flooring, cabinets, paint, trim, fixture install)
7. Exterior Finishes (flatwork, fencing, landscaping, permanent utility connection)

**West Africa Sub-Phases:**
1. Site Clearing and Foundation (clearing, trenches, rebar, pour, cure, DPC)
2. Structure (columns, block walls, lintels, ring beams, floor slabs if multi-story)
3. Roofing (trusses, metal sheets, ceiling, gutters)
4. Systems and Plastering (plumbing to septic, electrical in conduit, plastering, windows/grilles)
5. Finishes and Compound (screed, tiles, paint, fixtures, compound wall, gate, landscaping)

| Component | Detail |
|-----------|--------|
| **Tasks** | 100+ individual tasks auto-generated from plan set and selected trades, organized by sub-phase with dependencies |
| **AI Assist** | Schedule generator (Gantt chart from trade timelines), weather-aware scheduling (integrates local forecast data), daily log assistant (voice-to-text for field notes), photo analysis for progress verification, budget burn rate tracker with overrun warnings |
| **Education** | Contextual cards at each sub-phase: "What is happening now," "What to inspect," "Common mistakes at this stage," "Questions to ask your contractor" |
| **Financial** | Draw request generator (for bank), payment authorization workflow (milestone verified before payment released), real-time budget vs. actual dashboard, change order tracker with budget impact |
| **Documents** | Daily Log Template, Photo Upload with Phase/Trade Tagging, Inspection Request Form, Change Order Form, Draw Request Form, Material Delivery Receipt |
| **Quality Gate per sub-phase** | Inspection passed (USA) OR personal quality checklist completed with photo evidence (WA) AND payment milestone authorized |

### PHASE 7: VERIFY
**Purpose:** Final inspection, punch list, and acceptance.

| Component | Detail |
|-----------|--------|
| **Tasks** | Complete final walkthrough using comprehensive punch list, document all deficiencies with photos, assign corrections to responsible contractors, verify corrections, request final inspection (USA), obtain Certificate of Occupancy (USA) / Certificate of Conformity (WA), release final retainage payments |
| **AI Assist** | Punch list generator from walkthrough notes, photo comparison (before/after corrections), final budget reconciliation report, project completion summary generator |
| **Education** | Module on: what to check in every room, how to test every system, common defects by trade, when to accept vs. reject work, your rights regarding retainage |
| **Financial** | Final retainage release workflow, total project cost summary, cost variance analysis (budgeted vs. actual by line item) |
| **Documents** | Punch List (interactive with photo evidence), Final Inspection Request, Certificate of Occupancy upload, Final Payment Authorization, Project Completion Report, Warranty Documentation Binder |
| **Quality Gate** | Certificate of Occupancy obtained (USA) OR Certificate of Conformity obtained (WA) AND all punch list items resolved AND final payments released AND project marked COMPLETE |

### PHASE 8: OPERATE
**Purpose:** Post-construction lifecycle — move in, rent out, or sell.

| Component | Detail |
|-----------|--------|
| **Tasks** | (Occupy) Set up utilities, move in, establish maintenance schedule. (Rent) List property, screen tenants, execute lease, collect rent, manage maintenance. (Sell) Stage home, list with agent, manage showings, negotiate offers, close sale. |
| **AI Assist** | Rental listing generator, rental price estimator (from market comparables), lease agreement generator, maintenance schedule generator (based on materials used in build), property value estimator, ROI calculator on actual costs |
| **Education** | Modules on: landlord responsibilities, tenant screening, lease law basics, property maintenance schedules, when to refinance, 1031 exchange strategies, West African rental market operations |
| **Financial** | Rental income tracker, expense tracker, net operating income calculator, cap rate calculator (on actual numbers), mortgage payment tracker, depreciation schedule (USA), ROI dashboard |
| **Documents** | Lease Agreement Template, Tenant Screening Checklist, Maintenance Schedule, Property Insurance Checklist, Utility Transfer Checklist |

---

## AI CAPABILITIES — Detailed Specification

### 1. Project Setup Assistant
- Conversational interview: 25-40 adaptive questions based on responses
- Generates: Project Brief, preliminary budget, preliminary timeline, financing recommendation
- Input: User's financial situation, desired property type, target location, build purpose
- Output: Complete project definition ready for Phase 1

### 2. Budget Intelligence
- Regional cost database: 60+ line items with current costs for each supported market
- Auto-populates budget from: square footage + location + quality tier
- Monitors bid submissions and flags outliers (>15% above/below median for trade in region)
- Tracks actual spend against budget in real-time with burn rate projection
- Predicts final cost at completion based on current trajectory
- Currency conversion with real-time rates and historical trend analysis

### 3. Schedule Intelligence
- Takes input: list of trades with estimated durations, dependencies, inspection requirements
- Generates: Gantt chart with critical path highlighted
- Integrates weather data (5-day forecast + historical rainfall patterns for West Africa seasonal planning)
- Alerts when a delay on the critical path threatens completion date
- Suggests schedule compression strategies when behind

### 4. Contract and Document AI
- Generates contracts from templates + project-specific data (parties, scope, price, timeline)
- Reviews uploaded contractor agreements and flags: missing scope items, unusual payment terms, absent warranty clauses, missing insurance requirements, absent lien waiver provisions
- Generates bid request emails customized per trade with project-specific scope description
- Produces progress reports formatted for bank draw requests

### 5. Construction Knowledge AI
- Natural language Q&A on any construction topic, contextualized to the user's specific project
- "What size rebar do I need for a 4m column span in Lome?"
- "My framer says he needs 3 more days. Should I be concerned?"
- "The plumber wants 50% upfront. Is this normal?"
- Draws from: building codes (IRC for USA, Ghana Building Regs, Togo/Benin construction codes), construction best practices, project-specific plans and specifications

### 6. Photo Analysis
- User uploads site photos; AI identifies: phase of construction, approximate completion percentage, potential quality issues (misaligned walls, exposed rebar, improper formwork)
- Compares progress photos over time to verify claimed milestone completion
- Generates visual progress reports from photo timeline

### 7. Risk Analyzer
- Continuously evaluates project state against common failure patterns
- Flags: budget trajectory toward overrun, schedule slippage approaching critical path impact, contractor payment concentration risk (too much paid to one party), seasonal timing risks (foundation work approaching rainy season in WA), currency exposure above threshold for diaspora builds
- Assigns risk severity: low / medium / high / critical
- Recommends specific mitigation actions

---

## TECHNICAL ARCHITECTURE

### Platform
- **Web Application:** React/Next.js frontend, responsive design
- **Mobile Apps:** React Native (iOS + Android), offline-first with background sync
- **Backend:** Node.js/Express or Python/FastAPI
- **Database:** PostgreSQL (relational data) + S3/R2 (documents, photos)
- **AI:** Anthropic Claude API for conversational AI, document analysis, and Q&A
- **Real-Time:** WebSocket connections for live dashboard updates
- **Auth:** OAuth 2.0, multi-factor authentication, role-based access control

### Offline-First Architecture (Critical for West Africa)
- Local SQLite database on mobile devices
- Full CRUD operations available offline
- Background sync when connectivity returns
- Conflict resolution: last-write-wins with conflict log for manual review
- Photo queue: captures photos offline, uploads in background when connected
- Target: app must be fully functional on 2G/3G connections with intermittent connectivity

### Data Model (Simplified)
```
User → has many → Projects
Project → has one → ProjectBrief
Project → has many → Phases → has many → Milestones → has many → Tasks
Project → has one → Budget → has many → LineItems → has many → Transactions
Project → has many → Contacts (contractors, suppliers, professionals)
Project → has many → Documents
Project → has many → DailyLogs → has many → Photos
Project → has many → Bids → grouped by → Trade
Project → has many → Contracts
Project → has many → ChangeOrders
Project → has many → Inspections
Project → has many → PunchListItems
Milestone → has many → PaymentAuthorizations
Contact → has many → CommunicationLogs
```

### Security
- End-to-end encryption for all financial data
- Document vault with access controls
- Audit trail on all financial transactions
- GDPR/data protection compliance
- Data residency options (US, EU, West Africa)

### Integrations (Future)
- Accounting: QuickBooks, Wave, Xero
- Banking: Plaid (USA), mobile money APIs (MTN MoMo, Flooz for Togo)
- Communication: WhatsApp Business API, Twilio SMS
- Maps: Google Maps API (site location, contractor proximity)
- Weather: OpenWeatherMap API
- Currency: Open Exchange Rates API
- Payment: Stripe (USA), Paystack/Flutterwave (West Africa)
- Cloud Storage: Google Drive, Dropbox

---

## MONETIZATION MODEL

### Tiered Subscription

| Tier | Price | Target User | Includes |
|------|-------|-------------|----------|
| **Foundation** | Free | Explorers | Project definition wizard, education modules, budget calculator, 1 project, basic document templates |
| **Builder** | $29/month | Active owner-builders | Full lifecycle management, 2 projects, all document generation, AI assistant (limited queries), photo documentation, budget tracking |
| **Developer** | $79/month | Multi-project builders | Unlimited projects, full AI (unlimited), portfolio dashboard, advanced financial modeling, contractor CRM, API access, team collaboration (3 seats) |
| **Enterprise** | $199/month | Small development firms | Everything in Developer + unlimited team seats, white-label reports, priority support, custom integrations, bulk document generation |

### West Africa Pricing Adjustment
- 60% discount for users with primary addresses in Togo, Ghana, or Benin
- Builder tier: ~$12/month (approx. CFA 7,000)
- Developer tier: ~$32/month (approx. CFA 19,000)
- Mobile money payment integration for local payment methods

### Additional Revenue Streams
- **Contractor Directory:** Featured listings for verified contractors ($25-$100/month)
- **Material Supplier Partnerships:** Referral fees from building material suppliers
- **Financial Services:** Referral partnerships with construction lenders (USA) and remittance services (West Africa)
- **Premium Templates:** Specialized contract templates, plan templates, and legal documents by jurisdiction

---

## DEVELOPMENT ROADMAP

### Phase 1: MVP (Months 1-4)
**Goal:** Core project lifecycle with education, budgeting, and basic AI

Deliverables:
- Project creation wizard (Phase 0: Define)
- Budget builder with regional cost benchmarks (USA + Togo/Ghana/Benin)
- Phase tracker with milestone management (all 8 phases, basic task lists)
- Document templates (10 core templates: contracts, bid requests, checklists)
- Knowledge base (100 core construction terms + 20 educational modules)
- Photo documentation with geotagging and phase tagging
- AI project setup assistant (conversational project definition)
- Basic AI Q&A (construction knowledge)
- User authentication and project data storage
- Responsive web application
- PDF export for budgets and reports

### Phase 2: Financial Intelligence (Months 5-7)
**Goal:** Full financial engine and contractor management

Deliverables:
- Loan qualification calculator (DTI, LTC, monthly payment for all US loan types)
- Bid comparison matrix with outlier detection
- Draw schedule manager with milestone-based payment authorization
- Real-time budget vs. actual tracking with burn rate projection
- Currency converter with rate alerts (XOF/GHS/USD/EUR)
- ROI / cap rate / cash flow projector for rental properties
- Contractor directory and evaluation scorecards
- Supplier price tracking
- Expense receipt capture (photo OCR)
- Change order management with budget impact tracking

### Phase 3: Mobile and Offline (Months 8-10)
**Goal:** Native mobile apps with offline-first architecture

Deliverables:
- iOS app (React Native)
- Android app (React Native)
- Offline-first data layer (SQLite + background sync)
- Push notifications (milestone alerts, payment due, weather warnings)
- Camera integration for photo documentation
- Voice-to-text for daily logs
- GPS integration for photo geotagging
- Optimized for low-bandwidth connections (2G/3G)

### Phase 4: Advanced AI and Communication (Months 11-14)
**Goal:** Sophisticated AI capabilities and integrated communication

Deliverables:
- AI schedule generator (Gantt from trade timelines + dependencies)
- AI risk analyzer (continuous project state evaluation)
- AI contract reviewer (flag missing clauses, unusual terms)
- AI photo analysis (progress verification, quality issue detection)
- AI cost overrun predictor (ML on budget trajectory)
- WhatsApp Business API integration
- In-app messaging system
- Email integration
- Shared project view (read-only access for contractors, banks, family)
- Multi-language support (English, French)

### Phase 5: Marketplace and Scale (Months 15-18)
**Goal:** Contractor marketplace, material pricing, and community

Deliverables:
- Verified contractor marketplace (by trade, by region, with ratings and reviews)
- Material price index (real-time pricing for cement, rebar, lumber, roofing in all markets)
- Material supplier marketplace with direct ordering capability
- Community forum (peer support, market intelligence sharing)
- Portfolio dashboard for multi-project developers
- Advanced financial modeling (depreciation schedules, 1031 exchange planning, DSCR calculation)
- API for third-party integrations
- Additional language support (Ewe, Twi, Fon)
- Accounting software integrations (QuickBooks, Wave)
- Payment gateway integrations (Stripe, Paystack, Flutterwave, MTN MoMo)

---

## DESIGN PRINCIPLES

1. **Education-first:** Every screen teaches. Contextual explanations appear alongside every form field, every metric, every decision point. The user should never feel lost or need to leave the app to understand what they are looking at.

2. **Progressive disclosure:** Show only what is relevant to the current phase. A user in Phase 2 (Land) should not be overwhelmed by Phase 6 (Build) complexity. The app grows with the project.

3. **Offline-resilient:** Every critical function must work without internet connectivity. West African users may have intermittent 2G/3G access. Photos, logs, and budget entries must be capturable offline and synced when connectivity returns.

4. **Trust-through-transparency:** For diaspora builders managing remotely, every action must be verifiable. Photo evidence required for milestone completion. Timestamped, geotagged documentation creates an unalterable record. Milestone-based payment gates prevent premature fund release.

5. **Dual-market intelligence:** The system must understand that "foundation" means slab-on-grade with anchor bolts in Texas and strip-foundation with poteau-poutre columns in Lome. Every template, checklist, cost benchmark, and workflow must adapt to the selected market.

6. **Mobile-native thinking:** The primary interaction device in West Africa is a smartphone, often mid-range Android. The app must be performant on modest hardware, conservative with data usage, and designed for one-handed thumb navigation.

7. **Data sovereignty:** Users own their data absolutely. Full export capability at any time in standard formats (CSV, PDF, JSON). No vendor lock-in. Data residency options for regulatory compliance.

---

## KEY METRICS (Success Indicators)

| Metric | Target (Year 1) | Target (Year 3) |
|--------|-----------------|-----------------|
| Registered users | 5,000 | 50,000 |
| Active projects | 1,000 | 15,000 |
| Paid subscribers | 200 | 5,000 |
| Monthly recurring revenue | $8,000 | $200,000 |
| User project completion rate | 40% | 60% |
| Average budget accuracy (users) | 90% | 95% |
| Contractor directory listings | 500 | 10,000 |
| Markets covered | 4 (USA, Togo, Ghana, Benin) | 8+ (add Nigeria, Senegal, Ivory Coast, Kenya) |
| Languages supported | 2 (EN, FR) | 5+ |
| Mobile app rating | 4.2+ | 4.6+ |

---

## RISK REGISTER

| Risk | Severity | Mitigation |
|------|----------|------------|
| Slow adoption in West Africa due to data costs | High | Offline-first architecture; data-light design; partnership with telcos for zero-rated access |
| Contractor resistance to platform transparency | Medium | Demonstrate value to contractors (lead generation, payment security); start with owner-builder adoption |
| Regulatory differences across jurisdictions | High | Modular jurisdiction layer; engage local legal advisors for each market; community-sourced regulatory updates |
| Currency volatility affecting West Africa pricing | Medium | Dynamic pricing in local currency; accept mobile money; maintain currency reserves |
| AI hallucination on construction-critical advice | High | All AI responses include confidence scores; critical advice (structural, electrical, legal) flagged for professional verification; clear disclaimers |
| Competition from Buildertrend entering owner-builder market | Medium | Moat is dual-market intelligence and novice education — extremely hard for USA-only professional tools to replicate |

---

## TEAM REQUIREMENTS (Initial)

| Role | Count | Focus |
|------|-------|-------|
| Technical Co-Founder / Lead Engineer | 1 | Architecture, backend, AI integration |
| Frontend Engineer | 1 | React/Next.js web app, responsive design |
| Mobile Engineer | 1 | React Native, offline-first architecture |
| Construction Domain Expert (USA) | 1 | Content creation, workflow validation, cost benchmarking |
| Construction Domain Expert (West Africa) | 1 | Content creation, regulatory research, contractor network |
| Designer (UI/UX) | 1 | Product design, mobile-first, accessibility |
| AI/ML Engineer | 1 | Claude integration, photo analysis, predictive models |

---

*This document is the living specification for Keystone. It should be updated as research deepens, user feedback arrives, and the product evolves.*
