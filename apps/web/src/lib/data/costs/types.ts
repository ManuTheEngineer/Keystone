import type { Market } from "@/lib/services/project-service";

/** Per-category cost breakdown as a percentage of total (sums to ~100) */
export interface CostBreakdown {
  sitePrep: number;
  foundation: number;
  structure: number;
  roofing: number;
  exterior: number;
  plumbing: number;
  electrical: number;
  hvac: number;
  interior: number;
  permits: number;
  contingency: number;
}

export interface CostBenchmark {
  /** State code (US) or region name (WA) */
  region: string;
  country: Market;
  /** Cost per square foot (US) or per square meter (WA) */
  costPerUnit: number;
  /** "sqft" for US, "m2" for West Africa */
  unit: "sqft" | "m2";
  currency: string;
  /** Cost multiplier vs. national average (1.0 = average) */
  multiplier: number;
  /** Category-level cost breakdown (percentages) */
  breakdown: CostBreakdown;
  /** basic / standard / premium finish level */
  finishLevel: "basic" | "standard" | "premium";
  lastUpdated: string;
  source: string;
}

/**
 * Given a benchmark, size, and property type, compute an estimated total
 * and per-category budget breakdown.
 */
export interface BudgetEstimate {
  totalEstimate: number;
  currency: string;
  unit: "sqft" | "m2";
  costPerUnit: number;
  region: string;
  finishLevel: string;
  items: BudgetEstimateItem[];
  source: string;
  lastUpdated: string;
}

export interface BudgetEstimateItem {
  category: string;
  estimated: number;
  /** Percentage of total */
  pct: number;
}
