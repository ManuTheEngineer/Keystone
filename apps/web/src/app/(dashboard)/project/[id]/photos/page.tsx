"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useTopbar } from "../../../layout";
import { subscribeToPhotos, type PhotoData } from "@/lib/services/project-service";
import { uploadProjectPhoto } from "@/lib/services/photo-upload-service";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ImageIcon, Plus, Loader2 } from "lucide-react";

export default function PhotosPage() {
  const params = useParams();
  const { setTopbar } = useTopbar();
  const projectId = params.id as string;
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeToPhotos(projectId, setPhotos);
    return unsub;
  }, [projectId]);

  useEffect(() => {
    setTopbar("Photos", `${photos.length} photos`, "info");
  }, [setTopbar, photos.length]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadProjectPhoto(projectId, file, "Build");
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <SectionLabel>Geotagged site documentation</SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square bg-surface-alt border border-border rounded-[var(--radius)] relative cursor-pointer hover:border-border-dark transition-colors overflow-hidden"
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
            <span className="absolute bottom-1 right-1 text-[7px] px-1.5 py-0.5 rounded bg-earth text-sand/70">
              {photo.phase}
            </span>
          </div>
        ))}

        {/* Upload button */}
        <label className="aspect-square border border-dashed border-border-dark rounded-[var(--radius)] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 size={20} className="text-emerald-600 animate-spin" />
          ) : (
            <Plus size={20} className="text-muted group-hover:text-emerald-600 transition-colors" />
          )}
          <span className="text-[8px] text-muted group-hover:text-emerald-600 mt-1">
            {uploading ? "Uploading..." : "Upload"}
          </span>
        </label>
      </div>

      <div className="mt-5 p-4 rounded-[var(--radius)] bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-800 leading-relaxed">
        <p className="font-semibold mb-1">Why photo documentation matters</p>
        <p>
          Timestamped, geotagged photos serve as your evidence trail. They verify contractor
          progress, document conditions before walls close up (critical for rough-in inspections),
          and provide proof of work for draw requests to lenders. For diaspora builders managing
          remotely, photos are the primary trust mechanism. Images are automatically compressed
          to under 800KB for reliable upload on slow connections.
        </p>
      </div>
    </>
  );
}
