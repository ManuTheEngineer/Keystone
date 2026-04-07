"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function ExteriorGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "exterior");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Exterior Finish" subtitle="Your building's outer skin protects against weather and defines its look from the street." breadcrumb="Structure > Exterior">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.exterior === opt.id}
            costDelta={useCostDelta("exterior", opt.id, state.structure.exterior, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ exterior: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Exterior finish is your building's first impression and weather barrier. Brick and stone cost more but last decades longer with less maintenance.
      </MentorTip>
    </StepShell>
  );
}
