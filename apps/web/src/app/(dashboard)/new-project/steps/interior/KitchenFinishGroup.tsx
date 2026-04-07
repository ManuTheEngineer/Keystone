"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function KitchenFinishGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "kitchenFinish");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Kitchen Finish Level" subtitle="Finish level sets the quality of countertops, cabinets, and appliances." breadcrumb="Interior > Kitchen Finish">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.kitchenFinish === opt.id}
            costDelta={useCostDelta("kitchenFinish", opt.id, state.interior.kitchenFinish, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateInterior({ kitchenFinish: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Kitchen and bath finishes are where budgets balloon. A high-end kitchen can cost 3x a standard one. Pick the level that matches your goal -- renters rarely pay premium rent for luxury finishes.
      </MentorTip>
    </StepShell>
  );
}
