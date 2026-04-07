"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function UtilitiesGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "utilities");
  if (!q) return null;

  return (
    <StepShell title="Utilities" subtitle="How utilities are metered determines who pays for water, electric, and gas." breadcrumb="Units > Utilities">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.utilities === opt.id}
            onClick={() => updateUnitConfig({ utilities: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Separate utility meters cost more upfront but save you money every month. With owner-pays-all, you absorb usage spikes. With separate meters, tenants pay their own consumption.
      </MentorTip>
    </StepShell>
  );
}
