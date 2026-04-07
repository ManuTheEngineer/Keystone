"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function SmartHomeGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "smartHome");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Smart Home" subtitle="Smart features add convenience and can improve energy efficiency and security." breadcrumb="Interior > Smart Home">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.smartHome === opt.id}
            costDelta={useCostDelta("smartHome", opt.id, state.interior.smartHome, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateInterior({ smartHome: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Smart home features are increasingly expected in new builds. Basic packages (thermostat + locks) add minimal cost. Full automation is a premium feature.
      </MentorTip>
    </StepShell>
  );
}
