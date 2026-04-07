"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function HvacConfigGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "hvacConfig");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="HVAC Configuration" subtitle="How heating and cooling is distributed across units affects energy costs and tenant control." breadcrumb="Interior > HVAC Config">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.hvacConfig === opt.id}
            costDelta={useCostDelta("hvacConfig", opt.id, state.interior.hvacConfig, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateInterior({ hvacConfig: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Individual HVAC systems let each tenant control their own climate and pay their own energy bills. Shared systems cost less upfront but make utility separation harder.
      </MentorTip>
    </StepShell>
  );
}
