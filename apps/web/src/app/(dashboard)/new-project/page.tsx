"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { createProject, type Market, type BuildPurpose, type PropertyType } from "@/lib/services/project-service";
import { Home, Building2, TrendingUp, Info } from "lucide-react";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrencyCompact,
  PHASE_ORDER,
} from "@keystone/market-data";
import type { Market as MarketType } from "@keystone/market-data";

interface WizardOption {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PURPOSE_OPTIONS: WizardOption[] = [
  {
    id: "occupy",
    title: "Build to occupy",
    description: "A home for you and your family to live in",
    icon: <Home size={18} />,
  },
  {
    id: "rent",
    title: "Build to rent",
    description: "Investment property generating rental income",
    icon: <Building2 size={18} />,
  },
  {
    id: "sell",
    title: "Build to sell",
    description: "Spec home built for resale profit",
    icon: <TrendingUp size={18} />,
  },
];

const MARKET_OPTIONS: WizardOption[] = [
  {
    id: "usa",
    title: "United States",
    description: "Wood-frame construction, institutional lending, IRC building codes",
  },
  {
    id: "togo",
    title: "Togo",
    description: "Reinforced concrete block, CFA zone, titre foncier system",
  },
  {
    id: "ghana",
    title: "Ghana",
    description: "Concrete block, cedi currency, Lands Commission registration",
  },
  {
    id: "benin",
    title: "Benin",
    description: "Concrete block, CFA zone, ANDF land registry",
  },
];

const PROPERTY_OPTIONS: WizardOption[] = [
  { id: "sfh", title: "Single-family home", description: "One dwelling unit on one lot" },
  { id: "duplex", title: "Duplex", description: "Two dwelling units in one structure" },
  { id: "triplex", title: "Triplex", description: "Three dwelling units" },
  { id: "fourplex", title: "Fourplex", description: "Four dwelling units" },
  { id: "apartment", title: "Apartment building", description: "Five or more units" },
];

const SIZE_OPTIONS: WizardOption[] = [
  { id: "small", title: "Under 1,500 sf / 140 m2", description: "Compact, efficient layout" },
  { id: "medium", title: "1,500 - 2,500 sf / 140 - 230 m2", description: "Mid-size family home" },
  { id: "large", title: "2,500 - 4,000 sf / 230 - 370 m2", description: "Larger family home" },
  { id: "xlarge", title: "Over 4,000 sf / 370 m2", description: "Estate or multi-family" },
];

const STEPS = [
  { title: "What are you building for?", subtitle: "This determines your financing options, tax treatment, and design priorities.", options: PURPOSE_OPTIONS },
  { title: "Where are you building?", subtitle: "Sets your cost benchmarks, regulations, templates, and construction method.", options: MARKET_OPTIONS },
  { title: "What type of property?", subtitle: "Defines your floor plan options and structural requirements.", options: PROPERTY_OPTIONS },
  { title: "What size are you planning?", subtitle: "Helps us estimate budget ranges and timelines for your market.", options: SIZE_OPTIONS },
];

const MARKET_MAP: Record<string, Market> = { usa: "USA", togo: "TOGO", ghana: "GHANA", benin: "BENIN" };
const PURPOSE_MAP: Record<string, BuildPurpose> = { occupy: "OCCUPY", rent: "RENT", sell: "SELL" };
const PROPERTY_MAP: Record<string, PropertyType> = { sfh: "SFH", duplex: "DUPLEX", triplex: "TRIPLEX", fourplex: "FOURPLEX", apartment: "APARTMENT" };

const SIZE_SQFT_USA: Record<string, number> = { small: 1200, medium: 2000, large: 3200, xlarge: 4500 };
const SIZE_SQM_TOGO: Record<string, number> = { small: 110, medium: 185, large: 300, xlarge: 420 };

export default function NewProjectPage() {
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setTopbar("New project", "Setup wizard", "info");
  }, [setTopbar]);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length;
  const canProceed = step < STEPS.length ? !!selections[step] : projectName.trim().length > 0;

  // Derive market data when a market is selected
  const selectedMarketKey = selections[1] ? (MARKET_MAP[selections[1]] as MarketType) : null;
  const marketData = useMemo(() => {
    if (!selectedMarketKey) return null;
    return getMarketData(selectedMarketKey);
  }, [selectedMarketKey]);

  // Compute total weeks from market phase durations (sum of mid values)
  const totalWeeksFromMarket = useMemo(() => {
    if (!marketData) return 0;
    return marketData.phases.reduce(
      (sum, p) => sum + Math.round((p.typicalDurationWeeks.min + p.typicalDurationWeeks.max) / 2),
      0
    );
  }, [marketData]);

  // Compute estimated budget range based on market + size selection
  const budgetEstimate = useMemo(() => {
    if (!selectedMarketKey || !selections[3]) return null;
    const benchmarks = getCostBenchmarks(selectedMarketKey);
    const totalMidPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
    const totalLowPerUnit = benchmarks.reduce((sum, b) => sum + b.lowRange, 0);
    const totalHighPerUnit = benchmarks.reduce((sum, b) => sum + b.highRange, 0);

    const isUSA = selectedMarketKey === "USA" || selectedMarketKey === "GHANA";
    const sizeMap = isUSA ? SIZE_SQFT_USA : SIZE_SQM_TOGO;
    const sizeValue = sizeMap[selections[3]] ?? sizeMap.medium;
    const unit = isUSA ? "sqft" : "sqm";

    return {
      low: Math.round(totalLowPerUnit * sizeValue),
      mid: Math.round(totalMidPerUnit * sizeValue),
      high: Math.round(totalHighPerUnit * sizeValue),
      sizeValue,
      unit,
    };
  }, [selectedMarketKey, selections]);

  function handleSelect(id: string) {
    setSelections((prev) => ({ ...prev, [step]: id }));
  }

  async function handleNext() {
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      if (!user || creating) return;
      setCreating(true);
      try {
        const market = MARKET_MAP[selections[1]] ?? "USA";
        const purpose = PURPOSE_MAP[selections[0]] ?? "OCCUPY";
        const propertyType = PROPERTY_MAP[selections[2]] ?? "SFH";
        const currency = marketData ? marketData.currency.code : "USD";

        const projectId = await createProject({
          userId: user.uid,
          name: projectName.trim(),
          market,
          purpose,
          propertyType,
          sizeRange: selections[3] ?? "medium",
          currentPhase: 0,
          completedPhases: 0,
          phaseName: "Phase 0: Define",
          progress: 0,
          status: "ACTIVE",
          totalBudget: 0,
          totalSpent: 0,
          currency,
          currentWeek: 0,
          totalWeeks: totalWeeksFromMarket,
          openItems: 0,
          subPhase: "Getting started",
          details: `${propertyType} / ${market}`,
        });
        router.push(`/project/${projectId}/overview`);
      } catch (err) {
        console.error("Failed to create project:", err);
        setCreating(false);
      }
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
    else router.push("/");
  }

  return (
    <div className="max-w-md mx-auto py-8 text-center">
      {/* Step dots */}
      <div className="flex gap-1.5 justify-center mb-6">
        {[...STEPS, { title: "Name" }].map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-earth" : i < step ? "bg-emerald-500" : "bg-border"
            }`}
          />
        ))}
      </div>

      {step < STEPS.length ? (
        <>
          <h3 className="text-xl font-semibold text-earth mb-1">{currentStep.title}</h3>
          <p className="text-[13px] text-muted mb-6">{currentStep.subtitle}</p>

          <div className="space-y-2 text-left">
            {currentStep.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`
                  w-full p-4 rounded-[var(--radius)] border text-left transition-all
                  ${
                    selections[step] === opt.id
                      ? "border-earth border-2 bg-surface-alt"
                      : "border-border bg-surface hover:border-border-dark hover:bg-surface-alt"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {opt.icon && (
                    <span className={`${selections[step] === opt.id ? "text-emerald-600" : "text-muted"}`}>
                      {opt.icon}
                    </span>
                  )}
                  <div>
                    <h5 className="text-[14px] font-semibold text-earth">{opt.title}</h5>
                    <p className="text-[11px] text-muted mt-0.5">{opt.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Market preview card — shown after step 2 (market) is selected, on step 2 */}
          {step === 1 && marketData && (
            <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-emerald-700 shrink-0" />
                <span className="text-[12px] font-semibold text-emerald-800">Market preview</span>
              </div>
              <div className="space-y-1 text-[11px] text-emerald-800">
                <div className="flex justify-between">
                  <span className="text-muted">Construction method</span>
                  <span className="font-medium">{marketData.phases[0]?.constructionMethod ?? "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Currency</span>
                  <span className="font-medium">{marketData.currency.code} ({marketData.currency.symbol})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estimated total timeline</span>
                  <span className="font-medium">
                    {marketData.phases.reduce((s, p) => s + p.typicalDurationWeeks.min, 0)}
                    {" - "}
                    {marketData.phases.reduce((s, p) => s + p.typicalDurationWeeks.max, 0)}
                    {" weeks"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Budget estimate card — shown on step 4 (size) after selection */}
          {step === 3 && budgetEstimate && marketData && (
            <div className="mt-4 p-4 rounded-[var(--radius)] border border-emerald-200 bg-emerald-50 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-emerald-700 shrink-0" />
                <span className="text-[12px] font-semibold text-emerald-800">Estimated budget range</span>
              </div>
              <div className="space-y-1 text-[11px] text-emerald-800">
                <div className="flex justify-between">
                  <span className="text-muted">Size</span>
                  <span className="font-medium font-data">
                    {budgetEstimate.sizeValue.toLocaleString()} {budgetEstimate.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Low estimate</span>
                  <span className="font-medium font-data">
                    {formatCurrencyCompact(budgetEstimate.low, marketData.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Mid estimate</span>
                  <span className="font-semibold font-data">
                    {formatCurrencyCompact(budgetEstimate.mid, marketData.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">High estimate</span>
                  <span className="font-medium font-data">
                    {formatCurrencyCompact(budgetEstimate.high, marketData.currency)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 mt-2">
                Based on market cost benchmarks. Actual costs vary by location, materials, and finishes.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-earth mb-1">Name your project</h3>
          <p className="text-[13px] text-muted mb-6">
            Give it a name you will recognize. You can change this later.
          </p>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Robinson residence"
            className="w-full px-4 py-3 text-[14px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <p className="text-[10px] text-muted mt-2 text-left">
            Tip: Use a descriptive name like the property address, family name, or location.
          </p>
        </>
      )}

      {/* Nav buttons */}
      <div className="flex justify-center gap-2 mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2.5 text-[13px] border border-border-dark rounded-[var(--radius)] bg-surface text-earth hover:bg-surface-alt transition-colors"
        >
          {step === 0 ? "Cancel" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-2.5 text-[13px] rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLastStep ? (creating ? "Creating..." : "Create project") : "Next"}
        </button>
      </div>
    </div>
  );
}
