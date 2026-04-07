"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function DuplexLayoutGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "buildingLayout");
  if (!q) return null;

  // Only show for DUPLEX — triplex/fourplex use BuildingLayoutGroup
  if (state.propertyType !== "DUPLEX") return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Duplex Layout" subtitle="How your two units are arranged determines shared walls, plumbing runs, and noise transfer." breadcrumb="Structure > Layout">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.buildingLayout === opt.id}
            costDelta={useCostDelta("buildingLayout", opt.id, state.structure.buildingLayout, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ buildingLayout: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Side-by-side duplexes share a center wall and each unit has its own entrance. Stacked duplexes put one unit above the other, saving lot width but adding floor/ceiling noise concerns.
      </MentorTip>
    </StepShell>
  );
}
