"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function StairwellGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "stairwell");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Stairwell" subtitle="Stairwell configuration affects emergency egress, building code compliance, and floor plan efficiency." breadcrumb="Structure > Stairwell">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.stairwell === opt.id}
            costDelta={useCostDelta("stairwell", opt.id, state.structure.stairwell, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ stairwell: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Building codes typically require two means of egress for buildings over a certain size. Dual stairwells add cost but may be required for fire safety compliance.
      </MentorTip>
    </StepShell>
  );
}
