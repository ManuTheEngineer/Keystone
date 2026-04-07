"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function GarageGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "garage");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Garage" subtitle="Garage type and size affect construction cost, lot usage, and daily convenience." breadcrumb="Site > Garage">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.garage === opt.id}
            costDelta={useCostDelta("garage", opt.id, state.site.garage, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ garage: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Garage or parking is essential for most markets. Detached garages cost more but offer more flexibility. In urban areas, consider parking ratio requirements.
      </MentorTip>
    </StepShell>
  );
}
