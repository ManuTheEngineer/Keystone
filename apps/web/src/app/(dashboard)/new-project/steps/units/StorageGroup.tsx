"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function StorageGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "storage");
  if (!q) return null;

  return (
    <StepShell title="Storage" subtitle="Tenant storage options affect building layout and tenant satisfaction." breadcrumb="Units > Storage">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.storage === opt.id}
            onClick={() => updateUnitConfig({ storage: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Storage is an underrated amenity. Individual storage cages or lockers are a selling point for tenants and can even be offered as a premium add-on for additional monthly revenue.
      </MentorTip>
    </StepShell>
  );
}
