"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function FoundationGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "foundation");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Foundation Type" subtitle="Your foundation supports the entire structure. The right choice depends on your soil, climate, and whether you want below-grade space." breadcrumb="Structure > Foundation">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.foundation === opt.id}
            costDelta={useCostDelta("foundation", opt.id, state.structure.foundation, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ foundation: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Your foundation is the single biggest structural cost driver. A basement adds livable space but increases cost 35-40% vs a slab. In West Africa, raised slabs protect against flooding and termites.
      </MentorTip>
    </StepShell>
  );
}
