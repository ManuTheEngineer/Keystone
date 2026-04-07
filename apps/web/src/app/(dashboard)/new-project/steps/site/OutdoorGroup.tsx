"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function OutdoorGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "outdoorLiving");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  function toggleOutdoor(id: string) {
    const current = state.site.outdoorLiving || [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateSite({ outdoorLiving: next });
  }

  return (
    <StepShell title="Outdoor Living" subtitle="Select all outdoor features you want. These extend your livable space and boost property value." breadcrumb="Site > Outdoor Living">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            multiSelect
            selected={(state.site.outdoorLiving || []).includes(opt.id)}
            costDelta={useCostDelta("outdoorLiving", opt.id, "", buildingSize, state.market as any)}
            currency={currency}
            onClick={() => toggleOutdoor(opt.id)}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Outdoor living spaces are among the highest-ROI additions. A covered patio or deck extends your usable square footage at a fraction of interior construction cost.
      </MentorTip>
    </StepShell>
  );
}
