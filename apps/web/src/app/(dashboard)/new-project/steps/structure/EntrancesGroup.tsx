"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function EntrancesGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "entrances");
  if (!q) return null;

  return (
    <StepShell title="Entrances" subtitle="How tenants enter their units affects privacy, security, and the building's feel." breadcrumb="Structure > Entrances">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.entrances === opt.id}
            onClick={() => updateStructure({ entrances: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Separate exterior entrances give each unit more privacy and an independent feel, which tenants prefer. Shared hallways cost less but require common-area maintenance and lighting.
      </MentorTip>
    </StepShell>
  );
}
