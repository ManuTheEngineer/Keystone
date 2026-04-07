"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function FinishConsistencyGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "finishConsistency");
  if (!q) return null;

  return (
    <StepShell title="Finish Consistency" subtitle="Decide whether all units get the same finishes or if some get upgraded." breadcrumb="Interior > Finishes">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.finishConsistency === opt.id}
            onClick={() => updateInterior({ finishConsistency: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Keeping all units identical simplifies purchasing and maintenance. Upgrading the owner unit makes sense if you plan to live in one unit while renting the others.
      </MentorTip>
    </StepShell>
  );
}
