"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";
import { Badge } from "./Badge";
import type { PhotoData } from "@/lib/services/project-service";

export interface PhotoLightboxProps {
  photos: PhotoData[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  const dateStr = photo.date
    ? new Date(photo.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* Previous arrow */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label="Previous photo"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          aria-label="Next photo"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Content */}
      <div className="flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        {/* Image */}
        <div className="relative flex items-center justify-center flex-1 min-h-0">
          <img
            src={photo.fileUrl}
            alt={photo.caption || "Site photo"}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        </div>

        {/* Metadata bar */}
        <div className="mt-4 w-full max-w-lg bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">{photo.phase || "Unassigned"}</Badge>
            <span className="text-[11px] text-white/60">
              {currentIndex + 1} of {photos.length}
            </span>
          </div>

          {photo.caption && (
            <p className="text-[13px] text-white/90 mb-2">{photo.caption}</p>
          )}

          <div className="flex flex-wrap gap-4 text-[11px] text-white/60">
            {dateStr && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {dateStr}
              </span>
            )}
            {photo.latitude != null && photo.longitude != null && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {Number(photo.latitude).toFixed(5)}, {Number(photo.longitude).toFixed(5)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
