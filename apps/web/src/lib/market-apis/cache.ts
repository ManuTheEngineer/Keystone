import { dbGet, dbPatch } from "@/lib/firebase-rest";

export type CacheCategory = "location" | "mortgage" | "cpi";

const TTL_MAP: Record<CacheCategory, number> = {
  location: 30 * 24 * 60 * 60 * 1000,  // 30 days
  mortgage: 7 * 24 * 60 * 60 * 1000,   // 7 days
  cpi: 90 * 24 * 60 * 60 * 1000,       // 90 days
};

export async function cacheGet<T>(category: CacheCategory, key: string): Promise<T | null> {
  try {
    const entry = await dbGet(`locationCache/${category}/${encodeKey(key)}`);
    if (!entry || !entry.data || !entry.fetchedAt) return null;
    const age = Date.now() - new Date(entry.fetchedAt).getTime();
    if (age > TTL_MAP[category]) return null;
    return entry.data as T;
  } catch {
    return null;
  }
}

export async function cacheGetStale<T>(category: CacheCategory, key: string): Promise<T | null> {
  try {
    const entry = await dbGet(`locationCache/${category}/${encodeKey(key)}`);
    if (!entry?.data) return null;
    return entry.data as T;
  } catch {
    return null;
  }
}

export async function cacheSet(category: CacheCategory, key: string, data: unknown): Promise<void> {
  try {
    await dbPatch(`locationCache/${category}/${encodeKey(key)}`, {
      data,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Cache write failure is non-fatal but logged for debugging
    if (typeof console !== "undefined") console.warn("Cache write failed:", err);
  }
}

function encodeKey(key: string): string {
  return key.replace(/[.#$\[\]\/]/g, "_");
}
