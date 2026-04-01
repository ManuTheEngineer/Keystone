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

  // Lot size -- presets adapt to market
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
// Smart defaults -- pre-selected values per market + property type + goal
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
    structure.layout = "single-story";
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
    driveway: "concrete",
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
// Unit mix parsing -- extract unit breakdown from template ID
// ---------------------------------------------------------------------------

export interface UnitBreakdown {
  type: string;       // "studio" | "1br" | "2br" | "3br"
  bedrooms: number;
  bathrooms: number;
  count: number;
  avgSqft: number;    // USA
  avgSqm: number;     // WA
}

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

  // Apartment mixes -- dynamic based on unitCount + mixRatio
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
