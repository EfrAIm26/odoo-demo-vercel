import type { VercelRequest, VercelResponse } from "@vercel/node";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "anthropic/claude-3-5-haiku",
  "moonshotai/kimi-k2.5",
] as const;

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string
) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://odoo-demo-olive.vercel.app",
      "X-Title": "Smart Food AI",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 600,
    }),
  });

  const raw = await response.text();
  let data: { choices?: { message?: { content?: string } }[]; error?: { message?: string } } = {};
  try {
    data = JSON.parse(raw);
  } catch {
    data = {};
  }

  if (!response.ok) {
    const msg =
      data.error?.message ||
      (raw.includes("No endpoints found") ? `Modelo ${model} no disponible` : raw.slice(0, 200));
    return { ok: false as const, error: msg, status: response.status };
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false as const, error: "Respuesta vacía del modelo", status: 502 };
  }

  return { ok: true as const, content };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey =
    process.env.keynew ||
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key no configurada en Vercel (keynew)" });
  }

  const { messages, context } = req.body as {
    messages: ChatMessage[];
    context?: Record<string, unknown>;
  };

  if (!messages?.length) {
    return res.status(400).json({ error: "messages requerido" });
  }

  const systemPrompt = `Eres Foodie 🍽️, agente operativo de Smart Food para Patty Pastelería (cafetería/restaurante en Perú).
Responde SIEMPRE en español, claro y conversacional.
Mantén una conversación normal: saludos, preguntas y consejos SIN redirigir ni navegar por la app.
NO incluyas ACTIONS en saludos, charla casual ni preguntas informativas (ej. "hola", "¿cómo estás?", "¿qué puedes hacer?").
Solo incluye ACTIONS cuando el usuario pida EXPLÍCITAMENTE ejecutar algo en el sistema (crear OC, reducir producción, programar OP).
Cuando propongas acciones, incluye al final un bloque JSON en una línea con este formato exacto:
ACTIONS:[{"type":"reduce_production","product":"Brownie","detail":"..."},{"type":"create_po","product":"Chocolate","qty":10,"supplier":"Chocolates Premium"}]
Tipos válidos: reduce_production, create_po, create_mo, adjust_gantt. NO uses open_inventory ni redirecciones.
El flujo demo del jurado (pronóstico → inventario → finanzas → compras) lo maneja la app; no lo actives desde el chat.
Sé conciso (máx 120 palabras en texto).
Contexto actual: ${JSON.stringify(context || {})}`;

  try {
    let content: string | null = null;
    const errors: string[] = [];

    for (const model of MODELS) {
      const result = await callOpenRouter(apiKey, model, messages, systemPrompt);
      if (result.ok) {
        content = result.content;
        break;
      }
      errors.push(`${model}: ${result.error}`);
    }

    if (!content) {
      return res.status(502).json({
        error: "No pude conectar con ningún modelo de IA. Intenta de nuevo en unos segundos.",
        details: errors.slice(0, 2).join(" | "),
      });
    }

    let text = content;
    let actions: unknown[] = [];

    const actionsMatch = content.match(/ACTIONS:\s*(\[[\s\S]*?\])\s*$/);
    if (actionsMatch) {
      text = content.replace(/ACTIONS:\s*\[[\s\S]*?\]\s*$/, "").trim();
      try {
        actions = JSON.parse(actionsMatch[1]);
      } catch {
        actions = [];
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ text, actions });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return res.status(500).json({ error: msg });
  }
}
