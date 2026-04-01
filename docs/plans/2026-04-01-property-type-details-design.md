# Property-Type-Specific Detail Capture — Design Document

**Date:** 2026-04-01
**Status:** Approved
**Goal:** Capture granular, property-type-specific construction details during project creation to produce line-item cost estimates, accurate revenue projections, and personalized project specifications throughout the entire platform.

---

## Problem

The current wizard collects the same questions for every property type. A user building a single-family home answers the same Size step as someone building a 12-unit apartment. This produces:

- Generic cost estimates based on broad per-sqft benchmarks
- No differentiation in budget line items, trade lists, or inspection checklists
- Revenue projections that don't account for unit mix, metering strategy, or management
- A project dashboard that feels generic instead of tailored

## Solution

Insert 3-4 new wizard steps between Type (Step 3) and the current Size step. Each step presents property-type-specific questions as tap-only cards with smart defaults. Every selection feeds directly into a new line-item cost engine, revenue projections, and downstream project features.

---

## 1. Wizard Step Restructuring

### Current flow (10 steps)

```
Goal → Market → Location → Type → Size → Land → Financing → Financials → Score → Name
```

### New flow (13 steps max)

```
Goal → Market → Location → Type → Structure → Interior → Site & Outdoor → Unit Config* → Size → Land → Financing → Financials → Score → Name
```

- **Steps 4-6** (Structure, Interior, Site & Outdoor) appear for ALL property types with type-specific options
- **Step 7** (Unit Config) appears ONLY for DUPLEX, TRIPLEX, FOURPLEX, APARTMENT
- **Size step** becomes a confirmation/summary — beds/baths/stories pre-filled from prior steps, features list removed (already captured)
- Step count adjusts dynamically: SFH sees 12 steps, multi-unit sees 13

---

## 2. Structure Step (Step 4)

All options are tap cards. Market-aware — USA vs West Africa options swap automatically.

### SFH

| Question | Options |
|----------|---------|
| Layout | single-story / two-story / split-level / raised foundation |
| Foundation | slab / crawlspace / full basement / walkout basement / pier (WA: raised slab / raft / strip) |
| Roof | gable / hip / flat / metal standing seam (WA adds: clay tile) |
| Exterior finish | vinyl siding / brick / stone / stucco / hardie board (WA: rendered block / exposed block / cladding) |
| Ceiling height | standard 8ft / 9ft / 10ft / vaulted main area |
| Windows | standard / energy-efficient / impact-rated / floor-to-ceiling |
| ADU | none / studio / 1BR / 2BR |
| ADU type (if ADU != none) | detached / garage conversion / basement conversion / attached |

### DUPLEX

| Question | Options |
|----------|---------|
| Layout | side-by-side / stacked up-down |
| Foundation | (same as SFH) |
| Roof | (same as SFH) |
| Exterior finish | (same as SFH) |
| Ceiling height | (same as SFH) |
| Windows | (same as SFH) |
| Soundproofing | standard / enhanced |
| Separate entrances | yes / shared foyer |

### TRIPLEX / FOURPLEX

| Question | Options |
|----------|---------|
| Building layout | linear / L-shape / stacked / 2x2 grid (fourplex only) / courtyard |
| Foundation | (same as SFH) |
| Roof | (same as SFH) |
| Exterior finish | (same as SFH) |
| Ceiling height | (same as SFH) |
| Windows | (same as SFH) |
| Soundproofing | standard / enhanced |
| Entrances | all exterior / shared hallway / mixed |

### APARTMENT (5-12 units)

| Question | Options |
|----------|---------|
| Number of floors | 2 / 3 / 4 |
| Stairwell | single / dual / exterior |
| Elevator | none / single / ADA-compliant |
| Foundation | slab / mat / deep (if 3+ floors) |
| Roof | flat / low-slope / pitched |
| Exterior finish | (same options adapted for multi-story) |
| Soundproofing | standard / enhanced |
| ADA compliance | none / ground-floor accessible / all-floor accessible |
| Fire system | extinguishers only / sprinklered / alarm + sprinkler |
| Commercial ground floor | no / yes (retail-ready shell) |

