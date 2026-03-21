"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToProject,
  subscribeToBudgetItems,
  subscribeToPhasedFunding,
  savePhasedFunding,
  type ProjectData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import {
  calculateLoanQualification,
  calculateRentalYield,
  generateDrawSchedule,
  convertCurrency,
  calculateContingency,
  formatPercent,
  formatMonths,
  type LoanQualificationInput,
  type RentalYieldInput,
  type DrawScheduleInput,
  type CurrencyConversionInput,
  type ContingencyInput,
} from "@keystone/core";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getMarketData,
  formatCurrency,
  formatCurrencyCompact,
  PHASE_ORDER,
  getClosestLocation,
} from "@keystone/market-data";
import type { Market, LocationData } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function FormulaToggle({ formula }: { formula: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-[10px] text-info hover:underline cursor-pointer"
      >
        {open ? "Hide formula" : "Show formula"}
      </button>
      {open && (
        <pre className="mt-1.5 p-2.5 bg-surface-alt border border-border rounded-[var(--radius)] text-[10px] font-data text-muted leading-relaxed whitespace-pre-wrap">
          {formula}
        </pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FinancialsClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [items, setItems] = useState<BudgetItemData[]>([]);

  // Loan calculator state (USA)
  const [loanIncome, setLoanIncome] = useState("85000");
  const [loanDebts, setLoanDebts] = useState("450");
  const [loanDown, setLoanDown] = useState("20");
  const [loanRate, setLoanRate] = useState("7.25");
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [loanTerm, setLoanTerm] = useState("30");
  const [loanResult, setLoanResult] = useState<ReturnType<typeof calculateLoanQualification> | null>(null);

  // Rental yield state (RENT purpose)
  const [rentMonthly, setRentMonthly] = useState("2000");
  const [rentVacancy, setRentVacancy] = useState("8");
  const [rentExpenses, setRentExpenses] = useState("2");
  const [rentalResult, setRentalResult] = useState<ReturnType<typeof calculateRentalYield> | null>(null);

  // Currency converter state (West Africa)
  const [convertAmount, setConvertAmount] = useState("1000");
  const [convertResult, setConvertResult] = useState<ReturnType<typeof convertCurrency> | null>(null);
  const [liveExchangeRate, setLiveExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  // Phased funding state (West Africa)
  const [phaseFunding, setPhaseFunding] = useState<Record<string, number>>({});
  const [localPhaseFunding, setLocalPhaseFunding] = useState<Record<string, number> | null>(null);
  const [phaseFundingDirty, setPhaseFundingDirty] = useState(false);
  const [savingFunding, setSavingFunding] = useState(false);

  // Tab switcher state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeToProject(user.uid, projectId, setProject);
    const unsub2 = subscribeToBudgetItems(user.uid, projectId, setItems);
    const unsub3 = subscribeToPhasedFunding(user.uid, projectId, setPhaseFunding);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      const marketData = getMarketData(project.market as Market);
      setTopbar(
        project.name,
        `${t("project.financials")} — ${formatCurrencyCompact(project.totalSpent, marketData.currency)} / ${formatCurrencyCompact(project.totalBudget, marketData.currency)}`,
        "success"
      );
    }
  }, [project, setTopbar]);

  // Fetch live 30-year mortgage rate from FRED
  useEffect(() => {
    if (project?.market !== "USA") return;
    fetch("/api/location-data/mortgage-rate/")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.rate) {
          setLiveRate(data.rate);
          setLoanRate(String(data.rate));
        }
      })
      .catch(() => {});
  }, [project?.market]);

  // Fetch live exchange rate for West African markets
  useEffect(() => {
    if (!project || project.market === "USA") return;
    setRateLoading(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.rates) {
          const targetCurrency = project.market === "GHANA" ? "GHS" : "XOF";
          const rate = data.rates[targetCurrency];
          if (rate) setLiveExchangeRate(rate);
        }
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, [project?.market]);

  // ---------------------------------------------------------------------------
  // Guard
  // ---------------------------------------------------------------------------

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-sand border-t-clay animate-spin mb-3" />
      <p className="text-[12px] text-muted">Loading financials...</p>
    </div>
  );

  const market = project.market as Market;
  const marketData = getMarketData(market);
  const locationData: LocationData | null = project.city ? getClosestLocation(project.city, market) : null;
  const fmt = (amount: number) => formatCurrency(amount, marketData.currency);
  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, marketData.currency);

  const isUSA = market === "USA";
  const isWA = market === "TOGO" || market === "GHANA" || market === "BENIN";
  const isRent = project.purpose === "RENT";

  const remaining = project.totalBudget - project.totalSpent;

  // ---------------------------------------------------------------------------
  // Contingency calculation
  // ---------------------------------------------------------------------------

  const contingencyInput: ContingencyInput = {
    baseBudget: project.totalBudget,
    complexity: "moderate",
    market: market,
    phaseIndex: project.currentPhase ?? 0,
    firstTimeBuild: true,
  };
  const contingencyResult = calculateContingency(contingencyInput);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleLoanCalc() {
    const input: LoanQualificationInput = {
      annualIncome: Number(loanIncome) || 0,
      monthlyDebts: Number(loanDebts) || 0,
      downPaymentPct: Number(loanDown) || 20,
      interestRate: Number(loanRate) || 7,
      loanTermYears: Number(loanTerm) || 30,
      propertyTaxRate: locationData?.propertyTaxRate ?? 1.2,
      insuranceAnnual: 1800,
    };
    setLoanResult(calculateLoanQualification(input));
  }

  function handleRentalCalc() {
    if (!project || project.totalBudget <= 0) return;
    const input: RentalYieldInput = {
      totalCost: project.totalBudget,
      monthlyRent: Number(rentMonthly) || 0,
      vacancyRatePct: Number(rentVacancy) || 8,
      annualExpensesPct: Number(rentExpenses) || 2,
    };
    setRentalResult(calculateRentalYield(input));
  }

  function handleCurrencyConvert() {
    const fallbackRate = market === "GHANA" ? 10.96 : 567.76;
    const rate = liveExchangeRate ?? fallbackRate;
    const toCurr = market === "GHANA" ? "GHS" : "XOF";
    const input: CurrencyConversionInput = {
      amount: Number(convertAmount) || 0,
      fromCurrency: "USD",
      toCurrency: toCurr,
      exchangeRate: rate,
    };
    setConvertResult(convertCurrency(input));
  }

  // Draw schedule (USA only, when budget > 0)
  function getDrawSchedule() {
    if (!isUSA || !project || project.totalBudget <= 0) return null;
    const phases = marketData.phases;
    const milestones: { name: string; paymentPct: number; phase: string }[] = [];
    for (const p of phases) {
      for (const m of p.milestones) {
        if (m.requiresPayment && m.paymentPct) {
          milestones.push({ name: m.name, paymentPct: m.paymentPct, phase: p.phase });
        }
      }
    }
    if (milestones.length === 0) {
      // Fallback: use a standard draw schedule
      const fallback = [
        { name: "Foundation complete", paymentPct: 15, phase: "BUILD" },
        { name: "Framing complete", paymentPct: 20, phase: "BUILD" },
        { name: "Roof dried in", paymentPct: 15, phase: "BUILD" },
        { name: "Rough mechanical complete", paymentPct: 20, phase: "BUILD" },
        { name: "Drywall complete", paymentPct: 10, phase: "BUILD" },
        { name: "Interior finishes", paymentPct: 15, phase: "BUILD" },
        { name: "Final completion", paymentPct: 5, phase: "VERIFY" },
      ];
      milestones.push(...fallback);
    }
    const input: DrawScheduleInput = {
      totalBudget: project.totalBudget,
      milestones,
      contingencyPct: contingencyResult.adjustedPct,
    };
    return generateDrawSchedule(input);
  }

  const drawResult = getDrawSchedule();

  // ---------------------------------------------------------------------------
  // Phased funding estimates (West Africa)
  // ---------------------------------------------------------------------------

  function getPhasedFundingData() {
    if (!isWA || !project) return [];
    return PHASE_ORDER.map((phase) => {
      const phaseItems = items.filter(
        (item) => item.category.toLowerCase().includes(phase.toLowerCase())
      );
      const phaseDef = marketData.phases.find((p) => p.phase === phase);
      // Estimate cost per phase as a fraction of total budget
      const phaseIndex = PHASE_ORDER.indexOf(phase);
      const phasePcts: Record<number, number> = {
        0: 0.02, 1: 0.03, 2: 0.10, 3: 0.05, 4: 0.03,
        5: 0.02, 6: 0.60, 7: 0.05, 8: 0.10,
      };
      const estimatedCost = project.totalBudget * (phasePcts[phaseIndex] ?? 0.05);
      const funded = phaseFunding[phase] ?? 0;
      return {
        phase,
        name: phaseDef?.name ?? phase,
        estimatedCost,
        funded,
        pct: estimatedCost > 0 ? Math.min((funded / estimatedCost) * 100, 100) : 0,
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const financialTabs = [
    { key: "overview", label: "Overview" },
    ...(isUSA ? [{ key: "loan", label: "Loan Calc" }] : []),
    ...(isRent ? [{ key: "rental", label: "Rental Yield" }] : []),
    ...(isUSA ? [{ key: "draw", label: "Draw Schedule" }] : []),
    ...(isWA ? [{ key: "phased", label: "Phased Funding" }] : []),
    ...(isWA ? [{ key: "currency", label: "Currency" }] : []),
  ];

  return (
    <>
      <PageHeader
        title={t("project.financials")}
        projectName={project.name}
        projectId={projectId}
        subtitle="Calculators and projections"
      />

      {/* Tab switcher */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {financialTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 text-[11px] rounded-full whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-earth text-warm font-medium"
                : "bg-surface border border-border text-muted hover:border-border-dark hover:text-earth"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Top stat cards ── */}
      {activeTab === "overview" && (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <StatCard value={fmtCompact(project.totalBudget)} label="Total budget" />
          <StatCard value={fmtCompact(project.totalSpent)} label="Total spent" />
          <StatCard
            value={fmtCompact(remaining)}
            label="Remaining"
            valueClassName={remaining < 0 ? "text-danger" : ""}
          />
          <StatCard
            value={fmtCompact(contingencyResult.contingencyAmount)}
            label={`Contingency (${formatPercent(contingencyResult.adjustedPct)})`}
          />
        </div>

        {/* ── Budget vs Actuals ── */}
        <SectionLabel>Budget vs actuals</SectionLabel>
      <Card padding="sm" className="mb-5">
        {/* TODO: Replace inline empty state below with shared <EmptyState> component for consistency */}
        {items.length === 0 ? (
          <p className="text-[12px] text-muted py-3 text-center">
            No budget items yet. Add items on the Budget page to see comparisons here.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const diff = item.actual - item.estimated;
              const pct =
                item.estimated > 0
                  ? Math.round((item.actual / item.estimated) * 100)
                  : 0;
              return (
                <div key={item.id} className="py-2.5 px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-earth">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-data font-medium ${
                        diff > 0 ? "text-danger" : diff < 0 ? "text-success" : "text-muted"
                      }`}
                    >
                      {diff > 0 ? "+" : ""}
                      {fmt(diff)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-data text-muted mb-1.5">
                    <span>Estimated: {fmt(item.estimated)}</span>
                    <span>Actual: {fmt(item.actual)}</span>
                    <span>{pct}%</span>
                  </div>
                  <ProgressBar
                    value={pct}
                    color={
                      pct > 100
                        ? "var(--color-danger)"
                        : pct > 85
                        ? "var(--color-warning)"
                        : "var(--color-success)"
                    }
                    height={3}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Contingency analysis ── */}
      <SectionLabel>Contingency analysis</SectionLabel>
      <Card padding="md" className="mb-5">
        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <div className="font-data text-[14px] font-medium text-earth">
              {formatPercent(contingencyResult.basePct)}
            </div>
            <div className="text-[9px] text-muted uppercase tracking-wider">
              Base rate
            </div>
          </div>
          <div>
            <div className="font-data text-[14px] font-medium text-earth">
              {formatPercent(contingencyResult.adjustedPct)}
            </div>
            <div className="text-[9px] text-muted uppercase tracking-wider">
              Adjusted rate
            </div>
          </div>
          <div>
            <div className="font-data text-[14px] font-medium text-earth">
              {fmtCompact(contingencyResult.contingencyAmount)}
            </div>
            <div className="text-[9px] text-muted uppercase tracking-wider">
              Reserve amount
            </div>
          </div>
        </div>
        {contingencyResult.adjustments.length > 0 && (
          <div className="space-y-1 mb-2">
            {contingencyResult.adjustments.map((adj, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-muted">{adj.factor}</span>
                <span
                  className={`font-data ${
                    adj.adjustment > 0 ? "text-warning" : "text-success"
                  }`}
                >
                  {adj.adjustment > 0 ? "+" : ""}
                  {adj.adjustment}%
                </span>
              </div>
            ))}
          </div>
        )}
        <FormulaToggle formula={contingencyResult.formula} />
      </Card>
        </>
      )}

      {/* ── USA: Loan Qualification Calculator ── */}
      {activeTab === "loan" && isUSA && (
        <>
          <SectionLabel>Loan qualification calculator</SectionLabel>
          <Card padding="md" className="mb-5">
            {locationData && (
              <div className="p-2.5 rounded-[var(--radius)] bg-surface-alt border border-border text-[11px] text-earth mb-3">
                <span className="font-medium">Location data applied:</span>{" "}
                Property tax rate set to {locationData.propertyTaxRate}% based on {locationData.city}{locationData.state ? `, ${locationData.state}` : ""} averages.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Annual income (USD)
                </label>
                <input
                  type="number"
                  value={loanIncome}
                  onChange={(e) => setLoanIncome(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Your total gross yearly income before taxes
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Monthly debts (USD)
                </label>
                <input
                  type="number"
                  value={loanDebts}
                  onChange={(e) => setLoanDebts(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Car payments, student loans, credit card minimums
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Down payment %
                </label>
                <input
                  type="number"
                  value={loanDown}
                  onChange={(e) => setLoanDown(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Percentage of home price you pay upfront (typically 10-20%)
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Interest rate %
                </label>
                <input
                  type="number"
                  step="0.125"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  {liveRate ? `Current 30-year fixed: ${liveRate}% (FRED/Freddie Mac)` : "Annual mortgage interest rate offered by lender"}
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Loan term (years)
                </label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Repayment period, usually 15 or 30 years
                </p>
              </div>
            </div>
            <button
              onClick={handleLoanCalc}
              className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
            >
              Calculate
            </button>

            {loanResult && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      {formatPercent(loanResult.dtiRatio)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      DTI ratio
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      Debt-to-income: your total monthly debts divided by monthly income. Lenders cap this at 43%.
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      ${loanResult.maxLoanAmount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Max loan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      ${loanResult.monthlyPITI.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Monthly PITI
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      Principal + Interest + Taxes + Insurance -- your full monthly housing payment
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-data text-[14px] font-medium ${
                        loanResult.qualified ? "text-success" : "text-danger"
                      }`}
                    >
                      {loanResult.qualified ? "Qualified" : "Not qualified"}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Status
                    </div>
                  </div>
                </div>
                {loanResult.disqualifyReasons.length > 0 && (
                  <div className="p-2.5 rounded-[var(--radius)] bg-danger-bg text-danger text-[11px] mb-2">
                    {loanResult.disqualifyReasons.map((r, i) => (
                      <p key={i}>{r}</p>
                    ))}
                  </div>
                )}
                <FormulaToggle formula={loanResult.formula} />
              </div>
            )}

            <div className="mt-3 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-0.5">What is loan qualification?</p>
              <p>
                Lenders use the DTI (debt-to-income) ratio to determine how much you can
                borrow. The back-end DTI ratio compares your total monthly debt payments
                (including the proposed mortgage) to your gross monthly income. Most
                conventional lenders cap this at 43%. The calculator estimates the maximum
                loan amount that keeps your DTI under that threshold.
              </p>
              <p className="mt-1.5 text-[10px] text-emerald-600">
                This is educational guidance. Consult a licensed mortgage professional for your specific situation.
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ── USA: Draw Schedule ── */}
      {activeTab === "draw" && isUSA && drawResult && (
        <>
          <SectionLabel>Draw schedule</SectionLabel>
          <Card padding="md" className="mb-5">
            <p className="text-[11px] text-muted mb-3">
              A draw schedule controls when and how much of your construction loan is
              disbursed. Each &quot;draw&quot; is released after the lender verifies that the
              corresponding milestone is complete.
            </p>
            <div className="space-y-2 mb-3">
              {drawResult.draws.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-earth text-warm text-[10px] flex items-center justify-center font-data">
                      {i + 1}
                    </span>
                    <span className="text-earth">{d.milestone}</span>
                  </div>
                  <div className="flex items-center gap-3 font-data">
                    <span className="text-muted text-[11px]">{d.pct}%</span>
                    <span className="text-earth">{fmt(d.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] border-t border-border pt-2">
              <span className="text-muted">
                Retainage held back (released upon final completion)
              </span>
              <span className="font-data text-earth">{fmt(drawResult.retainage)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className="text-muted">Contingency reserve</span>
              <span className="font-data text-earth">
                {fmt(drawResult.contingencyReserve)}
              </span>
            </div>
            <FormulaToggle formula={drawResult.formula} />
          </Card>
        </>
      )}

      {/* ── West Africa: Phased Funding Tracker ── */}
      {activeTab === "phased" && isWA && (
        <>
          <SectionLabel>Phased funding tracker</SectionLabel>
          <Card padding="md" className="mb-5">
            <p className="text-[11px] text-muted mb-3">
              In West Africa, most residential construction is cash-funded in phases.
              Track how much you have set aside for each phase to plan your cash flow.
              Enter funded amounts to see your progress.
            </p>
            <div className="space-y-3">
              {getPhasedFundingData().map((row) => {
                const editFunding = localPhaseFunding ?? phaseFunding;
                const editedValue = editFunding[row.phase] ?? 0;
                const editedPct = row.estimatedCost > 0 ? Math.min((editedValue / row.estimatedCost) * 100, 100) : 0;
                return (
                  <div key={row.phase}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-earth">
                        {row.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-data text-muted">
                          {fmt(editedValue)} / {fmt(row.estimatedCost)}
                        </span>
                        <Badge
                          variant={
                            editedPct >= 100
                              ? "success"
                              : editedPct > 50
                              ? "warning"
                              : "info"
                          }
                        >
                          {Math.round(editedPct)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar
                          value={editedPct}
                          color={
                            editedPct >= 100
                              ? "var(--color-success)"
                              : "var(--color-warning)"
                          }
                          height={4}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="0"
                        value={editedValue || ""}
                        onChange={(e) => {
                          const newVal = Number(e.target.value) || 0;
                          setLocalPhaseFunding((prev) => ({
                            ...(prev ?? phaseFunding),
                            [row.phase]: newVal,
                          }));
                          setPhaseFundingDirty(true);
                        }}
                        className="w-24 px-2 py-1 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth font-data focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {phaseFundingDirty && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (!user || !localPhaseFunding) return;
                    setSavingFunding(true);
                    try {
                      await savePhasedFunding(user.uid, projectId, localPhaseFunding);
                      setPhaseFundingDirty(false);
                      setLocalPhaseFunding(null);
                      showToast("Phased funding saved successfully.", "success");
                    } catch (err) {
                      console.error("Failed to save phased funding:", err);
                      showToast("Failed to save phased funding. Please try again.", "error");
                    } finally {
                      setSavingFunding(false);
                    }
                  }}
                  disabled={savingFunding}
                  className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-50"
                >
                  {savingFunding ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setLocalPhaseFunding(null);
                    setPhaseFundingDirty(false);
                  }}
                  className="px-4 py-2 text-[12px] text-muted border border-border rounded-[var(--radius)] hover:border-border-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <div className="mt-3 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Understanding phased funding</p>
              <p>
                Unlike in the US where construction loans provide all funds upfront,
                West African residential construction is typically funded phase by phase
                from personal savings and diaspora remittances. The estimated cost per
                phase is an approximation based on typical cost distribution. The Build
                phase (physical construction) accounts for the largest share at roughly 60% of total cost.
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ── West Africa: Currency Converter ── */}
      {activeTab === "currency" && isWA && (
        <>
          <SectionLabel>Currency converter</SectionLabel>
          <Card padding="md" className="mb-5">
            <p className="text-[11px] text-muted mb-3">
              Convert between USD and{" "}
              {market === "GHANA"
                ? "Ghana Cedis (GHS)"
                : "CFA Francs (XOF)"}
              . Rates are approximate defaults -- use current market rates for accurate
              planning.
            </p>
            <div className="flex items-end gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-40 font-data"
                />
              </div>
              <button
                onClick={handleCurrencyConvert}
                className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
              >
                Convert
              </button>
            </div>
            {convertResult && (
              <div className="p-3 rounded-[var(--radius)] bg-surface-alt border border-border">
                <div className="text-center mb-2">
                  <div className="font-data text-[16px] font-medium text-earth">
                    {convertResult.convertedAmount.toLocaleString()}{" "}
                    {convertResult.toCurrency}
                  </div>
                  <div className="text-[10px] text-muted">
                    Rate: 1 USD = {convertResult.exchangeRate}{" "}
                    {convertResult.toCurrency}
                  </div>
                </div>
                <FormulaToggle formula={convertResult.formula} />
              </div>
            )}
            <div className="mt-3 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Exchange rate note</p>
              <p>
                {market === "GHANA"
                  ? "The Ghana Cedi (GHS) fluctuates against the USD. Check current rates before making large transfers. Consider using services like Wise, WorldRemit, or Remitly for competitive transfer rates."
                  : `The CFA Franc (XOF) is pegged to the Euro at a fixed rate of 655.957 XOF per EUR. The USD/XOF rate fluctuates with the EUR/USD exchange rate. ${liveExchangeRate ? `Current live rate: 1 USD = ${liveExchangeRate.toFixed(2)} XOF (fetched today).` : "Rate shown is an approximation."} Always verify with your bank or transfer service before sending money.`}
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ── Rental Yield Calculator (RENT purpose, any market) ── */}
      {activeTab === "rental" && isRent && (
        <>
          <SectionLabel>Rental yield calculator</SectionLabel>
          <Card padding="md" className="mb-5">
            <p className="text-[11px] text-muted mb-3">
              Since this project is intended for rental income, use this calculator to
              estimate your investment returns. All calculations are based on your total
              project budget of {fmt(project.totalBudget)}.
            </p>
            {locationData && (locationData.avgRentPerSqft || locationData.avgRentPerSqm) && (
              <div className="p-2.5 rounded-[var(--radius)] bg-surface-alt border border-border text-[11px] text-earth mb-3">
                <span className="font-medium">Location tip:</span>{" "}
                {market === "USA" && locationData.avgRentPerSqft
                  ? `Typical rent in ${locationData.city} is $${locationData.avgRentPerSqft.toFixed(2)}/sqft/mo.${project.sizeRange ? "" : ""}`
                  : locationData.avgRentPerSqm
                    ? `Typical rent in ${locationData.city} is ${locationData.avgRentPerSqm.toLocaleString()}/sqm/mo.`
                    : ""
                }
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Monthly rent ({marketData.currency.code})
                </label>
                <input
                  type="number"
                  value={rentMonthly}
                  onChange={(e) => setRentMonthly(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Expected monthly rental income for the property
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Vacancy rate %
                </label>
                <input
                  type="number"
                  value={rentVacancy}
                  onChange={(e) => setRentVacancy(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Percentage of time the unit is expected to be empty (typically 5-10%)
                </p>
              </div>
              <div>
                <label className="block text-[11px] text-muted font-medium mb-1">
                  Annual expenses %
                </label>
                <input
                  type="number"
                  value={rentExpenses}
                  onChange={(e) => setRentExpenses(e.target.value)}
                  className="px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data"
                />
                <p className="text-[10px] text-muted mt-0.5">
                  Maintenance, repairs, property management as % of total cost
                </p>
              </div>
            </div>
            <button
              onClick={handleRentalCalc}
              disabled={project.totalBudget <= 0}
              className="px-4 py-2 text-[12px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
            >
              Calculate
            </button>

            {rentalResult && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      {formatPercent(rentalResult.capRate)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Cap rate
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      Capitalization rate: net operating income divided by total property cost. A common measure of real estate investment return.
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      {formatPercent(rentalResult.netYield)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Net yield
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-data text-[14px] font-medium ${
                        rentalResult.monthlyCashFlow >= 0
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {fmt(rentalResult.monthlyCashFlow)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Monthly cash flow
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[14px] font-medium text-earth">
                      {formatMonths(rentalResult.breakEvenMonths)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Break-even
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      Time to recover your total investment from net rental income
                    </div>
                  </div>
                </div>
                <FormulaToggle formula={rentalResult.formula} />
              </div>
            )}

            <div className="mt-3 p-3 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              <p className="font-semibold mb-0.5">Understanding rental yield</p>
              <p>
                The cap rate (capitalization rate) is the annual net operating income
                divided by the total cost of the property. It does not factor in
                financing. Net yield accounts for vacancy and operating expenses. Monthly
                cash flow is what you actually receive after all costs. The break-even
                period shows how long it takes for cumulative cash flow to equal your
                total investment.
              </p>
              <p className="mt-1.5 text-[10px] text-emerald-600">
                This is educational guidance. Consult a licensed financial professional for your specific situation.
              </p>
            </div>
          </Card>
        </>
      )}

      {/* ── Educational footer ── */}
      <div className="p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">About the financials dashboard</p>
        <p>
          Every financial calculation in Keystone is auditable. Click &quot;Show formula&quot;
          on any result to see the exact inputs, formula, and arithmetic used. Numbers
          you see here are derived from your project budget and the inputs you provide
          -- they are estimates, not guarantees.
          {isUSA &&
            " Loan qualification estimates use standard DTI limits and do not account for individual lender overlays, credit score tiers, or special loan programs."}
          {isWA &&
            " Exchange rates and cost estimates are approximations. Verify current rates and local material prices before making purchasing decisions."}
        </p>
        <p className="mt-1.5 text-[10px] text-emerald-600">
          This is educational guidance. Consult licensed professionals for financial, legal, or structural decisions.
        </p>
      </div>
    </>
  );
}
