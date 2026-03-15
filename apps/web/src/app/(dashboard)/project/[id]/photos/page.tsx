"use client";

import { useEffect } from "react";
import { useTopbar } from "../../../layout";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ImageIcon, Plus } from "lucide-react";

const MOCK_PHOTOS = [
  { date: "Mar 3", phase: "Foundation" },
  { date: "Mar 4", phase: "Foundation" },
  { date: "Mar 5", phase: "Framing" },
  { date: "Mar 6", phase: "Framing" },
  { date: "Mar 7", phase: "Framing" },
  { date: "Mar 8", phase: "Framing" },
  { date: "Mar 9", phase: "Envelope" },
  { date: "Mar 10", phase: "Envelope" },
  { date: "Mar 11", phase: "Envelope" },
  { date: "Mar 12", phase: "Rough-in" },
  { date: "Mar 13", phase: "Rough-in" },
  { date: "Mar 14", phase: "Rough-in" },
];

export default function PhotosPage() {
  const { setTopbar } = useTopbar();

  useEffect(() => {
    setTopbar("Photos", "47 photos", "info");
  }, [setTopbar]);

  return (
    <>
      <SectionLabel>Geotagged site documentation</SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
        {MOCK_PHOTOS.map((photo, i) => (
          <div
            key={i}
            className="aspect-square bg-surface-alt border border-border rounded-[var(--radius)] flex flex-col items-center justify-center relative cursor-pointer hover:border-border-dark transition-colors"
          >
            <ImageIcon size={20} className="text-muted" />
            <span className="text-[8px] text-muted mt-1">{photo.date}</span>
            <span className="absolute bottom-1 right-1 text-[7px] px-1.5 py-0.5 rounded bg-earth text-sand/70">
              {photo.phase}
            </span>
          </div>
        ))}
        {/* Upload button */}
        <div className="aspect-square border border-dashed border-border-dark rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors group">
          <Plus size={20} className="text-muted group-hover:text-emerald-600 transition-colors" />
          <span className="text-[8px] text-muted group-hover:text-emerald-600 mt-1">Upload</span>
        </div>
      </div>

      {/* Educational callout */}
      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Why photo documentation matters</p>
        <p>
          Timestamped, geotagged photos serve as your evidence trail. They verify contractor
          progress, document conditions before walls close up (critical for rough-in inspections),
          and provide proof of work for draw requests to lenders. For diaspora builders managing
          remotely, photos are the primary trust mechanism.
        </p>
      </div>
    </>
  );
}
