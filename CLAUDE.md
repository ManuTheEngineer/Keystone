# CLAUDE.md — Keystone Project Instructions

## Project Identity

**Name:** Keystone
**Tagline:** From First Idea to Final Key
**Domain:** Construction project lifecycle management
**Markets:** United States + West Africa (Togo primary, Ghana, Benin)
**Users:** First-time owner-builders, diaspora investors, small-scale real estate developers

---

## What This Project Is

Keystone is a full-lifecycle construction project management platform that guides someone with **zero construction knowledge** through every phase of building a home — from initial idea through financing, land acquisition, design, permitting, contractor management, physical construction, inspection, occupancy, and ongoing property operations (rental, sale, or personal use).

It serves two fundamentally different construction markets simultaneously:
- **USA:** Wood-frame construction, institutional lending, rigorous code enforcement, licensed trades
- **West Africa (Togo, Ghana, Benin):** Reinforced concrete block/poteau-poutre construction, cash self-funding in phases, limited formal inspection, diaspora remote management

The platform is unique because **no existing product** combines novice education, dual-market intelligence, full lifecycle management, diaspora remote monitoring, AI guidance, document generation, and financial modeling in a single system.

---

## Technical Stack

- **Frontend:** Next.js 14+ (App Router), React 18+, TypeScript
- **Styling:** Tailwind CSS with custom design tokens (earth/clay/sand palette from brand)
- **State Management:** Zustand for client state, React Query/TanStack Query for server state
- **Mobile:** React Native with Expo, offline-first via WatermelonDB or SQLite
- **Backend:** Next.js API routes (initial), migrate to separate FastAPI/Node service as needed
- **Database:** PostgreSQL via Prisma ORM
- **File Storage:** S3-compatible object storage (AWS S3 or Cloudflare R2)
- **Authentication:** NextAuth.js with OAuth providers + email/password
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514 for most features, claude-opus-4-6 for complex analysis)
- **Real-Time:** Server-Sent Events or WebSockets for live dashboard updates
- **PDF Generation:** @react-pdf/renderer or Puppeteer for server-side PDF rendering
- **Charts:** Recharts for data visualization
- **Maps:** Mapbox or Google Maps API for location features
- **Deployment:** Vercel (web), Railway or Fly.io (backend services)

---

## Architecture Principles

### Offline-First (Critical)
West African users may have intermittent 2G/3G connectivity. The mobile app MUST:
- Store all project data locally (SQLite/WatermelonDB)
- Allow full CRUD operations without internet
- Queue photo uploads for background sync
- Use conflict resolution (last-write-wins with conflict log)
- Compress images client-side before upload (max 800KB)
- Target full functionality on 2G connection speeds

### Education-First UI
Every screen that presents a form field, metric, or decision point MUST include contextual education. Implementation pattern:
- Inline help text below form fields explaining what the field means and why it matters
- "Learn more" expandable sections with deeper educational content
- Phase-entry educational modules (shown once when user enters a new phase)
- Glossary tooltip system: construction terms wrapped in a component that shows definition on hover/tap
- "Why this matters" callout blocks at key decision points

### Progressive Disclosure
- Only show UI relevant to the user's current project phase
- Navigation expands as project progresses (locked phases shown as grayed/upcoming)
- Dashboard complexity increases with project phase (Phase 0 = simple; Phase 6 = full construction dashboard)
- Advanced features hidden behind "Show Advanced" toggles

### Dual-Market Adaptation
The application MUST adapt all content, templates, costs, checklists, and workflows based on the project's selected market (USA or specific West African country). Implementation:
- Market-specific data modules: `data/markets/usa.ts`, `data/markets/togo.ts`, `data/markets/ghana.ts`, `data/markets/benin.ts`
- Each module exports: cost benchmarks, regulatory requirements, document templates, construction phases, inspection checklists, trade lists, and educational content
- Components receive market context and render accordingly
- Currency formatting adapts to market (USD, XOF/CFA, GHS)

---

## Project Structure

