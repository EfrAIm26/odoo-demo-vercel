import type { ChartPoint, ForkastProduct, Kpis, ProductionOrder, PurchaseOrder, ReplenishmentRow } from "@/types";

export const USER = { name: "Admin Mitchell", initials: "A", company: "Patty Pastelería" };

export const APPS = [
  { id: "planning", name: "Planificación", emoji: "📋", path: "/planificacion", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=280&fit=crop" },
  { id: "inventory", name: "Inventario", emoji: "📦", path: "/inventario", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=280&fit=crop" },
  { id: "purchase", name: "Compras", emoji: "🛒", path: "/compras", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&q=80" },
  { id: "finance", name: "Finanzas", emoji: "💰", path: "/finanzas", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=280&fit=crop" },
  { id: "sales", name: "Ventas", emoji: "🏪", path: "/ventas", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=280&fit=crop" },
];

export const SUPPLIERS = [
  { id: "molinos", name: "Molinos del Perú SAC", contact: "ventas@molinos.pe", plazoEntrega: "2 días", unitPrice: 110.63 },
  { id: "lacteos", name: "Distribuidora Lácteos SAC", contact: "compras@lacteos.pe", plazoEntrega: "1 día", unitPrice: 4.96 },
  { id: "chocolate", name: "Chocolates Premium EIRL", contact: "pedidos@chocpremium.pe", plazoEntrega: "3 días", unitPrice: 33.04 },
  { id: "empaques", name: "Empaques Lima", contact: "info@empaqueslima.pe", plazoEntrega: "2 días", unitPrice: 3.20 },
  { id: "pan", name: "Panadería Industrial SAC", contact: "ventas@panind.pe", plazoEntrega: "1 día", unitPrice: 8.50 },
];

export const PRODUCT_INGREDIENTS: Record<string, string> = {
  "Brownie unidad": "Harina 2kg · Cacao 800g · Mantequilla 1.2kg · Huevos x24",
  "Brownie": "Harina 2kg · Cacao 800g · Mantequilla 1.2kg · Huevos x24",
  "Croissants congelados": "Harina 3kg · Mantequilla 2kg · Levadura 200g",
  "Croissants": "Harina 3kg · Mantequilla 2kg · Levadura 200g",
  "Pan de molde integral": "Harina 1.5kg · Levadura 150g · Aceite 200ml",
  "Harina de trigo 25kg": "— (insumo base)",
  "Leche entera UHT": "— (insumo base)",
  "Tarta manzana": "Manzana 4kg · Harina 1kg · Azúcar 600g · Canela",
};

export const CHART_TYPES = [
  { id: "line" as const, name: "Línea clásica", desc: "Ventas vs pronóstico", colors: ["#2d6a4f", "#d4a373"] },
  { id: "area" as const, name: "Área suavizada", desc: "Tendencia continua", colors: ["#40916c", "#52b788"] },
  { id: "bar" as const, name: "Barras diarias", desc: "Comparación por día", colors: ["#1b4332", "#bc8a5f"] },
  { id: "combo" as const, name: "Mixto merma", desc: "Ventas + merma diaria", colors: ["#2d6a4f", "#c1121f"] },
];

export const FORKAST_PRODUCTS: ForkastProduct[] = [
  { id: "brownie", name: "Brownie", unit: "unid", stock: 8, min: 6, sales: [72, 78, 85, 90, 88, 95, 92], route: "Fabricar", resource: "Horno 2", leadDays: 1, cost: 10, wastePct: 10.7 },
  { id: "croissant", name: "Croissants", unit: "unid", stock: 45, min: 30, sales: [120, 135, 128, 142, 138, 155, 148], route: "Fabricar", resource: "Horno 1", leadDays: 1, cost: 1.2, wastePct: 8.2 },
  { id: "tarta", name: "Tarta manzana", unit: "unid", stock: 8, min: 6, sales: [18, 22, 20, 24, 19, 26, 23], route: "Fabricar", resource: "Horno 2", leadDays: 2, cost: 8.5, wastePct: 7.1 },
  { id: "leche", name: "Leche UHT", unit: "L", stock: 22, min: 10, sales: [18, 22, 20, 15, 24, 20, 21], route: "Comprar", supplier: "Distribuidora Lácteos", leadDays: 2, cost: 4.2, wastePct: 5.5 },
];

export const PERIODS = [
  { id: 7, label: "7 días" },
  { id: 14, label: "14 días" },
  { id: 30, label: "30 días" },
];

export const SALES_SOURCES = [
  { id: "pos", label: "TPV Patty Pastelería" },
  { id: "rappi", label: "Rappi + PedidosYa" },
  { id: "all", label: "Todos los canales" },
];

export const REPLENISHMENT: ReplenishmentRow[] = [
  { id: 1, product: "[PAN-001] Pan de molde integral", location: "ALM/Stock", onHand: 18, forecast: 12, route: "Comprar", min: 8, max: 30, trigger: "Manual", supplier: "Panadería Industrial SAC", unitPrice: 8.50 },
  { id: 2, product: "[HAR-025] Harina de trigo 25kg", location: "ALM/Stock", onHand: 3, forecast: -1, route: "Comprar", min: 2, max: 8, trigger: "Manual", supplier: "Molinos del Perú SAC", unitPrice: 110.63 },
  { id: 3, product: "[LEC-001] Leche entera UHT", location: "ALM/Stock", onHand: 22, forecast: 18, route: "Comprar", min: 10, max: 40, trigger: "Auto", supplier: "Distribuidora Lácteos SAC", unitPrice: 4.96 },
  { id: 4, product: "[CRO-001] Croissants congelados", location: "ALM/Stock", onHand: 0, forecast: -6, route: "Fabricar", min: 5, max: 25, trigger: "Manual" },
  { id: 5, product: "[BRO-001] Brownie unidad", location: "ALM/Stock", onHand: 8, forecast: -3, route: "Fabricar", min: 4, max: 15, trigger: "Manual" },
];

export const PURCHASES: PurchaseOrder[] = [
  { id: "1", vendor: "Distribuidora Lácteos SAC", reference: "C00042", date: "19/05/2026", total: "S/ 1,240", status: "Pendiente", product: "Leche UHT", qty: 50, precioUnit: 4.96, plazoEntrega: "1 día", condicionPago: "30 días", metodoPago: "Transferencia", contacto: "compras@lacteos.pe", direccion: "ALM/Stock · Surco" },
  { id: "2", vendor: "Molinos del Perú SAC", reference: "C00041", date: "18/05/2026", total: "S/ 885", status: "Recibida", product: "Harina 25kg", qty: 8, precioUnit: 110.63, plazoEntrega: "2 días", condicionPago: "Contado", metodoPago: "Transferencia", contacto: "ventas@molinos.pe", direccion: "ALM/Stock · Surco" },
  { id: "3", vendor: "Chocolates Premium EIRL", reference: "C00040", date: "17/05/2026", total: "S/ 661", status: "Recibida", product: "Chocolate cobertura 70%", qty: 20, precioUnit: 33.04, plazoEntrega: "3 días", condicionPago: "15 días", metodoPago: "Transferencia", contacto: "pedidos@chocpremium.pe", direccion: "ALM/Stock · Surco" },
  { id: "4", vendor: "Empaques Lima", reference: "C00039", date: "16/05/2026", total: "S/ 320", status: "Cancelada", product: "Bolsas kraft", qty: 100, precioUnit: 3.20, plazoEntrega: "2 días", condicionPago: "Contado", metodoPago: "Efectivo", contacto: "info@empaqueslima.pe", direccion: "ALM/Stock · Surco" },
];

export const PRODUCTION_ORDERS: ProductionOrder[] = [
  { id: "1", reference: "OP00018", product: "Brownie", qty: 308, resource: "Horno 2", date: "19/05/2026", status: "En curso", ingredients: "Harina 2kg, Cacao 800g, Mantequilla 1.2kg, Huevos x24", duration: "4h 30min", startTime: "08:00", endTime: "12:30" },
  { id: "2", reference: "OP00017", product: "Croissants", qty: 420, resource: "Horno 1", date: "18/05/2026", status: "Programada", ingredients: "Harina 3kg, Mantequilla 2kg, Levadura 200g", duration: "6h", startTime: "06:00", endTime: "12:00" },
  { id: "3", reference: "OP00016", product: "Tarta manzana", qty: 56, resource: "Horno 2", date: "17/05/2026", status: "Finalizada", ingredients: "Manzana 4kg, Harina 1kg, Azúcar 600g, Canela", duration: "3h", startTime: "14:00", endTime: "17:00" },
];

export const PURCHASE_STATUS = [
  { name: "Recibida", value: 85.5, color: "#4A90B8" },
  { name: "Pendiente", value: 9.26, color: "#7eb8d4" },
  { name: "Cancelada", value: 5.24, color: "#d64545" },
];

export const PROMOTIONS = [
  { name: "Happy hour", discount: 27, days: "Lun–Jue 15–17h" },
  { name: "Pan fresco", discount: 22, days: "Mañanas" },
  { name: "2x1 postres", discount: 50, days: "Vie–Dom" },
  { name: "Combo desayuno", discount: 15, days: "Todo el mes" },
  { name: "Delivery gratis", discount: 10, days: "Rappi" },
];

export const STORE_PRODUCTS = [
  { product: "Pan Francés", units: 978864, revenue: 1468296, waste: 101234, wastePct: 10.4 },
  { product: "Pan Integral", units: 612769, revenue: 919154, waste: 64569, wastePct: 10.5 },
  { product: "Café", units: 656164, revenue: 3280820, waste: 69611, wastePct: 10.6 },
  { product: "Medialuna", units: 612769, revenue: 735323, waste: 64569, wastePct: 10.5 },
  { product: "Menú Ejecutivo", units: 394152, revenue: 1576608, waste: 41783, wastePct: 10.6 },
  { product: "Croissant", units: 447072, revenue: 536486, waste: 47257, wastePct: 10.6 },
  { product: "Hamburguesa", units: 394152, revenue: 1182456, waste: 41783, wastePct: 10.6 },
  { product: "Brownie", units: 180221, revenue: 1802210, waste: 18848, wastePct: 10.5 },
  { product: "Lomo Saltado", units: 344800, revenue: 1724000, waste: 36526, wastePct: 10.6 },
  { product: "Pizza", units: 326707, revenue: 980121, waste: 34096, wastePct: 10.4 },
];

export const SALES_CHANNELS = [
  { channel: "Delivery", pct: 45, units: 1200000 },
  { channel: "TPV local", pct: 35, units: 930000 },
  { channel: "Rappi/PedidosYa", pct: 20, units: 530000 },
];

export const FINANCE_DAILY = [
  { date: "1 nov", revenue: 980, loss: 120 },
  { date: "5 nov", revenue: 1050, loss: 135 },
  { date: "9 nov", revenue: 920, loss: 110 },
  { date: "13 nov", revenue: 1100, loss: 145 },
  { date: "17 nov", revenue: 1150, loss: 150 },
  { date: "21 nov", revenue: 1080, loss: 130 },
  { date: "25 nov", revenue: 1200, loss: 160 },
  { date: "29 nov", revenue: 1180, loss: 155 },
];

export const GANTT = {
  resources: ["Horno 1", "Horno 2", "Pastelería", "Empaque"],
  hours: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
  shifts: [
    { resource: "Horno 1", start: 1, span: 3, label: "Croissants", color: "#2d6a4f" },
    { resource: "Horno 2", start: 2, span: 3, label: "Brownie / Tarta", color: "#d4a373" },
    { resource: "Pastelería", start: 2, span: 4, label: "Decoración", color: "#40916c" },
    { resource: "Empaque", start: 4, span: 2, label: "Etiquetado", color: "#52b788" },
  ],
};

export function calcToOrder(row: ReplenishmentRow): number {
  const target = row.forecast < row.min ? row.max : Math.max(row.min, row.max);
  return Math.max(0, Math.ceil(target - row.onHand));
}

export function forecastDaily(sales: number[]): number {
  let w = 0, t = 0;
  sales.forEach((v, i) => { const weight = i + 1; w += v * weight; t += weight; });
  return Math.round(w / t);
}

export function buildChartData(product: ForkastProduct, daily: number, period: number): ChartPoint[] {
  const pts: ChartPoint[] = [];
  const base = new Date(2026, 3, 1);
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    pts.push({
      date: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
      actual: product.sales[i % 7] + Math.round(Math.sin(i) * 3),
      waste: Math.round(product.sales[i % 7] * ((product.wastePct || 10) / 100)),
    });
  }
  for (let i = 0; i < period; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + 14 + i);
    pts.push({
      date: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
      forecast: daily + Math.round(Math.sin(i * 0.5) * 5),
    });
  }
  return pts;
}

export function aggregateChart(data: ChartPoint[], granularity: "day" | "week" | "month"): ChartPoint[] {
  if (granularity === "day") return data;
  const chunk = granularity === "week" ? 7 : 14;
  const result: ChartPoint[] = [];
  for (let i = 0; i < data.length; i += chunk) {
    const slice = data.slice(i, i + chunk);
    const label = granularity === "week" ? `Sem ${Math.floor(i / chunk) + 1}` : `Mes ${Math.floor(i / chunk) + 1}`;
    result.push({
      date: label,
      actual: slice.reduce((a, p) => a + (p.actual || 0), 0) || undefined,
      forecast: slice.reduce((a, p) => a + (p.forecast || 0), 0) || undefined,
      waste: slice.reduce((a, p) => a + (p.waste || 0), 0) || undefined,
    });
  }
  return result;
}

export function buildKpis(product: ForkastProduct): Kpis {
  const units = product.sales.reduce((a, b) => a + b, 0) * 4;
  const avgPrice = product.cost * 1.1;
  const wastePct = product.wastePct || 10;
  const wasteUnits = Math.round(units * (wastePct / 100));
  const revenue = Math.round(units * avgPrice);
  const loss = Math.round(wasteUnits * avgPrice);
  const savingsPotential = Math.round(Math.max(0, wasteUnits - units * 0.05) * avgPrice);
  return { units, revenue, wasteUnits, wastePct, loss, savingsPotential };
}

export const FINANCE_SUMMARY = {
  lossMonth: 2680,
  savingsPotential: 98369,
  projectedRevenue: 11049,
  avgPrice: 10.0,
  pendingPurchases: 359868,
  totalWasteLoss: 7499586,
  totalSavingsIf5Pct: 3927846,
};
