import { NextRequest, NextResponse } from "next/server";
import { fetchCensusDataByZip } from "@/lib/market-apis/census";
import { fetchHudFmrByZip } from "@/lib/market-apis/hud";
import { fetchBlsWageByMetro } from "@/lib/market-apis/bls";
import { fetchWorldBankCpi } from "@/lib/market-apis/worldbank";
import { computeLocationData } from "@/lib/market-apis/compute";
import { cacheGet, cacheGetStale, cacheSet } from "@/lib/market-apis/cache";
import { zipToState, STATE_TO_CBSA } from "@/lib/market-apis/zip-to-metro";
import { getClosestLocation } from "@keystone/market-data";
import type { LocationData } from "@keystone/market-data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const market = (request.nextUrl.searchParams.get("market") ?? "USA").toUpperCase();

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  // --- West Africa: curated data with CPI adjustment ---
  if (market !== "USA") {
    const staticData = getClosestLocation(q, market);
    if (!staticData) {
      return NextResponse.json({ data: null, source: "none" });
    }

    // Try CPI inflation adjustment
    const cached = await cacheGet<{ multiplier: number }>("cpi", market);
    let multiplier = cached?.multiplier ?? 1.0;

    if (!cached) {
      const cpi = await fetchWorldBankCpi(market);
      if (cpi) {
        multiplier = cpi.inflationMultiplier;
        await cacheSet("cpi", market, { multiplier, ...cpi });
      }
    }

    if (multiplier !== 1.0 && Math.abs(multiplier - 1.0) > 0.005) {
      const adjusted = { ...staticData };
      if (adjusted.landPricePerSqm) {
        adjusted.landPricePerSqm = {
          low: Math.round(adjusted.landPricePerSqm.low * multiplier),
          mid: Math.round(adjusted.landPricePerSqm.mid * multiplier),
          high: Math.round(adjusted.landPricePerSqm.high * multiplier),
        };
      }
      adjusted.landPricePerAcre = {
        low: Math.round(adjusted.landPricePerAcre.low * multiplier),
        mid: Math.round(adjusted.landPricePerAcre.mid * multiplier),
        high: Math.round(adjusted.landPricePerAcre.high * multiplier),
      };
      adjusted.permitCostEstimate = Math.round(adjusted.permitCostEstimate * multiplier);
      if (adjusted.avgRentPerSqm) {
        adjusted.avgRentPerSqm = Math.round(adjusted.avgRentPerSqm * multiplier);
      }
      adjusted.localNotes = `${adjusted.localNotes} Costs adjusted for ${((multiplier - 1) * 100).toFixed(1)}% inflation since 2025.`;
      return NextResponse.json({ data: adjusted, source: "curated+cpi" });
    }

    return NextResponse.json({ data: staticData, source: "curated" });
  }

  // --- USA: extract or resolve ZIP code ---
  let zip: string | null = q.match(/\b(\d{5})\b/)?.[1] ?? null;

  // If no ZIP provided, try Census Geocoder to resolve city name → ZIP
  if (!zip) {
    try {
      // Census geocoder works best with "city, state" format
      const searchAddr = q.includes(",") ? q : `${q}, USA`;
      const geoUrl = `https://geocoding.geo.census.gov/geocoder/addresses/onelineaddress?address=${encodeURIComponent(searchAddr)}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const match = geoData?.result?.addressMatches?.[0];
        // Try to extract ZIP from matched address
        const matchedAddr = match?.matchedAddress ?? "";
        const addrZip = matchedAddr.match(/(\d{5})/)?.[1];
        if (addrZip) zip = addrZip;
      }
    } catch {
      // Geocoder failed or timed out — fall through to static
    }
  }

  if (!zip) {
    // Still no ZIP — fall back to static fuzzy matching
    const staticData = getClosestLocation(q, "USA");
    return NextResponse.json({ data: staticData, source: "static" });
  }

  // Check cache
  const cached = await cacheGet<LocationData>("location", zip);
  if (cached) {
    return NextResponse.json({ data: cached, source: "cache" });
  }

  // Determine state + CBSA
  const state = zipToState(zip);
  const cbsa = state ? STATE_TO_CBSA[state] : null;

  // Parallel fetch
  const [census, hud, bls] = await Promise.all([
    fetchCensusDataByZip(zip),
    fetchHudFmrByZip(zip),
    cbsa ? fetchBlsWageByMetro(cbsa) : Promise.resolve(null),
  ]);

  // All APIs failed — try stale cache, then static
  if (!census && !hud) {
    const stale = await cacheGetStale<LocationData>("location", zip);
    if (stale) {
      return NextResponse.json({ data: stale, source: "stale-cache" });
    }
    const staticData = getClosestLocation(q, "USA");
    return NextResponse.json({ data: staticData, source: "static" });
  }

  // Compute from API data
  const locationData = computeLocationData(zip, state ?? "", census, hud, bls);

  // Cache result
  await cacheSet("location", zip, locationData);

  return NextResponse.json({ data: locationData, source: "api" });
}
