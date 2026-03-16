"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTopbar } from "../layout";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Home,
  DollarSign,
  TrendingUp,
  Building2,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import {
  getMarketData,
  getCostBenchmarks,
  formatCurrency,
  formatCurrencyCompact,
} from "@keystone/market-data";
import type { Market, CurrencyConfig } from "@keystone/market-data";

// --- Types ---

interface DealInputs {
  // Step 1: Property details
  city: string;
  stateRegion: string;
  propertyType: string;
  lotSize: number;
  buildingSize: number;
  landPrice: number;
  market: Market | "";
  sizeUnit: "sqft" | "sqm";

  // Step 2: Cost estimation (derived + adjustable)
  constructionCost: number;
  softCostsPct: number;
  carryingMonths: number;
  loanRate: number;

  // Step 3: Revenue
  revenueStrategy: "sell" | "rent" | "occupy" | "";
  salePrice: number;
  monthlyRent: number;
  downPaymentPct: number;

  // Extra
  isFirstBuild: boolean;
  timelineMonths: number;
}

interface ScoreFactor {
  label: string;
  points: number;
  maxPoints: number;
  met: boolean;
}

interface DealScore {
  total: number;
  factors: ScoreFactor[];
  verdict: string;
  verdictColor: string;
  risks: string[];
}

const INITIAL_INPUTS: DealInputs = {
  city: "",
  stateRegion: "",
  propertyType: "SFH",
  lotSize: 0,
  buildingSize: 0,
  landPrice: 0,
  market: "",
  sizeUnit: "sqft",
  constructionCost: 0,
  softCostsPct: 15,
  carryingMonths: 0,
  loanRate: 8,
  revenueStrategy: "",
  salePrice: 0,
  monthlyRent: 0,
  downPaymentPct: 20,
  isFirstBuild: true,
  timelineMonths: 12,
};

const PROPERTY_TYPES = [
  { id: "SFH", label: "Single-family home" },
  { id: "DUPLEX", label: "Duplex" },
  { id: "TRIPLEX", label: "Triplex" },
  { id: "FOURPLEX", label: "Fourplex" },
  { id: "APARTMENT", label: "Apartment building" },
];

const MARKET_OPTIONS = [
  { id: "USA" as Market, label: "United States" },
  { id: "TOGO" as Market, label: "Togo" },
  { id: "GHANA" as Market, label: "Ghana" },
  { id: "BENIN" as Market, label: "Benin" },
];

const STEP_LABELS = [
  "Property details",
  "Cost estimation",
  "Revenue projection",
  "Deal scorecard",
];

// --- Helpers ---

function getCurrencyForMarket(market: Market | ""): CurrencyConfig {
  if (!market) return { code: "USD", symbol: "$", locale: "en-US", decimals: 2, groupSeparator: ",", position: "prefix" as const };
  const data = getMarketData(market as Market);
  return data.currency;
}

