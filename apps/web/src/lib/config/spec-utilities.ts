// apps/web/src/lib/config/spec-utilities.ts
// ---------------------------------------------------------------------------
// Downstream spec utilities — derive trades, schedule, inspections, and photo
// categories from the structured wizard selections.
// ---------------------------------------------------------------------------

import type {
  StructureSelections,
  InteriorSelections,
  SiteSelections,
  UnitConfigSelections,
} from "./property-details-config";

// ---------------------------------------------------------------------------
// 1. Required Trades
// ---------------------------------------------------------------------------

export interface TradeRequirement {
  name: string;
  phase: string;
  estimatedBudgetPct?: number;
  reason: string;
}

export function getRequiredTrades(
  structure: StructureSelections,
  interior: InteriorSelections,
  site: SiteSelections,
  unitConfig?: UnitConfigSelections,
): TradeRequirement[] {
  const trades: TradeRequirement[] = [
    // --- Always needed ---
    { name: "General contractor", phase: "BUILD", estimatedBudgetPct: 15, reason: "Overall project management" },
    { name: "Foundation contractor", phase: "BUILD", estimatedBudgetPct: 8, reason: "Foundation and subgrade work" },
    { name: "Framing crew", phase: "BUILD", estimatedBudgetPct: 12, reason: "Structural framing" },
    { name: "Roofer", phase: "BUILD", estimatedBudgetPct: 5, reason: "Roof installation" },
    { name: "Plumber", phase: "BUILD", estimatedBudgetPct: 8, reason: "Plumbing rough-in and finish" },
    { name: "Electrician", phase: "BUILD", estimatedBudgetPct: 8, reason: "Electrical rough-in and finish" },
    { name: "HVAC technician", phase: "BUILD", estimatedBudgetPct: 6, reason: "Climate control installation" },
    { name: "Painter", phase: "BUILD", estimatedBudgetPct: 3, reason: "Interior and exterior paint" },
    { name: "Insulation installer", phase: "BUILD", estimatedBudgetPct: 2, reason: "Insulation" },
    { name: "Drywall crew", phase: "BUILD", estimatedBudgetPct: 4, reason: "Drywall hanging and finishing" },
  ];

  // --- Conditional trades ---

  const hasBasement = structure.foundation.includes("basement");
  if (hasBasement) {
    trades.push(
      { name: "Excavation contractor", phase: "BUILD", estimatedBudgetPct: 3, reason: "Basement excavation" },
      { name: "Waterproofing specialist", phase: "BUILD", estimatedBudgetPct: 2, reason: "Basement waterproofing" },
    );
  }

  if (structure.elevator !== "none" && structure.elevator !== "") {
    trades.push({ name: "Elevator installer", phase: "BUILD", reason: "Elevator installation" });
  }

  if (structure.fireSystem === "sprinklered" || structure.fireSystem === "alarm-sprinkler") {
    trades.push({ name: "Fire protection contractor", phase: "BUILD", reason: "Fire sprinkler system" });
  }

  if (structure.soundproofing === "enhanced") {
    trades.push({ name: "Acoustic insulation specialist", phase: "BUILD", reason: "Enhanced soundproofing" });
  }

  if (interior.smartHome !== "none" && interior.smartHome !== "") {
    trades.push({ name: "Low-voltage / smart home integrator", phase: "BUILD", reason: "Smart home wiring and setup" });
  }

  if (interior.flooring === "hardwood") {
    trades.push({ name: "Hardwood flooring installer", phase: "BUILD", reason: "Hardwood installation and finishing" });
  }

  if (interior.flooring.includes("tile") || interior.flooring.includes("terrazzo")) {
    trades.push({ name: "Tile setter", phase: "BUILD", reason: "Tile/terrazzo installation" });
  }

  if (site.landscaping !== "none" && site.landscaping !== "minimal" && site.landscaping !== "") {
    trades.push({ name: "Landscaper", phase: "BUILD", reason: "Landscaping and grounds" });
  }

  if (site.security !== "none" && site.security !== "") {
    trades.push({ name: "Security system installer", phase: "VERIFY", reason: "Security system installation" });
  }

  if (interior.waterHeater === "solar") {
    trades.push({ name: "Solar installer", phase: "BUILD", reason: "Solar panel installation" });
  }

  if (structure.adu !== "none" && structure.adu !== "") {
    trades.push({ name: "ADU specialist", phase: "BUILD", reason: "Accessory dwelling unit construction" });
  }

  if (structure.exterior === "brick" || structure.exterior === "stone") {
    trades.push({ name: "Mason", phase: "BUILD", reason: "Masonry work" });
  }

  if (structure.exterior === "stucco" || structure.exterior === "rendered-block") {
    trades.push({ name: "Stucco/plastering crew", phase: "BUILD", reason: "Exterior plastering" });
  }

  if (site.fencing !== "none" && site.fencing !== "" && site.fencing !== undefined) {
    trades.push({ name: "Fence installer", phase: "BUILD", reason: "Fence/wall construction" });
  }

  if (site.driveway !== "none" && site.driveway !== "") {
    trades.push({ name: "Concrete/paving contractor", phase: "BUILD", reason: "Driveway and hardscaping" });
  }

  if (site.garage !== "none" && site.garage !== "" && site.garage !== undefined) {
    trades.push({ name: "Garage door installer", phase: "BUILD", reason: "Garage door installation" });
  }

  if (structure.rooftopFeatures && structure.rooftopFeatures.length > 0) {
    trades.push({ name: "Rooftop specialist", phase: "BUILD", reason: "Rooftop feature installation" });
  }

  if (hasBasement && structure.basementBathroom !== "no" && structure.basementBathroom !== "") {
    trades.push({ name: "Plumbing ejector specialist", phase: "BUILD", reason: "Below-grade plumbing" });
  }

  return trades;
}

