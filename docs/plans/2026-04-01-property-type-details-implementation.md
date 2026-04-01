# Property-Type-Specific Detail Capture — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Insert 3-4 new wizard steps (Structure, Interior, Site & Outdoor, Unit Config) between property type selection and the Size step, with a new line-item cost engine that feeds into budget, team, schedule, and AI context.

**Architecture:** The wizard page (`new-project/page.tsx`) gains new step renderer functions and expanded WizardState. A new file `property-details-config.ts` holds all option definitions and smart defaults per market/type/goal. A new file `detailed-cost-engine.ts` replaces the inline cost functions with a line-item calculator. The project service gains a `specs` field and an updated `generateBudgetFromSpecs` that uses line-item costs. Market data modules gain detailed cost tables.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Firebase Realtime Database, @keystone/market-data package, Lucide React icons.

---

## Task 1: Create Property Details Configuration File

**Files:**
- Create: `apps/web/src/lib/config/property-details-config.ts`

This file defines all options for the 4 new steps, smart defaults, and type definitions. It is the single source of truth for what options exist per property type and market.

**Step 1: Create the types and option definitions**

```typescript
// apps/web/src/lib/config/property-details-config.ts

import type { LucideIcon } from "lucide-react";
import {
  Home, Building2, Layers, ArrowUpDown, Grid2X2, Fence,
  Thermometer, Droplets, Sun, Zap, Shield, ShieldCheck,
  Car, Trees, Waves, Bath, Bed, DoorOpen, PaintBucket,
  Wind, Flame, Lock, Mail, Trash2, Users, Warehouse,
  Accessibility, Siren, Store, LayoutGrid, Columns3,
  PanelTop, CircleDot, Square, Triangle, Pentagon,
  Hexagon, Footprints, Hammer, Ruler, Eye,
} from "lucide-react";
import type { Market as MarketType } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Core types for property detail selections
// ---------------------------------------------------------------------------

export type PropertyType = "SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT";
type BuildGoal = "sell" | "rent" | "occupy" | "";

/** A single selectable option within a question group */
export interface DetailOption {
  id: string;
  label: string;
  subtitle?: string;
  Icon?: LucideIcon;
}

/** A question group shown in a detail step */
export interface DetailQuestion {
  key: string;                   // maps to state field
  label: string;                 // group label shown above options
  options: DetailOption[];
  multiSelect?: boolean;         // default false (single select)
  conditionalOn?: {              // only show if another field matches
    field: string;
    values: string[];
    negate?: boolean;            // show when field does NOT match values
  };
}

// ---------------------------------------------------------------------------
// Structure step selections state
// ---------------------------------------------------------------------------

export interface StructureSelections {
  layout: string;
  foundation: string;
  roof: string;
  exterior: string;
  ceilingHeight: string;
  windows: string;
  // SFH only
  adu: string;
  aduType: string;
  // Multi-unit
  soundproofing: string;
  entrances: string;
  buildingLayout: string;
  // Apartment only
  floors: number;
  stairwell: string;
  elevator: string;
  adaCompliance: string;
  fireSystem: string;
  commercialGround: string;
}

// ---------------------------------------------------------------------------
// Interior step selections state
// ---------------------------------------------------------------------------

export interface InteriorSelections {
  kitchenStyle: string;
  kitchenFinish: string;
  primaryBath: string;
  secondaryBath: string;
  flooring: string;
  laundry: string;
  hvac: string;
  waterHeater: string;
  smartHome: string;
  // Multi-unit
  laundryConfig: string;
  hvacConfig: string;
  finishConsistency: string;
  // Apartment
  waterHeatingConfig: string;
  finishTiers: string;
}

// ---------------------------------------------------------------------------
// Site & Outdoor step selections state
// ---------------------------------------------------------------------------

export interface SiteSelections {
  lotSize: string;
  lotShape: string;
  driveway: string;
  landscaping: string;
  security: string;
  // SFH
  garage: string;
  outdoorLiving: string[];
  fencing: string;
  // Multi-unit
  parking: string;
  parkingRatio: string;
  outdoorSpace: string;
  mailbox: string;
  trash: string;
  // Apartment
  buildingAccess: string;
  commonOutdoor: string[];
  onSiteManagement: string;
}

// ---------------------------------------------------------------------------
// Unit Config step selections state (multi-unit only)
// ---------------------------------------------------------------------------

export interface UnitConfigSelections {
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
}

// ---------------------------------------------------------------------------
// Initial/default state factories
// ---------------------------------------------------------------------------

export const INITIAL_STRUCTURE: StructureSelections = {
  layout: "", foundation: "", roof: "", exterior: "",
  ceilingHeight: "", windows: "", adu: "none", aduType: "",
  soundproofing: "", entrances: "", buildingLayout: "",
  floors: 2, stairwell: "", elevator: "none",
  adaCompliance: "none", fireSystem: "", commercialGround: "no",
};

export const INITIAL_INTERIOR: InteriorSelections = {
  kitchenStyle: "", kitchenFinish: "", primaryBath: "",
  secondaryBath: "", flooring: "", laundry: "", hvac: "",
  waterHeater: "", smartHome: "none",
  laundryConfig: "", hvacConfig: "", finishConsistency: "",
  waterHeatingConfig: "", finishTiers: "",
};

export const INITIAL_SITE: SiteSelections = {
  lotSize: "", lotShape: "", driveway: "", landscaping: "",
  security: "", garage: "", outdoorLiving: [], fencing: "",
  parking: "", parkingRatio: "", outdoorSpace: "", mailbox: "",
  trash: "", buildingAccess: "", commonOutdoor: [],
  onSiteManagement: "",
};

export const INITIAL_UNIT_CONFIG: UnitConfigSelections = {
  unitSimilarity: "", unitMix: "", mixRatio: "",
  ownerOccupied: "no", ownerUnit: "", utilities: "",
  metering: "", storage: "", commonAreas: [],
  commonMaintenance: "", unitCount: 5, management: "",
};

// ---------------------------------------------------------------------------
// Option definitions per question, per market
// ---------------------------------------------------------------------------

// --- STRUCTURE OPTIONS ---

export function getStructureQuestions(
  propertyType: PropertyType,
  market: MarketType | "",
): DetailQuestion[] {
  const isUSA = market === "USA";
  const questions: DetailQuestion[] = [];

  // Layout (SFH)
  if (propertyType === "SFH") {
    questions.push({
      key: "layout",
      label: "Layout style",
      options: [
        { id: "single-story", label: "Single story", Icon: Home },
        { id: "two-story", label: "Two story", Icon: ArrowUpDown },
        { id: "split-level", label: "Split level", Icon: Layers },
        { id: "raised", label: isUSA ? "Raised foundation" : "Elevated (stilts)", Icon: Footprints },
      ],
    });
  }

  // Building layout (multi-unit)
  if (propertyType === "DUPLEX") {
    questions.push({
      key: "buildingLayout",
      label: "Duplex layout",
      options: [
        { id: "side-by-side", label: "Side by side", subtitle: "Units share a center wall", Icon: Columns3 },
        { id: "stacked", label: "Stacked (up/down)", subtitle: "One unit above the other", Icon: ArrowUpDown },
      ],
    });
  }

  if (propertyType === "TRIPLEX" || propertyType === "FOURPLEX") {
    const opts: DetailOption[] = [
      { id: "linear", label: "Linear", subtitle: "Units in a row", Icon: Columns3 },
      { id: "l-shape", label: "L-shape", Icon: PanelTop },
      { id: "stacked", label: "Stacked", subtitle: "Units on top of each other", Icon: ArrowUpDown },
      { id: "courtyard", label: "Courtyard", subtitle: "Units around a shared courtyard", Icon: LayoutGrid },
    ];
    if (propertyType === "FOURPLEX") {
      opts.push({ id: "2x2-grid", label: "2x2 Grid", subtitle: "Two over two", Icon: Grid2X2 });
    }
    questions.push({ key: "buildingLayout", label: "Building layout", options: opts });
  }

  // Foundation
  const foundationOpts: DetailOption[] = isUSA
    ? [
        { id: "slab", label: "Slab-on-grade", Icon: Square },
        { id: "crawlspace", label: "Crawl space", Icon: Layers },
        { id: "full-basement", label: "Full basement", Icon: Warehouse },
        { id: "walkout-basement", label: "Walkout basement", Icon: DoorOpen },
        { id: "pier", label: "Pier / Post", Icon: Footprints },
      ]
    : [
        { id: "raised-slab", label: "Raised slab", subtitle: "Dalle surélevée", Icon: Square },
        { id: "raft", label: "Raft foundation", subtitle: "Radier général", Icon: Layers },
        { id: "strip", label: "Strip foundation", subtitle: "Semelle filante", Icon: Ruler },
      ];
  // Apartment may need deep foundation
  if (propertyType === "APARTMENT") {
    if (isUSA) {
      foundationOpts.push({ id: "mat", label: "Mat foundation", Icon: Square });
      foundationOpts.push({ id: "deep", label: "Deep foundation (piles)", Icon: Footprints });
    } else {
      foundationOpts.push({ id: "deep", label: "Deep foundation (pieux)", Icon: Footprints });
    }
  }
  questions.push({ key: "foundation", label: "Foundation type", options: foundationOpts });

  // Roof
  const roofOpts: DetailOption[] = isUSA
    ? [
        { id: "gable", label: "Gable" },
        { id: "hip", label: "Hip" },
        { id: "flat", label: "Flat" },
        { id: "metal-standing-seam", label: "Metal standing seam" },
      ]
    : [
        { id: "gable", label: "Gable (deux pentes)" },
        { id: "hip", label: "Hip (quatre pentes)" },
        { id: "flat", label: "Flat (toit plat)" },
        { id: "clay-tile", label: "Clay tile (tuile)" },
        { id: "metal-standing-seam", label: "Metal standing seam" },
      ];
  // Apartment defaults to flat
  if (propertyType === "APARTMENT") {
    questions.push({
      key: "roof",
      label: "Roof style",
      options: [
        { id: "flat", label: "Flat" },
        { id: "low-slope", label: "Low slope" },
        { id: "pitched", label: "Pitched" },
      ],
    });
  } else {
    questions.push({ key: "roof", label: "Roof style", options: roofOpts });
  }

  // Exterior finish
  const exteriorOpts: DetailOption[] = isUSA
    ? [
        { id: "vinyl-siding", label: "Vinyl siding" },
        { id: "brick", label: "Brick" },
        { id: "stone", label: "Stone" },
        { id: "stucco", label: "Stucco" },
        { id: "hardie-board", label: "Hardie board" },
      ]
    : [
        { id: "rendered-block", label: "Rendered block (enduit)" },
        { id: "exposed-block", label: "Exposed block" },
        { id: "cladding", label: "Cladding / Bardage" },
      ];
  questions.push({ key: "exterior", label: "Exterior finish", options: exteriorOpts });

  // Ceiling height
  questions.push({
    key: "ceilingHeight",
    label: "Ceiling height",
    options: isUSA
      ? [
          { id: "8ft", label: "Standard (8 ft)" },
          { id: "9ft", label: "9 ft" },
          { id: "10ft", label: "10 ft" },
          { id: "vaulted", label: "Vaulted (main area)" },
        ]
      : [
          { id: "2.7m", label: "Standard (2.7 m)" },
          { id: "3.0m", label: "3.0 m" },
          { id: "3.5m", label: "3.5 m" },
          { id: "double-height", label: "Double height (salon)" },
        ],
  });

  // Windows
  questions.push({
    key: "windows",
    label: "Window type",
    options: [
      { id: "standard", label: "Standard" },
      { id: "energy-efficient", label: "Energy efficient" },
      { id: "impact-rated", label: "Impact rated" },
      { id: "floor-to-ceiling", label: "Floor to ceiling" },
    ],
  });

  // ADU (SFH only)
  if (propertyType === "SFH") {
    questions.push({
      key: "adu",
      label: isUSA ? "ADU (Accessory Dwelling Unit)" : "Dependance",
      options: [
        { id: "none", label: "None" },
        { id: "studio", label: "Studio ADU" },
        { id: "1br", label: "1-bedroom ADU" },
        { id: "2br", label: "2-bedroom ADU" },
      ],
    });
    questions.push({
      key: "aduType",
      label: "ADU construction type",
      options: [
        { id: "detached", label: "Detached (separate building)" },
        { id: "garage-conversion", label: "Garage conversion" },
        { id: "basement-conversion", label: "Basement conversion" },
        { id: "attached", label: "Attached addition" },
      ],
      conditionalOn: { field: "adu", values: ["none"], negate: true },
    });
  }

  // Soundproofing (multi-unit)
  if (propertyType !== "SFH") {
    questions.push({
      key: "soundproofing",
      label: "Soundproofing",
      options: [
        { id: "standard", label: "Standard", subtitle: "Code minimum insulation" },
        { id: "enhanced", label: "Enhanced", subtitle: "Extra insulation + resilient channels" },
      ],
    });
  }

  // Entrances (multi-unit, not apartment)
  if (propertyType === "DUPLEX") {
    questions.push({
      key: "entrances",
      label: "Entrances",
      options: [
        { id: "separate", label: "Separate entrances" },
        { id: "shared-foyer", label: "Shared foyer" },
      ],
    });
  }
  if (propertyType === "TRIPLEX" || propertyType === "FOURPLEX") {
    questions.push({
      key: "entrances",
      label: "Entrances",
      options: [
        { id: "all-exterior", label: "All exterior" },
        { id: "shared-hallway", label: "Shared hallway" },
        { id: "mixed", label: "Mixed" },
      ],
    });
  }

  // Apartment-specific
  if (propertyType === "APARTMENT") {
    questions.push({
      key: "stairwell",
      label: "Stairwell",
      options: [
        { id: "single", label: "Single stairwell" },
        { id: "dual", label: "Dual stairwells" },
        { id: "exterior", label: "Exterior stairs" },
      ],
    });
    questions.push({
      key: "elevator",
      label: "Elevator",
      options: [
        { id: "none", label: "None" },
        { id: "single", label: "Single elevator" },
        { id: "ada", label: "ADA-compliant elevator" },
      ],
    });
    questions.push({
      key: "adaCompliance",
      label: "ADA / Accessibility",
      options: [
        { id: "none", label: "None" },
        { id: "ground-floor", label: "Ground floor accessible" },
        { id: "all-floors", label: "All floors accessible" },
      ],
    });
    questions.push({
      key: "fireSystem",
      label: "Fire protection",
      options: [
        { id: "extinguishers", label: "Extinguishers only" },
        { id: "sprinklered", label: "Sprinkler system" },
        { id: "alarm-sprinkler", label: "Alarm + sprinkler" },
      ],
    });
    questions.push({
      key: "commercialGround",
      label: "Commercial ground floor",
      options: [
        { id: "no", label: "No — all residential" },
        { id: "yes", label: "Yes — retail-ready shell" },
      ],
    });
  }

  return questions;
}

// --- INTERIOR OPTIONS ---

export function getInteriorQuestions(
  propertyType: PropertyType,
  market: MarketType | "",
): DetailQuestion[] {
  const isUSA = market === "USA";
  const isMultiUnit = propertyType !== "SFH";
  const isApartment = propertyType === "APARTMENT";
  const questions: DetailQuestion[] = [];

  questions.push({
    key: "kitchenStyle",
    label: "Kitchen layout",
    options: [
      { id: "open-concept", label: "Open concept" },
      { id: "galley", label: "Galley" },
      { id: "l-shape", label: "L-shape" },
      { id: "u-shape", label: "U-shape" },
      { id: "island", label: "Island kitchen" },
    ],
  });

  questions.push({
    key: "kitchenFinish",
    label: "Kitchen finish level",
    options: [
      { id: "standard", label: "Standard", subtitle: "Laminate counters, stock cabinets" },
      { id: "mid-range", label: "Mid-range", subtitle: "Granite/quartz, semi-custom cabinets" },
      { id: "high-end", label: "High-end", subtitle: "Stone, custom cabinets, premium appliances" },
    ],
  });

  questions.push({
    key: "primaryBath",
    label: "Primary bathroom",
    options: [
      { id: "tub-shower-combo", label: "Tub + shower combo" },
      { id: "walk-in-shower", label: "Walk-in shower" },
      { id: "double-vanity", label: "Double vanity + shower" },
      { id: "soaking-tub", label: "Soaking tub + separate shower" },
    ],
  });

  questions.push({
    key: "secondaryBath",
    label: "Secondary bathrooms",
    options: [
      { id: "full", label: "Full bath (tub + shower)" },
      { id: "three-quarter", label: "3/4 bath (shower only)" },
      { id: "half", label: "Half bath (toilet + sink)" },
    ],
  });

  questions.push({
    key: "flooring",
    label: "Primary flooring",
    options: isUSA
      ? [
          { id: "hardwood", label: "Hardwood" },
          { id: "lvp", label: "LVP (Luxury Vinyl Plank)" },
          { id: "tile", label: "Tile" },
          { id: "polished-concrete", label: "Polished concrete" },
        ]
      : [
          { id: "tile", label: "Tile (carrelage)" },
          { id: "polished-concrete", label: "Polished concrete" },
          { id: "terrazzo", label: "Terrazzo" },
        ],
  });

  questions.push({
    key: "laundry",
    label: "Laundry setup",
    options: isUSA
      ? [
          { id: "in-unit-closet", label: "In-unit closet" },
          { id: "dedicated-room", label: "Dedicated laundry room" },
          { id: "hookups-only", label: "Hookups only" },
        ]
      : [
          { id: "in-unit-closet", label: "In-unit closet" },
          { id: "dedicated-room", label: "Dedicated room" },
          { id: "outdoor-washroom", label: "Outdoor washroom" },
          { id: "hookups-only", label: "Hookups only" },
        ],
  });

  questions.push({
    key: "hvac",
    label: isUSA ? "HVAC system" : "Cooling / Climate",
    options: isUSA
      ? [
          { id: "central-air", label: "Central air" },
          { id: "mini-split", label: "Mini-split (ductless)" },
          { id: "radiant-floor", label: "Radiant floor heating" },
        ]
      : [
          { id: "split-ac", label: "Split AC" },
          { id: "ceiling-fans", label: "Ceiling fans only" },
          { id: "none", label: "None (natural ventilation)" },
        ],
  });

  questions.push({
    key: "waterHeater",
    label: "Water heater",
    options: [
      { id: "tank", label: "Tank (standard)" },
      { id: "tankless", label: "Tankless (on-demand)" },
      { id: "solar", label: "Solar water heater" },
    ],
  });

  questions.push({
    key: "smartHome",
    label: "Smart home",
    options: [
      { id: "none", label: "None" },
      { id: "basic", label: "Basic", subtitle: "Smart thermostat + smart locks" },
      { id: "full", label: "Full", subtitle: "Lighting + security + automation" },
    ],
  });

  // Multi-unit additions
  if (isMultiUnit) {
    questions.push({
      key: "laundryConfig",
      label: "Laundry configuration",
      options: isApartment
        ? [
            { id: "in-unit-each", label: "In-unit (each)" },
            { id: "per-floor-shared", label: "Per-floor shared" },
            { id: "central-room", label: "Central laundry room" },
          ]
        : [
            { id: "in-unit-each", label: "In-unit (each)" },
            { id: "shared-room", label: "Shared laundry room" },
          ],
    });

    questions.push({
      key: "hvacConfig",
      label: "HVAC configuration",
      options: isApartment
        ? [
            { id: "individual-mini-split", label: "Individual mini-splits" },
            { id: "individual-central", label: "Individual central" },
            { id: "central-boiler", label: "Central boiler" },
            { id: "packaged-units", label: "Packaged units (PTAC)" },
          ]
        : [
            { id: "individual", label: "Individual systems per unit" },
            { id: "shared", label: "Shared system" },
          ],
    });

    if (!isApartment) {
      questions.push({
        key: "finishConsistency",
        label: "Finish level across units",
        options: [
          { id: "all-same", label: "All units same finishes" },
          { id: "owner-upgraded", label: "Owner unit upgraded" },
          { id: "all-different", label: "All different" },
        ],
      });
    }
  }

  // Apartment-specific
  if (isApartment) {
    questions.push({
      key: "waterHeatingConfig",
      label: "Water heating configuration",
      options: [
        { id: "individual-tank", label: "Individual tank per unit" },
        { id: "individual-tankless", label: "Individual tankless per unit" },
        { id: "central-boiler", label: "Central boiler" },
      ],
    });
    questions.push({
      key: "finishTiers",
      label: "Finish tiers",
      options: [
        { id: "all-same", label: "All units same finishes" },
        { id: "standard-premium", label: "Standard + premium units" },
      ],
    });
  }

  return questions;
}

// --- SITE & OUTDOOR OPTIONS ---

export function getSiteQuestions(
  propertyType: PropertyType,
  market: MarketType | "",
): DetailQuestion[] {
  const isUSA = market === "USA";
  const isSFH = propertyType === "SFH";
  const isApartment = propertyType === "APARTMENT";
  const isMultiSmall = propertyType === "DUPLEX" || propertyType === "TRIPLEX" || propertyType === "FOURPLEX";
  const questions: DetailQuestion[] = [];

  // Lot size — presets adapt to market
  questions.push({
    key: "lotSize",
    label: "Lot size",
    options: isUSA
      ? [
          { id: "small", label: "Small", subtitle: "Under 5,000 sqft" },
          { id: "standard", label: "Standard", subtitle: "5,000 - 7,500 sqft" },
          { id: "large", label: "Large", subtitle: "7,500 - 12,000 sqft" },
          { id: "xl", label: "Extra large", subtitle: "12,000+ sqft" },
        ]
      : [
          { id: "small", label: "Small", subtitle: "Under 300 sqm" },
          { id: "standard", label: "Standard", subtitle: "300 - 500 sqm" },
          { id: "large", label: "Large", subtitle: "500 - 800 sqm" },
          { id: "xl", label: "Extra large", subtitle: "800+ sqm" },
        ],
  });

  // Lot shape
  questions.push({
    key: "lotShape",
    label: "Lot shape",
    options: [
      { id: "rectangular", label: "Rectangular" },
      { id: "corner", label: "Corner lot" },
      { id: "irregular", label: "Irregular" },
      { id: "narrow-deep", label: "Narrow and deep" },
      { id: "wide-shallow", label: "Wide and shallow" },
      { id: "pie-shaped", label: "Pie-shaped" },
    ],
  });

  // Driveway
  questions.push({
    key: "driveway",
    label: "Driveway",
    options: isUSA
      ? [
          { id: "concrete", label: "Concrete" },
          { id: "asphalt", label: "Asphalt" },
          { id: "gravel", label: "Gravel" },
          { id: "paver", label: "Paver" },
          { id: "none", label: "None" },
        ]
      : [
          { id: "concrete", label: "Concrete" },
          { id: "laterite", label: "Laterite" },
          { id: "paver", label: "Paver (pavé)" },
          { id: "none", label: "None" },
        ],
  });

  // Landscaping
  questions.push({
    key: "landscaping",
    label: "Landscaping",
    options: isUSA
      ? [
          { id: "minimal", label: "Minimal" },
          { id: "basic", label: "Basic" },
          { id: "full", label: "Full landscaping" },
          { id: "xeriscaping", label: "Xeriscaping" },
          { id: "irrigation", label: "Irrigation system" },
        ]
      : [
          { id: "minimal", label: "Minimal" },
          { id: "courtyard-garden", label: "Courtyard garden" },
          { id: "full-grounds", label: "Full grounds" },
        ],
  });

  // Security
  questions.push({
    key: "security",
    label: "Security",
    options: isUSA
      ? [
          { id: "none", label: "None" },
          { id: "alarm", label: "Alarm system" },
          { id: "cameras", label: "Camera system" },
          { id: "gated", label: "Gated entry" },
        ]
      : [
          { id: "none", label: "None" },
          { id: "cameras", label: "Camera system" },
          { id: "perimeter-wall", label: "Perimeter wall" },
          { id: "security-post", label: "Security post" },
          { id: "guard-house", label: "Guard house" },
        ],
  });

  // SFH-specific
  if (isSFH) {
    questions.push({
      key: "garage",
      label: "Garage",
      options: [
        { id: "none", label: "None" },
        { id: "attached-single", label: "Attached single" },
        { id: "attached-double", label: "Attached double" },
        { id: "detached-single", label: "Detached single" },
        { id: "detached-double", label: "Detached double" },
      ],
    });

    questions.push({
      key: "outdoorLiving",
      label: "Outdoor living",
      multiSelect: true,
      options: isUSA
        ? [
            { id: "front-porch", label: "Front porch" },
            { id: "back-patio", label: "Back patio" },
            { id: "deck", label: "Deck" },
            { id: "wraparound", label: "Wraparound porch" },
            { id: "screened-porch", label: "Screened porch" },
            { id: "pergola", label: "Pergola" },
            { id: "balcony", label: "Balcony" },
          ]
        : [
            { id: "veranda-front", label: "Front veranda" },
            { id: "veranda-back", label: "Back veranda" },
            { id: "terrace", label: "Terrace" },
            { id: "balcony", label: "Balcony" },
            { id: "pergola", label: "Pergola" },
          ],
    });

    questions.push({
      key: "fencing",
      label: "Fencing",
      options: isUSA
        ? [
            { id: "none", label: "None" },
            { id: "privacy", label: "Privacy fence" },
            { id: "chain-link", label: "Chain link" },
            { id: "wrought-iron", label: "Wrought iron" },
          ]
        : [
            { id: "perimeter-wall", label: "Perimeter wall (parpaing)" },
            { id: "block-wall", label: "Block wall" },
            { id: "hedging", label: "Hedging" },
          ],
    });
  }

  // Multi-unit parking
  if (isMultiSmall) {
    questions.push({
      key: "parking",
      label: "Parking",
      options: propertyType === "DUPLEX"
        ? [
            { id: "shared-driveway", label: "Shared driveway" },
            { id: "individual-driveways", label: "Individual driveways" },
            { id: "garage-per-unit", label: "Garage per unit" },
            { id: "carport", label: "Carport" },
          ]
        : [
            { id: "surface", label: "Surface spots" },
            { id: "carport", label: "Carport" },
            { id: "tuck-under", label: "Tuck-under garage" },
            { id: "garage-per-unit", label: "Garage per unit" },
            { id: "shared-lot", label: "Shared lot" },
          ],
    });

    if (propertyType !== "DUPLEX") {
      questions.push({
        key: "parkingRatio",
        label: "Parking ratio",
        options: [
          { id: "1", label: "1 per unit" },
          { id: "1.5", label: "1.5 per unit" },
          { id: "2", label: "2 per unit" },
        ],
      });
    }

    questions.push({
      key: "outdoorSpace",
      label: "Outdoor space",
      options: propertyType === "DUPLEX"
        ? [
            { id: "shared-yard", label: "Shared yard" },
            { id: "divided-yard", label: "Divided yard" },
            { id: "individual-patios", label: "Individual patios" },
            { id: "balconies", label: "Balconies" },
          ]
        : [
            { id: "individual-patios", label: "Individual patios" },
            { id: "shared-courtyard", label: "Shared courtyard" },
            { id: "balconies", label: "Balconies" },
            { id: "rooftop", label: "Rooftop space" },
          ],
    });

    questions.push({
      key: "trash",
      label: "Trash",
      options: [
        { id: "individual-curbside", label: "Individual curbside" },
        { id: "shared-enclosure", label: "Shared enclosure" },
      ],
    });

    questions.push({
      key: "mailbox",
      label: "Mailbox",
      options: [
        { id: "individual", label: "Individual" },
        { id: "cluster", label: "Cluster box" },
      ],
    });
  }

  // Apartment-specific
  if (isApartment) {
    questions.push({
      key: "parking",
      label: "Parking",
      options: [
        { id: "surface-lot", label: "Surface lot" },
        { id: "covered-carport", label: "Covered carport" },
        { id: "tuck-under", label: "Tuck-under structure" },
        { id: "parking-garage", label: "Parking garage" },
        { id: "none", label: "None" },
      ],
    });

    questions.push({
      key: "parkingRatio",
      label: "Parking ratio",
      options: [
        { id: "0.5", label: "0.5 per unit" },
        { id: "1", label: "1 per unit" },
        { id: "1.5", label: "1.5 per unit" },
        { id: "2", label: "2 per unit" },
      ],
    });

    questions.push({
      key: "commonOutdoor",
      label: "Common outdoor areas",
      multiSelect: true,
      options: [
        { id: "courtyard", label: "Courtyard" },
        { id: "rooftop-deck", label: "Rooftop deck" },
        { id: "pool", label: "Pool" },
        { id: "playground", label: "Playground" },
        { id: "dog-run", label: "Dog run" },
      ],
    });

    questions.push({
      key: "buildingAccess",
      label: "Building access",
      options: [
        { id: "open", label: "Open" },
        { id: "keyed", label: "Keyed entry" },
        { id: "buzzer", label: "Buzzer / Intercom" },
        { id: "key-fob", label: "Key fob" },
        { id: "smart-lock", label: "Smart lock" },
      ],
    });

    questions.push({
      key: "trash",
      label: "Trash",
      options: [
        { id: "shared-dumpster", label: "Shared dumpster enclosure" },
        { id: "compactor", label: "Compactor" },
        { id: "chute", label: "In-building chute" },
      ],
    });

    questions.push({
      key: "mailbox",
      label: "Mailbox",
      options: [
        { id: "cluster", label: "Cluster box" },
        { id: "mail-room", label: "Mail room" },
      ],
    });

    questions.push({
      key: "onSiteManagement",
      label: "On-site management",
      options: [
        { id: "none", label: "None" },
        { id: "office", label: "Office space included" },
        { id: "live-in", label: "Live-in manager unit" },
      ],
    });
  }

  return questions;
}

// --- UNIT CONFIG OPTIONS ---

export function getUnitConfigQuestions(
  propertyType: PropertyType,
  market: MarketType | "",
): DetailQuestion[] {
  if (propertyType === "SFH") return [];

  const isDuplex = propertyType === "DUPLEX";
  const isTriplex = propertyType === "TRIPLEX";
  const isFourplex = propertyType === "FOURPLEX";
  const isApartment = propertyType === "APARTMENT";
  const questions: DetailQuestion[] = [];

  // Unit similarity (duplex only)
  if (isDuplex) {
    questions.push({
      key: "unitSimilarity",
      label: "Unit similarity",
      options: [
        { id: "identical", label: "Identical units" },
        { id: "mirrored", label: "Mirrored layout" },
        { id: "different", label: "Different sizes" },
      ],
    });
  }

  // Unit mix
  const mixOptions: DetailOption[] = isDuplex
    ? [
        { id: "2x-2br-2ba", label: "2x 2BR / 2BA" },
        { id: "2x-2br-1ba", label: "2x 2BR / 1BA" },
        { id: "3br-2ba-1br-1ba", label: "1x 3BR/2BA + 1x 1BR/1BA" },
        { id: "3br-2ba-2br-1ba", label: "1x 3BR/2BA + 1x 2BR/1BA" },
      ]
    : isTriplex
    ? [
        { id: "3x-2br-1ba", label: "3x 2BR / 1BA" },
        { id: "2x-2br-1x-1br", label: "2x 2BR + 1x 1BR" },
        { id: "1x-3br-2x-1br", label: "1x 3BR + 2x 1BR" },
        { id: "2x-2br-1x-studio", label: "2x 2BR + 1x Studio" },
      ]
    : isFourplex
    ? [
        { id: "4x-2br-1ba", label: "4x 2BR / 1BA" },
        { id: "2x-2br-2x-1br", label: "2x 2BR + 2x 1BR" },
        { id: "1x-3br-3x-1br", label: "1x 3BR + 3x 1BR" },
        { id: "2x-2br-2x-studio", label: "2x 2BR + 2x Studio" },
      ]
    : [ // Apartment
        { id: "all-1br", label: "All 1BR / 1BA" },
        { id: "all-2br", label: "All 2BR / 1BA" },
        { id: "mix-1br-2br", label: "Mix 1BR + 2BR" },
        { id: "mix-studio-1br-2br", label: "Mix Studio + 1BR + 2BR" },
        { id: "mix-1br-2br-3br", label: "Mix 1BR + 2BR + 3BR" },
      ];

  questions.push({ key: "unitMix", label: "Unit mix", options: mixOptions });

  // Mix ratio (apartment, when mixed)
  if (isApartment) {
    questions.push({
      key: "mixRatio",
      label: "Mix ratio",
      options: [
        { id: "mostly-smaller", label: "Mostly smaller units" },
        { id: "even-split", label: "Even split" },
        { id: "mostly-larger", label: "Mostly larger units" },
      ],
      conditionalOn: { field: "unitMix", values: ["all-1br", "all-2br"], negate: true },
    });
  }

  // Owner-occupied
  const ownerOpts: DetailOption[] = [{ id: "no", label: "No (investment only)" }];
  if (isDuplex) {
    ownerOpts.push({ id: "unit-a", label: "Yes — Unit A" }, { id: "unit-b", label: "Yes — Unit B" });
  } else if (isTriplex) {
    ownerOpts.push({ id: "unit-a", label: "Unit A" }, { id: "unit-b", label: "Unit B" }, { id: "unit-c", label: "Unit C" });
  } else if (isFourplex) {
    ownerOpts.push({ id: "unit-a", label: "Unit A" }, { id: "unit-b", label: "Unit B" },
                    { id: "unit-c", label: "Unit C" }, { id: "unit-d", label: "Unit D" });
  } else {
    ownerOpts.push({ id: "yes", label: "Yes (designate one unit)" });
  }
  questions.push({ key: "ownerOccupied", label: "Owner-occupied unit", options: ownerOpts });

  // Utilities / metering
  questions.push({
    key: "utilities",
    label: isApartment ? "Utility metering" : "Utility separation",
    options: isApartment
      ? [
          { id: "individual-all", label: "Individual all utilities" },
          { id: "sub-metered", label: "Sub-metered electric" },
          { id: "owner-pays", label: "Owner pays all" },
        ]
      : [
          { id: "all-separate", label: "All separate meters" },
          { id: "shared-water", label: "Shared water" },
          { id: "shared-electric", label: "Shared electric" },
          { id: "all-shared", label: "All shared" },
        ],
  });

  // Storage (fourplex + apartment)
  if (isFourplex || isApartment) {
    questions.push({
      key: "storage",
      label: "Storage",
      options: [
        { id: "in-unit", label: "In-unit closets" },
        { id: "shared-room", label: "Shared storage room" },
        { id: "individual-cages", label: "Individual cages / lockers" },
      ],
    });
  }

  // Common areas (apartment)
  if (isApartment) {
    questions.push({
      key: "commonAreas",
      label: "Common areas",
      multiSelect: true,
      options: [
        { id: "lobby", label: "Lobby" },
        { id: "mail-room", label: "Mail room" },
        { id: "package-room", label: "Package room" },
        { id: "laundry", label: "Laundry room" },
        { id: "fitness", label: "Fitness room" },
        { id: "community", label: "Community room" },
      ],
    });
  }

  // Management
  if (isApartment) {
    questions.push({
      key: "management",
      label: "Management",
      options: [
        { id: "self", label: "Self-managed" },
        { id: "property-manager", label: "Property manager" },
        { id: "on-site", label: "On-site manager" },
        { id: "live-in", label: "Live-in manager" },
      ],
    });
  } else if (isTriplex || isFourplex) {
    questions.push({
      key: "commonMaintenance",
      label: "Common area maintenance",
      options: [
        { id: "owner-managed", label: "Owner-managed" },
        { id: "property-manager", label: "Property manager" },
        { id: "hoa", label: "HOA" },
      ],
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Smart defaults — pre-selected values per market + property type + goal
// ---------------------------------------------------------------------------

export function getSmartDefaults(
  propertyType: PropertyType,
  market: MarketType | "",
  goal: BuildGoal,
): {
  structure: Partial<StructureSelections>;
  interior: Partial<InteriorSelections>;
  site: Partial<SiteSelections>;
  unitConfig: Partial<UnitConfigSelections>;
} {
  const isUSA = market === "USA";

  const structure: Partial<StructureSelections> = {
    foundation: isUSA ? "slab" : "raised-slab",
    roof: propertyType === "APARTMENT" ? "flat" : isUSA ? "gable" : "clay-tile",
    exterior: isUSA ? "vinyl-siding" : "rendered-block",
    ceilingHeight: isUSA ? "9ft" : "2.7m",
    windows: isUSA ? "energy-efficient" : "standard",
    adu: "none",
    soundproofing: propertyType === "SFH" ? "" : "standard",
    elevator: "none",
    adaCompliance: "none",
    fireSystem: "extinguishers",
    commercialGround: "no",
  };

  if (propertyType === "SFH") {
    structure.layout = isUSA ? "single-story" : "single-story";
  } else if (propertyType === "DUPLEX") {
    structure.buildingLayout = "side-by-side";
    structure.entrances = "separate";
  } else if (propertyType === "TRIPLEX" || propertyType === "FOURPLEX") {
    structure.buildingLayout = "linear";
    structure.entrances = "all-exterior";
  } else {
    structure.floors = 3;
    structure.stairwell = "dual";
  }

  const interior: Partial<InteriorSelections> = {
    kitchenStyle: "open-concept",
    kitchenFinish: goal === "rent" ? "standard" : "mid-range",
    primaryBath: "tub-shower-combo",
    secondaryBath: "full",
    flooring: isUSA ? "lvp" : "tile",
    laundry: isUSA ? "dedicated-room" : "outdoor-washroom",
    hvac: isUSA ? "central-air" : "split-ac",
    waterHeater: "tank",
    smartHome: isUSA ? "basic" : "none",
    laundryConfig: propertyType === "APARTMENT" ? "central-room" : "in-unit-each",
    hvacConfig: propertyType === "APARTMENT" ? "individual-mini-split" : "individual",
    finishConsistency: "all-same",
    waterHeatingConfig: "individual-tank",
    finishTiers: "all-same",
  };

  const site: Partial<SiteSelections> = {
    lotSize: "standard",
    lotShape: "rectangular",
    driveway: isUSA ? "concrete" : "concrete",
    landscaping: isUSA ? "basic" : "courtyard-garden",
    security: isUSA ? "alarm" : "perimeter-wall",
    garage: propertyType === "SFH" ? (isUSA ? "attached-double" : "none") : "",
    outdoorLiving: isUSA ? ["back-patio"] : ["veranda-front"],
    fencing: isUSA ? "privacy" : "perimeter-wall",
    parking: propertyType === "APARTMENT" ? "surface-lot" : (propertyType === "DUPLEX" ? "shared-driveway" : "surface"),
    parkingRatio: "1",
    outdoorSpace: "shared-courtyard",
    mailbox: "individual",
    trash: isUSA ? "individual-curbside" : "shared-enclosure",
    buildingAccess: "keyed",
    commonOutdoor: ["courtyard"],
    onSiteManagement: "none",
  };

  const unitConfig: Partial<UnitConfigSelections> = {
    unitSimilarity: "identical",
    unitMix: propertyType === "DUPLEX" ? "2x-2br-1ba"
      : propertyType === "TRIPLEX" ? "3x-2br-1ba"
      : propertyType === "FOURPLEX" ? "4x-2br-1ba"
      : "mix-1br-2br",
    mixRatio: "even-split",
    ownerOccupied: goal === "occupy" ? "unit-a" : "no",
    utilities: propertyType === "APARTMENT" ? "individual-all" : "all-separate",
    metering: "individual-all",
    storage: "in-unit",
    commonAreas: propertyType === "APARTMENT" ? ["lobby", "mail-room", "laundry"] : [],
    commonMaintenance: "owner-managed",
    unitCount: propertyType === "APARTMENT" ? 8 : (propertyType === "FOURPLEX" ? 4 : propertyType === "TRIPLEX" ? 3 : 2),
    management: goal === "rent" ? "property-manager" : "self",
  };

  return { structure, interior, site, unitConfig };
}

// ---------------------------------------------------------------------------
// Unit mix parsing — extract unit breakdown from template ID
// ---------------------------------------------------------------------------

export interface UnitBreakdown {
  type: string;       // "studio" | "1br" | "2br" | "3br"
  bedrooms: number;
  bathrooms: number;
  count: number;
  avgSqft: number;    // USA
  avgSqm: number;     // WA
}

const UNIT_SIZE_DEFAULTS: Record<string, { sqft: number; sqm: number }> = {
  studio: { sqft: 400, sqm: 35 },
  "1br": { sqft: 650, sqm: 60 },
  "2br": { sqft: 900, sqm: 85 },
  "3br": { sqft: 1200, sqm: 110 },
};

export function parseUnitMix(
  propertyType: PropertyType,
  unitMix: string,
  unitCount: number,
  mixRatio: string,
): UnitBreakdown[] {
  // Parse based on the template ID
  const mixMap: Record<string, UnitBreakdown[]> = {
    // Duplex
    "2x-2br-2ba": [{ type: "2br", bedrooms: 2, bathrooms: 2, count: 2, avgSqft: 900, avgSqm: 85 }],
    "2x-2br-1ba": [{ type: "2br", bedrooms: 2, bathrooms: 1, count: 2, avgSqft: 900, avgSqm: 85 }],
    "3br-2ba-1br-1ba": [
      { type: "3br", bedrooms: 3, bathrooms: 2, count: 1, avgSqft: 1200, avgSqm: 110 },
      { type: "1br", bedrooms: 1, bathrooms: 1, count: 1, avgSqft: 650, avgSqm: 60 },
    ],
    "3br-2ba-2br-1ba": [
      { type: "3br", bedrooms: 3, bathrooms: 2, count: 1, avgSqft: 1200, avgSqm: 110 },
      { type: "2br", bedrooms: 2, bathrooms: 1, count: 1, avgSqft: 900, avgSqm: 85 },
    ],
    // Triplex
    "3x-2br-1ba": [{ type: "2br", bedrooms: 2, bathrooms: 1, count: 3, avgSqft: 900, avgSqm: 85 }],
    "2x-2br-1x-1br": [
      { type: "2br", bedrooms: 2, bathrooms: 1, count: 2, avgSqft: 900, avgSqm: 85 },
      { type: "1br", bedrooms: 1, bathrooms: 1, count: 1, avgSqft: 650, avgSqm: 60 },
    ],
    "1x-3br-2x-1br": [
      { type: "3br", bedrooms: 3, bathrooms: 2, count: 1, avgSqft: 1200, avgSqm: 110 },
      { type: "1br", bedrooms: 1, bathrooms: 1, count: 2, avgSqft: 650, avgSqm: 60 },
    ],
    "2x-2br-1x-studio": [
      { type: "2br", bedrooms: 2, bathrooms: 1, count: 2, avgSqft: 900, avgSqm: 85 },
      { type: "studio", bedrooms: 0, bathrooms: 1, count: 1, avgSqft: 400, avgSqm: 35 },
    ],
    // Fourplex
    "4x-2br-1ba": [{ type: "2br", bedrooms: 2, bathrooms: 1, count: 4, avgSqft: 900, avgSqm: 85 }],
    "2x-2br-2x-1br": [
      { type: "2br", bedrooms: 2, bathrooms: 1, count: 2, avgSqft: 900, avgSqm: 85 },
      { type: "1br", bedrooms: 1, bathrooms: 1, count: 2, avgSqft: 650, avgSqm: 60 },
    ],
    "1x-3br-3x-1br": [
      { type: "3br", bedrooms: 3, bathrooms: 2, count: 1, avgSqft: 1200, avgSqm: 110 },
      { type: "1br", bedrooms: 1, bathrooms: 1, count: 3, avgSqft: 650, avgSqm: 60 },
    ],
    "2x-2br-2x-studio": [
      { type: "2br", bedrooms: 2, bathrooms: 1, count: 2, avgSqft: 900, avgSqm: 85 },
      { type: "studio", bedrooms: 0, bathrooms: 1, count: 2, avgSqft: 400, avgSqm: 35 },
    ],
  };

  // Static mixes for defined property types
  const staticResult = mixMap[unitMix];
  if (staticResult) return staticResult;

  // Apartment mixes — dynamic based on unitCount + mixRatio
  if (propertyType === "APARTMENT") {
    return buildApartmentMix(unitMix, unitCount, mixRatio);
  }

  // Fallback: all 2BR
  const fallbackCount = propertyType === "DUPLEX" ? 2 : propertyType === "TRIPLEX" ? 3 : 4;
  return [{ type: "2br", bedrooms: 2, bathrooms: 1, count: fallbackCount, avgSqft: 900, avgSqm: 85 }];
}

function buildApartmentMix(mixTemplate: string, unitCount: number, mixRatio: string): UnitBreakdown[] {
  // Determine split ratios
  const ratioMultiplier = mixRatio === "mostly-smaller" ? 0.65
    : mixRatio === "mostly-larger" ? 0.35
    : 0.5;

  switch (mixTemplate) {
    case "all-1br":
      return [{ type: "1br", bedrooms: 1, bathrooms: 1, count: unitCount, avgSqft: 650, avgSqm: 60 }];
    case "all-2br":
      return [{ type: "2br", bedrooms: 2, bathrooms: 1, count: unitCount, avgSqft: 900, avgSqm: 85 }];
    case "mix-1br-2br": {
      const smallCount = Math.round(unitCount * ratioMultiplier);
      const largeCount = unitCount - smallCount;
      return [
        { type: "1br", bedrooms: 1, bathrooms: 1, count: smallCount, avgSqft: 650, avgSqm: 60 },
        { type: "2br", bedrooms: 2, bathrooms: 1, count: largeCount, avgSqft: 900, avgSqm: 85 },
      ].filter(u => u.count > 0);
    }
    case "mix-studio-1br-2br": {
      const studioCount = Math.max(1, Math.round(unitCount * 0.25));
      const remaining = unitCount - studioCount;
      const onebrCount = Math.round(remaining * ratioMultiplier);
      const twobrCount = remaining - onebrCount;
      return [
        { type: "studio", bedrooms: 0, bathrooms: 1, count: studioCount, avgSqft: 400, avgSqm: 35 },
        { type: "1br", bedrooms: 1, bathrooms: 1, count: onebrCount, avgSqft: 650, avgSqm: 60 },
        { type: "2br", bedrooms: 2, bathrooms: 1, count: twobrCount, avgSqft: 900, avgSqm: 85 },
      ].filter(u => u.count > 0);
    }
    case "mix-1br-2br-3br": {
      const threebrCount = Math.max(1, Math.round(unitCount * 0.2));
      const remaining = unitCount - threebrCount;
      const onebrCount = Math.round(remaining * ratioMultiplier);
      const twobrCount = remaining - onebrCount;
      return [
        { type: "1br", bedrooms: 1, bathrooms: 1, count: onebrCount, avgSqft: 650, avgSqm: 60 },
        { type: "2br", bedrooms: 2, bathrooms: 1, count: twobrCount, avgSqft: 900, avgSqm: 85 },
        { type: "3br", bedrooms: 3, bathrooms: 2, count: threebrCount, avgSqft: 1200, avgSqm: 110 },
      ].filter(u => u.count > 0);
    }
    default:
      return [{ type: "2br", bedrooms: 2, bathrooms: 1, count: unitCount, avgSqft: 900, avgSqm: 85 }];
  }
}

// ---------------------------------------------------------------------------
// Helper: check if Unit Config step should be shown
// ---------------------------------------------------------------------------

export function needsUnitConfig(propertyType: PropertyType | ""): boolean {
  return propertyType === "DUPLEX" || propertyType === "TRIPLEX"
    || propertyType === "FOURPLEX" || propertyType === "APARTMENT";
}

// ---------------------------------------------------------------------------
// Lot size sqft/sqm lookup for calculations
// ---------------------------------------------------------------------------

export function getLotSizeValue(lotSize: string, market: MarketType | ""): number {
  const isUSA = market === "USA";
  const map: Record<string, { sqft: number; sqm: number }> = {
    small: { sqft: 4000, sqm: 250 },
    standard: { sqft: 6250, sqm: 400 },
    large: { sqft: 9500, sqm: 650 },
    xl: { sqft: 14000, sqm: 1000 },
  };
  const entry = map[lotSize];
  if (!entry) return isUSA ? 6250 : 400;
  return isUSA ? entry.sqft : entry.sqm;
}

export function getLotShapeMultiplier(lotShape: string): number {
  const map: Record<string, number> = {
    rectangular: 1.0,
    corner: 1.02,
    irregular: 1.15,
    "narrow-deep": 1.08,
    "wide-shallow": 1.05,
    "pie-shaped": 1.12,
  };
  return map[lotShape] ?? 1.0;
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/config/property-details-config.ts
git commit -m "feat: add property details configuration with types, options, and smart defaults"
```

