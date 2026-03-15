import type { DocumentTemplate } from "@keystone/market-data";
import { FileText } from "lucide-react";

interface DocumentTemplateCardProps {
  template: DocumentTemplate;
  onSelect: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  CONTRACT: { bg: "bg-info-bg", text: "text-info" },
  BID: { bg: "bg-warning-bg", text: "text-warning" },
  PERMIT: { bg: "bg-danger-bg", text: "text-danger" },
  PLAN: { bg: "bg-success-bg", text: "text-success" },
  INVOICE: { bg: "bg-info-bg", text: "text-info" },
  RECEIPT: { bg: "bg-success-bg", text: "text-success" },
  REPORT: { bg: "bg-warning-bg", text: "text-warning" },
  CHECKLIST: { bg: "bg-emerald-50", text: "text-emerald-700" },
  LEGAL: { bg: "bg-danger-bg", text: "text-danger" },
  OTHER: { bg: "bg-surface-alt", text: "text-muted" },
};

export function DocumentTemplateCard({ template, onSelect }: DocumentTemplateCardProps) {
  const style = TYPE_STYLES[template.type] ?? TYPE_STYLES.OTHER;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-start gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface hover:border-emerald-300 hover:shadow-[var(--shadow-sm)] transition-all text-left"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
        <FileText size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-earth truncate">{template.name}</span>
          {template.required && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger-bg text-danger font-medium shrink-0">
              Required
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted mt-0.5 line-clamp-2">{template.description}</p>
        <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
          {template.type}
        </span>
      </div>
    </button>
  );
}
