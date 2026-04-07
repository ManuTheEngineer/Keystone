"use client";

import { useMemo } from "react";
import {
  formatCurrency,
  getCostBenchmarks,
} from "@keystone/market-data";
import type { Market as MarketType, LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency, useSizeUnit, useDetailedCosts } from "../store";
import { StepShell } from "../components/StepShell";
import type { ScoreFactor, DealResult } from "../types";

// ---------------------------------------------------------------------------
// Helpers (self-contained)
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

function getConstructionCostHelper(market: string, size: number, features: string[], locData: LocationData | null): number {
  if (!market || size <= 0) return 0;
  const benchmarks = getCostBenchmarks(market as MarketType);
  const costMid = benchmarks.reduce((s, b) => s + b.midRange, 0);
  const costIndex = locData?.costIndex ?? 1.0;
  return Math.round(costMid * size * costIndex * getFeatureMultiplier(features));
}

function getLegacyTotalCost(
  market: string, sizeCategory: string, customSize: number, features: string[],
  landOption: string, landPrice: number, financingType: string,
  downPaymentPct: number, loanRate: number, timelineMonths: number,
  locData: LocationData | null,
): number {
  const size = getBuildingSize(sizeCategory, customSize, market);
  const construction = getConstructionCostHelper(market, size, features, locData);
  const land = landOption === "known"
    ? landPrice
    : locData
      ? (market === "USA" && locData.landPricePerAcre ? locData.landPricePerAcre.mid : locData.landPricePerSqm ? locData.landPricePerSqm.mid * 500 : Math.round(construction * 0.25))
      : Math.round(construction * 0.25);
  const soft = Math.round(construction * 0.15);
  const financing = (financingType === "cash" || financingType === "phased_cash" || financingType === "family_pooling")
    ? 0
    : Math.round((land + construction) * (1 - downPaymentPct / 100) * (loanRate / 100) * (timelineMonths / 12));
  const contingency = Math.round(construction * 0.15);
  return land + construction + soft + financing + contingency;
}

// Simplified deal score (just the number, matching page.tsx logic)
function quickDealScore(
  goal: string, market: string, financingType: string,
  downPaymentPct: number, timelineMonths: number,
): number {
  let score = 0;
  // Goal factor (simplified)
  score += goal === "occupy" ? 20 : 12;
  // Cost efficiency
  score += 15;
  // Land ratio
  score += 10;
  // Timeline
  score += timelineMonths <= 12 ? 15 : timelineMonths <= 18 ? 10 : 0;
  // Financing
  if (financingType === "cash" || financingType === "phased_cash" || financingType === "family_pooling") {
    score += 15;
  } else if (downPaymentPct >= 20) {
    score += 12;
  } else if (downPaymentPct >= 10) {
    score += 8;
  } else {
    score += 3;
  }
  // Market demand
  score += 12;
  return score;
}

// ---------------------------------------------------------------------------
// SummaryRow
// ---------------------------------------------------------------------------

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-earth">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NameStep() {
  const state = useWizardStore((s) => s.state);
  const update = useWizardStore((s) => s.update);
  const locationData = useWizardStore((s) => s.locationData);
  const currency = useCurrency();
  const sizeUnit = useSizeUnit();
  const detailedCosts = useDetailedCosts();

  const buildingSize = useMemo(
    () => getBuildingSize(state.sizeCategory, state.customSize, state.market),
    [state.sizeCategory, state.customSize, state.market],
  );

  const totalBudget = useMemo(() => {
    if (detailedCosts.grandTotal > 0) return detailedCosts.grandTotal;
    return getLegacyTotalCost(
      state.market, state.sizeCategory, state.customSize, state.features,
      state.landOption, state.landPrice, state.financingType,
      state.downPaymentPct, state.loanRate, state.timelineMonths,
      locationData,
    );
  }, [detailedCosts.grandTotal, state, locationData]);

  const dealScore = useMemo(
    () =>
      quickDealScore(
        state.goal,
        state.market,
        state.financingType,
        state.downPaymentPct,
        state.timelineMonths,
      ),
    [state.goal, state.market, state.financingType, state.downPaymentPct, state.timelineMonths],
  );

  const goalLabel =
    state.goal === "sell"
      ? "Build to sell"
      : state.goal === "rent"
        ? "Build to rent"
        : "Build to occupy";

  return (
    <StepShell
      title="Name your project"
      subtitle="Give it a name you will recognize. You can change this later."
    >
      <div className="text-left">
        <input
          type="text"
          value={state.projectName}
          onChange={(e) => update("projectName", e.target.value)}
          placeholder="e.g. Robinson residence, Lome villa, Houston duplex"
          className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
        <p className="text-[10px] text-muted mt-2">
          Tip: Use the property address, family name, or location for easy
          identification.
        </p>

        {/* Summary */}
        <div className="mt-6 p-4 rounded-xl border border-border bg-surface space-y-2">
          <h4 className="text-[13px] font-semibold text-earth mb-3">
            Project summary
          </h4>
          <SummaryRow label="Goal" value={goalLabel} />
          <SummaryRow label="Market" value={state.market as string} />
          <SummaryRow label="Location" value={state.city} />
          <SummaryRow
            label="Property type"
            value={state.propertyType as string}
          />
          <SummaryRow
            label="Size"
            value={`${buildingSize.toLocaleString()} ${sizeUnit}`}
          />
          <SummaryRow
            label="Total budget"
            value={formatCurrency(totalBudget, currency)}
          />
          <SummaryRow
            label="Financing"
            value={state.financingType.replace(/_/g, " ")}
          />
          <SummaryRow label="Deal score" value={`${dealScore}/100`} />
        </div>
      </div>
    </StepShell>
  );
}