function calculateDealScore(inputs: DealInputs): DealScore {
  const {
    landPrice,
    constructionCost,
    softCostsPct,
    carryingMonths,
    loanRate,
    revenueStrategy,
    salePrice,
    monthlyRent,
    isFirstBuild,
    timelineMonths,
  } = inputs;

  const softCosts = constructionCost * (softCostsPct / 100);
  const totalConstruction = constructionCost + softCosts;
  const carryingCost = (landPrice + constructionCost) * (loanRate / 100) * (carryingMonths / 12);
  const totalCost = landPrice + totalConstruction + carryingCost;

  const factors: ScoreFactor[] = [];
  const risks: string[] = [];

  // Auto-estimate carrying months from timeline
  const effectiveCarrying = carryingMonths > 0 ? carryingMonths : timelineMonths;

  if (revenueStrategy === "sell") {
    const grossProfit = salePrice - totalCost;
    const profitMargin = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;

    if (profitMargin > 20) {
      factors.push({ label: "Profit margin above 20%", points: 25, maxPoints: 25, met: true });
    } else if (profitMargin > 15) {
      factors.push({ label: "Profit margin 15-20%", points: 15, maxPoints: 25, met: true });
    } else if (profitMargin > 10) {
      factors.push({ label: "Profit margin 10-15%", points: 5, maxPoints: 25, met: true });
    } else {
      factors.push({ label: "Profit margin below 10%", points: 0, maxPoints: 25, met: false });
      risks.push("Thin profit margin leaves no room for cost overruns or market dips.");
    }

    if (profitMargin < 5) {
      risks.push("Profit margin under 5% means even a small delay or overrun makes this deal a loss.");
    }
  }

  if (revenueStrategy === "rent") {
    const annualRent = monthlyRent * 12;
    const capRate = totalCost > 0 ? (annualRent / totalCost) * 100 : 0;
    const equity = totalCost * (inputs.downPaymentPct / 100);
    const loanAmount = totalCost - equity;
    const annualDebtService = loanAmount * (loanRate / 100);
    const netOperatingIncome = annualRent * 0.7; // 30% expense ratio estimate
    const cashFlow = netOperatingIncome - annualDebtService;
    const cashOnCash = equity > 0 ? (cashFlow / equity) * 100 : 0;

    if (capRate > 8) {
      factors.push({ label: "Cap rate above 8%", points: 20, maxPoints: 20, met: true });
    } else if (capRate > 5) {
      factors.push({ label: "Cap rate 5-8%", points: 10, maxPoints: 20, met: true });
    } else {
      factors.push({ label: "Cap rate below 5%", points: 0, maxPoints: 20, met: false });
      risks.push("Low cap rate means the property is overpriced relative to its income potential.");
    }

    if (cashOnCash > 12) {
      factors.push({ label: "Cash-on-cash return above 12%", points: 15, maxPoints: 15, met: true });
    } else if (cashOnCash > 6) {
      factors.push({ label: "Cash-on-cash return 6-12%", points: 8, maxPoints: 15, met: true });
    } else {
      factors.push({ label: "Cash-on-cash return below 6%", points: 0, maxPoints: 15, met: false });
      risks.push("Low cash-on-cash return means your capital could earn more elsewhere.");
    }
  }

  // Construction cost relative to market
  if (inputs.market && inputs.buildingSize > 0) {
    const benchmarks = getCostBenchmarks(inputs.market as Market);
    const marketMidPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
    const actualPerUnit = constructionCost / inputs.buildingSize;
    if (actualPerUnit < marketMidPerUnit) {
      factors.push({ label: "Construction cost below market mid", points: 10, maxPoints: 10, met: true });
    } else {
      factors.push({ label: "Construction cost at or above market mid", points: 0, maxPoints: 10, met: false });
      risks.push("Construction costs above market averages reduce your margin. Negotiate harder or find alternative materials.");
    }
  }

  // Timeline
  if (timelineMonths <= 12) {
    factors.push({ label: "Timeline under 12 months", points: 10, maxPoints: 10, met: true });
  } else {
    factors.push({ label: "Timeline over 12 months", points: 0, maxPoints: 10, met: false });
    risks.push("Longer timelines increase carrying costs and market risk.");
  }

  // Market demand (placeholder)
  factors.push({ label: "Market demand (estimated)", points: 10, maxPoints: 10, met: true });

  // Experience factor
  if (!isFirstBuild) {
    factors.push({ label: "Experienced builder", points: 10, maxPoints: 10, met: true });
  } else {
    factors.push({ label: "First-time builder (higher risk)", points: 0, maxPoints: 10, met: false });
    risks.push("First-time builders should add 15-20% contingency to all cost estimates.");
  }

  // Default risks
  if (landPrice > totalCost * 0.4) {
    risks.push("Land cost exceeds 40% of total project cost. This is high for most markets.");
  }
  if (effectiveCarrying > 18) {
    risks.push("Extended carrying period (18+ months) significantly increases interest expense.");
  }

  const total = factors.reduce((sum, f) => sum + f.points, 0);
  let verdict: string;
  let verdictColor: string;

  if (total >= 70) {
    verdict = "Strong deal";
    verdictColor = "text-success";
  } else if (total >= 50) {
    verdict = "Proceed with caution";
    verdictColor = "text-warning";
  } else {
    verdict = "Rework the numbers";
    verdictColor = "text-danger";
  }

  return { total, factors, verdict, verdictColor, risks };
}

