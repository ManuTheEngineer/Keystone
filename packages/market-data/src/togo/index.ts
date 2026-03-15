import type { MarketConfig } from "../types";
import { XOF_CONFIG } from "../utils/currency";
import { TOGO_COST_BENCHMARKS } from "./costs";
import { TOGO_PHASES } from "./phases";
import { TOGO_TRADES } from "./trades";
import { TOGO_INSPECTIONS } from "./inspections";
import { TOGO_REGULATIONS } from "./regulations";
import { TOGO_LAND_TENURE } from "./land-tenure";
import { TOGO_EDUCATION } from "./education";
import { TOGO_TEMPLATES } from "./templates";
import { TOGO_GLOSSARY } from "./glossary";

export const TOGO_MARKET: MarketConfig = {
  market: "TOGO",
  currency: XOF_CONFIG,
  phases: TOGO_PHASES,
  costBenchmarks: TOGO_COST_BENCHMARKS,
  trades: TOGO_TRADES,
  inspections: TOGO_INSPECTIONS,
  financing: [],
  regulations: [...TOGO_REGULATIONS, ...TOGO_LAND_TENURE],
  education: TOGO_EDUCATION,
  documentTemplates: TOGO_TEMPLATES,
  glossary: TOGO_GLOSSARY,
};
