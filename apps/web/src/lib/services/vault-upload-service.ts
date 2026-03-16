/**
 * Vault Upload Service
 *
 * Handles file uploads to Firebase Storage for the File Vault feature.
 * Files are stored at: users/{userId}/projects/{projectId}/vault/{filename}
 */

import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadVaultFile(
  userId: string,
  projectId: string,
  file: File,
  _category: string,
  _description?: string
): Promise<{ fileUrl: string; fileSize: number; mimeType: string }> {
  // Generate a unique filename to avoid collisions
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `users/${userId}/projects/${projectId}/vault/${timestamp}_${safeName}`;

  const fileRef = storageRef(storage, path);
  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type,
  });

  const fileUrl = await getDownloadURL(snapshot.ref);

  return {
    fileUrl,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}
