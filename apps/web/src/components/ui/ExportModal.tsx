"use client";

import { useState } from "react";
import {
  FileText,
  Table2,
  Users,
  ClipboardList,
  Database,
  FileBarChart,
  X,
  Loader2,
} from "lucide-react";
import type { ProjectData } from "@/lib/services/project-service";
import type { ExportData } from "@/lib/services/export-service";
import {
  exportProjectPDF,
  exportBudgetCSV,
  exportContactsCSV,
  exportDailyLogsCSV,
  exportProjectJSON,
  exportQuickSummary,
} from "@/lib/services/export-service";

interface ExportModalProps {
  project: ProjectData;
  data: ExportData;
  onClose: () => void;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: React.ReactNode;
  action: () => void;
}

export function ExportModal({ project, data, onClose }: ExportModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(id: string, action: () => void) {
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

  const options: ExportOption[] = [
    {
      id: "pdf-full",
      title: "Full Project Report (PDF)",
      description:
        "Professional report with budget, timeline, team, and progress photos",
      buttonLabel: "Generate Report",
      icon: <FileText size={20} className="text-clay" />,
      action: () => exportProjectPDF(project, data),
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
      action: () => exportQuickSummary(project, data),
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
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
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

        {/* Export option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt) => {
            const isLoading = loading === opt.id;
            return (
              <div
                key={opt.id}
                className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
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
