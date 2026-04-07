"use client";

import Link from "next/link";
import { TrendingUp, Building2, Home, Calculator, ArrowRight } from "lucide-react";
import { useWizardStore } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";
import type { BuildGoal } from "../types";

const GOAL_OPTIONS: {
  id: BuildGoal;
  title: string;
  description: string;
  Icon: typeof TrendingUp;
  tooltip: string;
}[] = [
  {
    id: "sell",
    title: "Build to sell",
    description:
      "Construct a property to sell at a profit. Higher risk, higher potential returns. Best for experienced investors or those willing to learn the development process.",
    Icon: TrendingUp,
    tooltip:
      "Spec building is higher risk since you fund the entire build and carry costs until the sale closes.",
  },
  {
    id: "rent",
    title: "Build to rent",
    description:
      "Build an investment property that generates ongoing rental income. Moderate risk, steady cash flow. Best for long-term wealth building and passive income seekers.",
    Icon: Building2,
    tooltip:
      "Rental properties require higher down payments (25%+) but generate recurring income. Lenders evaluate these differently.",
  },
  {
    id: "occupy",
    title: "Build to occupy",
    description:
      "Build a home for you and your family. Lower financial risk, personal fulfillment. Best for first-time builders who want exactly the home they envision.",
    Icon: Home,
    tooltip:
      "Owner-occupied homes qualify for better interest rates, lower down payments, and property tax reductions.",
  },
];

export function GoalStep() {
  const goal = useWizardStore((s) => s.state.goal);
  const fromAnalyzer = useWizardStore((s) => s.state.fromAnalyzer);
  const update = useWizardStore((s) => s.update);

  return (
    <StepShell
      title="What is your goal?"
      subtitle="This determines your financing options, tax treatment, and how we evaluate the deal."
    >
      <div className="space-y-3 animate-stagger">
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => update("goal", opt.id)}
            className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
              goal === opt.id
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 ${goal === opt.id ? "text-emerald-600" : "text-muted"}`}
              >
                <opt.Icon size={18} />
              </span>
              <div className="flex-1">
                <h5 className="text-[14px] font-semibold text-earth">
                  {opt.title}
                </h5>
                <p className="text-[12px] text-muted mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <MentorTip>
        Your goal shapes everything. Building to sell requires tighter cost
        control for profit margins. Building to rent means optimizing for
        long-term cash flow. Building to occupy lets you prioritize what matters
        most to you.
      </MentorTip>

      {!fromAnalyzer && (
        <div className="mt-4 p-3 rounded-xl border border-clay/20 bg-clay/5 text-left">
          <Link
            href="/analyze"
            className="flex items-center gap-2 text-[12px] text-clay font-medium hover:underline"
          >
            <Calculator size={14} />
            Want to analyze costs and risks first? Try the Deal Analyzer
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </StepShell>
  );
}
