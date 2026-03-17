import type { CostBenchmark, CostBreakdown } from "./types";

/**
 * Benin residential construction cost benchmarks by department.
 *
 * Sources:
 * - World Bank / AfDB construction sector reports for West Africa
 * - INStaD (Institut National de la Statistique et de la Demographie)
 * - Local builder surveys (Cotonou, Porto-Novo, Parakou)
 *
 * Construction primarily concrete block with reinforced concrete frame,
 * similar to Togo. Costs in XOF (CFA franc).
 * National average: ~210,000 XOF/m2 standard finish.
 *
 * Last updated: 2025 Q3 estimates
 */

const BENIN_STANDARD_BREAKDOWN: CostBreakdown = {
  sitePrep: 5,
  foundation: 14,
  structure: 22,
  roofing: 10,
  exterior: 7,
  plumbing: 7,
  electrical: 6,
  hvac: 0,
  interior: 16,
  permits: 4,       // ANDF + permis de construire
  contingency: 9,
};

function beninBenchmark(
  regionName: string,
  costPerM2: number,
  multiplier: number,
): CostBenchmark {
  return {
    region: regionName,
    country: "BENIN",
    costPerUnit: costPerM2,
    unit: "m2",
    currency: "XOF",
    multiplier,
    breakdown: BENIN_STANDARD_BREAKDOWN,
    finishLevel: "standard",
    lastUpdated: "2025-Q3",
    source: "World Bank/AfDB estimates, INStaD, local surveys",
  };
}

/**
 * Department-level cost per m2 for standard residential construction.
 * Littoral (Cotonou) is the most expensive.
 * National average: ~210,000 XOF/m2 (standard finish)
 */
export const BENIN_COST_BENCHMARKS: CostBenchmark[] = [
  beninBenchmark("Littoral",    265000, 1.26),  // Cotonou premium
  beninBenchmark("Atlantique",  235000, 1.12),  // Abomey-Calavi / Ouidah
  beninBenchmark("Oueme",       225000, 1.07),  // Porto-Novo
  beninBenchmark("Plateau",     195000, 0.93),
  beninBenchmark("Mono",        185000, 0.88),
  beninBenchmark("Couffo",      180000, 0.86),
  beninBenchmark("Zou",         195000, 0.93),
  beninBenchmark("Collines",    185000, 0.88),
  beninBenchmark("Borgou",      190000, 0.90),  // Parakou
  beninBenchmark("Alibori",     175000, 0.83),
  beninBenchmark("Atacora",     170000, 0.81),
  beninBenchmark("Donga",       175000, 0.83),
];
