# Market Data Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `@keystone/market-data` package with comprehensive USA and Togo data, wire it into every existing UI page, and build two new pages (inspections, punch list).

**Architecture:** Turborepo monorepo with an internal TypeScript package (`packages/market-data/`) consumed by the Next.js web app via `transpilePackages`. All market data is static and bundled at build time — no runtime API calls. Each market is a separate module for tree-shaking.

**Tech Stack:** TypeScript, npm workspaces, Turborepo, Next.js 16 transpilePackages

---

## Task 1: Monorepo Scaffolding

**Files:**
- Create: `package.json` (project root)
- Create: `turbo.json`
- Create: `tsconfig.json` (project root)
- Modify: `apps/web/package.json`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/tsconfig.json`

**Step 1: Create root package.json**

Create `package.json` at the project root:

```json
{
  "name": "keystone",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2"
  }
}
```

**Step 2: Create turbo.json**

Create `turbo.json` at the project root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "out/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Step 3: Create root tsconfig.json**

Create `tsconfig.json` at the project root:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "skipLibCheck": true,
    "target": "ES2017"
  }
}
```

**Step 4: Update apps/web/package.json**

Add workspace dependency. In `apps/web/package.json`, add to `"dependencies"`:

```json
"@keystone/market-data": "*"
```

**Step 5: Update apps/web/next.config.ts**

Add `transpilePackages` to the Next.js config. Replace the existing file content:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ["@keystone/market-data"],
};

export default nextConfig;
```

**Step 6: Update apps/web/tsconfig.json**

Add path alias for the market-data package. In `compilerOptions.paths`, add:

```json
"@keystone/market-data": ["../../packages/market-data/src"],
"@keystone/market-data/*": ["../../packages/market-data/src/*"]
```

**Step 7: Install turbo and verify workspace resolution**

Run from project root:

```bash
npm install
```

Expected: npm creates a root `node_modules`, resolves workspaces, installs turbo.

**Step 8: Commit**

```bash
git add package.json turbo.json tsconfig.json apps/web/package.json apps/web/next.config.ts apps/web/tsconfig.json
git commit -m "feat: scaffold Turborepo monorepo with workspace configuration"
```

---

## Task 2: Market Data Package — Types and Structure

**Files:**
- Create: `packages/market-data/package.json`
- Create: `packages/market-data/tsconfig.json`
- Create: `packages/market-data/src/types.ts`
- Create: `packages/market-data/src/index.ts`
- Create: `packages/market-data/src/utils/currency.ts`

**Step 1: Create package.json**

Create `packages/market-data/package.json`:

```json
{
  "name": "@keystone/market-data",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*"
  }
}
```

**Step 2: Create tsconfig.json**

Create `packages/market-data/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"]
}
```

**Step 3: Create src/types.ts**

Create `packages/market-data/src/types.ts` with all shared interfaces. This is the authoritative type file. Types to include:

- `Market` — `"USA" | "TOGO" | "GHANA" | "BENIN"`
- `ProjectPhase` — `"DEFINE" | "FINANCE" | "LAND" | "DESIGN" | "APPROVE" | "ASSEMBLE" | "BUILD" | "VERIFY" | "OPERATE"`
- `PropertyType` — `"SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT"`
- `BuildPurpose` — `"OCCUPY" | "RENT" | "SELL"`
- `CurrencyConfig` — `{ code, symbol, locale, decimals, groupSeparator, position }`
- `CostBenchmark` — `{ category, subcategory?, unit, lowRange, midRange, highRange, notes, propertyTypes, regions? }`
- `PhaseDefinition` — `{ phase, name, description, typicalDurationWeeks: {min, max}, milestones, requiredDocuments, educationSummary, constructionMethod }`
- `MilestoneDefinition` — `{ name, description, requiresInspection, requiresPayment, paymentPct?, verificationRequired, order }`
- `TradeDefinition` — `{ id, name, localName?, description, phases, typicalRateRange: {low, high, unit}, licensingRequired, licensingNotes?, criticalSkills }`
- `InspectionRequirement` — `{ id, name, phase, milestone?, description, inspector, checklistItems, requiredBeforeNext, formal }`
- `FinancingOption` — `{ id, name, description, type, requirements, typicalTerms, pros, cons }`
- `RegulationReference` — `{ name, description, phase, authority, url?, notes }`
- `EducationModule` — `{ phase, title, summary, content, keyDecisions, commonMistakes, proTips, disclaimer? }`
- `DocumentTemplate` — `{ id, name, type, phase, description, fields, required }`
- `GlossaryTerm` — `{ term, definition, phase?, marketSpecific, localTerms? }`
- `MarketConfig` — `{ market, currency, phases, costBenchmarks, trades, inspections, financing, regulations, education, documentTemplates, glossary }`

Full code for types.ts is provided in the design doc. Implement exactly as specified.

**Step 4: Create src/utils/currency.ts**

```typescript
import type { CurrencyConfig } from "../types";

export const USD_CONFIG: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
  decimals: 2,
  groupSeparator: ",",
  position: "prefix",
};

export const XOF_CONFIG: CurrencyConfig = {
  code: "XOF",
  symbol: "FCFA",
  locale: "fr-TG",
  decimals: 0,
  groupSeparator: " ",
  position: "suffix",
};