// --- Component ---

export function DealAnalyzerClient() {
  const { setTopbar } = useTopbar();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<DealInputs>(INITIAL_INPUTS);

  useEffect(() => {
    setTopbar("Deal Analyzer", "Evaluate a deal", "info");
  }, [setTopbar]);

  // Auto-populate construction cost from market benchmarks
  useEffect(() => {
    if (inputs.market && inputs.buildingSize > 0 && inputs.constructionCost === 0) {
      const benchmarks = getCostBenchmarks(inputs.market as Market);
      const midPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
      const estimated = Math.round(midPerUnit * inputs.buildingSize);
      setInputs((prev) => ({
        ...prev,
        constructionCost: estimated,
        carryingMonths: prev.timelineMonths,
      }));
    }
  }, [inputs.market, inputs.buildingSize]);

  // Set size unit based on market
  useEffect(() => {
    if (inputs.market === "USA") {
      setInputs((prev) => ({ ...prev, sizeUnit: "sqft" }));
    } else if (inputs.market) {
      setInputs((prev) => ({ ...prev, sizeUnit: "sqm" }));
    }
  }, [inputs.market]);

  const currency = getCurrencyForMarket(inputs.market);

  const softCosts = inputs.constructionCost * (inputs.softCostsPct / 100);
  const totalConstruction = inputs.constructionCost + softCosts;
  const carryingCost = (inputs.landPrice + inputs.constructionCost) * (inputs.loanRate / 100) * (inputs.carryingMonths / 12);
  const totalProjectCost = inputs.landPrice + totalConstruction + carryingCost;

  // Revenue calculations
  const grossProfit = inputs.salePrice - totalProjectCost;
  const profitMargin = totalProjectCost > 0 ? (grossProfit / totalProjectCost) * 100 : 0;
  const roi = inputs.landPrice > 0 ? (grossProfit / inputs.landPrice) * 100 : 0;

  const annualRent = inputs.monthlyRent * 12;
  const capRate = totalProjectCost > 0 ? (annualRent / totalProjectCost) * 100 : 0;
  const equity = totalProjectCost * (inputs.downPaymentPct / 100);
  const loanAmount = totalProjectCost - equity;
  const annualDebtService = loanAmount * (inputs.loanRate / 100);
  const netOperatingIncome = annualRent * 0.7;
  const annualCashFlow = netOperatingIncome - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;
  const cashOnCash = equity > 0 ? (annualCashFlow / equity) * 100 : 0;
  const yearsToBreakeven = equity > 0 && annualCashFlow > 0 ? equity / annualCashFlow : Infinity;

  const dealScore = useMemo(() => calculateDealScore(inputs), [inputs]);

  function updateInput<K extends keyof DealInputs>(key: K, value: DealInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) {
      return !!(inputs.market && inputs.buildingSize > 0);
    }
    if (step === 1) {
      return inputs.constructionCost > 0;
    }
    if (step === 2) {
      return !!inputs.revenueStrategy;
    }
    return true;
  }

  function handleCreateProject() {
    // Navigate to new project with a query param hint
    router.push("/new-project");
  }

  // --- Input field helper ---
  function InputField({
    label,
    value,
    onChange,
    type = "number",
    placeholder,
    prefix,
    suffix,
    tooltip,
    tooltipExplanation,
    tooltipWhy,
  }: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    tooltip?: string;
    tooltipExplanation?: string;
    tooltipWhy?: string;
  }) {
    const input = (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted font-data">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2.5 text-[13px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted/40 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-data ${
            prefix ? "pl-8 pr-3" : suffix ? "pl-3 pr-12" : "px-3"
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted font-data">
            {suffix}
          </span>
        )}
      </div>
    );

    return (
      <div>
        <label className="block text-[12px] font-medium text-slate mb-1.5">
          {tooltip && tooltipExplanation ? (
            <LearnTooltip term={tooltip} explanation={tooltipExplanation} whyItMatters={tooltipWhy}>
              {label}
            </LearnTooltip>
          ) : (
            label
          )}
        </label>
        {input}
      </div>
    );
  }

  // --- Step renderers ---

  function renderStep0() {
    return (
      <div className="animate-fade-in space-y-6">
        <SectionLabel>Location</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="City"
            value={inputs.city}
            onChange={(v) => updateInput("city", v)}
            type="text"
            placeholder="e.g. Austin"
          />
          <InputField
            label="State / Region"
            value={inputs.stateRegion}
            onChange={(v) => updateInput("stateRegion", v)}
            type="text"
            placeholder="e.g. Texas"
          />
        </div>

        <SectionLabel>Market</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MARKET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateInput("market", opt.id)}
              className={`py-3 px-3 rounded-lg border text-[12px] font-medium transition-all ${
                inputs.market === opt.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30 text-earth"
                  : "border-border bg-surface text-muted hover:border-sand"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <SectionLabel>Property</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-slate mb-1.5">Property type</label>
            <select
              value={inputs.propertyType}
              onChange={(e) => updateInput("propertyType", e.target.value)}
              className="w-full py-2.5 px-3 text-[13px] border border-border rounded-lg bg-surface text-earth focus:outline-none focus:border-emerald-500"
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.label}</option>
              ))}
            </select>
          </div>
          <InputField
            label={`Building size (${inputs.sizeUnit})`}
            value={inputs.buildingSize}
            onChange={(v) => updateInput("buildingSize", parseFloat(v) || 0)}
            placeholder="e.g. 2000"
            suffix={inputs.sizeUnit}
            tooltip="Building Size"
            tooltipExplanation="The total finished area of the structure you plan to build. This is the primary driver of construction cost."
            tooltipWhy="Cost benchmarks are calculated per square foot (US) or per square meter (West Africa). Accurate sizing leads to accurate budgets."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label={`Lot size (${inputs.sizeUnit})`}
            value={inputs.lotSize}
            onChange={(v) => updateInput("lotSize", parseFloat(v) || 0)}
            placeholder="e.g. 7500"
            suffix={inputs.sizeUnit}
          />
          <InputField
            label="Land / purchase price"
            value={inputs.landPrice}
            onChange={(v) => updateInput("landPrice", parseFloat(v) || 0)}
            prefix={currency.symbol}
            tooltip="Land Cost"
            tooltipExplanation="The price to acquire the land or existing property. This is separate from construction costs."
            tooltipWhy="Land cost is the foundation of your deal analysis. Overpaying for land is the most common mistake and the hardest to recover from."
          />
        </div>
      </div>
    );
  }

  function renderStep1() {
    const benchmarkNote = inputs.market && inputs.buildingSize > 0
      ? (() => {
          const benchmarks = getCostBenchmarks(inputs.market as Market);
          const midPerUnit = benchmarks.reduce((sum, b) => sum + b.midRange, 0);
          return `Market benchmark: ${formatCurrencyCompact(midPerUnit, currency)}/${inputs.sizeUnit}`;
        })()
      : null;

    return (
      <div className="animate-fade-in space-y-6">
        <SectionLabel>Construction costs</SectionLabel>
        {benchmarkNote && (
          <div className="text-[11px] text-muted bg-surface-alt/50 px-3 py-2 rounded-lg border border-border">
            {benchmarkNote}. Adjust based on your actual bids and material choices.
          </div>
        )}
        <InputField
          label="Estimated construction cost"
          value={inputs.constructionCost}
          onChange={(v) => updateInput("constructionCost", parseFloat(v) || 0)}
          prefix={currency.symbol}
          tooltip="Construction Hard Costs"
          tooltipExplanation="The direct cost of physical construction: materials, labor, equipment, and subcontractor payments."
          tooltipWhy="Hard costs are typically 65-75% of your total project cost. Getting accurate bids here determines whether your deal math works."
        />

        <SectionLabel>Soft costs and carrying</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Soft costs (% of construction)"
            value={inputs.softCostsPct}
            onChange={(v) => updateInput("softCostsPct", parseFloat(v) || 0)}
            suffix="%"
            tooltip="Soft Costs"
            tooltipExplanation="Architecture, engineering, permits, insurance, legal fees, and other non-construction expenses. Typically 10-20% of hard costs."
            tooltipWhy="First-time builders consistently underestimate soft costs. Permit fees, impact fees, and professional services add up quickly."
          />
          <InputField
            label="Project timeline"
            value={inputs.timelineMonths}
            onChange={(v) => {
              const months = parseFloat(v) || 0;
              updateInput("timelineMonths", months);
              updateInput("carryingMonths", months);
            }}
            suffix="months"
            tooltip="Construction Timeline"
            tooltipExplanation="Total time from project start to completion. Carrying costs accrue for this entire period."
            tooltipWhy="Every month of construction costs you loan interest, insurance premiums, and property taxes. Shorter timelines mean lower carrying costs."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Loan interest rate"
            value={inputs.loanRate}
            onChange={(v) => updateInput("loanRate", parseFloat(v) || 0)}
            suffix="% / year"
            tooltip="Construction Loan Rate"
            tooltipExplanation="The annual interest rate on your construction financing. Construction loans typically carry higher rates than permanent mortgages."
            tooltipWhy="At 8% on a $300,000 loan, you pay $2,000/month in interest alone. This cost compounds with every month of delay."
          />
        </div>

        {/* Cost summary */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            value={formatCurrencyCompact(inputs.landPrice, currency)}
            label="Land cost"
          />
          <StatCard
            value={formatCurrencyCompact(totalConstruction, currency)}
            label="Construction + soft"
          />
          <StatCard
            value={formatCurrencyCompact(carryingCost, currency)}
            label="Carrying costs"
          />
          <StatCard
            value={formatCurrencyCompact(totalProjectCost, currency)}
            label="Total project cost"
            valueClassName="text-earth font-bold"
          />
        </div>

        {/* Cost breakdown donut (simple bar representation) */}
        {totalProjectCost > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted uppercase tracking-[0.1em]">Cost breakdown</p>
            {[
              { label: "Land", value: inputs.landPrice, color: "bg-clay" },
              { label: "Construction", value: inputs.constructionCost, color: "bg-earth" },
              { label: "Soft costs", value: softCosts, color: "bg-sand" },
              { label: "Carrying", value: carryingCost, color: "bg-warning" },
            ].map((item) => {
              const pct = totalProjectCost > 0 ? (item.value / totalProjectCost) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-[11px] text-muted w-24 shrink-0">{item.label}</span>
                  <div className="flex-1 h-3 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-data text-slate w-12 text-right">{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="animate-fade-in space-y-6">
        <SectionLabel>Revenue strategy</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "sell" as const, label: "Build to sell", icon: <TrendingUp size={18} />, desc: "Sell at completion for profit" },
            { id: "rent" as const, label: "Build to rent", icon: <Building2 size={18} />, desc: "Hold and generate rental income" },
            { id: "occupy" as const, label: "Build to occupy", icon: <Home size={18} />, desc: "Live in it yourself" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => updateInput("revenueStrategy", opt.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                inputs.revenueStrategy === opt.id
                  ? "border-emerald-500 border-2 bg-emerald-50/30"
                  : "border-border bg-surface hover:border-sand"
              }`}
            >
              <span className={`${inputs.revenueStrategy === opt.id ? "text-emerald-600" : "text-muted"}`}>
                {opt.icon}
              </span>
              <p className="text-[13px] font-semibold text-earth mt-2">{opt.label}</p>
              <p className="text-[11px] text-muted mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>

        {inputs.revenueStrategy === "sell" && (
          <div className="animate-fade-in space-y-4">
            <SectionLabel>Sale projection</SectionLabel>
            <InputField
              label="Target sale price"
              value={inputs.salePrice}
              onChange={(v) => updateInput("salePrice", parseFloat(v) || 0)}
              prefix={currency.symbol}
              tooltip="After Repair Value (ARV)"
              tooltipExplanation="The expected market value of the completed property. Research comparable recent sales in the area to estimate this."
              tooltipWhy="Your sale price projection determines whether this deal is profitable. Be conservative. Overestimating sale price is the fastest way to lose money in development."
            />
            {inputs.salePrice > 0 && totalProjectCost > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                <StatCard
                  value={formatCurrencyCompact(grossProfit, currency)}
                  label="Gross profit"
                  valueClassName={grossProfit >= 0 ? "text-success" : "text-danger"}
                />
                <StatCard
                  value={`${profitMargin.toFixed(1)}%`}
                  label="Profit margin"
                  valueClassName={profitMargin >= 15 ? "text-success" : profitMargin >= 10 ? "text-warning" : "text-danger"}
                />
                <StatCard
                  value={`${roi.toFixed(0)}%`}
                  label="Return on investment"
                />
              </div>
            )}
          </div>
        )}

        {inputs.revenueStrategy === "rent" && (
          <div className="animate-fade-in space-y-4">
            <SectionLabel>Rental projection</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Target monthly rent"
                value={inputs.monthlyRent}
                onChange={(v) => updateInput("monthlyRent", parseFloat(v) || 0)}
                prefix={currency.symbol}
                suffix="/mo"
                tooltip="Gross Monthly Rent"
                tooltipExplanation="The total monthly rent you expect to collect. Research comparable rentals in the area."
                tooltipWhy="Rental income is the basis of your return calculation. Overestimating rent is common and leads to negative cash flow."
              />
              <InputField
                label="Down payment"
                value={inputs.downPaymentPct}
                onChange={(v) => updateInput("downPaymentPct", parseFloat(v) || 0)}
                suffix="%"
                tooltip="Down Payment Percentage"
                tooltipExplanation="The percentage of total project cost you are putting in as cash equity. The rest comes from financing."
                tooltipWhy="Your down payment determines your leverage. More leverage amplifies both returns and risk."
              />
            </div>
            {inputs.monthlyRent > 0 && totalProjectCost > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <StatCard
                  value={`${capRate.toFixed(1)}%`}
                  label="Cap rate"
                  valueClassName={capRate >= 8 ? "text-success" : capRate >= 5 ? "text-warning" : "text-danger"}
                />
                <StatCard
                  value={`${cashOnCash.toFixed(1)}%`}
                  label="Cash-on-cash"
                  valueClassName={cashOnCash >= 12 ? "text-success" : cashOnCash >= 6 ? "text-warning" : "text-danger"}
                />
                <StatCard
                  value={formatCurrencyCompact(monthlyCashFlow, currency)}
                  label="Monthly cash flow"
                  valueClassName={monthlyCashFlow >= 0 ? "text-success" : "text-danger"}
                />
                <StatCard
                  value={yearsToBreakeven < 100 ? `${yearsToBreakeven.toFixed(1)} yr` : "N/A"}
                  label="Years to breakeven"
                />
              </div>
            )}
          </div>
        )}

        {inputs.revenueStrategy === "occupy" && (
          <div className="animate-fade-in space-y-4">
            <SectionLabel>Cost of ownership analysis</SectionLabel>
            <Card>
              <div className="space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">Total cost to build</span>
                  <span className="font-data font-medium text-earth">{formatCurrency(totalProjectCost, currency)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">Estimated purchase price for comparable</span>
                  <span className="font-data font-medium text-earth">{formatCurrency(totalProjectCost * 1.2, currency)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-[12px]">
                  <span className="text-muted">Estimated savings vs buying existing</span>
                  <span className="font-data font-semibold text-success">{formatCurrency(totalProjectCost * 0.2, currency)}</span>
                </div>
                <p className="text-[10px] text-muted">
                  Building your own home typically saves 15-25% compared to buying a comparable existing home, primarily by avoiding the general contractor markup and real estate agent commissions.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Experience toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => updateInput("isFirstBuild", !inputs.isFirstBuild)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              inputs.isFirstBuild ? "bg-border" : "bg-emerald-500"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                inputs.isFirstBuild ? "left-0.5" : "left-[22px]"
              }`}
            />
          </button>
          <span className="text-[12px] text-slate">
            {inputs.isFirstBuild ? "This is my first build" : "I have built before"}
          </span>
        </div>
      </div>
    );
  }

  function renderStep3() {
    const scoreColor = dealScore.total >= 70 ? "text-success" : dealScore.total >= 50 ? "text-warning" : "text-danger";
    const scoreBg = dealScore.total >= 70 ? "bg-success/10" : dealScore.total >= 50 ? "bg-warning/10" : "bg-danger/10";
    const scoreBorder = dealScore.total >= 70 ? "border-success/30" : dealScore.total >= 50 ? "border-warning/30" : "border-danger/30";

    return (
      <div className="animate-fade-in space-y-6">
        {/* Score display */}
        <div className={`text-center py-8 rounded-xl border ${scoreBg} ${scoreBorder}`}>
          <div className={`font-data text-6xl font-bold ${scoreColor}`}>
            {dealScore.total}
          </div>
          <div className="text-[11px] text-muted uppercase tracking-[0.15em] mt-1">out of 100</div>
          <div className={`text-[16px] font-semibold mt-3 ${dealScore.verdictColor}`}>
            {dealScore.verdict}
          </div>
        </div>

        {/* Scoring breakdown */}
        <SectionLabel>Scoring breakdown</SectionLabel>
        <Card>
          <div className="space-y-3">
            {dealScore.factors.map((factor, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${factor.met ? "bg-success/15 text-success" : "bg-border text-muted"}`}>
                    {factor.met ? <Check size={11} /> : <span className="text-[9px] font-data">0</span>}
                  </div>
                  <span className="text-[12px] text-slate">{factor.label}</span>
                </div>
                <span className="text-[12px] font-data font-medium text-earth">
                  {factor.points}/{factor.maxPoints}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk factors */}
        {dealScore.risks.length > 0 && (
          <>
            <SectionLabel>Risk factors</SectionLabel>
            <Card>
              <div className="space-y-2.5">
                {dealScore.risks.map((risk, i) => (
                  <div key={i} className="flex gap-2.5">
                    <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Summary stats */}
        <SectionLabel>Deal summary</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard value={formatCurrencyCompact(inputs.landPrice, currency)} label="Land cost" />
          <StatCard value={formatCurrencyCompact(totalProjectCost, currency)} label="Total project cost" />
          {inputs.revenueStrategy === "sell" && (
            <>
              <StatCard value={formatCurrencyCompact(inputs.salePrice, currency)} label="Target sale price" />
              <StatCard value={`${profitMargin.toFixed(1)}%`} label="Profit margin" valueClassName={profitMargin >= 15 ? "text-success" : "text-danger"} />
            </>
          )}
          {inputs.revenueStrategy === "rent" && (
            <>
              <StatCard value={formatCurrencyCompact(inputs.monthlyRent * 12, currency)} label="Annual rent" />
              <StatCard value={`${capRate.toFixed(1)}%`} label="Cap rate" valueClassName={capRate >= 8 ? "text-success" : "text-danger"} />
            </>
          )}
          {inputs.revenueStrategy === "occupy" && (
            <>
              <StatCard value={formatCurrencyCompact(totalProjectCost * 1.2, currency)} label="Comparable value" />
              <StatCard value={formatCurrencyCompact(totalProjectCost * 0.2, currency)} label="Estimated savings" valueClassName="text-success" />
            </>
          )}
        </div>

        {/* Create project button */}
        <div className="text-center pt-4">
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-earth text-warm text-[13px] font-medium hover:bg-earth-light transition-colors"
          >
            <PlusCircle size={16} />
            Create project from this deal
          </button>
          <p className="text-[10px] text-muted mt-2">
            Pre-fills the project wizard with your deal data.
          </p>
        </div>
      </div>
    );
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      {/* Step indicator */}
      <div className="flex gap-2 justify-center mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-data font-medium transition-all ${
                  i === step
                    ? "bg-earth text-warm"
                    : i < step
                    ? "bg-emerald-500 text-white"
                    : "bg-surface-alt text-muted"
                }`}
              >
                {i < step ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className="text-[9px] text-muted mt-1 hidden sm:block">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`w-8 h-[2px] mb-4 sm:mb-0 ${i < step ? "bg-emerald-500" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div key={step}>
        {stepRenderers[step]()}
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-2 mt-8">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] border border-border-dark rounded-lg bg-surface text-earth hover:bg-surface-alt transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}
        {step < 3 && (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-5 py-2.5 text-[13px] rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
