"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function BuildingLayoutGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "buildingLayout");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Building Layout" subtitle="Building shape affects site usage, natural light, and construction cost." breadcrumb="Structure > Building Layout">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.buildingLayout === opt.id}
            costDelta={useCostDelta("buildingLayout", opt.id, state.structure.buildingLayout, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ buildingLayout: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Linear layouts are simplest to build but need a wide lot. Courtyard and L-shape designs create shared outdoor space and better cross-ventilation, important in warm climates.
      </MentorTip>
    </StepShell>
  );
}
