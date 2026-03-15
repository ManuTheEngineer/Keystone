# Market Data Foundation + Full UI Integration

**Date:** 2026-03-15
**Status:** Approved
**Scope:** Monorepo setup, `@keystone/market-data` package (USA + Togo, comprehensive), full UI integration including new pages

---

## 1. Monorepo Setup

Currently the project is a single Next.js app at `apps/web/` with no monorepo tooling.

### New root files

- `package.json` — npm workspaces root: `["apps/*", "packages/*"]`
- `turbo.json` — pipeline config for `build`, `lint`, `dev`
- `tsconfig.json` — root TypeScript config with project references

### Changes to `apps/web/`

- Add `@keystone/market-data` as workspace dependency
- Add `transpilePackages: ["@keystone/market-data"]` to `next.config.ts`
- No separate build step for the package — Next.js transpiles TS source directly

---

## 2. Package Structure: `packages/market-data/`

```
packages/market-data/
  package.json
  tsconfig.json
  src/
    index.ts              # Public API: getMarketData(market), all type exports
    types.ts              # Shared interfaces
    utils/
      currency.ts         # Format USD, XOF/CFA, GHS
    usa/
      index.ts            # Assembles full USA MarketConfig
      costs.ts            # 25+ categories, low/mid/high per sqft
      phases.ts           # 9 phases with milestones, durations, dependencies
      trades.ts           # Licensed trades, typical rates, licensing requirements
      inspections.ts      # Inspection types per phase
      loans.ts            # Construction loan types (conventional, FHA, VA, hard money)
      codes.ts            # IRC/IBC references, permit requirements
      templates.ts        # Document template metadata
      education/          # Per-phase educational content (9 files)
        define.ts
        finance.ts
        land.ts
        design.ts
        approve.ts
        assemble.ts
        build.ts
        verify.ts
        operate.ts
    togo/
      index.ts
      costs.ts            # CFA-denominated, concrete block/poteau-poutre
      phases.ts           # Adapted phases (titre foncier, informal inspection)
      trades.ts           # Local trades (mason, ferrailleur, plombier, etc.)
      inspections.ts      # Formal + informal inspection points
      regulations.ts      # Construction permits, urban planning rules
      land-tenure.ts      # Titre foncier workflow, customary vs registered land
      templates.ts
      education/          # 9 files, Togo-specific content
```

---

## 3. Core Types

```typescript
interface MarketConfig {
  market: Market;
  currency: CurrencyConfig;
  phases: PhaseDefinition[];
  costBenchmarks: CostBenchmark[];
  trades: TradeDefinition[];
  inspections: InspectionRequirement[];
  financing: FinancingOption[];
  regulations: RegulationReference[];
  education: Record<ProjectPhase, EducationModule>;
  documentTemplates: DocumentTemplate[];
  glossary: GlossaryTerm[];
}

interface CurrencyConfig {
  code: string;           // USD, XOF, GHS
  symbol: string;         // $, CFA, GH₵
  locale: string;         // en-US, fr-TG
  decimals: number;
  groupSeparator: string;
  position: "prefix" | "suffix";
}

interface CostBenchmark {
  category: string;
  subcategory?: string;
  unit: "sqft" | "sqm" | "lump" | "linear_ft" | "linear_m";
  lowRange: number;
  midRange: number;
  highRange: number;
  notes: string;
  propertyTypes: PropertyType[];
  regions?: string[];
}

interface PhaseDefinition {
  phase: ProjectPhase;
  name: string;
  description: string;
  typicalDurationWeeks: { min: number; max: number };
  milestones: MilestoneDefinition[];
  requiredDocuments: string[];
  educationSummary: string;
  constructionMethod: string;
}

interface MilestoneDefinition {
  name: string;
  description: string;
  requiresInspection: boolean;
  requiresPayment: boolean;
  paymentPct?: number;
  verificationRequired: boolean;
  order: number;
}

interface TradeDefinition {
  id: string;
  name: string;
  localName?: string;
  description: string;
  phases: ProjectPhase[];
  typicalRateRange: { low: number; high: number; unit: string };
  licensingRequired: boolean;
  licensingNotes?: string;
  criticalSkills: string[];
}

interface InspectionRequirement {
  id: string;
  name: string;
  phase: ProjectPhase;
  milestone?: string;
  description: string;
  inspector: string;
  checklistItems: string[];
  requiredBeforeNext: boolean;
  formal: boolean;
}

interface FinancingOption {
  id: string;
  name: string;
  description: string;
  type: string;
  requirements: string[];
  typicalTerms: string;
  pros: string[];
  cons: string[];
}

interface RegulationReference {
  name: string;
  description: string;
  phase: ProjectPhase;
  authority: string;
  url?: string;
  notes: string;
}

interface EducationModule {
  phase: ProjectPhase;
  title: string;
  summary: string;
  content: string;            // 200-400 words, market-specific
  keyDecisions: string[];
  commonMistakes: string[];
  proTips: string[];
  disclaimer?: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  phase: ProjectPhase;
  description: string;
  fields: string[];
  required: boolean;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  phase?: ProjectPhase;
  marketSpecific: boolean;
  localTerms?: Record<string, string>;
}
```

