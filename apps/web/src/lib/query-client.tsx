"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * TanStack Query provider for server state management.
 *
 * Wraps the app with a QueryClientProvider that caches API responses,
 * deduplicates requests, and provides stale-while-revalidate behavior.
 */

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data from API routes stays fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep unused data in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
        // Retry failed requests once
        retry: 1,
        // Don't refetch when window regains focus (Firebase handles real-time)
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create client once per component lifecycle (avoid re-creating on re-renders)
  const [client] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}
