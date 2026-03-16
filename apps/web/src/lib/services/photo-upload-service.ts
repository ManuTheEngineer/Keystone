import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { addPhoto, type PhotoData } from "./project-service";

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const MAX_SIZE_KB = 800;
const QUALITY_STEP = 0.05;

/**
 * Compress an image file client-side before upload.
 * Targets max 800KB per CLAUDE.md requirements for West African connectivity.
 */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Progressively reduce quality to hit size target
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            if (blob.size > MAX_SIZE_KB * 1024 && quality > 0.1) {
              quality -= QUALITY_STEP;
              tryCompress();
            } else {
              resolve(blob);
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Extract GPS coordinates from EXIF data if available.
 */
export function extractGeoLocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

/**
 * Upload a photo with compression, geotagging, and Firebase Storage.
 */
export async function uploadProjectPhoto(
  userId: string,
  projectId: string,
  file: File,
  phase: string,
  caption?: string
): Promise<PhotoData> {
  // Compress
  const compressed = await compressImage(file);

  // Geotag
  const geo = await extractGeoLocation();

  // Upload to Firebase Storage
  const timestamp = Date.now();
  const filename = `users/${userId}/projects/${projectId}/photos/${timestamp}_${file.name}`;
  const fileRef = storageRef(storage, filename);
  await uploadBytes(fileRef, compressed, { contentType: "image/jpeg" });
  const fileUrl = await getDownloadURL(fileRef);

  // Create thumbnail path (same file for now; a Cloud Function could generate a real thumbnail)
  const thumbnailUrl = fileUrl;

  // Save metadata to Realtime Database
  const photoData: Omit<PhotoData, "id"> = {
    projectId,
    fileUrl,
    thumbnailUrl,
    phase,
    caption: caption ?? "",
    date: new Date().toISOString(),
    latitude: geo?.latitude,
    longitude: geo?.longitude,
  };

  const photoId = await addPhoto(userId, photoData);

  return { id: photoId, ...photoData };
}
