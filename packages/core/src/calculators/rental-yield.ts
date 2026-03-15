import type { RentalYieldInput, RentalYieldResult } from "../types";

/**
 * Calculate rental investment yield metrics: gross yield, net yield,
 * cap rate, cash-on-cash return, and break-even timeline.
 */
export function calculateRentalYield(input: RentalYieldInput): RentalYieldResult {
  const { totalCost, monthlyRent, vacancyRatePct, annualExpensesPct, financingCost } = input;

  const monthlyFinancing = financingCost ?? 0;

  // Gross annual rental income
  const grossAnnual = monthlyRent * 12;

  // Effective gross income (adjusted for vacancy)
  const effectiveIncome = grossAnnual * (1 - vacancyRatePct / 100);

  // Annual operating expenses
  const annualExpenses = totalCost * (annualExpensesPct / 100);

  // Net Operating Income
  const noi = effectiveIncome - annualExpenses;

  // Yield percentages
  const grossYield = round2((grossAnnual / totalCost) * 100);
  const netYield = round2((noi / totalCost) * 100);
  const capRate = round2((noi / totalCost) * 100);

  // Cash flow
  const monthlyCashFlow = round2(noi / 12 - monthlyFinancing);
  const annualCashFlow = round2(monthlyCashFlow * 12);

  // Cash-on-cash return
  const cashOnCashReturn =
    monthlyFinancing === 0
      ? capRate
      : round2((annualCashFlow / totalCost) * 100);

  // Break-even
  const breakEvenMonths =
    monthlyCashFlow > 0 ? Math.ceil(totalCost / monthlyCashFlow) : Infinity;

  const formula = [
    `Gross annual income = $${monthlyRent.toFixed(2)} * 12 = $${grossAnnual.toFixed(2)}`,
    `Vacancy adjustment = ${vacancyRatePct}%`,
    `Effective income = $${grossAnnual.toFixed(2)} * (1 - ${vacancyRatePct}%) = $${effectiveIncome.toFixed(2)}`,
    `Annual expenses = $${totalCost.toFixed(2)} * ${annualExpensesPct}% = $${annualExpenses.toFixed(2)}`,
    `NOI = $${effectiveIncome.toFixed(2)} - $${annualExpenses.toFixed(2)} = $${noi.toFixed(2)}`,
    `Gross yield = $${grossAnnual.toFixed(2)} / $${totalCost.toFixed(2)} * 100 = ${grossYield}%`,
    `Net yield = $${noi.toFixed(2)} / $${totalCost.toFixed(2)} * 100 = ${netYield}%`,
    `Cap rate = NOI / total cost * 100 = ${capRate}%`,
    `Monthly cash flow = $${(noi / 12).toFixed(2)} - $${monthlyFinancing.toFixed(2)} = $${monthlyCashFlow.toFixed(2)}`,
    `Annual cash flow = $${monthlyCashFlow.toFixed(2)} * 12 = $${annualCashFlow.toFixed(2)}`,
    `Cash-on-cash return = ${cashOnCashReturn}%`,
    `Break-even = $${totalCost.toFixed(2)} / $${monthlyCashFlow.toFixed(2)} = ${breakEvenMonths === Infinity ? "Never (negative cash flow)" : `${breakEvenMonths} months`}`,
  ].join("\n");

  return {
    grossYield,
    netYield,
    capRate,
    cashOnCashReturn,
    monthlyCashFlow,
    annualCashFlow,
    breakEvenMonths,
    formula,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
