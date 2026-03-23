"use client";

import { create } from "zustand";
import type { User } from "firebase/auth";

/**
 * Zustand store for authentication state.
 *
 * Can replace AuthContext for simpler consumption — any component can
 * call useAuthStore() without being wrapped in a provider.
 */

export interface UserProfile {
  name: string;
  email: string;
  market: string;
  plan: string;
  currency: string;
  locale: string;
  timezone: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  billingInterval?: string | null;
  trialExpiresAt?: string | null;
  trialCodeUsed?: string | null;
  emailVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
}));
