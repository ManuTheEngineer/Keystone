import { auth } from "@/lib/firebase";

const AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_ENDPOINT;

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
  projectContext: Record<string, any>,
  mode: string = "general"
): Promise<{ message: string; usage: AIUsage }> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  if (!AI_ENDPOINT) {
    throw new Error("AI_NOT_CONFIGURED");
  }

  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, projectContext, mode }),
  });

  if (res.status === 429) {
    const data = await res.json();
    throw new Error(`RATE_LIMITED:${data.used}:${data.limit}`);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "AI service error");
  }

  return res.json();
}

export async function getAIUsage(): Promise<AIUsage> {
  const user = auth.currentUser;
  if (!user) return { used: 0, limit: 10, plan: "FOUNDATION" };

  const token = await user.getIdToken();
  const usageEndpoint = AI_ENDPOINT?.replace(/\/aiChat\/?$/, "/aiUsage");
  if (!usageEndpoint) return { used: 0, limit: 10, plan: "FOUNDATION" };

  try {
    const res = await fetch(usageEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { used: 0, limit: 10, plan: "FOUNDATION" };
    return res.json();
  } catch {
    return { used: 0, limit: 10, plan: "FOUNDATION" };
  }
}
