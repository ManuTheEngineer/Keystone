"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function AduGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "adu");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="ADU (Accessory Dwelling Unit)" subtitle="An ADU adds a separate living space to your property, ideal for rental income or family." breadcrumb="Structure > ADU">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.adu === opt.id}
            costDelta={useCostDelta("adu", opt.id, state.structure.adu, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ adu: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        ADUs are one of the best ROI additions to a single-family home. Many cities have relaxed ADU zoning rules. A studio ADU can generate rental income that covers a significant portion of your mortgage.
      </MentorTip>
    </StepShell>
  );
}
