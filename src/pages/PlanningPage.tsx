import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useAppStore, getForkastProduct } from "@/store/useAppStore";
import { FORKAST_PRODUCTS, PERIODS, SALES_SOURCES, aggregateChart, PRODUCT_INGREDIENTS } from "@/data/mockData";

export function PlanningPage() {
  const [params] = useSearchParams();
  const fk = useAppStore((s) => s.forkast);
  const setField = useAppStore((s) => s.setForkastField);
  const tab = useAppStore((s) => s.planningTab);
  const setTab = useAppStore((s) => s.setPlanningTab);
  const productionOrders = useAppStore((s) => s.productionOrders);
  const highlightOrderId = useAppStore((s) => s.highlightOrderId);
  const openMOView = useAppStore((s) => s.openMOView);
  const openMOCreate = useAppStore((s) => s.openMOCreate);
  const openPOCreate = useAppStore((s) => s.openPOCreate);

  const product = getForkastProduct(fk.productId);
  const produceQty = Math.round(fk.daily * 1.1);
  const chartData = aggregateChart(fk.chart, fk.chartGranularity);

  useEffect(() => {
    const t = params.get("tab");
    if (t === "production" || t === "forecast") setTab(t);
  }, [params, setTab]);

  return (
    <div className="page">
      <div className="cp" style={{ margin: "-20px -20px 20px", maxWidth: "none" }}>
        <div className="cp-title">Smart Food AI · Planificación</div>
        <span className="badge">Pronóstico activo</span>
      </div>

      <motion.div className="controls-bar card" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="controls-grid">
          <div>
            <label>Producto</label>
            <select className="select-field" value={fk.productId} onChange={(e) => setField("productId", e.target.value)}>
              {FORKAST_PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </select>
          </div>
          <div>
            <label>Fuente de ventas</label>
            <select className="select-field" value={fk.source} onChange={(e) => setField("source", e.target.value)}>
              {SALES_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label>Días a pronosticar</label>
            <select className="select-field" value={fk.period} onChange={(e) => setField("period", Number(e.target.value))}>
              {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="kpi-grid" style={{ marginBottom: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="kpi kpi-green"><label>🟢 Merma actual</label><div className="val">{fk.kpis.wastePct}%</div></div>
        <div className="kpi"><label>Demanda diaria</label><div className="val">{fk.daily} {product.unit}</div></div>
        <div className="kpi"><label>Total periodo</label><div className="val">{fk.daily * fk.period} {product.unit}</div></div>
        <div className="kpi kpi-red"><label>🔴 Pérdida/mes</label><div className="val">S/ {fk.kpis.loss.toLocaleString()}</div></div>
        <div className="kpi"><label>Ahorro potencial</label><div className="val">S/ {fk.kpis.savingsPotential.toLocaleString()}</div></div>
      </motion.div>

      {fk.kpis.wastePct >= 10 && <div className="alert alert-error">⚠️ Merma alta ({fk.kpis.wastePct}%) — reduce producción o revisa turnos de {product.name}.</div>}
      <div className="alert alert-info">Precisión del modelo: 91% — pronóstico confiable para {fk.period} días.</div>

      <div className="tabs">
        {[
          { id: "forecast" as const, label: "Pronóstico y merma" },
          { id: "production" as const, label: "Órdenes de producción (OP)" },
        ].map((t) => (
          <button key={t.id} type="button" className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "forecast" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="section-title">¿Cuánto producir?</h3>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--sf-primary)" }}>{produceQty} {product.unit} / día</p>
            <p style={{ fontSize: 13, color: "var(--sf-muted)", marginTop: 8 }}>Incluye 10% colchón · {product.resource || product.supplier}</p>
          </div>

          {product.route === "Fabricar" && (
            <div className="card" style={{ marginBottom: 16, background: "var(--sf-accent)" }}>
              <h3 className="section-title">📦 Insumos / Ingredientes requeridos</h3>
              <p style={{ fontSize: 13, color: "var(--sf-text)", marginTop: 8, lineHeight: 1.6 }}>
                {PRODUCT_INGREDIENTS[product.name] || "No hay ingredientes registrados"}
              </p>
              <p style={{ fontSize: 11, color: "var(--sf-muted)", marginTop: 12 }}>
                Cantidades para {produceQty} {product.unit}/día · Validar disponibilidad en Inventario
              </p>
            </div>
          )}

          <motion.div className="card" style={{ height: 340, marginBottom: 16 }} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h3 className="section-title" style={{ margin: 0 }}>Ventas, pronóstico y merma</h3>
              <div className="granularity-tabs">
                {(["day", "week", "month"] as const).map((g) => (
                  <button key={g} type="button" className={`gran-tab ${fk.chartGranularity === g ? "active" : ""}`} onClick={() => setField("chartGranularity", g)}>
                    {g === "day" ? "Por día" : g === "week" ? "Por semana" : "Por mes"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: "calc(100% - 44px)" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dce6ec" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--sf-surface)", border: "1px solid var(--sf-border)", borderRadius: 8 }} />
                  <Legend verticalAlign="bottom" align="center" />
                  <Bar dataKey="waste" fill="#3d9a6a" name="Merma" radius={[2, 2, 0, 0]} animationDuration={800} />
                  <Line type="monotone" dataKey="actual" stroke="#4A90B8" strokeWidth={2.5} dot={false} name="Ventas" animationDuration={800} />
                  <Line type="monotone" dataKey="forecast" stroke="#7eb8d4" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Pronóstico" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="action-grid">
            {product.route === "Comprar" ? (
              <div className="action-card buy">
                <div><strong>Comprar stock</strong><p>Pedir {Math.round(fk.daily * fk.period * 0.3)} {product.unit} a {product.supplier}</p>
                  <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => openPOCreate({ product: product.name, qty: Math.round(fk.daily * fk.period * 0.3), vendor: product.supplier })}>Crear OC</button></div>
              </div>
            ) : (
              <div className="action-card make">
                <div><strong>Producir</strong><p>Fabricar {Math.round(fk.daily * fk.period)} {product.unit} en {product.resource}</p>
                  <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => openMOCreate({ product: product.name, qty: Math.round(fk.daily * fk.period), resource: product.resource })}>Nueva OP</button></div>
              </div>
            )}
            <div className="action-card">
              <div><strong>Ver trazabilidad</strong><p>{productionOrders.length} órdenes de producción activas</p>
                <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => setTab("production")}>Ver OP</button></div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "production" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="cp" style={{ padding: "0 0 16px", background: "transparent", border: "none" }}>
            <button type="button" className="btn btn-primary" onClick={() => openMOCreate()}>Nueva OP</button>
            <span style={{ fontSize: 13, color: "var(--sf-muted)" }}>Clic en una fila para ver ingredientes, tiempo y recurso</span>
          </div>
          <div className="card table-wrap">
            <table className="data">
              <thead><tr><th>Referencia</th><th>Producto</th><th>Cantidad</th><th>Recurso</th><th>Duración</th><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {productionOrders.map((o) => (
                  <tr
                    key={o.id}
                    className={highlightOrderId === o.id ? "row-highlight" : ""}
                    onClick={() => openMOView(o.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td><strong>{o.reference}</strong></td>
                    <td>{o.product}</td>
                    <td>{o.qty}</td>
                    <td>{o.resource}</td>
                    <td>{o.duration || "—"}</td>
                    <td>{o.date}</td>
                    <td><span className="badge">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