### Calculation impact

| Selection | Cost Effect |
|-----------|-------------|
| Foundation type | cost-per-sqft lookup × building footprint (basement adds ~15%) |
| Roof style | material + labor cost differential per sqft |
| Exterior finish | per-sqft material cost swap |
| Ceiling height | framing cost multiplier (taller = more studs, drywall) |
| Windows | per-unit cost multiplier (impact-rated ~2x standard) |
| Soundproofing enhanced | per-shared-wall/floor sqft adder |
| Elevator | flat cost addition ($40k-$100k by type) |
| ADU | additional sqft + separate utility connection cost |
| Fire system sprinkler | per-sqft sprinkler cost + permit fees |
| Commercial ground floor | shell build-out cost + separate metering |

---

## 3. Interior Step (Step 5)

### All property types

| Question | Options |
|----------|---------|
| Kitchen style | open concept / galley / L-shape / U-shape / island |
| Kitchen finish level | standard / mid-range / high-end |
| Primary bath | tub+shower combo / walk-in shower / double vanity / soaking tub |
| Secondary bath | full / three-quarter / half bath |
| Flooring (primary) | hardwood / LVP / tile / polished concrete (WA: tile / polished concrete / terrazzo) |
| Laundry | in-unit closet / dedicated room / hookups only (WA adds: outdoor washroom) |
| HVAC | central air / mini-split / radiant floor (WA: split AC / ceiling fans only / none) |
| Water heater | tank / tankless / solar |
| Smart home | none / basic (thermostat + locks) / full (lighting + security + automation) |

### Multi-unit additions (DUPLEX, TRIPLEX, FOURPLEX)

| Question | Options |
|----------|---------|
| Laundry config | in-unit each / shared laundry room |
| HVAC config | individual systems / shared system |
| Finish consistency | all units same / owner unit upgraded / all different |

### APARTMENT additions

| Question | Options |
|----------|---------|
| Laundry config | in-unit each / per-floor shared / central laundry room |
| HVAC config | individual mini-splits / individual central / central boiler / packaged units |
| Water heating | individual tank / individual tankless / central boiler |
| Finish tiers | all same / standard + premium units |

### Calculation impact

| Selection | Cost Effect |
|-----------|-------------|
| Kitchen style | cabinetry linear-feet estimate → material cost |
| Kitchen finish | multiplier: standard 1x / mid-range 1.5x / high-end 2.5x |
| Primary bath fixtures | per-fixture cost swap (soaking tub ~$2k vs combo ~$400) |
| Flooring | per-sqft material cost (hardwood ~$8 vs LVP ~$3) |
| HVAC | system cost: central ~$8k-15k, mini-split ~$3k-5k/head, radiant ~$12-20/sqft |
| Water heater | unit cost: tank ~$1.2k, tankless ~$3k, solar ~$5k |
| Smart home | flat tier: basic ~$2k, full ~$8k-15k |
| Shared vs individual systems | total system count × per-system cost |
| Central boiler (apartment) | single large system cost, changes plumbing layout |

---

## 4. Site & Outdoor Step (Step 6)

### All property types

| Question | Options |
|----------|---------|
| Lot size | small / standard / large / extra-large (presets adapt: sqft USA, sqm WA) |
| Lot shape | rectangular / corner lot / irregular / narrow-deep / wide-shallow / pie-shaped |
| Driveway | concrete / asphalt / gravel / paver / none (WA: concrete / laterite / paver / none) |
| Landscaping | minimal / basic / full / xeriscaping / irrigation system (WA: minimal / courtyard garden / full grounds) |
| Security | none / alarm system / camera system / gated entry (WA adds: perimeter wall / security post / guard house) |

### SFH additions

