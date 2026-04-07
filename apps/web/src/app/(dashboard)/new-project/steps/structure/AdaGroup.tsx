"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function AdaGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "adaCompliance");
  if (!q) return null;

  return (
    <StepShell title="ADA Compliance" subtitle="Accessibility features widen your tenant pool and may be required by local building codes." breadcrumb="Structure > ADA Compliance">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.adaCompliance === opt.id}
            onClick={() => updateStructure({ adaCompliance: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        ADA-compliant units with wider doorways, roll-in showers, and accessible kitchens expand your tenant pool. Many jurisdictions require a percentage of accessible units in new multi-family buildings.
      </MentorTip>
    </StepShell>
  );
}
