"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  formatCurrency,
  formatCurrencyCompact,
  getCostBenchmarks,
} from "@keystone/market-data";
import type { Market as MarketType, LocationData } from "@keystone/market-data";
import { useWizardStore, useCurrency, useDetailedCosts } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";

// ---------------------------------------------------------------------------
// CostDonut (self-contained SVG donut chart)
// ---------------------------------------------------------------------------

function CostDonut({
  segments,
  size = 160,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;
  const r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = circumference * pct;
        const dashOffset = circumference * cumulative;
        cumulative += pct;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={20}
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={-dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-500"
          />
        );
      })}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="-4"
        className="fill-current text-earth text-[11px]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Total
      </text>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="14"
        className="fill-current text-earth text-[14px] font-semibold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        100%
      </text>
    </svg>
  );
}

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

function getConstructionCost(
  market: string,
  size: number,
  features: string[],
  locationData: LocationData | null,
): number {
  if (!market || size <= 0) return 0;
  const benchmarks = getCostBenchmarks(market as MarketType);
  const costMid = benchmarks.reduce((s, b) => s + b.midRange, 0);
  const costIndex = locationData?.costIndex ?? 1.0;
  return Math.round(costMid * size * costIndex * getFeatureMultiplier(features));
}

function getLandCost(
  landOption: string,
  landPrice: number,
  market: string,
  locationData: LocationData | null,
  constructionCost: number,
): number {
  if (landOption === "known") return landPrice;
  if (locationData) {
    if (market === "USA" && locationData.landPricePerAcre)
      return locationData.landPricePerAcre.mid;
    if (locationData.landPricePerSqm)
      return locationData.landPricePerSqm.mid * 500;
  }
  return Math.round(constructionCost * 0.25);
}

function getFinancingCosts(
  financingType: string,
  landCost: number,
  constructionCost: number,
  downPaymentPct: number,
  loanRate: number,
  timelineMonths: number,
): number {
  if (
    financingType === "cash" ||
    financingType === "phased_cash" ||
    financingType === "family_pooling"
  )
    return 0;
  const basis = landCost + constructionCost;
  const loanPortion = basis * (1 - downPaymentPct / 100);
  return Math.round(loanPortion * (loanRate / 100) * (timelineMonths / 12));
}

function getEstimatedSaleValue(
  market: string,
  size: number,
  totalCost: number,
  locationData: LocationData | null,
): number {
  if (locationData) {
    if (market === "USA" && locationData.avgSalePricePerSqft && size > 0)
      return Math.round(size * locationData.avgSalePricePerSqft);
    if (locationData.avgSalePricePerSqm && size > 0)
      return Math.round(size * locationData.avgSalePricePerSqm);
  }
  return Math.round(totalCost * 1.2);
}

function getEstimatedMonthlyRent(
  market: string,
  size: number,
  locationData: LocationData | null,
): number {
  if (!market || size <= 0) return 0;
  if (market === "USA") {
    const rate = locationData?.avgRentPerSqft ?? 1.0;
    return Math.round(size * rate);
  }
  const rate = locationData?.avgRentPerSqm ?? 2000;
  return Math.round(size * rate);
}

