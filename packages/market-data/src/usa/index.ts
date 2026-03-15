import type { MarketConfig } from "../types";
import { USD_CONFIG } from "../utils/currency";
import { USA_REGULATIONS } from "./codes";
import { USA_COST_BENCHMARKS } from "./costs";
import { USA_EDUCATION } from "./education";
import { USA_GLOSSARY } from "./glossary";
import { USA_INSPECTIONS } from "./inspections";
import { USA_FINANCING } from "./loans";
import { USA_PHASES } from "./phases";
import { USA_TEMPLATES } from "./templates";
import { USA_TRADES } from "./trades";

export const USA_MARKET: MarketConfig = {
  market: "USA",
  currency: USD_CONFIG,
  phases: USA_PHASES,
  costBenchmarks: USA_COST_BENCHMARKS,
  trades: USA_TRADES,
  inspections: USA_INSPECTIONS,
  financing: USA_FINANCING,
  regulations: USA_REGULATIONS,
  education: USA_EDUCATION,
  documentTemplates: USA_TEMPLATES,
  glossary: USA_GLOSSARY,
};