---

## Task 2: Create the Detailed Cost Engine

**Files:**
- Create: `apps/web/src/lib/config/detailed-cost-engine.ts`

This replaces the inline cost functions in the wizard with a full line-item calculator.

**Step 1: Create the cost engine**

```typescript
// apps/web/src/lib/config/detailed-cost-engine.ts

import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import type {
  StructureSelections,
  InteriorSelections,
  SiteSelections,
  UnitConfigSelections,
  UnitBreakdown,
} from "./property-details-config";
import { parseUnitMix, getLotSizeValue, getLotShapeMultiplier } from "./property-details-config";

type PropertyType = "SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT";

// ---------------------------------------------------------------------------
// Detailed cost breakdown interfaces
// ---------------------------------------------------------------------------

export interface CostLineItem {
  label: string;
  amount: number;
  formula?: string;     // human-readable formula for transparency
  category: string;     // groups items for budget page
}

export interface DetailedCostBreakdown {
  lineItems: CostLineItem[];
  siteWork: number;
  foundation: number;
  framing: number;
  exterior: number;
  interior: number;
  mechanical: number;
  specialItems: number;
  parking: number;
  commonAreas: number;
  softCosts: number;
  contingency: number;
  land: number;
  financing: number;
  totalHardCosts: number;
  totalSoftCosts: number;
  grandTotal: number;
}

export interface RevenueProjection {
  units: {
    type: string;
    count: number;
    avgSize: number;
    unit: "sqft" | "sqm";
    marketRent: number;
  }[];
  grossMonthlyRent: number;
  vacancyAllowance: number;
  effectiveGrossIncome: number;
  operatingExpenses: {
    management: number;
    ownerPaidUtilities: number;
    commonAreaMaintenance: number;
    insurance: number;
    reserves: number;
    total: number;
  };
  netOperatingIncome: number;
  annualNOI: number;
  capRate: number;
  monthlyDebtService: number;
  monthlyCashFlow: number;
  cashOnCashReturn: number;
}

// ---------------------------------------------------------------------------
// Market-specific cost tables
// ---------------------------------------------------------------------------

// Per-unit costs indexed by selection ID
// USA values in USD, WA values in XOF (CFA), Ghana in GHS

interface MarketCosts {
  foundation: Record<string, number>;       // per sqft/sqm
  roof: Record<string, number>;             // per sqft/sqm
  exterior: Record<string, number>;         // per sqft/sqm
  flooring: Record<string, number>;         // per sqft/sqm
  kitchen: { base: Record<string, number>; finishMultiplier: Record<string, number> };
  bath: Record<string, number>;             // fixture package
  hvac: Record<string, number>;             // system cost
  waterHeater: Record<string, number>;      // unit cost
  garage: Record<string, number>;           // flat cost
  parking: Record<string, number>;          // per space
  windows: Record<string, number>;          // per window
  elevator: Record<string, number>;         // flat cost
  fireSystem: Record<string, number>;       // per sqft/sqm
  security: Record<string, number>;         // system cost
  smartHome: Record<string, number>;        // package cost
  landscaping: Record<string, number>;      // per sqft/sqm
  driveway: Record<string, number>;         // per sqft/sqm
  fencing: Record<string, number>;          // per linear ft/m
  soundproofing: Record<string, number>;    // per sqft/sqm of shared surface
  ceilingHeight: Record<string, number>;    // multiplier (not cost)
  adu: Record<string, { perUnit: number; connection: number }>;
  outdoorLiving: Record<string, number>;    // per feature
  commonArea: Record<string, number>;       // per area
  accessSystem: Record<string, number>;     // per system
  trashSystem: Record<string, number>;      // per system
}

const USA_COSTS: MarketCosts = {
  foundation: {
    slab: 8, crawlspace: 12, "full-basement": 25, "walkout-basement": 30,
    pier: 6, mat: 15, deep: 35,
  },
  roof: { gable: 5.5, hip: 6.5, flat: 4, "metal-standing-seam": 9 },
  exterior: {
    "vinyl-siding": 5, brick: 12, stone: 18, stucco: 8, "hardie-board": 9,
  },
  flooring: { hardwood: 8, lvp: 3.5, tile: 6, "polished-concrete": 5 },
  kitchen: {
    base: { "open-concept": 8000, galley: 6000, "l-shape": 7000, "u-shape": 9000, island: 12000 },
    finishMultiplier: { standard: 1, "mid-range": 1.5, "high-end": 2.5 },
  },
  bath: {
    "tub-shower-combo": 3000, "walk-in-shower": 5000,
    "double-vanity": 6000, "soaking-tub": 8000,
    full: 3500, "three-quarter": 2500, half: 1800,
  },
  hvac: { "central-air": 12000, "mini-split": 4500, "radiant-floor": 18000 },
  waterHeater: { tank: 1200, tankless: 3000, solar: 5000 },
  garage: {
    none: 0, "attached-single": 15000, "attached-double": 25000,
    "detached-single": 20000, "detached-double": 35000,
  },
  parking: {
    "surface-lot": 3000, "covered-carport": 6000, "tuck-under": 15000,
    "parking-garage": 25000, "shared-driveway": 2000, "individual-driveways": 3500,
    "garage-per-unit": 18000, carport: 5000, surface: 3000, "shared-lot": 2500,
    none: 0,
  },
  windows: { standard: 350, "energy-efficient": 550, "impact-rated": 800, "floor-to-ceiling": 1200 },
  elevator: { none: 0, single: 60000, ada: 90000 },
  fireSystem: { extinguishers: 0.5, sprinklered: 3, "alarm-sprinkler": 4.5 },
  security: { none: 0, alarm: 2000, cameras: 3500, gated: 8000 },
  smartHome: { none: 0, basic: 2500, full: 12000 },
  landscaping: { minimal: 1.5, basic: 3, full: 6, xeriscaping: 4.5, irrigation: 5 },
  driveway: { concrete: 8, asphalt: 5, gravel: 2, paver: 12, none: 0 },
  fencing: {
    none: 0, privacy: 25, "chain-link": 12, "wrought-iron": 35,
    "perimeter-wall": 0, "block-wall": 0, hedging: 0,
  },
  soundproofing: { standard: 0, enhanced: 3 },
  ceilingHeight: { "8ft": 1.0, "9ft": 1.04, "10ft": 1.08, vaulted: 1.12 },
  adu: {
    studio: { perUnit: 120, connection: 8000 },
    "1br": { perUnit: 130, connection: 10000 },
    "2br": { perUnit: 135, connection: 12000 },
  },
  outdoorLiving: {
    "front-porch": 4000, "back-patio": 5000, deck: 6000, wraparound: 12000,
    "screened-porch": 10000, pergola: 5000, balcony: 4000,
    "veranda-front": 4000, "veranda-back": 5000, terrace: 5000,
  },
  commonArea: {
    lobby: 15000, "mail-room": 5000, "package-room": 8000,
    laundry: 12000, fitness: 20000, community: 18000,
  },
  accessSystem: { open: 0, keyed: 500, buzzer: 3000, "key-fob": 5000, "smart-lock": 8000 },
  trashSystem: { "individual-curbside": 0, "shared-dumpster": 3000, "shared-enclosure": 3000, compactor: 12000, chute: 15000 },
};

// West Africa costs (XOF / CFA) — used for TOGO, BENIN; Ghana has its own
const WA_COSTS: MarketCosts = {
  foundation: { "raised-slab": 35000, raft: 45000, strip: 25000, deep: 65000 },
  roof: {
    gable: 18000, hip: 22000, flat: 15000, "clay-tile": 28000,
    "metal-standing-seam": 25000, "low-slope": 16000, pitched: 20000,
  },
  exterior: { "rendered-block": 12000, "exposed-block": 5000, cladding: 20000 },
  flooring: { tile: 15000, "polished-concrete": 10000, terrazzo: 22000 },
  kitchen: {
    base: { "open-concept": 1500000, galley: 1000000, "l-shape": 1200000, "u-shape": 1800000, island: 2500000 },
    finishMultiplier: { standard: 1, "mid-range": 1.4, "high-end": 2.2 },
  },
  bath: {
    "tub-shower-combo": 400000, "walk-in-shower": 700000,
    "double-vanity": 900000, "soaking-tub": 1200000,
    full: 500000, "three-quarter": 350000, half: 250000,
  },
  hvac: { "split-ac": 800000, "ceiling-fans": 150000, none: 0, "central-air": 3000000, "mini-split": 600000 },
  waterHeater: { tank: 200000, tankless: 500000, solar: 800000 },
  garage: {
    none: 0, "attached-single": 2500000, "attached-double": 4500000,
    "detached-single": 3000000, "detached-double": 5500000,
  },
  parking: {
    "surface-lot": 500000, "covered-carport": 1000000, "tuck-under": 2500000,
    "parking-garage": 4000000, "shared-driveway": 300000, "individual-driveways": 500000,
    "garage-per-unit": 3000000, carport: 800000, surface: 500000, "shared-lot": 400000,
    none: 0,
  },
  windows: { standard: 50000, "energy-efficient": 80000, "impact-rated": 120000, "floor-to-ceiling": 150000 },
  elevator: { none: 0, single: 12000000, ada: 18000000 },
  fireSystem: { extinguishers: 500, sprinklered: 5000, "alarm-sprinkler": 8000 },
  security: {
    none: 0, cameras: 500000, "perimeter-wall": 2000000,
    "security-post": 1500000, "guard-house": 3000000, alarm: 400000, gated: 1500000,
  },
  smartHome: { none: 0, basic: 400000, full: 2000000 },
  landscaping: { minimal: 2000, "courtyard-garden": 5000, "full-grounds": 10000 },
  driveway: { concrete: 12000, laterite: 5000, paver: 18000, none: 0 },
  fencing: {
    "perimeter-wall": 40000, "block-wall": 30000, hedging: 8000,
    none: 0, privacy: 0, "chain-link": 0, "wrought-iron": 0,
  },
  soundproofing: { standard: 0, enhanced: 5000 },
  ceilingHeight: { "2.7m": 1.0, "3.0m": 1.05, "3.5m": 1.12, "double-height": 1.25 },
  adu: {
    studio: { perUnit: 200000, connection: 1500000 },
    "1br": { perUnit: 220000, connection: 2000000 },
    "2br": { perUnit: 240000, connection: 2500000 },
  },
  outdoorLiving: {
    "veranda-front": 800000, "veranda-back": 1000000, terrace: 1000000,
    balcony: 600000, pergola: 800000,
    "front-porch": 800000, "back-patio": 1000000, deck: 1200000,
    wraparound: 2000000, "screened-porch": 1500000,
  },
  commonArea: {
    lobby: 3000000, "mail-room": 800000, "package-room": 1200000,
    laundry: 2500000, fitness: 4000000, community: 3500000,
  },
  accessSystem: { open: 0, keyed: 100000, buzzer: 500000, "key-fob": 800000, "smart-lock": 1200000 },
  trashSystem: { "individual-curbside": 0, "shared-dumpster": 500000, "shared-enclosure": 500000, compactor: 2000000, chute: 3000000 },
};

function getCosts(market: MarketType | ""): MarketCosts {
  if (market === "USA") return USA_COSTS;
  // Ghana uses WA costs with a GHS conversion factor applied at the market-data level
  return WA_COSTS;
}

// ---------------------------------------------------------------------------
// ADU size defaults (sqft/sqm)
// ---------------------------------------------------------------------------

const ADU_SIZES: Record<string, { sqft: number; sqm: number }> = {
  studio: { sqft: 400, sqm: 35 },
  "1br": { sqft: 550, sqm: 50 },
  "2br": { sqft: 750, sqm: 70 },
};

// ---------------------------------------------------------------------------
// Main cost calculation
// ---------------------------------------------------------------------------

export function calculateDetailedCosts(
  propertyType: PropertyType,
  market: MarketType | "",
  structure: StructureSelections,
  interior: InteriorSelections,
  site: SiteSelections,
  unitConfig: UnitConfigSelections,
  locationData?: LocationData | null,
  landOption?: string,
  landPrice?: number,
  financingType?: string,
  downPaymentPct?: number,
  loanRate?: number,
  timelineMonths?: number,
): DetailedCostBreakdown {
  if (!market) {
    return emptyBreakdown();
  }

  const costs = getCosts(market);
  const isUSA = market === "USA";
  const sizeUnit = isUSA ? "sqft" : "sqm";
  const costIndex = locationData?.costIndex ?? 1.0;

  // Determine unit count and building size
  const unitBreakdown = propertyType === "SFH"
    ? null
    : parseUnitMix(propertyType, unitConfig.unitMix, unitConfig.unitCount, unitConfig.mixRatio);

  const totalUnits = unitBreakdown
    ? unitBreakdown.reduce((sum, u) => sum + u.count, 0)
    : 1;

  const buildingSqft = unitBreakdown
    ? unitBreakdown.reduce((sum, u) => sum + u.count * u.avgSqft, 0)
    : 1600; // SFH default, will be overridden by Size step

  const buildingSqm = unitBreakdown
    ? unitBreakdown.reduce((sum, u) => sum + u.count * u.avgSqm, 0)
    : 150;

  const buildingSize = isUSA ? buildingSqft : buildingSqm;
  const buildingFootprint = buildingSize / Math.max(1, structure.floors || (structure.layout === "two-story" ? 2 : 1));

  const lotSizeValue = getLotSizeValue(site.lotSize, market);
  const lotShapeMult = getLotShapeMultiplier(site.lotShape);
  const ceilingMult = costs.ceilingHeight[structure.ceilingHeight] ?? 1.0;

  const items: CostLineItem[] = [];

  // Estimate number of windows from building size
  const windowCount = Math.max(6, Math.round(buildingSize / (isUSA ? 100 : 10)));

  // --- SITE WORK ---
  const gradingCost = Math.round(buildingFootprint * (isUSA ? 4 : 8000) * lotShapeMult * costIndex);
  items.push({ label: "Grading & Site prep", amount: gradingCost, formula: `${buildingFootprint.toLocaleString()} ${sizeUnit} footprint x ${lotShapeMult}x shape`, category: "Site Preparation" });

  const drivewayCost = Math.round((isUSA ? 400 : 40) * (costs.driveway[site.driveway] ?? 0) * costIndex);
  if (drivewayCost > 0) items.push({ label: `Driveway (${site.driveway})`, amount: drivewayCost, category: "Site Preparation" });

  const fencingLinearFt = Math.round(Math.sqrt(lotSizeValue) * 4 * 0.7);
  const fencingCost = Math.round(fencingLinearFt * (costs.fencing[site.fencing] ?? 0) * costIndex);
  if (fencingCost > 0) items.push({ label: `Fencing (${site.fencing})`, amount: fencingCost, formula: `${fencingLinearFt} linear ${isUSA ? "ft" : "m"} x cost`, category: "Site Preparation" });

  const landscapeArea = Math.max(0, lotSizeValue - buildingFootprint);
  const landscapeCost = Math.round(landscapeArea * (costs.landscaping[site.landscaping] ?? 0) * costIndex);
  if (landscapeCost > 0) items.push({ label: `Landscaping (${site.landscaping})`, amount: landscapeCost, category: "Site Preparation" });

  const siteWorkTotal = gradingCost + drivewayCost + fencingCost + landscapeCost;

  // --- FOUNDATION ---
  const foundationCostPerUnit = costs.foundation[structure.foundation] ?? (isUSA ? 8 : 35000);
  const foundationCost = Math.round(buildingFootprint * foundationCostPerUnit * costIndex);
  items.push({ label: `Foundation (${structure.foundation})`, amount: foundationCost, formula: `${buildingFootprint.toLocaleString()} ${sizeUnit} x ${foundationCostPerUnit}/${sizeUnit}`, category: "Foundation" });

  // --- FRAMING ---
  const framingBase = isUSA ? 14 : 35000;
  const framingCost = Math.round(buildingSize * framingBase * ceilingMult * costIndex);
  items.push({ label: "Framing / Structure", amount: framingCost, formula: `${buildingSize.toLocaleString()} ${sizeUnit} x ${framingBase} x ${ceilingMult}x ceiling`, category: "Framing / Structure" });

  // --- ROOF ---
  const roofCostPerUnit = costs.roof[structure.roof] ?? (isUSA ? 6 : 18000);
  const roofCost = Math.round(buildingFootprint * roofCostPerUnit * costIndex);
  items.push({ label: `Roofing (${structure.roof})`, amount: roofCost, category: "Roofing" });

  // --- EXTERIOR ---
  const stories = structure.floors || (structure.layout === "two-story" ? 2 : structure.layout === "split-level" ? 1.5 : 1);
  const wallHeight = isUSA ? (stories * 9) : (stories * 2.8); // feet or meters
  const perimeter = Math.sqrt(buildingFootprint) * 4;
  const exteriorSqUnits = Math.round(perimeter * wallHeight);
  const extCostPerUnit = costs.exterior[structure.exterior] ?? (isUSA ? 7 : 12000);
  const exteriorCost = Math.round(exteriorSqUnits * extCostPerUnit * costIndex);
  items.push({ label: `Exterior finish (${structure.exterior})`, amount: exteriorCost, category: "Exterior" });

  const windowCost = Math.round(windowCount * (costs.windows[structure.windows] ?? (isUSA ? 400 : 60000)) * costIndex);
  items.push({ label: `Windows (${structure.windows}) x ${windowCount}`, amount: windowCost, category: "Exterior" });

  const exteriorTotal = exteriorCost + windowCost;

  // --- INTERIOR ---
  const kitchenBase = costs.kitchen.base[interior.kitchenStyle] ?? (isUSA ? 8000 : 1500000);
  const kitchenMult = costs.kitchen.finishMultiplier[interior.kitchenFinish] ?? 1;
  const kitchenCost = Math.round(kitchenBase * kitchenMult * totalUnits * costIndex);
  items.push({ label: `Kitchen (${interior.kitchenStyle}, ${interior.kitchenFinish}) x ${totalUnits}`, amount: kitchenCost, category: "Kitchen" });

  const primaryBathCost = Math.round((costs.bath[interior.primaryBath] ?? (isUSA ? 4000 : 500000)) * totalUnits * costIndex);
  items.push({ label: `Primary bath (${interior.primaryBath}) x ${totalUnits}`, amount: primaryBathCost, category: "Bathrooms" });

  // Estimate secondary baths (1 per unit for 2BR+, 0 for studio/1BR)
  const secondaryBathCount = unitBreakdown
    ? unitBreakdown.reduce((sum, u) => sum + (u.bedrooms >= 2 ? u.count : 0), 0)
    : 1;
  const secondaryBathCost = Math.round((costs.bath[interior.secondaryBath] ?? (isUSA ? 2500 : 350000)) * secondaryBathCount * costIndex);
  if (secondaryBathCount > 0) {
    items.push({ label: `Secondary bath (${interior.secondaryBath}) x ${secondaryBathCount}`, amount: secondaryBathCost, category: "Bathrooms" });
  }

  const flooringCost = Math.round(buildingSize * (costs.flooring[interior.flooring] ?? (isUSA ? 4 : 12000)) * costIndex);
  items.push({ label: `Flooring (${interior.flooring})`, amount: flooringCost, formula: `${buildingSize.toLocaleString()} ${sizeUnit} x cost`, category: "Interior Finishes" });

  // Painting (all interior walls)
  const paintCost = Math.round(buildingSize * (isUSA ? 3.5 : 6000) * costIndex);
  items.push({ label: "Interior painting", amount: paintCost, category: "Interior Finishes" });

  // Trim
  const trimCost = Math.round(buildingSize * (isUSA ? 2 : 4000) * costIndex);
  items.push({ label: "Interior trim & doors", amount: trimCost, category: "Interior Finishes" });

  const interiorTotal = kitchenCost + primaryBathCost + secondaryBathCost + flooringCost + paintCost + trimCost;

  // --- MECHANICAL ---
  const hvacSystemCount = (interior.hvacConfig === "shared" || interior.hvacConfig === "central-boiler")
    ? 1 : totalUnits;
  const hvacCost = Math.round((costs.hvac[interior.hvac] ?? (isUSA ? 10000 : 800000)) * hvacSystemCount * costIndex);
  items.push({ label: `HVAC (${interior.hvac}) x ${hvacSystemCount} systems`, amount: hvacCost, category: "HVAC" });

  const waterHeaterCount = (interior.waterHeatingConfig === "central-boiler") ? 1 : totalUnits;
  const whCost = Math.round((costs.waterHeater[interior.waterHeater] ?? (isUSA ? 1500 : 300000)) * waterHeaterCount * costIndex);
  items.push({ label: `Water heater (${interior.waterHeater}) x ${waterHeaterCount}`, amount: whCost, category: "Plumbing" });

  const plumbingBase = isUSA ? 4000 : 800000;
  const plumbingPerUnit = isUSA ? 3000 : 500000;
  const plumbingCost = Math.round((plumbingBase + plumbingPerUnit * totalUnits) * costIndex);
  items.push({ label: `Plumbing (base + ${totalUnits} units)`, amount: plumbingCost, category: "Plumbing" });

  // Metering costs
  let meteringCost = 0;
  if (unitConfig.utilities === "all-separate" || unitConfig.utilities === "individual-all") {
    meteringCost = Math.round(totalUnits * 3 * (isUSA ? 600 : 100000) * costIndex); // 3 meters per unit
  } else if (unitConfig.utilities === "sub-metered") {
    meteringCost = Math.round(totalUnits * (isUSA ? 400 : 70000) * costIndex);
  }
  if (meteringCost > 0) items.push({ label: "Utility metering", amount: meteringCost, category: "Plumbing" });

  const electricalBase = isUSA ? 3000 : 600000;
  const electricalPerUnit = isUSA ? 2500 : 400000;
  const smartHomeCost = (costs.smartHome[interior.smartHome] ?? 0) * totalUnits;
  const electricalCost = Math.round((electricalBase + electricalPerUnit * totalUnits + smartHomeCost) * costIndex);
  items.push({ label: `Electrical + smart home (${interior.smartHome})`, amount: electricalCost, category: "Electrical" });

  // Insulation / drywall
  const insulationCost = Math.round(buildingSize * (isUSA ? 4 : 8000) * costIndex);
  items.push({ label: "Insulation / Drywall", amount: insulationCost, category: "Insulation / Drywall" });

  const mechanicalTotal = hvacCost + whCost + plumbingCost + meteringCost + electricalCost + insulationCost;

  // --- SPECIAL ITEMS ---
  let specialTotal = 0;

  // Garage
  const garageCost = Math.round((costs.garage[site.garage] ?? 0) * costIndex);
  if (garageCost > 0) { items.push({ label: `Garage (${site.garage})`, amount: garageCost, category: "Garage" }); specialTotal += garageCost; }

  // ADU
  if (propertyType === "SFH" && structure.adu && structure.adu !== "none") {
    const aduData = costs.adu[structure.adu];
    if (aduData) {
      const aduSize = isUSA ? (ADU_SIZES[structure.adu]?.sqft ?? 500) : (ADU_SIZES[structure.adu]?.sqm ?? 45);
      const aduCost = Math.round((aduSize * aduData.perUnit + aduData.connection) * costIndex);
      items.push({ label: `ADU (${structure.adu})`, amount: aduCost, formula: `${aduSize} ${sizeUnit} + utility connection`, category: "ADU" });
      specialTotal += aduCost;
    }
  }

  // Elevator
  const elevatorCost = Math.round((costs.elevator[structure.elevator] ?? 0) * costIndex);
  if (elevatorCost > 0) { items.push({ label: `Elevator (${structure.elevator})`, amount: elevatorCost, category: "Elevator" }); specialTotal += elevatorCost; }

  // Fire system
  if (structure.fireSystem && structure.fireSystem !== "extinguishers") {
    const fireCost = Math.round(buildingSize * (costs.fireSystem[structure.fireSystem] ?? 0) * costIndex);
    if (fireCost > 0) { items.push({ label: `Fire system (${structure.fireSystem})`, amount: fireCost, category: "Fire Protection" }); specialTotal += fireCost; }
  }

  // Soundproofing
  if (structure.soundproofing === "enhanced" && propertyType !== "SFH") {
    const sharedSurface = buildingSize * 0.3; // estimate 30% of area is shared walls/floors
    const soundCost = Math.round(sharedSurface * (costs.soundproofing.enhanced ?? 0) * costIndex);
    if (soundCost > 0) { items.push({ label: "Enhanced soundproofing", amount: soundCost, category: "Soundproofing" }); specialTotal += soundCost; }
  }

  // Security
  const securityCost = Math.round((costs.security[site.security] ?? 0) * costIndex);
  if (securityCost > 0) { items.push({ label: `Security (${site.security})`, amount: securityCost, category: "Security" }); specialTotal += securityCost; }

  // Outdoor living (SFH)
  if (site.outdoorLiving && site.outdoorLiving.length > 0) {
    const outdoorCost = site.outdoorLiving.reduce((sum, f) => sum + (costs.outdoorLiving[f] ?? 0), 0);
    const adjustedOutdoor = Math.round(outdoorCost * costIndex);
    if (adjustedOutdoor > 0) { items.push({ label: `Outdoor living (${site.outdoorLiving.length} features)`, amount: adjustedOutdoor, category: "Outdoor" }); specialTotal += adjustedOutdoor; }
  }

  // --- PARKING ---
  let parkingTotal = 0;
  if (propertyType !== "SFH") {
    const ratio = parseFloat(site.parkingRatio) || 1;
    const totalSpaces = Math.ceil(totalUnits * ratio);
    const perSpaceCost = costs.parking[site.parking] ?? 0;
    parkingTotal = Math.round(totalSpaces * perSpaceCost * costIndex);
    if (parkingTotal > 0) {
      items.push({ label: `Parking (${site.parking}) x ${totalSpaces} spaces`, amount: parkingTotal, formula: `${totalUnits} units x ${ratio} ratio = ${totalSpaces} spaces`, category: "Parking" });
    }
  }

  // --- COMMON AREAS ---
  let commonTotal = 0;
  if (unitConfig.commonAreas && unitConfig.commonAreas.length > 0) {
    for (const area of unitConfig.commonAreas) {
      const areaCost = Math.round((costs.commonArea[area] ?? 0) * costIndex);
      if (areaCost > 0) {
        items.push({ label: `Common area: ${area}`, amount: areaCost, category: "Common Areas" });
        commonTotal += areaCost;
      }
    }
  }

  // Access system
  const accessCost = Math.round((costs.accessSystem[site.buildingAccess] ?? 0) * costIndex);
  if (accessCost > 0) { items.push({ label: `Access system (${site.buildingAccess})`, amount: accessCost, category: "Common Areas" }); commonTotal += accessCost; }

  // Trash system
  const trashCost = Math.round((costs.trashSystem[site.trash] ?? 0) * costIndex);
  if (trashCost > 0) { items.push({ label: `Trash system (${site.trash})`, amount: trashCost, category: "Common Areas" }); commonTotal += trashCost; }

  // --- TOTALS ---
  const totalHardCosts = siteWorkTotal + foundationCost + framingCost + roofCost
    + exteriorTotal + interiorTotal + mechanicalTotal + specialTotal + parkingTotal + commonTotal;

  // --- SOFT COSTS ---
  const permitCost = Math.round(totalHardCosts * (propertyType === "APARTMENT" ? 0.04 : 0.025));
  items.push({ label: "Permits & fees", amount: permitCost, category: "Permits / Design" });

  const archRate = propertyType === "APARTMENT" ? 0.06 : propertyType === "SFH" ? 0.04 : 0.05;
  const archCost = Math.round(totalHardCosts * archRate);
  items.push({ label: "Architecture & design", amount: archCost, category: "Permits / Design" });

  let engCost = 0;
  if (propertyType === "APARTMENT" || (structure.floors && structure.floors >= 3) || structure.elevator !== "none" || site.lotShape === "irregular") {
    engCost = Math.round(totalHardCosts * 0.02);
    items.push({ label: "Structural engineering", amount: engCost, category: "Permits / Design" });
  }

  const insuranceCost = Math.round(totalHardCosts * 0.015);
  items.push({ label: "Builder's risk insurance", amount: insuranceCost, category: "Permits / Design" });

  const softTotal = permitCost + archCost + engCost + insuranceCost;

  // --- CONTINGENCY ---
  const baseContingency = Math.round(totalHardCosts * 0.15);
  let complexityAdder = 0;
  if (propertyType === "APARTMENT" || site.lotShape === "irregular" || site.lotShape === "pie-shaped" || structure.elevator !== "none") {
    complexityAdder = Math.round(totalHardCosts * 0.05);
  }
  const contingencyTotal = baseContingency + complexityAdder;
  items.push({ label: "Contingency (15%)", amount: baseContingency, category: "Contingency" });
  if (complexityAdder > 0) {
    items.push({ label: "Complexity adder (5%)", amount: complexityAdder, formula: "Apartment / irregular lot / elevator", category: "Contingency" });
  }

  // --- LAND ---
  let landCost = 0;
  if (landOption === "known" && landPrice) {
    landCost = landPrice;
  } else if (locationData) {
    if (isUSA && locationData.landPricePerAcre) {
      landCost = locationData.landPricePerAcre.mid;
    } else if (locationData.landPricePerSqm) {
      landCost = Math.round(locationData.landPricePerSqm.mid * lotSizeValue);
    }
  }
  if (landCost <= 0) {
    landCost = Math.round(totalHardCosts * 0.25);
  }
  items.push({ label: "Land acquisition", amount: landCost, category: "Land Acquisition" });

  // --- FINANCING ---
  let financingCost = 0;
  if (financingType && financingType !== "cash" && financingType !== "phased_cash" && financingType !== "family_pooling") {
    const totalBasis = landCost + totalHardCosts;
    const loanPortion = totalBasis * (1 - (downPaymentPct ?? 20) / 100);
    financingCost = Math.round(loanPortion * ((loanRate ?? 8) / 100) * ((timelineMonths ?? 12) / 12));
  }
  if (financingCost > 0) items.push({ label: "Financing costs (interest)", amount: financingCost, category: "Financing Costs" });

  const grandTotal = landCost + totalHardCosts + softTotal + contingencyTotal + financingCost;

  return {
    lineItems: items,
    siteWork: siteWorkTotal,
    foundation: foundationCost,
    framing: framingCost,
    exterior: exteriorTotal,
    interior: interiorTotal,
    mechanical: mechanicalTotal,
    specialItems: specialTotal,
    parking: parkingTotal,
    commonAreas: commonTotal,
    softCosts: softTotal,
    contingency: contingencyTotal,
    land: landCost,
    financing: financingCost,
    totalHardCosts,
    totalSoftCosts: softTotal,
    grandTotal,
  };
}

// ---------------------------------------------------------------------------
// Revenue projection calculator
// ---------------------------------------------------------------------------

export function calculateRevenueProjection(
  propertyType: PropertyType,
  market: MarketType | "",
  unitConfig: UnitConfigSelections,
  totalProjectCost: number,
  locationData?: LocationData | null,
  financingType?: string,
  downPaymentPct?: number,
  loanRate?: number,
  timelineMonths?: number,
  managementType?: string,
): RevenueProjection | null {
  if (propertyType === "SFH") return null;
  if (!market) return null;

  const isUSA = market === "USA";
  const unitBreakdown = parseUnitMix(propertyType, unitConfig.unitMix, unitConfig.unitCount, unitConfig.mixRatio);

  const units = unitBreakdown.map(u => {
    const avgSize = isUSA ? u.avgSqft : u.avgSqm;
    const rentRate = isUSA
      ? (locationData?.avgRentPerSqft ?? 1.0)
      : (locationData?.avgRentPerSqm ?? 2000);
    return {
      type: `${u.bedrooms === 0 ? "Studio" : u.bedrooms + "BR"} / ${u.bathrooms}BA`,
      count: u.count,
      avgSize,
      unit: (isUSA ? "sqft" : "sqm") as "sqft" | "sqm",
      marketRent: Math.round(avgSize * rentRate),
    };
  });

  // Subtract owner-occupied unit
  const ownerOccupied = unitConfig.ownerOccupied !== "no";
  const rentableUnits = ownerOccupied
    ? units.map((u, i) => i === 0 ? { ...u, count: Math.max(0, u.count - 1) } : u)
    : units;

  // Subtract live-in manager unit
  const liveInManager = unitConfig.management === "live-in" || (propertyType === "APARTMENT" && unitConfig.management === "live-in");
  const finalUnits = liveInManager
    ? rentableUnits.map((u, i) => i === rentableUnits.length - 1 ? { ...u, count: Math.max(0, u.count - 1) } : u)
    : rentableUnits;

  const grossMonthlyRent = finalUnits.reduce((sum, u) => sum + u.marketRent * u.count, 0);

  // Vacancy rates by unit type
  const vacancyRate = 0.06; // 6% blended
  const vacancyAllowance = Math.round(grossMonthlyRent * vacancyRate);
  const effectiveGrossIncome = grossMonthlyRent - vacancyAllowance;

  // Operating expenses
  const mgmtRate = managementType === "property-manager" ? 0.09
    : managementType === "on-site" ? 0.07
    : managementType === "live-in" ? 0.05
    : 0;
  const mgmtCost = Math.round(effectiveGrossIncome * mgmtRate);

  const ownerPaidUtilities = unitConfig.utilities === "owner-pays"
    ? Math.round((isUSA ? 150 : 25000) * unitConfig.unitCount)
    : 0;

  const camCost = Math.round(effectiveGrossIncome * 0.05);
  const insuranceCost = Math.round(totalProjectCost * 0.005 / 12);
  const reserves = Math.round(effectiveGrossIncome * 0.05);

  const totalExpenses = mgmtCost + ownerPaidUtilities + camCost + insuranceCost + reserves;
  const noi = effectiveGrossIncome - totalExpenses;
  const annualNOI = noi * 12;
  const capRate = totalProjectCost > 0 ? (annualNOI / totalProjectCost) * 100 : 0;

  // Debt service
  let monthlyDebtService = 0;
  if (financingType && financingType !== "cash" && financingType !== "phased_cash" && financingType !== "family_pooling") {
    const dp = (downPaymentPct ?? 20) / 100;
    const loanAmt = totalProjectCost * (1 - dp);
    const monthlyRate = ((loanRate ?? 8) / 100) / 12;
    const months = (timelineMonths ?? 12) * 2.5; // assume 30-yr amortization equivalent
    if (monthlyRate > 0) {
      monthlyDebtService = Math.round(loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
    }
  }

  const monthlyCashFlow = noi - monthlyDebtService;
  const downPayment = totalProjectCost * ((downPaymentPct ?? 100) / 100);
  const cashOnCash = downPayment > 0 ? ((monthlyCashFlow * 12) / downPayment) * 100 : 0;

  return {
    units,
    grossMonthlyRent,
    vacancyAllowance,
    effectiveGrossIncome,
    operatingExpenses: {
      management: mgmtCost,
      ownerPaidUtilities,
      commonAreaMaintenance: camCost,
      insurance: insuranceCost,
      reserves,
      total: totalExpenses,
    },
    netOperatingIncome: noi,
    annualNOI,
    capRate,
    monthlyDebtService,
    monthlyCashFlow,
    cashOnCashReturn: cashOnCash,
  };
}

// ---------------------------------------------------------------------------
// Empty breakdown (no market selected)
// ---------------------------------------------------------------------------

function emptyBreakdown(): DetailedCostBreakdown {
  return {
    lineItems: [],
    siteWork: 0, foundation: 0, framing: 0, exterior: 0,
    interior: 0, mechanical: 0, specialItems: 0, parking: 0,
    commonAreas: 0, softCosts: 0, contingency: 0, land: 0,
    financing: 0, totalHardCosts: 0, totalSoftCosts: 0, grandTotal: 0,
  };
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/config/detailed-cost-engine.ts
git commit -m "feat: add detailed line-item cost engine with market-specific cost tables"
```

