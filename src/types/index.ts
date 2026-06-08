export type AgentAction = {
  type: "reduce_production" | "create_po" | "create_mo" | "adjust_gantt" | "open_inventory";
  product?: string;
  qty?: number;
  supplier?: string;
  detail?: string;
};

export type ForkastProduct = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  min: number;
  sales: number[];
  route: "Comprar" | "Fabricar";
  resource?: string;
  supplier?: string;
  leadDays: number;
  cost: number;
  wastePct?: number;
};

export type ReplenishmentRow = {
  id: number;
  product: string;
  location: string;
  onHand: number;
  forecast: number;
  route: string;
  min: number;
  max: number;
  trigger: string;
  supplier?: string;
  unitPrice?: number;
};

export type PurchaseOrder = {
  id: string;
  vendor: string;
  reference: string;
  date: string;
  total: string;
  status: string;
  product?: string;
  qty?: number;
  precioUnit?: number;
  plazoEntrega?: string;
  condicionPago?: string;
  metodoPago?: string;
  contacto?: string;
  direccion?: string;
};

export type ProductionOrder = {
  id: string;
  reference: string;
  product: string;
  qty: number;
  resource: string;
  date: string;
  status: string;
  ingredients?: string;
  duration?: string;
  startTime?: string;
  endTime?: string;
};

export type ChartGranularity = "day" | "week" | "month";

export type ChartType = "line" | "area" | "bar" | "combo";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actions?: AgentAction[];
};

export type Kpis = {
  units: number;
  revenue: number;
  wasteUnits: number;
  wastePct: number;
  loss: number;
  savingsPotential: number;
};

export type ChartPoint = {
  date: string;
  actual?: number;
  forecast?: number;
  waste?: number;
};

export type OrderModalMode = "closed" | "view" | "create";

export type POModalState = {
  mode: OrderModalMode;
  orderId?: string;
  prefilled?: Partial<PurchaseOrder>;
};

export type MOModalState = {
  mode: OrderModalMode;
  orderId?: string;
  prefilled?: Partial<ProductionOrder>;
};
