"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function RoofGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "roof");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Roof Style" subtitle="Roof shape and material impact weather protection, energy efficiency, and curb appeal." breadcrumb="Structure > Roof">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.roof === opt.id}
            costDelta={useCostDelta("roof", opt.id, state.structure.roof, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ roof: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Roof style affects both material cost and labor. Hip roofs cost more but handle wind better. Flat roofs are cheaper and give you usable rooftop space.
      </MentorTip>
    </StepShell>
  );
}
