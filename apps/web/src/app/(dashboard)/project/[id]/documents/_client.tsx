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
  deleteDocument,
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
import { DocumentFillForm } from "@/components/ui/DocumentFillForm";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import {
  FileText,
  ChevronDown,
  Plus,
  FileCheck,
  Upload,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  X,
  Search,
  Filter,
  FileSpreadsheet,
  File,
  Image,
} from "lucide-react";
import {
  getTemplatesForPhase,
  getMarketData,
  PHASE_ORDER,
  PHASE_NAMES,
} from "@keystone/market-data";
import type { Market, ProjectPhase, DocumentTemplate } from "@keystone/market-data";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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

const DOC_TYPES = ["ALL", "CONTRACT", "PERMIT", "PLAN", "INVOICE", "RECEIPT", "BID", "CHECKLIST", "REPORT", "LEGAL", "OTHER"] as const;

const PHASE_NAMES_DOC = ["DEFINE", "FINANCE", "LAND", "DESIGN", "APPROVE", "ASSEMBLE", "BUILD", "VERIFY", "OPERATE"];

function formatFileSize(bytes?: number): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "--";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getFileIcon(mimeType?: string, name?: string) {
  if (mimeType?.startsWith("image/") || name?.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
    return <Image size={12} />;
  }
  if (mimeType === "application/pdf" || name?.match(/\.pdf$/i)) {
    return <FileText size={12} />;
  }
  if (mimeType?.includes("spreadsheet") || name?.match(/\.(xls|xlsx|csv)$/i)) {
    return <FileSpreadsheet size={12} />;
  }
  return <File size={12} />;
}

/* ------------------------------------------------------------------ */
/*  Upload Modal                                                       */
/* ------------------------------------------------------------------ */