---

## Task 3: Update WizardState and Step Constants in Wizard Page

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

Update the WizardState interface, INITIAL_STATE, STEP_LABELS, STEP_COUNT, and imports to accommodate the new steps.

**Step 1: Add imports for new modules**

At the top of the file (after existing imports), add:

```typescript
import {
  type StructureSelections, type InteriorSelections,
  type SiteSelections, type UnitConfigSelections,
  INITIAL_STRUCTURE, INITIAL_INTERIOR, INITIAL_SITE, INITIAL_UNIT_CONFIG,
  getStructureQuestions, getInteriorQuestions, getSiteQuestions, getUnitConfigQuestions,
  getSmartDefaults, needsUnitConfig, parseUnitMix, getLotSizeValue, getLotShapeMultiplier,
  type DetailQuestion,
} from "@/lib/config/property-details-config";
import {
  calculateDetailedCosts, calculateRevenueProjection,
  type DetailedCostBreakdown, type RevenueProjection,
} from "@/lib/config/detailed-cost-engine";
```

**Step 2: Extend WizardState**

Add the 4 new fields to the WizardState interface:

```typescript
interface WizardState {
  // ... existing fields ...
  structure: StructureSelections;
  interior: InteriorSelections;
  site: SiteSelections;
  unitConfig: UnitConfigSelections;
}
```

