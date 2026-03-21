/**
 * Deal Analyzer Engine
 *
 * Core calculation engine for the Deal Analyzer and New Project wizard.
 * All cost estimates, deal scoring, and financial analysis flows through here.
 *
 * "A home is more than a house." -- Emmanuel Abok
 */

import { getMarketData, getClosestLocation, getCostBenchmarks } from "@keystone/market-data";
import type { Market, CurrencyConfig, LocationData } from "@keystone/market-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalysisInput {
  // Section A: Goal
  goal: "occupy" | "rent" | "sell" | "mixed-use" | "";
  targetSalePrice?: number;
  monthlyRent?: number;
  commercialPct?: number; // mixed-use: % of building that is commercial

  // Section B: Market & Location
  market: string;
  country?: string;
  city: string;
  zipCode?: string;

  // Section C: Property
  propertyType: string;
  sizeCategory: string;
  customSize?: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  features: string[];

  // Section D: Land
  landOption: string;
  landPrice: number;
  landSize?: number;
  titreFoncierStatus?: string;

  // Section E: Financing
  financingType: string;
  downPaymentPct: number;
  downPaymentAmount?: number;
  loanRate: number;
  loanTerm?: number;
  monthlyIncome?: number;
  existingDebts?: number;
  creditScoreRange?: string;

  // Section F: Timeline
  timelineMonths: number;
  constructionStart?: string;
}

export interface AnalysisResults {
  dealScore: number;
  dealScoreSummary: string;
  totalCost: number;
  constructionCost: number;
  landCost: number;
  softCosts: number;
  financingCosts: number;
  contingency: number;
  carryingCosts: number;
  monthlyCost: number;
  roi: number;
  dtiRatio: number | null;
  ltvRatio: number;
  riskFlags: RiskFlag[];
  costPerUnit: number;
  currency: CurrencyConfig;
  locationData: LocationData | null;
}

