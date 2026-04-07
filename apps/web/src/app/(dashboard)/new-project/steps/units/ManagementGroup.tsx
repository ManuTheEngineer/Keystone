"use client";

import { useWizardStore } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { getUnitConfigQuestions } from "@/lib/config/property-details-config";

export function ManagementGroup() {
  const state = useWizardStore(s => s.state);
  const updateUnitConfig = useWizardStore(s => s.updateUnitConfig);

  const questions = getUnitConfigQuestions(state.propertyType as any, state.market as any);
  // Try "management" first (apartment), then "commonMaintenance" (triplex/fourplex)
  const q = questions.find(q => q.key === "management") || questions.find(q => q.key === "commonMaintenance");
  if (!q) return null;

  const field = q.key === "management" ? "management" : "commonMaintenance";

  return (
    <StepShell title="Management" subtitle="Who manages the property day-to-day? This affects your time commitment and operating costs." breadcrumb="Units > Management">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={(state.unitConfig as any)[field] === opt.id}
            onClick={() => updateUnitConfig({ [field]: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Property management costs 8-10% of gross rent but frees your time. For diaspora investors, professional management is essential for remote oversight.
      </MentorTip>
    </StepShell>
  );
}