And to INITIAL_STATE:

```typescript
const INITIAL_STATE: WizardState = {
  // ... existing fields ...
  structure: { ...INITIAL_STRUCTURE },
  interior: { ...INITIAL_INTERIOR },
  site: { ...INITIAL_SITE },
  unitConfig: { ...INITIAL_UNIT_CONFIG },
};
```

**Step 3: Update STEP_LABELS and STEP_COUNT**

Change to dynamic step generation. Replace the static STEP_LABELS and STEP_COUNT:

```typescript
function getStepLabels(propertyType: PropertyType | ""): string[] {
  const base = ["Goal", "Market", "Location", "Type", "Structure", "Interior", "Site"];
  if (needsUnitConfig(propertyType as PropertyType)) {
    base.push("Units");
  }
  base.push("Size", "Land", "Financing", "Financials", "Score", "Name");
  return base;
}
```

**Step 4: Update renderStep(), canProceed(), getValidationMessage()**

The step indices shift. Use a step mapping function:

```typescript
function getStepMapping(propertyType: PropertyType | ""): Record<string, number> {
  const hasUnits = needsUnitConfig(propertyType as PropertyType);
  return {
    goal: 0,
    market: 1,
    location: 2,
    type: 3,
    structure: 4,
    interior: 5,
    site: 6,
    units: hasUnits ? 7 : -1,
    size: hasUnits ? 8 : 7,
    land: hasUnits ? 9 : 8,
    financing: hasUnits ? 10 : 9,
    financials: hasUnits ? 11 : 10,
    score: hasUnits ? 12 : 11,
    name: hasUnits ? 13 : 12,
  };
}
```

