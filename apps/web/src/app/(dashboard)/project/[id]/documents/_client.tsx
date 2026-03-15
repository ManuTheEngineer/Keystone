"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToDocuments,
  subscribeToProject,
  subscribeToContacts,
  subscribeToBudgetItems,
  addGeneratedDocument,
  type DocumentData,
  type ProjectData,
  type ContactData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import { generateDocument } from "@/lib/services/document-generator";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { DocumentFillForm } from "@/components/ui/DocumentFillForm";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { FileText, ChevronDown, Plus, FileCheck } from "lucide-react";
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
  BID: { bg: "bg-info-bg", text: "text-info" },
  CHECKLIST: { bg: "bg-success-bg", text: "text-success" },
  RECEIPT: { bg: "bg-warning-bg", text: "text-warning" },
  OTHER: { bg: "bg-info-bg", text: "text-info" },
  DEFAULT: { bg: "bg-info-bg", text: "text-info" },
};

function DocumentTemplateCard({
  template,
  onUse,
}: {
  template: DocumentTemplate;
  onUse: (template: DocumentTemplate) => void;
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
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
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
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<"current" | "all">("current");

  // Document generation flow state
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewTemplateId, setPreviewTemplateId] = useState("");
  const [previewPhase, setPreviewPhase] = useState("");
  const [saving, setSaving] = useState(false);

  // Subscribe to data
  useEffect(() => {
    const unsub = subscribeToDocuments(projectId, setDocs);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const unsub = subscribeToProject(projectId, setProject);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const unsub = subscribeToContacts(projectId, setContacts);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    const unsub = subscribeToBudgetItems(projectId, setBudgetItems);
    return unsub;
  }, [projectId]);

  // Count generated documents (those with a templateId field)
  const generatedCount = docs.filter((d) => (d as unknown as Record<string, unknown>).templateId).length;

  useEffect(() => {
    setTopbar(
      "Documents",
      `${docs.length} files${generatedCount > 0 ? ` / ${generatedCount} generated` : ""}`,
      "info"
    );
  }, [setTopbar, docs.length, generatedCount]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];

  const templates = useMemo(() => {
    if (phaseFilter === "current") {
      return getTemplatesForPhase(market, currentPhaseKey);
    }
    return PHASE_ORDER.flatMap((phase) => getTemplatesForPhase(market, phase));
  }, [market, currentPhaseKey, phaseFilter]);

  // Step 1: User clicks "Use" on a template -> show fill form
  const handleUseTemplate = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
  }, []);

  // Step 2: User fills form and clicks "Generate" -> generate HTML and show preview
  const handleGenerate = useCallback(
    (customFields: Record<string, string>) => {
      if (!selectedTemplate || !project) return;

      const html = generateDocument(selectedTemplate, {
        project,
        contacts,
        budgetItems,
        customFields,
      });

      setPreviewHtml(html);
      setPreviewTitle(selectedTemplate.name);
      setPreviewType(selectedTemplate.type);
      setPreviewTemplateId(selectedTemplate.id);
      setPreviewPhase(PHASE_NAMES[selectedTemplate.phase]);
      setSelectedTemplate(null);
    },
    [selectedTemplate, project, contacts, budgetItems]
  );

  // Step 3: User clicks "Save to project" in preview -> save metadata to Firebase
  const handleSaveToProject = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await addGeneratedDocument({
        projectId,
        name: previewTitle,
        type: previewType,
        phase: previewPhase,
        templateId: previewTemplateId,
        generatedAt: new Date().toISOString(),
      });
      setPreviewHtml(null);
    } catch (err) {
      console.error("Failed to save generated document:", err);
    } finally {
      setSaving(false);
    }
  }, [saving, projectId, previewTitle, previewType, previewPhase, previewTemplateId]);

  const handleClosePreview = useCallback(() => {
    setPreviewHtml(null);
  }, []);

  const handleCancelForm = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  return (
    <>
      {/* Stats row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-[var(--radius)] bg-surface">
          <FileText size={12} className="text-muted" />
          <span className="text-[11px] text-earth font-medium font-data">{docs.length}</span>
          <span className="text-[10px] text-muted">total</span>
        </div>
        {generatedCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-[var(--radius)] bg-surface">
            <FileCheck size={12} className="text-emerald-600" />
            <span className="text-[11px] text-earth font-medium font-data">{generatedCount}</span>
            <span className="text-[10px] text-muted">generated</span>
          </div>
        )}
      </div>

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
            const isGenerated = !!(doc as unknown as Record<string, unknown>).templateId;
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
                  <div className="flex items-center gap-1.5">
                    <div className="text-[13px] font-medium text-earth truncate">{doc.name}</div>
                    {isGenerated && (
                      <FileCheck size={10} className="text-emerald-600 shrink-0" />
                    )}
                  </div>
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

      {/* Document Fill Form modal */}
      {selectedTemplate && project && (
        <DocumentFillForm
          template={selectedTemplate}
          project={project}
          contacts={contacts}
          budgetItems={budgetItems}
          onGenerate={handleGenerate}
          onCancel={handleCancelForm}
        />
      )}

      {/* Document Preview modal */}
      {previewHtml && (
        <DocumentPreview
          html={previewHtml}
          title={previewTitle}
          type={previewType}
          onClose={handleClosePreview}
          onSave={handleSaveToProject}
        />
      )}
    </>
  );
}
