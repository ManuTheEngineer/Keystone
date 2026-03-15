import type { LoanQualificationInput, LoanQualificationResult } from "../types";

/**
 * Calculate the maximum loan a borrower qualifies for based on income,
 * debts, and loan terms. Uses the standard back-end DTI ceiling of 43%.
 */
export function calculateLoanQualification(
  input: LoanQualificationInput
): LoanQualificationResult {
  const {
    annualIncome,
    monthlyDebts,
    creditScore,
    downPaymentPct,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    insuranceAnnual,
  } = input;

  const DTI_LIMIT = 0.43;
  const monthlyIncome = annualIncome / 12;
  const monthlyInsurance = insuranceAnnual / 12;
  const r = interestRate / 100 / 12; // monthly interest rate
  const n = loanTermYears * 12; // number of payments

  // Maximum allowable total monthly housing + debt payment
  const maxTotalPayment = monthlyIncome * DTI_LIMIT;
  const maxHousingPayment = maxTotalPayment - monthlyDebts;

  const disqualifyReasons: string[] = [];

  if (maxHousingPayment <= 0) {
    disqualifyReasons.push(
      "Existing monthly debts exceed 43% DTI limit with no room for housing payment"
    );
    return {
      maxLoanAmount: 0,
      maxHomePrice: 0,
      monthlyPayment: 0,
      monthlyPITI: 0,
      dtiRatio: (monthlyDebts / monthlyIncome) * 100,
      totalInterest: 0,
      qualified: false,
      disqualifyReasons,
      formula: buildFormula(input, 0, 0, 0, 0, monthlyDebts / monthlyIncome),
    };
  }

  if (creditScore !== undefined && creditScore < 620) {
    disqualifyReasons.push(
      `Credit score ${creditScore} is below the conventional minimum of 620`
    );
  }

  // Solve for max home price:
  // PITI = P&I + tax + insurance
  // P&I = L * [r(1+r)^n] / [(1+r)^n - 1]   where L = homePrice * (1 - downPaymentPct/100)
  // tax = homePrice * propertyTaxRate / 100 / 12
  // We need: P&I + tax + insurance <= maxHousingPayment
  //
  // Let loanFraction = 1 - downPaymentPct/100
  // Let annuityFactor = r*(1+r)^n / ((1+r)^n - 1)   (payment per $1 of loan)
  // P&I = homePrice * loanFraction * annuityFactor
  // tax = homePrice * propertyTaxRate / 100 / 12
  //
  // homePrice * (loanFraction * annuityFactor + propertyTaxRate/100/12) + insurance <= maxHousingPayment
  // homePrice = (maxHousingPayment - insurance) / (loanFraction * annuityFactor + propertyTaxRate/100/12)

  const loanFraction = 1 - downPaymentPct / 100;

  let annuityFactor: number;
  if (r === 0) {
    // Zero-interest edge case
    annuityFactor = 1 / n;
  } else {
    const compounded = Math.pow(1 + r, n);
    annuityFactor = (r * compounded) / (compounded - 1);
  }

  const monthlyTaxRatePerDollar = propertyTaxRate / 100 / 12;
  const denominator = loanFraction * annuityFactor + monthlyTaxRatePerDollar;

  const availableForMortgageAndTax = maxHousingPayment - monthlyInsurance;

  if (availableForMortgageAndTax <= 0) {
    disqualifyReasons.push(
      "Insurance alone exceeds the maximum allowable housing payment"
    );
    return {
      maxLoanAmount: 0,
      maxHomePrice: 0,
      monthlyPayment: 0,
      monthlyPITI: 0,
      dtiRatio: (monthlyDebts / monthlyIncome) * 100,
      totalInterest: 0,
      qualified: false,
      disqualifyReasons,
      formula: buildFormula(input, 0, 0, 0, 0, monthlyDebts / monthlyIncome),
    };
  }

  const maxHomePrice = Math.floor(availableForMortgageAndTax / denominator);
  const maxLoanAmount = Math.floor(maxHomePrice * loanFraction);
  const monthlyPayment = round2(maxLoanAmount * annuityFactor);
  const monthlyTax = round2((maxHomePrice * propertyTaxRate) / 100 / 12);
  const monthlyPITI = round2(monthlyPayment + monthlyTax + monthlyInsurance);
  const dtiRatio = round4((monthlyPITI + monthlyDebts) / monthlyIncome);
  const totalInterest = round2(monthlyPayment * n - maxLoanAmount);
  const qualified = disqualifyReasons.length === 0 && dtiRatio <= DTI_LIMIT;

  if (dtiRatio > DTI_LIMIT && disqualifyReasons.length === 0) {
    disqualifyReasons.push(
      `Back-end DTI ratio ${(dtiRatio * 100).toFixed(1)}% exceeds the 43% limit`
    );
  }

  return {
    maxLoanAmount,
    maxHomePrice,
    monthlyPayment,
    monthlyPITI,
    dtiRatio: round4(dtiRatio * 100),
    totalInterest,
    qualified,
    disqualifyReasons,
    formula: buildFormula(
      input,
      maxHomePrice,
      maxLoanAmount,
      monthlyPayment,
      monthlyPITI,
      dtiRatio
    ),
  };
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

function buildFormula(
  input: LoanQualificationInput,
  maxHomePrice: number,
  maxLoanAmount: number,
  monthlyPayment: number,
  monthlyPITI: number,
  dtiRatio: number
): string {
  return [
    `Monthly income = $${(input.annualIncome / 12).toFixed(2)}`,
    `DTI limit = 43%`,
    `Max total payment = monthly income * 0.43 = $${((input.annualIncome / 12) * 0.43).toFixed(2)}`,
    `Max housing payment = max total - monthly debts = $${((input.annualIncome / 12) * 0.43 - input.monthlyDebts).toFixed(2)}`,
    `Loan fraction = 1 - ${input.downPaymentPct}% = ${(1 - input.downPaymentPct / 100).toFixed(4)}`,
    `Monthly rate r = ${input.interestRate}% / 12 = ${(input.interestRate / 100 / 12).toFixed(6)}`,
    `Payments n = ${input.loanTermYears} * 12 = ${input.loanTermYears * 12}`,
    `Annuity factor = r*(1+r)^n / ((1+r)^n - 1)`,
    `Max home price = $${maxHomePrice.toFixed(2)}`,
    `Max loan = home price * loan fraction = $${maxLoanAmount.toFixed(2)}`,
    `Monthly P&I = $${monthlyPayment.toFixed(2)}`,
    `Monthly PITI = $${monthlyPITI.toFixed(2)}`,
    `Back-end DTI = ${(dtiRatio * 100).toFixed(2)}%`,
  ].join("\n");
}
