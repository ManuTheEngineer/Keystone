"use client";

import { useMemo } from "react";
import { Landmark, MapPin } from "lucide-react";
import {
  getCostBenchmarks,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market as MarketType, LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";

// ---------------------------------------------------------------------------
// Helpers (self-contained)
// ---------------------------------------------------------------------------

function getSizePresets(unit: "sqft" | "sqm") {
  if (unit === "sqft") {
    return {
      compact: 1000,
      standard: 1600,
      large: 2600,
      estate: 4000,
    };
  }
  return {
    compact: 90,
    standard: 150,
    large: 240,
    estate: 380,
  };
}

function getBuildingSize(
  sizeCategory: string,
  customSize: number,
  market: string,
): number {
  if (sizeCategory === "custom") return customSize;
  const unit = market === "USA" ? "sqft" : "sqm";
  const presets = getSizePresets(unit);
  return presets[sizeCategory as keyof typeof presets] ?? 0;
}

function estimateLandCost(
  market: string,
  sizeCategory: string,
  customSize: number,
  features: string[],
  locationData: LocationData | null,
  lotSize: string,
): number {
  // Use location-specific land pricing
  if (locationData) {
    if (market === "USA" && locationData.landPricePerAcre) {
      return locationData.landPricePerAcre.mid;
    }
    if (locationData.landPricePerSqm) {
      return locationData.landPricePerSqm.mid * 500;
    }
  }
  // Fallback: 25% of construction cost
  const size = getBuildingSize(sizeCategory, customSize, market);
  if (size <= 0 || !market) return 0;
  const benchmarks = getCostBenchmarks(market as MarketType);
  const costMid = benchmarks.reduce((s, b) => s + b.midRange, 0);
  const costIndex = locationData?.costIndex ?? 1.0;
  const constructionCost = Math.round(costMid * size * costIndex);
  return Math.round(constructionCost * 0.25);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LandStep() {
  const state = useWizardStore((s) => s.state);
  const update = useWizardStore((s) => s.update);
  const locationData = useWizardStore((s) => s.locationData);
  const currency = useCurrency();

  const estimatedLand = useMemo(
    () =>
      estimateLandCost(
        state.market,
        state.sizeCategory,
        state.customSize,
        state.features,
        locationData,
        state.site.lotSize,
      ),
    [
      state.market,
      state.sizeCategory,
      state.customSize,
      state.features,
      locationData,
      state.site.lotSize,
    ],
  );

  return (
    <StepShell
      title="Land cost"
      subtitle="Land is often the biggest variable. If you already own land, enter what you paid. Otherwise we will estimate."
    >
      <div className="space-y-3 animate-stagger">
        <button
          onClick={() => update("landOption", "known")}
          className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
            state.landOption === "known"
              ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
              : "border-border bg-surface hover:border-sand"
          }`}
        >
          <div className="flex items-center gap-3">
            <Landmark
              size={18}
              className={
                state.landOption === "known"
                  ? "text-emerald-600"
                  : "text-muted"
              }
            />
            <div>
              <h5 className="text-[14px] font-semibold text-earth">
                I have land (or a price)
              </h5>
              <p className="text-[11px] text-muted">
                Enter the purchase price or appraised value
              </p>
            </div>
          </div>
        </button>

        {state.landOption === "known" && (
          <div className="pl-10">
            <label className="text-[12px] text-muted mb-1 block">
              Land price ({currency.code})
            </label>
            <input
              type="number"
              value={state.landPrice || ""}
              onChange={(e) => update("landPrice", Number(e.target.value))}
              placeholder="Enter land cost"
              className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        <button
          onClick={() => update("landOption", "estimate")}
          className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
            state.landOption === "estimate"
              ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
              : "border-border bg-surface hover:border-sand"
          }`}
        >
          <div className="flex items-center gap-3">
            <MapPin
              size={18}
              className={
                state.landOption === "estimate"
                  ? "text-emerald-600"
                  : "text-muted"
              }
            />
            <div>
              <h5 className="text-[14px] font-semibold text-earth">
                I am still looking
              </h5>
              <p className="text-[11px] text-muted">
                {locationData
                  ? `Based on a ${state.site.lotSize || "standard"} lot in ${locationData.city}: ${formatCurrencyCompact(estimatedLand, currency)}`
                  : `We will estimate land at 25% of construction cost (${formatCurrencyCompact(estimatedLand, currency)})`}
              </p>
            </div>
          </div>
        </button>
      </div>

      <MentorTip>
        {state.market === "USA"
          ? "Before buying land, verify zoning allows your intended use, check for easements, confirm utility connections are available, and get a soil test for foundation design."
          : "In West Africa, always verify land ownership through the formal title system (titre foncier in Togo, Lands Commission in Ghana, ANDF in Benin). Customary land claims can create disputes."}
      </MentorTip>
    </StepShell>
  );
}
