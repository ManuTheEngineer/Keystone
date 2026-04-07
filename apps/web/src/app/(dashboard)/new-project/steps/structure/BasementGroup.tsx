"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getStructureQuestions } from "@/lib/config/property-details-config";

export function BasementGroup() {
  const state = useWizardStore(s => s.state);
  const updateStructure = useWizardStore(s => s.updateStructure);
  const currency = useCurrency();

  const questions = getStructureQuestions(state.propertyType as any, state.market as any);

  const qFinish = questions.find(q => q.key === "basementFinish");
  const qUse = questions.find(q => q.key === "basementUse");
  const qBathroom = questions.find(q => q.key === "basementBathroom");
  const qSize = questions.find(q => q.key === "basementSize");
  const qWaterproofing = questions.find(q => q.key === "basementWaterproofing");
  const qEgress = questions.find(q => q.key === "basementEgress");

  // Only show if foundation supports a basement
  const hasBasement = ["full-basement", "walkout-basement"].includes(state.structure.foundation);
  if (!hasBasement) return null;
  if (!qFinish && !qUse) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  function toggleBasementUse(id: string) {
    const current = state.structure.basementUse || [];
    const next = current.includes(id)
      ? current.filter(v => v !== id)
      : [...current, id];
    updateStructure({ basementUse: next });
  }

  return (
    <StepShell title="Basement Details" subtitle="Configure your below-grade space. Finishing level and intended use drive cost and code requirements." breadcrumb="Structure > Basement">
      {qFinish && (
        <OptionGrid label={qFinish.label}>
          {qFinish.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.basementFinish === opt.id}
              costDelta={useCostDelta("basementFinish", opt.id, state.structure.basementFinish, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateStructure({ basementFinish: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qUse && (
        <OptionGrid label={qUse.label}>
          {qUse.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              multiSelect
              selected={(state.structure.basementUse || []).includes(opt.id)}
              onClick={() => toggleBasementUse(opt.id)}
            />
          ))}
        </OptionGrid>
      )}

      {qBathroom && (
        <OptionGrid label={qBathroom.label}>
          {qBathroom.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.basementBathroom === opt.id}
              onClick={() => updateStructure({ basementBathroom: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qSize && (
        <OptionGrid label={qSize.label}>
          {qSize.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.basementSize === opt.id}
              onClick={() => updateStructure({ basementSize: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qWaterproofing && (
        <OptionGrid label={qWaterproofing.label}>
          {qWaterproofing.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.basementWaterproofing === opt.id}
              costDelta={useCostDelta("basementWaterproofing", opt.id, state.structure.basementWaterproofing, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateStructure({ basementWaterproofing: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qEgress && (
        <OptionGrid label={qEgress.label}>
          {qEgress.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.structure.basementEgress === opt.id}
              onClick={() => updateStructure({ basementEgress: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        A finished basement can add 30-50% more livable space to your home at a lower cost per square foot than building above grade. Waterproofing is critical -- a wet basement destroys finishes and creates mold risk.
      </MentorTip>
    </StepShell>
  );
}
