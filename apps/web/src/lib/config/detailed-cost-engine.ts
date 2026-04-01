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

// Ghana uses GHS, not XOF. Approximate conversion: 1 GHS ≈ 83 XOF.
// We scale WA_COSTS (XOF) by this factor to produce GHS-denominated values.
const XOF_TO_GHS = 0.012;

function scaleMarketCosts(base: MarketCosts, factor: number): MarketCosts {
  const scaleRecord = (r: Record<string, number>) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v * factor)]));
  return {
    ...base,
    foundation: scaleRecord(base.foundation),
    roof: scaleRecord(base.roof),
    exterior: scaleRecord(base.exterior),
    flooring: scaleRecord(base.flooring),
    kitchen: {
      base: scaleRecord(base.kitchen.base),
      finishMultiplier: { ...base.kitchen.finishMultiplier }, // multipliers stay the same
    },
    bath: scaleRecord(base.bath),
    hvac: scaleRecord(base.hvac),
    waterHeater: scaleRecord(base.waterHeater),
    garage: scaleRecord(base.garage),
    parking: scaleRecord(base.parking),
    windows: scaleRecord(base.windows),
    elevator: scaleRecord(base.elevator),
    fireSystem: scaleRecord(base.fireSystem),
    security: scaleRecord(base.security),
    smartHome: scaleRecord(base.smartHome),
    landscaping: scaleRecord(base.landscaping),
    driveway: scaleRecord(base.driveway),
    fencing: scaleRecord(base.fencing),
    soundproofing: scaleRecord(base.soundproofing),
    ceilingHeight: { ...base.ceilingHeight }, // multipliers stay the same
    adu: Object.fromEntries(
      Object.entries(base.adu).map(([k, v]) => [k, { perUnit: Math.round(v.perUnit * factor), connection: Math.round(v.connection * factor) }])
    ),
    outdoorLiving: scaleRecord(base.outdoorLiving),
    commonArea: scaleRecord(base.commonArea),
    accessSystem: scaleRecord(base.accessSystem),
    trashSystem: scaleRecord(base.trashSystem),
  };
}

const GHANA_COSTS: MarketCosts = scaleMarketCosts(WA_COSTS, XOF_TO_GHS);

function getCosts(market: MarketType | ""): MarketCosts {
  if (market === "USA") return USA_COSTS;
  if (market === "GHANA") return GHANA_COSTS;
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

  // Basement / Underground
  const hasBasement = structure.foundation === "full-basement" || structure.foundation === "walkout-basement";
  if (hasBasement && isUSA) {
    const basementFootprint = structure.basementSize === "partial" ? buildingFootprint * 0.5 : buildingFootprint;

    // Finish level cost
    const finishCostPerSqft: Record<string, number> = {
      unfinished: 0,
      "partially-finished": 25,
      "fully-finished": 45,
    };
    const finishCost = Math.round(basementFootprint * (finishCostPerSqft[structure.basementFinish] ?? 0) * costIndex);
    if (finishCost > 0) {
      items.push({ label: `Basement finishing (${structure.basementFinish})`, amount: finishCost, formula: `${Math.round(basementFootprint)} sqft x $${finishCostPerSqft[structure.basementFinish]}/sqft`, category: "Basement" });
      specialTotal += finishCost;
    }

    // Basement bathroom
    const bathCosts: Record<string, number> = { no: 0, half: 4500, full: 8500 };
    const basementBathCost = Math.round((bathCosts[structure.basementBathroom] ?? 0) * costIndex);
    if (basementBathCost > 0) {
      items.push({ label: `Basement bathroom (${structure.basementBathroom})`, amount: basementBathCost, formula: structure.basementBathroom === "full" ? "Includes ejector pump for below-grade plumbing" : "", category: "Basement" });
      specialTotal += basementBathCost;
    }

    // Waterproofing
    const wpCosts: Record<string, number> = { basic: 3, "interior-drainage": 8, "exterior-membrane": 15 };
    const wpCost = Math.round(basementFootprint * (wpCosts[structure.basementWaterproofing] ?? 0) * costIndex);
    if (wpCost > 0) {
      items.push({ label: `Waterproofing (${structure.basementWaterproofing})`, amount: wpCost, category: "Basement" });
      specialTotal += wpCost;
    }

    // Egress windows
    const egressCosts: Record<string, number> = { none: 0, "1-window": 3500, "2-windows": 6500, walkout: 0 };
    const egressCost = Math.round((egressCosts[structure.basementEgress] ?? 0) * costIndex);
    if (egressCost > 0) {
      items.push({ label: `Egress windows (${structure.basementEgress})`, amount: egressCost, category: "Basement" });
      specialTotal += egressCost;
    }
  }

  // Rooftop features
  if (structure.rooftopFeatures && structure.rooftopFeatures.length > 0) {
    const rooftopCosts: Record<string, number> = isUSA
      ? {
          "rooftop-deck": 25000, "green-roof": 20000, "solar-panels": 18000,
          "rooftop-hvac": 5000, "rooftop-lounge": 15000, "skylights": 4000,
          "antenna-satellite": 500, "water-tank": 3000, "rooftop-laundry": 2000,
        }
      : {
          "rooftop-deck": 5000000, "green-roof": 4000000, "solar-panels": 5000000,
          "rooftop-hvac": 800000, "rooftop-lounge": 3000000, "skylights": 600000,
          "antenna-satellite": 100000, "water-tank": 2500000, "rooftop-laundry": 300000,
        };
    const rooftopTotal = structure.rooftopFeatures.reduce((sum, f) => sum + (rooftopCosts[f] ?? 0), 0);
    const adjustedRooftop = Math.round(rooftopTotal * costIndex);
    if (adjustedRooftop > 0) {
      items.push({ label: `Rooftop features (${structure.rooftopFeatures.length} items)`, amount: adjustedRooftop, category: "Rooftop" });
      specialTotal += adjustedRooftop;
    }

    // Rooftop access structure
    const accessCosts: Record<string, number> = isUSA
      ? { none: 0, hatch: 2000, "stair-penthouse": 15000 }
      : { none: 0, hatch: 300000, "stair-penthouse": 3000000 };
    const accessCost = Math.round((accessCosts[structure.rooftopAccess] ?? 0) * costIndex);
    if (accessCost > 0) {
      items.push({ label: `Rooftop access (${structure.rooftopAccess})`, amount: accessCost, category: "Rooftop" });
      specialTotal += accessCost;
    }
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

export function emptyBreakdown(): DetailedCostBreakdown {
  return {
    lineItems: [],
    siteWork: 0, foundation: 0, framing: 0, exterior: 0,
    interior: 0, mechanical: 0, specialItems: 0, parking: 0,
    commonAreas: 0, softCosts: 0, contingency: 0, land: 0,
    financing: 0, totalHardCosts: 0, totalSoftCosts: 0, grandTotal: 0,
  };
}
