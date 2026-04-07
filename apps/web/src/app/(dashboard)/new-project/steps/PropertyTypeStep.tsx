"use client";

import { useWizardStore } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";
import type { PropertyType } from "../types";

const PROPERTY_TYPES: {
  id: PropertyType;
  title: string;
  desc: string;
  complexity: number;
  beginner: boolean;
}[] = [
  {
    id: "SFH",
    title: "Single-family home",
    desc: "One dwelling unit on one lot",
    complexity: 1,
    beginner: true,
  },
  {
    id: "DUPLEX",
    title: "Duplex",
    desc: "Two dwelling units in one structure",
    complexity: 2,
    beginner: true,
  },
  {
    id: "TRIPLEX",
    title: "Triplex",
    desc: "Three dwelling units",
    complexity: 3,
    beginner: false,
  },
  {
    id: "FOURPLEX",
    title: "Fourplex",
    desc: "Four dwelling units",
    complexity: 3,
    beginner: false,
  },
  {
    id: "APARTMENT",
    title: "Apartment building",
    desc: "Five or more units",
    complexity: 5,
    beginner: false,
  },
];

export function PropertyTypeStep() {
  const propertyType = useWizardStore((s) => s.state.propertyType);
  const update = useWizardStore((s) => s.update);

  return (
    <StepShell
      title="What type of property?"
      subtitle="Defines your floor plan options, structural requirements, and complexity."
    >
      <div className="space-y-3 animate-stagger">
        {PROPERTY_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => update("propertyType", t.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all card-hover ${
              propertyType === t.id
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-[14px] font-semibold text-earth">
                  {t.title}
                </h5>
                <p className="text-[11px] text-muted mt-0.5">{t.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                {t.beginner && (
                  <span className="text-[9px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Beginner friendly
                  </span>
                )}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-1.5 h-3 rounded-sm ${n <= t.complexity ? "bg-clay" : "bg-border"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <MentorTip>
        Start simple. A single-family home is the most forgiving for first-time
        builders. Multi-unit properties multiply complexity. Every unit needs its
        own kitchen, bathroom, and utility connections.
      </MentorTip>
    </StepShell>
  );
}
