import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";
import { FINANCE_DAILY, FINANCE_SUMMARY, STORE_PRODUCTS } from "@/data/mockData";
import { useAppStore, getForkastProduct } from "@/store/useAppStore";

export function FinancePage() {
  const fk = useAppStore((s) => s.forkast);
  const product = getForkastProduct(fk.productId);
  const sorted = [...STORE_PRODUCTS].sort((a, b) => b.wastePct - a.wastePct);
  const topWaste = sorted[0];

  const compareData = [
    { label: "Merma controlada (5%)", value: Math.round(FINANCE_SUMMARY.savingsPotential * 0.3), type: "merma" },
    { label: "Pérdida del mes", value: FINANCE_SUMMARY.lossMonth, type: "perdida" },
  ];

  return (
    <div className="page finance-page">
      <div className="cp" style={{ margin: "-20px -20px 20px", maxWidth: "none" }}>
        <div className="cp-title">Finanzas y contabilidad</div>
        <span className="badge">{product.name}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="section-title finance-title">¿Cuánto dinero estás perdiendo en merma?</h3>
        <div className="finance-split-kpis">
          <div className="kpi kpi-green finance-kpi-card">
            <label>🟢 Merma promedio</label>
            <div className="val">{fk.kpis.wastePct}%</div>
            <small>Objetivo: 5%</small>
          </div>
          <div className="kpi kpi-red finance-kpi-card">
            <label>🔴 Pérdida del mes</label>
            <div className="val">S/ {FINANCE_SUMMARY.lossMonth.toLocaleString()}</div>
            <small>Por desperdicio de alimentos</small>
          </div>
        </div>
        <div className="kpi-grid finance-kpis" style={{ marginBottom: 20 }}>
          <div className="kpi"><label>Ahorro potencial</label><div className="val" style={{ color: "var(--sf-success)" }}>S/ {FINANCE_SUMMARY.savingsPotential.toLocaleString()}</div></div>
          <div className="kpi"><label>Ingreso proyectado</label><div className="val">S/ {FINANCE_SUMMARY.projectedRevenue.toLocaleString()}</div></div>
        </div>
        {topWaste && (
          <div className="alert alert-error finance-alert">
            ⚠️ <strong>{topWaste.product}</strong> tiene la merma más alta ({topWaste.wastePct}%) — prioriza acciones aquí.
          </div>
        )}
      </motion.div>

      <motion.div className="card finance-chart" style={{ height: 340, marginBottom: 20 }} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <h3 className="section-title finance-title">Merma vs pérdida mensual</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={compareData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 13 }} />
            <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={160} />
            <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8 }} />
            <Bar dataKey="value" name="S/" radius={[0, 6, 6, 0]} animationDuration={800}>
              {compareData.map((d, i) => (
                <Cell key={i} fill={d.type === "merma" ? "var(--sf-success)" : "var(--sf-danger)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div className="card finance-chart" style={{ marginBottom: 20 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="section-title finance-title">Ingresos vs pérdida por merma (diario)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={FINANCE_DAILY}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8 }} />
            <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 14, paddingTop: 12 }} />
            <Bar dataKey="revenue" fill="var(--sf-success)" name="Ingresos reales" radius={[4, 4, 0, 0]} animationDuration={800} />
            <Bar dataKey="loss" fill="var(--sf-danger)" name="Pérdida por merma" radius={[4, 4, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="card table-wrap finance-table">
        <h3 className="section-title finance-title">Resumen por producto</h3>
        <table className="data">
          <thead><tr><th>Producto</th><th>Ingresos</th><th>Merma (unid.)</th><th>% Merma</th><th>Pérdida est.</th></tr></thead>
          <tbody>
            {sorted.slice(0, 8).map((r, i) => (
              <tr key={r.product} className={i === 0 ? "row-waste-critical" : r.wastePct >= 10.5 ? "row-waste-high" : ""}>
                <td><strong>{r.product}</strong>{i === 0 && " 🔥"}</td>
                <td>S/ {r.revenue.toLocaleString()}</td>
                <td>{r.waste.toLocaleString()}</td>
                <td style={{ color: r.wastePct >= 10.5 ? "var(--sf-danger)" : undefined, fontWeight: r.wastePct >= 10.5 ? 700 : 400 }}>{r.wastePct}%</td>
                <td style={{ color: "var(--sf-danger)" }}>S/ {Math.round(r.waste * 10).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
