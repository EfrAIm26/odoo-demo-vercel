type ChatContext = {
  product?: string;
  wastePct?: number;
  dailyProduction?: number;
  loss?: number;
};

function lastUserMessage(messages: { role: string; content: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content.toLowerCase();
  }
  return "";
}

export function getChatFallbackResponse(
  messages: { role: string; content: string }[],
  context: ChatContext = {}
): string {
  const msg = lastUserMessage(messages);
  const product = context.product || "Brownie";
  const waste = context.wastePct ?? 10.7;
  const daily = context.dailyProduction ?? 93;
  const loss = context.loss ?? 2680;

  if (/^(hola|buenas|hey|hi|hello)\b/.test(msg) || msg === "hola") {
    return `¡Hola! Soy **Foodie** 🍽️, tu agente Smart Food. Puedo ayudarte con pronósticos, merma, inventario y órdenes de compra. ¿En qué te ayudo hoy?`;
  }

  if (/qu[eé]\s*puedes|qu[eé]\s*haces|ayuda|capacidades/.test(msg)) {
    return `Puedo ayudarte con:\n• **Pronóstico** de ventas y producción\n• **Merma** — actualmente ${product} está al ${waste}%\n• **Inventario** — revisar stock y reabastecimiento\n• **Compras** — generar órdenes de compra\n\nPara el demo completo del jurado, pídeme el flujo con predicción + inventario + ROI.`;
  }

  if (/inventario|stock|existencias|reabastec/.test(msg)) {
    return `Inventario actual de Patty Pastelería:\n• **Harina 25kg** — 3 u. (bajo mínimo)\n• **Croissants** — 0 u. (agotado)\n• **Leche UHT** — 22 u. (OK)\n• **${product}** — producción diaria ${daily} unid.\n\n3 SKUs requieren atención. ¿Quieres que genere órdenes de compra?`;
  }

  if (/merma|p[eé]rdida|desperdicio/.test(msg)) {
    return `La merma de **${product}** está en **${waste}%**, con pérdida estimada de **S/ ${loss.toLocaleString("es-PE")}/mes**. Reducir a 5% ahorraría ~S/ 2,847/mes. ¿Ajustamos la producción diaria?`;
  }

  if (/pron[oó]stic|predic|venta|demanda/.test(msg)) {
    return `Pronóstico para **${product}**: ~${daily} unid/día en los próximos 30 días (precisión ~91%). Demanda proyectada: 2,780 unid/mes. ¿Quieres ver el detalle en Planificación?`;
  }

  if (/compra|oc|orden|proveedor/.test(msg)) {
    return `Tengo 3 proveedores listos: Molinos del Perú (harina), Distribuidora Lácteos (leche) y Chocolates Premium. ¿Creo las órdenes de compra recomendadas?`;
  }

  if (/gracias|ok|perfecto|entendido/.test(msg)) {
    return `¡De nada! Sigo aquí si necesitas revisar otro módulo o ejecutar el **demo del jurado**.`;
  }

  return `Entendido. Con los datos actuales de Patty Pastelería: **${product}** a ${daily} unid/día, merma ${waste}%. Puedo profundizar en inventario, compras o merma — ¿qué prefieres?`;
}
