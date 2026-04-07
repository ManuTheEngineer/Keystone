"use client";

import { Building2 } from "lucide-react";
import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { Stepper } from "../../components/Stepper";
import { MentorTip } from "../../components/MentorTip";

export function UnitCountGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);
  const currency = useCurrency();

  // Only for apartments
  if (state.propertyType !== "APARTMENT") return null;

  return (
    <StepShell title="Total Units" subtitle="How many units will the building have? This drives revenue projections and construction scope." breadcrumb="Units > Count">
      <Stepper
        label="Total units"
        value={state.unitConfig.unitCount}
        min={5}
        max={12}
        Icon={Building2}
        onChange={(v) => updateUnitConfig({ unitCount: v })}
        currency={currency}
      />
      <MentorTip>
        More units mean more rental income but also more construction cost, management complexity, and code requirements. Five to eight units is a common sweet spot for small apartment buildings.
      </MentorTip>
    </StepShell>
  );
}
