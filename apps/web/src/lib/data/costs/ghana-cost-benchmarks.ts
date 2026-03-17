import type { CostBenchmark, CostBreakdown } from "./types";

/**
 * Ghana residential construction cost benchmarks by region.
 *
 * Sources:
 * - Ghana Statistical Service construction price indices
 * - World Bank / AfDB construction sector reports
 * - Turner & Townsend International Construction Cost Survey
 * - Local builder surveys (Accra, Kumasi, Tamale)
 *
 * Construction primarily concrete block with reinforced concrete frame.
 * Costs in GHS (Ghana cedis). National average: ~4,000 GHS/m2 standard finish.
 *
 * Last updated: 2025 Q3 estimates
 */

const GHANA_STANDARD_BREAKDOWN: CostBreakdown = {
  sitePrep: 5,
  foundation: 13,
  structure: 22,    // sandcrete blocks + RC frame
  roofing: 10,      // aluminum roofing sheets or tiles
  exterior: 7,      // plastering + painting
  plumbing: 8,
  electrical: 7,
  hvac: 2,          // ceiling fans, occasional AC in premium
  interior: 15,     // tiling, joinery, painting
  permits: 3,       // Lands Commission + building permit
  contingency: 8,
};

function ghanaBenchmark(
  regionName: string,
  costPerM2: number,
  multiplier: number,
): CostBenchmark {
  return {
    region: regionName,
    country: "GHANA",
    costPerUnit: costPerM2,
    unit: "m2",
    currency: "GHS",
    multiplier,
    breakdown: GHANA_STANDARD_BREAKDOWN,
    finishLevel: "standard",
    lastUpdated: "2025-Q3",
    source: "Ghana Stat. Service, World Bank/AfDB estimates",
  };
}

/**
 * Region-level cost per m2 for standard residential construction.
 * Greater Accra is the most expensive (high demand, land scarcity).
 * Northern regions are cheaper for labor but material transport adds cost.
 *
 * National average: ~4,000 GHS/m2 (standard finish)
 */
export const GHANA_COST_BENCHMARKS: CostBenchmark[] = [
  ghanaBenchmark("Greater Accra", 5200, 1.30),
  ghanaBenchmark("Ashanti",       4200, 1.05),
  ghanaBenchmark("Western",       3900, 0.98),
  ghanaBenchmark("Central",       3700, 0.93),
  ghanaBenchmark("Eastern",       3600, 0.90),
  ghanaBenchmark("Volta",         3400, 0.85),
  ghanaBenchmark("Northern",      3200, 0.80),
  ghanaBenchmark("Upper East",    3000, 0.75),
  ghanaBenchmark("Upper West",    3000, 0.75),
  ghanaBenchmark("Brong-Ahafo",   3500, 0.88),
  ghanaBenchmark("Western North", 3600, 0.90),
  ghanaBenchmark("Ahafo",         3400, 0.85),
  ghanaBenchmark("Bono East",     3400, 0.85),
  ghanaBenchmark("Oti",           3200, 0.80),
  ghanaBenchmark("North East",    3000, 0.75),
  ghanaBenchmark("Savannah",      3100, 0.78),
];