export interface RiskFlag {
  level: "critical" | "warning" | "info";
  title: string;
  detail: string;
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Size helpers
// ---------------------------------------------------------------------------

const SIZE_PRESETS_SQFT: Record<string, number> = {
  compact: 1200, standard: 1800, large: 2800, estate: 4000,
};
const SIZE_PRESETS_SQM: Record<string, number> = {
  compact: 80, standard: 130, large: 200, estate: 300,
};

export function getBuildingSize(input: AnalysisInput): number {
  if (input.sizeCategory === "custom" && input.customSize && input.customSize > 0) return input.customSize;
  const isUSA = input.market === "USA";
  const presets = isUSA ? SIZE_PRESETS_SQFT : SIZE_PRESETS_SQM;
  return presets[input.sizeCategory] ?? (isUSA ? 1800 : 130);
}

// ---------------------------------------------------------------------------
// Feature cost multipliers
// Costs validated against 2025 market rates.
// WA costs ~40-55% of USA costs due to cheaper labor and materials.
// ---------------------------------------------------------------------------

const FEATURE_COSTS_USD: Record<string, number> = {
  "garage-single": 15000, "garage-double": 28000, "garage-carport": 8000,
  "porch-patio": 8000, "pool": 40000, "fence": 6000, "solar": 18000,
  "outdoor-kitchen": 12000, "basement": 35000, "central-hvac": 0,
  "sprinkler": 4000,
};

// WA costs in CFA (FCFA). 1 USD ~ 607 CFA (approx, fluctuates with EUR/USD).
// Single garage: ~$9,750 USD (6M CFA) -- concrete block, tin roof
// Pool: ~$26K USD (16M CFA) -- labor-intensive but cheaper materials
const FEATURE_COSTS_WA: Record<string, number> = {
  "garage-single": 6000000, "garage-double": 10000000, "garage-carport": 2500000,
  "porch-patio": 3000000, "pool": 16000000, "fence": 4000000, "solar": 8000000,
  "outdoor-kitchen": 5000000, "guest-house": 25000000, "water-tank": 3500000,
  "septic": 0,
  "generator-house": 3000000, "security-post": 2000000,
};

function calculateFeatureCost(features: string[], market: string): number {
  const costs = market === "USA" ? FEATURE_COSTS_USD : FEATURE_COSTS_WA;
  return features.reduce((sum, f) => sum + (costs[f] ?? 0), 0);
}

// ---------------------------------------------------------------------------
// Cost adjustment multipliers
// ---------------------------------------------------------------------------

function bathroomMultiplier(bathrooms: number): number {
  if (bathrooms <= 0) return 1.0;
  if (bathrooms <= 2) return 1.0;
  return 1.0 + (bathrooms - 2) * 0.04;
}

function storyMultiplier(stories: number): number {
  if (stories <= 1) return 1.0;
  if (stories === 2) return 1.18;
  return 1.30;
}

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

export function calculateAnalysis(input: AnalysisInput): AnalysisResults {
  const market = (input.market || "USA") as Market;
  const marketData = getMarketData(market);
  const currency = marketData.currency;
  const isUSA = market === "USA";
  const size = getBuildingSize(input);

  // Location data (city is pre-populated from ZIP code by the UI when applicable)
  const locationData = input.city ? getClosestLocation(input.city, market) : null;
  const costIndex = locationData?.costIndex ?? 1.0;

  // Construction cost
  const benchmarks = getCostBenchmarks(market, input.propertyType as any);
  const baseCostPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
  const adjustedBase = baseCostPerUnit * costIndex * bathroomMultiplier(input.bathrooms) * storyMultiplier(input.stories);
  const constructionCost = Math.round(adjustedBase * size);

  // Feature costs -- only count features valid for the current market
  const validFeatures = input.features.filter((f) => {
    const costs = market === "USA" ? FEATURE_COSTS_USD : FEATURE_COSTS_WA;
    return f in costs;
  });
  const featureCost = calculateFeatureCost(validFeatures, market);

  // Land cost
  const landCost = input.landOption === "known" || input.landOption === "buying"
    ? Math.max(0, input.landPrice)
    : input.landOption === "already-own" || input.landOption === "inherited" || input.landOption === "family"
    ? 0
    : Math.round(constructionCost * 0.25);

  // Soft costs -- 10% USA (benchmarks already include some), 15% WA
  const softCostRate = isUSA ? 0.10 : 0.15;
  const softCosts = Math.round((constructionCost + featureCost) * softCostRate);

  // Financing costs
  let financingCosts = 0;
  let monthlyCost = 0;
  const totalBeforeFinancing = constructionCost + featureCost + landCost + softCosts;

  if (input.financingType === "construction_loan" || input.financingType === "fha_203k") {
    const clampedDpPct = Math.max(0, Math.min(100, input.downPaymentPct));
    const downPmt = input.downPaymentAmount != null && input.downPaymentAmount > 0
      ? Math.min(input.downPaymentAmount, totalBeforeFinancing)
      : totalBeforeFinancing * clampedDpPct / 100;
    const loanAmount = Math.max(0, totalBeforeFinancing - downPmt);
    const clampedRate = Math.max(0, Math.min(30, input.loanRate));
    const monthlyRate = clampedRate / 100 / 12;
    const months = (input.loanTerm ?? 30) * 12;

    if (loanAmount > 0 && months > 0) {
      if (monthlyRate > 0) {
        // Standard amortization formula
        monthlyCost = Math.round(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
        financingCosts = Math.round(monthlyCost * months - loanAmount);
      } else {
        // 0% interest -- simple division
        monthlyCost = Math.round(loanAmount / months);
        financingCosts = 0;
      }
    }
  }

  // Contingency -- 15% US, 20% WA
  const contingencyRate = isUSA ? 0.15 : 0.20;
  const contingency = Math.round((constructionCost + featureCost) * contingencyRate);

  // Carrying / timeline costs — longer builds incur inflation + interest during construction
  const timelineMonths = input.timelineMonths || 12;
  const baselineMonths = 12;
  let carryingCosts = 0;
  if (timelineMonths > baselineMonths) {
    const extraMonths = timelineMonths - baselineMonths;
    // Material inflation: ~0.4% per month on construction costs beyond baseline
    const inflationCost = Math.round((constructionCost + featureCost) * 0.004 * extraMonths);
    // Interest during construction: if financed, lender charges draw interest
    const idcRate = (input.financingType === "construction_loan" || input.financingType === "fha_203k")
      ? (input.loanRate || 7.5) / 100 / 12
      : 0;
    const avgDrawBalance = (constructionCost + featureCost + softCosts) * 0.5; // avg 50% drawn
    const interestDuringConstruction = Math.round(avgDrawBalance * idcRate * extraMonths);
    carryingCosts = inflationCost + interestDuringConstruction;
  }

  // Total
  const totalCost = constructionCost + featureCost + landCost + softCosts + financingCosts + contingency + carryingCosts;
  const costPerUnit = size > 0 ? Math.round(totalCost / size) : 0;

  // DTI ratio (capped at 200% for display)
  let dtiRatio: number | null = null;
  if (input.monthlyIncome && input.monthlyIncome > 0) {
    const totalMonthlyDebt = (input.existingDebts ?? 0) + monthlyCost;
    dtiRatio = Math.min(200, Math.round((totalMonthlyDebt / input.monthlyIncome) * 100));
  }

  // LTV ratio (clamped 0-100)
  const clampedDpPct = Math.max(0, Math.min(100, input.downPaymentPct));
  const effectiveDown = input.downPaymentAmount != null && input.downPaymentAmount > 0
    ? Math.min(input.downPaymentAmount, totalCost)
    : totalCost * clampedDpPct / 100;
  const ltvRatio = totalCost > 0
    ? Math.max(0, Math.min(100, Math.round(((totalCost - effectiveDown) / totalCost) * 100)))
    : 0;

  // ROI
  let roi = 0;
  if (input.goal === "rent" && input.monthlyRent) {
    roi = totalCost > 0 ? Math.round((input.monthlyRent * 12 / totalCost) * 1000) / 10 : 0;
  } else if (input.goal === "sell" && input.targetSalePrice) {
    roi = totalCost > 0 ? Math.round(((input.targetSalePrice - totalCost) / totalCost) * 1000) / 10 : 0;
  } else if (input.goal === "mixed-use") {
    // Mixed-use: combine rental + potential sale appreciation
    const rentIncome = input.monthlyRent ? input.monthlyRent * 12 : 0;
    if (rentIncome > 0 && totalCost > 0) {
      roi = Math.round((rentIncome / totalCost) * 1000) / 10;
    }
  }

  // Risk flags
  const riskFlags = generateRiskFlags(input, totalCost, dtiRatio, ltvRatio, costIndex, locationData, isUSA);

  // Deal score
  const { score, summary } = calculateDealScore(input, totalCost, roi, dtiRatio, ltvRatio, costIndex, riskFlags.length);

  return {
    dealScore: score,
    dealScoreSummary: summary,
    totalCost,
    constructionCost: constructionCost + featureCost,
    landCost,
    softCosts,
    financingCosts,
    contingency,
    carryingCosts,
    monthlyCost,
    roi,
    dtiRatio,
    ltvRatio,
    riskFlags,
    costPerUnit,
    currency,
    locationData,
  };
}

// ---------------------------------------------------------------------------
// Deal Score (0-100)
// ---------------------------------------------------------------------------

function calculateDealScore(
  input: AnalysisInput,
  totalCost: number,
  roi: number,
  dtiRatio: number | null,
  ltvRatio: number,
  costIndex: number,
  riskCount: number
): { score: number; summary: string } {
  let score = 50;

  // Cost efficiency (+/- 15 points)
  if (costIndex < 0.9) score += 10;
  else if (costIndex < 1.0) score += 5;
  else if (costIndex > 1.2) score -= 10;
  else if (costIndex > 1.1) score -= 5;

  // Financing health (+/- 15 points)
  if (dtiRatio !== null) {
    if (dtiRatio < 30) score += 15;
    else if (dtiRatio < 36) score += 10;
    else if (dtiRatio < 43) score += 5;
    else if (dtiRatio > 50) score -= 15;
    else score -= 5;
  } else if (input.financingType === "cash" || input.financingType === "phased_cash") {
    score += 10;
  }

  // ROI (+/- 10 points)
  if (input.goal === "rent" || input.goal === "mixed-use") {
    if (roi > 8) score += 10;
    else if (roi > 5) score += 5;
    else if (roi < 3) score -= 5;
  } else if (input.goal === "sell") {
    if (roi > 20) score += 10;
    else if (roi > 10) score += 5;
    else if (roi < 0) score -= 10;
  } else {
    score += 5;
  }

  // LTV (+/- 5 points)
  if (ltvRatio < 70) score += 5;
  else if (ltvRatio > 90) score -= 5;

  // Risk penalty (-2 per flag, softer than -3)
  score -= riskCount * 2;

  // Contingency buffer bonus
  score += 5;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  let summary: string;
  if (score >= 80) summary = "Strong deal. Costs are favorable and your financing is healthy.";
  else if (score >= 65) summary = "Good deal. Most factors are positive with manageable risks.";
  else if (score >= 50) summary = "Fair deal. Some areas need attention before committing.";
  else if (score >= 35) summary = "Proceed with caution. Several risk factors need resolution.";
  else summary = "High risk. Consider adjusting scope, budget, or financing before proceeding.";

  return { score, summary };
}

/**
 * Generate actionable tips for improving the deal score.
 */
export function getScoreTips(input: AnalysisInput, results: AnalysisResults): string[] {
  const tips: string[] = [];
  const locationData = input.city ? getClosestLocation(input.city, input.market as Market) : null;
  const costIndex = locationData?.costIndex ?? 1.0;

  if (costIndex > 1.1) tips.push("High-cost area — consider nearby cities with lower cost indices");
  if (results.dtiRatio !== null && results.dtiRatio > 36) tips.push("Lower DTI by increasing income or reducing existing debts");
  if (results.ltvRatio > 80) tips.push("Increase down payment to 20%+ to avoid PMI and improve score");
  if (input.landOption === "" || input.landOption === "estimate") tips.push("Enter an actual land price for more accurate analysis");
  if (input.goal === "rent" && (!input.monthlyRent || input.monthlyRent === 0)) tips.push("Add expected monthly rent to calculate yield");
  if (input.goal === "sell" && (!input.targetSalePrice || input.targetSalePrice === 0)) tips.push("Add target sale price to calculate ROI");
  if (input.features.length > 5) tips.push("Reduce features to lower costs — prioritize essentials");
  if (results.riskFlags.length > 2) tips.push(`Resolve ${results.riskFlags.filter(f => f.level === "critical").length} critical risk flags`);
  if (input.sizeCategory === "large" || input.sizeCategory === "estate") tips.push("Consider a smaller footprint for a better budget ratio");

  return tips.slice(0, 3); // Max 3 tips
}

// ---------------------------------------------------------------------------
// Risk Flags
// ---------------------------------------------------------------------------

function generateRiskFlags(
  input: AnalysisInput,
  totalCost: number,
  dtiRatio: number | null,
  ltvRatio: number,
  costIndex: number,
  locationData: LocationData | null,
  isUSA: boolean
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  if (dtiRatio !== null && dtiRatio > 43) {
    flags.push({
      level: "critical",
      title: "DTI ratio exceeds typical limit",
      detail: `Your debt-to-income ratio is ${dtiRatio}%. Most lenders require below 43%. Consider reducing debts or increasing income before applying.`,
    });
  } else if (dtiRatio !== null && dtiRatio > 36) {
    flags.push({
      level: "warning",
      title: "DTI ratio is elevated",
      detail: `Your DTI is ${dtiRatio}%. This may limit your loan options. Below 36% is ideal.`,
    });
  }

  if (ltvRatio > 95) {
    flags.push({
      level: "critical",
      title: "Very low down payment",
      detail: "Less than 5% down increases risk and may require private mortgage insurance (PMI).",
    });
  } else if (ltvRatio > 80) {
    flags.push({
      level: "warning",
      title: "Down payment below 20%",
      detail: "You may need PMI which adds to monthly costs. Consider increasing your down payment.",
    });
  }

  if (costIndex > 1.3) {
    flags.push({
      level: "warning",
      title: "High-cost construction area",
      detail: `Construction costs here are ${Math.round((costIndex - 1) * 100)}% above the national average. Budget carefully.`,
    });
  }

  if (!isUSA) {
    if (!input.titreFoncierStatus || input.titreFoncierStatus === "not-started") {
      flags.push({
        level: "critical",
        title: "Land title not secured",
        detail: "Building without a titre foncier or registered deed is extremely risky. Complete land titling before construction.",
      });
    }

    if (input.financingType === "phased_cash") {
      flags.push({
        level: "info",
        title: "Phased funding extends timeline",
        detail: "Building in phases as cash is available typically takes 2-3x longer than continuous construction. Plan accordingly.",
      });
    }
  }

  const size = getBuildingSize(input);
  if (size > 0 && totalCost / size > (isUSA ? 300 : 500000)) {
    flags.push({
      level: "info",
      title: "Premium cost per unit area",
      detail: `At ${isUSA ? "$" : ""}${Math.round(totalCost / size).toLocaleString()}${isUSA ? "/sqft" : " CFA/sqm"}, this is above average. Features and finishes may be driving costs up.`,
    });
  }

  if (input.features.length > 5) {
    flags.push({
      level: "info",
      title: "Multiple features increase complexity",
      detail: `You've selected ${input.features.length} features. Each adds cost, construction time, and coordination complexity. Prioritize the essentials.`,
    });
  }

  return flags;
}

// ---------------------------------------------------------------------------
// Cost Breakdown for chart (uses largest-remainder method for accurate %)
// ---------------------------------------------------------------------------

export function getCostBreakdown(results: AnalysisResults): CostBreakdownItem[] {
  const total = results.totalCost || 1;
  const raw: { category: string; amount: number; color: string; exactPct: number }[] = [
    { category: "Construction", amount: results.constructionCost, color: "#2D6A4F", exactPct: (results.constructionCost / total) * 100 },
    { category: "Land", amount: results.landCost, color: "#8B4513", exactPct: (results.landCost / total) * 100 },
    { category: "Soft costs", amount: results.softCosts, color: "#1B4965", exactPct: (results.softCosts / total) * 100 },
    { category: "Contingency", amount: results.contingency, color: "#D4A574", exactPct: (results.contingency / total) * 100 },
  ];
  if (results.financingCosts > 0) {
    raw.push({ category: "Financing", amount: results.financingCosts, color: "#BC6C25", exactPct: (results.financingCosts / total) * 100 });
  }
  if (results.carryingCosts > 0) {
    raw.push({ category: "Carrying costs", amount: results.carryingCosts, color: "#6B4226", exactPct: (results.carryingCosts / total) * 100 });
  }

  const filtered = raw.filter((i) => i.amount > 0);

  // Largest remainder method: floor all, then distribute remainder to highest decimals
  const floored = filtered.map((i) => ({ ...i, floor: Math.floor(i.exactPct), remainder: i.exactPct - Math.floor(i.exactPct) }));
  let remainder = 100 - floored.reduce((s, i) => s + i.floor, 0);
  const sorted = [...floored].sort((a, b) => b.remainder - a.remainder);
  for (const item of sorted) {
    if (remainder <= 0) break;
    item.floor += 1;
    remainder -= 1;
  }

  return floored.map((i) => ({
    category: i.category,
    amount: i.amount,
    percentage: i.floor,
    color: i.color,
  }));
}

// ---------------------------------------------------------------------------
// Reverse Calculator: What Can I Afford?
// ---------------------------------------------------------------------------

export function reverseCalculate(
  budget: number,
  market: string,
  city: string,
  goal: string
): { maxSize: number; bedrooms: number; bathrooms: number; stories: number; description: string; minBudget: number } {
  const marketData = getMarketData(market as Market);
  const locationData = city ? getClosestLocation(city, market) : null;
  const costIndex = locationData?.costIndex ?? 1.0;
  const isUSA = market === "USA";
  const unit = isUSA ? "sqft" : "sqm";

  const benchmarks = getCostBenchmarks(market as Market);
  const baseCost = benchmarks.reduce((sum, b) => sum + b.midRange, 0) * costIndex;

  // Minimum viable budget = smallest home (compact) + land + soft + contingency
  const minSize = isUSA ? 800 : 60;
  const contingencyRate = isUSA ? 0.15 : 0.20;
  const softCostRate = isUSA ? 0.10 : 0.15;
  const minBudget = Math.round(baseCost * minSize * (1 + 0.25 + softCostRate + contingencyRate));

  // Deduct land (25%), soft costs, contingency from budget
  const buildableBudget = budget * (1 - 0.25 - softCostRate - contingencyRate);

  const maxSize = baseCost > 0 ? Math.max(0, Math.round(buildableBudget / baseCost)) : 0;

  let bedrooms: number, bathrooms: number, stories: number;
  if (isUSA) {
    if (maxSize >= 3000) { bedrooms = 5; bathrooms = 4; stories = 2; }
    else if (maxSize >= 2200) { bedrooms = 4; bathrooms = 3; stories = 2; }
    else if (maxSize >= 1600) { bedrooms = 3; bathrooms = 2; stories = 1; }
    else if (maxSize >= 1000) { bedrooms = 2; bathrooms = 2; stories = 1; }
    else { bedrooms = 1; bathrooms = 1; stories = 1; }
  } else {
    if (maxSize >= 250) { bedrooms = 5; bathrooms = 4; stories = 1; }
    else if (maxSize >= 180) { bedrooms = 4; bathrooms = 3; stories = 1; }
    else if (maxSize >= 120) { bedrooms = 3; bathrooms = 2; stories = 1; }
    else if (maxSize >= 80) { bedrooms = 2; bathrooms = 1; stories = 1; }
    else { bedrooms = 1; bathrooms = 1; stories = 1; }
  }

  const description = maxSize > 0
    ? `You can build a ${bedrooms}-bed, ${bathrooms}-bath, ${maxSize.toLocaleString()} ${unit} home with standard finishes.`
    : `Budget is below the minimum for new construction in this market. Consider a smaller scope or different location.`;

  return { maxSize, bedrooms, bathrooms, stories, description, minBudget };
}
