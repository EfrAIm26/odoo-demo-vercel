export type FlowPhase = "forecast" | "waste" | "inventory" | "finance" | "purchase" | "invoice";

export type AgentWorkflowStep = {
  id: string;
  phase: FlowPhase;
  thinking: string;
  route?: string;
  planningTab?: "forecast" | "production";
  purchaseTab?: "orders" | "status";
  forkastUpdate?: Partial<{ period: number; wastePctReduction: boolean }>;
  delay: number;
  assistantMsg?: string;
  showPOForm?: boolean;
  poFields?: Record<string, string>;
  createPO?: { product: string; qty: number; supplier: string; total: number };
  showInvoice?: boolean;
};

export const JURY_DEMO_PROMPT =
  "Haz una predicción simple para este mes de ventas y, de acuerdo a eso y según nuestro inventario, haz las órdenes de compra para este mes para mejorar el ROI.";

/** Explicit phrases that start the full jury demo (pronóstico → inventario → finanzas → compras → factura). */
const EXPLICIT_DEMO_PATTERNS = [
  /demo\s*(del\s*)?jurado/i,
  /demostraci[oó]n\s*(del\s*)?jurado/i,
  /flujo\s*(agentico|completo|del\s*demo)/i,
  /ejecuta(r)?\s*(el\s*)?demo/i,
  /inicia(r)?\s*(el\s*)?demo/i,
  /corre(r)?\s*(el\s*)?demo/i,
  /presentaci[oó]n\s*(del\s*)?jurado/i,
];

function normalizeDemoText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the message closely matches the canonical jury demo prompt. */
function matchesJuryDemoPrompt(text: string): boolean {
  const normalized = normalizeDemoText(text);
  const jury = normalizeDemoText(JURY_DEMO_PROMPT);
  const juryKeywords = ["prediccion", "mes", "ventas", "inventario", "ordenes", "compra", "roi"];
  const matched = juryKeywords.filter((kw) => normalized.includes(kw)).length;
  return matched >= 5 || normalized.includes(jury.slice(0, 60));
}

export function shouldRunDemoWorkflow(text: string): boolean {
  if (EXPLICIT_DEMO_PATTERNS.some((p) => p.test(text))) return true;
  return matchesJuryDemoPrompt(text);
}

export const FLOW_STAGES: { id: FlowPhase; label: string; icon: string; color: string }[] = [
  { id: "forecast", label: "Pronóstico", icon: "📈", color: "#4A90B8" },
  { id: "waste", label: "Merma", icon: "📉", color: "#3d9a6a" },
  { id: "inventory", label: "Inventario", icon: "📦", color: "#7eb8d4" },
  { id: "finance", label: "Finanzas", icon: "💰", color: "#2e6d8f" },
  { id: "purchase", label: "OC", icon: "🛒", color: "#4A90B8" },
  { id: "invoice", label: "Factura", icon: "📄", color: "#3d7da3" },
];

