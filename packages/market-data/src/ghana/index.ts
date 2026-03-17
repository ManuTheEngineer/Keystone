import type { MarketConfig } from "../types";
import { GHS_CONFIG } from "../utils/currency";
import { GHANA_COST_BENCHMARKS } from "./costs";
import { GHANA_PHASES } from "./phases";
import { GHANA_TRADES } from "./trades";
import { GHANA_INSPECTIONS } from "./inspections";
import { GHANA_REGULATIONS } from "./regulations";
import { GHANA_LAND_TENURE } from "./land-tenure";
import { GHANA_EDUCATION } from "./education";
import { GHANA_TEMPLATES } from "./templates";
import { GHANA_GLOSSARY } from "./glossary";

export const GHANA_MARKET: MarketConfig = {
  market: "GHANA",
  currency: GHS_CONFIG,
  phases: GHANA_PHASES,
  costBenchmarks: GHANA_COST_BENCHMARKS,
  trades: GHANA_TRADES,
  inspections: GHANA_INSPECTIONS,
  financing: [],
  regulations: [...GHANA_REGULATIONS, ...GHANA_LAND_TENURE],
  education: GHANA_EDUCATION,
  documentTemplates: GHANA_TEMPLATES,
  glossary: GHANA_GLOSSARY,
};
