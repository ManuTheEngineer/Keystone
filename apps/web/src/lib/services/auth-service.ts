import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
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
  role?: "admin" | "user";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing";
  billingInterval?: "monthly" | "annual";
  trialExpiresAt?: string;
  trialCodeUsed?: string;
  tourCompleted?: boolean;
  demoSeeded?: boolean;
  orgLogo?: string;     // Enterprise only: base64 data URL for custom export branding
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

  await set(ref(db, `users/${user.uid}/profile`), profile);

  // Send email verification (non-blocking — don't fail registration if it errors)
  try { await sendEmailVerification(user); } catch {}

  return user;
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
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
  const snapshot = await get(ref(db, `users/${uid}/profile`));
  if (snapshot.exists()) {
    return snapshot.val() as UserProfile;
  }
  return null;
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