| Question | Options |
|----------|---------|
| Garage | none / attached single / attached double / detached single / detached double |
| Outdoor living | front porch / back patio / deck / wraparound porch / screened porch / pergola / balcony (multi-select) |
| Fencing | none / privacy fence / chain link / wrought iron (WA: perimeter wall / block wall / hedging) |

### DUPLEX additions

| Question | Options |
|----------|---------|
| Parking | shared driveway / individual driveways / garage per unit / carport |
| Outdoor space | shared yard / divided yard / individual patios / balconies |
| Mailbox | individual / shared |

### TRIPLEX / FOURPLEX additions

| Question | Options |
|----------|---------|
| Parking | surface spots / carport / tuck-under garage / garage per unit / shared lot |
| Parking ratio | 1 per unit / 1.5 / 2 per unit |
| Outdoor | individual patios / shared courtyard / balconies / rooftop |
| Trash | individual curbside / shared enclosure |
| Mailbox | individual / cluster box |

### APARTMENT additions

| Question | Options |
|----------|---------|
| Parking | surface lot / covered carport / tuck-under structure / parking garage / none |
| Parking ratio | 0.5 / 1 / 1.5 / 2 per unit |
| Common outdoor | courtyard / rooftop deck / pool / playground / dog run / none (multi-select) |
| Building access | open / keyed entry / buzzer-intercom / key fob / smart lock |
| Trash | shared dumpster enclosure / compactor / in-building chute |
| Mailbox | cluster box / mail room |
| On-site management | none / office space included / live-in manager unit |

### Calculation impact

| Selection | Cost Effect |
|-----------|-------------|
| Lot size | land cost = price-per-unit × lot size (from location data) |
| Lot shape | site work multiplier: rectangular 1.0x, irregular/pie 1.1-1.2x |
| Garage | flat cost: $15k (attached single) to $45k (detached double) |
| Driveway | per-sqft material cost × estimated area from lot size |
| Parking ratio × units | total spaces → surface area or structure cost |
| Parking structure | $15k-$30k per structured space |
| Outdoor living | per-feature cost additions |
| Fencing / perimeter wall | linear feet (estimated from lot size) × per-foot cost |
| Landscaping | per-sqft cost tier × (lot size - building footprint) |
| Security | system cost + monthly monitoring (feeds operating projections) |
| Common amenities | per-area build cost + ongoing maintenance for operating projections |
| Live-in manager unit | reduces rentable units by 1 in revenue calculations |

---

## 5. Unit Configuration Step (Step 7 — multi-unit only)

### DUPLEX

| Question | Options |
|----------|---------|
| Unit similarity | identical / mirrored / different sizes |
| Unit mix | "2x 2BR/2BA" / "2x 2BR/1BA" / "1x 3BR/2BA + 1x 1BR/1BA" / "1x 3BR/2BA + 1x 2BR/1BA" |
| Owner-occupied | no / unit A / unit B |
| Utilities | all separate meters / shared water / shared electric / all shared |

### TRIPLEX

| Question | Options |
|----------|---------|
| Unit mix | "3x 2BR/1BA" / "2x 2BR/1BA + 1x 1BR/1BA" / "1x 3BR/2BA + 2x 1BR/1BA" / "2x 2BR/1BA + 1x studio" |
| Owner-occupied | no / unit A / unit B / unit C |
| Utilities | all separate meters / shared water / all shared |
| Common maintenance | owner-managed / property manager / HOA |

### FOURPLEX

| Question | Options |
|----------|---------|
| Unit mix | "4x 2BR/1BA" / "2x 2BR/1BA + 2x 1BR/1BA" / "1x 3BR/2BA + 3x 1BR/1BA" / "2x 2BR/2BA + 2x studio" |
| Owner-occupied | no / select unit |
| Utilities | all separate meters / sub-metered / owner-pays |
| Storage | in-unit / shared room / individual cages |
| Common maintenance | owner-managed / property manager / HOA |

### APARTMENT (5-12 units)

