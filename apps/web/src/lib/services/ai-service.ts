export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIUsage {
  used: number;
  limit: number;
  plan: string;
}

export async function sendAIMessage(
  messages: AIMessage[],
  projectContext: Record<string, unknown>,
  mode: string = "general"
): Promise<{ message: string; usage?: AIUsage }> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-keystone-auth": "authenticated",
    },
    body: JSON.stringify({ messages, projectContext, mode }),
  });

  if (res.status === 503) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "AI service error");
  }

  return res.json();
}