// ---------------------------------------------------------------------------
// 2. Schedule Estimation
// ---------------------------------------------------------------------------

export interface PhaseSchedule {
  phase: string;
  durationWeeks: number;
  adjustments: string[];
}

const BASE_BUILD_WEEKS: Record<string, number> = {
  SFH: 24,
  DUPLEX: 28,
  TRIPLEX: 32,
  FOURPLEX: 34,
  APARTMENT: 38,
};

const FIXED_PHASE_WEEKS: Record<string, number> = {
  DEFINE: 4,
  FINANCE: 4,
  LAND: 6,
  DESIGN: 6,
  APPROVE: 4,
  ASSEMBLE: 4,
  VERIFY: 3,
  OPERATE: 0,
};

export function estimateSchedule(
  structure: StructureSelections,
  interior: InteriorSelections,
  site: SiteSelections,
  unitConfig: UnitConfigSelections | undefined,
  propertyType: string,
): { totalWeeks: number; phases: PhaseSchedule[] } {
  let buildWeeks = BASE_BUILD_WEEKS[propertyType] ?? 24;
  const adjustments: string[] = [];

  // Foundation includes basement
  if (structure.foundation.includes("basement")) {
    buildWeeks += 3;
    adjustments.push("Excavation + basement construction (+3 weeks)");
  }

  // Finished basement
  if (structure.basementFinish === "finished") {
    buildWeeks += 3;
    adjustments.push("Basement finish-out (+3 weeks)");
  }

  // Multi-story
  if (structure.layout === "two-story" || structure.floors >= 2) {
    buildWeeks += 2;
    adjustments.push("Multi-story framing (+2 weeks)");
  }

  // Elevator
  if (structure.elevator !== "none" && structure.elevator !== "") {
    buildWeeks += 4;
    adjustments.push("Elevator shaft and installation (+4 weeks)");
  }

  // ADU
  if (structure.adu !== "none" && structure.adu !== "") {
    buildWeeks += 6;
    adjustments.push("ADU construction (+6 weeks)");
  }

  // High-end kitchen
  if (interior.kitchenFinish === "high-end") {
    buildWeeks += 1;
    adjustments.push("Custom cabinet lead time (+1 week)");
  }

  // Fire sprinkler
  if (structure.fireSystem === "sprinklered" || structure.fireSystem === "alarm-sprinkler") {
    buildWeeks += 1;
    adjustments.push("Fire sprinkler rough-in (+1 week)");
  }

  // Hardwood flooring
  if (interior.flooring === "hardwood") {
    buildWeeks += 1;
    adjustments.push("Hardwood acclimation and finishing (+1 week)");
  }

  // 3+ floors
  if (structure.floors >= 3) {
    buildWeeks += 4;
    adjustments.push("Additional floor construction cycles (+4 weeks)");
  }

  // Unit count scaling
  const unitCount = unitConfig?.unitCount ?? 0;
  if (unitCount > 2) {
    const extra = Math.round((unitCount - 2) * 1.5);
    buildWeeks += extra;
    adjustments.push(`Per-unit rough-in scaling (+${extra} weeks)`);
  }

  // Assemble phases
  const phases: PhaseSchedule[] = Object.entries(FIXED_PHASE_WEEKS).map(
    ([phase, weeks]) => ({ phase, durationWeeks: weeks, adjustments: [] }),
  );

  // Insert BUILD in the correct position (after ASSEMBLE, before VERIFY)
  const verifyIdx = phases.findIndex((p) => p.phase === "VERIFY");
  phases.splice(verifyIdx, 0, {
    phase: "BUILD",
    durationWeeks: buildWeeks,
    adjustments,
  });

  const totalWeeks = phases.reduce((sum, p) => sum + p.durationWeeks, 0);

  return { totalWeeks, phases };
}

