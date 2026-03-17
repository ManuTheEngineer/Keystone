import type { Market } from "@/lib/services/project-service";
import type { CostBenchmark, BudgetEstimate, BudgetEstimateItem } from "./types";
import { US_COST_BENCHMARKS } from "./us-cost-benchmarks";
import { TOGO_COST_BENCHMARKS } from "./togo-cost-benchmarks";
import { GHANA_COST_BENCHMARKS } from "./ghana-cost-benchmarks";
import { BENIN_COST_BENCHMARKS } from "./benin-cost-benchmarks";

export type { CostBenchmark, CostBreakdown, BudgetEstimate, BudgetEstimateItem } from "./types";

/** Get cost benchmark for a given market + region (state code or region name) */
export function getCostBenchmark(
  market: Market,
  region: string,
): CostBenchmark | undefined {
  let benchmarks: CostBenchmark[];
  switch (market) {
    case "USA": benchmarks = US_COST_BENCHMARKS; break;
    case "TOGO": benchmarks = TOGO_COST_BENCHMARKS; break;
    case "GHANA": benchmarks = GHANA_COST_BENCHMARKS; break;
    case "BENIN": benchmarks = BENIN_COST_BENCHMARKS; break;
    default: return undefined;
  }
  return benchmarks.find((b) => b.region === region);
}

/** Get all benchmarks for a market */
export function getAllBenchmarks(market: Market): CostBenchmark[] {
  switch (market) {
    case "USA": return US_COST_BENCHMARKS;
    case "TOGO": return TOGO_COST_BENCHMARKS;
    case "GHANA": return GHANA_COST_BENCHMARKS;
    case "BENIN": return BENIN_COST_BENCHMARKS;
    default: return [];
  }
}

/** Size range label → approximate square footage or square meters */
const SIZE_RANGE_SQFT: Record<string, number> = {
  small: 1200,
  medium: 2000,
  large: 3200,
  xlarge: 4500,
};

const SIZE_RANGE_M2: Record<string, number> = {
  small: 110,
  medium: 185,
  large: 300,
  xlarge: 420,
};

/** Friendly category names for budget line items */
const CATEGORY_LABELS: Record<string, string> = {
  sitePrep: "Site preparation",
  foundation: "Foundation",
  structure: "Framing / Structure",
  roofing: "Roofing",
  exterior: "Exterior / Envelope",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  interior: "Interior finishes",
  permits: "Permits & fees",
  contingency: "Contingency",
};

/**
 * Generate a complete budget estimate from benchmark data.
 * Returns itemized estimates or undefined if no benchmark exists.
 */
export function generateBudgetEstimate(
  market: Market,
  region: string,
  sizeRange: string,
): BudgetEstimate | undefined {
  const benchmark = getCostBenchmark(market, region);
  if (!benchmark) return undefined;

  const sizeMap = benchmark.unit === "sqft" ? SIZE_RANGE_SQFT : SIZE_RANGE_M2;
  const size = sizeMap[sizeRange] ?? sizeMap.medium;
  const totalEstimate = Math.round(benchmark.costPerUnit * size);

  const items: BudgetEstimateItem[] = [];
  for (const [key, pct] of Object.entries(benchmark.breakdown)) {
    if (pct === 0) continue; // skip HVAC for WA
    items.push({
      category: CATEGORY_LABELS[key] ?? key,
      estimated: Math.round(totalEstimate * (pct / 100)),
      pct,
    });
  }

  return {
    totalEstimate,
    currency: benchmark.currency,
    unit: benchmark.unit,
    costPerUnit: benchmark.costPerUnit,
    region: benchmark.region,
    finishLevel: benchmark.finishLevel,
    items,
    source: benchmark.source,
    lastUpdated: benchmark.lastUpdated,
  };
}

/** Format a cost benchmark for display */
export function formatCostPerUnit(benchmark: CostBenchmark): string {
  if (benchmark.currency === "XOF") {
    return `${(benchmark.costPerUnit).toLocaleString()} FCFA/${benchmark.unit}`;
  }
  if (benchmark.currency === "GHS") {
    return `GH₵${benchmark.costPerUnit.toLocaleString()}/${benchmark.unit}`;
  }
  return `$${benchmark.costPerUnit}/${benchmark.unit}`;
}

/** Get a multiplier description relative to national average */
export function formatMultiplier(multiplier: number): string {
  if (multiplier === 1.0) return "National average";
  const pct = Math.abs(Math.round((multiplier - 1) * 100));
  return multiplier > 1
    ? `${pct}% above national average`
    : `${pct}% below national average`;
}
