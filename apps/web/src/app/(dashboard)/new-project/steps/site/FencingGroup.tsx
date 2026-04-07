"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function FencingGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "fencing");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Fencing" subtitle="Fencing defines property boundaries and provides privacy and security." breadcrumb="Site > Fencing">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.fencing === opt.id}
            costDelta={useCostDelta("fencing", opt.id, state.site.fencing, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ fencing: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Fencing defines your property boundary. In West Africa, perimeter walls are standard for security. In the US, privacy fences are the most common choice.
      </MentorTip>
    </StepShell>
  );
}
