/**
 * Exchange Rate Service
 *
 * Fetches live USD exchange rates from open.er-api.com with caching.
 * Falls back to approximate defaults if the API is unavailable.
 */

// Defaults updated 2026-03-21 from live API
const DEFAULT_RATES: Record<string, number> = {
  XOF: 567.76,  // CFA Franc (BCEAO) — pegged to EUR at 655.957
  GHS: 10.96,   // Ghana Cedi
  EUR: 0.866,
};

interface CachedRates {
  rates: Record<string, number>;
  fetchedAt: number;
}

let cache: CachedRates | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get USD→target exchange rate. Fetches live data, caches for 1 hour,
 * falls back to defaults on failure.
 */
export async function getExchangeRate(currency: string): Promise<number> {
  const rates = await getAllRates();
  return rates[currency] ?? DEFAULT_RATES[currency] ?? 1;
}

/**
 * Get all cached/live rates.
 */
export async function getAllRates(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        cache = { rates: data.rates, fetchedAt: Date.now() };
        return data.rates;
      }
    }
  } catch {
    // API unavailable — use defaults
  }

  return DEFAULT_RATES;
}

/**
 * Synchronous fallback for contexts where async isn't possible.
 * Returns cached rates if available, otherwise defaults.
 */
export function getExchangeRateSync(currency: string): number {
  if (cache) return cache.rates[currency] ?? DEFAULT_RATES[currency] ?? 1;
  return DEFAULT_RATES[currency] ?? 1;
}

/**
 * Get the rate for a market's currency.
 */
export function getRateForMarket(market: string): { rate: number; currency: string } {
  if (market === "GHANA") return { rate: getExchangeRateSync("GHS"), currency: "GHS" };
  if (market === "TOGO" || market === "BENIN") return { rate: getExchangeRateSync("XOF"), currency: "XOF" };
  return { rate: 1, currency: "USD" };
}

/**
 * Trigger a background fetch to warm the cache.
 */
export function prefetchRates(): void {
  getAllRates().catch(() => {});
}