Update `renderStep()` to use the mapping. Update `canProceed()` — the new detail steps always allow proceeding since they have smart defaults.

**Step 5: Apply smart defaults when property type is selected**

In the `update()` function or via a useEffect, when `propertyType` changes, apply smart defaults:

```typescript
useEffect(() => {
  if (state.propertyType && state.market && state.goal) {
    const defaults = getSmartDefaults(
      state.propertyType as PropertyType,
      state.market as MarketType,
      state.goal,
    );
    setState(prev => ({
      ...prev,
      structure: { ...INITIAL_STRUCTURE, ...defaults.structure },
      interior: { ...INITIAL_INTERIOR, ...defaults.interior },
      site: { ...INITIAL_SITE, ...defaults.site },
      unitConfig: { ...INITIAL_UNIT_CONFIG, ...defaults.unitConfig },
    }));
  }
}, [state.propertyType, state.market, state.goal]);
```

**Step 6: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: extend wizard state with structure/interior/site/unitConfig fields and dynamic step mapping"
```

---

## Task 4: Build the Generic Detail Step Renderer Component

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

Create a reusable renderer that takes a list of DetailQuestion objects and renders tap-card groups.

**Step 1: Add the renderDetailQuestions helper**

This function renders a list of question groups as tap cards:

```typescript
function renderDetailQuestions(
  questions: DetailQuestion[],
  stateObj: Record<string, any>,
  updateFn: (key: string, value: any) => void,
) {
  return (
    <div className="space-y-5 text-left animate-stagger">
      {questions.map((q) => {
        // Check conditional visibility
        if (q.conditionalOn) {
          const fieldVal = stateObj[q.conditionalOn.field];
          const matches = q.conditionalOn.values.includes(fieldVal);
          if (q.conditionalOn.negate ? matches : !matches) return null;
        }

        const currentValue = stateObj[q.key];

        return (
          <div key={q.key}>
            <p className="text-[12px] font-semibold text-earth mb-2">{q.label}</p>
            <div className={`grid ${q.options.length <= 3 ? "grid-cols-2" : "grid-cols-2"} gap-1.5`}>
              {q.options.map((opt) => {
                const isSelected = q.multiSelect
                  ? (currentValue as string[])?.includes(opt.id)
                  : currentValue === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (q.multiSelect) {
                        const arr = (currentValue as string[]) || [];
                        const next = arr.includes(opt.id)
                          ? arr.filter((x: string) => x !== opt.id)
                          : [...arr, opt.id];
                        updateFn(q.key, next);
                      } else {
                        updateFn(q.key, opt.id);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-500 border-2 bg-emerald-50/30 text-emerald-800"
                        : "border-border/50 text-muted hover:bg-warm/20 hover:border-sand"
                    }`}
                  >
                    {opt.Icon && <opt.Icon size={14} className="shrink-0" />}
                    <div>
                      <span className="text-[12px] font-medium">{opt.label}</span>
                      {opt.subtitle && (
                        <p className="text-[10px] text-muted mt-0.5">{opt.subtitle}</p>
                      )}
                    </div>
                    {q.multiSelect && isSelected && (
                      <Check size={12} className="ml-auto text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: add generic detail question renderer for tap-card wizard steps"
```

---

## Task 5: Add the 4 New Step Renderer Functions

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

Add renderStructureStep(), renderInteriorStep(), renderSiteStep(), renderUnitConfigStep().

**Step 1: Add the 4 step renderers**

```typescript
function renderStructureStep() {
  const questions = getStructureQuestions(
    state.propertyType as PropertyType,
    state.market as MarketType,
  );
  return (
    <div className="animate-fade-in">
      <StepHeading
        title="Structure & Foundation"
        subtitle="These choices drive your biggest cost line items — foundation, framing, and envelope."
      />
      {renderDetailQuestions(questions, state.structure, (key, value) =>
        setState(prev => ({ ...prev, structure: { ...prev.structure, [key]: value } }))
      )}
      <MentorTip>
        Your foundation choice is one of the biggest cost drivers. Basements can add 15% to your build cost but give you usable space below grade.
        {state.market !== "USA" && " In West Africa, raised slabs protect against flooding and termites."}
      </MentorTip>
    </div>
  );
}

function renderInteriorStep() {
  const questions = getInteriorQuestions(
    state.propertyType as PropertyType,
    state.market as MarketType,
  );
  return (
    <div className="animate-fade-in">
      <StepHeading
        title="Interior Finishes"
        subtitle="Kitchen, bath, and flooring choices shape your budget and your future residents' experience."
      />
      {renderDetailQuestions(questions, state.interior, (key, value) =>
        setState(prev => ({ ...prev, interior: { ...prev.interior, [key]: value } }))
      )}
      <MentorTip>
        Kitchen and bath finishes are where budgets balloon. A high-end kitchen can cost 3x a standard one.
        {state.goal === "rent" && " Renters rarely pay premium rent for luxury finishes — standard or mid-range is usually the best ROI."}
      </MentorTip>
    </div>
  );
}

function renderSiteStep() {
  const questions = getSiteQuestions(
    state.propertyType as PropertyType,
    state.market as MarketType,
  );
  return (
    <div className="animate-fade-in">
      <StepHeading
        title="Site & Outdoor"
        subtitle="Lot characteristics and outdoor features affect site work costs and usable space."
      />
      {renderDetailQuestions(questions, state.site, (key, value) =>
        setState(prev => ({ ...prev, site: { ...prev.site, [key]: value } }))
      )}
      <MentorTip>
        Lot shape matters more than you'd think. An irregular lot can add 10-20% to your site work costs for custom grading and foundation layout. Corner lots give you more street frontage but also more fencing.
      </MentorTip>
    </div>
  );
}

function renderUnitConfigStep() {
  const questions = getUnitConfigQuestions(
    state.propertyType as PropertyType,
    state.market as MarketType,
  );

  return (
    <div className="animate-fade-in">
      <StepHeading
        title="Unit Configuration"
        subtitle="Define your unit mix, metering, and management. These drive your revenue projections."
      />

      {/* Unit count stepper for apartments */}
      {state.propertyType === "APARTMENT" && (
        <div className="mb-5 p-4 rounded-xl border border-border bg-surface text-center">
          <p className="text-[12px] font-semibold text-earth mb-2">Number of units</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setState(prev => ({
                ...prev,
                unitConfig: { ...prev.unitConfig, unitCount: Math.max(5, prev.unitConfig.unitCount - 1) }
              }))}
              className="w-9 h-9 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[15px]"
            >-</button>
            <span className="w-8 text-center font-data text-[20px] font-semibold text-earth">{state.unitConfig.unitCount}</span>
            <button
              onClick={() => setState(prev => ({
                ...prev,
                unitConfig: { ...prev.unitConfig, unitCount: Math.min(12, prev.unitConfig.unitCount + 1) }
              }))}
              className="w-9 h-9 rounded-lg border border-border text-earth hover:bg-warm/30 flex items-center justify-center text-[15px]"
            >+</button>
          </div>
        </div>
      )}

      {renderDetailQuestions(questions, state.unitConfig, (key, value) =>
        setState(prev => ({ ...prev, unitConfig: { ...prev.unitConfig, [key]: value } }))
      )}

      <MentorTip>
        Separate utility meters cost more upfront but save you money every month. With owner-pays-all, you absorb usage spikes. With separate meters, tenants pay their own consumption.
      </MentorTip>
    </div>
  );
}
```

**Step 2: Wire into renderStep()**

Update the switch statement in `renderStep()` to use the step mapping and call the new renderers.

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: add Structure, Interior, Site, Unit Config step renderers to wizard"
```

---

## Task 6: Wire Detailed Cost Engine into Financials & Score Steps

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

Replace the inline cost functions with calls to `calculateDetailedCosts` and update the Financials step to show line items.

**Step 1: Replace cost calculation with detailed engine**

Add a `useMemo` that calls `calculateDetailedCosts`:

```typescript
const detailedCosts = useMemo(() => {
  return calculateDetailedCosts(
    state.propertyType as PropertyType,
    state.market as MarketType,
    state.structure,
    state.interior,
    state.site,
    state.unitConfig,
    locationData,
    state.landOption,
    state.landPrice,
    state.financingType,
    state.downPaymentPct,
    state.loanRate,
    state.timelineMonths,
  );
}, [state, locationData]);
```

**Step 2: Update renderFinancialsStep()**

Replace the 5-category view with a categorized line-item breakdown. Group `detailedCosts.lineItems` by category and display each group with its items.

**Step 3: Update renderScoreStep()**

Feed `detailedCosts.grandTotal` into the score calculator. Add new scoring factors for lot shape, parking ratio, unit mix, etc.

**Step 4: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: integrate detailed cost engine into financials and score steps"
```

---

## Task 7: Update handleCreate to Store Specs in Firebase

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`
- Modify: `apps/web/src/lib/services/project-service.ts`

**Step 1: Add `specs` field to ProjectData interface**

In `project-service.ts`, add:

```typescript
export interface ProjectData {
  // ... existing fields ...
  specs?: {
    structure?: Record<string, any>;
    interior?: Record<string, any>;
    site?: Record<string, any>;
    unitConfig?: Record<string, any>;
    detailedCosts?: Record<string, any>;
  };
}
```

**Step 2: Update handleCreate in wizard**

In the `createProject()` call, add:

```typescript
specs: {
  structure: state.structure,
  interior: state.interior,
  site: state.site,
  unitConfig: needsUnitConfig(state.propertyType as PropertyType) ? state.unitConfig : undefined,
  detailedCosts: detailedCosts,
},
```

**Step 3: Update generateBudgetFromSpecs**

Modify to accept the detailed cost breakdown and create budget line items from `detailedCosts.lineItems` directly instead of generic percentage splits:

```typescript
// In generateBudgetFromSpecs, add optional parameter:
export async function generateBudgetFromSpecs(
  userId: string,
  projectId: string,
  totalBudget: number,
  market: Market,
  features?: string[],
  costBreakdown?: WizardCostBreakdown,
  detailedLineItems?: { label: string; amount: number; category: string }[],
): Promise<void> {
  // If detailed line items provided, use them directly
  if (detailedLineItems && detailedLineItems.length > 0) {
    const budgetRef = ref(db, `users/${userId}/projects/${projectId}/budgetItems`);
    const items: Record<string, Omit<BudgetItemData, "id">> = {};
    for (const item of detailedLineItems) {
      if (item.amount > 0) {
        const key = push(budgetRef).key!;
        items[key] = {
          projectId,
          category: item.category,
          estimated: Math.round(item.amount),
          actual: 0,
          status: "not-started",
        };
      }
    }
    await update(budgetRef, items);
    return;
  }
  // ... existing fallback logic ...
}
```

**Step 4: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx apps/web/src/lib/services/project-service.ts
git commit -m "feat: store project specs in Firebase and generate budget from detailed line items"
```

---

## Task 8: Update Size Step to Become Confirmation/Summary

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Transform renderSizeStep()**

The Size step should now:
- Pre-fill bedrooms/bathrooms/stories from structure + unit config data
- For multi-unit: auto-calculate total building size from unit mix and display it
- For SFH with ADU: show main house + ADU size separately
- Remove the features toggle grid (already captured in Interior + Site steps)
- Keep size presets but show them with costs from the detailed engine
- Show a running total from `detailedCosts.grandTotal`

**Step 2: Update the size presets to use detailed costs**

Instead of calling the old `getConstructionCost()`, show `detailedCosts.grandTotal` which already accounts for all selections.

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: transform size step into confirmation with pre-filled values from detail steps"
```

---

## Task 9: Update Land Step to Use Lot Size from Site Step

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Pre-calculate land cost from lot size**

Since lot size is now captured in the Site step, update the Land step to:
- Show the pre-calculated land estimate based on actual lot size × location data
- Keep "I have land (or a price)" and "I am still looking" options
- Display the estimate more prominently since it's now based on real lot dimensions

**Step 2: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: update land step to use lot size from site step for better estimates"
```

---

## Task 10: Update Deal Analyzer Integration for New Steps

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Extend URL parameter handling**

Update the `fromAnalyzer` URL param reader to accept new detail parameters. Add params like `foundation`, `roof`, `exterior`, `kitchen`, `hvac`, etc. so the Deal Analyzer can pre-fill detail steps.

**Step 2: Update step skipping logic**

When `fromAnalyzer` is true and detail steps are pre-filled, skip to the Name step (now at a dynamic index based on property type).

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "feat: extend deal analyzer integration with detail step parameters"
```

---

## Task 11: Update AI Mentor Context with Project Specs

**Files:**
- Modify: `apps/web/src/components/ui/AIMentor.tsx`

**Step 1: Inject specs into project context**

When building the `projectContext` object sent to the AI, include the specs:

```typescript
const projectContext = {
  // ... existing fields ...
  specs: project.specs ? {
    foundation: project.specs.structure?.foundation,
    roof: project.specs.structure?.roof,
    exterior: project.specs.structure?.exterior,
    hvac: project.specs.interior?.hvac,
    flooring: project.specs.interior?.flooring,
    kitchenFinish: project.specs.interior?.kitchenFinish,
    unitMix: project.specs.unitConfig?.unitMix,
    unitCount: project.specs.unitConfig?.unitCount,
    parking: project.specs.site?.parking,
    lotShape: project.specs.site?.lotShape,
  } : undefined,
};
```

**Step 2: Commit**

```bash
git add apps/web/src/components/ui/AIMentor.tsx
git commit -m "feat: inject project specs into AI mentor context for specific advice"
```

---

## Task 12: Clean Up Unused Inline Cost Functions

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1: Remove old cost helper functions**

Remove or deprecate `getConstructionCost()`, `getFeatureMultiplier()`, `getSoftCosts()`, `getFinancingCosts()`, `getContingency()`, `getTotalProjectCost()` since they are replaced by `calculateDetailedCosts()`.

Keep `getLandCost()`, `getEstimatedSaleValue()`, `getEstimatedMonthlyRent()` if they are still referenced elsewhere, or migrate them to the detailed engine.

**Step 2: Remove the old US_FEATURES and WA_FEATURES constants**

These feature toggle arrays are no longer used since features are captured in the detail steps.

**Step 3: Commit**

```bash
git add apps/web/src/app/\(dashboard\)/new-project/page.tsx
git commit -m "refactor: remove unused inline cost functions replaced by detailed cost engine"
```

---

## Task 13: Verify and Test End-to-End

**Step 1: Run the dev server**

```bash
cd apps/web && npm run dev
```

**Step 2: Test the full wizard flow**

Walk through each property type (SFH, DUPLEX, TRIPLEX, FOURPLEX, APARTMENT) and verify:
- Smart defaults are pre-selected
- All options are tappable, no typing required
- Step count adjusts (12 for SFH, 13 for multi-unit)
- Cost estimate updates in real-time as selections change
- Financials step shows detailed line items
- Score step uses accurate totals
- Project creation stores specs in Firebase
- Budget page shows detailed categories matching line items

**Step 3: Test market switching**

Verify that changing market (USA vs Togo) correctly swaps:
- Foundation options (slab vs raised-slab)
- Exterior options (vinyl vs rendered-block)
- HVAC options (central-air vs split-ac)
- Lot size presets (sqft vs sqm)
- Cost values (USD vs XOF)

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify end-to-end property detail capture flow"
```
