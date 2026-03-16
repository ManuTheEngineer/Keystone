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
import { uploadProjectPhoto } from "@/lib/services/photo-upload-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import { getMarketData, getPhaseDefinition, PHASE_ORDER, PHASE_NAMES } from "@keystone/market-data";
import type { Market, ProjectPhase } from "@keystone/market-data";
import { ImageIcon, Plus, Loader2, X, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

export function PhotosClient() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const { user } = useAuth();
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
    setTopbar("Photos", `${photos.length} photos`, "info");
  }, [setTopbar, photos.length]);

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
      const from = new Date(filterDateFrom).getTime();
      result = result.filter((p) => p.date && new Date(p.date).getTime() >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86400000; // include end of day
      result = result.filter((p) => p.date && new Date(p.date).getTime() < to);
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
    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const phase = uploadPhase || "BUILD";
        const caption = [uploadCaption, uploadMilestone ? `Milestone: ${uploadMilestone}` : ""]
          .filter(Boolean)
          .join(" | ");
        await uploadProjectPhoto(user.uid, projectId, file, phase, caption || undefined);
      }
    } catch (err) {
      console.error("Upload failed:", err);
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
        <Card className="mb-5 border-earth">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-semibold text-earth">
              Upload {selectedFiles.length} photo{selectedFiles.length !== 1 ? "s" : ""}
            </h3>
            <button onClick={handleCancelUpload} className="text-muted hover:text-earth">
              <X size={16} />
            </button>
          </div>

          {/* File previews */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {selectedFiles.map((file, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-[var(--radius)] overflow-hidden border border-border flex-shrink-0"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
                Phase
              </label>
              <select
                value={uploadPhase}
                onChange={(e) => {
                  setUploadPhase(e.target.value);
                  setUploadMilestone("");
                }}
                className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth"
              >
                <option value="">Select phase</option>
                {PHASE_ORDER.map((phase) => (
                  <option key={phase} value={phase}>
                    {PHASE_NAMES[phase]}
                  </option>
                ))}
              </select>
              <span className="text-[9px] text-muted">
                Which construction phase does this photo document?
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
                Milestone
              </label>
              <select
                value={uploadMilestone}
                onChange={(e) => setUploadMilestone(e.target.value)}
                disabled={!uploadPhase}
                className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth disabled:opacity-50"
              >
                <option value="">Select milestone (optional)</option>
                {uploadPhaseMilestones.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="text-[9px] text-muted">
                Link this photo to a specific milestone for verification.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <label className="text-[9px] uppercase tracking-wider text-muted font-medium">
              Caption
            </label>
            <input
              type="text"
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              placeholder="Describe what this photo shows..."
              className="text-[12px] px-2.5 py-1.5 rounded-[var(--radius)] border border-border bg-surface text-earth focus:outline-none focus:border-earth placeholder:text-muted/50"
            />
            <span className="text-[9px] text-muted">
              A caption helps you and your team identify photos later.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted mb-4">
            <MapPin size={12} />
            Geolocation will be auto-captured if available.
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium rounded-[var(--radius)] bg-earth text-warm hover:bg-earth-light transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Upload
                </>
              )}
            </button>
            <button
              onClick={handleCancelUpload}
              className="px-4 py-2 text-[12px] text-muted hover:text-earth rounded-[var(--radius)] border border-border hover:border-earth transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Photo grid */}
      <SectionLabel>
        {filterPhase !== "ALL" ? `${PHASE_NAMES[filterPhase as ProjectPhase]} photos` : "All photos"}{" "}
        ({filteredPhotos.length})
      </SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-5">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setLightboxIndex(idx)}
            className="aspect-square bg-surface-alt border border-border rounded-[var(--radius)] relative cursor-pointer hover:border-earth hover:shadow-[var(--shadow-sm)] transition-all overflow-hidden group"
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
        <label className="aspect-square border border-dashed border-border-dark rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer hover:border-earth hover:bg-warm/30 transition-colors group">
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
          <div className="space-y-2 mb-5">
            {currentPhaseDef.milestones.map((milestone) => {
              const milestonePhotos = currentPhasePhotos.filter(
                (p) => p.caption?.includes(milestone.name)
              );
              const hasPhotos = milestonePhotos.length > 0;

              return (
                <Card key={milestone.name} padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-earth truncate">
                          {milestone.name}
                        </span>
                        {milestone.verificationRequired && (
                          <Badge variant={hasPhotos ? "success" : "warning"}>
                            {hasPhotos ? `${milestonePhotos.length} photo${milestonePhotos.length !== 1 ? "s" : ""}` : "Needs photos"}
                          </Badge>
                        )}
                        {!milestone.verificationRequired && hasPhotos && (
                          <Badge variant="info">
                            {milestonePhotos.length} photo{milestonePhotos.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[9px] text-muted mt-0.5 line-clamp-1">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Thumbnail strip */}
                    {hasPhotos && (
                      <div className="flex gap-1 ml-3 flex-shrink-0">
                        {milestonePhotos.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="w-8 h-8 rounded overflow-hidden border border-border"
                          >
                            <img
                              src={p.fileUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {milestonePhotos.length > 3 && (
                          <div className="w-8 h-8 rounded border border-border flex items-center justify-center bg-surface-alt">
                            <span className="text-[8px] font-data text-muted">
                              +{milestonePhotos.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Educational note */}
      <div className="p-4 rounded-[var(--radius)] bg-warm border border-sand/30 text-[12px] text-earth leading-relaxed">
        <p className="font-semibold mb-1">Why photo documentation matters</p>
        <p>
          Timestamped, geotagged photos serve as your evidence trail. They verify contractor
          progress, document conditions before walls close up (critical for rough-in inspections),
          and provide proof of work for draw requests to lenders. For diaspora builders managing
          remotely, photos are the primary trust mechanism. Images are automatically compressed
          to under 800KB for reliable upload on slow connections.
        </p>
      </div>

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