// ---------------------------------------------------------------------------
// Category colors
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  Land: "#8B4513",
  "Site Work": "#6B4226",
  Foundation: "#2C1810",
  "Framing / Structure": "#3A3A3A",
  Exterior: "#1B4965",
  "Interior Finishes": "#D4A574",
  "Mechanical Systems": "#BC6C25",
  "Special Items": "#2D6A4F",
  "Parking / Garage": "#6A6A6A",
  "Common Areas": "#8B6914",
  "Soft Costs": "#D4A574",
  Contingency: "#BC6C25",
  Financing: "#1B4965",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FinancialsStep() {
  const state = useWizardStore((s) => s.state);
  const update = useWizardStore((s) => s.update);
  const locationData = useWizardStore((s) => s.locationData);
  const currency = useCurrency();
  const detailedCosts = useDetailedCosts();

  // Fallback (legacy) cost calculation
  const legacyCosts = useMemo(() => {
    const size = getBuildingSize(
      state.sizeCategory,
      state.customSize,
      state.market,
    );
    const construction = getConstructionCost(
      state.market,
      size,
      state.features,
      locationData,
    );
    const land = getLandCost(
      state.landOption,
      state.landPrice,
      state.market,
      locationData,
      construction,
    );
    const soft = Math.round(construction * 0.15);
    const financing = getFinancingCosts(
      state.financingType,
      land,
      construction,
      state.downPaymentPct,
      state.loanRate,
      state.timelineMonths,
    );
    const contingency = Math.round(construction * 0.15);
    const total = land + construction + soft + financing + contingency;
    return { land, construction, soft, financing, contingency, total };
  }, [state, locationData]);

  const useDetailed = detailedCosts.grandTotal > 0;
  const totalCost = useDetailed ? detailedCosts.grandTotal : legacyCosts.total;
  const landValue = useDetailed ? detailedCosts.land : legacyCosts.land;
  const constructionValue = useDetailed
    ? detailedCosts.totalHardCosts
    : legacyCosts.construction;
  const softValue = useDetailed ? detailedCosts.softCosts : legacyCosts.soft;
  const financingValue = useDetailed
    ? detailedCosts.financing
    : legacyCosts.financing;
  const contingencyValue = useDetailed
    ? detailedCosts.contingency
    : legacyCosts.contingency;

  // Donut segments
  const donutSegments = useMemo(
    () => [
      { label: "Land", value: landValue, color: "#8B4513" },
      { label: "Construction", value: constructionValue, color: "#2C1810" },
      { label: "Soft costs", value: softValue, color: "#D4A574" },
      { label: "Financing", value: financingValue, color: "#1B4965" },
      { label: "Contingency", value: contingencyValue, color: "#BC6C25" },
    ],
    [landValue, constructionValue, softValue, financingValue, contingencyValue],
  );

  // Grouped line items
  const groupedItems = useMemo(() => {
    if (!useDetailed || detailedCosts.lineItems.length === 0) return null;
    const groups: Record<
      string,
      { label: string; amount: number; formula?: string }[]
    > = {};
    for (const item of detailedCosts.lineItems) {
      if (item.amount <= 0) continue;
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push({
        label: item.label,
        amount: item.amount,
        formula: item.formula,
      });
    }
    return groups;
  }, [useDetailed, detailedCosts.lineItems]);

  // Revenue projection
  const revenueProjection = useMemo(() => {
    const size = getBuildingSize(
      state.sizeCategory,
      state.customSize,
      state.market,
    );
    if (state.goal === "sell") {
      const salePrice =
        state.targetSalePrice > 0
          ? state.targetSalePrice
          : getEstimatedSaleValue(state.market, size, totalCost, locationData);
      const profit = salePrice - totalCost;
      return {
        label: "Projected sale price",
        value: salePrice,
        secondary: `Profit: ${formatCurrencyCompact(profit, currency)}`,
      };
    }
    if (state.goal === "rent") {
      const monthlyRent =
        state.monthlyRent > 0
          ? state.monthlyRent
          : getEstimatedMonthlyRent(state.market, size, locationData);
      const annualRent = monthlyRent * 12;
      const capRate = totalCost > 0 ? (annualRent / totalCost) * 100 : 0;
      return {
        label: "Monthly rental income",
        value: monthlyRent,
        secondary: `Cap rate: ${capRate.toFixed(1)}%`,
      };
    }
    return null;
  }, [state, totalCost, locationData, currency]);

  // Estimated values for placeholder text
  const estSaleValue = useMemo(() => {
    const size = getBuildingSize(state.sizeCategory, state.customSize, state.market);
    return getEstimatedSaleValue(state.market, size, totalCost, locationData);
  }, [state.sizeCategory, state.customSize, state.market, totalCost, locationData]);

  const estMonthlyRent = useMemo(() => {
    const size = getBuildingSize(state.sizeCategory, state.customSize, state.market);
    return getEstimatedMonthlyRent(state.market, size, locationData);
  }, [state.sizeCategory, state.customSize, state.market, locationData]);

  return (
    <StepShell
      title="Your cost breakdown"
      subtitle="Full cost breakdown with revenue projections based on your goal."
    >
      <div className="text-left">
        {/* Donut chart */}
        <div className="mb-6">
          <CostDonut segments={donutSegments} />
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {donutSegments.map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[10px] text-muted">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost rows */}
        <div className="space-y-2 mb-6">
          {groupedItems
            ? Object.entries(groupedItems).map(([category, items]) => {
                const groupTotal = items.reduce((s, it) => s + it.amount, 0);
                const pct =
                  totalCost > 0 ? (groupTotal / totalCost) * 100 : 0;
                const color = CATEGORY_COLORS[category] ?? "#6A6A6A";
                return (
                  <div
                    key={category}
                    className="p-3 rounded-lg border border-border/50 bg-surface"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[13px] font-medium text-earth">
                          {category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-data font-semibold text-earth">
                          {formatCurrency(groupTotal, currency)}
                        </span>
                        <span className="text-[10px] text-muted ml-2">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ExpandableDetail
                      label={`${items.length} line item${items.length === 1 ? "" : "s"}`}
                    >
                      <div className="space-y-1.5">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] text-earth">
                                {item.label}
                              </span>
                              {item.formula && (
                                <p className="text-[10px] text-muted truncate">
                                  {item.formula}
                                </p>
                              )}
                            </div>
                            <span className="text-[11px] font-data text-earth ml-3 shrink-0">
                              {formatCurrency(item.amount, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ExpandableDetail>
                  </div>
                );
              })
            : [
                {
                  label: "Land",
                  value: landValue,
                  pct:
                    totalCost > 0 ? (landValue / totalCost) * 100 : 0,
                  color: "#8B4513",
                },
                {
                  label: "Construction",
                  value: constructionValue,
                  pct:
                    totalCost > 0
                      ? (constructionValue / totalCost) * 100
                      : 0,
                  color: "#2C1810",
                },
                {
                  label: "Soft costs (permits, design, fees)",
                  value: softValue,
                  pct:
                    totalCost > 0 ? (softValue / totalCost) * 100 : 0,
                  color: "#D4A574",
                },
                {
                  label: "Financing costs",
                  value: financingValue,
                  pct:
                    totalCost > 0
                      ? (financingValue / totalCost) * 100
                      : 0,
                  color: "#1B4965",
                },
                {
                  label: "Contingency (15%)",
                  value: contingencyValue,
                  pct:
                    totalCost > 0
                      ? (contingencyValue / totalCost) * 100
                      : 0,
                  color: "#BC6C25",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-3 rounded-lg border border-border/50 bg-surface"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-[13px] text-earth">
                        {row.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-data font-semibold text-earth">
                        {formatCurrency(row.value, currency)}
                      </span>
                      <span className="text-[10px] text-muted ml-2">
                        {row.pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Total */}
        <div className="p-4 rounded-xl border-2 border-earth bg-warm/50">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-earth">
              Total project cost
            </span>
            <span className="text-[18px] font-data font-bold text-earth">
              {formatCurrency(totalCost, currency)}
            </span>
          </div>
        </div>

        {/* Plain-language summary */}
        {totalCost > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-warm/30 border border-sand/20">
            <p className="text-[12px] text-earth leading-relaxed">
              <span className="font-semibold">In plain terms:</span> You will
              need approximately {formatCurrencyCompact(totalCost, currency)} to
              complete this build.
              {landValue > 0 &&
                ` About ${Math.round((landValue / totalCost) * 100)}% goes to land.`}
              {` Construction is the biggest cost at ${Math.round((constructionValue / totalCost) * 100)}%.`}
              {financingValue > 0 &&
                ` Financing adds ${Math.round((financingValue / totalCost) * 100)}% to your total.`}
              {` Your ${Math.round((contingencyValue / totalCost) * 100)}% contingency of ${formatCurrencyCompact(contingencyValue, currency)} protects against surprises.`}
            </p>
          </div>
        )}

        <MentorTip>
          These estimates are based on your specific selections across
          structure, interior, and site. Actual costs depend on your contractor
          quotes, material prices, and site conditions. The contingency is your
          safety buffer. Never skip it.
        </MentorTip>

        {/* Revenue projection */}
        {revenueProjection && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-300 bg-emerald-50">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-emerald-800">
                {revenueProjection.label}
              </span>
              <span className="text-[16px] font-data font-bold text-emerald-800">
                {formatCurrency(revenueProjection.value, currency)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              {revenueProjection.secondary}
            </p>
          </div>
        )}

        {/* Override inputs */}
        {state.goal === "sell" && (
          <div className="mt-3">
            <label className="text-[11px] text-muted block mb-1">
              Override target sale price ({currency.code})
            </label>
            <input
              type="number"
              value={state.targetSalePrice || ""}
              onChange={(e) =>
                update("targetSalePrice", Number(e.target.value))
              }
              placeholder={`Default: ${formatCurrencyCompact(estSaleValue, currency)}`}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
        {state.goal === "rent" && (
          <div className="mt-3">
            <label className="text-[11px] text-muted block mb-1">
              Override monthly rent ({currency.code})
            </label>
            <input
              type="number"
              value={state.monthlyRent || ""}
              onChange={(e) =>
                update("monthlyRent", Number(e.target.value))
              }
              placeholder={`Default: ${formatCurrencyCompact(estMonthlyRent, currency)}`}
              className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    </StepShell>
  );
}
