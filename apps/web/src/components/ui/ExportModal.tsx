"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Table2,
  Users,
  ClipboardList,
  Database,
  FileBarChart,
  Briefcase,
  X,
  Loader2,
} from "lucide-react";
import type { ProjectData } from "@/lib/services/project-service";
import type { ExportData } from "@/lib/services/export-service";
import type { FullProjectExportData } from "@/lib/services/export-data-gatherer";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";
import {
  exportProjectPDF,
  exportBudgetCSV,
  exportContactsCSV,
  exportDailyLogsCSV,
  exportProjectJSON,
  exportQuickSummary,
} from "@/lib/services/export-service";
import { openPresentation } from "@/lib/services/presentation-service";
import type { PresentationData } from "@/lib/services/presentation-service";
import { getMarketData } from "@keystone/market-data";
import type { Market } from "@keystone/market-data";

interface ExportModalProps {
  project: ProjectData;
  data: ExportData;
  onClose: () => void;
  userPlan?: string;
  userRole?: string;
  orgLogo?: string | null;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: React.ReactNode;
  action: () => void;
}

export function ExportModal({ project, data, onClose, userPlan, userRole, orgLogo }: ExportModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleExport(id: string, action: () => void) {
    // Check export permission (admin bypasses)
    if (userRole !== "admin" && userPlan) {
      const limits = getPlanLimits(userPlan as PlanTier);
      if (!limits.export) {
        setExportError("Export requires a Builder plan or higher.");
        return;
      }
    }
    setExportError("");
    setLoading(id);
    try {
      // Small delay to show the loading state before the browser
      // opens a print dialog or triggers a download
      await new Promise((resolve) => setTimeout(resolve, 200));
      action();
    } finally {
      // Keep loading state briefly for feedback
      setTimeout(() => setLoading(null), 600);
    }
  }

  // Build presentation data from export data
  const marketData = getMarketData(project.market as Market);
  const presData: PresentationData = {
    project,
    budgetItems: data.budgetItems,
    contacts: data.contacts,
    dailyLogs: data.dailyLogs,
    tasks: data.tasks,
    photos: data.photos,
    punchListItems: data.punchListItems,
    currency: marketData.currency,
    marketName: project.market,
    constructionMethod: marketData.phases[0]?.constructionMethod ?? "Standard construction",
  };

  // Build FullProjectExportData for PDF functions from available data
  const PHASE_NAMES = ["Define", "Finance", "Land", "Design", "Approve", "Assemble", "Build", "Verify", "Operate"];
  const totalEstimated = data.budgetItems.reduce((s, b) => s + b.estimated, 0);
  const totalActual = data.budgetItems.reduce((s, b) => s + b.actual, 0);
  const totalBudget = project.totalBudget || totalEstimated;
  const totalSpent = project.totalSpent || totalActual;
  const remaining = totalBudget - totalSpent;
  const weeksElapsed = project.currentWeek || 1;
  const burnRate = totalSpent / weeksElapsed;
  const remainingWeeks = Math.max((project.totalWeeks || weeksElapsed) - weeksElapsed, 0);
  const projectedFinalCost = totalSpent + burnRate * remainingWeeks;
  const openPunch = data.punchListItems.filter((p) => p.status !== "resolved");

  const fullExportData: FullProjectExportData = {
    project,
    currency: marketData.currency,
    marketName: project.market,
    constructionMethod: marketData.phases[0]?.constructionMethod ?? "Standard construction",
    budgetItems: data.budgetItems,
    contacts: data.contacts,
    dailyLogs: data.dailyLogs,
    tasks: data.tasks,
    photos: data.photos,
    inspectionResults: data.inspectionResults,
    punchListItems: data.punchListItems,
    materials: data.materials,
    documents: data.documents,
    vaultFiles: [],
    financingSummary: {
      type: project.financingType ?? "Unknown",
      landCost: project.landCost ?? 0,
      dealScore: project.dealScore ?? null,
      totalBudget,
      totalSpent,
      remaining,
      burnRate: Math.round(burnRate),
      projectedFinalCost: Math.round(projectedFinalCost),
    },
    phaseTimeline: PHASE_NAMES.map((name, idx) => ({
      phase: idx,
      name,
      status: idx < project.currentPhase ? "completed" as const : idx === project.currentPhase ? "in-progress" as const : "upcoming" as const,
      tasksTotal: idx === project.currentPhase ? data.tasks.length : 0,
      tasksDone: idx === project.currentPhase ? data.tasks.filter((t) => t.done).length : 0,
    })),
    riskAssessment: (() => {
      const risks: FullProjectExportData["riskAssessment"] = [];
      if (totalBudget > 0 && totalSpent > totalBudget) {
        risks.push({ level: "critical", title: "Budget exceeded", detail: `Spent exceeds budget by ${(((totalSpent - totalBudget) / totalBudget) * 100).toFixed(1)}%.` });
      } else if (totalBudget > 0 && totalSpent > totalBudget * 0.9) {
        risks.push({ level: "warning", title: "Budget nearly exhausted", detail: `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget consumed.` });
      }
      const criticalPunch = openPunch.filter((p) => p.severity === "critical");
      if (criticalPunch.length > 0) {
        risks.push({ level: "critical", title: `${criticalPunch.length} critical punch list items`, detail: "Unresolved critical issues require immediate attention." });
      } else if (openPunch.length > 5) {
        risks.push({ level: "warning", title: `${openPunch.length} open punch list items`, detail: "A growing backlog may delay completion." });
      }
      if (risks.length === 0) {
        risks.push({ level: "info", title: "No significant risks detected", detail: "Budget, schedule, and punch list metrics are within normal ranges." });
      }
      return risks;
    })(),
    aiSummary: `${project.name} is a ${project.propertyType} project in ${project.city || project.market}. Currently ${project.progress}% complete in the ${PHASE_NAMES[project.currentPhase] || "current"} phase. Budget: ${totalSpent.toLocaleString()} of ${totalBudget.toLocaleString()} (${totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% utilized). ${openPunch.length} punch list items remain open.`,
    orgLogo: orgLogo ?? null,
    generatedAt: new Date().toISOString(),
  };

  const options: ExportOption[] = [
    {
      id: "pres-investor",
      title: "Investor Briefing (PDF)",
      description:
        "10-slide presentation for investors or lenders with financials, risks, and photos",
      buttonLabel: "Generate Briefing",
      icon: <Briefcase size={20} className="text-clay" />,
      action: () => openPresentation("investor", presData),
    },
    {
      id: "pres-team",
      title: "Team Briefing (PDF)",
      description:
        "Weekly team update with tasks, schedule, issues, and next steps",
      buttonLabel: "Generate Briefing",
      icon: <Users size={20} className="text-clay" />,
      action: () => openPresentation("team", presData),
    },
    {
      id: "pdf-full",
      title: "Full Project Report (PDF)",
      description:
        "Professional report with budget, timeline, team, and progress photos",
      buttonLabel: "Generate Report",
      icon: <FileText size={20} className="text-clay" />,
      action: () => exportProjectPDF(fullExportData),
    },
    {
      id: "csv-budget",
      title: "Budget Spreadsheet (CSV)",
      description:
        "Budget items with estimated vs actual costs for Excel or Google Sheets",
      buttonLabel: "Download CSV",
      icon: <Table2 size={20} className="text-clay" />,
      action: () => exportBudgetCSV(data.budgetItems, project),
    },
    {
      id: "csv-contacts",
      title: "Contact List (CSV)",
      description:
        "Team roster with names, roles, phone numbers, and ratings",
      buttonLabel: "Download CSV",
      icon: <Users size={20} className="text-clay" />,
      action: () => exportContactsCSV(data.contacts),
    },
    {
      id: "csv-logs",
      title: "Daily Logs (CSV)",
      description:
        "Construction diary with weather, crew, and daily notes",
      buttonLabel: "Download CSV",
      icon: <ClipboardList size={20} className="text-clay" />,
      action: () => exportDailyLogsCSV(data.dailyLogs),
    },
    {
      id: "json-backup",
      title: "Complete Data (JSON)",
      description:
        "Full project backup including all data for archival or migration",
      buttonLabel: "Download JSON",
      icon: <Database size={20} className="text-clay" />,
      action: () => exportProjectJSON(project, data),
    },
    {
      id: "pdf-summary",
      title: "Quick Summary (PDF)",
      description:
        "One-page executive summary with key metrics and status",
      buttonLabel: "Generate Summary",
      icon: <FileBarChart size={20} className="text-clay" />,
      action: () => exportQuickSummary(fullExportData),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-earth/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-surface rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2
              className="text-[20px] text-earth"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Export Project Data
            </h2>
            <p className="text-[12px] text-muted mt-0.5">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-earth hover:bg-warm transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan limit error */}
        {exportError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-bg border border-danger/20 mb-4">
            <p className="text-[12px] text-danger leading-relaxed">{exportError}</p>
          </div>
        )}

        {/* Export option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isLoading = loading === opt.id;
            return (
              <div
                key={opt.id}
                className="bg-surface border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center mb-3">
                  {opt.icon}
                </div>

                {/* Title */}
                <h3 className="text-[13px] font-semibold text-earth mb-1">
                  {opt.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-muted leading-relaxed mb-3">
                  {opt.description}
                </p>

                {/* Action button */}
                <button
                  onClick={() => handleExport(opt.id, opt.action)}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    opt.buttonLabel
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
