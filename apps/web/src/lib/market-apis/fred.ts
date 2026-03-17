const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

export async function fetchMortgageRate(): Promise<number | null> {
  const key = process.env.FRED_API_KEY;
  if (!key) return null;

  try {
    const url = `${FRED_BASE}?series_id=MORTGAGE30US&api_key=${key}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const val = data?.observations?.[0]?.value;
    if (!val || val === ".") return null;
    return Number(val);
  } catch {
    return null;
  }
}
