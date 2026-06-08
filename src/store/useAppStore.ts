import { create } from "zustand";
import type { AgentAction, ChartGranularity, ChartPoint, ChatMessage, Kpis, MOModalState, POModalState, ProductionOrder, PurchaseOrder } from "@/types";
import type { AgentWorkflowStep, FlowPhase } from "@/lib/agentWorkflow";
import { AGENT_WORKFLOW } from "@/lib/agentWorkflow";
import { FORKAST_PRODUCTS, PRODUCTION_ORDERS, PURCHASES, buildChartData, buildKpis, forecastDaily } from "@/data/mockData";

type ForkastState = {
  productId: string;
  period: number;
  source: string;
  chartGranularity: ChartGranularity;
  daily: number;
  chart: ChartPoint[];
  kpis: Kpis;
};

type AppState = {
  forkast: ForkastState;
  purchases: PurchaseOrder[];
  productionOrders: ProductionOrder[];
  planningTab: "forecast" | "production";
  purchaseTab: "orders" | "status";
  highlightOrderId: string | null;
  chatOpen: boolean;
  chatExpanded: boolean;
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  agentLog: string[];
  ganttAdjusted: boolean;
  toast: string | null;

  workflowActive: boolean;
  workflowStep: number;
  workflowPhase: FlowPhase;
  thinkingChain: string[];
  thinkingDockExpanded: boolean;
  currentThinking: string | null;
  poFormActive: boolean;
  poFormFields: Record<string, string>;
  poFormFilledKeys: string[];
  showInvoiceDocument: boolean;

  poModal: POModalState;
  moModal: MOModalState;

  setThinkingDockExpanded: (v: boolean) => void;
  setShowInvoiceDocument: (v: boolean) => void;

  openPOView: (id: string) => void;
  openPOCreate: (prefilled?: Partial<PurchaseOrder>) => void;
  closePOModal: () => void;
  savePO: (data: Partial<PurchaseOrder>) => void;

  openMOView: (id: string) => void;
  openMOCreate: (prefilled?: Partial<ProductionOrder>) => void;
  closeMOModal: () => void;
  saveMO: (data: Partial<ProductionOrder>) => void;

  setForkastField: <K extends keyof ForkastState>(key: K, value: ForkastState[K]) => void;
  setPlanningTab: (tab: "forecast" | "production") => void;
  setPurchaseTab: (tab: "orders" | "status") => void;
  setHighlightOrderId: (id: string | null) => void;

  setChatOpen: (open: boolean) => void;
  setChatExpanded: (v: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatLoading: (v: boolean) => void;
  executeActions: (actions: AgentAction[]) => void;
  showToast: (msg: string) => void;
  createPO: (product?: string, qty?: number, supplier?: string, total?: number, skipRedirect?: boolean) => string;
  createMO: (product?: string, qty?: number, resource?: string) => string;

  startWorkflow: () => void;
  advanceWorkflow: () => void;
  finishWorkflow: () => void;
  applyWorkflowStep: (step: AgentWorkflowStep) => void;
  addThinking: (text: string) => void;
};

const defaultProduct = FORKAST_PRODUCTS[0];

function initialForkast(): ForkastState {
  const daily = forecastDaily(defaultProduct.sales);
  return {
    productId: defaultProduct.id,
    period: 14,
    source: "all",
    chartGranularity: "day",
    daily,
    chart: buildChartData(defaultProduct, daily, 14),
    kpis: buildKpis(defaultProduct),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  forkast: initialForkast(),
  purchases: [...PURCHASES],
  productionOrders: [...PRODUCTION_ORDERS],
  planningTab: "forecast",
  purchaseTab: "orders",
  highlightOrderId: null,
  chatOpen: false,
  chatExpanded: false,
  chatMessages: [
    {
      id: "0",
      role: "assistant",
      content: "¡Hola! Soy **Foodie** 🍽️, tu agente Smart Food. Puedo pronosticar ventas, optimizar merma, revisar inventario y generar órdenes de compra. ¿En qué te ayudo?",
    },
  ],
  chatLoading: false,
  agentLog: [],
  ganttAdjusted: false,
  toast: null,

  workflowActive: false,
  workflowStep: 0,
  workflowPhase: "forecast",
  thinkingChain: [],
  thinkingDockExpanded: true,
  currentThinking: null,
  poFormActive: false,
  poFormFields: {},
  poFormFilledKeys: [],
  showInvoiceDocument: false,

  poModal: { mode: "closed" },
  moModal: { mode: "closed" },

  setThinkingDockExpanded: (v) => set({ thinkingDockExpanded: v }),
  setShowInvoiceDocument: (v) => set({ showInvoiceDocument: v }),

  openPOView: (id) => set({ poModal: { mode: "view", orderId: id } }),
  openPOCreate: (prefilled) => set({ poModal: { mode: "create", prefilled } }),
  closePOModal: () => set({ poModal: { mode: "closed" } }),
  savePO: (data) => {
    const ref = `C${String(Date.now()).slice(-5)}`;
    const order: PurchaseOrder = {
      id: ref,
      reference: ref,
      vendor: data.vendor || "Proveedor",
      product: data.product || "",
      qty: data.qty || 1,
      date: new Date().toLocaleDateString("es-PE"),
      total: data.total || "S/ 0",
      status: data.status || "RFQ enviada",
      precioUnit: data.precioUnit,
      plazoEntrega: data.plazoEntrega,
      condicionPago: data.condicionPago,
      metodoPago: data.metodoPago,
      contacto: data.contacto,
      direccion: data.direccion,
    };
    set((s) => ({
      purchases: [order, ...s.purchases],
      purchaseTab: "orders",
      highlightOrderId: ref,
    }));
    get().showToast(`OC ${ref} creada correctamente`);
  },

  openMOView: (id) => set({ moModal: { mode: "view", orderId: id } }),
  openMOCreate: (prefilled) => set({ moModal: { mode: "create", prefilled } }),
  closeMOModal: () => set({ moModal: { mode: "closed" } }),
  saveMO: (data) => {
    const ref = `OP${String(Date.now()).slice(-5)}`;
    const order: ProductionOrder = {
      id: ref,
      reference: ref,
      product: data.product || "Brownie",
      qty: data.qty || 100,
      resource: data.resource || "Horno 2",
      date: new Date().toLocaleDateString("es-PE"),
      status: data.status || "Programada",
      ingredients: data.ingredients,
      duration: data.duration,
      startTime: data.startTime,
      endTime: data.endTime,
    };
    set((s) => ({
      productionOrders: [order, ...s.productionOrders],
      planningTab: "production",
      highlightOrderId: ref,
    }));
    get().showToast(`OP ${ref} programada correctamente`);
  },

  setForkastField: (key, value) =>
    set((s) => {
      const forkast = { ...s.forkast, [key]: value };
      if (key === "productId" || key === "period") {
        const product = FORKAST_PRODUCTS.find((p) => p.id === forkast.productId) || defaultProduct;
        const daily = forecastDaily(product.sales);
        forkast.daily = daily;
        forkast.chart = buildChartData(product, daily, forkast.period);
        forkast.kpis = buildKpis(product);
      }
      return { forkast };
    }),

  setPlanningTab: (tab) => set({ planningTab: tab }),
  setPurchaseTab: (tab) => set({ purchaseTab: tab }),
  setHighlightOrderId: (id) => set({ highlightOrderId: id }),

  setChatOpen: (open) => set({ chatOpen: open, chatExpanded: open ? get().chatExpanded : false }),
  setChatExpanded: (v) => set({ chatExpanded: v }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatLoading: (v) => set({ chatLoading: v }),

  addThinking: (text) =>
    set((s) => ({
      currentThinking: text,
      thinkingChain: [...s.thinkingChain, text],
    })),

  startWorkflow: () => {
    set({
      workflowActive: true,
      workflowStep: 0,
      workflowPhase: "forecast",
      thinkingChain: [],
      thinkingDockExpanded: true,
      currentThinking: null,
      chatOpen: true,
      chatExpanded: true,
      chatLoading: true,
      poFormActive: false,
      poFormFields: {},
      poFormFilledKeys: [],
      showInvoiceDocument: false,
    });
  },

  advanceWorkflow: () => {
    const next = get().workflowStep + 1;
    if (next >= AGENT_WORKFLOW.length) {
      get().finishWorkflow();
    } else {
      set({ workflowStep: next });
    }
  },

  finishWorkflow: () => {
    set({
      workflowActive: false,
      chatLoading: false,
      poFormActive: false,
      currentThinking: null,
    });
    get().showToast("Flujo agentico completado");
  },

  applyWorkflowStep: (step) => {
    get().addThinking(step.thinking);
    set({ workflowPhase: step.phase });

    if (step.planningTab) set({ planningTab: step.planningTab });
    if (step.purchaseTab) set({ purchaseTab: step.purchaseTab });

    if (step.forkastUpdate) {
      let forkast = { ...get().forkast };
      if (step.forkastUpdate.period) {
        forkast.period = step.forkastUpdate.period;
        const product = FORKAST_PRODUCTS.find((p) => p.id === forkast.productId) || defaultProduct;
        forkast.daily = forecastDaily(product.sales);
        forkast.chart = buildChartData(product, forkast.daily, forkast.period);
      }
      if (step.forkastUpdate.wastePctReduction) {
        forkast.kpis = {
          ...forkast.kpis,
          wastePct: 5.0,
          loss: Math.round(forkast.kpis.loss * 0.31),
          savingsPotential: 2847,
        };
      }
      set({ forkast });
    }

    if (step.assistantMsg) {
      get().addChatMessage({
        id: `wf-${step.id}-${Date.now()}`,
        role: "assistant",
        content: step.assistantMsg,
      });
    }

    if (step.showPOForm) {
      const fields = step.poFields || {};
      const hasFields = Object.keys(fields).length > 0;
      set({
        poFormActive: true,
        poFormFields: hasFields ? fields : get().poFormFields,
        poFormFilledKeys: hasFields ? [] : get().poFormFilledKeys,
      });
      if (hasFields) {
        const keys = Object.keys(fields);
        let i = 0;
        const fillNext = () => {
          if (i >= keys.length) return;
          const key = keys[i];
          set((s) => ({
            poFormFilledKeys: [...s.poFormFilledKeys, key],
          }));
          i++;
          setTimeout(fillNext, 300);
        };
        setTimeout(fillNext, 500);
      }
    } else if (step.id !== "po-create") {
      set({ poFormActive: false });
    }

    if (step.id === "po-create") {
      set({ poFormActive: false });
      const refs = [
        get().createPO("Harina de trigo 25kg", 8, "Molinos del Perú SAC", 885, true),
        get().createPO("Leche entera UHT", 50, "Distribuidora Lácteos SAC", 248, true),
        get().createPO("Chocolate cobertura 70%", 20, "Chocolates Premium EIRL", 661, true),
      ];
      set({ highlightOrderId: refs[0], purchaseTab: "orders" });
    }

    if (step.showInvoice) {
      set({ showInvoiceDocument: true, poFormActive: false });
    }
  },

  createPO: (product, qty, supplier, totalAmt, skipRedirect) => {
    const ref = `C${String(Date.now()).slice(-5)}`;
    const total = totalAmt ? `S/ ${totalAmt.toLocaleString()}` : `S/ ${(qty || 10) * 100}`;
    const order: PurchaseOrder = {
      id: ref,
      vendor: supplier || "Proveedor demo",
      reference: ref,
      date: new Date().toLocaleDateString("es-PE"),
      total,
      status: "RFQ enviada",
      product: product || "",
      qty: qty || 10,
      plazoEntrega: "2 días",
      condicionPago: "30 días",
      metodoPago: "Transferencia",
    };
    set((s) => ({
      purchases: [order, ...s.purchases],
      purchaseTab: "orders",
      highlightOrderId: ref,
    }));
    if (!skipRedirect) {
      get().showToast(`OC ${ref} creada — redirigiendo a Compras`);
      setTimeout(() => { window.location.href = "/compras"; }, 800);
    }
    return ref;
  },

  createMO: (product, qty, resource) => {
    const ref = `OP${String(Date.now()).slice(-5)}`;
    const order: ProductionOrder = {
      id: ref,
      reference: ref,
      product: product || "Brownie",
      qty: qty || get().forkast.daily,
      resource: resource || "Horno 2",
      date: new Date().toLocaleDateString("es-PE"),
      status: "Programada",
      duration: "4h",
      startTime: "08:00",
      endTime: "12:00",
    };
    set((s) => ({
      productionOrders: [order, ...s.productionOrders],
      planningTab: "production",
      highlightOrderId: ref,
    }));
    get().showToast(`OP ${ref} programada — ver trazabilidad`);
    return ref;
  },

  executeActions: (actions) => {
    const logs: string[] = [];
    let forkast = { ...get().forkast };
    let ganttAdjusted = get().ganttAdjusted;

    actions.forEach((a) => {
      if (a.type === "reduce_production" && a.product) {
        forkast.daily = Math.max(10, Math.round(forkast.daily * 0.9));
        forkast.kpis = {
          ...forkast.kpis,
          wastePct: Math.max(5, forkast.kpis.wastePct - 2),
          loss: Math.round(forkast.kpis.loss * 0.85),
        };
        logs.push(`Producción de ${a.product} reducida 10%`);
      }
      if (a.type === "create_po") {
        get().createPO(a.product, a.qty, a.supplier);
        logs.push(`OC creada — ${a.qty || 10} u. ${a.product || ""}`);
      }
      if (a.type === "create_mo") {
        get().createMO(a.product, a.qty);
        logs.push(`OP programada — ${a.qty || forkast.daily} u. ${a.product || ""}`);
      }
      if (a.type === "adjust_gantt") {
        logs.push("Planificación actualizada según pronóstico");
      }
      if (a.type === "open_inventory") {
        logs.push("Inventario marcado para revisión");
        setTimeout(() => { window.location.href = "/inventario"; }, 800);
      }
    });

    set({ forkast, ganttAdjusted, agentLog: [...get().agentLog, ...logs] });
    if (logs.length && !actions.some((a) => a.type === "create_po")) {
      get().showToast(logs[logs.length - 1]);
    }
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: null }), 3500);
  },
}));

export function getForkastProduct(id: string) {
  return FORKAST_PRODUCTS.find((p) => p.id === id) || FORKAST_PRODUCTS[0];
}
