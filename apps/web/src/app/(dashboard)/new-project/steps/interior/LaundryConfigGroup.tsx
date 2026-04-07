"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getInteriorQuestions } from "@/lib/config/property-details-config";

export function LaundryConfigGroup() {
  const state = useWizardStore(s => s.state);
  const updateInterior = useWizardStore(s => s.updateInterior);

  const questions = getInteriorQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "laundryConfig");
  if (!q) return null;

  return (
    <StepShell title="Laundry Configuration" subtitle="How laundry is set up across the building affects plumbing, space planning, and tenant appeal." breadcrumb="Interior > Laundry">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.interior.laundryConfig === opt.id}
            onClick={() => updateInterior({ laundryConfig: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        In-unit laundry is the top amenity tenants look for. It costs more in plumbing and space but commands higher rents and lower vacancy rates.
      </MentorTip>
    </StepShell>
  );
}
