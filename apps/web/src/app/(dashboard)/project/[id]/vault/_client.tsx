"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import {
  subscribeToProject,
  subscribeToVaultFiles,
  addVaultFile,
  deleteVaultFile,
  type ProjectData,
  type VaultFileData,
} from "@/lib/services/project-service";
import { uploadVaultFile } from "@/lib/services/vault-upload-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { safeUnsubscribeAll } from "@/lib/utils/safe-cleanup";
import {
  FolderOpen,
  Upload,
  FileText,
  Table2,
  Image,
  Ruler,
  File,
  Download,
  Trash2,
  X,
  Loader2,
  Search,
} from "lucide-react";

// ---------------------------------------------------------------------------
// File type icon mapping
// ---------------------------------------------------------------------------

type LucideIcon = typeof FileText;

const FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: Table2,
  xlsx: Table2,
  csv: Table2,
  jpg: Image,
  jpeg: Image,
  png: Image,
  gif: Image,
  webp: Image,
  dwg: Ruler,
  dxf: Ruler,
  default: File,
};

function getFileIcon(filename: string): LucideIcon {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

type VaultCategory = VaultFileData["category"];

const CATEGORIES: { value: VaultCategory | "all"; label: string }[] = [
  { value: "all", label: "All Files" },
  { value: "architecture", label: "Architecture" },
  { value: "legal", label: "Legal" },
  { value: "financial", label: "Financial" },
  { value: "photos", label: "Photos" },
  { value: "notes", label: "Notes" },
  { value: "reports", label: "Reports" },
  { value: "other", label: "Other" },
];

const UPLOAD_CATEGORIES: { value: VaultCategory; label: string }[] = CATEGORIES.filter(
  (c) => c.value !== "all"
) as { value: VaultCategory; label: string }[];

// ---------------------------------------------------------------------------
// File size formatting
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Is image check
// ---------------------------------------------------------------------------

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

function isPDF(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

// ---------------------------------------------------------------------------
// VaultClient component
// ---------------------------------------------------------------------------

export function VaultClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [files, setFiles] = useState<VaultFileData[]>([]);
  const [activeTab, setActiveTab] = useState<VaultCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<VaultCategory>("other");
  const [uploadDescription, setUploadDescription] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<VaultFileData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribeToProject(user.uid, projectId, setProject),
      subscribeToVaultFiles(user.uid, projectId, setFiles),
    ];
    return () => safeUnsubscribeAll(unsubs);
  }, [user, projectId]);

  useEffect(() => {
    if (project) {
      setTopbar(project.name, t("project.fileVault"), "info");
    }
  }, [project, setTopbar]);

  // Filter files
  const filteredFiles = files.filter((f) => {
    const matchesTab = activeTab === "all" || f.category === activeTab;
    const matchesSearch =
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Upload handler
  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || !user) return;
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].size > MAX_FILE_SIZE) {
          showToast(`"${fileList[i].name}" exceeds 25 MB limit.`, "error");
          return;
        }
      }
      setUploading(true);
      try {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const result = await uploadVaultFile(
            user.uid,
            projectId,
            file,
            uploadCategory,
            uploadDescription
          );
          await addVaultFile(user.uid, {
            projectId,
            name: file.name,
            category: uploadCategory,
            description: uploadDescription || undefined,
            fileUrl: result.fileUrl,
            fileSize: result.fileSize,
            mimeType: result.mimeType,
            uploadedAt: new Date().toISOString(),
          });
        }
        setUploadDescription("");
        setShowUploadForm(false);
      } catch (err) {
        showToast("Failed to upload file", "error");
      } finally {
        setUploading(false);
      }
    },
    [user, projectId, uploadCategory, uploadDescription]
  );

  // Drag and drop handlers
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  // State for files selected via drag-drop (shown in upload form before uploading)
  const [droppedFiles, setDroppedFiles] = useState<FileList | null>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setDroppedFiles(files);
      setShowUploadForm(true);
    }
  }

  // Delete handler
  async function handleDelete(fileId: string) {
    if (!user) return;
    try {
      await deleteVaultFile(user.uid, projectId, fileId);
    } catch (err) {
      showToast("Failed to delete file", "error");
    }
    setDeleteConfirm(null);
  }

  // Preview handler
  function handlePreview(file: VaultFileData) {
    if (isImage(file.mimeType)) {
      setPreviewFile(file);
    } else if (isPDF(file.mimeType)) {
      window.open(file.fileUrl, "_blank");
    } else {
      // Download for other types
      const a = document.createElement("a");
      a.href = file.fileUrl;
      a.download = file.name;
      a.target = "_blank";
      a.click();
    }
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-clay border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[12px] text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={t("project.fileVault")}
        projectName={project.name}
        projectId={projectId}
        subtitle="Store and organize all project files"
      />

      {/* Upload drop zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 mb-5 text-center transition-colors
          ${dragActive ? "border-clay bg-warm" : "border-border hover:border-sand"}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 rounded-full bg-warm flex items-center justify-center mx-auto mb-3">
          <Upload size={22} className="text-clay" />
        </div>
        <p className="text-[13px] text-earth font-medium mb-1">
          Drag and drop files here
        </p>
        <p className="text-[11px] text-muted mb-3">
          or click the button below to browse
        </p>

        {!showUploadForm ? (
          <button
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-[12px] font-medium rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors"
          >
            <Upload size={14} />
            Upload Files
          </button>
        ) : (
          <div className="max-w-sm mx-auto space-y-3 mt-2">
            {/* Category selector */}
            <div>
              <label className="block text-[11px] text-muted mb-1 text-left">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as VaultCategory)}
                className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-surface text-earth focus:outline-none focus:ring-1 focus:ring-clay"
              >
                {UPLOAD_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] text-muted mb-1 text-left">
                Description (optional)
              </label>
              <input
                type="text"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Brief description of the file"
                className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-clay"
              />
            </div>

            {/* File input + actions */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {droppedFiles ? (
                <button
                  onClick={() => {
                    handleUpload(droppedFiles);
                    setDroppedFiles(null);
                  }}
                  disabled={uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-medium rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload {droppedFiles.length} file{droppedFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-[12px] font-medium rounded-lg bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Browse Files
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setDroppedFiles(null);
                }}
                className="px-3 py-2 text-[12px] text-muted hover:text-earth rounded-lg border border-border hover:bg-warm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              className={`
                px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-colors
                ${
                  activeTab === cat.value
                    ? "bg-earth text-warm"
                    : "text-muted hover:text-earth hover:bg-warm"
                }
              `}
            >
              {cat.label}
              {cat.value !== "all" && (
                <span className="ml-1 font-data opacity-60">
                  {files.filter((f) => f.category === cat.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-[12px] border border-border rounded-lg bg-surface text-earth placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-clay"
          />
        </div>
      </div>

      {/* File count */}
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>
          {filteredFiles.length} file{filteredFiles.length !== 1 ? "s" : ""}
        </SectionLabel>
      </div>

      {/* File list */}
      {/* TODO: Replace inline empty state below with shared <EmptyState> component for consistency */}
      {filteredFiles.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-6">
            <FolderOpen size={32} className="text-sand mx-auto mb-3" />
            <p className="text-[13px] text-earth font-medium mb-2">No files yet</p>
            <p className="text-[11px] text-muted mb-4">
              Upload files using the drop zone above to get started.
            </p>
          </div>
          <div className="text-left border-t border-border pt-4">
            <p className="text-[12px] text-earth font-medium mb-2">
              This is your project file vault. Organize all your construction documents in one place:
            </p>
            <ul className="text-[11px] text-muted leading-relaxed space-y-1.5">
              <li><span className="font-medium text-earth">Architecture:</span> floor plans, elevations, construction documents</li>
              <li><span className="font-medium text-earth">Legal:</span> contracts, deeds, permits, insurance certificates</li>
              <li><span className="font-medium text-earth">Financial:</span> invoices, receipts, draw requests, lien waivers</li>
              <li><span className="font-medium text-earth">Photos:</span> site photos, progress documentation</li>
              <li><span className="font-medium text-earth">Notes:</span> meeting notes, site observations, decision logs</li>
              <li><span className="font-medium text-earth">Reports:</span> inspection reports, engineering reports, appraisals</li>
            </ul>
          </div>
        </Card>
      ) : (
        <div className="space-y-1">
          {filteredFiles.map((file) => {
            const IconComponent = getFileIcon(file.name);
            const isImg = isImage(file.mimeType);

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-warm/30 transition-colors group"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-warm flex items-center justify-center shrink-0">
                  <IconComponent size={18} className="text-clay" />
                </div>

                {/* File info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handlePreview(file)}
                >
                  <p className="text-[12px] text-earth font-medium truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="info">{file.category}</Badge>
                    <span className="text-[10px] text-muted font-data">
                      {formatFileSize(file.fileSize)}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatDate(file.uploadedAt)}
                    </span>
                  </div>
                  {file.description && (
                    <p className="text-[10px] text-muted mt-0.5 truncate">
                      {file.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <a
                    href={file.fileUrl}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted hover:text-earth hover:bg-warm transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                  {deleteConfirm === file.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(file.id!)}
                        className="px-2 py-1 text-[10px] font-medium rounded bg-danger text-white hover:opacity-80 transition-opacity"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1 rounded text-muted hover:text-earth"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(file.id!)}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image preview modal */}
      {previewFile && isImage(previewFile.mimeType) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-earth/60 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}
          />
          <div className="relative z-10 max-w-3xl w-full mx-4">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-lg text-warm hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <img
              src={previewFile.fileUrl}
              alt={previewFile.name}
              className="w-full rounded-xl shadow-2xl"
            />
            <div className="mt-2 text-center">
              <p className="text-[13px] text-warm font-medium">{previewFile.name}</p>
              {previewFile.description && (
                <p className="text-[11px] text-warm/70">{previewFile.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
