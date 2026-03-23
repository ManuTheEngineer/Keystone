"use client";

import { useQuery } from "@tanstack/react-query";
import type { LocationData } from "@keystone/market-data";

/**
 * TanStack Query hook for fetching location-specific market data.
 *
 * Replaces raw fetch() calls with cached, deduplicated queries.
 * Multiple components reading the same location data share one request.
 */

interface LocationResponse {
  data: LocationData | null;
  meta?: { source: string };
}

async function fetchLocationData(query: string, market: string): Promise<LocationResponse> {
  const params = new URLSearchParams({ q: query, market });
  const res = await fetch(`/api/location-data/?${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch location data");
  }
  return res.json();
}

export function useLocationData(query: string, market: string = "USA") {
  return useQuery<LocationResponse>({
    queryKey: ["location-data", query, market],
    queryFn: () => fetchLocationData(query, market),
    enabled: query.length > 0,
    staleTime: 10 * 60 * 1000, // Location data stays fresh for 10 minutes
  });
}

async function fetchMortgageRate(): Promise<{ data: { rate: number }; meta?: { source: string } }> {
  const res = await fetch("/api/location-data/mortgage-rate/");
  if (!res.ok) throw new Error("Failed to fetch mortgage rate");
  return res.json();
}

export function useMortgageRate() {
  return useQuery({
    queryKey: ["mortgage-rate"],
    queryFn: fetchMortgageRate,
    staleTime: 60 * 60 * 1000, // Mortgage rate stays fresh for 1 hour
  });
}
