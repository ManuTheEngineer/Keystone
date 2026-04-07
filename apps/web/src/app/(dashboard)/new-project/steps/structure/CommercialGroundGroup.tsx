"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function CommercialGroundGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "commercialGround");
  if (!q) return null;

  return (
    <StepShell title="Ground Floor Use" subtitle="A commercial ground floor can generate additional revenue but changes zoning and build-out requirements." breadcrumb="Structure > Ground Floor">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.commercialGround === opt.id}
            onClick={() => updateStructure({ commercialGround: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        A commercial ground floor (retail-ready shell) adds rental income potential but requires different ceiling heights, utility connections, and possibly separate entrances. It may also change your zoning classification.
      </MentorTip>
    </StepShell>
  );
}
