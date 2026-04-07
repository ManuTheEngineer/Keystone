"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function UnitMixGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "unitMix");
  if (!q) return null;

  return (
    <StepShell title="Unit Mix" subtitle="The bedroom and bathroom configuration for each unit drives rental rates and construction cost." breadcrumb="Units > Mix">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.unitMix === opt.id}
            onClick={() => updateUnitConfig({ unitMix: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Unit mix determines your rental income profile. Studios rent fast but have higher turnover. Two-bedrooms attract longer-term tenants.
      </MentorTip>
    </StepShell>
  );
}
