"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function FlooringGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "flooring");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Flooring" subtitle="Flooring covers every square foot -- material choice has a big impact on total cost." breadcrumb="Interior > Flooring">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.flooring === opt.id}
            costDelta={useCostDelta("flooring", opt.id, state.interior.flooring, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateInterior({ flooring: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Flooring covers every square foot -- small per-unit cost differences multiply fast. LVP gives hardwood looks at half the price.
      </MentorTip>
    </StepShell>
  );
}
