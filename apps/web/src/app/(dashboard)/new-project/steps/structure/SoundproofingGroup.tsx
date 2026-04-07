"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function SoundproofingGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const q = questions.find(q => q.key === "soundproofing");
  if (!q) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Soundproofing" subtitle="Sound insulation between units is critical for tenant satisfaction and retention." breadcrumb="Structure > Soundproofing">
      <OptionGrid label={q.label}>
        {q.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            selected={state.structure.soundproofing === opt.id}
            costDelta={useCostDelta("soundproofing", opt.id, state.structure.soundproofing, buildingSize, state.market as any)}
            currency={currency}
            onClick={() => updateStructure({ soundproofing: opt.id })}
          />
        ))}
      </OptionGrid>
      <MentorTip>
        Poor soundproofing is the number one complaint in multi-unit buildings. Enhanced insulation with resilient channels adds 5-8% to wall costs but dramatically reduces noise complaints and tenant turnover.
      </MentorTip>
    </StepShell>
  );
}
