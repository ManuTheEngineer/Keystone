import type { DrawScheduleInput, DrawScheduleResult, DrawEntry } from "../types";

/**
 * Generate a construction draw schedule from milestones with payment
 * percentages. Calculates retainage (5%) and contingency reserves.
 */
export function generateDrawSchedule(input: DrawScheduleInput): DrawScheduleResult {
  const { totalBudget, milestones, contingencyPct } = input;

  const RETAINAGE_PCT = 5;

  const contingencyReserve = round2(totalBudget * (contingencyPct / 100));
  const distributableBudget = round2(totalBudget - contingencyReserve);
  const retainage = round2(distributableBudget * (RETAINAGE_PCT / 100));
  const netDistributable = round2(distributableBudget - retainage);

  let cumulative = 0;
  const draws: DrawEntry[] = milestones.map((m) => {
    const amount = round2(netDistributable * (m.paymentPct / 100));
    cumulative = round2(cumulative + amount);
    return {
      milestone: m.name,
      amount,
      cumulative,
      pct: m.paymentPct,
    };
  });

  const formulaLines = [
    `Total budget = $${totalBudget.toFixed(2)}`,
    `Contingency reserve = $${totalBudget.toFixed(2)} * ${contingencyPct}% = $${contingencyReserve.toFixed(2)}`,
    `Distributable budget = $${totalBudget.toFixed(2)} - $${contingencyReserve.toFixed(2)} = $${distributableBudget.toFixed(2)}`,
    `Retainage (${RETAINAGE_PCT}%) = $${distributableBudget.toFixed(2)} * ${RETAINAGE_PCT}% = $${retainage.toFixed(2)}`,
    `Net distributable = $${distributableBudget.toFixed(2)} - $${retainage.toFixed(2)} = $${netDistributable.toFixed(2)}`,
    "",
    "Draws:",
    ...draws.map(
      (d) =>
        `  ${d.milestone}: ${d.pct}% of $${netDistributable.toFixed(2)} = $${d.amount.toFixed(2)} (cumulative: $${d.cumulative.toFixed(2)})`
    ),
    "",
    `Retainage held back = $${retainage.toFixed(2)} (released upon final completion)`,
  ];

  return {
    draws,
    retainage,
    contingencyReserve,
    formula: formulaLines.join("\n"),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
