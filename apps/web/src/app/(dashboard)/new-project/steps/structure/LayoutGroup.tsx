"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function LayoutGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "layout");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Layout Style" subtitle="Choose your home's floor plan layout. This affects stairway needs, foundation complexity, and daily livability." breadcrumb="Structure > Layout">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.layout === opt.id}
            costDelta={useCostDelta("layout", opt.id, state.structure.layout, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ layout: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Single-story homes cost less per square foot to build but need a bigger lot. Two-story homes save on foundation and roof costs but add stairways and structural complexity.
      </MentorTip>
    </StepShell>
  );
}