| Question | Options |
|----------|---------|
| Unit count | stepper 5-12 |
| Unit mix | "all 1BR/1BA" / "all 2BR/1BA" / "mix 1BR + 2BR" / "mix studio + 1BR + 2BR" / "mix 1BR + 2BR + 3BR" |
| Mix ratio (if mixed) | "mostly smaller" / "even split" / "mostly larger" |
| Owner-occupied | no / yes (designate one unit) |
| Metering | individual all / sub-metered electric / owner-pays all |
| Laundry | in-unit each / per-floor shared / central room |
| Storage | in-unit closets / basement cages / individual units |
| Common areas | lobby / mail room / package room / laundry / fitness / community room (multi-select) |
| Management | self-managed / property manager / on-site manager / live-in manager |

### Calculation impact — costs

| Selection | Cost Effect |
|-----------|-------------|
| Unit mix | total bedroom count → total sqft (studio ~400, 1BR ~650, 2BR ~900, 3BR ~1200) |
| Unit count × per-unit finishes | total interior fit-out cost (kitchen, bath, flooring from Interior step) |
| Separate meters | per-meter install: $500-$2k each for electric, gas, water |
| Sub-metering | equipment cost + wiring |
| Common areas | per-area build cost + ongoing maintenance |
| Storage cages | build-out cost per unit |

### Calculation impact — revenue

| Selection | Revenue Effect |
|-----------|----------------|
| Unit mix | per-unit rent = BR-count-based market rate × location data |
| Owner-occupied | subtract one unit from rental income |
| Total monthly rent | sum of all non-owner units × market rate |
| Cap rate | annual rent / total project cost |
| Management | self (0%) / property manager (8-10% gross) / on-site (salary) |
| Metering | owner-pays = higher rent target, tenant-pays = lower rent + lower OpEx |
| Vacancy rate | estimated by unit type (studios ~8% turnover, 2BR ~5%) |

---

## 6. Updated Size Step (now Step 8 or 9)

The Size step transforms from primary input to confirmation/summary:

- **Beds/baths/stories** pre-filled from Structure + Unit Config
- **For multi-unit:** total building size auto-calculated from unit mix (e.g., 4x 2BR = 4 × 900sqft = 3,600sqft)
- **For SFH with ADU:** main house + ADU shown separately
- **Size presets** adapt to property type (apartment presets are per-unit, not whole building)
- **Features toggle list removed** — already captured in Interior + Site steps
- **Running cost estimate** shows full line-item total, not just broad benchmark

---

## 7. Smart Defaults

Every question has a pre-selected default based on market + property type + goal. Users who want speed can tap Next through all detail steps and still get reasonable estimates.

### Example default sets

**SFH + USA + occupy:**
slab, gable, vinyl siding, standard 9ft ceiling, energy-efficient windows, no ADU, open concept kitchen, mid-range finish, tub+shower combo, full secondary bath, LVP flooring, dedicated laundry room, central air, tank water heater, basic smart home, standard lot rectangular, attached double garage, back patio, privacy fence, concrete driveway, basic landscaping, alarm system

**SFH + TOGO + rent:**
raised slab, clay tile, rendered block, standard ceiling, standard windows, no ADU, L-shape kitchen, standard finish, tub+shower combo, three-quarter secondary, tile flooring, outdoor washroom, split AC, tank water heater, none smart home, standard lot rectangular, no garage, veranda, perimeter wall, concrete driveway, courtyard garden, perimeter wall + security post

**APARTMENT + USA + rent:**
slab, flat roof, stucco, standard ceiling, energy-efficient windows, enhanced soundproofing, shared hallway, extinguishers only (under 3 floors), no commercial, open concept kitchen, standard finish, tub+shower combo, full secondary, LVP flooring, central laundry room, individual mini-splits, individual tankless, none smart home, large lot rectangular, surface lot, 1 per unit parking ratio, courtyard, keyed entry, shared dumpster, cluster box, no on-site management, mix 1BR+2BR even split, all separate meters, no owner-occupied, self-managed

---

