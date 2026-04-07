"use client";

import { Building2 } from "lucide-react";
import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { Stepper } from "../../components/Stepper";
import { MentorTip } from "../../components/MentorTip";

export function FloorsGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  // Only applicable to apartments
  if (state.propertyType !== "APARTMENT") return null;

  return (
    <StepShell title="Number of Floors" subtitle="How many stories will the building have? This drives structural, elevator, and fire code requirements." breadcrumb="Structure > Floors">
      <Stepper
        label="Floors"
        value={state.structure.floors}
        min={2}
        max={4}
        Icon={Building2}
        onChange={(v) => updateStructure({ floors: v })}
        currency={currency}
      />
      <MentorTip>
        Each additional floor increases structural requirements and may trigger elevator and fire sprinkler code requirements. Three stories or more typically requires an elevator in the US.
      </MentorTip>
    </StepShell>
  );
}
