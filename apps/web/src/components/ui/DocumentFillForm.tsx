"use client";

import { useState, useMemo } from "react";
import type { DocumentTemplate } from "@keystone/market-data";
import type { ProjectData, ContactData, BudgetItemData } from "@/lib/services/project-service";
import { X, FileText, ArrowRight, Info } from "lucide-react";

interface DocumentFillFormProps {
  template: DocumentTemplate;
  project: ProjectData;
  contacts: ContactData[];
  budgetItems: BudgetItemData[];
  onGenerate: (customFields: Record<string, string>) => void;
  onCancel: () => void;
}

/**
 * Try to auto-fill a field from the project data, contacts, or budget.
 * Returns the pre-filled value or empty string.
 */
function autoFill(
  field: string,
  project: ProjectData,
  contacts: ContactData[],
  budgetItems: BudgetItemData[]
): string {
  const fl = field.toLowerCase();

  // Project name / address
  if (fl.includes("project name") || fl.includes("project address") || fl.includes("project description")) {
    if (fl.includes("address") || fl.includes("location")) {
      return project.details ?? "";
    }
    return project.name ?? "";
  }

  // Owner
  if (fl.includes("owner") || fl.includes("maitre d'ouvrage") || fl.includes("borrower") || fl.includes("payer") || fl.includes("applicant") || fl.includes("client")) {
    return project.name ?? "";
  }

  // Contractor info
  if (fl.includes("contractor") || fl.includes("entrepreneur") || fl.includes("chef de chantier")) {
    const contractor = contacts.find(
      (c) =>
        c.role.toLowerCase().includes("contractor") ||
        c.role.toLowerCase().includes("chef") ||
        c.role.toLowerCase().includes("entreprise")
    );
    if (contractor) return contractor.name;
    return "";
  }

  // Dates
  if (fl.includes("start date") || fl.includes("date de debut")) {
    return "";
  }
  if (fl.includes("completion date") || fl.includes("date d'achevement")) {
    return "";
  }

  // Contract / budget amounts
  if (fl.includes("contract price") || fl.includes("total contract") || fl.includes("montant total") || fl.includes("total amount")) {
    if (project.totalBudget) {
      const currency = project.currency ?? "USD";
      if (currency === "XOF" || currency === "CFA") {
        return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(project.totalBudget) + " FCFA";
      }
      return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(project.totalBudget);
    }
    return "";
  }

  // Percentage completion
  if (fl.includes("percentage") || fl.includes("completion")) {
    if (project.progress) return `${project.progress}%`;
    return "";
  }

  return "";
}

export function DocumentFillForm({
  template,
  project,
  contacts,
  budgetItems,
  onGenerate,
  onCancel,
}: DocumentFillFormProps) {
  // Build initial field values with auto-fill
  const initialValues = useMemo(() => {
    const vals: Record<string, string> = {};
    template.fields.forEach((field) => {
      vals[field] = autoFill(field, project, contacts, budgetItems);
    });
    return vals;
  }, [template.fields, project, contacts, budgetItems]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate(values);
  }

  const filledCount = Object.values(values).filter((v) => v.trim().length > 0).length;
  const totalFields = template.fields.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="absolute inset-0" onClick={onCancel} />

      <div className="relative z-10 flex flex-col w-full max-w-[560px] max-h-[88vh] mx-4 bg-surface border border-border rounded-[var(--radius)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cream shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-info-bg text-info shrink-0">
              <FileText size={14} />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-earth truncate">
                {template.name}
              </div>
              <div className="text-[10px] text-muted">
                Fill in details to generate document
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-7 h-7 rounded-[var(--radius)] text-muted hover:text-earth hover:bg-warm transition-colors shrink-0"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-start gap-2">
          <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-emerald-800 leading-relaxed">
            Fields have been pre-filled from your project data where possible.
            Fill in remaining fields or leave blank to show fill-in lines on the
            printed document. You can always edit after printing.
          </p>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted">
              {filledCount} of {totalFields} fields filled
            </span>
            <span className="text-[10px] font-data text-earth font-medium">
              {totalFields > 0
                ? Math.round((filledCount / totalFields) * 100)
                : 0}
              %
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${totalFields > 0 ? (filledCount / totalFields) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {template.fields.map((field, i) => {
              const isLong =
                field.toLowerCase().includes("description") ||
                field.toLowerCase().includes("scope") ||
                field.toLowerCase().includes("notes") ||
                field.toLowerCase().includes("checklist") ||
                field.toLowerCase().includes("list of");
              return (
                <div key={i}>
                  <label className="block text-[11px] font-medium text-earth mb-1">
                    {field}
                  </label>
                  {isLong ? (
                    <textarea
                      value={values[field] ?? ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 resize-y"
                      placeholder={`Enter ${field.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[field] ?? ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                      placeholder={`Enter ${field.toLowerCase()}...`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-cream shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-[10px] font-medium border border-border rounded-[var(--radius)] bg-surface text-muted hover:text-earth hover:bg-warm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
            >
              Generate Document
              <ArrowRight size={10} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