```
keystone/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/                # App Router pages
│   │   │   ├── (auth)/         # Auth pages (login, register, forgot-password)
│   │   │   ├── (dashboard)/    # Protected dashboard pages
│   │   │   │   ├── projects/   # Project list and creation
│   │   │   │   ├── project/[id]/ # Single project workspace
│   │   │   │   │   ├── overview/
│   │   │   │   │   ├── budget/
│   │   │   │   │   ├── schedule/
│   │   │   │   │   ├── team/
│   │   │   │   │   ├── documents/
│   │   │   │   │   ├── photos/
│   │   │   │   │   ├── daily-log/
│   │   │   │   │   ├── inspections/
│   │   │   │   │   ├── punch-list/
│   │   │   │   │   └── settings/
│   │   │   │   └── learn/      # Knowledge base and education modules
│   │   │   └── (marketing)/    # Public pages (landing, pricing, about)
│   │   ├── components/
│   │   │   ├── ui/             # Base UI components (buttons, inputs, cards, modals)
│   │   │   ├── layout/         # Shell, sidebar, header, mobile nav
│   │   │   ├── project/        # Project-specific components
│   │   │   ├── budget/         # Budget builder, trackers, charts
│   │   │   ├── schedule/       # Gantt chart, timeline, calendar
│   │   │   ├── documents/      # Document viewer, generator, templates
│   │   │   ├── photos/         # Photo gallery, upload, viewer
│   │   │   ├── ai/             # AI chat, assistant, analysis display
│   │   │   ├── education/      # Learning cards, tooltips, modules
│   │   │   └── shared/         # Cross-cutting components
│   │   ├── lib/
│   │   │   ├── api/            # API client functions
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── validators/     # Zod schemas for form validation
│   │   │   └── constants/      # App-wide constants
│   │   └── styles/             # Global styles, Tailwind config
│   │
│   └── mobile/                 # React Native app (Phase 3)
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── navigation/
│       │   ├── store/
│       │   └── services/
│       └── ...
│
├── packages/
│   ├── core/                   # Shared business logic
│   │   ├── models/             # TypeScript types and interfaces
│   │   ├── calculations/       # Financial calculators, unit converters
│   │   ├── validators/         # Shared validation schemas
│   │   └── constants/          # Shared constants
│   │
│   ├── market-data/            # Market-specific data and config
│   │   ├── usa/
│   │   │   ├── costs.ts        # Cost benchmarks by region
│   │   │   ├── codes.ts        # Building code references
│   │   │   ├── loans.ts        # Loan type configurations
│   │   │   ├── phases.ts       # Construction phase definitions
│   │   │   ├── trades.ts       # Trade definitions and typical rates
│   │   │   ├── inspections.ts  # Inspection requirements
│   │   │   ├── templates/      # Document templates (contracts, forms)
│   │   │   └── education/      # Educational content modules
│   │   ├── togo/
│   │   │   ├── costs.ts
│   │   │   ├── regulations.ts
│   │   │   ├── land-tenure.ts  # Titre foncier process, customary land
│   │   │   ├── phases.ts
│   │   │   ├── trades.ts
│   │   │   ├── inspections.ts
│   │   │   ├── templates/
│   │   │   └── education/
│   │   ├── ghana/
│   │   │   └── ... (same structure)
│   │   └── benin/
│   │       └── ... (same structure)
│   │
│   ├── ai/                     # AI service integrations
│   │   ├── client.ts           # Claude API client
│   │   ├── prompts/            # System prompts for each AI feature
│   │   │   ├── project-setup.ts
│   │   │   ├── budget-advisor.ts
│   │   │   ├── schedule-advisor.ts
│   │   │   ├── contract-reviewer.ts
│   │   │   ├── risk-analyzer.ts
│   │   │   ├── construction-qa.ts
│   │   │   └── photo-analyzer.ts
│   │   ├── tools/              # Tool definitions for Claude function calling
│   │   └── parsers/            # Response parsing utilities
│   │
│   └── documents/              # Document generation engine
│       ├── templates/          # Base templates (Handlebars or similar)
│       ├── generators/         # Per-document-type generators
│       └── pdf/                # PDF rendering utilities
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data (cost benchmarks, trade definitions)
│
├── scripts/                    # Build, deploy, data scripts
├── docs/                       # Documentation
│   ├── PROJECT_PLAN.md         # Full project specification
│   ├── API.md                  # API documentation
│   ├── CONTRIBUTING.md
│   └── architecture/           # Architecture decision records
│
├── .env.example                # Environment variable template
├── package.json                # Root package.json (monorepo)
├── turbo.json                  # Turborepo configuration
├── tsconfig.json               # Root TypeScript config
└── CLAUDE.md                   # This file
```

