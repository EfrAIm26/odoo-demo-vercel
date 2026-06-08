export async function sendChatMessage(
  messages: { role: "user" | "assistant"; content: string }[],
  context: Record<string, unknown>
): Promise<{ text: string; actions: import("@/types").AgentAction[] }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const raw = err.error || "Error al conectar con Smart Food AI";
    const friendly =
      typeof raw === "string" && raw.startsWith("{")
        ? "Foodie no pudo responder ahora. Intenta de nuevo en unos segundos."
        : raw;
    throw new Error(friendly);
  }

  return res.json();
}
