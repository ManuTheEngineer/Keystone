"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function UnitSimilarityGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "unitSimilarity");
  if (!q) return null;

  return (
    <StepShell title="Unit Similarity" subtitle="Are both units the same size and layout, or different?" breadcrumb="Units > Similarity">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.unitConfig.unitSimilarity === opt.id}
            onClick={() => updateUnitConfig({ unitSimilarity: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Identical units simplify construction and reduce material waste. Different-sized units let you offer variety but add design and build complexity.
      </MentorTip>
    </StepShell>
  );
}
