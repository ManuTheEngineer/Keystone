import type { ContingencyInput, ContingencyResult, ContingencyAdjustment } from "../types";

const BASE_PCT: Record<string, number> = {
  simple: 10,
  moderate: 15,
  complex: 20,
};

const MARKET_ADJUSTMENT: Record<string, number> = {
  USA: 0,
  TOGO: 3,
  GHANA: 3,
  BENIN: 3,
};

const MAX_CONTINGENCY = 30;

/**
 * Calculate a risk-adjusted contingency percentage and dollar amount.
 *
 * Base rates by complexity, with adjustments for market, project phase,
 * and builder experience. Capped at 30%.
 */
export function calculateContingency(input: ContingencyInput): ContingencyResult {
  const { baseBudget, complexity, market, phaseIndex, firstTimeBuild } = input;

  const basePct = BASE_PCT[complexity] ?? 15;
  const adjustments: ContingencyAdjustment[] = [];

  // Market adjustment
  const marketAdj = MARKET_ADJUSTMENT[market.toUpperCase()] ?? 0;
  if (marketAdj !== 0) {
    adjustments.push({ factor: `Market (${market})`, adjustment: marketAdj });
  }

  // Phase adjustment: early (0-2) +3%, mid (3-5) +0%, late (6-8) -2%
  let phaseAdj: number;
  if (phaseIndex <= 2) {
    phaseAdj = 3;
    adjustments.push({ factor: `Early phase (index ${phaseIndex})`, adjustment: phaseAdj });
  } else if (phaseIndex <= 5) {
    phaseAdj = 0;
    // No adjustment entry needed for zero
  } else {
    phaseAdj = -2;
    adjustments.push({ factor: `Late phase (index ${phaseIndex})`, adjustment: phaseAdj });
  }

  // First-time builder
  if (firstTimeBuild) {
    adjustments.push({ factor: "First-time builder", adjustment: 5 });
  }

  const totalAdjustment = adjustments.reduce((sum, a) => sum + a.adjustment, 0);
  const rawPct = basePct + totalAdjustment;
  const adjustedPct = Math.min(rawPct, MAX_CONTINGENCY);
  const contingencyAmount = round2(baseBudget * (adjustedPct / 100));

  const formulaLines = [
    `Base contingency (${complexity}) = ${basePct}%`,
    ...adjustments.map((a) => `  ${a.factor}: ${a.adjustment >= 0 ? "+" : ""}${a.adjustment}%`),
    `Raw total = ${basePct}% + ${totalAdjustment >= 0 ? "+" : ""}${totalAdjustment}% = ${rawPct}%`,
    rawPct > MAX_CONTINGENCY ? `Capped at ${MAX_CONTINGENCY}%` : "",
    `Adjusted contingency = ${adjustedPct}%`,
    `Contingency amount = $${baseBudget.toFixed(2)} * ${adjustedPct}% = $${contingencyAmount.toFixed(2)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    basePct,
    adjustedPct,
    contingencyAmount,
    adjustments,
    formula: formulaLines,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
