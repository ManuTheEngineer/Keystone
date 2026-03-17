const BLS_BASE = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

export interface BlsWageData {
  constructionMeanWage: number;
  area: string;
}

export const NATIONAL_CONSTRUCTION_WAGE = 52520;

export async function fetchBlsWageByMetro(cbsaCode: string): Promise<BlsWageData | null> {
  const key = process.env.BLS_API_KEY;
  if (!key) return null;

  const paddedCbsa = cbsaCode.padStart(7, "0");
  const seriesId = `OEUM${paddedCbsa}470000004`;

  try {
    const res = await fetch(BLS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: [seriesId],
        startyear: String(new Date().getFullYear() - 1),
        endyear: String(new Date().getFullYear()),
        registrationkey: key,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const series = data?.Results?.series?.[0];
    if (!series?.data?.[0]) return null;

    return {
      constructionMeanWage: Number(series.data[0].value) || NATIONAL_CONSTRUCTION_WAGE,
      area: cbsaCode,
    };
  } catch {
    return null;
  }
}
