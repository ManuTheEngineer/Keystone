export * from "./types";
export * from "./utils/currency";
export { USA_MARKET } from "./usa";
export { TOGO_MARKET } from "./togo";
export { GHANA_MARKET } from "./ghana";
export { BENIN_MARKET } from "./benin";
export {
  getLocationData,
  getClosestLocation,
  adjustCostForLocation,
  getLocationSuggestions,
  getCostComparisonText,
  getClimateLabel,
  formatMonthList,
} from "./locations";
export type { LocationData, ClimateType } from "./locations";

import type { Market, MarketConfig, ProjectPhase, CostBenchmark, PropertyType } from "./types";
import { USA_MARKET } from "./usa";
import { TOGO_MARKET } from "./togo";
import { GHANA_MARKET } from "./ghana";
import { BENIN_MARKET } from "./benin";

const MARKETS: Record<Market, MarketConfig> = {
  USA: USA_MARKET,
  TOGO: TOGO_MARKET,
  GHANA: GHANA_MARKET,
  BENIN: BENIN_MARKET,
};

export function getMarketData(market: Market): MarketConfig {
  return MARKETS[market];
}

export function getCostBenchmarks(market: Market, propertyType?: PropertyType): CostBenchmark[] {
  const config = MARKETS[market];
  if (!propertyType) return config.costBenchmarks;
  return config.costBenchmarks.filter(
    (c) => c.propertyTypes.length === 0 || c.propertyTypes.includes(propertyType)
  );
}

export function getPhaseDefinition(market: Market, phase: ProjectPhase) {
  return MARKETS[market].phases.find((p) => p.phase === phase);
}

export function getGlossaryTerm(market: Market, term: string) {
  return MARKETS[market].glossary.find(
    (g) => g.term.toLowerCase() === term.toLowerCase()
  );
}

export function getTradesForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].trades.filter((t) => t.phases.includes(phase));
}

export function getInspectionsForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].inspections.filter((i) => i.phase === phase);
}

export function getEducationForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].education[phase];
}

export function getTemplatesForPhase(market: Market, phase: ProjectPhase) {
  return MARKETS[market].documentTemplates.filter((t) => t.phase === phase);
}

export const PHASE_ORDER: ProjectPhase[] = [
  "DEFINE", "FINANCE", "LAND", "DESIGN", "APPROVE", "ASSEMBLE", "BUILD", "VERIFY", "OPERATE",
];

export const PHASE_NAMES: Record<ProjectPhase, string> = {
  DEFINE: "Define",
  FINANCE: "Finance",
  LAND: "Land",
  DESIGN: "Design",
  APPROVE: "Approve",
  ASSEMBLE: "Assemble",
  BUILD: "Build",
  VERIFY: "Verify",
  OPERATE: "Operate",
};
