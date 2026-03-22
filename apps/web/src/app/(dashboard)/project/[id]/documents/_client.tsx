"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToDocuments,
  subscribeToProject,
  subscribeToContacts,
  subscribeToBudgetItems,
  addGeneratedDocument,
  addDocument,
  type DocumentData,
  type ProjectData,
  type ContactData,
  type BudgetItemData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";
import { generateDocument } from "@/lib/services/document-generator";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DocumentFillForm } from "@/components/ui/DocumentFillForm";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { FileText, ChevronDown, Plus, FileCheck, Upload } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <div className="flex items-start gap-2 p-2 border border-border rounded-[var(--radius)] bg-surface hover:border-border-dark transition-all card-hover">
      <div
        className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}
      >
        <FileText size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-earth leading-tight">{template.name}</div>
        <div className="text-[9px] text-muted mt-0.5 line-clamp-2 leading-snug">{template.description}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          <span
            className={`text-[8px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}
          >
            {template.type}
          </span>
          {template.required && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-danger-bg text-danger font-medium">
              Required
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onUse(template)}
        className="shrink-0 flex items-center gap-1 px-2 py-1 text-[9px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
      >
        <Plus size={9} />
        Use
      </button>
    </div>
  );
}

const PHASE_NAMES_DOC = ["DEFINE", "FINANCE", "LAND", "DESIGN", "APPROVE", "ASSEMBLE", "BUILD", "VERIFY", "OPERATE"];

export function DocumentsClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItemData[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<"current" | "all">("current");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Document generation flow state
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewTemplateId, setPreviewTemplateId] = useState("");
  const [previewPhase, setPreviewPhase] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !project) return;
    setUploading(true);
    try {
      const { uploadVaultFile } = await import("@/lib/services/vault-upload-service");
      const { fileUrl, fileSize, mimeType } = await uploadVaultFile(user.uid, projectId, file, "document");
      const phaseName = PHASE_NAMES_DOC[project.currentPhase] ?? "DEFINE";
      await addDocument(user.uid, {
        projectId,
        name: file.name.replace(/\.[^.]+$/, ""),
        type: "OTHER",
        fileUrl,
        phase: phaseName,
        date: new Date().toISOString(),
      });
      showToast("Document uploaded", "success");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Subscribe to data
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToDocuments(user.uid, projectId, setDocs);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToProject(user.uid, projectId, setProject);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToContacts(user.uid, projectId, setContacts);
    return unsub;
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToBudgetItems(user.uid, projectId, setBudgetItems);
    return unsub;
  }, [user, projectId]);

  // Count generated documents (those with a templateId field)
  const generatedCount = docs.filter((d) => (d as unknown as Record<string, unknown>).templateId).length;

  useEffect(() => {
    setTopbar(
      project?.name || t("project.documents"),
      `${t("project.documents")} — ${docs.length} files${generatedCount > 0 ? ` / ${generatedCount} generated` : ""}`,
      "info"
    );
  }, [setTopbar, docs.length, generatedCount, project]);

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];

  const templates = useMemo(() => {
    let result: DocumentTemplate[];
    if (phaseFilter === "current") {
      result = getTemplatesForPhase(market, currentPhaseKey);
    } else {
      result = PHASE_ORDER.flatMap((phase) => getTemplatesForPhase(market, phase));
    }
    if (typeFilter !== "ALL") {
      result = result.filter((t) => t.type === typeFilter);
    }
    return result;
  }, [market, currentPhaseKey, phaseFilter, typeFilter]);

  // Step 1: User clicks "Use" on a template -> show fill form
  const handleUseTemplate = useCallback((template: DocumentTemplate) => {
    // Check document generation permission (admin bypasses)
    if (profile?.role !== "admin") {
      const limits = getPlanLimits((profile?.plan as PlanTier) ?? "FOUNDATION");
      if (!limits.docGen) {
        showToast("Document generation requires a Builder plan or higher.", "error");
        return;
      }
    }
    setSelectedTemplate(template);
  }, [profile, showToast]);

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
    if (saving || !user) return;
    setSaving(true);
    try {
      await addGeneratedDocument(user.uid, {
        projectId,
        name: previewTitle,
        type: previewType,
        phase: previewPhase,
        templateId: previewTemplateId,
        generatedAt: new Date().toISOString(),
      });
      setPreviewHtml(null);
      showToast("Document saved to project", "success");
    } catch (err) {
      showToast("Failed to save generated document", "error");
    } finally {
      setSaving(false);
    }
  }, [saving, user, projectId, previewTitle, previewType, previewPhase, previewTemplateId]);

  const handleClosePreview = useCallback(() => {
    setPreviewHtml(null);
  }, []);

  const handleCancelForm = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  return (
    <>
      <PageHeader
        title={t("project.documents")}
        projectName={project?.name}
        projectId={projectId}
        subtitle={`${docs.length} document${docs.length !== 1 ? "s" : ""}`}
      />

      {/* Stats row + upload */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1.5 border border-border rounded-[var(--radius)] bg-surface">
          <FileText size={11} className="text-muted" />
          <span className="text-[10px] text-earth font-medium font-data">{docs.length}</span>
          <span className="text-[9px] text-muted">total</span>
        </div>
        {generatedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 border border-border rounded-[var(--radius)] bg-surface">
            <FileCheck size={11} className="text-success" />
            <span className="text-[10px] text-earth font-medium font-data">{generatedCount}</span>
            <span className="text-[9px] text-muted">generated</span>
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors text-[10px] font-medium ml-auto disabled:opacity-40"
        >
          <Upload size={11} />
          {uploading ? "Uploading..." : "Upload document"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Template Library */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <SectionLabel>Template library</SectionLabel>
          <div className="relative">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as "current" | "all")}
              className="appearance-none pr-6 pl-2 py-1 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
            >
              <option value="current">
                Current phase ({PHASE_NAMES[currentPhaseKey]})
              </option>
              <option value="all">All phases</option>
            </select>
            <ChevronDown
              size={10}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
          </div>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
          {["ALL", "CONTRACT", "CHECKLIST", "REPORT", "PERMIT", "BID", "LEGAL"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-0.5 text-[9px] rounded-full whitespace-nowrap transition-all duration-150 ${
                typeFilter === type
                  ? "bg-earth text-warm font-medium"
                  : "bg-surface border border-border text-muted hover:border-border-dark hover:text-earth"
              }`}
            >
              {type === "ALL" ? "All types" : type.charAt(0) + type.slice(1).toLowerCase() + "s"}
            </button>
          ))}
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 border border-dashed border-border rounded-[var(--radius)] bg-surface">
            <FileText size={20} className="text-sand" />
            <p className="text-[11px] text-muted">
              No templates for {phaseFilter === "current" ? `the ${PHASE_NAMES[currentPhaseKey]} phase` : "the selected filters"}.
            </p>
            <div className="flex gap-2">
              {phaseFilter === "current" && (
                <button
                  onClick={() => setPhaseFilter("all")}
                  className="text-[10px] font-medium text-clay hover:text-earth transition-colors underline underline-offset-2"
                >
                  Browse all phases
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-medium text-clay hover:text-earth transition-colors underline underline-offset-2"
              >
                Upload your own document
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 animate-stagger">
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
        <EmptyState
          icon={<FileText size={24} />}
          title="No documents yet"
          description="Use a template above or upload your own files to get started."
        />
      ) : (
        <div className="space-y-0">
          {docs.map((doc, i) => {
            const style = TYPE_COLORS[doc.type] ?? TYPE_COLORS.DEFAULT;
            const isGenerated = !!(doc as unknown as Record<string, unknown>).templateId;
            return (
              <div
                key={doc.id}
                className={`flex items-center gap-2 py-2 cursor-pointer hover:bg-warm/50 transition-colors rounded-[var(--radius)] px-1 ${
                  i < docs.length - 1 ? "border-b border-border" : ""
                }`}
                onClick={() => {
                  if (doc.fileUrl) {
                    window.open(doc.fileUrl, "_blank");
                  }
                }}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}
                >
                  <FileText size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-[11px] font-medium text-earth truncate">{doc.name}</div>
                    {isGenerated && (
                      <FileCheck size={9} className="text-success shrink-0" />
                    )}
                  </div>
                  <div className="text-[9px] text-muted">
                    {doc.phase} / {doc.date}
                  </div>
                </div>
                {doc.fileUrl ? (
                  <span
                    className="text-[9px] text-clay font-medium cursor-pointer hover:underline shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(doc.fileUrl, "_blank");
                    }}
                  >
                    View
                  </span>
                ) : (
                  <button
                    className="text-[9px] text-clay font-medium cursor-pointer hover:underline shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Attach file
                  </button>
                )}
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
