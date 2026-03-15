// ============================================================
// Loan Qualification
// ============================================================

export interface LoanQualificationInput {
  annualIncome: number;
  monthlyDebts: number;
  creditScore?: number;
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  insuranceAnnual: number;
}

export interface LoanQualificationResult {
  maxLoanAmount: number;
  maxHomePrice: number;
  monthlyPayment: number;
  monthlyPITI: number;
  dtiRatio: number;
  totalInterest: number;
  qualified: boolean;
  disqualifyReasons: string[];
  formula: string;
}

// ============================================================
// Mortgage / Amortization
// ============================================================

export interface MortgageInput {
  principal: number;
  annualInterestRate: number;
  termYears: number;
}

export interface MortgageScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  schedule: MortgageScheduleEntry[];
  formula: string;
}

// ============================================================
// Rental Yield
// ============================================================

export interface RentalYieldInput {
  totalCost: number;
  monthlyRent: number;
  vacancyRatePct: number;
  annualExpensesPct: number;
  financingCost?: number;
}

export interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  capRate: number;
  cashOnCashReturn: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  breakEvenMonths: number;
  formula: string;
}

// ============================================================
// Budget Estimate
// ============================================================

export interface BudgetEstimateInput {
  market: string;
  propertyType: string;
  size: number;
  qualityLevel: "low" | "mid" | "high";
  contingencyPct: number;
}

export interface BudgetLineItem {
  category: string;
  amount: number;
  perUnit: number;
}

export interface BudgetEstimateResult {
  lineItems: BudgetLineItem[];
  subtotal: number;
  contingency: number;
  total: number;
  perUnitCost: number;
  formula: string;
}

export interface CostBenchmark {
  category: string;
  lowRange: number;
  midRange: number;
  highRange: number;
  unit: string;
}

// ============================================================
// Draw Schedule
// ============================================================

export interface DrawScheduleInput {
  totalBudget: number;
  milestones: { name: string; paymentPct: number; phase: string }[];
  contingencyPct: number;
}

export interface DrawEntry {
  milestone: string;
  amount: number;
  cumulative: number;
  pct: number;
}

export interface DrawScheduleResult {
  draws: DrawEntry[];
  retainage: number;
  contingencyReserve: number;
  formula: string;
}

// ============================================================
// Currency Conversion
// ============================================================

export interface CurrencyConversionInput {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
}

export interface CurrencyConversionResult {
  convertedAmount: number;
  exchangeRate: number;
  fromCurrency: string;
  toCurrency: string;
  formula: string;
}

// ============================================================
// Contingency
// ============================================================

export interface ContingencyInput {
  baseBudget: number;
  complexity: "simple" | "moderate" | "complex";
  market: string;
  phaseIndex: number;
  firstTimeBuild: boolean;
}

export interface ContingencyAdjustment {
  factor: string;
  adjustment: number;
}

export interface ContingencyResult {
  basePct: number;
  adjustedPct: number;
  contingencyAmount: number;
  adjustments: ContingencyAdjustment[];
  formula: string;
}
