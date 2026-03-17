import type { CostBenchmark, CostBreakdown } from "./types";

/**
 * US residential construction cost benchmarks by state.
 *
 * Sources:
 * - NAHB "Cost of Constructing a Home" 2024 ($162/sqft national average)
 * - State-level multipliers from publicly available data (home-cost.com, NAHB surveys)
 * - Category breakdowns based on NAHB cost breakdown surveys
 *
 * These are "standard" finish level estimates for single-family homes.
 * Actual costs vary significantly by city, contractor, and specification.
 *
 * Last updated: 2025 Q4 data
 */

const US_STANDARD_BREAKDOWN: CostBreakdown = {
  sitePrep: 6,
  foundation: 11,
  structure: 18,
  roofing: 6,
  exterior: 8,
  plumbing: 8,
  electrical: 7,
  hvac: 6,
  interior: 18,
  permits: 4,
  contingency: 8,
};

function usBenchmark(
  stateCode: string,
  costPerSqft: number,
  multiplier: number,
): CostBenchmark {
  return {
    region: stateCode,
    country: "USA",
    costPerUnit: costPerSqft,
    unit: "sqft",
    currency: "USD",
    multiplier,
    breakdown: US_STANDARD_BREAKDOWN,
    finishLevel: "standard",
    lastUpdated: "2025-Q4",
    source: "NAHB 2024, state-adjusted",
  };
}

/**
 * State-level cost per sqft for standard residential construction.
 * National average: $162/sqft (NAHB 2024).
 * Multiplier: state cost / national average.
 */
export const US_COST_BENCHMARKS: CostBenchmark[] = [
  usBenchmark("AL", 145, 0.90),
  usBenchmark("AK", 215, 1.33),
  usBenchmark("AZ", 165, 1.02),
  usBenchmark("AR", 140, 0.86),
  usBenchmark("CA", 230, 1.42),
  usBenchmark("CO", 185, 1.14),
  usBenchmark("CT", 200, 1.23),
  usBenchmark("DE", 170, 1.05),
  usBenchmark("FL", 165, 1.02),
  usBenchmark("GA", 150, 0.93),
  usBenchmark("HI", 268, 1.65),
  usBenchmark("ID", 160, 0.99),
  usBenchmark("IL", 175, 1.08),
  usBenchmark("IN", 150, 0.93),
  usBenchmark("IA", 148, 0.91),
  usBenchmark("KS", 145, 0.90),
  usBenchmark("KY", 145, 0.90),
  usBenchmark("LA", 148, 0.91),
  usBenchmark("ME", 175, 1.08),
  usBenchmark("MD", 185, 1.14),
  usBenchmark("MA", 215, 1.33),
  usBenchmark("MI", 155, 0.96),
  usBenchmark("MN", 170, 1.05),
  usBenchmark("MS", 138, 0.85),
  usBenchmark("MO", 148, 0.91),
  usBenchmark("MT", 175, 1.08),
  usBenchmark("NE", 150, 0.93),
  usBenchmark("NV", 168, 1.04),
  usBenchmark("NH", 185, 1.14),
  usBenchmark("NJ", 210, 1.30),
  usBenchmark("NM", 155, 0.96),
  usBenchmark("NY", 220, 1.36),
  usBenchmark("NC", 152, 0.94),
  usBenchmark("ND", 155, 0.96),
  usBenchmark("OH", 150, 0.93),
  usBenchmark("OK", 140, 0.86),
  usBenchmark("OR", 185, 1.14),
  usBenchmark("PA", 170, 1.05),
  usBenchmark("RI", 195, 1.20),
  usBenchmark("SC", 148, 0.91),
  usBenchmark("SD", 152, 0.94),
  usBenchmark("TN", 148, 0.91),
  usBenchmark("TX", 155, 0.96),
  usBenchmark("UT", 172, 1.06),
  usBenchmark("VT", 190, 1.17),
  usBenchmark("VA", 165, 1.02),
  usBenchmark("WA", 195, 1.20),
  usBenchmark("WV", 138, 0.85),
  usBenchmark("WI", 160, 0.99),
  usBenchmark("WY", 165, 1.02),
  usBenchmark("DC", 230, 1.42),
  // Territories
  usBenchmark("PR", 125, 0.77),
  usBenchmark("GU", 200, 1.23),
  usBenchmark("VI", 220, 1.36),
  usBenchmark("AS", 180, 1.11),
  usBenchmark("MP", 190, 1.17),
];
