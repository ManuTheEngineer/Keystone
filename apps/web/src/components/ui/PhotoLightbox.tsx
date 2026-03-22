"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Pencil, Trash2, Link2, Check } from "lucide-react";
import { Badge } from "./Badge";
import type { PhotoData } from "@/lib/services/project-service";
import { PHASE_NAMES } from "@keystone/market-data";
import type { ProjectPhase } from "@keystone/market-data";

export interface PhotoLightboxProps {
  photos: PhotoData[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onEditCaption?: (photoId: string, caption: string) => void;
  onDelete?: (photoId: string) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  onEditCaption,
  onDelete,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState("");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editingCaption) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext, editingCaption]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  // Reset editing state on navigation
  useEffect(() => {
    setEditingCaption(false);
  }, [currentIndex]);

  if (!photo) return null;

  const dateStr = photo.date
    ? new Date(photo.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const timeStr = photo.date
    ? new Date(photo.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const phaseName = photo.phase
    ? PHASE_NAMES[photo.phase as ProjectPhase] || photo.phase
    : "Unassigned";

  function startEditCaption() {
    setCaptionDraft(photo.caption || "");
    setEditingCaption(true);
  }

  function saveCaption() {
    if (onEditCaption && photo.id) {
      onEditCaption(photo.id, captionDraft);
    }
    setEditingCaption(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/92">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Counter */}
      <div className="absolute top-3.5 left-3 z-10 text-[10px] font-data text-white/50">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main image area */}
      <div className="flex-1 flex items-center justify-center relative min-w-0">
        {/* Previous arrow */}
        {hasPrev && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors text-white/60 hover:text-white"
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next arrow */}
        {hasNext && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors text-white/60 hover:text-white"
            aria-label="Next photo"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Image */}
        <img
          src={photo.fileUrl}
          alt={photo.caption || "Site photo"}
          className="max-w-[calc(100%-80px)] max-h-[calc(100vh-40px)] object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Metadata sidebar */}
      <div className="w-[260px] flex-shrink-0 bg-[#1a1714] border-l border-white/8 flex flex-col overflow-y-auto">
        <div className="p-4 flex flex-col gap-4">
          {/* Phase badge */}
          <div>
            <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium block mb-1">Phase</span>
            <Badge variant="info">{phaseName}</Badge>
          </div>

          {/* Date */}
          {dateStr && (
            <div>
              <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium block mb-1">Date taken</span>
              <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                <Calendar size={11} className="text-white/40" />
                <span>{dateStr}</span>
                {timeStr && <span className="text-white/40">{timeStr}</span>}
              </div>
            </div>
          )}

          {/* GPS */}
          {photo.latitude != null && photo.longitude != null && (
            <div>
              <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium block mb-1">GPS coordinates</span>
              <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                <MapPin size={11} className="text-white/40" />
                <span className="font-data text-[10px]">
                  {Number(photo.latitude).toFixed(5)}, {Number(photo.longitude).toFixed(5)}
                </span>
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium block mb-1">Caption</span>
            {editingCaption ? (
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  className="w-full text-[11px] bg-white/8 border border-white/15 rounded px-2 py-1.5 text-white/90 resize-none focus:outline-none focus:border-white/30"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={saveCaption}
                    className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-medium rounded bg-white/15 hover:bg-white/20 text-white/80 transition-colors"
                  >
                    <Check size={9} /> Save
                  </button>
                  <button
                    onClick={() => setEditingCaption(false)}
                    className="px-2 py-0.5 text-[9px] text-white/40 hover:text-white/60 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-white/70 leading-relaxed">
                {photo.caption || <span className="text-white/30 italic">No caption</span>}
              </p>
            )}
          </div>

          {/* Milestone (extracted from caption if present) */}
          {photo.caption?.includes("Milestone:") && (
            <div>
              <span className="text-[8px] uppercase tracking-wider text-white/35 font-medium block mb-1">Milestone</span>
              <div className="flex items-center gap-1.5 text-[11px] text-white/70">
                <Link2 size={11} className="text-white/40" />
                <span>{photo.caption.split("Milestone:")[1]?.trim()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions at bottom */}
        <div className="mt-auto border-t border-white/8 p-3 flex gap-2">
          {onEditCaption && (
            <button
              onClick={startEditCaption}
              className="flex items-center gap-1 px-2.5 py-1 text-[9px] rounded bg-white/8 hover:bg-white/12 text-white/50 hover:text-white/70 transition-colors"
            >
              <Pencil size={10} /> Edit caption
            </button>
          )}
          {onDelete && photo.id && (
            <button
              onClick={() => onDelete(photo.id!)}
              className="flex items-center gap-1 px-2.5 py-1 text-[9px] rounded bg-white/8 hover:bg-red-900/40 text-white/50 hover:text-red-300 transition-colors ml-auto"
            >
              <Trash2 size={10} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