function UploadModal({
  open,
  onClose,
  onUpload,
  uploading,
  contacts,
  currentPhase,
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File, type: string, phase: string, contactId?: string) => void;
  uploading: boolean;
  contacts: ContactData[];
  currentPhase: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("OTHER");
  const [phase, setPhase] = useState(currentPhase);
  const [contactId, setContactId] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setType("OTHER");
      setPhase(currentPhase);
      setContactId("");
    }
  }, [open, currentPhase]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius)] shadow-xl w-full max-w-[420px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-[12px] font-semibold text-earth">Upload Document</span>
          <button onClick={onClose} className="text-muted hover:text-earth transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {/* File input */}
          <div>
            <label className="text-[9px] font-medium text-muted uppercase tracking-wide">File</label>
            <div
              className="mt-1 border border-dashed border-border rounded-[var(--radius)] p-3 text-center cursor-pointer hover:border-clay transition-colors bg-surface"
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={14} className="text-clay" />
                  <span className="text-[11px] text-earth font-medium truncate max-w-[250px]">{file.name}</span>
                  <span className="text-[9px] text-muted font-data">{formatFileSize(file.size)}</span>
                </div>
              ) : (
                <>
                  <Upload size={16} className="text-sand mx-auto mb-1" />
                  <p className="text-[10px] text-muted">Click to select a file</p>
                  <p className="text-[8px] text-muted/60 mt-0.5">PDF, DOC, XLS, PNG, JPG, TXT</p>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* Type + Phase row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-medium text-muted uppercase tracking-wide">Type</label>
              <div className="relative mt-1">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none pr-6 pl-2 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
                >
                  {DOC_TYPES.filter((t) => t !== "ALL").map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-medium text-muted uppercase tracking-wide">Phase</label>
              <div className="relative mt-1">
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full appearance-none pr-6 pl-2 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
                >
                  {PHASE_ORDER.map((p) => (
                    <option key={p} value={p}>{PHASE_NAMES[p]}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Contractor link (optional) */}
          {contacts.length > 0 && (
            <div>
              <label className="text-[9px] font-medium text-muted uppercase tracking-wide">Link to contractor (optional)</label>
              <div className="relative mt-1">
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full appearance-none pr-6 pl-2 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
                >
                  <option value="">None</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}{c.role ? ` (${c.role})` : ""}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[10px] font-medium text-muted border border-border rounded-[var(--radius)] hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!file || uploading}
            onClick={() => file && onUpload(file, type, phase, contactId || undefined)}
            className="px-3 py-1.5 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors disabled:opacity-40"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Document Viewer Modal                                              */
/* ------------------------------------------------------------------ */

function DocViewerModal({ doc, onClose }: { doc: DocumentData; onClose: () => void }) {
  const url = doc.fileUrl;
  const isPdf = url?.match(/\.pdf($|\?)/i);
  const isImage = url?.match(/\.(png|jpg|jpeg|gif|webp)($|\?)/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[var(--radius)] shadow-xl w-full max-w-[800px] max-h-[85vh] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <span className="text-[12px] font-semibold text-earth truncate">{doc.name}</span>
          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                download
                className="text-[9px] font-medium text-clay hover:text-earth transition-colors flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={10} />
                Download
              </a>
            )}
            <button onClick={onClose} className="text-muted hover:text-earth transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 min-h-0">
          {isPdf && url ? (
            <iframe src={url} className="w-full h-full min-h-[500px] rounded border border-border" />
          ) : isImage && url ? (
            <img src={url} alt={doc.name} className="max-w-full max-h-[70vh] mx-auto rounded" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={32} className="text-sand mb-2" />
              <p className="text-[11px] text-muted mb-3">Preview not available for this file type.</p>
              {url && (
                <a
                  href={url}
                  download
                  className="px-3 py-1.5 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
                >
                  Download file
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template Card (compact, for grid)                                  */
/* ------------------------------------------------------------------ */

function TemplateCard({
  template,
  onUse,
}: {
  template: DocumentTemplate;
  onUse: (template: DocumentTemplate) => void;
}) {
  const style = TYPE_COLORS[template.type] ?? TYPE_COLORS.DEFAULT;
  return (
    <div className="flex flex-col p-2.5 border border-border rounded-[var(--radius)] bg-surface hover:border-border-dark transition-all card-hover">
      <div className="flex items-start gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
          <FileText size={11} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-earth leading-tight line-clamp-1">{template.name}</div>
          <div className="text-[8px] text-muted mt-0.5 line-clamp-1 leading-snug">{template.description}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1">
          <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${style.bg} ${style.text} font-medium`}>
            {template.type}
          </span>
          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-surface border border-border text-muted font-medium">
            {PHASE_NAMES[template.phase]}
          </span>
          {template.required && (
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-danger-bg text-danger font-medium">
              Required
            </span>
          )}
        </div>
        <button
          onClick={() => onUse(template)}
          className="flex items-center gap-0.5 px-2 py-0.5 text-[8px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
        >
          <Plus size={8} />
          Generate
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Client Component                                              */
/* ------------------------------------------------------------------ */

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

  // Tab state
  const [activeTab, setActiveTab] = useState<"documents" | "templates">("documents");

  // My Documents filters
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [docSearch, setDocSearch] = useState("");

  // Templates filters
  const [templatePhaseFilter, setTemplatePhaseFilter] = useState<ProjectPhase | "ALL">("ALL");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("ALL");

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Viewer modal
  const [viewingDoc, setViewingDoc] = useState<DocumentData | null>(null);

  // Document generation flow state
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewTemplateId, setPreviewTemplateId] = useState("");
  const [previewPhase, setPreviewPhase] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---- Data subscriptions ---- */

  useEffect(() => {
    if (!user) return;
    return subscribeToDocuments(user.uid, projectId, setDocs);
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToProject(user.uid, projectId, setProject);
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToContacts(user.uid, projectId, setContacts);
  }, [user, projectId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToBudgetItems(user.uid, projectId, setBudgetItems);
  }, [user, projectId]);

  /* ---- Derived data ---- */

  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey: ProjectPhase = PHASE_ORDER[project?.currentPhase ?? 0];
  const generatedCount = docs.filter((d) => (d as unknown as Record<string, unknown>).templateId).length;
  const uploadedCount = docs.filter((d) => d.fileUrl).length;

  // Required documents for current phase (from templates marked as required)
  const requiredTemplates = useMemo(() => {
    return getTemplatesForPhase(market, currentPhaseKey).filter((t) => t.required);
  }, [market, currentPhaseKey]);

  const missingRequired = useMemo(() => {
    return requiredTemplates.filter((tmpl) => {
      return !docs.some((d) =>
        (d as unknown as Record<string, unknown>).templateId === tmpl.id ||
        (d.type === tmpl.type && d.phase === PHASE_NAMES[tmpl.phase])
      );
    });
  }, [requiredTemplates, docs]);

  // All templates for the market
  const allTemplates = useMemo(() => {
    try {
      const marketData = getMarketData(market);
      return marketData.documentTemplates ?? [];
    } catch {
      return PHASE_ORDER.flatMap((phase) => getTemplatesForPhase(market, phase));
    }
  }, [market]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let result = allTemplates;
    if (templatePhaseFilter !== "ALL") {
      result = result.filter((t) => t.phase === templatePhaseFilter);
    }
    if (templateTypeFilter !== "ALL") {
      result = result.filter((t) => t.type === templateTypeFilter);
    }
    return result;
  }, [allTemplates, templatePhaseFilter, templateTypeFilter]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let result = [...docs];
    if (docTypeFilter !== "ALL") {
      result = result.filter((d) => d.type === docTypeFilter);
    }
    if (docSearch.trim()) {
      const q = docSearch.trim().toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    // Sort by date descending
    result.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
    return result;
  }, [docs, docTypeFilter, docSearch]);

  /* ---- Topbar ---- */

  useEffect(() => {
    setTopbar(
      project?.name || t("project.documents"),
      `${t("project.documents")} -- ${docs.length} files${generatedCount > 0 ? ` / ${generatedCount} generated` : ""}`,
      "info"
    );
  }, [setTopbar, docs.length, generatedCount, project]);

  /* ---- Handlers ---- */

  const handleFileUpload = useCallback(async (file: File, type: string, phase: string, contactId?: string) => {
    if (!user || !project) return;
    setUploading(true);
    try {
      const { uploadVaultFile } = await import("@/lib/services/vault-upload-service");
      const { fileUrl } = await uploadVaultFile(user.uid, projectId, file, "document");
      await addDocument(user.uid, {
        projectId,
        name: file.name.replace(/\.[^.]+$/, ""),
        type,
        fileUrl,
        phase,
        date: new Date().toISOString(),
      });
      showToast("Document uploaded", "success");
      setShowUploadModal(false);
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }, [user, project, projectId, showToast]);

  const handleDelete = useCallback(async (doc: DocumentData) => {
    if (!user || !doc.id) return;
    if (!window.confirm(`Delete "${doc.name}"?`)) return;
    try {
      await deleteDocument(user.uid, projectId, doc.id);
      showToast("Document deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  }, [user, projectId, showToast]);

  const handleUseTemplate = useCallback((template: DocumentTemplate) => {
    if (profile?.role !== "admin") {
      const limits = getPlanLimits((profile?.plan as PlanTier) ?? "FOUNDATION");
      if (!limits.docGen) {
        showToast("Document generation requires a Builder plan or higher.", "error");
        return;
      }
    }
    setSelectedTemplate(template);
  }, [profile, showToast]);

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
    } catch {
      showToast("Failed to save generated document", "error");
    } finally {
      setSaving(false);
    }
  }, [saving, user, projectId, previewTitle, previewType, previewPhase, previewTemplateId, showToast]);

  const handleClosePreview = useCallback(() => setPreviewHtml(null), []);
  const handleCancelForm = useCallback(() => setSelectedTemplate(null), []);

  /* ---- Render ---- */

  return (
    <>
      <PageHeader
        title={t("project.documents")}
        projectName={project?.name}
        projectId={projectId}
        subtitle={`${docs.length} document${docs.length !== 1 ? "s" : ""}`}
      />

      {/* ---- KPI Strip ---- */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded-[var(--radius)] bg-surface">
          <FileText size={10} className="text-muted" />
          <span className="text-[10px] text-earth font-medium font-data">{docs.length}</span>
          <span className="text-[8px] text-muted">total</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded-[var(--radius)] bg-surface">
          <FileCheck size={10} className="text-success" />
          <span className="text-[10px] text-earth font-medium font-data">{generatedCount}</span>
          <span className="text-[8px] text-muted">from templates</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded-[var(--radius)] bg-surface">
          <Upload size={10} className="text-clay" />
          <span className="text-[10px] text-earth font-medium font-data">{uploadedCount}</span>
          <span className="text-[8px] text-muted">uploads</span>
        </div>
        {missingRequired.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 border border-danger/30 rounded-[var(--radius)] bg-danger-bg">
            <AlertTriangle size={10} className="text-danger" />
            <span className="text-[10px] text-danger font-medium font-data">{missingRequired.length}</span>
            <span className="text-[8px] text-danger/80">missing required</span>
          </div>
        )}
      </div>

      {/* ---- Missing Required Documents Banner ---- */}
      {missingRequired.length > 0 && (
        <div className="mb-3 px-3 py-2 border border-danger/20 rounded-[var(--radius)] bg-danger-bg/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle size={11} className="text-danger shrink-0" />
            <span className="text-[10px] font-semibold text-danger">
              {missingRequired.length} required document{missingRequired.length !== 1 ? "s" : ""} missing for {PHASE_NAMES[currentPhaseKey]} phase
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingRequired.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleUseTemplate(tmpl)}
                className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium bg-white border border-danger/20 text-danger rounded-[var(--radius)] hover:bg-danger-bg transition-colors"
              >
                <Plus size={8} />
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Tab Switcher ---- */}
      <div className="flex items-center gap-0 mb-3 border-b border-border">
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-3 py-1.5 text-[10px] font-medium border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-clay text-earth"
              : "border-transparent text-muted hover:text-earth"
          }`}
        >
          My Documents
          {docs.length > 0 && (
            <span className="ml-1.5 text-[8px] font-data px-1 py-0.5 rounded-full bg-surface border border-border">
              {docs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-3 py-1.5 text-[10px] font-medium border-b-2 transition-colors ${
            activeTab === "templates"
              ? "border-clay text-earth"
              : "border-transparent text-muted hover:text-earth"
          }`}
        >
          Templates
          <span className="ml-1.5 text-[8px] font-data px-1 py-0.5 rounded-full bg-surface border border-border">
            {allTemplates.length}
          </span>
        </button>
      </div>

      {/* ================================================================ */}
      {/*  MY DOCUMENTS TAB                                                 */}
      {/* ================================================================ */}
      {activeTab === "documents" && (
        <div>
          {/* Toolbar: search + filter + upload */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1 max-w-[240px]">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-6 pr-2 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth focus:outline-none focus:border-clay placeholder:text-muted/50"
              />
            </div>
            <div className="relative">
              <Filter size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="appearance-none pl-6 pr-6 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
              >
                <option value="ALL">All types</option>
                {DOC_TYPES.filter((t) => t !== "ALL").map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors text-[10px] font-medium ml-auto"
            >
              <Upload size={10} />
              Upload document
            </button>
          </div>

          {/* Document Table */}
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 border border-dashed border-border rounded-[var(--radius)] bg-surface">
              <FileText size={24} className="text-sand" />
              <p className="text-[11px] font-medium text-earth">No documents yet</p>
              <p className="text-[9px] text-muted max-w-[280px] text-center">
                Upload your first document or generate one from the Templates tab.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium bg-earth text-warm rounded-[var(--radius)] hover:bg-earth-light transition-colors"
                >
                  <Upload size={10} />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab("templates")}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium border border-border text-earth rounded-[var(--radius)] hover:bg-surface transition-colors"
                >
                  <FileCheck size={10} />
                  Browse templates
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-[var(--radius)] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_70px_80px_50px_72px] gap-2 px-2.5 py-1.5 bg-warm/40 border-b border-border">
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Name</span>
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Type</span>
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Phase</span>
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Date</span>
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider">Size</span>
                <span className="text-[8px] font-semibold text-muted uppercase tracking-wider text-right">Actions</span>
              </div>

              {/* Table rows */}
              {filteredDocs.map((doc, i) => {
                const style = TYPE_COLORS[doc.type] ?? TYPE_COLORS.DEFAULT;
                const isGenerated = !!(doc as unknown as Record<string, unknown>).templateId;
                const hasFile = !!doc.fileUrl;
                return (
                  <div
                    key={doc.id}
                    className={`grid grid-cols-[1fr_80px_70px_80px_50px_72px] gap-2 px-2.5 py-1.5 items-center hover:bg-warm/30 transition-colors ${
                      i < filteredDocs.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    {/* Name */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                        {getFileIcon(undefined, doc.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-medium text-earth truncate">{doc.name}</span>
                          {isGenerated && <FileCheck size={8} className="text-success shrink-0" />}
                        </div>
                      </div>
                    </div>

                    {/* Type badge */}
                    <div>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
                        {doc.type}
                      </span>
                    </div>

                    {/* Phase */}
                    <span className="text-[9px] text-muted truncate">{doc.phase}</span>

                    {/* Date */}
                    <span className="text-[9px] text-muted font-data">{formatDate(doc.date)}</span>

                    {/* Size */}
                    <span className="text-[9px] text-muted font-data">--</span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      {hasFile && (
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="p-1 text-clay hover:text-earth rounded hover:bg-warm/50 transition-colors"
                          title="View"
                        >
                          <Eye size={11} />
                        </button>
                      )}
                      {hasFile && (
                        <a
                          href={doc.fileUrl}
                          download
                          className="p-1 text-clay hover:text-earth rounded hover:bg-warm/50 transition-colors"
                          title="Download"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={11} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(doc)}
                        className="p-1 text-muted hover:text-danger rounded hover:bg-danger-bg/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/*  TEMPLATES TAB                                                    */}
      {/* ================================================================ */}
      {activeTab === "templates" && (
        <div>
          {/* Phase filter pills */}
          <div className="flex gap-1 mb-2 overflow-x-auto pb-1 flex-wrap">
            <button
              onClick={() => setTemplatePhaseFilter("ALL")}
              className={`px-2.5 py-0.5 text-[9px] rounded-full whitespace-nowrap transition-all duration-150 ${
                templatePhaseFilter === "ALL"
                  ? "bg-earth text-warm font-medium"
                  : "bg-surface border border-border text-muted hover:border-border-dark hover:text-earth"
              }`}
            >
              All phases
            </button>
            {PHASE_ORDER.map((phase) => (
              <button
                key={phase}
                onClick={() => setTemplatePhaseFilter(phase)}
                className={`px-2.5 py-0.5 text-[9px] rounded-full whitespace-nowrap transition-all duration-150 ${
                  templatePhaseFilter === phase
                    ? "bg-earth text-warm font-medium"
                    : "bg-surface border border-border text-muted hover:border-border-dark hover:text-earth"
                }`}
              >
                {PHASE_NAMES[phase]}
                {phase === currentPhaseKey && (
                  <span className="ml-1 text-[7px] opacity-60">(current)</span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <Filter size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={templateTypeFilter}
                onChange={(e) => setTemplateTypeFilter(e.target.value)}
                className="appearance-none pl-6 pr-6 py-1.5 text-[10px] border border-border rounded-[var(--radius)] bg-surface text-earth cursor-pointer focus:outline-none focus:border-clay"
              >
                <option value="ALL">All types</option>
                {DOC_TYPES.filter((t) => t !== "ALL").map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
            <span className="text-[9px] text-muted">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Template grid */}
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 border border-dashed border-border rounded-[var(--radius)] bg-surface">
              <FileText size={20} className="text-sand" />
              <p className="text-[11px] text-muted">No templates match the selected filters.</p>
              <button
                onClick={() => {
                  setTemplatePhaseFilter("ALL");
                  setTemplateTypeFilter("ALL");
                }}
                className="text-[10px] font-medium text-clay hover:text-earth transition-colors underline underline-offset-2"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 animate-stagger">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Upload Modal ---- */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
        uploading={uploading}
        contacts={contacts}
        currentPhase={PHASE_NAMES_DOC[project?.currentPhase ?? 0] ?? "DEFINE"}
      />

      {/* ---- Document Viewer Modal ---- */}
      {viewingDoc && viewingDoc.fileUrl && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      {/* ---- Document Fill Form modal ---- */}
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

      {/* ---- Document Preview modal ---- */}
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