// ---------------------------------------------------------------------------
// 3. Required Inspections
// ---------------------------------------------------------------------------

export interface InspectionRequirement {
  name: string;
  phase: string;
  timing: string;
  reason: string;
}

export function getRequiredInspections(
  structure: StructureSelections,
  interior: InteriorSelections,
  _site: SiteSelections,
  unitConfig: UnitConfigSelections | undefined,
  market: string,
): InspectionRequirement[] {
  const inspections: InspectionRequirement[] = [
    // --- Always required ---
    { name: "Foundation inspection", phase: "BUILD", timing: "Before backfill", reason: "Verify footing dimensions and rebar placement" },
    { name: "Framing inspection", phase: "BUILD", timing: "Before closing walls", reason: "Verify structural framing" },
    { name: "Rough plumbing", phase: "BUILD", timing: "Before closing walls", reason: "Verify pipe routing and connections" },
    { name: "Rough electrical", phase: "BUILD", timing: "Before closing walls", reason: "Verify wiring and panel" },
    { name: "Insulation inspection", phase: "BUILD", timing: "Before drywall", reason: "Verify R-value and coverage" },
    { name: "Final building inspection", phase: "VERIFY", timing: "Before occupancy", reason: "Certificate of occupancy" },
  ];

  // --- Conditional ---

  if (structure.foundation.includes("basement")) {
    inspections.push({
      name: "Excavation/footing inspection",
      phase: "BUILD",
      timing: "Before pour",
      reason: "Verify excavation depth and footing formwork",
    });
  }

  if (structure.elevator !== "none" && structure.elevator !== "") {
    inspections.push({
      name: "Elevator inspection",
      phase: "VERIFY",
      timing: "Before certificate",
      reason: "Verify elevator safety and code compliance",
    });
  }

  if (
    structure.fireSystem !== "extinguishers" &&
    structure.fireSystem !== "none" &&
    structure.fireSystem !== ""
  ) {
    inspections.push({
      name: "Fire marshal inspection",
      phase: "VERIFY",
      timing: "Sprinkler test",
      reason: "Verify fire suppression system functionality",
    });
  }

  if (structure.adaCompliance !== "none" && structure.adaCompliance !== "") {
    inspections.push({
      name: "ADA compliance inspection",
      phase: "VERIFY",
      timing: "Before occupancy",
      reason: "Verify accessibility requirements are met",
    });
  }

  if (unitConfig?.utilities === "all-separate") {
    inspections.push({
      name: "Meter installation inspection",
      phase: "BUILD",
      timing: "Per utility",
      reason: "Verify separate utility meter installation",
    });
  }

  if (structure.basementEgress === "yes") {
    inspections.push({
      name: "Egress window inspection",
      phase: "BUILD",
      timing: "Before backfill",
      reason: "Verify egress window size and well dimensions",
    });
  }

  if (_site.security !== "none" && _site.security !== "") {
    inspections.push({
      name: "Security system inspection",
      phase: "VERIFY",
      timing: "Before occupancy",
      reason: "Verify security system installation and monitoring",
    });
  }

  if (interior.waterHeater === "solar") {
    inspections.push({
      name: "Solar installation inspection",
      phase: "BUILD",
      timing: "Before connection",
      reason: "Verify solar panel mounting and electrical connection",
    });
  }

  if (structure.adu !== "none" && structure.adu !== "") {
    inspections.push({
      name: "ADU separate inspection",
      phase: "VERIFY",
      timing: "Before ADU occupancy",
      reason: "Verify ADU meets independent dwelling requirements",
    });
  }

  // Market-specific
  if (market === "USA") {
    inspections.push({
      name: "Energy code inspection",
      phase: "BUILD",
      timing: "Before drywall",
      reason: "Verify energy code compliance (envelope, HVAC, lighting)",
    });
  } else {
    // West Africa markets (TOGO, GHANA, BENIN) — fewer formal inspections
    inspections.push({
      name: "Municipal site compliance check",
      phase: "BUILD",
      timing: "During construction",
      reason:
        "Formal inspection infrastructure is limited; coordinate with local authorities for periodic site reviews",
    });
  }

  return inspections;
}

