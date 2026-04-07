"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function BathroomGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const qPrimary = questions.find(q => q.key === "primaryBath");
  const qSecondary = questions.find(q => q.key === "secondaryBath");
  if (!qPrimary && !qSecondary) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Bathrooms" subtitle="Bathroom fixtures and layout set the comfort level for you or your tenants." breadcrumb="Interior > Bathrooms">
      {qPrimary && (
        <OptionGrid label={qPrimary.label}>
          {qPrimary.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.interior.primaryBath === opt.id}
              costDelta={useCostDelta("primaryBath", opt.id, state.interior.primaryBath, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateInterior({ primaryBath: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qSecondary && (
        <OptionGrid label={qSecondary.label}>
          {qSecondary.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.interior.secondaryBath === opt.id}
              costDelta={useCostDelta("secondaryBath", opt.id, state.interior.secondaryBath, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateInterior({ secondaryBath: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        Primary bathroom fixtures set the comfort level. Walk-in showers are trending but soaking tubs still add resale value in luxury markets.
      </MentorTip>
    </StepShell>
  );
}