## 8. Line-Item Cost Engine

Replaces the current broad `getConstructionCost()` function with a detailed breakdown.

### Cost breakdown structure

```typescript
interface DetailedCostBreakdown {
  siteWork: {
    grading: number;          // lotSize × lotShapeMultiplier × baseCost
    utilityConnections: number; // water + sewer + electric + gas hookups
    driveway: number;          // material costPerSqft × estimated area
    fencing: number;           // type costPerLinearFoot × perimeter estimate
    landscaping: number;       // tier costPerSqft × (lotSize - footprint)
  };
  foundation: {
    type: string;
    cost: number;              // foundationCostPerSqft[type] × footprint
  };
  framing: {
    walls: number;             // perimeter × wallHeight × costPerLinearFoot
    floors: number;            // sqft × stories × costPerSqft
    roof: number;              // roofStyle costPerSqft × footprint
  };
  exterior: {
    finish: number;            // exteriorSqft × costPerSqft[material]
    windows: number;           // estimatedCount × costPer[windowType]
    doors: number;             // entryCount × costPerDoor
  };
  interior: {
    kitchens: number;          // kitchenCost[style] × finishMultiplier × unitCount
    primaryBaths: number;      // fixtureCost[type] × unitCount
    secondaryBaths: number;    // fixtureCost[type] × secondaryBathCount
    flooring: number;          // totalInteriorSqft × costPerSqft[type]
    painting: number;          // totalWallSqft × costPerSqft
    trim: number;              // totalLinearFeet × costPerFoot
    closets: number;           // closetCount × costPer
  };
  mechanical: {
    hvac: number;              // hvacCost[type] × systemCount
    waterHeater: number;       // waterHeaterCost[type] × unitCount
    plumbing: number;          // basePlumbing + (perUnit × unitCount) + metering
    electrical: number;        // baseElectrical + (perUnit × unitCount) + smartHome
  };
  specialItems: {
    garage: number;            // garageCost[type] or 0
    adu: number;               // aduSqft × costPerSqft + utilityConnection or 0
    elevator: number;          // elevatorCost[type] or 0
    fireSystem: number;        // fireSystemCost[type] × sqft or 0
    soundproofing: number;     // costPerSqft × sharedSurface or 0
    security: number;          // securityCost[level]
    solar: number;             // if selected
    pool: number;              // if selected
  };
  parking: {
    type: string;
    spaces: number;
    cost: number;              // parkingCost[type] × spaces
  };
  commonAreas: {
    items: { name: string; cost: number }[];
    total: number;
  };
  softCosts: {
    permits: number;           // based on property type + jurisdiction
    architecture: number;      // % of construction (higher for complex)
    engineering: number;       // if elevator/3+ floors/irregular lot
    survey: number;            // lotSize-based
    insurance: number;         // builders risk based on total value
  };
  contingency: {
    base: number;              // 15% of total hard costs
    complexityAdder: number;   // +5% if apartment/irregular/elevator
  };

  totalHardCosts: number;
  totalSoftCosts: number;
  totalContingency: number;
  grandTotal: number;
}
```

### Revenue projection structure

```typescript
interface RevenueProjection {
  units: {
    type: string;           // e.g., "2BR/1BA"
    count: number;
    avgSqft: number;
    marketRent: number;     // locationData rate × sqft
  }[];

  grossMonthlyRent: number;     // sum of all unit rents (minus owner-occupied)
  vacancyAllowance: number;     // grossMonthly × vacancyRate(unitMix)
  effectiveGrossIncome: number; // gross - vacancy

  operatingExpenses: {
    management: number;         // effectiveGross × rate[managementType]
    ownerPaidUtilities: number; // if owner-pays metering
    commonAreaMaintenance: number;
    insurance: number;
    propertyTaxes: number;      // estimated from location data
    reserves: number;           // 5% of effectiveGross
    total: number;
  };

  netOperatingIncome: number;   // effectiveGross - totalExpenses
  annualNOI: number;
  capRate: number;              // annualNOI / totalProjectCost

  // If financed
  monthlyDebtService: number;
  monthlyCashFlow: number;      // NOI - debtService
  cashOnCashReturn: number;     // annualCashFlow / downPayment

  // If selling
  estimatedSaleValue: number;   // income approach or comparable
  profit: number;
  profitMargin: number;
  roi: number;
}
```

