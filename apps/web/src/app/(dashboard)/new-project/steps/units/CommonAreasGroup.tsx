"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function CommonAreasGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "commonAreas");
  if (!q) return null;

  function toggleCommonArea(id: string) {
    const current = state.unitConfig.commonAreas || [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateUnitConfig({ commonAreas: next });
  }

  return (
    <StepShell title="Common Areas" subtitle="Select shared amenity spaces. These increase appeal but add to construction and maintenance costs." breadcrumb="Units > Common Areas">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            multiSelect
            selected={(state.unitConfig.commonAreas || []).includes(opt.id)}
            onClick={() => toggleCommonArea(opt.id)}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Common areas like a fitness room or community room can justify higher rents and reduce vacancy. But every common area needs maintenance, cleaning, and insurance coverage.
      </MentorTip>
    </StepShell>
  );
}
