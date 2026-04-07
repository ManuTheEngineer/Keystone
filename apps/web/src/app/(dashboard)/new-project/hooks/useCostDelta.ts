"use client";

import { useMemo } from "react";
import { getCostDelta } from "@/lib/config/detailed-cost-engine";

export function useCostDelta(
  category: string,
  candidateId: string,
  currentId: string,
  buildingSqft: number,
  market: string,
): number | undefined {
  return useMemo(() => {
    if (!market || !candidateId || candidateId === currentId) return undefined;
    if (buildingSqft <= 0) return undefined;
    return getCostDelta(market, category, candidateId, currentId, buildingSqft);
  }, [category, candidateId, currentId, buildingSqft, market]);
}
