window.ODOO_DEMO = {
  user: { name: "Admin Mitchell", initials: "A", company: "Patty Pastelería" },
  apps: [
    { id: "planning", name: "Planificación", color: "#52b788", icon: "planning" },
    { id: "inventory", name: "Inventario", color: "#2d6a4f", icon: "inventory" },
    { id: "purchase", name: "Compras", color: "#40916c", icon: "purchase" },
    { id: "sales", name: "Ventas", color: "#bc8a5f", icon: "sales" },
  ],
  replenishment: [
    { id: 1, product: "[PAN-001] Pan de molde integral", location: "ALM/Stock", onHand: 18, forecast: 12, route: "Comprar", min: 8, max: 30, trigger: "Manual", chart: false },
    { id: 2, product: "[HAR-025] Harina de trigo 25kg", location: "ALM/Stock", onHand: 3, forecast: -1, route: "Comprar", min: 2, max: 8, trigger: "Manual", chart: true },
    { id: 3, product: "[LEC-001] Leche entera UHT", location: "ALM/Stock", onHand: 22, forecast: 18, route: "Comprar", min: 10, max: 40, trigger: "Auto", chart: false },
    { id: 4, product: "[MAN-001] Mantequilla sin sal", location: "ALM/Stock", onHand: 4, forecast: 2, route: "Comprar", min: 3, max: 12, trigger: "Manual", chart: true },
    { id: 5, product: "[HUE-001] Huevos docena", location: "ALM/Stock", onHand: 6, forecast: 4, route: "Comprar", min: 4, max: 15, trigger: "Auto", chart: false },
    { id: 6, product: "[CHO-500] Chocolate cobertura 500g", location: "ALM/Stock", onHand: 5, forecast: -2, route: "Comprar", min: 2, max: 10, trigger: "Manual", chart: true },
    { id: 7, product: "[CRE-001] Crema de leche", location: "ALM/Stock", onHand: 2, forecast: -4, route: "Comprar", min: 4, max: 16, trigger: "Manual", chart: true, warn: true },
    { id: 8, product: "[AZU-001] Azúcar refinada", location: "ALM/Stock", onHand: 12, forecast: 10, route: "Comprar", min: 5, max: 20, trigger: "Auto", chart: false },
    { id: 9, product: "[VAI-001] Vainilla extracto", location: "ALM/Stock", onHand: 1, forecast: -1, route: "Comprar", min: 1, max: 4, trigger: "Manual", chart: false },
    { id: 10, product: "[CRO-001] Croissants congelados", location: "ALM/Stock", onHand: 0, forecast: -6, route: "Fabricar", min: 5, max: 25, trigger: "Manual", chart: true },
    { id: 11, product: "[TAR-001] Tarta manzana unidad", location: "ALM/Stock", onHand: 8, forecast: 5, route: "Fabricar", min: 4, max: 15, trigger: "Auto", chart: false },
  ],
  locations: [
    { name: "Todos", children: [
      { name: "Ubicaciones físicas", children: [
        { name: "ALM", children: [
          { name: "ALM/Stock" }
        ]}
      ]}
    ]},
  ],
  products: [
    { name: "[PAN-001] Pan de molde integral", category: "Panadería", onHand: 18, forecast: 12, cost: 8.5, price: 12 },
    { name: "[HAR-025] Harina de trigo 25kg", category: "Materia prima", onHand: 3, forecast: -1, cost: 75, price: 0 },
    { name: "[LEC-001] Leche entera UHT", category: "Lácteos", onHand: 22, forecast: 18, cost: 4.2, price: 5.5 },
    { name: "[MAN-001] Mantequilla sin sal", category: "Lácteos", onHand: 4, forecast: 2, cost: 28, price: 0 },
    { name: "[CRO-001] Croissants congelados", category: "Producto terminado", onHand: 0, forecast: -6, cost: 1.2, price: 3.5 },
  ],
  planning: {
    resources: ["Horno 1", "Horno 2", "Pastelería", "Empaque"],
    shifts: [
      { resource: "Horno 1", start: 1, span: 3, label: "Pan de molde", color: "#2d6a4f" },
      { resource: "Horno 1", start: 5, span: 2, label: "Croissants", color: "#52b788" },
      { resource: "Horno 2", start: 2, span: 4, label: "Tarta manzana", color: "#d4a373" },
      { resource: "Pastelería", start: 1, span: 5, label: "Decoración pasteles", color: "#40916c" },
      { resource: "Pastelería", start: 6, span: 2, label: "Cupcakes", color: "#1b4332" },
      { resource: "Empaque", start: 3, span: 3, label: "Empaque diario", color: "#52796f" },
    ],
    days: ["Lun 19", "Mar 20", "Mié 21", "Jue 22", "Vie 23", "Sáb 24", "Dom 25"],
  },
  accounting: {
    kpis: [
      { label: "Caja", value: "S/ 12,450", delta: "+8%" },
      { label: "Por cobrar", value: "S/ 3,280", delta: "-2%" },
      { label: "Por pagar", value: "S/ 1,940", delta: "+5%" },
      { label: "Banco", value: "S/ 8,760", delta: "+1%" },
    ],
    journals: [
      { name: "Facturas clientes", count: 12, amount: "S/ 4,560" },
      { name: "Facturas proveedores", count: 8, amount: "S/ 2,890" },
      { name: "Banco", count: 24, amount: "S/ 18,200" },
      { name: "Varios", count: 3, amount: "S/ 420" },
    ],
    moves: [
      { date: "19/05/2026", number: "FAC/2026/0042", partner: "Café Lima Centro", amount: "S/ 680.00", status: "Publicado" },
      { date: "19/05/2026", number: "FAC-P/2026/0018", partner: "Distribuidora Lácteos SAC", amount: "S/ 1,240.00", status: "Publicado" },
      { date: "18/05/2026", number: "FAC/2026/0041", partner: "Bodega San Isidro", amount: "S/ 920.00", status: "Publicado" },
      { date: "18/05/2026", number: "FAC-P/2026/0017", partner: "Molinos del Perú", amount: "S/ 750.00", status: "Borrador" },
    ],
    reportCharts: {
      revenue: [{ l: "Ene", v: 6200 }, { l: "Feb", v: 7100 }, { l: "Mar", v: 6800 }, { l: "Abr", v: 8200 }, { l: "May", v: 8420 }],
      expenses: [{ l: "Materia prima", v: 42, c: "#2d6a4f" }, { l: "Nómina", v: 28, c: "#52b788" }, { l: "Servicios", v: 18, c: "#d4a373" }, { l: "Otros", v: 12, c: "#40916c" }],
    },
  },
  purchase: [
    { vendor: "Distribuidora Lácteos SAC", reference: "C00042", date: "19/05/2026", total: "S/ 1,240", status: "RFQ enviada" },
    { vendor: "Molinos del Perú", reference: "C00041", date: "18/05/2026", total: "S/ 750", status: "Orden de compra" },
    { vendor: "Chocolates Premium", reference: "C00040", date: "17/05/2026", total: "S/ 560", status: "Solicitud" },
  ],
  sales: [
    { customer: "Café Lima Centro", order: "V00038", date: "19/05/2026", total: "S/ 680", status: "Pedido de venta" },
    { customer: "Bodega San Isidro", order: "V00037", date: "18/05/2026", total: "S/ 920", status: "Cotización" },
    { customer: "Pastelería Miraflores", order: "V00036", date: "17/05/2026", total: "S/ 1,150", status: "Pedido de venta" },
  ],
  manufacturing: [
    { product: "[CRO-001] Croissants congelados", mo: "OF/00124", qty: 120, status: "En progreso" },
    { product: "[TAR-001] Tarta manzana", mo: "OF/00123", qty: 24, status: "Confirmado" },
    { product: "[PAN-001] Pan de molde integral", mo: "OF/00122", qty: 80, status: "Terminado" },
  ],
  planningReport: [
    { resource: "Horno 1", planned: "38h", utilized: "92%", conflicts: 0 },
    { resource: "Horno 2", planned: "32h", utilized: "78%", conflicts: 1 },
    { resource: "Pastelería", planned: "40h", utilized: "85%", conflicts: 0 },
    { resource: "Empaque", planned: "18h", utilized: "60%", conflicts: 0 },
  ],
  planningConfig: [
    { label: "Horario laboral", value: "Lun–Sáb 6:00–18:00" },
    { label: "Turno predeterminado", value: "8 horas" },
    { label: "Auto-planificar fabricación", value: "Activado" },
    { label: "Detección de conflictos", value: "Activado" },
  ],
  forkast: {
    products: [
      { id: "croissant", name: "Croissants", unit: "unid", stock: 45, min: 30, sales: [120, 135, 128, 142, 138, 155, 148], route: "Fabricar", resource: "Horno 1", leadDays: 1, cost: 1.2 },
      { id: "tarta", name: "Tarta manzana", unit: "unid", stock: 8, min: 6, sales: [18, 22, 20, 24, 19, 26, 23], route: "Fabricar", resource: "Horno 2", leadDays: 2, cost: 8.5 },
      { id: "pan", name: "Pan de molde", unit: "kg", stock: 18, min: 8, sales: [14, 16, 12, 15, 18, 14, 16], route: "Fabricar", resource: "Horno 1", leadDays: 1, cost: 8.5 },
      { id: "leche", name: "Leche UHT", unit: "L", stock: 22, min: 10, sales: [18, 22, 20, 15, 24, 20, 21], route: "Comprar", supplier: "Distribuidora Lácteos", leadDays: 2, cost: 4.2 },
      { id: "harina", name: "Harina 25kg", unit: "bolsa", stock: 3, min: 2, sales: [1, 0, 1, 1, 0, 1, 1], route: "Comprar", supplier: "Molinos del Perú", leadDays: 3, cost: 75 },
      { id: "mantequilla", name: "Mantequilla", unit: "kg", stock: 4, min: 3, sales: [5, 6, 4, 7, 5, 6, 5], route: "Comprar", supplier: "Distribuidora Lácteos", leadDays: 2, cost: 28 },
    ],
    algorithms: [
      { id: "wma", name: "WMA ponderada", desc: "Promedio móvil ponderado — ideal para demanda variable en pastelería", accuracy: 91 },
      { id: "sma", name: "SMA (media simple)", desc: "Media de los últimos 7 días — rápido y estable", accuracy: 84 },
      { id: "ets", name: "ETS (suavizado)", desc: "Suavizado exponencial — captura tendencia semanal", accuracy: 88 },
      { id: "prophet", name: "Prophet (ML)", desc: "Modelo Prophet — feriados, clima y picos de fin de semana", accuracy: 93 },
    ],
    periods: [
      { id: 7, label: "7 días (1 semana)" },
      { id: 14, label: "14 días (2 semanas)" },
      { id: 30, label: "30 días (1 mes)" },
    ],
    salesSources: [
      { id: "pos", label: "TPV Patty Pastelería" },
      { id: "rappi", label: "Rappi + PedidosYa" },
      { id: "all", label: "Todos los canales" },
    ],
  },
  placeholders: {
    crm: { title: "Embudo de ventas", rows: [
      { name: "Café Lima Centro", stage: "Calificado", amount: "S/ 2,400" },
      { name: "Cadena Wong", stage: "Nuevo", amount: "S/ 5,800" },
      { name: "Hotel Costa Verde", stage: "Propuesta", amount: "S/ 3,200" },
    ]},
    project: { title: "Tareas", rows: [
      { name: "Implementar forecast WMA", assignee: "Admin", status: "En progreso" },
      { name: "Capacitación inventario", assignee: "Patricia", status: "Terminado" },
    ]},
    pos: { title: "Sesiones TPV", rows: [
      { name: "Local Miraflores", session: "TPV/0041", total: "S/ 840", status: "Abierta" },
      { name: "Local San Isidro", session: "TPV/0040", total: "S/ 1,120", status: "Cerrada" },
    ]},
    discuss: { title: "Canales", rows: [
      { name: "# general", msgs: 12, last: "Stock actualizado" },
      { name: "# compras", msgs: 5, last: "RFQ harina enviada" },
    ]},
    documents: { title: "Documentos", rows: [
      { name: "Contrato proveedor lácteos.pdf", folder: "Compras", date: "10/05/2026" },
      { name: "Lista precios mayo.xlsx", folder: "Ventas", date: "01/05/2026" },
    ]},
    website: { title: "Páginas", rows: [
      { name: "Inicio", url: "/", status: "Publicada" },
      { name: "Menú pasteles", url: "/tienda", status: "Publicada" },
    ]},
  },
};

window.ODOO_DEMO.calcToOrder = function (row) {
  var target = Math.max(row.min, row.max);
  if (row.forecast < row.min) target = row.max;
  return Math.max(0, Math.ceil(target - row.onHand));
};

window.ODOO_DEMO.forecastInfoFor = function (row) {
  return {
    title: "Información de reabastecimiento",
    text: "Cuando el stock en la fecha prevista esté por debajo del mínimo (" + row.min + "), se debe reabastecer hasta el nivel máximo (" + row.max + ").",
    product: row.product,
    min: row.min,
    max: row.max,
    uom: row.route === "Fabricar" ? "un" : "ud",
    onHand: row.onHand,
    forecast: row.forecast,
    toOrder: window.ODOO_DEMO.calcToOrder(row),
  };
};
