"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function DrivewayGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "driveway");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Driveway" subtitle="Driveway material affects durability, curb appeal, and site preparation costs." breadcrumb="Site > Driveway">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.driveway === opt.id}
            costDelta={useCostDelta("driveway", opt.id, state.site.driveway, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ driveway: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Concrete driveways last 30+ years with minimal maintenance. Gravel is cheapest upfront but needs regular replenishment. Pavers look premium but cost 2-3x more than poured concrete.
      </MentorTip>
    </StepShell>
  );
}
