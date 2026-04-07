"use client";

import { useState, useMemo } from "react";
import { Check, AlertTriangle, Shield, ChevronDown, ChevronUp } from "lucide-react";
import {
  getCostBenchmarks,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market as MarketType, CurrencyConfig, LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency, useDetailedCosts } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";
import type { ScoreFactor, DealResult } from "../types";

// ---------------------------------------------------------------------------
// ExpandableDetail (local helper)
// ---------------------------------------------------------------------------

function ExpandableDetail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border/40 pt-2 mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-clay font-medium hover:text-earth transition-colors"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {label}
      </button>
      {open && (
        <div className="mt-2 text-[12px] text-muted leading-relaxed animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost helpers (self-contained)
// ---------------------------------------------------------------------------

function getSizePresets(unit: "sqft" | "sqm") {
  if (unit === "sqft") {
    return { compact: 1000, standard: 1600, large: 2600, estate: 4000 };
  }
  return { compact: 90, standard: 150, large: 240, estate: 380 };
}

function getBuildingSize(sizeCategory: string, customSize: number, market: string): number {
  if (sizeCategory === "custom") return customSize;
  const unit = market === "USA" ? "sqft" : "sqm";
  const presets = getSizePresets(unit);
  return presets[sizeCategory as keyof typeof presets] ?? 0;
}

function getFeatureMultiplier(features: string[]): number {
  const map: Record<string, number> = {
    "garage-single": 0.05, "garage-double": 0.08, "porch-patio": 0.02,
    pool: 0.12, basement: 0.15, solar: 0.04, "ev-charger": 0.01,
    "smart-home": 0.03, "security-post": 0.02, "outdoor-kitchen": 0.04,
    fence: 0.02, "generator-house": 0.03, "water-tank": 0.03,
    septic: 0.05, sprinkler: 0.02, "guest-house": 0.1,
  };
  return 1 + features.reduce((s, f) => s + (map[f] ?? 0.02), 0);
}

function getConstructionCost(market: string, size: number, features: string[], locData: LocationData | null): number {
  if (!market || size <= 0) return 0;
  const benchmarks = getCostBenchmarks(market as MarketType);
  const costMid = benchmarks.reduce((s, b) => s + b.midRange, 0);
  const costIndex = locData?.costIndex ?? 1.0;
  return Math.round(costMid * size * costIndex * getFeatureMultiplier(features));
}

function getLandCost(landOption: string, landPrice: number, market: string, locData: LocationData | null, constructionCost: number): number {
  if (landOption === "known") return landPrice;
  if (locData) {
    if (market === "USA" && locData.landPricePerAcre) return locData.landPricePerAcre.mid;
    if (locData.landPricePerSqm) return locData.landPricePerSqm.mid * 500;
  }
  return Math.round(constructionCost * 0.25);
}

function getTotalProjectCost(
  market: string, sizeCategory: string, customSize: number, features: string[],
  landOption: string, landPrice: number, financingType: string,
  downPaymentPct: number, loanRate: number, timelineMonths: number,
  locData: LocationData | null,
) {
  const size = getBuildingSize(sizeCategory, customSize, market);
  const construction = getConstructionCost(market, size, features, locData);
  const land = getLandCost(landOption, landPrice, market, locData, construction);
  const soft = Math.round(construction * 0.15);
  const financing = (financingType === "cash" || financingType === "phased_cash" || financingType === "family_pooling")
    ? 0
    : Math.round((land + construction) * (1 - downPaymentPct / 100) * (loanRate / 100) * (timelineMonths / 12));
  const contingency = Math.round(construction * 0.15);
  const total = land + construction + soft + financing + contingency;
  return { land, construction, soft, financing, contingency, total };
}

function getEstimatedSaleValue(market: string, size: number, totalCost: number, locData: LocationData | null): number {
  if (locData) {
    if (market === "USA" && locData.avgSalePricePerSqft && size > 0) return Math.round(size * locData.avgSalePricePerSqft);
    if (locData.avgSalePricePerSqm && size > 0) return Math.round(size * locData.avgSalePricePerSqm);
  }
  return Math.round(totalCost * 1.2);
}

function getEstimatedMonthlyRent(market: string, size: number, locData: LocationData | null): number {
  if (!market || size <= 0) return 0;
  if (market === "USA") return Math.round(size * (locData?.avgRentPerSqft ?? 1.0));
  return Math.round(size * (locData?.avgRentPerSqm ?? 2000));
}

// ---------------------------------------------------------------------------
// Deal scoring
// ---------------------------------------------------------------------------

function calculateDealScore(
  goal: string, market: string, sizeCategory: string, customSize: number,
  features: string[], landOption: string, landPrice: number,
  financingType: string, downPaymentPct: number, loanRate: number,
  timelineMonths: number, targetSalePrice: number, monthlyRent: number,
  locData: LocationData | null, currency: CurrencyConfig,
  totalOverride?: number,
): DealResult {
  const rawCosts = getTotalProjectCost(
    market, sizeCategory, customSize, features,
    landOption, landPrice, financingType, downPaymentPct, loanRate, timelineMonths, locData,
  );
  const costs = totalOverride && totalOverride > 0 ? { ...rawCosts, total: totalOverride } : rawCosts;
  const size = getBuildingSize(sizeCategory, customSize, market);
  const factors: ScoreFactor[] = [];
  const risks: string[] = [];

  // 1. Profit / cap rate / savings (25 pts)
  if (goal === "sell") {
    const salePrice = targetSalePrice > 0 ? targetSalePrice : getEstimatedSaleValue(market, size, costs.total, locData);
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
  } else if (goal === "rent") {
    const rent = monthlyRent > 0 ? monthlyRent : getEstimatedMonthlyRent(market, size, locData);
    const annualRent = rent * 12;
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

  // 2. Construction cost efficiency (15 pts)
  if (market) {
    const costRange = getCostBenchmarks(market as MarketType);
    const costMid = costRange.reduce((s, b) => s + b.midRange, 0);
    const costHigh = costRange.reduce((s, b) => s + b.highRange, 0);
    const actualPerUnit = size > 0 ? getConstructionCost(market, size, features, locData) / size : 0;
    if (actualPerUnit <= costMid) {
      factors.push({ label: "Construction cost at or below average", points: 15, maxPoints: 15, positive: true, explanation: "Estimated cost is within the typical range for this market." });
    } else if (actualPerUnit <= costHigh) {
      factors.push({ label: "Construction cost above average", points: 8, maxPoints: 15, positive: false, explanation: "Costs above the market midpoint. Consider value engineering." });
    } else {
      factors.push({ label: "Construction cost well above range", points: 0, maxPoints: 15, positive: false, explanation: "Costs exceed typical market rates. Get competitive bids." });
      risks.push("Construction costs above market averages reduce margin.");
    }
  }

  // 3. Land cost ratio (15 pts)
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

  // 4. Timeline (15 pts)
  if (timelineMonths <= 12) {
    factors.push({ label: "Timeline under 12 months", points: 15, maxPoints: 15, positive: true, explanation: "Shorter timeline reduces carrying costs." });
  } else if (timelineMonths <= 18) {
    factors.push({ label: "Timeline 12 to 18 months", points: 10, maxPoints: 15, positive: true, explanation: "Reasonable but adds to carrying costs." });
  } else {
    factors.push({ label: "Timeline over 18 months", points: 0, maxPoints: 15, positive: false, explanation: "Extended timelines significantly increase costs and risk." });
    risks.push("Build timeline over 18 months increases carrying costs.");
  }

  // 5. Financing (15 pts)
  if (financingType === "cash" || financingType === "phased_cash" || financingType === "family_pooling") {
    factors.push({ label: "Cash financing", points: 15, maxPoints: 15, positive: true, explanation: "No interest costs. Full control." });
  } else if (downPaymentPct >= 20) {
    factors.push({ label: "Down payment 20%+", points: 12, maxPoints: 15, positive: true, explanation: "Good equity cushion and better loan terms." });
  } else if (downPaymentPct >= 10) {
    factors.push({ label: "Down payment 10 to 20%", points: 8, maxPoints: 15, positive: false, explanation: "Lower equity increases loan cost." });
  } else {
    factors.push({ label: "Down payment under 10%", points: 3, maxPoints: 15, positive: false, explanation: "Minimal equity buffer." });
    risks.push("Low down payment means minimal equity buffer.");
  }

  // 6. Market demand (15 pts)
  factors.push({ label: "Market demand (estimated)", points: 12, maxPoints: 15, positive: true, explanation: "Based on current market conditions." });

  risks.push("Construction costs could exceed estimates by 10 to 20%. Your contingency budget is your safety net.");

  const score = factors.reduce((s, f) => s + f.points, 0);
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScoreStep() {
  const state = useWizardStore((s) => s.state);
  const locationData = useWizardStore((s) => s.locationData);
  const currency = useCurrency();
  const detailedCosts = useDetailedCosts();

  const dealResult = useMemo(
    () =>
      calculateDealScore(
        state.goal,
        state.market,
        state.sizeCategory,
        state.customSize,
        state.features,
        state.landOption,
        state.landPrice,
        state.financingType,
        state.downPaymentPct,
        state.loanRate,
        state.timelineMonths,
        state.targetSalePrice,
        state.monthlyRent,
        locationData,
        currency,
        detailedCosts.grandTotal,
      ),
    [state, locationData, currency, detailedCosts.grandTotal],
  );

  const { score, factors, risks, verdict, verdictLevel } = dealResult;
  const scoreColor =
    verdictLevel === "strong"
      ? "text-emerald-600"
      : verdictLevel === "decent"
        ? "text-warning"
        : "text-danger";
  const scoreBg =
    verdictLevel === "strong"
      ? "bg-emerald-50 border-emerald-300"
      : verdictLevel === "decent"
        ? "bg-warning-bg border-warning"
        : "bg-danger-bg border-danger";

  return (
    <StepShell
      title="Deal score"
      subtitle="We evaluated your project across six factors. Here is how it stacks up."
    >
      <div className="text-left">
        {/* Score circle */}
        <div className="flex flex-col items-center mb-6">
          <div
            className={`w-24 h-24 rounded-full border-4 ${scoreBg} flex items-center justify-center`}
          >
            <span className={`text-[32px] font-data font-bold ${scoreColor}`}>
              {score}
            </span>
          </div>
          <span className="text-[11px] text-muted mt-2">out of 100</span>
        </div>

        {/* Verdict */}
        <div className={`p-4 rounded-xl border ${scoreBg} mb-6`}>
          <div className="flex items-start gap-2">
            <Shield
              size={16}
              className={`${scoreColor} mt-0.5 shrink-0`}
            />
            <p className="text-[13px] text-earth leading-relaxed">{verdict}</p>
          </div>
        </div>

        {/* Factor breakdown */}
        <div className="space-y-2 mb-6">
          {factors.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-border/50 bg-surface"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {f.positive ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={14} className="text-warning" />
                  )}
                  <span className="text-[12px] font-medium text-earth">
                    {f.label}
                  </span>
                </div>
                <span className="text-[11px] font-data text-muted">
                  {f.points}/{f.maxPoints}
                </span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${f.positive ? "bg-emerald-500" : "bg-warning"}`}
                  style={{ width: `${(f.points / f.maxPoints) * 100}%` }}
                />
              </div>
              <ExpandableDetail label="Details">
                {f.explanation}
              </ExpandableDetail>
            </div>
          ))}
        </div>

        {/* Risks */}
        {risks.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[12px] font-semibold text-earth mb-2">
              Risk factors
            </h4>
            <ul className="space-y-1.5">
              {risks.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-muted"
                >
                  <AlertTriangle
                    size={12}
                    className="text-warning shrink-0 mt-0.5"
                  />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        {score >= 50 ? (
          <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-center">
            <p className="text-[13px] text-emerald-800">
              This looks like a viable project. Let us set it up.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-warning bg-warning-bg text-center">
            <p className="text-[13px] text-earth">
              The numbers need work. You can go back and adjust your assumptions,
              or continue anyway.
            </p>
          </div>
        )}

        <MentorTip>
          A score above 70 means the numbers are solid. Between 50-70, proceed
          with caution and review the weak areas. Below 50, consider adjusting
          your assumptions before committing real money.
        </MentorTip>
      </div>
    </StepShell>
  );
}