### Market data cost tables (per market module)

Each market (USA, TOGO, GHANA, BENIN) exports:

```typescript
interface MarketCostTables {
  foundation: Record<FoundationType, number>;         // cost per sqft/sqm
  roof: Record<RoofType, number>;                     // cost per sqft/sqm
  exterior: Record<ExteriorType, number>;             // cost per sqft/sqm
  flooring: Record<FlooringType, number>;             // cost per sqft/sqm
  kitchen: {
    base: Record<KitchenStyle, number>;               // base cost
    finishMultiplier: Record<FinishLevel, number>;    // 1x / 1.5x / 2.5x
  };
  bath: Record<BathType, number>;                     // fixture package cost
  hvac: Record<HVACType, number>;                     // system cost
  waterHeater: Record<WaterHeaterType, number>;       // unit cost
  garage: Record<GarageType, number>;                 // flat cost
  parking: Record<ParkingType, number>;               // cost per space
  windows: Record<WindowType, number>;                // cost per unit
  elevator: Record<ElevatorType, number>;             // flat cost
  fireSystem: Record<FireSystemType, number>;         // cost per sqft
  security: Record<SecurityLevel, number>;            // system cost
  smartHome: Record<SmartHomeLevel, number>;           // package cost
  landscaping: Record<LandscapingTier, number>;       // cost per sqft/sqm
  driveway: Record<DrivewayType, number>;             // cost per sqft/sqm
  fencing: Record<FenceType, number>;                 // cost per linear foot/meter
  lotShapeMultiplier: Record<LotShape, number>;       // 1.0 - 1.2
  soundproofing: Record<SoundproofLevel, number>;     // cost per sqft of shared surface
  adu: Record<ADUType, { costPerSqft: number; utilityConnection: number }>;
  // Unit size defaults for multi-unit
  unitSizeDefaults: Record<UnitType, number>;         // studio: 400, 1BR: 650, etc.
}
```

USA values are further adjusted by the location cost index from the location data API.

---

## 9. Downstream Integration — How Details Flow Through the Platform

### Budget page
- Categories auto-generated from actual selections, not generic templates
- Each line item traceable to a wizard selection
- Example: "Primary bathroom — walk-in shower × 2 units = $6,400"
- Users override estimates with actual quotes; system tracks variance (estimated vs actual)

### Team page
- Trade list auto-generated from selections
- Solar selected → "Solar installer" in needed trades
- Elevator → "Elevator contractor"
- Sprinkler → "Fire protection contractor"
- Enhanced soundproofing → "Acoustic insulation specialist"
- Each trade shows estimated budget allocation from cost breakdown

### Schedule / Timeline
- Phase durations adjusted from selections
- Basement → adds 2-3 weeks vs slab
- Elevator → dedicated installation phase
- Multi-unit → longer rough-in (plumbing × unit count)
- ADU → parallel or sequential track

### Documents
- Contract templates pre-populated with specs
- Scope of work references actual selections
- Permit applications pre-filled (stories, sqft, unit count, fire system, elevator)

### Inspections
- Checklist generated from actual features
- Elevator → elevator inspection
- Sprinkler → fire marshal inspection
- Multi-unit separate meters → meter inspection per utility
- Foundation type → specific foundation inspection items

### AI Mentor context
- All selections injected into AI system prompt
- Specific advice: "Since you chose mini-split HVAC for your fourplex..."
- Photo analysis references expected features

### Deal Analyzer
- Pre-fills detail steps from URL params
- Quick scenario comparison: "slab vs basement" → instant cost diff
- Re-run with different selections without recreating project

