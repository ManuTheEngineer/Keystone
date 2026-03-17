import { NextResponse } from "next/server";
import { fetchMortgageRate } from "@/lib/market-apis/fred";
import { cacheGet, cacheSet } from "@/lib/market-apis/cache";

export async function GET() {
  // Check cache first (7-day TTL)
  const cached = await cacheGet<{ rate: number }>("mortgage", "current");
  if (cached) {
    return NextResponse.json({ rate: cached.rate, source: "cache" });
  }

  const rate = await fetchMortgageRate();
  if (rate) {
    await cacheSet("mortgage", "current", { rate });
    return NextResponse.json({ rate, source: "api" });
  }

  // Fallback to a reasonable default
  return NextResponse.json({ rate: 6.875, source: "default" });
}