export const GHS_CONFIG: CurrencyConfig = {
  code: "GHS",
  symbol: "GH\u20B5",
  locale: "en-GH",
  decimals: 2,
  groupSeparator: ",",
  position: "prefix",
};

export function formatCurrency(amount: number, config: CurrencyConfig): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let formatted: string;
  if (config.decimals === 0) {
    formatted = Math.round(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
  } else {
    formatted = absAmount.toFixed(config.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, config.groupSeparator);
  }

  if (config.position === "prefix") {
    return `${sign}${config.symbol}${formatted}`;
  }
  return `${sign}${formatted} ${config.symbol}`;
}

export function formatCurrencyCompact(amount: number, config: CurrencyConfig): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let compact: string;
  if (absAmount >= 1_000_000_000) {
    compact = `${(absAmount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    compact = `${(absAmount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    compact = `${(absAmount / 1_000).toFixed(0)}K`;
  } else {
    return formatCurrency(amount, config);
  }

  if (config.position === "prefix") {
    return `${sign}${config.symbol}${compact}`;
  }
  return `${sign}${compact} ${config.symbol}`;
}
```

**Step 5: Create src/index.ts**

```typescript
export * from "./types";
export * from "./utils/currency";
// Market configs will be added in subsequent tasks
```

**Step 6: Run workspace install to link the package**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && npm install
```

**Step 7: Commit**

```bash
git add packages/market-data/
git commit -m "feat: add market-data package with types and currency utilities"
```

---

## Task 3: USA Market Data — Costs and Phases

**Files:**
- Create: `packages/market-data/src/usa/costs.ts`
- Create: `packages/market-data/src/usa/phases.ts`
- Create: `packages/market-data/src/usa/index.ts`

**Step 1: Create usa/costs.ts**

Create `packages/market-data/src/usa/costs.ts` with 25+ cost benchmark entries. Each entry follows the `CostBenchmark` interface. Categories to include (all per-sqft for SFH, USD):

| Category | Low | Mid | High | Notes |
|----------|-----|-----|------|-------|
| Site work & grading | 2.50 | 4.00 | 7.00 | Clearing, grading, soil compaction |
| Foundation (slab) | 5.00 | 7.50 | 12.00 | Monolithic slab or stem wall |
| Foundation (basement) | 15.00 | 22.00 | 35.00 | Full basement, waterproofing |
| Framing | 12.00 | 18.00 | 28.00 | Walls, floors, roof structure |
| Roofing | 3.50 | 5.50 | 9.00 | Shingles, underlayment, flashing |
| Siding/exterior | 4.00 | 7.00 | 14.00 | Vinyl, fiber cement, or brick |
| Windows & doors | 3.00 | 6.00 | 12.00 | Vinyl or aluminum frames |
| Plumbing rough-in | 4.00 | 6.00 | 9.00 | Supply, drain, vent lines |
| Plumbing finish | 2.00 | 3.50 | 6.00 | Fixtures, water heater |
| Electrical rough-in | 3.50 | 5.50 | 8.00 | Panel, circuits, boxes |
| Electrical finish | 1.50 | 2.50 | 4.00 | Devices, fixtures, trim |
| HVAC | 6.00 | 9.00 | 15.00 | Furnace, AC, ductwork |
| Insulation | 2.00 | 3.00 | 5.00 | Fiberglass batt or spray foam |
| Drywall | 3.00 | 4.50 | 7.00 | Hang, tape, texture |
| Interior trim | 2.50 | 4.00 | 8.00 | Baseboards, casings, crown |
| Flooring | 3.00 | 6.00 | 12.00 | LVP, tile, hardwood |
| Painting (interior) | 2.00 | 3.00 | 5.00 | Walls, ceilings, trim |
| Cabinets & counters | 5.00 | 10.00 | 25.00 | Kitchen and bath |
| Appliances | 1.50 | 3.00 | 6.00 | Standard package |
| Landscaping | 2.00 | 4.00 | 8.00 | Grading, sod, irrigation |
| Driveway & walks | 1.50 | 3.00 | 6.00 | Concrete or asphalt |
| Permits & fees | 2.00 | 4.00 | 8.00 | Building, impact, utility |
| Architecture & engineering | 3.00 | 5.00 | 10.00 | Plans, structural, survey |
| Gutters & downspouts | 0.75 | 1.25 | 2.00 | Aluminum seamless |
| Garage door | 0.50 | 1.00 | 2.00 | Single or double |
| Fireplace | 0.00 | 1.50 | 4.00 | Optional, gas or wood |

Notes should include 1-2 sentence explanations of what is included and typical regional variation.

**Step 2: Create usa/phases.ts**

Create `packages/market-data/src/usa/phases.ts` with 9 phase definitions. Each phase includes milestones, typical duration ranges (in weeks), required documents, and construction method notes. The 9 phases with key milestones:

1. **DEFINE** (2-4 weeks): Define goals, research market, set preliminary budget. Milestones: goals defined, preliminary budget set, market research complete.
2. **FINANCE** (4-8 weeks): Secure financing, loan pre-approval, finalize budget. Milestones: pre-approval obtained, lender selected, budget finalized, proof of funds.
3. **LAND** (4-12 weeks): Find lot, due diligence, purchase. Milestones: lot identified, survey complete, title clear, purchase closed.
4. **DESIGN** (6-12 weeks): Architectural plans, engineering, material selections. Milestones: schematic design, construction docs complete, engineering signed, selections finalized.
5. **APPROVE** (4-8 weeks): Permits, HOA approval, utility coordination. Milestones: permit application submitted, permit approved, utility connections confirmed.
6. **ASSEMBLE** (4-8 weeks): Hire GC or subs, finalize contracts, insurance. Milestones: GC/subs contracted, insurance obtained, construction schedule set, pre-construction meeting.
7. **BUILD** (20-40 weeks): Physical construction. Milestones: site prep, foundation, framing, dry-in, rough-in, insulation/drywall, finishes, exterior, final punch.
8. **VERIFY** (2-4 weeks): Final inspections, certificate of occupancy, punch list. Milestones: final inspection scheduled, CO issued, punch list complete, final payment.
9. **OPERATE** (ongoing): Move-in, warranty tracking, or rental management. Milestones: move-in/tenant placed, warranty log started, maintenance schedule set.

Each milestone specifies `requiresInspection`, `requiresPayment`, `paymentPct`, `verificationRequired`, and `order`.

**Step 3: Create usa/index.ts**

Assembles the full USA `MarketConfig` by importing costs, phases, and the USD currency config. For now, trades, inspections, financing, regulations, education, templates, and glossary will be empty arrays — they get populated in subsequent tasks.

```typescript
import type { MarketConfig } from "../types";
import { USD_CONFIG } from "../utils/currency";
import { USA_COST_BENCHMARKS } from "./costs";
import { USA_PHASES } from "./phases";

export const USA_MARKET: MarketConfig = {
  market: "USA",
  currency: USD_CONFIG,
  phases: USA_PHASES,
  costBenchmarks: USA_COST_BENCHMARKS,
  trades: [],
  inspections: [],
  financing: [],
  regulations: [],
  education: {} as MarketConfig["education"],
  documentTemplates: [],
  glossary: [],
};
```

**Step 4: Update src/index.ts**

Add USA export:

```typescript
export * from "./types";
export * from "./utils/currency";
export { USA_MARKET } from "./usa";
```

**Step 5: Commit**

```bash
git add packages/market-data/src/usa/ packages/market-data/src/index.ts
git commit -m "feat: add USA cost benchmarks (25+ categories) and phase definitions"
```

---

## Task 4: USA Market Data — Trades, Inspections, Financing, Regulations

**Files:**
- Create: `packages/market-data/src/usa/trades.ts`
- Create: `packages/market-data/src/usa/inspections.ts`
- Create: `packages/market-data/src/usa/loans.ts`
- Create: `packages/market-data/src/usa/codes.ts`
- Modify: `packages/market-data/src/usa/index.ts`

**Step 1: Create usa/trades.ts**

12+ trade definitions for US residential construction. Each includes typical hourly/project rate ranges, licensing requirements, which phases they're active in, and critical skills. Trades: General Contractor, Excavation/Grading, Concrete/Foundation, Framing, Roofing, Plumbing, Electrical, HVAC, Insulation, Drywall, Painting, Flooring, Trim Carpentry, Cabinet Installer, Landscaping.

**Step 2: Create usa/inspections.ts**

12+ inspection requirements. Each includes phase, description, who performs it (city inspector, private engineer, etc.), checklist items, and whether it's required before the next phase proceeds. Inspections: footing/foundation, slab pre-pour, framing, shear wall/holdown, rough plumbing, rough electrical, rough HVAC, insulation, drywall (pre-tape), final plumbing, final electrical, final building, certificate of occupancy.

**Step 3: Create usa/loans.ts**

6+ financing options. Each includes requirements, typical terms, pros/cons. Types: Conventional construction loan, FHA construction-to-permanent (203k), VA construction loan, USDA construction loan, Hard money/bridge loan, Cash/self-fund, Owner-builder financing.

**Step 4: Create usa/codes.ts**

Key building code references and permit requirements. Organized by phase. References: IRC (International Residential Code), IBC, NEC (electrical), UPC (plumbing), IECC (energy), local zoning, HOA. Include notes about which codes apply to residential vs commercial.

**Step 5: Update usa/index.ts to import all new modules**

Wire trades, inspections, financing, and regulations into the USA_MARKET config object.

**Step 6: Commit**

```bash
git add packages/market-data/src/usa/
git commit -m "feat: add USA trades, inspections, financing options, and building codes"
```

---

## Task 5: USA Market Data — Education, Templates, Glossary

**Files:**
- Create: `packages/market-data/src/usa/education/define.ts`
- Create: `packages/market-data/src/usa/education/finance.ts`
- Create: `packages/market-data/src/usa/education/land.ts`
- Create: `packages/market-data/src/usa/education/design.ts`
- Create: `packages/market-data/src/usa/education/approve.ts`
- Create: `packages/market-data/src/usa/education/assemble.ts`
- Create: `packages/market-data/src/usa/education/build.ts`
- Create: `packages/market-data/src/usa/education/verify.ts`
- Create: `packages/market-data/src/usa/education/operate.ts`
- Create: `packages/market-data/src/usa/education/index.ts`
- Create: `packages/market-data/src/usa/templates.ts`
- Create: `packages/market-data/src/usa/glossary.ts`
- Modify: `packages/market-data/src/usa/index.ts`

**Step 1: Create 9 education files**

Each file exports an `EducationModule` for its phase. Content should be 200-400 words, covering: what happens in this phase, why it matters, common mistakes first-time builders make, key decisions to consider, and pro tips. USA-specific: reference wood-frame construction, IRC code, institutional lending, licensed trades.

**Step 2: Create education/index.ts**

Assembles all 9 modules into a `Record<ProjectPhase, EducationModule>`.

**Step 3: Create usa/templates.ts**

15+ document templates relevant to US residential construction. Types: Bid request form, General contractor agreement, Subcontractor agreement, Change order form, Draw request, Lien waiver, Certificate of insurance request, Inspection request, Punch list template, Material approval form, Payment schedule, Warranty tracking log, Certificate of occupancy application, Homeowner insurance checklist, Move-in/close-out checklist.

Each template specifies: name, type, phase, description, required fields, and whether it's required.

**Step 4: Create usa/glossary.ts**

50+ construction glossary terms relevant to US market. Examples: DTI (Debt-to-Income ratio), LTC (Loan-to-Cost), rough-in, top-out, dry-in, sheathing, R-value, load-bearing wall, IRC, permit, certificate of occupancy, lien waiver, draw schedule, punch list, change order, GC, sub, plat, easement, setback, FOB, PEX, Romex, GFCI, AFCI, etc.

Each term includes: plain-English definition, which phase it's most relevant to, whether it's market-specific.

**Step 5: Update usa/index.ts**

Wire education, templates, and glossary into `USA_MARKET`.

**Step 6: Commit**

```bash
git add packages/market-data/src/usa/
git commit -m "feat: add USA education modules (9 phases), document templates, and glossary (50+ terms)"
```

---

## Task 6: Togo Market Data — Complete

**Files:**
- Create: `packages/market-data/src/togo/costs.ts`
- Create: `packages/market-data/src/togo/phases.ts`
- Create: `packages/market-data/src/togo/trades.ts`
- Create: `packages/market-data/src/togo/inspections.ts`
- Create: `packages/market-data/src/togo/regulations.ts`
- Create: `packages/market-data/src/togo/land-tenure.ts`
- Create: `packages/market-data/src/togo/templates.ts`
- Create: `packages/market-data/src/togo/glossary.ts`
- Create: `packages/market-data/src/togo/education/` (9 files + index.ts)
- Create: `packages/market-data/src/togo/index.ts`
- Modify: `packages/market-data/src/index.ts`

This is the largest task. Togo data should be comprehensive and authentic to West African construction practices.

**Step 1: Create togo/costs.ts**

20+ categories in CFA (XOF), per square meter. Categories adapted for reinforced concrete block / poteau-poutre construction:

| Category | Low (CFA/m2) | Mid | High | Notes |
|----------|-------------|-----|------|-------|
| Terrassement (earthwork) | 5,000 | 8,000 | 15,000 | Clearing, leveling |
| Fondation | 25,000 | 40,000 | 65,000 | Strip/pad foundation, rebar |
| Soubassement (sub-base walls) | 15,000 | 25,000 | 40,000 | Below-grade walls |
| Elevation murs (walls) | 20,000 | 35,000 | 55,000 | Concrete block, mortar |
| Poteaux/poutres (columns/beams) | 18,000 | 30,000 | 50,000 | Reinforced concrete frame |
| Chainage (ring beams) | 8,000 | 15,000 | 25,000 | Horizontal reinforcement |
| Dalle/plancher (slab/floor) | 20,000 | 35,000 | 55,000 | Reinforced concrete slab |
| Charpente (roof frame) | 12,000 | 20,000 | 35,000 | Wood or steel |
| Couverture (roofing) | 8,000 | 15,000 | 25,000 | Metal sheets (bac alu) |
| Enduit (plaster/render) | 5,000 | 8,000 | 15,000 | Interior/exterior |
| Carrelage (tiling) | 8,000 | 15,000 | 30,000 | Floor and wall tiles |
| Plomberie (plumbing) | 10,000 | 18,000 | 30,000 | PVC pipes, fixtures |
| Electricite (electrical) | 8,000 | 15,000 | 25,000 | Wiring, fixtures |
| Menuiserie (joinery) | 12,000 | 22,000 | 40,000 | Doors, windows, frames |
| Peinture (painting) | 3,000 | 6,000 | 12,000 | Interior/exterior |
| Cloture (perimeter wall) | 15,000 | 25,000 | 45,000 | Block wall + gate |
| Forage/puits (well/borehole) | lump | lump | lump | 500K-2M CFA lump sum |
| Fosse septique (septic) | lump | lump | lump | 300K-800K CFA lump sum |
| Faux plafond (ceiling) | 5,000 | 10,000 | 18,000 | PVC or plaster |
| Cuisine amenagee (kitchen fit) | lump | lump | lump | 500K-3M CFA |

**Step 2: Create togo/phases.ts**

9 phases adapted for Togo. Key differences from USA:
- FINANCE: No institutional lending. Cash savings, diaspora transfers, tontine (informal savings groups). Build-as-you-can financing.
- LAND: Titre foncier process is critical and complex (can take 6-24 months). Customary vs. registered land distinction.
- APPROVE: Permit requirements vary by municipality. Lome has formal permits; rural areas may not. No HOA.
- BUILD: Poteau-poutre (column-beam) construction. Phases overlap heavily. Workers often paid daily (journalier).
- VERIFY: No formal CO in most areas. Informal inspection by owner + architect.

**Step 3: Create togo/trades.ts**

10+ trades with French names and local context: Macon (mason), Ferrailleur (rebar worker), Coffreur (formwork), Charpentier (carpenter), Couvreur (roofer), Plombier (plumber), Electricien (electrician), Carreleur (tiler), Peintre (painter), Menuisier (joiner/woodworker), Soudeur (welder), Manoeuvre (laborer). Include typical daily rates in CFA, licensing notes (informal market, reputation-based).

**Step 4: Create togo/inspections.ts**

Adapted for Togo reality: fewer formal inspections, but critical quality checkpoints. Include: foundation rebar check (before concrete pour), column rebar check, ring beam check, slab rebar check, roof structure check, plumbing pressure test, electrical safety check. Note which are formal (architect/engineer) vs informal (owner verification).

**Step 5: Create togo/regulations.ts and togo/land-tenure.ts**

Regulations: Construction permits in Lome (Mairie), urban planning rules, building setbacks, height limits. Land tenure: Full titre foncier workflow (12 steps), customary land vs. registered land, role of chef de quartier, land surveyor (geometre), notaire, tribunal. This is critical content for diaspora builders.

**Step 6: Create togo/education/ (9 files + index)**

Same structure as USA but Togo-specific. Content covers: concrete block construction, CFA budgeting, titre foncier, finding reliable masons, managing workers when you're overseas, phased construction, quality checkpoints, rainy season planning, etc.

**Step 7: Create togo/templates.ts**

Document templates adapted for Togo: Contrat de construction, Devis (estimate/quote), Bon de commande (purchase order), Proces-verbal de reception (acceptance report), Attestation de titre foncier, Plan cadastral, Quittance de paiement (payment receipt), Bordereau de prix (price schedule).

**Step 8: Create togo/glossary.ts**

50+ terms with French equivalents. Examples: Titre foncier, poteau-poutre, chainage, dalle, soubassement, agglo (concrete block), fer (rebar), ciment (cement), sable (sand), gravier (gravel), geometre (surveyor), notaire, mairie, parcelle, lotissement, bac alu (roofing sheet), fosse septique, forage, tontine, journalier (day laborer), chef de chantier (site foreman).

**Step 9: Create togo/index.ts, update src/index.ts**

Assemble full Togo MarketConfig. Export from main index.

**Step 10: Commit**

```bash
git add packages/market-data/src/togo/ packages/market-data/src/index.ts
git commit -m "feat: add comprehensive Togo market data (costs, phases, trades, land tenure, education, glossary)"
```

---

## Task 7: Market Data API — getMarketData() and Helpers

**Files:**
- Modify: `packages/market-data/src/index.ts`

**Step 1: Add getMarketData function and helper utilities**

Update `packages/market-data/src/index.ts`:

```typescript
export * from "./types";
export * from "./utils/currency";
export { USA_MARKET } from "./usa";
export { TOGO_MARKET } from "./togo";

import type { Market, MarketConfig, ProjectPhase, CostBenchmark, PropertyType } from "./types";
import { USA_MARKET } from "./usa";
import { TOGO_MARKET } from "./togo";

const MARKETS: Record<Market, MarketConfig> = {
  USA: USA_MARKET,
  TOGO: TOGO_MARKET,
  GHANA: USA_MARKET, // Placeholder until Ghana data is built
  BENIN: TOGO_MARKET, // Placeholder — uses Togo as closest match
};

export function getMarketData(market: Market): MarketConfig {
  return MARKETS[market];
}

export function getCostBenchmarks(market: Market, propertyType?: PropertyType): CostBenchmark[] {
  const config = MARKETS[market];
  if (!propertyType) return config.costBenchmarks;
  return config.costBenchmarks.filter(
    (c) => c.propertyTypes.length === 0 || c.propertyTypes.includes(propertyType)
  );
}

export function getPhaseDefinition(market: Market, phase: ProjectPhase) {
  return MARKETS[market].phases.find((p) => p.phase === phase);
}

export function getGlossaryTerm(market: Market, term: string) {
  return MARKETS[market].glossary.find(
    (g) => g.term.toLowerCase() === term.toLowerCase()
  );
}

export function getTradesForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].trades.filter((t) => t.phases.includes(phase));
}

export function getInspectionsForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].inspections.filter((i) => i.phase === phase);
}

export function getEducationForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].education[phase];
}

export const PHASE_ORDER: ProjectPhase[] = [
  "DEFINE", "FINANCE", "LAND", "DESIGN", "APPROVE", "ASSEMBLE", "BUILD", "VERIFY", "OPERATE"
];

export const PHASE_NAMES: Record<ProjectPhase, string> = {
  DEFINE: "Define",
  FINANCE: "Finance",
  LAND: "Land",
  DESIGN: "Design",
  APPROVE: "Approve",
  ASSEMBLE: "Assemble",
  BUILD: "Build",
  VERIFY: "Verify",
  OPERATE: "Operate",
};
```

**Step 2: Verify build**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone/apps/web && npx next build
```

Expected: Build succeeds. If it fails, fix TypeScript errors in the market-data package.

**Step 3: Commit**

```bash
git add packages/market-data/src/index.ts
git commit -m "feat: add market data API helpers (getMarketData, getCostBenchmarks, etc.)"
```

---

## Task 8: New UI Components

**Files:**
- Create: `apps/web/src/components/ui/GlossaryTooltip.tsx`
- Create: `apps/web/src/components/ui/CostRangeBar.tsx`
- Create: `apps/web/src/components/ui/PhaseEducationCard.tsx`
- Create: `apps/web/src/components/ui/MarketBadge.tsx`
- Create: `apps/web/src/components/ui/DocumentTemplateCard.tsx`
- Create: `apps/web/src/components/ui/TradeRequirementList.tsx`
- Create: `apps/web/src/components/ui/InspectionChecklist.tsx`

**Step 1: GlossaryTooltip**

A component that wraps text and shows a definition tooltip on hover (desktop) or tap (mobile). Props: `term: string`, `market: Market`. Looks up the term in the market glossary via `getGlossaryTerm()`. Shows the definition in a positioned tooltip. Styled with the earth/sand palette. If no definition found, renders the term as plain text.

**Step 2: CostRangeBar**

A horizontal bar visualization showing low/mid/high cost ranges. Props: `low: number`, `mid: number`, `high: number`, `actual?: number`, `currency: CurrencyConfig`. Shows a gradient bar from low to high, with the mid marked. If actual is provided, shows an indicator dot. Uses the `formatCurrency` util.

**Step 3: PhaseEducationCard**

An expandable card that shows phase-specific educational content. Props: `module: EducationModule`. Shows title, summary. When expanded, shows full content, key decisions, common mistakes, and pro tips. Includes the AI disclaimer when present. Styled with the emerald-50/emerald-200 educational styling pattern used throughout the app.

**Step 4: MarketBadge**

Small badge showing market name with appropriate color. Props: `market: Market`. USA shows with accent-usa color, TOGO/GHANA/BENIN show with accent-wa color.

**Step 5: DocumentTemplateCard**

A selectable card for document templates. Props: `template: DocumentTemplate`, `onSelect: () => void`. Shows template name, type badge, description, required indicator. Uses the document type colors from the existing documents page.

**Step 6: TradeRequirementList**

Shows trades needed for a given phase. Props: `trades: TradeDefinition[]`, `currency: CurrencyConfig`. Lists each trade with name, local name (if any), rate range, licensing indicator, critical skills.

**Step 7: InspectionChecklist**

Phase-specific inspection checklist. Props: `inspections: InspectionRequirement[]`, `onToggle: (id: string, itemIndex: number) => void`, `completedItems: Record<string, boolean[]>`. Shows each inspection with its checklist items as toggleable checkboxes.

**Step 8: Commit**

```bash
git add apps/web/src/components/ui/
git commit -m "feat: add 7 new UI components for market data integration"
```

---

## Task 9: Wire Market Data into Project Wizard

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Import market data**

Add imports from `@keystone/market-data`: `getMarketData`, `formatCurrencyCompact`, `PHASE_ORDER`.

**Step 2: Add market preview to wizard**

After the user selects a market (step 2), show a preview card below the options:
- Construction method for this market (e.g., "Wood-frame" or "Reinforced concrete block")
- Currency used
- Number of phases with typical total duration range
- Example cost range for a mid-size SFH

After the user selects size (step 4), show an estimated budget range by multiplying cost benchmarks by the size range.

**Step 3: Update project creation to include market-derived defaults**

When creating the project, use market data to set:
- `currency` from market config
- `totalWeeks` from sum of phase durations (mid estimate)
- `phaseName` from market phase definitions

**Step 4: Verify the wizard still works**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone/apps/web && npx next build
```

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/new-project/
git commit -m "feat: wire market data into project wizard with cost previews and smart defaults"
```

---

## Task 10: Wire Market Data into Overview Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/overview/_client.tsx`

**Step 1: Import market data**

Add imports: `getMarketData`, `getPhaseDefinition`, `getEducationForPhase`, `formatCurrency`, `PHASE_ORDER`.

**Step 2: Replace hardcoded milestones with market-specific milestones**

The "Next milestones" section (lines 122-135) currently shows hardcoded strings. Replace with actual milestones from `getPhaseDefinition(project.market, PHASE_ORDER[project.currentPhase])`.

**Step 3: Add phase education card**

Below the phase tracker, add a `PhaseEducationCard` component showing education for the current phase.

**Step 4: Replace inline formatCurrency with the market-data utility**

Remove the local `formatCurrency` function (lines 21-25) and use `formatCurrency` + `formatCurrencyCompact` from the package with the project's market currency config.

**Step 5: Add MarketBadge to project details**

In the "Project details" card, replace the plain text market value with a `MarketBadge`.

**Step 6: Add GlossaryTooltip around construction terms**

Wrap any construction terms in the sub-phase display with `GlossaryTooltip`.

**Step 7: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: wire market data into overview page (milestones, education, glossary)"
```

---

## Task 11: Wire Market Data into Budget Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/budget/_client.tsx`

**Step 1: Import market data**

Add imports: `getMarketData`, `getCostBenchmarks`, `formatCurrency`, `CostRangeBar`.

**Step 2: Add budget template feature**

Add a "Load market benchmarks" button that populates the budget with cost benchmarks from the market data for the project's property type and size. Shows a CostRangeBar next to each line item so the user can see where their estimate falls relative to market norms.

**Step 3: Replace inline fmt function with market-data formatCurrency**

Remove the local `fmt` function (lines 19-23) and use the package utility.

**Step 4: Add "Typical range" column to budget table**

For each budget item, find the matching cost benchmark and show the low-mid-high range alongside the estimated and actual columns.

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: wire market benchmarks into budget page with cost range indicators"
```

---

## Task 12: Wire Market Data into Schedule Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/schedule/_client.tsx`

**Step 1: Replace hardcoded DEFAULT_SCHEDULE**

Remove the hardcoded `DEFAULT_SCHEDULE` array (lines 10-19). Instead, derive the schedule from the market's phase definitions. Each phase becomes a bar in the Gantt chart with `typicalDurationWeeks.min` to `typicalDurationWeeks.max`.

**Step 2: Show market-appropriate phase names**

For Togo, show French phase descriptions alongside English names.

**Step 3: Add construction method label**

Show the construction method at the top (e.g., "Wood-frame construction" or "Poteau-poutre (reinforced concrete frame)").

**Step 4: Add phase education expandable**

Below the Gantt chart, add expandable education cards for each phase using `PhaseEducationCard`.

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: replace hardcoded schedule with market-driven Gantt chart"
```

---

## Task 13: Wire Market Data into Documents Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/documents/_client.tsx`

**Step 1: Add template library section**

Import `getMarketData`, `DocumentTemplateCard`. Above the existing document list, add a "Template Library" section showing available document templates from the market data for the current phase.

**Step 2: Add "Generate from template" flow**

When user clicks a template card, show a simple form pre-filled with project data. On submit, create a new document entry in Firebase with the template data.

**Step 3: Add phase filter**

Add a dropdown to filter templates by phase. Default to current project phase.

**Step 4: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: add document template library from market data"
```

---

## Task 14: Wire Market Data into Team Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/team/_client.tsx`

**Step 1: Add "Trades needed this phase" section**

Import `getTradesForPhase`, `TradeRequirementList`. Above the contact list, show which trades are needed for the current project phase with typical rate ranges.

**Step 2: Pre-fill role from trade selection**

When adding a new contact, offer a dropdown of trades from the market data instead of a free-text role field.

**Step 3: Show trade licensing info**

For each contact, if their role matches a trade with `licensingRequired: true`, show a licensing indicator.

**Step 4: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: add trade requirements and market-aware roles to team page"
```

---

## Task 15: Wire Market Data into Daily Log and Photos

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/daily-log/_client.tsx`
- Modify: `apps/web/src/app/(dashboard)/project/[id]/photos/_client.tsx`

**Step 1: Daily log — weather presets**

Replace the free-text weather input with a combination of preset buttons (Sunny, Cloudy, Rain, Storm) + temperature input. For Togo, use Celsius; for USA, Fahrenheit.

**Step 2: Photos — phase/milestone labels from market data**

When uploading photos, offer a dropdown of milestones from the current phase (from market data) instead of the current hardcoded "Build" phase label.

**Step 3: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: add market-aware weather presets and milestone photo tagging"
```

---

## Task 16: Wire Market Data into AI Assistant

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/ai-assistant/_client.tsx`

**Step 1: Enrich project context with market data**

Import `getMarketData`, `getPhaseDefinition`, `getEducationForPhase`. When building the `projectContext` string (lines 62-63), include:
- Market construction method
- Current phase milestones
- Cost benchmarks for current phase categories
- Key glossary terms for current phase

This makes the context injection much richer for when the AI endpoint is eventually configured.

**Step 2: Update suggestion prompts**

Replace the generic suggestions (lines 113-116) with market-specific suggestions. E.g., for Togo: "What should I check before the rebar pour?", "How does the titre foncier process work?", "What's a fair daily rate for a mason in Lome?"

**Step 3: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/
git commit -m "feat: enrich AI assistant context with market data and phase-specific suggestions"
```

---

## Task 17: New Page — Inspections

**Files:**
- Create: `apps/web/src/app/(dashboard)/project/[id]/inspections/page.tsx`
- Create: `apps/web/src/app/(dashboard)/project/[id]/inspections/_client.tsx`

**Step 1: Create page.tsx**

Standard Next.js page wrapper that renders `InspectionsClient`.

**Step 2: Create _client.tsx**

Full inspections page that:
- Imports market inspection data via `getInspectionsForPhase`
- Shows inspections grouped by phase (past, current, upcoming)
- Uses `InspectionChecklist` component for current phase
- Each inspection has pass/fail status stored in Firebase
- Photo evidence can be attached to each inspection item
- Shows "formal" vs "informal" badge for Togo inspections
- Educational footer explaining why inspections matter

**Step 3: Add Firebase CRUD for inspections**

Add to `project-service.ts`:
- `InspectionData` interface
- `addInspectionResult`, `subscribeToInspections`, `updateInspectionResult`

**Step 4: Add sidebar navigation entry**

In `Sidebar.tsx`, add "Inspections" to the `projectNav` array with the `ClipboardCheck` icon from Lucide.

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/\\[id\\]/inspections/ apps/web/src/lib/services/project-service.ts apps/web/src/components/layout/Sidebar.tsx
git commit -m "feat: add inspections page with market-specific checklists"
```

---

## Task 18: New Page — Punch List

**Files:**
- Create: `apps/web/src/app/(dashboard)/project/[id]/punch-list/page.tsx`
- Create: `apps/web/src/app/(dashboard)/project/[id]/punch-list/_client.tsx`

**Step 1: Create page.tsx**

Standard Next.js page wrapper.

**Step 2: Create _client.tsx**

Full punch list page that:
- Lists deficiency items found during inspections or walkthroughs
- Each item has: description, trade responsible, severity (critical/major/minor), status (open/in-progress/resolved), photo evidence
- Add item form with trade dropdown from market data
- Filter by status and severity
- Educational footer explaining punch list process
- For Togo, adapted as "proces-verbal de reception" items

**Step 3: Add Firebase CRUD for punch list items**

Add to `project-service.ts`:
- `PunchListItemData` interface
- `addPunchListItem`, `subscribeToPunchListItems`, `updatePunchListItem`

**Step 4: Add sidebar navigation entry**

In `Sidebar.tsx`, add "Punch list" to `projectNav` with the `ListChecks` icon.

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/\\[id\\]/punch-list/ apps/web/src/lib/services/project-service.ts apps/web/src/components/layout/Sidebar.tsx
git commit -m "feat: add punch list page with trade assignment and severity tracking"
```

---

## Task 19: Update Dashboard with Market Badges

**Files:**
- Modify: `apps/web/src/app/(dashboard)/page.tsx`

**Step 1: Add MarketBadge to project cards**

Import `MarketBadge`. On each project card in the dashboard grid, show the market badge next to the project name.

**Step 2: Update currency formatting**

Use `formatCurrencyCompact` from the market-data package instead of inline formatting.

**Step 3: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/page.tsx
git commit -m "feat: add market badges and improved currency formatting to dashboard"
```

---

## Task 20: Final Build Verification and Cleanup

**Step 1: Run full build**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && npx turbo build
```

Expected: Clean build with no TypeScript errors.

**Step 2: Fix any TypeScript errors**

Iterate until build passes.

**Step 3: Run lint**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone/apps/web && npx next lint
```

Fix any lint issues.

**Step 4: Manual smoke test checklist**

- [ ] Dashboard loads, shows market badges on project cards
- [ ] New project wizard shows market preview after market selection
- [ ] New project wizard shows estimated budget range after size selection
- [ ] Overview page shows market-specific milestones
- [ ] Overview page shows phase education card
- [ ] Budget page can load market benchmarks
- [ ] Budget page shows cost range bars
- [ ] Schedule page shows market-driven Gantt chart
- [ ] Documents page shows template library
- [ ] Team page shows trades needed for current phase
- [ ] Daily log shows weather presets
- [ ] Photos show milestone dropdown for tagging
- [ ] AI assistant shows market-specific suggestions
- [ ] Inspections page loads with market checklists
- [ ] Punch list page works (add, toggle, filter)
- [ ] Sidebar shows new nav items (Inspections, Punch list)

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: resolve build errors and lint issues from market data integration"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Monorepo scaffolding | Root package.json, turbo.json, tsconfig.json |
| 2 | Package types + currency | packages/market-data/src/types.ts, currency.ts |
| 3 | USA costs + phases | packages/market-data/src/usa/costs.ts, phases.ts |
| 4 | USA trades, inspections, financing, codes | packages/market-data/src/usa/*.ts |
| 5 | USA education, templates, glossary | packages/market-data/src/usa/education/, glossary.ts |
| 6 | Togo complete market data | packages/market-data/src/togo/ (all files) |
| 7 | Market data API helpers | packages/market-data/src/index.ts |
| 8 | New UI components (7) | apps/web/src/components/ui/*.tsx |
| 9 | Project wizard integration | apps/web/src/app/(dashboard)/new-project/ |
| 10 | Overview page integration | apps/web/src/app/(dashboard)/project/[id]/overview/ |
| 11 | Budget page integration | apps/web/src/app/(dashboard)/project/[id]/budget/ |
| 12 | Schedule page integration | apps/web/src/app/(dashboard)/project/[id]/schedule/ |
| 13 | Documents page integration | apps/web/src/app/(dashboard)/project/[id]/documents/ |
| 14 | Team page integration | apps/web/src/app/(dashboard)/project/[id]/team/ |
| 15 | Daily log + photos integration | apps/web/src/app/(dashboard)/project/[id]/daily-log/, photos/ |
| 16 | AI assistant enrichment | apps/web/src/app/(dashboard)/project/[id]/ai-assistant/ |
| 17 | New: Inspections page | apps/web/src/app/(dashboard)/project/[id]/inspections/ |
| 18 | New: Punch list page | apps/web/src/app/(dashboard)/project/[id]/punch-list/ |
| 19 | Dashboard updates | apps/web/src/app/(dashboard)/page.tsx |
| 20 | Build verification + cleanup | All files |
