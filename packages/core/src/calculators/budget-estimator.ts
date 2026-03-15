import type {
  BudgetEstimateInput,
  BudgetEstimateResult,
  BudgetLineItem,
  CostBenchmark,
} from "../types";

/**
 * Estimate a construction budget from cost benchmarks.
 *
 * Benchmarks are injected as a parameter so the calculator remains
 * pure and can be used in any environment (web, Cloud Functions, etc.).
 */
export function estimateBudget(
  input: BudgetEstimateInput,
  benchmarks: CostBenchmark[]
): BudgetEstimateResult {
  const { size, qualityLevel, contingencyPct } = input;

  const lineItems: BudgetLineItem[] = benchmarks.map((b) => {
    let rate: number;
    switch (qualityLevel) {
      case "low":
        rate = b.lowRange;
        break;
      case "mid":
        rate = b.midRange;
        break;
      case "high":
        rate = b.highRange;
        break;
    }

    const amount = round2(rate * size);
    return {
      category: b.category,
      amount,
      perUnit: rate,
    };
  });

  const subtotal = round2(lineItems.reduce((sum, li) => sum + li.amount, 0));
  const contingency = round2(subtotal * (contingencyPct / 100));
  const total = round2(subtotal + contingency);
  const perUnitCost = size > 0 ? round2(total / size) : 0;

  const formulaLines = [
    `Market: ${input.market} | Property: ${input.propertyType} | Quality: ${qualityLevel}`,
    `Size: ${size} ${benchmarks[0]?.unit ?? "units"}`,
    "",
    "Line items:",
    ...lineItems.map(
      (li) =>
        `  ${li.category}: $${li.perUnit.toFixed(2)}/${benchmarks.find((b) => b.category === li.category)?.unit ?? "unit"} * ${size} = $${li.amount.toFixed(2)}`
    ),
    "",
    `Subtotal = $${subtotal.toFixed(2)}`,
    `Contingency = $${subtotal.toFixed(2)} * ${contingencyPct}% = $${contingency.toFixed(2)}`,
    `Total = $${subtotal.toFixed(2)} + $${contingency.toFixed(2)} = $${total.toFixed(2)}`,
    `Per-unit cost = $${total.toFixed(2)} / ${size} = $${perUnitCost.toFixed(2)}`,
  ];

  return {
    lineItems,
    subtotal,
    contingency,
    total,
    perUnitCost,
    formula: formulaLines.join("\n"),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
