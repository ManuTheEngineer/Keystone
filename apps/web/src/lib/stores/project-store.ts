"use client";

import { create } from "zustand";
import {
  subscribeToProject,
  subscribeToBudgetItems,
  subscribeToContacts,
  subscribeToDailyLogs,
  subscribeToPhotos,
  subscribeToTasks,
  subscribeToPunchListItems,
} from "@/lib/services/project-service";
import type {
  ProjectData,
  BudgetItemData,
  ContactData,
  DailyLogData,
  PhotoData,
  TaskData,
  PunchListItemData,
} from "@/lib/services/project-service";

/**
 * Zustand store for the currently active project workspace.
 *
 * Replaces per-page Firebase subscriptions with a single shared store.
 * All project subpages (budget, schedule, team, photos, etc.) read from
 * this store instead of creating their own subscriptions.
 */

interface ProjectStore {
  // Data
  project: ProjectData | null;
  budgetItems: BudgetItemData[];
  contacts: ContactData[];
  dailyLogs: DailyLogData[];
  photos: PhotoData[];
  tasks: TaskData[];
  punchListItems: PunchListItemData[];

  // Loading states
  loading: boolean;
  activeProjectId: string | null;
  activeUserId: string | null;

  // Actions
  subscribe: (userId: string, projectId: string) => void;
  unsubscribe: () => void;

  // Internal — stored cleanup functions
  _unsubscribers: (() => void)[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,
  budgetItems: [],
  contacts: [],
  dailyLogs: [],
  photos: [],
  tasks: [],
  punchListItems: [],
  loading: true,
  activeProjectId: null,
  activeUserId: null,
  _unsubscribers: [],

  subscribe: (userId: string, projectId: string) => {
    const state = get();

    // Already subscribed to this project — skip
    if (state.activeProjectId === projectId && state.activeUserId === userId) {
      return;
    }

    // Clean up existing subscriptions
    state.unsubscribe();

    set({ loading: true, activeProjectId: projectId, activeUserId: userId });

    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeToProject(userId, projectId, (project) => {
        set({ project, loading: false });
      })
    );

    unsubs.push(
      subscribeToBudgetItems(userId, projectId, (items) => {
        set({ budgetItems: items });
      })
    );

    unsubs.push(
      subscribeToContacts(userId, projectId, (contacts) => {
        set({ contacts });
      })
    );

    unsubs.push(
      subscribeToDailyLogs(userId, projectId, (logs) => {
        set({ dailyLogs: logs });
      })
    );

    unsubs.push(
      subscribeToPhotos(userId, projectId, (photos) => {
        set({ photos });
      })
    );

    unsubs.push(
      subscribeToTasks(userId, projectId, (tasks) => {
        set({ tasks });
      })
    );

    unsubs.push(
      subscribeToPunchListItems(userId, projectId, (items) => {
        set({ punchListItems: items });
      })
    );

    set({ _unsubscribers: unsubs });
  },

  unsubscribe: () => {
    const { _unsubscribers } = get();
    for (const unsub of _unsubscribers) {
      unsub();
    }
    set({
      project: null,
      budgetItems: [],
      contacts: [],
      dailyLogs: [],
      photos: [],
      tasks: [],
      punchListItems: [],
      loading: true,
      activeProjectId: null,
      activeUserId: null,
      _unsubscribers: [],
    });
  },
}));
