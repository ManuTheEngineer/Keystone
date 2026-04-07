"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function TrashGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "trash");
  if (!q) return null;

  return (
    <StepShell title="Trash" subtitle="Trash collection setup affects site layout, maintenance, and tenant convenience." breadcrumb="Units > Trash">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.site.trash === opt.id}
            onClick={() => updateSite({ trash: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        A shared trash enclosure keeps the property tidy and is required by most municipalities for multi-unit buildings. Trash chutes add convenience for upper floors but require regular cleaning.
      </MentorTip>
    </StepShell>
  );
}
