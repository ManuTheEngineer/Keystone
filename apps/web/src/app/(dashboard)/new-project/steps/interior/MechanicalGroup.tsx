"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function MechanicalGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);
  const currency = useCurrency();

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const qHvac = questions.find(q => q.key === "hvac");
  const qWaterHeater = questions.find(q => q.key === "waterHeater");
  if (!qHvac && !qWaterHeater) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Mechanical Systems" subtitle="HVAC and water heating are your biggest ongoing energy costs after construction." breadcrumb="Interior > Mechanical">
      {qHvac && (
        <OptionGrid label={qHvac.label}>
          {qHvac.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.interior.hvac === opt.id}
              costDelta={useCostDelta("hvac", opt.id, state.interior.hvac, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateInterior({ hvac: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qWaterHeater && (
        <OptionGrid label={qWaterHeater.label}>
          {qWaterHeater.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.interior.waterHeater === opt.id}
              costDelta={useCostDelta("waterHeater", opt.id, state.interior.waterHeater, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateInterior({ waterHeater: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        HVAC is your biggest ongoing energy cost. Mini-splits are efficient but need one per zone. Central air costs more upfront but gives whole-house coverage.
      </MentorTip>
    </StepShell>
  );
}
