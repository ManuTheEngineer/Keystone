"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
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
import { LearnTooltip } from "@/components/ui/LearnTooltip";
import { useTranslation } from "@/lib/hooks/use-translation";
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
  const [loanDown, setLoanDown] = useState(String(project?.downPaymentPct ?? 20));
  const [loanRate, setLoanRate] = useState(String(project?.loanRate ?? 7.25));
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [loanTerm, setLoanTerm] = useState("30");
  const [loanResult, setLoanResult] = useState<ReturnType<typeof calculateLoanQualification> | null>(null);

  // Rental yield state (RENT purpose)
  const [rentMonthly, setRentMonthly] = useState(String(project?.monthlyRent ?? 2000));
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

  // Pre-fill calculator fields from wizard data saved on the project
  const projectLoadedRef = useRef(false);
  useEffect(() => {
    if (!project || projectLoadedRef.current) return;
    projectLoadedRef.current = true;
    if (project.downPaymentPct != null) setLoanDown(String(project.downPaymentPct));
    if (project.loanRate != null) setLoanRate(String(project.loanRate));
    if (project.monthlyRent != null && project.monthlyRent > 0) setRentMonthly(String(project.monthlyRent));
  }, [project]);

  // Fetch live 30-year mortgage rate from FRED
  useEffect(() => {
    if (project?.market !== "USA") return;
    fetch("/api/location-data/mortgage-rate/")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.rate) {
          setLiveRate(data.rate);
          // Only set loan rate if user hasn't entered one from wizard
          if (!project?.loanRate) setLoanRate(String(data.rate));
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

  return (
    <>
      <PageHeader
        title={t("project.financials")}
        projectName={project.name}
        projectId={projectId}
        subtitle="Your financial picture"
      />

      {/* ================================================================= */}
      {/*  SNAPSHOT — KPI strip                                             */}
      {/* ================================================================= */}
      <div className="flex items-stretch gap-px mb-4 bg-border/20 rounded-lg overflow-hidden">
        {[
          { label: "Budget", value: fmtCompact(project.totalBudget) },
          { label: "Spent", value: fmtCompact(project.totalSpent) },
          { label: "Remaining", value: fmtCompact(remaining), warn: remaining < 0 },
          { label: "Contingency", value: fmtCompact(contingencyResult.contingencyAmount), sub: formatPercent(contingencyResult.adjustedPct) },
        ].map((kpi) => (
          <div key={kpi.label} className="flex-1 bg-surface px-3 py-2 text-center">
            <p className={`text-[14px] font-data font-bold leading-tight ${kpi.warn ? "text-danger" : "text-earth"}`}>{kpi.value}</p>
            <p className="text-[8px] text-muted uppercase tracking-wider">{kpi.label}</p>
            {kpi.sub && <p className="text-[8px] font-data text-muted/50">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* ================================================================= */}
      {/*  SAFETY CUSHION — Contingency analysis                            */}
      {/* ================================================================= */}
      <div className="mb-5">
        <p className="text-[10px] font-medium text-earth/40 tracking-wide mb-2">Safety cushion</p>
        <div className="p-3 bg-surface border border-border/40 rounded-lg">
          <div className="grid grid-cols-3 gap-3 text-center mb-2">
            <div>
              <div className="font-data text-[13px] font-medium text-earth">{formatPercent(contingencyResult.basePct)}</div>
              <div className="text-[8px] text-muted uppercase tracking-wider">Base rate</div>
            </div>
            <div>
              <div className="font-data text-[13px] font-medium text-earth">{formatPercent(contingencyResult.adjustedPct)}</div>
              <div className="text-[8px] text-muted uppercase tracking-wider">Adjusted</div>
            </div>
            <div>
              <div className="font-data text-[13px] font-medium text-earth">{fmtCompact(contingencyResult.contingencyAmount)}</div>
              <div className="text-[8px] text-muted uppercase tracking-wider">Reserve</div>
            </div>
          </div>
          {contingencyResult.adjustments.length > 0 && (
            <div className="space-y-0.5 mb-1.5">
              {contingencyResult.adjustments.map((adj, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted">{adj.factor}</span>
                  <span className={`font-data ${adj.adjustment > 0 ? "text-warning" : "text-success"}`}>
                    {adj.adjustment > 0 ? "+" : ""}{adj.adjustment}%
                  </span>
                </div>
              ))}
            </div>
          )}
          <FormulaToggle formula={contingencyResult.formula} />
        </div>
      </div>

      {/* ================================================================= */}
      {/*  HOW YOU'RE PAYING — Loan (USA) or Phased Funding (WA)            */}
      {/* ================================================================= */}
      {isUSA && (
        <div className="mb-5">
          <p className="text-[10px] font-medium text-earth/40 tracking-wide mb-2">How you are paying</p>

          {/* Loan qualification */}
          <div className="p-3 bg-surface border border-border/40 rounded-lg mb-3">
            <p className="text-[11px] font-medium text-earth mb-2">Loan qualification</p>
            {locationData && (
              <p className="text-[9px] text-muted mb-2">
                Property tax: {locationData.propertyTaxRate}% ({locationData.city}{locationData.state ? `, ${locationData.state}` : ""})
              </p>
            )}
            <div className="grid grid-cols-5 gap-2 mb-2">
              {[
                { label: "Annual income", value: loanIncome, set: setLoanIncome },
                { label: "Monthly debts", value: loanDebts, set: setLoanDebts },
                { label: "Down payment %", value: loanDown, set: setLoanDown },
                { label: "Interest rate %", value: loanRate, set: setLoanRate, step: "0.125", hint: liveRate ? `Live: ${liveRate}%` : undefined },
                { label: "Term (years)", value: loanTerm, set: setLoanTerm },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[8px] text-muted mb-0.5">{f.label}</label>
                  <input type="number" value={f.value} onChange={(e) => f.set(e.target.value)} step={f.step}
                    className={inputClass} />
                  {f.hint && <p className="text-[7px] text-muted/50 mt-0.5">{f.hint}</p>}
                </div>
              ))}
            </div>
            <button onClick={handleLoanCalc}
              className="px-3 py-1.5 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 transition-colors">
              Calculate
            </button>

            {loanResult && (
              <div className="mt-2 pt-2 border-t border-border/20">
                <div className="grid grid-cols-4 gap-2 mb-1.5">
                  {([
                    { key: "dti", label: <><LearnTooltip term="DTI" explanation="Debt-to-Income ratio — the percentage of your monthly income that goes to debt payments.">DTI</LearnTooltip> ratio</> as ReactNode, value: formatPercent(loanResult.dtiRatio) },
                    { key: "max-loan", label: "Max loan" as ReactNode, value: `$${loanResult.maxLoanAmount.toLocaleString()}` },
                    { key: "piti", label: "Monthly PITI" as ReactNode, value: `$${loanResult.monthlyPITI.toLocaleString()}` },
                    { key: "status", label: "Status" as ReactNode, value: loanResult.qualified ? "Qualified" : "Not qualified", color: loanResult.qualified ? "text-success" : "text-danger" },
                  ] as { key: string; label: ReactNode; value: string; color?: string }[]).map((r) => (
                    <div key={r.key} className="text-center">
                      <div className={`font-data text-[12px] font-medium ${r.color || "text-earth"}`}>{r.value}</div>
                      <div className="text-[8px] text-muted uppercase tracking-wider">{r.label}</div>
                    </div>
                  ))}
                </div>
                {loanResult.disqualifyReasons.length > 0 && (
                  <div className="p-1.5 rounded bg-danger/5 text-danger text-[9px] mb-1">
                    {loanResult.disqualifyReasons.map((r, i) => <p key={i}>{r}</p>)}
                  </div>
                )}
                <FormulaToggle formula={loanResult.formula} />
              </div>
            )}
          </div>

          {/* Draw schedule */}
          {drawResult && (
            <div className="p-3 bg-surface border border-border/40 rounded-lg">
              <p className="text-[11px] font-medium text-earth mb-2"><LearnTooltip term="Draw schedule" explanation="A draw schedule is a payment plan that releases construction loan funds in stages as milestones are completed, rather than all at once.">Draw schedule</LearnTooltip></p>
              <div className="space-y-1 mb-2">
                {drawResult.draws.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-earth text-warm text-[8px] flex items-center justify-center font-data shrink-0">{i + 1}</span>
                      <span className="text-earth">{d.milestone}</span>
                    </div>
                    <div className="flex items-center gap-2 font-data">
                      <span className="text-muted text-[9px]">{d.pct}%</span>
                      <span className="text-earth">{fmt(d.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[9px] border-t border-border/20 pt-1.5">
                <span className="text-muted">Retainage</span>
                <span className="font-data text-earth">{fmt(drawResult.retainage)}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] mt-0.5">
                <span className="text-muted">Contingency reserve</span>
                <span className="font-data text-earth">{fmt(drawResult.contingencyReserve)}</span>
              </div>
              <FormulaToggle formula={drawResult.formula} />
            </div>
          )}
        </div>
      )}

      {isWA && (
        <div className="mb-5">
          <p className="text-[10px] font-medium text-earth/40 tracking-wide mb-2">How you are paying</p>

          {/* Phased funding tracker */}
          <div className="p-3 bg-surface border border-border/40 rounded-lg mb-3">
            <p className="text-[11px] font-medium text-earth mb-2">Phased funding</p>
            <div className="space-y-1.5">
              {getPhasedFundingData().map((row) => {
                const editFunding = localPhaseFunding ?? phaseFunding;
                const editedValue = editFunding[row.phase] ?? 0;
                const editedPct = row.estimatedCost > 0 ? Math.min((editedValue / row.estimatedCost) * 100, 100) : 0;
                return (
                  <div key={row.phase} className="flex items-center gap-2">
                    <span className="text-[10px] text-earth w-20 truncate shrink-0">{row.name}</span>
                    <div className="flex-1 h-1.5 bg-sand/20 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${editedPct >= 100 ? "bg-success" : "bg-warning"}`} style={{ width: `${editedPct}%` }} />
                    </div>
                    <span className="text-[9px] font-data text-muted w-8 text-right">{Math.round(editedPct)}%</span>
                    <input type="number" placeholder="0" value={editedValue || ""}
                      onChange={(e) => {
                        setLocalPhaseFunding((prev) => ({ ...(prev ?? phaseFunding), [row.phase]: Number(e.target.value) || 0 }));
                        setPhaseFundingDirty(true);
                      }}
                      className="w-20 px-1.5 py-1 text-[10px] border border-border rounded bg-white font-data focus:outline-none focus:border-clay/40" />
                  </div>
                );
              })}
            </div>
            {phaseFundingDirty && (
              <div className="mt-2 flex items-center gap-1.5">
                <button onClick={async () => {
                  if (!user || !localPhaseFunding) return;
                  setSavingFunding(true);
                  try {
                    await savePhasedFunding(user.uid, projectId, localPhaseFunding);
                    setPhaseFundingDirty(false);
                    setLocalPhaseFunding(null);
                    showToast("Saved", "success");
                  } catch { showToast("Failed to save", "error"); }
                  finally { setSavingFunding(false); }
                }} disabled={savingFunding}
                  className="px-3 py-1 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 disabled:opacity-40">{savingFunding ? "..." : "Save"}</button>
                <button onClick={() => { setLocalPhaseFunding(null); setPhaseFundingDirty(false); }}
                  className="px-2 py-1 text-[10px] text-muted hover:text-earth">Cancel</button>
              </div>
            )}
          </div>

          {/* Currency converter — compact */}
          <div className="p-3 bg-surface border border-border/40 rounded-lg">
            <p className="text-[11px] font-medium text-earth mb-2">Currency converter</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)}
                className="w-24 px-2 py-1 text-[11px] border border-border rounded bg-white font-data focus:outline-none focus:border-clay/40" />
              <span className="text-[9px] text-muted">USD</span>
              <button onClick={handleCurrencyConvert}
                className="px-2.5 py-1 text-[10px] bg-earth text-warm rounded hover:bg-earth/90">Convert</button>
              {convertResult && (
                <>
                  <span className="text-[10px] text-muted">=</span>
                  <span className="font-data text-[12px] font-medium text-earth">{convertResult.convertedAmount.toLocaleString()} {convertResult.toCurrency}</span>
                </>
              )}
              <div className="flex items-center gap-1 ml-auto">
                {convertResult && <span className="text-[8px] font-data text-muted">1 USD = {convertResult.exchangeRate.toFixed(2)} {convertResult.toCurrency}</span>}
                {liveExchangeRate ? (
                  <span className="px-1 py-0.5 rounded bg-success/10 text-success text-[7px] font-medium">LIVE</span>
                ) : convertResult ? (
                  <span className="px-1 py-0.5 rounded bg-warning/10 text-warning text-[7px] font-medium">APPROX</span>
                ) : null}
                <button onClick={fetchLiveRate} disabled={rateLoading} className="text-clay hover:text-earth" title="Refresh">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={rateLoading ? "animate-spin" : ""}>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>
            </div>
            {convertResult && <FormulaToggle formula={convertResult.formula} />}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/*  RENTAL INCOME — only for "build to rent" projects                */}
      {/* ================================================================= */}
      {isRent && (
        <div className="mb-5">
          <p className="text-[10px] font-medium text-earth/40 tracking-wide mb-2">Rental income projection</p>
          <div className="p-3 bg-surface border border-border/40 rounded-lg">
            {locationData && (locationData.avgRentPerSqft || locationData.avgRentPerSqm) && (
              <p className="text-[9px] text-muted mb-2">
                Typical rent in {locationData.city}: {market === "USA" && locationData.avgRentPerSqft
                  ? `$${locationData.avgRentPerSqft.toFixed(2)}/sqft/mo`
                  : locationData.avgRentPerSqm ? `${locationData.avgRentPerSqm.toLocaleString()}/sqm/mo` : ""}
              </p>
            )}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: `Monthly rent (${marketData.currency.code})`, value: rentMonthly, set: setRentMonthly },
                { label: "Vacancy %", value: rentVacancy, set: setRentVacancy },
                { label: "Annual expenses %", value: rentExpenses, set: setRentExpenses },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[8px] text-muted mb-0.5">{f.label}</label>
                  <input type="number" value={f.value} onChange={(e) => f.set(e.target.value)} className={inputClass} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={handleRentalCalc} disabled={project.totalBudget <= 0}
                className="px-3 py-1 text-[10px] bg-earth text-warm rounded hover:bg-earth/90 disabled:opacity-40">Calculate</button>
              <span className="text-[8px] text-muted">Based on {fmt(project.totalBudget)} total cost</span>
            </div>

            {rentalResult && (
              <div className="mt-2 pt-2 border-t border-border/20">
                <div className="grid grid-cols-4 gap-2 mb-1.5">
                  {[
                    { label: "Cap rate", value: formatPercent(rentalResult.capRate) },
                    { label: "Net yield", value: formatPercent(rentalResult.netYield) },
                    { label: "Monthly cash flow", value: fmt(rentalResult.monthlyCashFlow), color: rentalResult.monthlyCashFlow >= 0 ? "text-success" : "text-danger" },
                    { label: "Break-even", value: formatMonths(rentalResult.breakEvenMonths) },
                  ].map((r) => (
                    <div key={r.label} className="text-center">
                      <div className={`font-data text-[12px] font-medium ${r.color || "text-earth"}`}>{r.value}</div>
                      <div className="text-[8px] text-muted uppercase tracking-wider">{r.label}</div>
                    </div>
                  ))}
                </div>
                <FormulaToggle formula={rentalResult.formula} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[9px] text-muted/40 text-center mb-4">
        Educational guidance only. Consult licensed professionals for financial decisions.
      </p>
    </>
  );
}
