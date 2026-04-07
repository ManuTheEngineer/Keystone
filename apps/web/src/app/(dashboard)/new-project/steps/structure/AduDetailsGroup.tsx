"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function AduDetailsGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  // Only show if ADU is not "none"
  if (state.structure.adu === "none") return null;

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "aduType");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="ADU Construction Type" subtitle="How the ADU is built affects cost, permitting complexity, and timeline." breadcrumb="Structure > ADU Details">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.aduType === opt.id}
            costDelta={useCostDelta("aduType", opt.id, state.structure.aduType, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ aduType: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Garage conversions are typically the most affordable ADU option since the shell already exists. Detached ADUs offer more privacy but cost more due to separate foundation, utilities, and roof.
      </MentorTip>
    </StepShell>
  );
}
