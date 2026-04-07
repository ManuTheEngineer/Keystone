"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function MixRatioGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "mixRatio");
  if (!q) return null;

  return (
    <StepShell title="Mix Ratio" subtitle="When mixing unit sizes, the ratio of smaller to larger units affects your revenue profile." breadcrumb="Units > Mix Ratio">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.mixRatio === opt.id}
            onClick={() => updateUnitConfig({ mixRatio: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        More smaller units maximize unit count and total rent collected, but larger units often command better per-unit rent and attract longer-term tenants.
      </MentorTip>
    </StepShell>
  );
}
