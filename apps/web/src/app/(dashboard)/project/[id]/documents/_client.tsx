"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToDocuments,
  subscribeToProject,
  addDocument,
  type DocumentData,
  type ProjectData,
} from "@/lib/services/project-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { FileText, ChevronDown, Plus } from "lucide-react";
import {
  getTemplatesForPhase,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, ProjectPhase, DocumentTemplate } from "@keystone/market-data";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  CONTRACT: { bg: "bg-info-bg", text: "text-info" },
  LEGAL: { bg: "bg-success-bg", text: "text-success" },
  PLAN: { bg: "bg-warning-bg", text: "text-warning" },
  PERMIT: { bg: "bg-danger-bg", text: "text-danger" },
  INVOICE: { bg: "bg-success-bg", text: "text-success" },
  REPORT: { bg: "bg-warning-bg", text: "text-warning" },
  DEFAULT: { bg: "bg-info-bg", text: "text-info" },
};

function DocumentTemplateCard({
  template,
  onUse,
  creating,
}: {
  template: DocumentTemplate;
  onUse: (template: DocumentTemplate) => void;
  creating: boolean;
}) {
  const style = TYPE_COLORS[template.type] ?? TYPE_COLORS.DEFAULT;
  return (
    <div className="flex items-start gap-3 p-3 border border-border rounded-[var(--radius)] bg-surface hover:border-border-dark transition-all">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}
      >
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium text-earth">{template.name}</div>
        <div className="text-[10px] text-muted mt-0.5 line-clamp-2">{template.description}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}
          >
            {template.type}
          </span>
          {template.required && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-danger-bg text-danger font-medium">
              Required
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onUse(template)}
        disabled={creating}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
      >
        <Plus size={10} />
        Use
      </button>
    </div>
  );
}

export function DocumentsClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<"current" | "all">("current");
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  useEffect(() => {
    const unsub = subscribeToDocuments(projectId, setDocs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const unsub = subscribeToProject(projectId, setProject);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("Documents", `${docs.length} files`, "info");
  }, [setTopbar, docs.length]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];

  const templates = useMemo(() => {
    if (phaseFilter === "current") {
      return getTemplatesForPhase(market, currentPhaseKey);
    }
    // Show templates for all phases
    return PHASE_ORDER.flatMap((phase) => getTemplatesForPhase(market, phase));
  }, [market, currentPhaseKey, phaseFilter]);

  async function handleUseTemplate(template: DocumentTemplate) {
    if (creatingTemplate) return;
    setCreatingTemplate(true);
    try {
      const date = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      await addDocument({
        projectId,
        name: template.name,
        phase: PHASE_NAMES[template.phase],
        date,
        type: template.type,
      });
    } catch (err) {
      console.error("Failed to create document from template:", err);
    } finally {
      setCreatingTemplate(false);
    }
  }

  return (
    <>
      {/* Template Library */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Template library</SectionLabel>
          <div className="relative">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as "current" | "all")}
              className="appearance-none pr-6 pl-2 py-1 text-[11px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="current">
                Current phase ({PHASE_NAMES[currentPhaseKey]})
              </option>
              <option value="all">All phases</option>
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>

        {templates.length === 0 ? (
          <Card padding="md" className="text-center">
            <p className="text-[12px] text-muted">
              No document templates available for{" "}
              {phaseFilter === "current"
                ? `the ${PHASE_NAMES[currentPhaseKey]} phase`
                : "any phase"}
              .
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <DocumentTemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                creating={creatingTemplate}
              />
            ))}
          </div>
        )}
      </div>

      {/* All project documents */}
      <SectionLabel>All project documents</SectionLabel>
      {docs.length === 0 ? (
        <Card padding="md" className="text-center">
          <p className="text-[12px] text-muted">
            No documents yet. Use templates above or documents will appear as you progress
            through project phases.
          </p>
        </Card>
      ) : (
        <div className="space-y-0">
          {docs.map((doc, i) => {
            const style = TYPE_COLORS[doc.type] ?? TYPE_COLORS.DEFAULT;
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-3 py-2.5 cursor-pointer ${
                  i < docs.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}
                >
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-earth truncate">{doc.name}</div>
                  <div className="text-[10px] text-muted">
                    {doc.phase} / {doc.date}
                  </div>
                </div>
                <span className="text-[10px] text-info cursor-pointer hover:underline shrink-0">
                  View
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
