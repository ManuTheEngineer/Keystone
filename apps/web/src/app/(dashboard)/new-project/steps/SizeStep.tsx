"use client";

import { useMemo } from "react";
import { Bed, Bath, Layers, Info } from "lucide-react";
import {
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market as MarketType, LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency, useSizeUnit, useDetailedCosts } from "../store";
import { StepShell } from "../components/StepShell";
import { Stepper } from "../components/Stepper";
import { MentorTip } from "../components/MentorTip";
import type { SizeCategory } from "../types";

// ---------------------------------------------------------------------------
// Helpers (self-contained, no dependency on page.tsx)
// ---------------------------------------------------------------------------

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

function getMarketCostMid(market: MarketType): number {
  const benchmarks = getCostBenchmarks(market);
  return benchmarks.reduce((sum, b) => sum + b.midRange, 0);
}

function getFeatureMultiplier(features: string[]): number {
  const FEATURE_COST_PCT: Record<string, number> = {
    "garage-single": 0.05,
    "garage-double": 0.08,
    "porch-patio": 0.02,
    pool: 0.12,
    basement: 0.15,
    solar: 0.04,
    "ev-charger": 0.01,
    "smart-home": 0.03,
    "security-post": 0.02,
    "outdoor-kitchen": 0.04,
    fence: 0.02,
    "generator-house": 0.03,
    "water-tank": 0.03,
    septic: 0.05,
    sprinkler: 0.02,
    "guest-house": 0.1,
  };
  return 1 + features.reduce((sum, f) => sum + (FEATURE_COST_PCT[f] ?? 0.02), 0);
}

function estimateCostForSize(
  size: number,
  market: MarketType,
  features: string[],
  locationData: LocationData | null,
): number {
  if (size <= 0) return 0;
  const costMid = getMarketCostMid(market);
  const costIndex = locationData?.costIndex ?? 1.0;
  const featureMult = getFeatureMultiplier(features);
  return Math.round(costMid * size * costIndex * featureMult);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SizeStep() {
  const state = useWizardStore((s) => s.state);
  const update = useWizardStore((s) => s.update);
  const locationData = useWizardStore((s) => s.locationData);
  const currency = useCurrency();
  const sizeUnit = useSizeUnit();
  const detailedCosts = useDetailedCosts();

  const presets = useMemo(() => getSizePresets(sizeUnit), [sizeUnit]);
  const presetEntries = useMemo(
    () =>
      Object.entries(presets) as [
        string,
        { min: number; max: number; typical: number; label: string },
      ][],
    [presets],
  );

  // Current building size for the info card
  const buildingSize = useMemo(() => {
    if (state.sizeCategory === "custom") return state.customSize;
    return presets[state.sizeCategory as keyof typeof presets]?.typical ?? 0;
  }, [state.sizeCategory, state.customSize, presets]);

  const constructionCostNow = useMemo(() => {
    if (!state.market) return 0;
    return estimateCostForSize(
      buildingSize,
      state.market as MarketType,
      state.features,
      locationData,
    );
  }, [buildingSize, state.market, state.features, locationData]);

  if (!state.market) return null;

  return (
    <StepShell
      title="How big?"
      subtitle="Size presets give you instant cost estimates. You can also enter a custom size."
    >
      <div className="space-y-3 animate-stagger">
        {presetEntries.map(([key, preset]) => {
          const isSelected = state.sizeCategory === key;
          const estCost = estimateCostForSize(
            preset.typical,
            state.market as MarketType,
            state.features,
            locationData,
          );
          return (
            <button
              key={key}
              onClick={() => update("sizeCategory", key as SizeCategory)}
              className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
                isSelected
                  ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[14px] font-semibold text-earth">
                    {preset.label}
                  </h5>
                  <p className="text-[11px] text-muted">
                    Typical: {preset.typical.toLocaleString()} {sizeUnit}
                  </p>
                </div>
                <span className="text-[13px] font-data font-medium text-clay">
                  {formatCurrencyCompact(estCost, currency)}
                </span>
              </div>
            </button>
          );
        })}

        {/* Custom size */}
        <button
          onClick={() => update("sizeCategory", "custom")}
          className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
            state.sizeCategory === "custom"
              ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
              : "border-border bg-surface hover:border-sand"
          }`}
        >
          <h5 className="text-[14px] font-semibold text-earth">Custom size</h5>
          <p className="text-[11px] text-muted">
            Enter your exact{" "}
            {sizeUnit === "sqft" ? "square footage" : "square meters"}
          </p>
        </button>

        {state.sizeCategory === "custom" && (
          <div className="mt-2">
            <input
              type="number"
              value={state.customSize || ""}
              onChange={(e) => update("customSize", Number(e.target.value))}
              placeholder={`Enter size in ${sizeUnit}`}
              className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        {/* Beds, Baths, Stories */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stepper
            label="Bedrooms"
            value={state.bedrooms}
            min={1}
            max={8}
            Icon={Bed}
            onChange={(v) => update("bedrooms", v)}
          />
          <Stepper
            label="Bathrooms"
            value={state.bathrooms}
            min={1}
            max={6}
            Icon={Bath}
            onChange={(v) => update("bathrooms", v)}
          />
          <Stepper
            label="Stories"
            value={state.stories}
            min={1}
            max={3}
            Icon={Layers}
            onChange={(v) => update("stories", v)}
          />
        </div>
      </div>

      {/* Detailed cost info card */}
      {detailedCosts.grandTotal > 0 && (
        <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-emerald-700 shrink-0" />
            <span className="text-[12px] font-semibold text-emerald-800">
              Estimated total project cost
            </span>
          </div>
          <span className="text-[16px] font-data font-semibold text-emerald-800">
            {formatCurrency(detailedCosts.grandTotal, currency)}
          </span>
          <p className="text-[10px] text-emerald-600 mt-1">
            Based on your selections across structure, interior, and site.
            Construction:{" "}
            {formatCurrencyCompact(detailedCosts.totalHardCosts, currency)}.
            {locationData
              ? ` Adjusted for ${locationData.city} (${locationData.costIndex.toFixed(2)}x cost index).`
              : ""}
          </p>
        </div>
      )}
      {detailedCosts.grandTotal <= 0 && constructionCostNow > 0 && (
        <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
          <div className="flex items-center gap-2 mb-1">
            <Info size={14} className="text-emerald-700 shrink-0" />
            <span className="text-[12px] font-semibold text-emerald-800">
              Estimated construction cost
            </span>
          </div>
          <span className="text-[16px] font-data font-semibold text-emerald-800">
            {formatCurrency(constructionCostNow, currency)}
          </span>
          <p className="text-[10px] text-emerald-600 mt-1">
            Based on market benchmarks for{" "}
            {buildingSize.toLocaleString()} {sizeUnit}
            {locationData
              ? `, adjusted for ${locationData.city} (${locationData.costIndex.toFixed(2)}x cost index)`
              : ""}
            . Actual costs vary by finishes and site conditions.
          </p>
        </div>
      )}

      <MentorTip>
        Bigger is not always better. Every extra{" "}
        {sizeUnit === "sqft" ? "square foot" : "square meter"} adds cost to
        build, heat, cool, and maintain. Choose the size that matches your budget
        and goals. You can always expand later.
      </MentorTip>
    </StepShell>
  );
}
