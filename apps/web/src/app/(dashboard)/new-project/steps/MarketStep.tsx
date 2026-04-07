"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { getMarketData } from "@keystone/market-data";
import type { Market as MarketType } from "@keystone/market-data";
import { useWizardStore } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";

const MARKETS: {
  id: MarketType;
  title: string;
  desc: string;
  snap: string;
}[] = [
  {
    id: "USA",
    title: "United States",
    desc: "Wood-frame construction, institutional lending, IRC building codes",
    snap: "Construction loans convert to mortgages. Licensed trades required.",
  },
  {
    id: "TOGO",
    title: "Togo",
    desc: "Reinforced concrete block, CFA zone, titre foncier system",
    snap: "Self-funded in phases. Titre foncier process can take months.",
  },
  {
    id: "GHANA",
    title: "Ghana",
    desc: "Concrete block, cedi currency, Lands Commission registration",
    snap: "More formalized permit process. Land registration through Lands Commission.",
  },
  {
    id: "BENIN",
    title: "Benin",
    desc: "Concrete block, CFA zone, ANDF land registry",
    snap: "CFA currency zone shared with Togo. ANDF provides formal land ownership.",
  },
  {
    id: "IVORY_COAST" as MarketType,
    title: "Ivory Coast",
    desc: "Concrete block, CFA zone, ACD land system",
    snap: "Largest CFA economy. Similar construction methods to Togo. Formal permit system.",
  },
  {
    id: "SENEGAL" as MarketType,
    title: "Senegal",
    desc: "Concrete block, CFA zone, DGID land registry",
    snap: "CFA zone. Active diaspora construction market. Formal land registration system.",
  },
];

export function MarketStep() {
  const market = useWizardStore((s) => s.state.market);
  const update = useWizardStore((s) => s.update);

  const marketData = useMemo(() => {
    if (!market) return null;
    return getMarketData(market as MarketType);
  }, [market]);

  return (
    <StepShell
      title="Where are you building?"
      subtitle="Sets your cost benchmarks, regulations, templates, and construction method."
    >
      <div className="space-y-3 animate-stagger">
        {MARKETS.map((m) => (
          <button
            key={m.id}
            onClick={() => update("market", m.id)}
            className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
              market === m.id
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <h5 className="text-[14px] font-semibold text-earth">{m.title}</h5>
            <p className="text-[11px] text-muted mt-0.5">{m.desc}</p>
            {market === m.id && (
              <p className="text-[11px] text-emerald-700 mt-1.5 leading-relaxed">
                {m.snap}
              </p>
            )}
          </button>
        ))}
      </div>

      {market && marketData && (
        <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} className="text-emerald-700 shrink-0" />
            <span className="text-[12px] font-semibold text-emerald-800">
              Market snapshot
            </span>
          </div>
          <div className="space-y-1 text-[11px] text-emerald-800">
            <div className="flex justify-between">
              <span className="text-muted">Construction method</span>
              <span className="font-medium">
                {marketData.phases[0]?.constructionMethod ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Currency</span>
              <span className="font-medium">
                {marketData.currency.code} ({marketData.currency.symbol})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Typical timeline</span>
              <span className="font-medium">
                {marketData.phases.reduce(
                  (s, p) => s + p.typicalDurationWeeks.min,
                  0,
                )}
                {" to "}
                {marketData.phases.reduce(
                  (s, p) => s + p.typicalDurationWeeks.max,
                  0,
                )}
                {" weeks"}
              </span>
            </div>
          </div>
        </div>
      )}

      <MentorTip>
        Each market has fundamentally different construction methods, costs, and
        regulations. USA uses wood-frame construction with institutional lending.
        West Africa uses reinforced concrete with cash-based phased funding.
      </MentorTip>
    </StepShell>
  );
}
