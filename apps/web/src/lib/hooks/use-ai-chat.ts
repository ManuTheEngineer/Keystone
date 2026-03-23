"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * TanStack Query mutation hook for AI chat requests.
 *
 * Provides loading state, error handling, and automatic retry logic
 * for the AI chat API.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  projectContext?: Record<string, unknown>;
  mode?: "general" | "budget" | "schedule" | "risk" | "contract";
}

interface ChatResponse {
  data: {
    message: string;
  };
}

async function sendChat(
  request: ChatRequest,
  idToken: string
): Promise<ChatResponse> {
  const res = await fetch("/api/ai/chat/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "AI service error" }));
    throw new Error(error.error || `AI request failed (${res.status})`);
  }

  return res.json();
}

export function useAIChat() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: ChatRequest) => {
      if (!user) throw new Error("Not authenticated");
      const idToken = await user.getIdToken();
      return sendChat(request, idToken);
    },
  });
}
