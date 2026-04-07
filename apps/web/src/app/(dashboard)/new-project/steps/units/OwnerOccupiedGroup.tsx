"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function OwnerOccupiedGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "ownerOccupied");
  if (!q) return null;

  return (
    <StepShell title="Owner-Occupied Unit" subtitle="Will you live in one of the units? This affects financing options and tax benefits." breadcrumb="Units > Owner Occupied">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.ownerOccupied === opt.id}
            onClick={() => updateUnitConfig({ ownerOccupied: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Owner-occupying one unit opens up FHA and VA loan options with lower down payments. It also gives you direct oversight of the property and helps build community with tenants.
      </MentorTip>
    </StepShell>
  );
}
