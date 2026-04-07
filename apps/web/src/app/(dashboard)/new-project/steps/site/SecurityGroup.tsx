"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function SecurityGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "security");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Security" subtitle="Security systems protect your investment during and after construction." breadcrumb="Site > Security">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.security === opt.id}
            costDelta={useCostDelta("security", opt.id, state.site.security, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateSite({ security: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Security systems protect your investment. Camera systems have dropped in price and are now standard in new construction.
      </MentorTip>
    </StepShell>
  );
}
