import type { CostBenchmark, CostBreakdown } from "./types";

/**
 * Togo residential construction cost benchmarks by region.
 *
 * Sources:
 * - World Bank / AfDB construction sector reports for West Africa
 * - Local builder surveys (Lome, Kpalime, Sokode)
 * - Turner & Townsend International Construction Cost Survey
 *
 * Construction in Togo is primarily reinforced concrete block (parpaing)
 * with poteau-poutre (post-and-beam) structure. No HVAC in most builds.
 * Costs in XOF (CFA franc). National average: ~200,000 XOF/m2 standard finish.
 *
 * Last updated: 2025 Q3 estimates
 */

const TOGO_STANDARD_BREAKDOWN: CostBreakdown = {
  sitePrep: 5,
  foundation: 14,
  structure: 22,    // parpaing walls + poteau-poutre
  roofing: 10,      // tole (corrugated metal) or concrete slab
  exterior: 8,      // enduit (render/plaster) + paint
  plumbing: 7,
  electrical: 6,
  hvac: 0,          // not typical in residential
  interior: 16,     // carrelage (tiles), peinture, menuiserie
  permits: 3,       // titre foncier + permis de construire
  contingency: 9,
};

function togoBenchmark(
  regionName: string,
  costPerM2: number,
  multiplier: number,
): CostBenchmark {
  return {
    region: regionName,
    country: "TOGO",
    costPerUnit: costPerM2,
    unit: "m2",
    currency: "XOF",
    multiplier,
    breakdown: TOGO_STANDARD_BREAKDOWN,
    finishLevel: "standard",
    lastUpdated: "2025-Q3",
    source: "World Bank/AfDB estimates, local surveys",
  };
}

/**
 * Region-level cost per m2 for standard residential construction.
 * Lome (Maritime) is the most expensive due to demand and transport.
 * Northern regions are cheaper due to lower labor costs but higher
 * material transport costs (partially offsetting).
 *
 * National average: ~200,000 XOF/m2 (standard finish, parpaing construction)
 */
export const TOGO_COST_BENCHMARKS: CostBenchmark[] = [
  togoBenchmark("Maritime",  230000, 1.15),   // Lome metro premium
  togoBenchmark("Plateaux",  185000, 0.93),
  togoBenchmark("Centrale",  175000, 0.88),
  togoBenchmark("Kara",      170000, 0.85),
  togoBenchmark("Savanes",   165000, 0.83),
];