---

## 4. UI Integration Plan

### Existing pages — enhancements

| Page | Integration |
|------|-------------|
| **Project Wizard** | Market selection loads cost preview, estimated timeline, construction method summary |
| **Overview** | Market-specific milestones, phase education cards, glossary tooltips |
| **Budget** | Pre-populated template from costBenchmarks with low/mid/high ranges |
| **Schedule** | Market-driven phases with correct durations and construction method labels |
| **Documents** | Document template library from templates.ts |
| **Team** | Trade list showing which trades needed for current phase with typical rates |
| **Daily Log** | Weather presets per market, construction terminology |
| **Photos** | Phase/milestone labels from market data for tagging |
| **AI Assistant** | Market context injection template |

### New pages

- **Inspections** (`project/[id]/inspections/`) — Phase-specific checklist, pass/fail, photo evidence
- **Punch List** (`project/[id]/punch-list/`) — Deficiency tracking, trade assignment, severity, completion

### New components

- `GlossaryTooltip` — Hover/tap definition from market glossary
- `CostRangeBar` — Visual low/mid/high range indicator
- `PhaseEducationCard` — Expandable phase entry education
- `MarketBadge` — Market flag/label on project cards
- `DocumentTemplateCard` — Selectable template with preview
- `TradeRequirementList` — Trades needed for current phase
- `InspectionChecklist` — Phase inspection items with pass/fail

---

## 5. Data Depth

### USA — 25+ cost categories
Site work, foundation, framing, roofing, siding, windows/doors, plumbing rough-in, plumbing finish, electrical rough-in, electrical finish, HVAC, insulation, drywall, interior trim, flooring, painting, cabinets/counters, appliances, landscaping, driveway, permits/fees, architecture/engineering, contingency. Per-sqft low/mid/high for SFH.

### Togo — 20+ cost categories (CFA-denominated)
Terrassement, fondation, soubassement, elevation murs, poteaux/poutres, chainage, dalle/plancher, charpente, couverture, enduit, carrelage, plomberie, electricite, menuiserie, peinture, cloture, forage/puits, fosse septique. Per-sqm low/mid/high.

### Education — 9 phases x 2 markets = 18 modules
Each 200-400 words covering: what happens, why it matters, common mistakes, key decisions.

### Glossary — 50+ terms per market
Plain-English definitions. Togo includes French equivalents.

---

## 6. Architecture Decisions

1. **No build step for market-data package** — Next.js transpiles TS source directly via `transpilePackages`. Simpler than maintaining tsup/tsc builds.
2. **Static data, not API-fetched** — Cost benchmarks and education content are bundled at build time. No runtime API calls needed. This supports the offline-first requirement.
3. **Market data is tree-shakeable** — Each market is a separate module. Only the selected market's data is loaded.
4. **Currency formatting in the package** — Centralized in `utils/currency.ts` so all UI components format consistently.
5. **Glossary drives the tooltip system** — `GlossaryTooltip` component wraps terms and auto-resolves definitions from market data.
