"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function LandscapingGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "landscaping");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Landscaping" subtitle="Landscaping transforms a construction site into a finished property." breadcrumb="Site > Landscaping">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.landscaping === opt.id}
            costDelta={useCostDelta("landscaping", opt.id, state.site.landscaping, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ landscaping: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Landscaping is the final touch that transforms a construction site into a home. Full landscaping with irrigation adds significant value but costs more upfront.
      </MentorTip>
    </StepShell>
  );
}
