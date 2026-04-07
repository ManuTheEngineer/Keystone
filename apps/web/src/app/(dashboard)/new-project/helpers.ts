// apps/web/src/app/(dashboard)/new-project/helpers.ts
// ---------------------------------------------------------------------------
// Pure helper functions extracted from the old page.tsx monolith.
// Used by the orchestrator for project creation (deal score, cost fallbacks).
// ---------------------------------------------------------------------------

import {
  getMarketData,
  getCostBenchmarks,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import type { WizardState, ScoreFactor } from "./types";
import type { BuildPurpose } from "@/lib/services/project-service";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PURPOSE_MAP: Record<string, BuildPurpose> = {
  occupy: "OCCUPY",
  rent: "RENT",
  sell: "SELL",
};

// ---------------------------------------------------------------------------
// Size / cost helpers
// ---------------------------------------------------------------------------

function getSizeUnit(market: MarketType | ""): "sqft" | "sqm" {
  return market === "USA" ? "sqft" : "sqm";
}

export function getCurrencyForMarket(market: MarketType | ""): CurrencyConfig {
  if (!market) {
    return { code: "USD", symbol: "$", locale: "en-US", decimals: 2, groupSeparator: ",", position: "prefix" as const };
  }
  return getMarketData(market).currency;
}

function getSizePresets(unit: "sqft" | "sqm") {
  if (unit === "sqft") {
    return {
      compact: { min: 800, max: 1200, typical: 1000, label: "Under 1,200 sqft" },
      standard: { min: 1200, max: 2000, typical: 1600, label: "1,200 to 2,000 sqft" },
      large: { min: 2000, max: 3200, typical: 2600, label: "2,000 to 3,200 sqft" },
      estate: { min: 3200, max: 5000, typical: 4000, label: "3,200+ sqft" },
    };
  }
  return {
    compact: { min: 75, max: 110, typical: 90, label: "Under 110 sqm" },
    standard: { min: 110, max: 185, typical: 150, label: "110 to 185 sqm" },
    large: { min: 185, max: 300, typical: 240, label: "185 to 300 sqm" },
    estate: { min: 300, max: 500, typical: 380, label: "300+ sqm" },
  };
}

export function getBuildingSize(state: WizardState): number {
  if (state.sizeCategory === "custom") return state.customSize;
  if (!state.market) return 0;
  const unit = getSizeUnit(state.market);
  const presets = getSizePresets(unit);
  return presets[state.sizeCategory as keyof typeof presets]?.typical ?? 0;
}

export function getMarketCostRange(market: MarketType): { low: number; mid: number; high: number } {
  const benchmarks = getCostBenchmarks(market);
  return {
    low: benchmarks.reduce((sum, b) => sum + b.lowRange, 0),
    mid: benchmarks.reduce((sum, b) => sum + b.midRange, 0),
    high: benchmarks.reduce((sum, b) => sum + b.highRange, 0),
  };
}

function getFeatureMultiplier(features: string[]): number {
  const FEATURE_COST_PCT: Record<string, number> = {
    "garage-single": 0.05, "garage-double": 0.08, "porch-patio": 0.02, "pool": 0.12,
    "basement": 0.15, "solar": 0.04, "ev-charger": 0.01, "smart-home": 0.03,
    "security-post": 0.02, "outdoor-kitchen": 0.04, "fence": 0.02, "generator-house": 0.03,
    "water-tank": 0.03, "septic": 0.05, "sprinkler": 0.02, "guest-house": 0.10,
  };
  return 1 + features.reduce((sum, f) => sum + (FEATURE_COST_PCT[f] ?? 0.02), 0);
}

export function getConstructionCost(state: WizardState, locationData?: LocationData | null): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (size <= 0) return 0;
  const costs = getMarketCostRange(state.market as MarketType);
  const baseCost = costs.mid * size;
  const costIndex = locationData?.costIndex ?? 1.0;
  const featureMultiplier = getFeatureMultiplier(state.features);
  return Math.round(baseCost * costIndex * featureMultiplier);
}

export function getLandCost(state: WizardState, locationData?: LocationData | null): number {
  if (state.landOption === "known") return state.landPrice;
  if (locationData) {
    if (state.market === "USA" && locationData.landPricePerAcre) {
      return locationData.landPricePerAcre.mid;
    }
    if (locationData.landPricePerSqm) {
      return locationData.landPricePerSqm.mid * 500;
    }
  }
  return Math.round(getConstructionCost(state, locationData) * 0.25);
}

