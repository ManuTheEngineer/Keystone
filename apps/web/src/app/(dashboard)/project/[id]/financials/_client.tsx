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
    <div className="mt-1.5">
      <button
        onClick={() => setOpen((p) => !p)}
        className="text-[9px] text-info hover:underline cursor-pointer"
      >
        {open ? "Hide formula" : "Show formula"}
      </button>
      {open && (
        <pre className="mt-1 p-2 bg-surface-alt border border-border rounded-[var(--radius)] text-[9px] font-data text-muted leading-relaxed whitespace-pre-wrap">
          {formula}
        </pre>
      )}
    </div>
  );
}

const inputClass =
  "px-2 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-clay w-full font-data";

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
  const [rateFetchedAt, setRateFetchedAt] = useState<string | null>(null);

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
  const fetchLiveRate = useCallback(() => {
    if (!project || project.market === "USA") return;
    setRateLoading(true);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.rates) {
          const targetCurrency = project.market === "GHANA" ? "GHS" : "XOF";
          const rate = data.rates[targetCurrency];
          if (rate) {
            setLiveExchangeRate(rate);
            setRateFetchedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, [project?.market]);

  useEffect(() => { fetchLiveRate(); }, [fetchLiveRate]);

  // ---------------------------------------------------------------------------
  // Guard
  // ---------------------------------------------------------------------------

  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-sand border-t-clay animate-spin mb-3" />
      <p className="text-[11px] text-muted">Loading financials...</p>
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
    const fallbackRate = market === "GHANA" ? 10.95 : 567.73;
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
      const phaseDef = marketData.phases.find((p) => p.phase === phase);
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
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {financialTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 text-[10px] rounded-full whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-earth text-warm font-medium"
                : "bg-surface border border-border text-muted hover:border-border-dark hover:text-earth"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview: KPI row + Contingency ── */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
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

          {/* Contingency analysis */}
          <SectionLabel>Contingency analysis</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            <div className="grid grid-cols-3 gap-3 text-center mb-2">
              <div>
                <div className="font-data text-[13px] font-medium text-earth">
                  {formatPercent(contingencyResult.basePct)}
                </div>
                <div className="text-[9px] text-muted uppercase tracking-wider">
                  Base rate
                </div>
              </div>
              <div>
                <div className="font-data text-[13px] font-medium text-earth">
                  {formatPercent(contingencyResult.adjustedPct)}
                </div>
                <div className="text-[9px] text-muted uppercase tracking-wider">
                  Adjusted rate
                </div>
              </div>
              <div>
                <div className="font-data text-[13px] font-medium text-earth">
                  {fmtCompact(contingencyResult.contingencyAmount)}
                </div>
                <div className="text-[9px] text-muted uppercase tracking-wider">
                  Reserve amount
                </div>
              </div>
            </div>
            {contingencyResult.adjustments.length > 0 && (
              <div className="space-y-0.5 mb-1.5">
                {contingencyResult.adjustments.map((adj, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[10px]"
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
          </div>
        </>
      )}

      {/* ── USA: Loan Qualification Calculator ── */}
      {activeTab === "loan" && isUSA && (
        <>
          <SectionLabel>Loan qualification calculator</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            {locationData && (
              <div className="p-2 rounded-[var(--radius)] bg-surface-alt border border-border text-[10px] text-earth mb-2">
                <span className="font-medium">Location data:</span>{" "}
                Property tax {locationData.propertyTaxRate}% ({locationData.city}{locationData.state ? `, ${locationData.state}` : ""})
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Annual income (USD)
                </label>
                <input
                  type="number"
                  value={loanIncome}
                  onChange={(e) => setLoanIncome(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Monthly debts (USD)
                </label>
                <input
                  type="number"
                  value={loanDebts}
                  onChange={(e) => setLoanDebts(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Down payment %
                </label>
                <input
                  type="number"
                  value={loanDown}
                  onChange={(e) => setLoanDown(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Interest rate %
                </label>
                <input
                  type="number"
                  step="0.125"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                  className={inputClass}
                />
                {liveRate && (
                  <p className="text-[8px] text-muted mt-0.5">
                    Live 30yr: {liveRate}%
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Term (years)
                </label>
                <input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              onClick={handleLoanCalc}
              className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
            >
              Calculate
            </button>

            {loanResult && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <div className="text-center">
                    <div className="font-data text-[13px] font-medium text-earth">
                      {formatPercent(loanResult.dtiRatio)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      DTI ratio
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[13px] font-medium text-earth">
                      ${loanResult.maxLoanAmount.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Max loan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[13px] font-medium text-earth">
                      ${loanResult.monthlyPITI.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Monthly PITI
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-data text-[13px] font-medium ${
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
                  <div className="p-2 rounded-[var(--radius)] bg-danger-bg text-danger text-[10px] mb-1.5">
                    {loanResult.disqualifyReasons.map((r, i) => (
                      <p key={i}>{r}</p>
                    ))}
                  </div>
                )}
                <FormulaToggle formula={loanResult.formula} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── USA: Draw Schedule ── */}
      {activeTab === "draw" && isUSA && drawResult && (
        <>
          <SectionLabel>Draw schedule</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            <div className="space-y-1.5 mb-2">
              {drawResult.draws.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-earth text-warm text-[9px] flex items-center justify-center font-data shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-earth">{d.milestone}</span>
                  </div>
                  <div className="flex items-center gap-2 font-data">
                    <span className="text-muted text-[10px]">{d.pct}%</span>
                    <span className="text-earth">{fmt(d.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] border-t border-border pt-1.5">
              <span className="text-muted">Retainage</span>
              <span className="font-data text-earth">{fmt(drawResult.retainage)}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-muted">Contingency reserve</span>
              <span className="font-data text-earth">
                {fmt(drawResult.contingencyReserve)}
              </span>
            </div>
            <FormulaToggle formula={drawResult.formula} />
          </div>
        </>
      )}

      {/* ── West Africa: Phased Funding Tracker ── */}
      {activeTab === "phased" && isWA && (
        <>
          <SectionLabel>Phased funding tracker</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            <div className="space-y-2">
              {getPhasedFundingData().map((row) => {
                const editFunding = localPhaseFunding ?? phaseFunding;
                const editedValue = editFunding[row.phase] ?? 0;
                const editedPct = row.estimatedCost > 0 ? Math.min((editedValue / row.estimatedCost) * 100, 100) : 0;
                return (
                  <div key={row.phase}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-medium text-earth">
                        {row.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-data text-muted">
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
                          height={3}
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
                        className="w-20 px-1.5 py-1 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth font-data focus:outline-none focus:border-clay"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {phaseFundingDirty && (
              <div className="mt-2 flex items-center gap-1.5">
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
                  className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-50"
                >
                  {savingFunding ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setLocalPhaseFunding(null);
                    setPhaseFundingDirty(false);
                  }}
                  className="px-3 py-1.5 text-[11px] text-muted border border-border rounded-[var(--radius)] hover:border-border-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── West Africa: Currency Converter (compact inline) ── */}
      {activeTab === "currency" && isWA && (
        <>
          <SectionLabel>Currency converter</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="USD amount"
                className="w-28 px-2 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth font-data focus:outline-none focus:border-clay"
              />
              <span className="text-[10px] text-muted">USD</span>
              <button
                onClick={handleCurrencyConvert}
                className="px-3 py-1.5 text-[10px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
              >
                Convert
              </button>
              {convertResult && (
                <>
                  <span className="text-[10px] text-muted">=</span>
                  <span className="font-data text-[13px] font-medium text-earth">
                    {convertResult.convertedAmount.toLocaleString()} {convertResult.toCurrency}
                  </span>
                </>
              )}
              <div className="flex items-center gap-1 ml-auto">
                {convertResult && (
                  <span className="text-[8px] text-muted font-data">
                    1 USD = {convertResult.exchangeRate.toFixed(2)} {convertResult.toCurrency}
                  </span>
                )}
                {liveExchangeRate ? (
                  <span className="inline-flex items-center px-1 py-0.5 rounded bg-success/10 text-success text-[7px] font-medium">
                    LIVE{rateFetchedAt ? ` ${rateFetchedAt}` : ""}
                  </span>
                ) : convertResult ? (
                  <span className="inline-flex items-center px-1 py-0.5 rounded bg-warning/10 text-warning text-[7px] font-medium">
                    APPROX
                  </span>
                ) : null}
                <button onClick={fetchLiveRate} disabled={rateLoading} className="text-clay hover:text-earth transition-colors" title="Refresh rate">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={rateLoading ? "animate-spin" : ""}>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>
            </div>
            {convertResult && (
              <FormulaToggle formula={convertResult.formula} />
            )}
          </div>
        </>
      )}

      {/* ── Rental Yield Calculator (RENT purpose, any market) ── */}
      {activeTab === "rental" && isRent && (
        <>
          <SectionLabel>Rental yield calculator</SectionLabel>
          <div className="p-3 bg-surface border border-border rounded-[var(--radius)] mb-4">
            {locationData && (locationData.avgRentPerSqft || locationData.avgRentPerSqm) && (
              <div className="p-2 rounded-[var(--radius)] bg-surface-alt border border-border text-[10px] text-earth mb-2">
                <span className="font-medium">Location tip:</span>{" "}
                {market === "USA" && locationData.avgRentPerSqft
                  ? `Typical rent in ${locationData.city}: $${locationData.avgRentPerSqft.toFixed(2)}/sqft/mo`
                  : locationData.avgRentPerSqm
                    ? `Typical rent in ${locationData.city}: ${locationData.avgRentPerSqm.toLocaleString()}/sqm/mo`
                    : ""
                }
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Monthly rent ({marketData.currency.code})
                </label>
                <input
                  type="number"
                  value={rentMonthly}
                  onChange={(e) => setRentMonthly(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Vacancy %
                </label>
                <input
                  type="number"
                  value={rentVacancy}
                  onChange={(e) => setRentVacancy(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[9px] text-muted font-medium mb-0.5">
                  Annual expenses %
                </label>
                <input
                  type="number"
                  value={rentExpenses}
                  onChange={(e) => setRentExpenses(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={handleRentalCalc}
                disabled={project.totalBudget <= 0}
                className="px-3 py-1.5 text-[11px] bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
              >
                Calculate
              </button>
              <span className="text-[9px] text-muted">
                Based on {fmt(project.totalBudget)} total cost
              </span>
            </div>

            {rentalResult && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <div className="text-center">
                    <div className="font-data text-[13px] font-medium text-earth">
                      {formatPercent(rentalResult.capRate)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Cap rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-data text-[13px] font-medium text-earth">
                      {formatPercent(rentalResult.netYield)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Net yield
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-data text-[13px] font-medium ${
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
                    <div className="font-data text-[13px] font-medium text-earth">
                      {formatMonths(rentalResult.breakEvenMonths)}
                    </div>
                    <div className="text-[9px] text-muted uppercase tracking-wider">
                      Break-even
                    </div>
                  </div>
                </div>
                <FormulaToggle formula={rentalResult.formula} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Consolidated disclaimer ── */}
      <p className="text-[9px] text-muted text-center mt-2 mb-4">
        Educational guidance only. Consult licensed professionals for financial, legal, or structural decisions.
      </p>
    </>
  );
}
