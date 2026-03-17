const WB_BASE = "https://api.worldbank.org/v2";

export interface CpiData {
  country: string;
  latestCpi: number;
  latestYear: number;
  baselineCpi: number;
  baselineYear: number;
  inflationMultiplier: number;
}

const BASELINE_YEAR = 2025;

const COUNTRY_CODES: Record<string, string> = {
  TOGO: "TGO",
  GHANA: "GHA",
  BENIN: "BEN",
};

export async function fetchWorldBankCpi(market: string): Promise<CpiData | null> {
  const code = COUNTRY_CODES[market.toUpperCase()];
  if (!code) return null;

  try {
    const url = `${WB_BASE}/country/${code}/indicator/FP.CPI.TOTL?format=json&date=${BASELINE_YEAR - 2}:${BASELINE_YEAR + 2}&per_page=10`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const records = json?.[1];
    if (!records || records.length === 0) return null;

    const sorted = records
      .filter((r: any) => r.value != null)
      .sort((a: any, b: any) => Number(b.date) - Number(a.date));

    if (sorted.length === 0) return null;

    const latest = sorted[0];
    const baseline = sorted.find((r: any) => Number(r.date) <= BASELINE_YEAR) ?? sorted[sorted.length - 1];

    const latestCpi = Number(latest.value);
    const baselineCpi = Number(baseline.value);
    const multiplier = baselineCpi > 0 ? latestCpi / baselineCpi : 1.0;

    return {
      country: market.toUpperCase(),
      latestCpi,
      latestYear: Number(latest.date),
      baselineCpi,
      baselineYear: Number(baseline.date),
      inflationMultiplier: Math.round(multiplier * 1000) / 1000,
    };
  } catch {
    return null;
  }
}
