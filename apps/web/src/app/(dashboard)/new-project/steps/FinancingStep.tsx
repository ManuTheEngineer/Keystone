"use client";

import { CreditCard } from "lucide-react";
import { useWizardStore } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";
import type { FinancingType } from "../types";

const USA_OPTIONS: {
  id: FinancingType;
  title: string;
  desc: string;
}[] = [
  {
    id: "construction_loan",
    title: "Construction loan",
    desc: "Bank finances the build, converts to mortgage at completion. Requires 20%+ down, good credit.",
  },
  {
    id: "fha_203k",
    title: "FHA 203(k) renovation loan",
    desc: "Government-backed loan for purchase and renovation. Lower down payment (3.5%).",
  },
  {
    id: "cash",
    title: "Cash",
    desc: "Pay for everything out of pocket. No interest costs, full control, fastest closings.",
  },
];

const WA_OPTIONS: {
  id: FinancingType;
  title: string;
  desc: string;
}[] = [
  {
    id: "phased_cash",
    title: "Phased cash (build as you go)",
    desc: "The most common approach in West Africa. Build each phase as funds become available.",
  },
  {
    id: "diaspora",
    title: "Diaspora funding",
    desc: "Sending money from abroad to fund construction. Requires trusted local oversight.",
  },
  {
    id: "tontine",
    title: "Tontine / savings group",
    desc: "Community rotating savings fund. Members take turns receiving the pot.",
  },
  {
    id: "cash",
    title: "Full cash upfront",
    desc: "Pay the entire cost before construction begins.",
  },
  {
    id: "family_pooling",
    title: "Family pooling",
    desc: "Multiple family members contribute to fund the build. Common for diaspora families building together.",
  },
];

export function FinancingStep() {
  const state = useWizardStore((s) => s.state);
  const update = useWizardStore((s) => s.update);

  const isUSA = state.market === "USA";
  const options = isUSA ? USA_OPTIONS : WA_OPTIONS;
  const showLoanParams =
    state.financingType === "construction_loan" ||
    state.financingType === "fha_203k";

  return (
    <StepShell
      title="How will you finance this?"
      subtitle="Your financing method affects total cost, timeline, and risk."
    >
      <div className="space-y-3 animate-stagger">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => update("financingType", opt.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
              state.financingType === opt.id
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard
                size={16}
                className={
                  state.financingType === opt.id
                    ? "text-emerald-600"
                    : "text-muted"
                }
              />
              <div>
                <h5 className="text-[14px] font-semibold text-earth">
                  {opt.title}
                </h5>
                <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Loan parameters for construction loan / FHA */}
      {showLoanParams && (
        <div className="mt-4 p-4 rounded-[var(--radius)] border border-border bg-surface text-left space-y-3">
          <h5 className="text-[13px] font-semibold text-earth">
            Loan parameters
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted block mb-1">
                Down payment %
              </label>
              <input
                type="number"
                value={state.downPaymentPct}
                onChange={(e) =>
                  update("downPaymentPct", Number(e.target.value))
                }
                className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted block mb-1">
                Interest rate %
              </label>
              <input
                type="number"
                step="0.1"
                value={state.loanRate}
                onChange={(e) => update("loanRate", Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted block mb-1">
              Build timeline (months)
            </label>
            <input
              type="number"
              value={state.timelineMonths}
              onChange={(e) =>
                update("timelineMonths", Number(e.target.value))
              }
              className="w-full px-3 py-2 text-[13px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      <MentorTip>
        {isUSA
          ? "A construction loan typically requires 20-25% down and converts to a mortgage when building is complete. Your debt-to-income ratio (DTI), the percentage of your monthly income going to debt payments, must usually be below 43% to qualify."
          : "Phased cash funding means you build as money is available. This avoids interest costs but extends your timeline. Budget carefully. Running out of funds mid-construction is the most expensive mistake."}
      </MentorTip>
    </StepShell>
  );
}
