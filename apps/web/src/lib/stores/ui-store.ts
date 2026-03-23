"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Zustand store for UI preferences that persist across sessions.
 *
 * Replaces scattered localStorage calls with a single typed store.
 */

interface UIStore {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // AI Mentor
  mentorDisabled: boolean;
  setMentorDisabled: (disabled: boolean) => void;

  // Notification dismissals
  dismissedNotifications: string[];
  readNotifications: string[];
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;

  // Email verification banner
  verifyDismissed: boolean;
  dismissVerifyBanner: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // AI Mentor
      mentorDisabled: false,
      setMentorDisabled: (disabled) => set({ mentorDisabled: disabled }),

      // Notifications
      dismissedNotifications: [],
      readNotifications: [],
      dismissNotification: (id) =>
        set((s) => ({
          dismissedNotifications: [...new Set([...s.dismissedNotifications, id])],
        })),
      markNotificationRead: (id) =>
        set((s) => ({
          readNotifications: [...new Set([...s.readNotifications, id])],
        })),

      // Email verify
      verifyDismissed: false,
      dismissVerifyBanner: () => set({ verifyDismissed: true }),
    }),
    {
      name: "keystone-ui",
    }
  )
);
