import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Keystone AI, a construction project management assistant. You help owner-builders manage their construction projects from first idea to final key.

Your role:
- Provide clear, actionable construction guidance
- Analyze schedules, budgets, and risks
- Draft communications to contractors
- Explain construction concepts in plain language
- Adapt advice based on the project market (USA vs. West Africa)

Rules:
- Never use emojis
- For structural, electrical, legal, or financial advice, always include: "This is educational guidance. Consult a licensed professional for your specific situation."
- Format responses with clear headings and numbered lists when appropriate
- Keep answers concise and practical
- When referencing costs, use the project's currency
- Explain construction terminology on first use`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error: "AI assistant is not configured. Set the ANTHROPIC_API_KEY environment variable.",
        fallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { messages, projectContext } = body as {
      messages: ChatMessage[];
      projectContext?: string;
    };

    const systemWithContext = projectContext
      ? `${SYSTEM_PROMPT}\n\nCurrent project context:\n${projectContext}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemWithContext,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.content?.[0]?.text ?? "I was unable to generate a response.";

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