function getSoftCosts(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

function getFinancingCosts(state: WizardState, landCost: number, constructionCost: number): number {
  if (state.financingType === "cash" || state.financingType === "phased_cash" || state.financingType === "family_pooling") return 0;
  const totalBasis = landCost + constructionCost;
  const loanPortion = totalBasis * (1 - state.downPaymentPct / 100);
  return Math.round(loanPortion * (state.loanRate / 100) * (state.timelineMonths / 12));
}

function getContingency(constructionCost: number): number {
  return Math.round(constructionCost * 0.15);
}

export function getTotalProjectCost(state: WizardState, locationData?: LocationData | null) {
  const construction = getConstructionCost(state, locationData);
  const land = getLandCost(state, locationData);
  const soft = getSoftCosts(construction);
  const financing = getFinancingCosts(state, land, construction);
  const contingency = getContingency(construction);
  const total = land + construction + soft + financing + contingency;
  return { land, construction, soft, financing, contingency, total };
}

function getEstimatedSaleValue(state: WizardState, locationData?: LocationData | null): number {
  if (locationData) {
    const size = getBuildingSize(state);
    if (state.market === "USA" && locationData.avgSalePricePerSqft && size > 0) {
      return Math.round(size * locationData.avgSalePricePerSqft);
    }
    if (locationData.avgSalePricePerSqm && size > 0) {
      return Math.round(size * locationData.avgSalePricePerSqm);
    }
  }
  const costs = getTotalProjectCost(state, locationData);
  return Math.round(costs.total * 1.20);
}

function getEstimatedMonthlyRent(state: WizardState, locationData?: LocationData | null): number {
  if (!state.market) return 0;
  const size = getBuildingSize(state);
  if (state.market === "USA") {
    const ratePerSqft = locationData?.avgRentPerSqft ?? 1.0;
    return Math.round(size * ratePerSqft);
  }
  const ratePerSqm = locationData?.avgRentPerSqm ?? 2000;
  return Math.round(size * ratePerSqm);
}

// ---------------------------------------------------------------------------
// Total weeks from market phases
// ---------------------------------------------------------------------------

export function getTotalWeeksFromMarket(market: string): number {
  if (!market) return 0;
  const data = getMarketData(market as MarketType);
  return data.phases.reduce(
    (sum, p) => sum + Math.round((p.typicalDurationWeeks.min + p.typicalDurationWeeks.max) / 2),
    0,
  );
}

// ---------------------------------------------------------------------------
// Deal scoring
// ---------------------------------------------------------------------------

export function calculateDealScore(
  state: WizardState,
  locData?: LocationData | null,
  totalOverride?: number,
): { score: number; factors: ScoreFactor[]; risks: string[]; verdict: string; verdictLevel: "strong" | "decent" | "risky" } {
  const rawCosts = getTotalProjectCost(state, locData);
  const costs = totalOverride && totalOverride > 0 ? { ...rawCosts, total: totalOverride } : rawCosts;
  const factors: ScoreFactor[] = [];
  const risks: string[] = [];
  const currency = getCurrencyForMarket(state.market);

  // 1. Profit / cap rate / savings (25 points)
  if (state.goal === "sell") {
    const salePrice = state.targetSalePrice > 0 ? state.targetSalePrice : getEstimatedSaleValue(state, locData);
    const profit = salePrice - costs.total;
    const margin = costs.total > 0 ? (profit / costs.total) * 100 : 0;
    if (margin > 20) {
      factors.push({ label: "Profit margin above 20%", points: 25, maxPoints: 25, positive: true, explanation: `Estimated margin of ${margin.toFixed(1)}%. This provides a healthy buffer.` });
    } else if (margin > 15) {
      factors.push({ label: "Profit margin 15 to 20%", points: 18, maxPoints: 25, positive: true, explanation: `Margin of ${margin.toFixed(1)}% is solid but leaves limited room for surprises.` });
    } else if (margin > 10) {
      factors.push({ label: "Profit margin 10 to 15%", points: 8, maxPoints: 25, positive: false, explanation: `A ${margin.toFixed(1)}% margin is thin. Cost overruns could eliminate profit.` });
      risks.push("Thin profit margin leaves little room for cost overruns.");
    } else {
      factors.push({ label: "Profit margin below 10%", points: 0, maxPoints: 25, positive: false, explanation: `At ${margin.toFixed(1)}%, this deal barely breaks even.` });
      risks.push("Margin below 10% means even a small delay creates a loss.");
    }
  } else if (state.goal === "rent") {
    const monthlyRent = state.monthlyRent > 0 ? state.monthlyRent : getEstimatedMonthlyRent(state, locData);
    const annualRent = monthlyRent * 12;
    const capRate = costs.total > 0 ? (annualRent / costs.total) * 100 : 0;
    if (capRate > 8) {
      factors.push({ label: "Cap rate above 8%", points: 25, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is excellent.` });
    } else if (capRate > 5) {
      factors.push({ label: "Cap rate 5 to 8%", points: 15, maxPoints: 25, positive: true, explanation: `A ${capRate.toFixed(1)}% cap rate is reasonable.` });
    } else {
      factors.push({ label: "Cap rate below 5%", points: 0, maxPoints: 25, positive: false, explanation: `At ${capRate.toFixed(1)}%, rental income is low relative to cost.` });
      risks.push("Low cap rate means the property may not cash flow positively.");
    }
  } else {
    const savings = costs.total * 0.2;
    factors.push({ label: "Savings versus buying existing", points: 20, maxPoints: 25, positive: true, explanation: `Building could save approximately ${formatCurrencyCompact(savings, currency)} compared to buying existing.` });
  }

  // 2. Construction cost efficiency (15 points)
  if (state.market) {
    const costRange = getMarketCostRange(state.market as MarketType);
    const size = getBuildingSize(state);
    const actualPerUnit = size > 0 ? getConstructionCost(state, locData) / size : 0;
    if (actualPerUnit <= costRange.mid) {
      factors.push({ label: "Construction cost at or below average", points: 15, maxPoints: 15, positive: true, explanation: "Estimated cost is within the typical range for this market." });
    } else if (actualPerUnit <= costRange.high) {
      factors.push({ label: "Construction cost above average", points: 8, maxPoints: 15, positive: false, explanation: "Costs above the market midpoint. Consider value engineering." });
    } else {
      factors.push({ label: "Construction cost well above range", points: 0, maxPoints: 15, positive: false, explanation: "Costs exceed typical market rates. Get competitive bids." });
      risks.push("Construction costs above market averages reduce margin.");
    }
  }

  // 3. Land cost ratio (15 points)
  if (costs.land > 0 && costs.total > 0) {
    const landRatio = (costs.land / costs.total) * 100;
    if (landRatio <= 25) {
      factors.push({ label: "Land cost under 25% of total", points: 15, maxPoints: 15, positive: true, explanation: `Land is ${landRatio.toFixed(0)}% of total. Healthy ratio.` });
    } else if (landRatio <= 35) {
      factors.push({ label: "Land cost 25 to 35% of total", points: 10, maxPoints: 15, positive: true, explanation: `Land at ${landRatio.toFixed(0)}% is within range but higher side.` });
    } else {
      factors.push({ label: "Land cost above 35%", points: 0, maxPoints: 15, positive: false, explanation: `At ${landRatio.toFixed(0)}%, land eats into construction budget.` });
      risks.push("Land cost exceeds 35% of total project cost.");
    }
  }

  // 4. Timeline (15 points)
  if (state.timelineMonths <= 12) {
    factors.push({ label: "Timeline under 12 months", points: 15, maxPoints: 15, positive: true, explanation: "Shorter timeline reduces carrying costs." });
  } else if (state.timelineMonths <= 18) {
    factors.push({ label: "Timeline 12 to 18 months", points: 10, maxPoints: 15, positive: true, explanation: "Reasonable but adds to carrying costs." });
  } else {
    factors.push({ label: "Timeline over 18 months", points: 0, maxPoints: 15, positive: false, explanation: "Extended timelines significantly increase costs and risk." });
    risks.push("Build timeline over 18 months increases carrying costs.");
  }

  // 5. Financing (15 points)
  if (state.financingType === "cash" || state.financingType === "phased_cash" || state.financingType === "family_pooling") {
    factors.push({ label: "Cash financing", points: 15, maxPoints: 15, positive: true, explanation: "No interest costs. Full control." });
  } else if (state.downPaymentPct >= 20) {
    factors.push({ label: "Down payment 20%+", points: 12, maxPoints: 15, positive: true, explanation: "Good equity cushion and better loan terms." });
  } else if (state.downPaymentPct >= 10) {
    factors.push({ label: "Down payment 10 to 20%", points: 8, maxPoints: 15, positive: false, explanation: "Lower equity increases loan cost." });
  } else {
    factors.push({ label: "Down payment under 10%", points: 3, maxPoints: 15, positive: false, explanation: "Minimal equity buffer." });
    risks.push("Low down payment means minimal equity buffer.");
  }

  // 6. Market demand (15 points)
  factors.push({ label: "Market demand (estimated)", points: 12, maxPoints: 15, positive: true, explanation: "Based on current market conditions." });

  risks.push("Construction costs could exceed estimates by 10 to 20%. Your contingency budget is your safety net.");

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  let verdict: string;
  let verdictLevel: "strong" | "decent" | "risky";

  if (score >= 70) {
    verdict = "Strong deal. The numbers support moving forward with planning.";
    verdictLevel = "strong";
  } else if (score >= 50) {
    verdict = "Decent deal with some risk factors. Review the areas that scored low.";
    verdictLevel = "decent";
  } else {
    verdict = "This deal carries significant risk. Consider adjusting your assumptions.";
    verdictLevel = "risky";
  }

  return { score, factors, risks, verdict, verdictLevel };
}
