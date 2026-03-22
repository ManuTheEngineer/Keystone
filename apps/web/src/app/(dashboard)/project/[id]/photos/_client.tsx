"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import {
  subscribeToPhotos,
  subscribeToProject,
  type PhotoData,
  type ProjectData,
} from "@/lib/services/project-service";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { getPlanLimits } from "@/lib/stripe-config";
import type { PlanTier } from "@/lib/stripe-config";
import { uploadProjectPhoto } from "@/lib/services/photo-upload-service";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import { getPhaseDefinition, PHASE_ORDER, PHASE_NAMES } from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import {
  ImageIcon,
  Plus,
  Loader2,
  X,
  MapPin,
  Camera,
  Upload,
  HardDrive,
  Tag,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────────────────── */

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function estimateStorageUsed(count: number): string {
  // Average ~400KB per compressed photo
  const mb = (count * 0.4).toFixed(1);
  return `${mb} MB`;
}

/* ─── Component ───────────────────────────────────────────────────── */

export function PhotosClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const projectId = params.id as string;

  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPhases, setUploadPhases] = useState<Record<number, string>>({});
  const [uploadMilestones, setUploadMilestones] = useState<Record<number, string>>({});
  const [uploadCaptions, setUploadCaptions] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PHASE" | "MILESTONE" | "DATE">("ALL");
  const [filterPhase, setFilterPhase] = useState<string>("ALL");
  const [filterMilestone, setFilterMilestone] = useState<string>("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Milestone panel
  const [showMilestonePanel, setShowMilestonePanel] = useState(false);

  // Memoize preview URLs
  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Subscribe to data
  useEffect(() => {
    if (!user) return;
    const unsubPhotos = subscribeToPhotos(user.uid, projectId, setPhotos);
    const unsubProject = subscribeToProject(user.uid, projectId, setProject);
    return () => {
      unsubPhotos();
      unsubProject();
    };
  }, [user, projectId]);

  useEffect(() => {
    setTopbar(project?.name || t("project.photos"), `${t("project.photos")} -- ${photos.length} photos`, "info");
  }, [setTopbar, photos.length, project]);

  // Market data and phases
  const market = (project?.market ?? "USA") as Market;
  const currentPhaseKey = project
    ? PHASE_ORDER[project.currentPhase] ?? "BUILD"
    : "BUILD";

  // Photo counts
  const phasePhotoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of photos) {
      const key = p.phase || "Unassigned";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [photos]);

  const untaggedCount = useMemo(
    () => photos.filter((p) => !p.phase).length,
    [photos]
  );

  const currentPhaseCount = phasePhotoCounts[currentPhaseKey] || 0;

  // Get milestones for a given phase
  function getMilestones(phase: string) {
    const phaseDef = getPhaseDefinition(market, phase as ProjectPhase);
    return phaseDef?.milestones ?? [];
  }

  // All milestones for current phase
  const currentPhaseDef = getPhaseDefinition(market, currentPhaseKey as ProjectPhase);
  const currentPhasePhotos = useMemo(
    () => photos.filter((p) => p.phase === currentPhaseKey),
    [photos, currentPhaseKey]
  );

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (activeFilter === "PHASE" && filterPhase !== "ALL") {
      result = result.filter((p) => p.phase === filterPhase);
    }

    if (activeFilter === "MILESTONE" && filterMilestone !== "ALL") {
      result = result.filter(
        (p) => p.caption?.toLowerCase().includes(filterMilestone.toLowerCase())
      );
    }

    if (activeFilter === "DATE") {
      if (filterDateFrom) {
        const from = new Date(filterDateFrom + "T00:00:00").getTime();
        result = result.filter((p) => p.date && new Date(p.date).getTime() >= from);
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo + "T23:59:59.999").getTime();
        result = result.filter((p) => p.date && new Date(p.date).getTime() <= to);
      }
    }

    result.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    return result;
  }, [photos, activeFilter, filterPhase, filterMilestone, filterDateFrom, filterDateTo]);

  /* ─── Drag & Drop ───────────────────────────────────────────── */

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        setSelectedFiles(files);
        // Auto-set phase to current project phase for all files
        const phases: Record<number, string> = {};
        files.forEach((_, i) => {
          phases[i] = currentPhaseKey;
        });
        setUploadPhases(phases);
      }
    },
    [currentPhaseKey]
  );

  /* ─── File Select ───────────────────────────────────────────── */

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArr = Array.from(files);
    setSelectedFiles(fileArr);
    const phases: Record<number, string> = {};
    fileArr.forEach((_, i) => {
      phases[i] = currentPhaseKey;
    });
    setUploadPhases(phases);
  }

  /* ─── Upload ────────────────────────────────────────────────── */

  async function handleUploadSubmit() {
    if (selectedFiles.length === 0 || !user) return;

    if (profile?.role !== "admin") {
      const limits = getPlanLimits((profile?.plan as PlanTier) ?? "FOUNDATION");
      if (limits.photos !== Infinity && photos.length + selectedFiles.length > limits.photos) {
        showToast(
          `Photo limit reached. Your plan allows ${limits.photos} photos. Upgrade to add more.`,
          "error"
        );
        return;
      }
    }

    setUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const phase = uploadPhases[i] || currentPhaseKey;
        const milestone = uploadMilestones[i] || "";
        const caption = [uploadCaptions[i] || "", milestone ? `Milestone: ${milestone}` : ""]
          .filter(Boolean)
          .join(" | ");
        await uploadProjectPhoto(user.uid, projectId, file, phase, caption || undefined);
      }
      showToast(`${selectedFiles.length} photo${selectedFiles.length !== 1 ? "s" : ""} uploaded`, "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Failed to upload photos", "error");
    } finally {
      setUploading(false);
      clearUpload();
    }
  }

  function clearUpload() {
    setSelectedFiles([]);
    setUploadPhases({});
    setUploadMilestones({});
    setUploadCaptions({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadPhases((prev) => {
      const next = { ...prev };
      delete next[index];
      // Re-index
      const reindexed: Record<number, string> = {};
      Object.keys(next).forEach((k) => {
        const ki = parseInt(k);
        reindexed[ki > index ? ki - 1 : ki] = next[ki];
      });
      return reindexed;
    });
  }

  /* ─── Milestone helpers ─────────────────────────────────────── */

  function getMilestonePhotoCount(milestoneName: string): number {
    return currentPhasePhotos.filter(
      (p) => p.caption?.trim().toLowerCase().includes(milestoneName.trim().toLowerCase())
    ).length;
  }

  /* ─── Filter helpers ────────────────────────────────────────── */

  function clearFilters() {
    setActiveFilter("ALL");
    setFilterPhase("ALL");
    setFilterMilestone("ALL");
    setFilterDateFrom("");
    setFilterDateTo("");
  }

  const hasActiveFilters = activeFilter !== "ALL";

  /* ─── Render ────────────────────────────────────────────────── */

  return (
    <>
      <PageHeader
        title={t("project.photos")}
        projectName={project?.name}
        projectId={projectId}
        subtitle={`${photos.length} photo${photos.length !== 1 ? "s" : ""}`}
      />

      {/* ── Top Stats Strip ──────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-4 px-0.5">
        <div className="flex items-center gap-1.5">
          <Camera size={11} className="text-clay" />
          <span className="text-[10px] font-data font-semibold text-earth">{photos.length}</span>
          <span className="text-[9px] text-muted">total</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-data font-semibold text-earth">{currentPhaseCount}</span>
          <span className="text-[9px] text-muted">this phase</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <Tag size={10} className="text-muted" />
          <span className="text-[10px] font-data font-semibold text-earth">{untaggedCount}</span>
          <span className="text-[9px] text-muted">untagged</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <HardDrive size={10} className="text-muted" />
          <span className="text-[10px] font-data text-earth">{estimateStorageUsed(photos.length)}</span>
        </div>

        {/* Milestone verification toggle */}
        {currentPhaseDef && (
          <>
            <div className="ml-auto" />
            <button
              onClick={() => setShowMilestonePanel(!showMilestonePanel)}
              className={`flex items-center gap-1 px-2 py-0.5 text-[9px] rounded border transition-colors ${
                showMilestonePanel
                  ? "border-clay bg-warm text-clay font-medium"
                  : "border-border text-muted hover:text-earth hover:border-earth"
              }`}
            >
              <CheckCircle2 size={10} />
              Milestone verification
            </button>
          </>
        )}
      </div>

      {/* ── Drop Zone / Upload Area ──────────────────────────── */}
      {selectedFiles.length === 0 ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 border-2 border-dashed rounded-[var(--radius)] transition-colors cursor-pointer ${
            dragging
              ? "border-clay bg-warm/40"
              : "border-border-dark hover:border-clay/50 hover:bg-warm/20"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex items-center justify-center gap-2 py-3.5">
            <Upload size={14} className={dragging ? "text-clay" : "text-muted"} />
            <span className={`text-[11px] ${dragging ? "text-clay font-medium" : "text-muted"}`}>
              Drop photos here or click to upload
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>
      ) : (
        /* ── Upload Preview Panel ──────────────────────────── */
        <div className="mb-4 border border-earth/30 rounded-[var(--radius)] bg-warm/20 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface">
            <span className="text-[11px] font-semibold text-earth">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
            </span>
            <button onClick={clearUpload} className="text-muted hover:text-earth transition-colors">
              <X size={13} />
            </button>
          </div>

          <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2 bg-surface border border-border rounded-[var(--radius)]"
              >
                {/* Thumbnail */}
                <div className="w-11 h-11 rounded overflow-hidden border border-border flex-shrink-0">
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Meta fields */}
                <div className="flex-1 min-w-0 grid grid-cols-3 gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] uppercase tracking-wider text-muted font-medium">Phase</label>
                    <select
                      value={uploadPhases[i] || currentPhaseKey}
                      onChange={(e) =>
                        setUploadPhases((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white text-earth focus:outline-none focus:border-earth"
                    >
                      {PHASE_ORDER.map((phase) => (
                        <option key={phase} value={phase}>
                          {PHASE_NAMES[phase]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] uppercase tracking-wider text-muted font-medium">Milestone</label>
                    <select
                      value={uploadMilestones[i] || ""}
                      onChange={(e) =>
                        setUploadMilestones((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white text-earth focus:outline-none focus:border-earth"
                    >
                      <option value="">None</option>
                      {getMilestones(uploadPhases[i] || currentPhaseKey).map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-[8px] uppercase tracking-wider text-muted font-medium">Caption</label>
                    <input
                      type="text"
                      value={uploadCaptions[i] || ""}
                      onChange={(e) =>
                        setUploadCaptions((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      placeholder="Describe..."
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-white text-earth focus:outline-none focus:border-earth placeholder:text-muted/40"
                    />
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFile(i)}
                  className="text-muted hover:text-danger transition-colors flex-shrink-0 mt-0.5"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-surface">
            <span className="text-[8px] text-muted flex items-center gap-1">
              <MapPin size={9} /> GPS auto-captured
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearUpload}
                className="px-2.5 py-1 text-[10px] text-muted hover:text-earth rounded border border-border hover:border-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-[10px] font-medium rounded bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={11} />
                    Upload {selectedFiles.length}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {/* Filter pills */}
        {(
          [
            { key: "ALL", label: "All" },
            { key: "PHASE", label: "By Phase" },
            { key: "MILESTONE", label: "By Milestone" },
            { key: "DATE", label: "By Date" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              if (activeFilter === key && key !== "ALL") {
                clearFilters();
              } else {
                setActiveFilter(key);
              }
            }}
            className={`px-2.5 py-1 text-[9px] rounded-full border transition-colors ${
              activeFilter === key
                ? "border-clay bg-warm text-clay font-medium"
                : "border-border text-muted hover:text-earth hover:border-earth"
            }`}
          >
            {label}
          </button>
        ))}

        {/* Phase sub-pills */}
        {activeFilter === "PHASE" && (
          <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-border">
            {PHASE_ORDER.map((phase) => (
              <button
                key={phase}
                onClick={() => setFilterPhase(filterPhase === phase ? "ALL" : phase)}
                className={`px-2 py-0.5 text-[8px] rounded-full border transition-colors ${
                  filterPhase === phase
                    ? "border-earth bg-earth text-sand font-medium"
                    : "border-border text-muted hover:text-earth hover:border-earth"
                }`}
              >
                {PHASE_NAMES[phase]}
                <span className="ml-0.5 opacity-60">{phasePhotoCounts[phase] || 0}</span>
              </button>
            ))}
          </div>
        )}

        {/* Milestone sub-pills */}
        {activeFilter === "MILESTONE" && currentPhaseDef && (
          <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-border overflow-x-auto">
            {currentPhaseDef.milestones.map((m) => (
              <button
                key={m.name}
                onClick={() =>
                  setFilterMilestone(filterMilestone === m.name ? "ALL" : m.name)
                }
                className={`px-2 py-0.5 text-[8px] rounded-full border transition-colors whitespace-nowrap ${
                  filterMilestone === m.name
                    ? "border-earth bg-earth text-sand font-medium"
                    : "border-border text-muted hover:text-earth hover:border-earth"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* Date range */}
        {activeFilter === "DATE" && (
          <div className="flex items-center gap-1.5 ml-1.5 pl-1.5 border-l border-border">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-surface text-earth focus:outline-none focus:border-earth"
            />
            <span className="text-[9px] text-muted">to</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-surface text-earth focus:outline-none focus:border-earth"
            />
          </div>
        )}

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[9px] text-muted hover:text-earth underline ml-1"
          >
            Clear
          </button>
        )}

        {/* Count */}
        <span className="text-[9px] text-muted ml-auto">
          {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex gap-4">
        {/* ── Photo Grid ───────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Camera size={28} className="text-muted/40 mb-3" />
              <p className="text-[12px] font-medium text-earth mb-1">No photos yet</p>
              <p className="text-[10px] text-muted mb-3 max-w-[240px]">
                Upload construction photos to document progress and verify milestones.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium rounded bg-earth text-warm hover:bg-earth-light transition-colors"
              >
                <Plus size={11} />
                Upload photos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 animate-stagger">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="aspect-square bg-surface-alt border border-border rounded-[var(--radius)] relative cursor-pointer hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all duration-150 overflow-hidden group"
                >
                  {photo.fileUrl ? (
                    <img
                      src={photo.fileUrl}
                      alt={photo.caption || "Site photo"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={18} className="text-muted/40" />
                    </div>
                  )}

                  {/* Phase badge — small corner */}
                  {photo.phase && (
                    <span className="absolute top-1 left-1 text-[7px] leading-none px-1 py-0.5 rounded bg-earth/85 text-sand/90 backdrop-blur-sm">
                      {PHASE_NAMES[photo.phase as ProjectPhase] || photo.phase}
                    </span>
                  )}

                  {/* Date — top right */}
                  {photo.date && (
                    <span className="absolute top-1 right-1 text-[7px] leading-none px-1 py-0.5 rounded bg-black/50 text-white/75 backdrop-blur-sm">
                      {formatDateShort(photo.date)}
                    </span>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Eye
                      size={18}
                      className="text-white/0 group-hover:text-white/80 transition-colors"
                    />
                  </div>

                  {/* Caption on hover */}
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[8px] text-white/85 line-clamp-2 leading-snug">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Milestone Verification Sidebar ──────────────── */}
        {showMilestonePanel && currentPhaseDef && (
          <div className="w-[220px] flex-shrink-0 border border-border rounded-[var(--radius)] bg-surface overflow-hidden self-start">
            <div className="px-3 py-2 border-b border-border bg-warm/30">
              <span className="text-[9px] font-semibold text-earth uppercase tracking-wider">
                {PHASE_NAMES[currentPhaseKey as ProjectPhase]} -- Milestones
              </span>
            </div>
            <div className="divide-y divide-border">
              {currentPhaseDef.milestones.map((milestone) => {
                const count = getMilestonePhotoCount(milestone.name);
                const needsPhotos = milestone.verificationRequired && count === 0;

                return (
                  <div
                    key={milestone.name}
                    className="px-3 py-2 hover:bg-warm/15 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveFilter("MILESTONE");
                      setFilterMilestone(milestone.name);
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {needsPhotos ? (
                        <AlertCircle size={10} className="text-warning flex-shrink-0" />
                      ) : count > 0 ? (
                        <CheckCircle2 size={10} className="text-success flex-shrink-0" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full border border-border flex-shrink-0" />
                      )}
                      <span className="text-[10px] font-medium text-earth truncate">
                        {milestone.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-4">
                      {count > 0 ? (
                        <span className="text-[8px] font-data text-success">{count} photo{count !== 1 ? "s" : ""}</span>
                      ) : needsPhotos ? (
                        <span className="text-[8px] text-warning">Needs photos</span>
                      ) : (
                        <span className="text-[8px] text-muted">No photos</span>
                      )}
                      {milestone.verificationRequired && (
                        <span className="text-[7px] px-1 py-px rounded bg-clay/10 text-clay">Required</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </>
  );
}
