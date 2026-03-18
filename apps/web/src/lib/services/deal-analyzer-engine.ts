/**
 * Deal Analyzer Engine
 *
 * Core calculation engine for the Deal Analyzer and New Project wizard.
 * All cost estimates, deal scoring, and financial analysis flows through here.
 *
 * "A home is more than a house." — Emmanuel Abok
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
  monthlyCost: number;
  roi: number;
  dtiRatio: number | null;
  ltvRatio: number;
  riskFlags: RiskFlag[];
  costPerUnit: number; // per sqft or sqm
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
  if (input.sizeCategory === "custom" && input.customSize) return input.customSize;
  const isUSA = input.market === "USA";
  const presets = isUSA ? SIZE_PRESETS_SQFT : SIZE_PRESETS_SQM;
  return presets[input.sizeCategory] ?? (isUSA ? 1800 : 130);
}

// ---------------------------------------------------------------------------
// Feature cost multipliers
// ---------------------------------------------------------------------------

const FEATURE_COSTS_USD: Record<string, number> = {
  "garage-single": 15000, "garage-double": 28000, "garage-carport": 8000,
  "porch-patio": 8000, "pool": 40000, "fence": 6000, "solar": 18000,
  "outdoor-kitchen": 12000, "basement": 35000, "central-hvac": 0, // included in base
  "sprinkler": 4000,
};

const FEATURE_COSTS_WA: Record<string, number> = {
  "garage-single": 2500000, "garage-double": 4500000, "garage-carport": 1200000,
  "porch-patio": 1500000, "pool": 12000000, "fence": 2000000, "solar": 5000000,
  "outdoor-kitchen": 3000000, "guest-house": 15000000, "water-tank": 2500000,
  "septic": 0, // included in base for WA
  "generator-house": 1500000, "security-post": 800000,
};

function calculateFeatureCost(features: string[], market: string): number {
  const costs = market === "USA" ? FEATURE_COSTS_USD : FEATURE_COSTS_WA;
  return features.reduce((sum, f) => sum + (costs[f] ?? 0), 0);
}

// ---------------------------------------------------------------------------
// Bathroom cost adjustment
// ---------------------------------------------------------------------------

function bathroomMultiplier(bathrooms: number): number {
  // Each bathroom after 2 adds ~$8K-12K (US) or proportional WA cost
  // Base estimate assumes 2 bathrooms; adjust for more/fewer
  if (bathrooms <= 2) return 1.0;
  return 1.0 + (bathrooms - 2) * 0.04; // 4% per extra bathroom
}

function storyMultiplier(stories: number): number {
  if (stories <= 1) return 1.0;
  if (stories === 2) return 1.18; // 18% premium for 2-story
  return 1.30; // 30% premium for 3-story
}

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

export function calculateAnalysis(input: AnalysisInput): AnalysisResults {
  const market = (input.market || "USA") as Market;
  const marketData = getMarketData(market);
  const currency = marketData.currency;
  const isUSA = market === "USA";
  const sizeUnit = isUSA ? "sqft" : "sqm";
  const size = getBuildingSize(input);

  // Location data
  const locationData = input.city ? getClosestLocation(input.city, market) : null;
  const costIndex = locationData?.costIndex ?? 1.0;

  // Construction cost
  const benchmarks = getCostBenchmarks(market, input.propertyType as any);
  const baseCostPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
  const adjustedBase = baseCostPerUnit * costIndex * bathroomMultiplier(input.bathrooms) * storyMultiplier(input.stories);
  const constructionCost = Math.round(adjustedBase * size);

  // Feature costs
  const featureCost = calculateFeatureCost(input.features, market);

  // Land cost
  const landCost = input.landOption === "known" || input.landOption === "buying"
    ? input.landPrice
    : input.landOption === "already-own" || input.landOption === "inherited" || input.landOption === "family"
    ? 0
    : Math.round(constructionCost * 0.25); // estimate

  // Soft costs (permits, design, insurance) — 15% of construction
  const softCosts = Math.round((constructionCost + featureCost) * 0.15);

  // Financing costs
  let financingCosts = 0;
  let monthlyCost = 0;
  const totalBeforeFinancing = constructionCost + featureCost + landCost + softCosts;

  if (input.financingType === "construction_loan" || input.financingType === "fha_203k") {
    const downPmt = input.downPaymentAmount ?? (totalBeforeFinancing * input.downPaymentPct / 100);
    const loanAmount = totalBeforeFinancing - downPmt;
    const monthlyRate = input.loanRate / 100 / 12;
    const months = (input.loanTerm ?? 30) * 12;
    if (monthlyRate > 0 && months > 0) {
      monthlyCost = Math.round(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));
      financingCosts = Math.round(monthlyCost * months - loanAmount);
    }
  }

  // Contingency — 15% US, 20% WA
  const contingencyRate = isUSA ? 0.15 : 0.20;
  const contingency = Math.round((constructionCost + featureCost) * contingencyRate);

  // Total
  const totalCost = constructionCost + featureCost + landCost + softCosts + financingCosts + contingency;
  const costPerUnit = size > 0 ? Math.round(totalCost / size) : 0;

  // DTI ratio
  let dtiRatio: number | null = null;
  if (input.monthlyIncome && input.monthlyIncome > 0) {
    const totalMonthlyDebt = (input.existingDebts ?? 0) + monthlyCost;
    dtiRatio = Math.round((totalMonthlyDebt / input.monthlyIncome) * 100);
  }

  // LTV ratio
  const ltvRatio = totalCost > 0
    ? Math.round(((totalCost - (input.downPaymentAmount ?? totalCost * input.downPaymentPct / 100)) / totalCost) * 100)
    : 0;

  // ROI
  let roi = 0;
  if (input.goal === "rent" && input.monthlyRent) {
    roi = totalCost > 0 ? Math.round((input.monthlyRent * 12 / totalCost) * 1000) / 10 : 0;
  } else if (input.goal === "sell" && input.targetSalePrice) {
    roi = totalCost > 0 ? Math.round(((input.targetSalePrice - totalCost) / totalCost) * 1000) / 10 : 0;
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
  let score = 50; // base

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
    score += 10; // cash deals are lower risk
  }

  // ROI (+/- 10 points)
  if (input.goal === "rent") {
    if (roi > 8) score += 10;
    else if (roi > 5) score += 5;
    else if (roi < 3) score -= 5;
  } else if (input.goal === "sell") {
    if (roi > 20) score += 10;
    else if (roi > 10) score += 5;
    else if (roi < 0) score -= 10;
  } else {
    score += 5; // owner-occupy is neutral/positive
  }

  // LTV (+/- 5 points)
  if (ltvRatio < 70) score += 5;
  else if (ltvRatio > 90) score -= 5;

  // Risk penalty (-3 per risk flag)
  score -= riskCount * 3;

  // Contingency buffer bonus
  score += 5; // we always include contingency

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Summary
  let summary: string;
  if (score >= 80) summary = "Strong deal. Costs are favorable and your financing is healthy.";
  else if (score >= 65) summary = "Good deal. Most factors are positive with manageable risks.";
  else if (score >= 50) summary = "Fair deal. Some areas need attention before committing.";
  else if (score >= 35) summary = "Proceed with caution. Several risk factors need resolution.";
  else summary = "High risk. Consider adjusting scope, budget, or financing before proceeding.";

  return { score, summary };
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

  // DTI too high
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

  // LTV too high
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

  // High cost area
  if (costIndex > 1.3) {
    flags.push({
      level: "warning",
      title: "High-cost construction area",
      detail: `Construction costs here are ${Math.round((costIndex - 1) * 100)}% above the national average. Budget carefully.`,
    });
  }

  // WA-specific risks
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

  // Budget stretch
  const size = getBuildingSize(input);
  if (size > 0 && totalCost / size > (isUSA ? 300 : 500000)) {
    flags.push({
      level: "info",
      title: "Premium cost per unit area",
      detail: `At ${isUSA ? "$" : ""}${Math.round(totalCost / size).toLocaleString()}${isUSA ? "/sqft" : " CFA/sqm"}, this is above average. Features and finishes may be driving costs up.`,
    });
  }

  // No contingency awareness
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
// Cost Breakdown for chart
// ---------------------------------------------------------------------------

export function getCostBreakdown(results: AnalysisResults): CostBreakdownItem[] {
  const total = results.totalCost || 1;
  const items: CostBreakdownItem[] = [
    { category: "Construction", amount: results.constructionCost, percentage: Math.round(results.constructionCost / total * 100), color: "#2D6A4F" },
    { category: "Land", amount: results.landCost, percentage: Math.round(results.landCost / total * 100), color: "#8B4513" },
    { category: "Soft costs", amount: results.softCosts, percentage: Math.round(results.softCosts / total * 100), color: "#1B4965" },
    { category: "Contingency", amount: results.contingency, percentage: Math.round(results.contingency / total * 100), color: "#D4A574" },
  ];
  if (results.financingCosts > 0) {
    items.push({ category: "Financing", amount: results.financingCosts, percentage: Math.round(results.financingCosts / total * 100), color: "#BC6C25" });
  }
  return items.filter((i) => i.amount > 0);
}

// ---------------------------------------------------------------------------
// Reverse Calculator: What Can I Afford?
// ---------------------------------------------------------------------------

export function reverseCalculate(
  budget: number,
  market: string,
  city: string,
  goal: string
): { maxSize: number; bedrooms: number; bathrooms: number; stories: number; description: string } {
  const marketData = getMarketData(market as Market);
  const locationData = city ? getClosestLocation(city, market) : null;
  const costIndex = locationData?.costIndex ?? 1.0;
  const isUSA = market === "USA";
  const unit = isUSA ? "sqft" : "sqm";

  // Get base cost per unit
  const benchmarks = getCostBenchmarks(market as Market);
  const baseCost = benchmarks.reduce((sum, b) => sum + b.midRange, 0) * costIndex;

  // Deduct land (25% of budget), soft costs (15%), contingency (15-20%)
  const contingencyRate = isUSA ? 0.15 : 0.20;
  const buildableBudget = budget * (1 - 0.25 - 0.15 - contingencyRate);

  // Max size
  const maxSize = baseCost > 0 ? Math.round(buildableBudget / baseCost) : 0;

  // Suggest bedrooms/bathrooms based on size
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

  const description = `You can build a ${bedrooms}-bed, ${bathrooms}-bath, ${maxSize.toLocaleString()} ${unit} home with standard finishes.`;

  return { maxSize, bedrooms, bathrooms, stories, description };
}
