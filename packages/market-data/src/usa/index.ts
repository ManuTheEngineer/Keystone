import type { MarketConfig } from "../types";
import { USD_CONFIG } from "../utils/currency";
import { USA_COST_BENCHMARKS } from "./costs";
import { USA_PHASES } from "./phases";

export const USA_MARKET: MarketConfig = {
  market: "USA",
  currency: USD_CONFIG,
  phases: USA_PHASES,
  costBenchmarks: USA_COST_BENCHMARKS,
  trades: [],
  inspections: [],
  financing: [],
  regulations: [],
  education: {} as MarketConfig["education"],
  documentTemplates: [],
  glossary: [],
};
