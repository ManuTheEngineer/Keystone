import { fetchMortgageRate } from "@/lib/market-apis/fred";
import { cacheGet, cacheSet } from "@/lib/market-apis/cache";
import { apiSuccess } from "@/lib/api-response";

export async function GET() {
  const cached = await cacheGet<{ rate: number }>("mortgage", "current");
  if (cached) {
    return apiSuccess({ rate: cached.rate }, { meta: { source: "cache" } });
  }

  const rate = await fetchMortgageRate();
  if (rate) {
    await cacheSet("mortgage", "current", { rate });
    return apiSuccess({ rate }, { meta: { source: "api" } });
  }

  // Fallback to a reasonable default
  return apiSuccess({ rate: 6.875 }, { meta: { source: "default" } });
}
