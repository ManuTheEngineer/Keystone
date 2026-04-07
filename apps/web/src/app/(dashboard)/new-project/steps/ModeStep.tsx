"use client";

import { useWizardStore } from "../store";
import { StepShell } from "../components/StepShell";
import { MentorTip } from "../components/MentorTip";
import type { WizardMode } from "../types";

const MODE_OPTIONS: {
  id: WizardMode;
  title: string;
  desc: string;
  detail: string;
}[] = [
  {
    id: "simple",
    title: "Quick setup",
    desc: "Use smart defaults and get to your estimate fast",
    detail:
      "We will pre-fill structure, interior, and site details based on your market and property type. You can always edit these later from your project dashboard.",
  },
  {
    id: "advanced",
    title: "Detailed setup",
    desc: "Specify every detail for the most accurate estimate",
    detail:
      "Choose your foundation type, roof style, kitchen finishes, lot shape, unit configuration, and more. Each selection refines your cost estimate.",
  },
];

export function ModeStep() {
  const wizardMode = useWizardStore((s) => s.state.wizardMode);
  const update = useWizardStore((s) => s.update);

  return (
    <StepShell
      title="How detailed do you want to go?"
      subtitle="You can always adjust your specs later from the project dashboard."
    >
      <div className="space-y-3 animate-stagger">
        {MODE_OPTIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => update("wizardMode", m.id)}
            className={`w-full p-5 rounded-xl border text-left transition-all card-hover ${
              wizardMode === m.id
                ? "border-emerald-500 border-2 bg-emerald-50/30 shadow-sm"
                : "border-border bg-surface hover:border-sand"
            }`}
          >
            <h5 className="text-[15px] font-semibold text-earth">{m.title}</h5>
            <p className="text-[12px] text-muted mt-1">{m.desc}</p>
            <p className="text-[11px] text-muted/70 mt-2 leading-relaxed">
              {m.detail}
            </p>
          </button>
        ))}
      </div>

      <MentorTip>
        Not sure? Start with Quick Setup. You will get a solid estimate based on
        market averages for your property type. You can drill into the details
        from your project settings after creation.
      </MentorTip>
    </StepShell>
  );
}
