"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function RooftopGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);
  const qFeatures = questions.find(q => q.key === "rooftopFeatures");
  const qAccess = questions.find(q => q.key === "rooftopAccess");
  if (!qFeatures) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  function toggleRooftopFeature(id: string) {
    const current = state.structure.rooftopFeatures || [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateStructure({ rooftopFeatures: next });
  }

  return (
    <StepShell title="Rooftop Features" subtitle="Add features to your rooftop. Solar panels reduce energy costs, while decks add usable outdoor space." breadcrumb="Structure > Rooftop">
      <OptionGrid label={qFeatures.label}>
        {qFeatures.options.map(opt => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            subtitle={opt.subtitle}
            Icon={opt.Icon}
            multiSelect
            selected={(state.structure.rooftopFeatures || []).includes(opt.id)}
            costDelta={useCostDelta("rooftopFeatures", opt.id, "", buildingSize, state.market as any)}
            currency={currency}
            onClick={() => toggleRooftopFeature(opt.id)}
          />
        ))}
      </OptionGrid>

      {qAccess && (
        <OptionGrid label={qAccess.label}>
          {qAccess.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.rooftopAccess === opt.id}
              onClick={() => updateStructure({ rooftopAccess: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        Solar panels can offset 50-100% of energy costs and may qualify for tax credits. In West Africa, rooftop water tanks are essential for water pressure and backup supply.
      </MentorTip>
    </StepShell>
  );
}
