import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  timezone: string;
  locale: string;
  currency: string;
  plan: "FOUNDATION" | "BUILDER" | "DEVELOPER" | "ENTERPRISE";
  createdAt: string;
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await updateProfile(user, { displayName: name });

  const profile: UserProfile = {
    uid: user.uid,
    email,
    name,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: "en",
    currency: "USD",
    plan: "FOUNDATION",
    createdAt: new Date().toISOString(),
  };

  await set(ref(db, `users/${user.uid}`), profile);

  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await get(ref(db, `users/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val() as UserProfile;
  }
  return null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
