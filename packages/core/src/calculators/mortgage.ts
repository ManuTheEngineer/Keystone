import type { MortgageInput, MortgageResult, MortgageScheduleEntry } from "../types";

/**
 * Calculate a standard fixed-rate mortgage amortization schedule.
 * Returns summary figures and the first 12 months of the schedule.
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { principal, annualInterestRate, termYears } = input;

  const r = annualInterestRate / 100 / 12; // monthly rate
  const n = termYears * 12; // total payments

  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    const compounded = Math.pow(1 + r, n);
    monthlyPayment = principal * (r * compounded) / (compounded - 1);
  }

  monthlyPayment = round2(monthlyPayment);

  // Build full schedule but only keep first 12 entries
  const schedule: MortgageScheduleEntry[] = [];
  let balance = principal;

  for (let month = 1; month <= n; month++) {
    const interestPortion = round2(balance * r);
    const principalPortion = round2(monthlyPayment - interestPortion);
    balance = round2(balance - principalPortion);

    // Correct for final payment rounding
    if (month === n) {
      balance = 0;
    }

    if (month <= 12) {
      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPortion,
        interest: interestPortion,
        balance: Math.max(balance, 0),
      });
    }
  }

  const totalCost = round2(monthlyPayment * n);
  const totalInterest = round2(totalCost - principal);

  const formula = [
    `Principal (P) = $${principal.toFixed(2)}`,
    `Annual rate = ${annualInterestRate}%`,
    `Monthly rate (r) = ${annualInterestRate}% / 12 = ${(r * 100).toFixed(4)}%`,
    `Term = ${termYears} years = ${n} payments`,
    `Monthly payment = P * [r(1+r)^n] / [(1+r)^n - 1]`,
    `Monthly payment = $${principal.toFixed(2)} * [${r.toFixed(6)} * (1+${r.toFixed(6)})^${n}] / [(1+${r.toFixed(6)})^${n} - 1]`,
    `Monthly payment = $${monthlyPayment.toFixed(2)}`,
    `Total cost = $${monthlyPayment.toFixed(2)} * ${n} = $${totalCost.toFixed(2)}`,
    `Total interest = $${totalCost.toFixed(2)} - $${principal.toFixed(2)} = $${totalInterest.toFixed(2)}`,
  ].join("\n");

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    schedule,
    formula,
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
