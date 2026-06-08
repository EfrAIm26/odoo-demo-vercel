import { getChatFallbackResponse } from "./chatFallback";

export async function sendChatMessage(
  messages: { role: "user" | "assistant"; content: string }[],
  context: Record<string, unknown>
): Promise<{ text: string; actions: import("@/types").AgentAction[]; fallback?: boolean }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "" }));
      const raw = typeof err.error === "string" ? err.error : "";
      if (raw && !raw.toLowerCase().includes("internal server error")) {
        throw new Error(raw);
      }
      return {
        text: getChatFallbackResponse(messages, context as Parameters<typeof getChatFallbackResponse>[1]),
        actions: [],
        fallback: true,
      };
    }

    return res.json();
  } catch {
    return {
      text: getChatFallbackResponse(messages, context as Parameters<typeof getChatFallbackResponse>[1]),
      actions: [],
      fallback: true,
    };
  }
}
