"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function KitchenGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "kitchenStyle");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Kitchen Layout" subtitle="Kitchen layout determines workflow, cabinetry length, and how the space connects to living areas." breadcrumb="Interior > Kitchen">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.kitchenStyle === opt.id}
            costDelta={useCostDelta("kitchenStyle", opt.id, state.interior.kitchenStyle, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateInterior({ kitchenStyle: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Kitchen layout determines how much cabinetry, countertop, and plumbing you need. Open concept is popular but costs more due to structural headers.
      </MentorTip>
    </StepShell>
  );
}
