import { NextRequest } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/api-auth";
import { aiChatSchema, parseBody } from "@/lib/validators/api-schemas";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkUserRateLimit } from "@/lib/rate-limit";
import { dbGet } from "@/lib/firebase-rest";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req);
  if (isAuthError(authResult)) return authResult;

  // Plan-based rate limiting via Firebase
  const userId = authResult.uid;
  let userPlan = "FOUNDATION";
  try {
    const profile = await dbGet(`users/${userId}/profile`);
    if (profile?.plan) userPlan = profile.plan;
  } catch {
    // If profile read fails, default to Foundation limits
  }

  const rateResult = await checkUserRateLimit(userId, userPlan);
  if (!rateResult.allowed) {
    return apiError("Daily AI query limit reached. Upgrade your plan for more.", {
      status: 429,
      meta: {
        limit: rateResult.limit,
        remaining: rateResult.remaining,
        resetAt: rateResult.resetAt,
      },
    });
  }

  if (!CLAUDE_API_KEY) {
    return apiError("AI service not configured", { status: 503 });
  }

  try {
    const raw = await req.json();
    const parsed = parseBody(aiChatSchema, raw);
    if (!parsed.success) return parsed.response;

    const { messages, projectContext, mode } = parsed.data;
    const systemPrompt = buildSystemPrompt(projectContext, mode);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return apiError("AI service error", { status: response.status, details: errorData });
    }

    const data = await response.json();
    const textContent = data.content?.find((c: { type: string }) => c.type === "text");

    return apiSuccess({
      message: textContent?.text ?? "No response generated.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return apiError("AI service error", { status: 500, details: message });
  }
}

function buildSystemPrompt(context: Record<string, unknown> | undefined, mode: string): string {
  let prompt = `You are Keystone, an AI construction advisor built into a construction project management platform. You help first-time owner-builders navigate every phase of building a home in the United States and West Africa (Togo, Ghana, Benin).

RULES:
1. You are a guide, not an authority. Include disclaimers for structural, electrical, legal, or financial advice.
2. Never assume the user has construction knowledge. Explain terms in plain English.
3. When discussing costs, specify currency and note that prices vary by region.
4. For structural, electrical, plumbing, legal, or financial advice, end with: "This is educational guidance. Consult a licensed professional for your specific situation."
5. Be concise but thorough. Use bullet points and numbered lists.
6. Never use emoji. Use clear, professional language.
7. Use markdown formatting for readability.`;

  if (context) {
    prompt += `\n\nPROJECT CONTEXT:
- Project: ${context.projectName ?? "Unknown"}
- Market: ${context.market ?? "USA"}
- Construction method: ${context.constructionMethod ?? "Standard"}
- Phase: ${context.phaseName ?? "Unknown"} (${context.phase ?? ""})
- Progress: ${context.progress ?? 0}%
- Budget: ${context.totalBudget ?? 0} ${context.currency ?? "USD"} (spent: ${context.totalSpent ?? 0})
- Week: ${context.currentWeek ?? 0} of ${context.totalWeeks ?? 0}`;
  }

  if (mode === "budget") {
    prompt += `\n\nFOCUS: Analyze the budget. Flag overruns, suggest savings, compare against market benchmarks. Show the math.`;
  } else if (mode === "schedule") {
    prompt += `\n\nFOCUS: Analyze the timeline. Identify critical path items, suggest sequencing, flag weather risks.`;
  } else if (mode === "risk") {
    prompt += `\n\nFOCUS: Identify project risks. Rate each as high/medium/low. Suggest specific mitigations.`;
  } else if (mode === "contract") {
    prompt += `\n\nFOCUS: Review contract terms. Flag missing clauses, unfavorable terms, and market-specific legal requirements.`;
  }

  return prompt;
}