export const AGENT_WORKFLOW: AgentWorkflowStep[] = [
  {
    id: "analyze",
    phase: "forecast",
    thinking: "Observando ventas de Patty Pastelería — TPV, Rappi y PedidosYa (últimos 90 días)...",
    route: "/planificacion",
    planningTab: "forecast",
    forkastUpdate: { period: 30 },
    delay: 2200,
    assistantMsg: "Iniciando análisis operativo del mes. Reviso demanda, merma e inventario.",
  },
  {
    id: "forecast",
    phase: "forecast",
    thinking: "Entrenando modelo WMA con 2,431 unidades/mes Brownie. Demanda proyectada: 2,780 unid · precisión 91%.",
    route: "/planificacion",
    planningTab: "forecast",
    forkastUpdate: { period: 30 },
    delay: 2800,
    assistantMsg: "Pronóstico generado: 93 unid/día promedio para los próximos 30 días.",
  },
  {
    id: "waste",
    phase: "waste",
    thinking: "Merma actual 10.7% = S/ 2,680/mes perdidos. Escenario óptimo: reducir a 5% ahorraría S/ 2,847/mes en soles.",
    route: "/planificacion",
    planningTab: "forecast",
    forkastUpdate: { wastePctReduction: true },
    delay: 3200,
    assistantMsg: "Optimización de merma: de 10.7% → 5.0%. Ahorro estimado **S/ 2,847/mes** (~69% menos pérdida).",
  },
  {
    id: "inventory",
    phase: "inventory",
    thinking: "Cruzando pronóstico con inventario: Harina −1 u., Croissants 0 u., Leche 22 u. (OK). Déficit en 3 SKUs.",
    route: "/inventario",
    delay: 2600,
    assistantMsg: "Inventario revisado. 3 productos bajo mínimo — activo reabastecimiento automático.",
  },
  {
    id: "finance",
    phase: "finance",
    thinking: "Calculando ROI: inversión OC S/ 4,850 vs ahorro merma S/ 2,847 + evitar quiebre S/ 3,200. ROI 104% en 30 días.",
    route: "/finanzas",
    delay: 2800,
    assistantMsg: "Análisis financiero: ROI proyectado **104%** si ejecutas las OC recomendadas este mes.",
  },
  {
    id: "po-draft",
    phase: "purchase",
    thinking: "Preparando OC para Molinos del Perú, Distribuidora Lácteos y Chocolates Premium. Completando formularios...",
    route: "/compras",
    purchaseTab: "orders",
    showPOForm: true,
    poFields: {},
    delay: 1500,
  },
  {
    id: "po-fill-1",
    phase: "purchase",
    thinking: "OC #1 — Harina trigo 25kg · 8 sacos · Molinos del Perú · Plazo 3 días.",
    route: "/compras",
    showPOForm: true,
    poFields: {
      proveedor: "Molinos del Perú SAC",
      producto: "Harina de trigo 25kg",
      cantidad: "8 sacos",
      precioUnit: "S/ 93.75",
      subtotal: "S/ 750.00",
      igv: "S/ 135.00",
      total: "S/ 885.00",
      plazoEntrega: "3 días hábiles",
      direccion: "Av. Industrial 245, Lima 13",
      condicionPago: "Transferencia · 30 días",
      metodoPago: "Tarjeta corporativa ·••• 4821",
      contacto: "maria.gonzalez@molinos.pe",
    },
    delay: 3500,
  },
  {
    id: "po-fill-2",
    phase: "purchase",
    thinking: "OC #2 — Leche UHT 50 L · Distribuidora Lácteos · Entrega 48h · Condición neto 15.",
    route: "/compras",
    showPOForm: true,
    poFields: {
      proveedor: "Distribuidora Lácteos SAC",
      producto: "Leche entera UHT",
      cantidad: "50 litros",
      precioUnit: "S/ 4.20",
      subtotal: "S/ 210.00",
      igv: "S/ 37.80",
      total: "S/ 247.80",
      plazoEntrega: "2 días hábiles",
      direccion: "Jr. Los Olivos 118, San Isidro",
      condicionPago: "Neto 15 días",
      metodoPago: "Transferencia BCP",
      contacto: "pedidos@lacteos.pe",
    },
    delay: 3500,
  },
  {
    id: "po-fill-3",
    phase: "purchase",
    thinking: "OC #3 — Chocolate cobertura 20 kg · Chocolates Premium · Plazo 5 días.",
    route: "/compras",
    showPOForm: true,
    poFields: {
      proveedor: "Chocolates Premium EIRL",
      producto: "Chocolate cobertura 70%",
      cantidad: "20 kg",
      precioUnit: "S/ 28.00",
      subtotal: "S/ 560.00",
      igv: "S/ 100.80",
      total: "S/ 660.80",
      plazoEntrega: "5 días hábiles",
      direccion: "Calle Las Begonias 475, Surco",
      condicionPago: "Contado",
      metodoPago: "Tarjeta corporativa ·••• 4821",
      contacto: "ventas@chocpremium.pe",
    },
    delay: 3500,
  },
  {
    id: "po-create",
    phase: "purchase",
    thinking: "Confirmando 3 órdenes de compra en el sistema. Total consolidado: S/ 1,793.60 · Estado: RFQ enviada.",
    route: "/compras",
    purchaseTab: "orders",
    delay: 2000,
    assistantMsg: "3 órdenes de compra creadas y visibles en Compras. Trazabilidad activa.",
  },
  {
    id: "invoice",
    phase: "invoice",
    thinking: "Generando factura proforma y enviando a contabilidad@pattypasteleria.pe · Copia a compras@patty.pe",
    route: "/compras",
    showInvoice: true,
    delay: 2500,
    assistantMsg: "Proceso completado. Factura proforma enviada a **contabilidad@pattypasteleria.pe**. Ahorro merma proyectado: **S/ 2,847/mes**.",
  },
];
