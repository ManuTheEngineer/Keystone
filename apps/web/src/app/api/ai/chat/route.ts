import { NextRequest, NextResponse } from "next/server";

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 3600000; // 1 hour in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Cleanup old entries periodically to prevent memory leak
  if (rateLimitMap.size > 1000) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Verify Firebase ID token from Authorization header
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idToken = authHeader.split("Bearer ")[1];

  // Verify Firebase ID token using Google's tokeninfo endpoint
  // This validates the signature, audience, expiry, and issuer server-side
  try {
    const verifyRes = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const verifyData = await verifyRes.json();
    if (!verifyData.users || verifyData.users.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Token verification failed" }, { status: 401 });
  }

  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  if (!CLAUDE_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  try {
    const { messages, projectContext, mode = "general" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

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
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "AI service error", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const textContent = data.content?.find((c: { type: string }) => c.type === "text");

    return NextResponse.json({
      message: textContent?.text ?? "No response generated.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "AI service error", details: message }, { status: 500 });
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
