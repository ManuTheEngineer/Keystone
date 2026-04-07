"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function BuildingAccessGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "buildingAccess");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Building Access" subtitle="How residents and visitors enter the building affects security and convenience." breadcrumb="Units > Access">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.buildingAccess === opt.id}
            costDelta={useCostDelta("buildingAccess", opt.id, state.site.buildingAccess, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ buildingAccess: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Key fob and smart lock systems cost more upfront but make tenant turnover easier -- no rekeying needed. Buzzer/intercom systems add convenience for visitors and deliveries.
      </MentorTip>
    </StepShell>
  );
}
