import type { MarketConfig } from "../types";
import { BENIN_COST_BENCHMARKS } from "./costs";
import { BENIN_PHASES } from "./phases";
import { BENIN_TRADES } from "./trades";
import { BENIN_INSPECTIONS } from "./inspections";
import { BENIN_REGULATIONS } from "./regulations";
import { BENIN_LAND_TENURE } from "./land-tenure";
import { BENIN_EDUCATION } from "./education";
import { BENIN_TEMPLATES } from "./templates";
import { BENIN_GLOSSARY } from "./glossary";

/**
 * Benin uses the same CFA Franc (XOF) as Togo but with
 * a Benin-specific locale for formatting.
 */
const BENIN_XOF_CONFIG = {
  code: "XOF",
  symbol: "FCFA",
  locale: "fr-BJ",
  decimals: 0,
  groupSeparator: " ",
  position: "suffix" as const,
};

export const BENIN_MARKET: MarketConfig = {
  market: "BENIN",
  currency: BENIN_XOF_CONFIG,
  phases: BENIN_PHASES,
  costBenchmarks: BENIN_COST_BENCHMARKS,
  trades: BENIN_TRADES,
  inspections: BENIN_INSPECTIONS,
  financing: [],
  regulations: [...BENIN_REGULATIONS, ...BENIN_LAND_TENURE],
  education: BENIN_EDUCATION,
  documentTemplates: BENIN_TEMPLATES,
  glossary: BENIN_GLOSSARY,
};