// ---------------------------------------------------------------------------
// 4. Photo Categories
// ---------------------------------------------------------------------------

export function getPhotoCategories(
  structure: StructureSelections,
  interior: InteriorSelections,
  site: SiteSelections,
  unitConfig?: UnitConfigSelections,
): string[] {
  const categories: string[] = [
    // --- Always ---
    "Site before construction",
    "Foundation",
    "Framing",
    "Roof installation",
    "Exterior finish",
    "Rough plumbing",
    "Rough electrical",
    "Insulation",
    "Drywall",
    "Kitchen",
    "Bathrooms",
    "Flooring installation",
    "Final exterior",
    "Final interior",
  ];

  // --- Conditional ---

  const hasBasement = structure.foundation.includes("basement");
  if (hasBasement) {
    categories.push("Excavation", "Basement waterproofing", "Basement finish");
  }

  if (structure.elevator !== "none" && structure.elevator !== "") {
    categories.push("Elevator shaft", "Elevator installation");
  }

  if (structure.adu !== "none" && structure.adu !== "") {
    categories.push("ADU construction", "ADU interior");
  }

  if (site.landscaping !== "none" && site.landscaping !== "minimal" && site.landscaping !== "") {
    categories.push("Landscaping");
  }

  if (site.fencing !== "none" && site.fencing !== "" && site.fencing !== undefined) {
    categories.push("Fencing/walls");
  }

  if (structure.rooftopFeatures && structure.rooftopFeatures.length > 0) {
    categories.push("Rooftop features");
  }

  if (site.garage !== "none" && site.garage !== "" && site.garage !== undefined) {
    categories.push("Garage");
  }

  if (site.driveway !== "none" && site.driveway !== "") {
    categories.push("Driveway/paving");
  }

  if (site.security !== "none" && site.security !== "") {
    categories.push("Security installation");
  }

  if (interior.smartHome !== "none" && interior.smartHome !== "") {
    categories.push("Smart home wiring");
  }

  // Per-unit photo categories for multi-unit properties
  if (unitConfig && unitConfig.unitCount > 1) {
    const count = unitConfig.unitCount;
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (count <= 6) {
      for (let i = 0; i < count; i++) {
        categories.push(`Unit ${labels[i]} interior`);
      }
    } else {
      categories.push("Per-unit interiors");
    }
  }

  return categories;
}
