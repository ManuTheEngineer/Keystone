/**
 * Analysis Service
 *
 * Save, load, and manage Deal Analyzer analyses in Firebase.
 * Analyses are stored under users/{uid}/analyses/{analysisId}.
 */

import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import type { AnalysisInput, AnalysisResults } from "./deal-analyzer-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SavedAnalysis {
  id: string;
  userId: string;
  name: string;
  input: AnalysisInput;
  results: AnalysisResults;
  createdAt: string;
  updatedAt: string;
  /** If this analysis was converted to a project, store the project ID */
  projectId?: string;
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function saveAnalysis(
  userId: string,
  name: string,
  input: AnalysisInput,
  results: AnalysisResults,
): Promise<string> {
  const analysesRef = ref(db, `users/${userId}/analyses`);
  const newRef = push(analysesRef);
  const now = new Date().toISOString();
  await set(newRef, {
    userId,
    name,
    input,
    results: serializeResults(results),
    createdAt: now,
    updatedAt: now,
  });
  return newRef.key!;
}

export async function updateAnalysis(
  userId: string,
  analysisId: string,
  input: AnalysisInput,
  results: AnalysisResults,
  name?: string,
): Promise<void> {
  const updates: Record<string, unknown> = {
    input,
    results: serializeResults(results),
    updatedAt: new Date().toISOString(),
  };
  if (name !== undefined) updates.name = name;
  await update(ref(db, `users/${userId}/analyses/${analysisId}`), updates);
}

export async function deleteAnalysis(userId: string, analysisId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/analyses/${analysisId}`));
}

export async function getAnalysis(userId: string, analysisId: string): Promise<SavedAnalysis | null> {
  const snapshot = await get(ref(db, `users/${userId}/analyses/${analysisId}`));
  if (!snapshot.exists()) return null;
  return { id: analysisId, ...snapshot.val() } as SavedAnalysis;
}

export async function getUserAnalyses(userId: string): Promise<SavedAnalysis[]> {
  const snapshot = await get(ref(db, `users/${userId}/analyses`));
  if (!snapshot.exists()) return [];
  const analyses: SavedAnalysis[] = [];
  snapshot.forEach((child) => {
    analyses.push({ id: child.key!, ...child.val() });
  });
  // Sort newest first
  return analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function subscribeToUserAnalyses(
  userId: string,
  callback: (analyses: SavedAnalysis[]) => void,
): Unsubscribe {
  const analysesRef = ref(db, `users/${userId}/analyses`);
  return onValue(analysesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const analyses: SavedAnalysis[] = [];
    snapshot.forEach((child) => {
      analyses.push({ id: child.key!, ...child.val() });
    });
    callback(analyses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });
}

export async function linkAnalysisToProject(
  userId: string,
  analysisId: string,
  projectId: string,
): Promise<void> {
  await update(ref(db, `users/${userId}/analyses/${analysisId}`), {
    projectId,
    updatedAt: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Serialization helper -- strip non-serializable fields
// ---------------------------------------------------------------------------

function serializeResults(results: AnalysisResults): Record<string, unknown> {
  return {
    dealScore: results.dealScore,
    dealScoreSummary: results.dealScoreSummary,
    totalCost: results.totalCost,
    constructionCost: results.constructionCost,
    landCost: results.landCost,
    softCosts: results.softCosts,
    financingCosts: results.financingCosts,
    contingency: results.contingency,
    monthlyCost: results.monthlyCost,
    roi: results.roi,
    dtiRatio: results.dtiRatio,
    ltvRatio: results.ltvRatio,
    costPerUnit: results.costPerUnit,
    riskFlags: results.riskFlags,
    // currency and locationData are derived; store market key instead
    currency: results.currency ? { code: results.currency.code, symbol: results.currency.symbol } : null,
  };
}