---

## Database Schema (Core Tables)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String?
  avatar        String?
  timezone      String    @default("UTC")
  locale        String    @default("en")
  currency      String    @default("USD")
  plan          Plan      @default(FOUNDATION)
  projects      Project[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  name          String
  market        Market        // USA, TOGO, GHANA, BENIN
  country       String?       // Specific country if WA
  region        String?       // State/region
  city          String?
  purpose       BuildPurpose  // OCCUPY, RENT, SELL
  propertyType  PropertyType  // SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT
  currentPhase  ProjectPhase  @default(DEFINE)
  status        ProjectStatus @default(ACTIVE)
  squareFootage Int?
  squareMeters  Int?
  stories       Int?          @default(1)
  bedrooms      Int?
  bathrooms     Int?
  
  // Financial summary (denormalized for dashboard performance)
  totalBudget       Decimal?
  totalSpent        Decimal?
  contingencyPct    Decimal?  @default(15)
  financingType     String?   // CASH, CONSTRUCTION_LOAN, FHA, VA, HARD_MONEY, PHASED
  
  // Timeline
  estimatedStart    DateTime?
  estimatedComplete DateTime?
  actualStart       DateTime?
  actualComplete    DateTime?
  
  // Relations
  phases        Phase[]
  budgetItems   BudgetItem[]
  contacts      ProjectContact[]
  documents     Document[]
  photos        Photo[]
  dailyLogs     DailyLog[]
  bids          Bid[]
  contracts     Contract[]
  changeOrders  ChangeOrder[]
  inspections   Inspection[]
  punchListItems PunchListItem[]
  payments      Payment[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Phase {
  id            String        @id @default(cuid())
  projectId     String
  project       Project       @relation(fields: [projectId], references: [id])
  phaseType     ProjectPhase
  status        PhaseStatus   @default(NOT_STARTED)
  progress      Int           @default(0)  // 0-100
  startDate     DateTime?
  endDate       DateTime?
  milestones    Milestone[]
  notes         String?
}

model Milestone {
  id            String        @id @default(cuid())
  phaseId       String
  phase         Phase         @relation(fields: [phaseId], references: [id])
  name          String
  description   String?
  status        MilestoneStatus @default(PENDING)
  dueDate       DateTime?
  completedDate DateTime?
  requiresInspection Boolean  @default(false)
  requiresPayment    Boolean  @default(false)
  paymentAmount      Decimal?
  paymentPct         Decimal?
  verificationPhotos Photo[]
  tasks         Task[]
}

model BudgetItem {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  category      String    // FOUNDATION, FRAMING, ROOFING, PLUMBING, etc.
  subcategory   String?
  description   String
  estimatedCost Decimal
  actualCost    Decimal   @default(0)
  currency      String    @default("USD")
  notes         String?
  transactions  Transaction[]
}

model ProjectContact {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  name          String
  company       String?
  trade         String?   // PLUMBER, ELECTRICIAN, ARCHITECT, etc.
  role          String?   // CONTRACTOR, SUPPLIER, PROFESSIONAL, AGENT
  phone         String?
  email         String?
  whatsapp      String?
  address       String?
  rating        Int?      // 1-5
  notes         String?
  bids          Bid[]
  contracts     Contract[]
  payments      Payment[]
}

model Document {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  type          DocumentType
  name          String
  fileUrl       String
  fileSize      Int?
  mimeType      String?
  phase         ProjectPhase?
  description   String?
  createdAt     DateTime  @default(now())
}

model Photo {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  milestoneId   String?
  milestone     Milestone? @relation(fields: [milestoneId], references: [id])
  fileUrl       String
  thumbnailUrl  String?
  phase         ProjectPhase?
  trade         String?
  caption       String?
  latitude      Decimal?
  longitude     Decimal?
  takenAt       DateTime  @default(now())
  createdAt     DateTime  @default(now())
}

// Enums
enum Market { USA, TOGO, GHANA, BENIN }
enum BuildPurpose { OCCUPY, RENT, SELL }
enum PropertyType { SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT, CUSTOM }
enum ProjectPhase { DEFINE, FINANCE, LAND, DESIGN, APPROVE, ASSEMBLE, BUILD, VERIFY, OPERATE }
enum ProjectStatus { ACTIVE, PAUSED, COMPLETED, CANCELLED }
enum PhaseStatus { NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED }
enum MilestoneStatus { PENDING, IN_PROGRESS, COMPLETED, FAILED, SKIPPED }
enum Plan { FOUNDATION, BUILDER, DEVELOPER, ENTERPRISE }
enum DocumentType { CONTRACT, BID, PERMIT, PLAN, INVOICE, RECEIPT, REPORT, CHECKLIST, LEGAL, OTHER }
```

---

## Coding Standards

### General
- TypeScript strict mode everywhere (`"strict": true`)
- Functional components only (no class components)
- Named exports preferred over default exports
- Colocate related files (component + styles + tests + types in same directory)
- File naming: `kebab-case.ts` for utilities, `PascalCase.tsx` for components

### Component Patterns
```tsx
// Standard component pattern
interface BudgetTrackerProps {
  projectId: string;
  market: Market;
  currency: string;
}

export function BudgetTracker({ projectId, market, currency }: BudgetTrackerProps) {
  // hooks at top
  // derived state
  // handlers
  // render
}
```

### API Patterns
- All API routes return consistent response shape: `{ data, error, meta }`
- Use Zod for request validation at the API boundary
- Database queries through Prisma, never raw SQL
- AI calls wrapped in try/catch with fallback responses

### State Management
- Server state: TanStack Query with optimistic updates
- Client state: Zustand stores, organized by domain (projectStore, uiStore, authStore)
- Form state: React Hook Form with Zod resolvers
- URL state: Next.js searchParams for filterable/sortable views

### Error Handling
- All async operations wrapped in error boundaries
- User-facing errors displayed in toast notifications
- Errors logged to monitoring service (Sentry or similar)
- AI failures gracefully degrade (show "unavailable" state, never block workflow)

---

## AI Integration Guidelines

### System Prompts
- Every AI feature has a dedicated system prompt in `packages/ai/prompts/`
- Prompts include: role definition, project context injection, output format specification, safety guardrails
- Construction-critical advice (structural, electrical, legal) MUST include disclaimer: "This is educational guidance. Consult a licensed professional for your specific situation."

### Context Injection
When calling Claude for project-specific advice, always inject:
- Project market (USA/Togo/Ghana/Benin)
- Current phase and sub-phase
- Property type and size
- Budget summary (total budget, spent to date, remaining)
- Relevant recent activity (last 5 daily logs, recent photos)

### Rate Limiting
- Foundation tier: 10 AI queries/day
- Builder tier: 50 AI queries/day
- Developer tier: Unlimited
- Enterprise tier: Unlimited + priority queue

### Response Format
AI responses should be structured for UI rendering:
```typescript
interface AIResponse {
  type: 'text' | 'checklist' | 'table' | 'warning' | 'recommendation';
  content: string;
  confidence: 'high' | 'medium' | 'low';
  sources?: string[];
  disclaimer?: string;
  actions?: AIAction[]; // Suggested next steps the user can take
}
```

---

## Design System

### Color Palette (from GroundUp guide brand)
```css
--earth: #2C1810;      /* Primary dark - headers, sidebar, emphasis */
--clay: #8B4513;       /* Secondary - accents, icons, active states */
--sand: #D4A574;       /* Tertiary - borders, subtle highlights */
--warm: #F5E6D3;       /* Background accent - cards, highlights */
--cream: #FDF8F0;      /* Page background */
--white: #FFFFFF;       /* Card backgrounds */
--slate: #3A3A3A;      /* Body text */
--muted: #6A6A6A;      /* Secondary text */
--accent-usa: #1B4965; /* USA market color */
--accent-wa: #6B4226;  /* West Africa market color */
--success: #2D6A4F;    /* Positive states, completed milestones */
--warning: #BC6C25;    /* Warning states, approaching deadlines */
--danger: #9B2226;     /* Error states, critical risks, overbudget */
```

### Typography
- **Headings:** Instrument Serif (serif, distinctive, professional)
- **Body:** DM Sans (sans-serif, readable, modern)
- **Data/Code:** JetBrains Mono (monospace, for numbers, costs, percentages)

### Icons
- SVG icon system (inline sprites, no emoji ever)
- Lucide React icon library as primary source
- Custom SVG icons for construction-specific concepts where Lucide lacks coverage

### Component Library
- Build on shadcn/ui as the base component system
- Extend with project-specific components (BudgetCard, PhaseTracker, MilestoneGate, etc.)
- All components support dark mode (future consideration, not MVP)

---

## Content and Localization

### Languages (Priority Order)
1. English (launch language)
2. French (critical for Togo and Benin)
3. Ewe (Togo local language, future)
4. Twi (Ghana local language, future)
5. Fon (Benin local language, future)

### Content Strategy
- All educational content stored in MDX files, organized by market and phase
- Content review by construction professionals in each market before publication
- Community contribution system for cost benchmark updates (verified before publishing)
- Quarterly review cycle for regulatory and cost updates

### Currency Handling
- Store all financial values in the project's base currency
- Display with appropriate formatting: USD ($1,234.56), XOF/CFA (1 234 567 FCFA), GHS (GH₵1,234.56)
- Currency conversion using live rates for cross-currency display
- Exchange rate alerts for diaspora builders (notify when rate crosses user-defined threshold)

---

## Testing Strategy

- **Unit Tests:** Vitest for utility functions, calculations, and validators
- **Component Tests:** React Testing Library for component behavior
- **Integration Tests:** Playwright for critical user flows (project creation, budget entry, document generation)
- **AI Tests:** Snapshot testing for prompt outputs; regression testing for AI response parsing
- **Performance Tests:** Lighthouse CI for web performance; target Core Web Vitals passing scores

---

## Deployment

- **Web:** Vercel with Preview Deployments on PRs
- **Database:** Supabase (PostgreSQL) or PlanetScale
- **File Storage:** Cloudflare R2 (S3-compatible, no egress fees)
- **AI:** Direct Anthropic API calls (not proxied through additional services)
- **CI/CD:** GitHub Actions for testing, linting, and deployment
- **Monitoring:** Vercel Analytics + Sentry for error tracking
- **Environment Variables:** Managed through Vercel environment configuration

---

## Important Notes for Development

1. **NEVER use emoji in the UI.** The user explicitly hates them. Use professional SVG icons from the icon system exclusively. This applies to all notifications, labels, badges, status indicators, and educational content.

2. **Every financial calculation must be auditable.** Show the formula, show the inputs, show the result. Users should be able to verify any number the system produces.

3. **West African data connectivity is unreliable.** Every feature must have an offline fallback. If a feature cannot work offline, it must gracefully indicate this and queue the action for when connectivity returns.

4. **Construction terminology must always be explained.** Never assume the user knows what DTI, LTC, rough-in, or poteau-poutre means. First mention in any context should include an inline definition or tooltip.

5. **Market-specific content is not optional.** If a feature exists for the USA, the equivalent must exist for West Africa (adapted, not copied). If a West African feature has no US equivalent (e.g., titre foncier verification), it must exist as a WA-only feature.

6. **The 8-phase structure is the backbone of the entire application.** Every feature, every screen, every data model connects back to a phase. Do not create features that exist outside the phase framework.

7. **AI is a guide, not an authority.** All AI-generated content, especially related to structural engineering, electrical systems, legal matters, or financial advice, must include appropriate disclaimers directing users to consult licensed professionals.

8. **Photo evidence is the trust layer.** For diaspora builders, timestamped geotagged photos are the primary mechanism for verifying contractor claims. The photo system must be robust, tamper-evident, and organized by phase/milestone/trade.
