"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { formatCurrency, formatCurrencyCompact } from "@keystone/market-data";
import { useWizardStore, useCurrency, useDetailedCosts } from "../store";
import { CostDelta } from "./CostDelta";

// ---------------------------------------------------------------------------
// Category display config
// ---------------------------------------------------------------------------

const COST_CATEGORIES = [
  { key: "siteWork", label: "Site Work" },
  { key: "foundation", label: "Foundation" },
  { key: "framing", label: "Framing" },
  { key: "exterior", label: "Exterior" },
  { key: "interior", label: "Interior" },
  { key: "mechanical", label: "Mechanical" },
  { key: "specialItems", label: "Special Items" },
  { key: "parking", label: "Parking" },
  { key: "commonAreas", label: "Common Areas" },
  { key: "softCosts", label: "Soft Costs" },
  { key: "contingency", label: "Contingency" },
  { key: "land", label: "Land" },
  { key: "financing", label: "Financing" },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Replace hyphens with spaces and title-case each word. */
function titleCase(str: string): string {
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Join non-empty values into a summary string. */
function buildSummary(entries: Record<string, string | undefined>): string {
  return Object.values(entries)
    .filter((v): v is string => !!v && v !== "" && v !== "none")
    .map(titleCase)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Section summary cards
// ---------------------------------------------------------------------------

interface SectionCardProps {
  label: string;
  summary: string;
  sectionKey: string;
  showEdit: boolean;
}

function SectionCard({ label, summary, sectionKey, showEdit }: SectionCardProps) {
  const setEditingSection = useWizardStore((s) => s.setEditingSection);

  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-earth">{label}</p>
        <p className="text-[11px] text-muted truncate">
          {summary || "Not configured"}
        </p>
      </div>
      {showEdit && summary && (
        <button
          type="button"
          onClick={() => setEditingSection(sectionKey)}
          className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-clay hover:text-earth transition-colors"
        >
          Edit
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LivePreview
// ---------------------------------------------------------------------------

export function LivePreview() {
  const state = useWizardStore((s) => s.state);
  const currency = useCurrency();
  const costs = useDetailedCosts();

  const prevTotalRef = useRef(costs.grandTotal);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    const diff = costs.grandTotal - prevTotalRef.current;
    if (Math.abs(diff) >= 100) {
      setDelta(diff);
    }
    prevTotalRef.current = costs.grandTotal;
  }, [costs.grandTotal]);

  // Placeholder when no property type selected
  if (!state.propertyType) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-center text-sm text-muted">
          Select a property type to see your build preview.
        </p>
      </div>
    );
  }

  const isSimple = state.wizardMode === "simple";
  const hardCostPct =
    costs.grandTotal > 0
      ? Math.round((costs.totalHardCosts / costs.grandTotal) * 100)
      : 0;

  // Build section summaries
  const structureSummary = buildSummary({
    layout: state.structure.layout,
    foundation: state.structure.foundation,
    roof: state.structure.roof,
    exterior: state.structure.exterior,
  });

  const interiorSummary = buildSummary({
    flooring: state.interior.flooring,
    kitchen: state.interior.kitchenStyle,
    bathroom: state.interior.primaryBath,
    hvac: state.interior.hvac,
  });

  const siteSummary = buildSummary({
    lotSize: state.site.lotSize,
    lotShape: state.site.lotShape,
    driveway: state.site.driveway,
    landscaping: state.site.landscaping,
  });

  const unitsSummary = buildSummary({
    unitCount: state.unitConfig.unitCount ? `${state.unitConfig.unitCount} units` : undefined,
    unitMix: state.unitConfig.unitMix,
    management: state.unitConfig.management,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── Running total card ── */}
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-earth">Estimated Total</p>
          {delta !== 0 && <CostDelta amount={delta} currency={currency} variant="preview" />}
        </div>
        <p className="mt-1 text-[28px] font-data font-bold text-earth leading-tight">
          {formatCurrency(costs.grandTotal, currency)}
        </p>

        {/* Hard costs progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Hard costs</span>
            <span className="font-data">{hardCostPct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full bg-clay transition-all duration-500"
              style={{ width: `${hardCostPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Specs summary ── */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold text-earth">Build Specs</p>
        <SectionCard label="Structure" summary={structureSummary} sectionKey="structure" showEdit={isSimple} />
        <SectionCard label="Interior" summary={interiorSummary} sectionKey="interior" showEdit={isSimple} />
        <SectionCard label="Site" summary={siteSummary} sectionKey="site" showEdit={isSimple} />
        <SectionCard label="Units" summary={unitsSummary} sectionKey="units" showEdit={isSimple} />
      </div>

      {/* ── Cost breakdown ── */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[12px] font-semibold text-earth">Cost Breakdown</p>
        {COST_CATEGORIES.map(({ key, label }) => {
          const amount = costs[key];
          if (amount <= 0) return null;
          const pct =
            costs.grandTotal > 0 ? Math.round((amount / costs.grandTotal) * 100) : 0;
          return (
            <div key={key} className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-muted">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted">{pct}%</span>
                <span className="font-data text-[12px] font-medium text-earth">
                  {formatCurrencyCompact(amount, currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
