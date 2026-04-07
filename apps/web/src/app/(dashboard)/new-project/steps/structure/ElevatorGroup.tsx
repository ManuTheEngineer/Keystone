"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function ElevatorGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "elevator");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Elevator" subtitle="Elevators improve accessibility and are often required by code for taller buildings." breadcrumb="Structure > Elevator">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.elevator === opt.id}
            costDelta={useCostDelta("elevator", opt.id, state.structure.elevator, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ elevator: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Elevators are a major capital expense but are often required for 3+ story buildings. An ADA-compliant elevator expands your tenant pool and may qualify for tax incentives.
      </MentorTip>
    </StepShell>
  );
}
