import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { STORE_PRODUCTS, SALES_CHANNELS, PROMOTIONS } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";

export function SalesPage() {
  const topProducts = [...STORE_PRODUCTS].sort((a, b) => b.units - a.units).slice(0, 6);

  return (
    <div className="page">
      <div className="cp" style={{ margin: "-20px -20px 20px", maxWidth: "none" }}>
        <div className="cp-title">Ventas · Tienda y promociones</div>
      </div>

      <motion.div className="kpi-grid" style={{ marginBottom: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="kpi"><label>Unidades vendidas</label><div className="val">{STORE_PRODUCTS.reduce((a, p) => a + p.units, 0).toLocaleString()}</div></div>
        <div className="kpi"><label>Ingresos totales</label><div className="val">S/ {STORE_PRODUCTS.reduce((a, p) => a + p.revenue, 0).toLocaleString()}</div></div>
        <div className="kpi"><label>Canal principal</label><div className="val" style={{ fontSize: 18 }}>Delivery 45%</div></div>
        <div className="kpi kpi-green"><label>Promos activas</label><div className="val">{PROMOTIONS.length}</div></div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" }} className="sales-charts">
        <motion.div className="card" style={{ height: 280 }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="section-title">Top productos</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="product" type="category" tick={{ fontSize: 9 }} width={90} />
              <Tooltip />
              <Bar dataKey="units" fill="var(--sf-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div className="card" style={{ height: 280 }} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <h3 className="section-title">Canales de venta</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={SALES_CHANNELS}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="pct" fill="var(--sf-accent)" name="%" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="card">
        <h3 className="section-title">🎁 Promociones activas</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {PROMOTIONS.map((pr) => (
            <motion.div key={pr.name} className="promo-row" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div>
                <strong>{pr.name}</strong>
                <p style={{ fontSize: 12, color: "var(--sf-muted)", marginTop: 4 }}>{pr.days}</p>
              </div>
              <span className="promo-discount">{pr.discount}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
