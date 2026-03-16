import { ref, get, update } from "firebase/database";
import { db } from "@/lib/firebase";

const ADMIN_EMAIL = "manutheengineer@gmail.com";

export async function isAdmin(uid: string): Promise<boolean> {
  const snapshot = await get(ref(db, `users/${uid}/profile/role`));
  return snapshot.exists() && snapshot.val() === "admin";
}

export async function setAdminAccount(uid: string): Promise<void> {
  await update(ref(db, `users/${uid}/profile`), {
    role: "admin",
    plan: "ENTERPRISE",
  });
}

export function isAdminProfile(profile: { role?: string } | null): boolean {
  return profile?.role === "admin";
}
