"use client";

import { useEffect, useState, useMemo } from "react";
import { useTopbar } from "../layout";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { StatCard } from "@/components/ui/StatCard";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

function parseNumber(value: string): number {
  const num = parseFloat(value.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

function formatPercent(value: number): string {
  return value.toFixed(1) + "%";
}

function getDtiStatus(dti: number): {
  label: string;
  color: string;
  valueClass: string;
} {
  if (dti < 36) {
    return {
      label: "Strong qualification",
      color: "text-success",
      valueClass: "!text-success",
    };
  }
  if (dti <= 43) {
    return {
      label: "May qualify",
      color: "text-warning",
      valueClass: "!text-warning",
    };
  }
  return {
    label: "Above typical limits",
    color: "text-danger",
    valueClass: "!text-danger",
  };
}

const inputClass =
  "px-3 py-2 text-[12px] border border-border rounded-[var(--radius)] bg-surface text-earth placeholder:text-muted/50 focus:outline-none focus:border-emerald-500 w-full font-data";

const labelClass = "text-[11px] text-muted font-medium mb-1";

export default function ToolsPage() {
  const { setTopbar } = useTopbar();

  useEffect(() => {
    setTopbar("Financial tools", "Calculators", "info");
  }, [setTopbar]);

  const [annualSalary, setAnnualSalary] = useState("");
  const [carPayment, setCarPayment] = useState("");
  const [studentLoans, setStudentLoans] = useState("");
  const [creditCards, setCreditCards] = useState("");
  const [otherDebts, setOtherDebts] = useState("");
  const [mortgagePayment, setMortgagePayment] = useState("");

  const monthlyIncome = useMemo(() => {
    return parseNumber(annualSalary) / 12;
  }, [annualSalary]);

  const totalMonthlyDebts = useMemo(() => {
    return (
      parseNumber(carPayment) +
      parseNumber(studentLoans) +
      parseNumber(creditCards) +
      parseNumber(otherDebts)
    );
  }, [carPayment, studentLoans, creditCards, otherDebts]);

  const housing = parseNumber(mortgagePayment);

  const frontEndDti = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return (housing / monthlyIncome) * 100;
  }, [housing, monthlyIncome]);

  const backEndDti = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return ((housing + totalMonthlyDebts) / monthlyIncome) * 100;
  }, [housing, totalMonthlyDebts, monthlyIncome]);

  const status = getDtiStatus(backEndDti);
  const hasInput = monthlyIncome > 0;

  return (
    <>
      <SectionLabel>Loan qualification calculator</SectionLabel>

      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center text-muted">
            <Calculator size={16} />
          </div>
          <div>
            <h3 className="text-[13px] font-medium text-earth">
              Debt-to-Income (DTI) Calculator
            </h3>
            <p className="text-[11px] text-muted">
              Calculate your DTI ratio to estimate loan qualification
            </p>
          </div>
        </div>

        {/* Income Section */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign size={14} className="text-success" />
            <span className="text-[11px] font-medium text-earth uppercase tracking-wider">
              Monthly income
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Annual gross salary</label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="75,000"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
              />
              <p className="text-[10px] text-muted mt-1">
                Your total yearly income before taxes and deductions
              </p>
            </div>
            <div>
              <label className={labelClass}>Monthly gross income</label>
              <div className={`${inputClass} bg-surface-alt`}>
                {monthlyIncome > 0
                  ? "$" + monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : "--"}
              </div>
              <p className="text-[10px] text-muted mt-1">
                Auto-calculated from annual salary (divided by 12)
              </p>
            </div>
          </div>
        </div>

        {/* Debts Section */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={14} className="text-warning" />
            <span className="text-[11px] font-medium text-earth uppercase tracking-wider">
              Monthly debts
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Car payment</label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="350"
                value={carPayment}
                onChange={(e) => setCarPayment(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Student loans</label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="250"
                value={studentLoans}
                onChange={(e) => setStudentLoans(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Credit card minimums</label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="100"
                value={creditCards}
                onChange={(e) => setCreditCards(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Other monthly debts</label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="0"
                value={otherDebts}
                onChange={(e) => setOtherDebts(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Housing Payment Section */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <DollarSign size={14} className="text-info" />
            <span className="text-[11px] font-medium text-earth uppercase tracking-wider">
              Projected housing payment
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Monthly mortgage / construction payment
              </label>
              <input
                type="text"
                inputMode="decimal"
                className={inputClass}
                placeholder="1,800"
                value={mortgagePayment}
                onChange={(e) => setMortgagePayment(e.target.value)}
              />
              <p className="text-[10px] text-muted mt-1">
                Includes principal, interest, taxes, and insurance (PITI)
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="border-t border-border pt-4">
          <SectionLabel>Results</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <StatCard
              value={hasInput ? formatPercent(frontEndDti) : "--"}
              label="Front-end DTI"
              valueClassName={hasInput ? getDtiStatus(frontEndDti).valueClass : ""}
            />
            <StatCard
              value={hasInput ? formatPercent(backEndDti) : "--"}
              label="Back-end DTI"
              valueClassName={hasInput ? status.valueClass : ""}
            />
            <StatCard
              value={hasInput ? status.label : "--"}
              label="Qualification status"
              valueClassName={hasInput ? status.color : ""}
            />
          </div>

          {hasInput && (
            <div className={`text-[11px] ${status.color} font-medium mb-3`}>
              Your back-end DTI is {formatPercent(backEndDti)}.{" "}
              {backEndDti < 36
                ? "This is well within conventional lending limits."
                : backEndDti <= 43
                  ? "This is within limits for most loan types but may require strong credit."
                  : "This exceeds typical conventional limits. Consider reducing debts or increasing income."}
            </div>
          )}
        </div>
      </Card>

      {/* Loan Type Thresholds */}
      <Card className="mb-4">
        <h4 className="text-[12px] font-medium text-earth mb-3">
          DTI limits by loan type
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">Conventional loan</span>
            <span className="font-data text-earth">43% max back-end DTI</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">FHA loan</span>
            <span className="font-data text-earth">50% max back-end DTI</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">VA loan</span>
            <span className="font-data text-earth">41% max back-end DTI</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">Construction loan</span>
            <span className="font-data text-earth">43-45% typical max</span>
          </div>
        </div>
      </Card>

      {/* Educational Callout */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-[var(--radius)] p-4">
        <h4 className="text-[12px] font-medium text-emerald-900 mb-2">
          What is DTI and why does it matter?
        </h4>
        <p className="text-[11px] text-emerald-800 leading-relaxed mb-2">
          Debt-to-income ratio (DTI) is the percentage of your gross monthly
          income that goes toward paying debts. Lenders use it to gauge whether
          you can take on additional debt responsibly. There are two types:
          front-end DTI measures housing costs only against your income, while
          back-end DTI includes all monthly debt obligations.
        </p>
        <p className="text-[11px] text-emerald-800 leading-relaxed mb-2">
          A lower DTI signals to lenders that you have a healthy balance between
          debt and income. Most conventional lenders look for a back-end DTI
          under 43%, though government-backed programs like FHA may allow up to
          50% with compensating factors such as strong credit or large cash
          reserves.
        </p>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          To improve your DTI, focus on paying off recurring monthly obligations
          (especially car loans or personal loans with higher minimum payments)
          rather than reducing credit card balances with small minimums.
          Increasing documented income through raises or adding a co-borrower
          also lowers your ratio.
        </p>
        <p className="text-[10px] text-emerald-700 italic mt-3">
          This is educational guidance. Consult a licensed professional for your
          specific situation.
        </p>
      </div>
    </>
  );
}
