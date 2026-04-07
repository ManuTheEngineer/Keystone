"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function CommonOutdoorGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "commonOutdoor");
  if (!q) return null;

  function toggleCommonOutdoor(id: string) {
    const current = state.site.commonOutdoor || [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateSite({ commonOutdoor: next });
  }

  return (
    <StepShell title="Shared Outdoor Spaces" subtitle="Select outdoor amenities shared by all residents." breadcrumb="Units > Shared Outdoor">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            multiSelect
            selected={(state.site.commonOutdoor || []).includes(opt.id)}
            onClick={() => toggleCommonOutdoor(opt.id)}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Shared outdoor spaces like courtyards and rooftop decks create community and justify higher rents. A pool is a major draw but adds significant insurance and maintenance costs.
      </MentorTip>
    </StepShell>
  );
}
