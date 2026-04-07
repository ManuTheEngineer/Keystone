"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function CeilingWindowsGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const qCeiling = questions.find(q => q.key === "ceilingHeight");
  const qWindows = questions.find(q => q.key === "windows");
  if (!qCeiling && !qWindows) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Ceiling & Windows" subtitle="Ceiling height and window type affect both feel and energy performance." breadcrumb="Structure > Ceiling & Windows">
      {qCeiling && (
        <OptionGrid label={qCeiling.label}>
          {qCeiling.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.ceilingHeight === opt.id}
              costDelta={useCostDelta("ceilingHeight", opt.id, state.structure.ceilingHeight, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateStructure({ ceilingHeight: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qWindows && (
        <OptionGrid label={qWindows.label}>
          {qWindows.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.windows === opt.id}
              costDelta={useCostDelta("windows", opt.id, state.structure.windows, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateStructure({ windows: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        Higher ceilings feel more spacious but cost more in framing, drywall, and heating/cooling. Energy-efficient windows pay for themselves in 5-7 years through lower utility bills.
      </MentorTip>
    </StepShell>
  );
}
