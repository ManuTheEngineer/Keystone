"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function FireSystemGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "fireSystem");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Fire Protection" subtitle="Fire protection systems save lives, reduce insurance costs, and are often required by code." breadcrumb="Structure > Fire System">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.fireSystem === opt.id}
            costDelta={useCostDelta("fireSystem", opt.id, state.structure.fireSystem, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ fireSystem: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Full sprinkler systems add significant cost but can reduce insurance premiums by 10-15% and are often required for buildings with 3+ units. They also protect your investment from catastrophic fire loss.
      </MentorTip>
    </StepShell>
  );
}