### Score step — additional factors
- Lot shape risk (irregular = higher site cost risk)
- Unit mix optimization (does mix match local demand?)
- Parking ratio adequacy (under-parked = zoning risk)
- Elevator requirement check (some jurisdictions require at 3+ floors)
- Metering strategy impact on operating margins
- Management cost impact on NOI

---

## 10. UI/UX Specifications

### Card design pattern (consistent across all new steps)
- Each question: group label + row/grid of tap cards
- Selected: `border-emerald-500 border-2 bg-emerald-50/30 shadow-sm`
- Unselected: `border-border bg-surface hover:border-sand`
- Cards show: Lucide SVG icon + label + optional subtitle
- Multi-select: small checkmark when active
- Zero text inputs — everything is tap/toggle

### Conditional visibility
- ADU type → only if ADU != "none"
- Parking ratio → only for TRIPLEX+
- Elevator → only for 3+ floors
- Commercial ground floor → only APARTMENT
- Mix ratio → only if mixed template selected
- Owner unit selector → only if owner-occupied = yes
- WA options replace USA options (not shown alongside)

### Smart defaults
- Pre-selected per market + property type + goal
- User can tap Next through all detail steps without changing anything
- Still produces a reasonable, market-appropriate estimate

### MentorTip per step
- Structure: foundation cost impact, WA flood/termite context
- Interior: kitchen/bath budget inflation warning, finish level vs goal alignment
- Site: lot shape cost impact, corner lot frontage trade-off
- Unit Config: metering economics, management cost reality

### Layout
- Groups render vertically in a scrollable page
- Each group: label + option cards
- 3-5 groups per step
- Scroll indicator if content extends below fold

---

## 11. New WizardState Fields

```typescript
interface WizardState {
  // ... existing fields ...

  // Structure step
  structure: {
    layout: string;
    foundation: string;
    roof: string;
    exterior: string;
    ceilingHeight: string;
    windows: string;
    adu: string;
    aduType: string;
    soundproofing: string;
    entrances: string;
    buildingLayout: string;
    floors: number;
    stairwell: string;
    elevator: string;
    adaCompliance: string;
    fireSystem: string;
    commercialGround: boolean;
  };

  // Interior step
  interior: {
    kitchenStyle: string;
    kitchenFinish: string;
    primaryBath: string;
    secondaryBath: string;
    flooring: string;
    laundry: string;
    hvac: string;
    waterHeater: string;
    smartHome: string;
    finishConsistency: string;
    hvacShared: boolean;
    waterHeatingShared: string;
    laundryConfig: string;
    finishTiers: string;
  };

  // Site & Outdoor step
  site: {
    lotSize: string;
    lotShape: string;
    garage: string;
    driveway: string;
    landscaping: string;
    security: string;
    outdoorLiving: string[];
    fencing: string;
    parking: string;
    parkingRatio: number;
    outdoorSpace: string;
    mailbox: string;
    trash: string;
    buildingAccess: string;
    commonOutdoor: string[];
    onSiteManagement: string;
  };

  // Unit Config step (multi-unit only)
  unitConfig: {
    unitSimilarity: string;
    unitMix: string;
    mixRatio: string;
    ownerOccupied: string;
    ownerUnit: string;
    utilities: string;
    metering: string;
    storage: string;
    commonAreas: string[];
    commonMaintenance: string;
    unitCount: number;
    management: string;
  };
}
```

Each property type only populates relevant fields. Unused fields remain `undefined`.

---

## 12. Firebase Storage

All selections stored under `project.specs`:

```
project.specs.structure: { ...structure selections }
project.specs.interior: { ...interior selections }
project.specs.site: { ...site selections }
project.specs.unitConfig: { ...if multi-unit }
project.specs.calculatedCosts: DetailedCostBreakdown
project.specs.revenueProjection: RevenueProjection (if rent/sell)
```

Persisted for reference throughout the project lifecycle by budget, team, schedule, documents, inspections, and AI context injection.
