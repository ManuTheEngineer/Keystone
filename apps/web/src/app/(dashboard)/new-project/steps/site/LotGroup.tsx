"use client";

import { useWizardStore, useCurrency } from "../../store";
import { StepShell } from "../../components/StepShell";
import { OptionCard } from "../../components/OptionCard";
import { OptionGrid } from "../../components/OptionGrid";
import { MentorTip } from "../../components/MentorTip";
import { useCostDelta } from "../../hooks/useCostDelta";
import { getSiteQuestions } from "@/lib/config/property-details-config";

export function LotGroup() {
  const state = useWizardStore(s => s.state);
  const updateSite = useWizardStore(s => s.updateSite);
  const currency = useCurrency();

  const questions = getSiteQuestions(state.propertyType as any, state.market as any);
  const qSize = questions.find(q => q.key === "lotSize");
  const qShape = questions.find(q => q.key === "lotShape");
  if (!qSize && !qShape) return null;

  const buildingSize = state.customSize > 0 ? state.customSize : 1600;

  return (
    <StepShell title="Lot" subtitle="Lot size and shape affect site work costs, building placement, and outdoor space." breadcrumb="Site > Lot">
      {qSize && (
        <OptionGrid label={qSize.label}>
          {qSize.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.site.lotSize === opt.id}
              costDelta={useCostDelta("lotSize", opt.id, state.site.lotSize, buildingSize, state.market as any)}
              currency={currency}
              onClick={() => updateSite({ lotSize: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      {qShape && (
        <OptionGrid label={qShape.label} columns={3}>
          {qShape.options.map(opt => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              subtitle={opt.subtitle}
              Icon={opt.Icon}
              selected={state.site.lotShape === opt.id}
              onClick={() => updateSite({ lotShape: opt.id })}
            />
          ))}
        </OptionGrid>
      )}

      <MentorTip>
        Lot shape matters more than you think. An irregular lot can add 10-20% to site work costs for custom grading and foundation layout.
      </MentorTip>
    </StepShell>
  );
}
