const HUD_BASE = "https://www.huduser.gov/hudapi/public";

export interface HudFmrData {
  efficiency: number;
  oneBr: number;
  twoBr: number;
  threeBr: number;
  fourBr: number;
  county: string;
  metroName: string;
  year: number;
}

export async function fetchHudFmrByZip(zip: string): Promise<HudFmrData | null> {
  const token = process.env.HUD_API_TOKEN;
  if (!token) return null;

  try {
    const xwalkRes = await fetch(`${HUD_BASE}/usps?type=2&query=${zip}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!xwalkRes.ok) return null;
    const xwalkData = await xwalkRes.json();
    if (!xwalkData?.data?.results?.[0]) return null;

    const countyFips = xwalkData.data.results[0].geoid;
    const countyName = xwalkData.data.results[0].county || "";

    const fmrRes = await fetch(`${HUD_BASE}/fmr/data/${countyFips}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!fmrRes.ok) return null;
    const fmrData = await fmrRes.json();
    const d = fmrData?.data;
    if (!d) return null;

    return {
      efficiency: d.efficiency ?? d.Efficiency ?? 0,
      oneBr: d.one_bedroom ?? d.One_Bedroom ?? 0,
      twoBr: d.two_bedroom ?? d.Two_Bedroom ?? 0,
      threeBr: d.three_bedroom ?? d.Three_Bedroom ?? 0,
      fourBr: d.four_bedroom ?? d.Four_Bedroom ?? 0,
      county: countyName,
      metroName: d.metro_name ?? d.areaname ?? "",
      year: d.year ?? new Date().getFullYear(),
    };
  } catch {
    return null;
  }
}
