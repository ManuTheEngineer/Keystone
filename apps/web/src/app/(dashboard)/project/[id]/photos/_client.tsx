"use client";

import { useEffect, useState, useRef, useMemo } from "react";
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
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import { getMarketData, getPhaseDefinition, PHASE_ORDER, PHASE_NAMES } from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { useTranslation } from "@/lib/hooks/use-translation";
import { ImageIcon, Plus, Loader2, X, MapPin, Calendar, Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

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

  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPhase, setUploadPhase] = useState<string>("");
  const [uploadMilestone, setUploadMilestone] = useState<string>("");
  const [uploadCaption, setUploadCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filterPhase, setFilterPhase] = useState<string>("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Memoize preview URLs so they are only created when selectedFiles changes
  const previewUrls = useMemo(() => {
    return selectedFiles.map((file) => URL.createObjectURL(file));
  }, [selectedFiles]);

  // Clean up preview URLs when they change or component unmounts
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
    setTopbar(project?.name || t("project.photos"), `${t("project.photos")} — ${photos.length} photos`, "info");
  }, [setTopbar, photos.length, project]);

  // Market data and phases
  const market = (project?.market ?? "USA") as Market;
  const marketData = getMarketData(market);

  // Get milestones for selected upload phase
  const uploadPhaseMilestones = useMemo(() => {
    if (!uploadPhase) return [];
    const phaseDef = getPhaseDefinition(market, uploadPhase as ProjectPhase);
    return phaseDef?.milestones ?? [];
  }, [market, uploadPhase]);

  // Photo counts per phase
  const phasePhotoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of photos) {
      const key = p.phase || "Unassigned";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (filterPhase !== "ALL") {
      result = result.filter((p) => p.phase === filterPhase);
    }

    if (filterDateFrom) {
      // Parse as local midnight (YYYY-MM-DD + T00:00:00) to avoid UTC shift
      const from = new Date(filterDateFrom + "T00:00:00").getTime();
      result = result.filter((p) => p.date && new Date(p.date).getTime() >= from);
    }

    if (filterDateTo) {
      // End of selected day in local time (23:59:59.999)
      const to = new Date(filterDateTo + "T23:59:59.999").getTime();
      result = result.filter((p) => p.date && new Date(p.date).getTime() <= to);
    }

    // Sort newest first
    result.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    return result;
  }, [photos, filterPhase, filterDateFrom, filterDateTo]);

  // Group photos by milestone within the current project phase
  const currentPhaseKey = project
    ? PHASE_ORDER[project.currentPhase] ?? "BUILD"
    : "BUILD";
  const currentPhaseDef = getPhaseDefinition(market, currentPhaseKey as ProjectPhase);
  const currentPhasePhotos = useMemo(
    () => photos.filter((p) => p.phase === currentPhaseKey),
    [photos, currentPhaseKey]
  );

  // Handlers
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedFiles(Array.from(files));
    setShowUploadForm(true);
  }

  async function handleUploadSubmit() {
    if (selectedFiles.length === 0 || !user) return;

    // Check photo limit (admin bypasses)
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
      for (const file of selectedFiles) {
        const phase = uploadPhase || "BUILD";
        const caption = [uploadCaption, uploadMilestone ? `Milestone: ${uploadMilestone}` : ""]
          .filter(Boolean)
          .join(" | ");
        await uploadProjectPhoto(user.uid, projectId, file, phase, caption || undefined);
      }
      showToast("Photos uploaded successfully", "success");
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Failed to upload photos", "error");
    } finally {
      setUploading(false);
      setShowUploadForm(false);
      setSelectedFiles([]);
      setUploadPhase("");
      setUploadMilestone("");
      setUploadCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleCancelUpload() {
    setShowUploadForm(false);
    setSelectedFiles([]);
    setUploadPhase("");
    setUploadMilestone("");
    setUploadCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      <PageHeader
        title={t("project.photos")}
        projectName={project?.name}
        projectId={projectId}
        subtitle={`${photos.length} photo${photos.length !== 1 ? "s" : ""}`}
      />

      {/* Phase photo counts */}
      <SectionLabel>Photos by phase</SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
        {PHASE_ORDER.map((phase) => (
          <StatCard
            key={phase}
            value={String(phasePhotoCounts[phase] || 0)}
            label={PHASE_NAMES[phase]}
          />
        ))}
      </div>

      {/* Filter bar */}
      <SectionLabel>Filter photos</SectionLabel>
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-wider text-muted font-medium">Phase</label>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth"
            >
              <option value="ALL">All phases</option>
              {PHASE_ORDER.map((phase) => (
                <option key={phase} value={phase}>
                  {PHASE_NAMES[phase]} ({phasePhotoCounts[phase] || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-wider text-muted font-medium">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-wider text-muted font-medium">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth"
            />
          </div>

          {(filterPhase !== "ALL" || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setFilterPhase("ALL");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
              className="text-[11px] text-muted hover:text-earth underline pb-1.5"
            >
              Clear filters
            </button>
          )}
        </div>
      </Card>

      {/* Upload form modal */}
      {showUploadForm && (
        <Card padding="sm" className="mb-4 border-earth">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-semibold text-earth">
              Upload {selectedFiles.length} photo{selectedFiles.length !== 1 ? "s" : ""}
            </h3>
            <button onClick={handleCancelUpload} className="text-muted hover:text-earth">
              <X size={14} />
            </button>
          </div>

          {/* File previews */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-[var(--radius)] overflow-hidden border border-border flex-shrink-0"
              >
                <img
                  src={previewUrls[i]}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
                Phase
              </label>
              <select
                value={uploadPhase}
                onChange={(e) => {
                  setUploadPhase(e.target.value);
                  setUploadMilestone("");
                }}
                className="text-[11px] px-2 py-1 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth"
              >
                <option value="">Select phase</option>
                {PHASE_ORDER.map((phase) => (
                  <option key={phase} value={phase}>
                    {PHASE_NAMES[phase]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
                Milestone
              </label>
              <select
                value={uploadMilestone}
                onChange={(e) => setUploadMilestone(e.target.value)}
                disabled={!uploadPhase}
                className="text-[11px] px-2 py-1 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth disabled:opacity-50"
              >
                <option value="">Optional</option>
                {uploadPhaseMilestones.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
              <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
                Caption
              </label>
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Describe what this photo shows..."
                className="text-[11px] px-2 py-1 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth placeholder:text-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-muted flex items-center gap-1">
              <MapPin size={10} />
              GPS auto-captured
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelUpload}
                className="px-3 py-1 text-[11px] text-muted hover:text-earth rounded-[var(--radius)] border border-border hover:border-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Photo grid */}
      <SectionLabel>
        {filterPhase !== "ALL" ? `${PHASE_NAMES[filterPhase as ProjectPhase]} photos` : "All photos"}{" "}
        ({filteredPhotos.length})
      </SectionLabel>
      {filteredPhotos.length === 0 && !showUploadForm && (
        <EmptyState
          icon={<Camera size={24} />}
          title="No photos yet"
          description="Upload construction photos to document progress and verify milestones."
          action={{ label: "Upload photos", onClick: () => setShowUploadForm(true) }}
        />
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-5 animate-stagger">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setLightboxIndex(idx)}
            className="aspect-square bg-surface-alt border border-border rounded-[var(--radius)] relative cursor-pointer hover:border-earth hover:shadow-[var(--shadow-sm)] hover:scale-[1.03] transition-all duration-200 overflow-hidden group"
          >
            {photo.fileUrl ? (
              <img
                src={photo.fileUrl}
                alt={photo.caption || "Site photo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <ImageIcon size={20} className="text-muted" />
              </div>
            )}

            {/* Phase badge */}
            <span className="absolute top-1 left-1 text-[7px] px-1.5 py-0.5 rounded bg-earth text-sand/90">
              {photo.phase ? PHASE_NAMES[photo.phase as ProjectPhase] || photo.phase : ""}
            </span>

            {/* Timestamp */}
            {photo.date && (
              <span className="absolute top-1 right-1 text-[7px] px-1.5 py-0.5 rounded bg-black/50 text-white/80">
                {formatDate(photo.date)}
              </span>
            )}

            {/* Hover overlay with caption */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {photo.caption && (
                <p className="text-[9px] text-white/90 line-clamp-2">{photo.caption}</p>
              )}
              {photo.date && (
                <p className="text-[8px] text-white/60 mt-0.5 flex items-center gap-1">
                  <Calendar size={8} />
                  {formatDate(photo.date)} {formatTime(photo.date)}
                </p>
              )}
              {photo.latitude != null && photo.longitude != null && (
                <p className="text-[8px] text-white/60 mt-0.5 flex items-center gap-1">
                  <MapPin size={8} />
                  GPS tagged
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Upload button */}
        <label className="aspect-square border border-dashed border-border-dark rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-warm/30 transition-colors group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 size={20} className="text-earth animate-spin" />
          ) : (
            <Plus size={20} className="text-muted group-hover:text-earth transition-colors" />
          )}
          <span className="text-[8px] text-muted group-hover:text-earth mt-1">
            {uploading ? "Uploading..." : "Upload"}
          </span>
        </label>
      </div>

      {/* Milestone-based organization for current phase */}
      {currentPhaseDef && (
        <>
          <SectionLabel>
            Milestone verification -- {PHASE_NAMES[currentPhaseKey as ProjectPhase]}
          </SectionLabel>
          <div className="space-y-1 mb-4">
            {currentPhaseDef.milestones.map((milestone) => {
              const milestonePhotos = currentPhasePhotos.filter(
                (p) => p.caption?.trim().toLowerCase().includes(milestone.name.trim().toLowerCase())
              );
              const hasPhotos = milestonePhotos.length > 0;

              return (
                <div
                  key={milestone.name}
                  className="flex items-center justify-between px-3 py-1.5 border border-border rounded-[var(--radius)] bg-surface hover:bg-surface-alt transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[11px] font-medium text-earth truncate">
                      {milestone.name}
                    </span>
                    {milestone.verificationRequired && (
                      <Badge variant={hasPhotos ? "success" : "warning"}>
                        {hasPhotos ? `${milestonePhotos.length}` : "Needs photos"}
                      </Badge>
                    )}
                    {!milestone.verificationRequired && hasPhotos && (
                      <Badge variant="info">
                        {milestonePhotos.length}
                      </Badge>
                    )}
                  </div>

                  {hasPhotos && (
                    <div className="flex gap-0.5 ml-2 flex-shrink-0">
                      {milestonePhotos.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="w-6 h-6 rounded overflow-hidden border border-border"
                        >
                          <img
                            src={p.fileUrl}
                            alt={p.caption || "Project photo"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {milestonePhotos.length > 3 && (
                        <span className="text-[8px] font-data text-muted self-center ml-0.5">
                          +{milestonePhotos.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Lightbox */}
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
