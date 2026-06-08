import { useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PURCHASE_STATUS, FINANCE_SUMMARY } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";

export function PurchasePage() {
  const purchases = useAppStore((s) => s.purchases);
  const tab = useAppStore((s) => s.purchaseTab);
  const setTab = useAppStore((s) => s.setPurchaseTab);
  const highlightOrderId = useAppStore((s) => s.highlightOrderId);
  const openPOView = useAppStore((s) => s.openPOView);
  const openPOCreate = useAppStore((s) => s.openPOCreate);

  useEffect(() => {
    if (highlightOrderId) {
      setTab("orders");
      const t = setTimeout(() => useAppStore.getState().setHighlightOrderId(null), 4000);
      return () => clearTimeout(t);
    }
  }, [highlightOrderId, setTab]);

  return (
    <div className="page">
      <div className="cp" style={{ margin: "-20px -20px 20px", maxWidth: "none" }}>
        <button type="button" className="btn btn-primary" onClick={() => openPOCreate()}>Nueva OC</button>
        <div className="cp-title">Compras · Órdenes y promociones</div>
      </div>

      <div className="tabs">
        {[
          { id: "orders" as const, label: "Órdenes de compra" },
        ].map((t) => (
          <button key={t.id} type="button" className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "orders" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>Clic en una fila para ver detalle — proveedor, precio, plazo de entrega, etc.</div>
          <div className="card table-wrap" style={{ marginBottom: 20 }}>
            <table className="data">
              <thead><tr><th>Referencia</th><th>Proveedor</th><th>Producto</th><th>Cant.</th><th>Plazo entrega</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    className={highlightOrderId === p.id ? "row-highlight" : ""}
                    onClick={() => openPOView(p.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td><strong>{p.reference}</strong></td>
                    <td>{p.vendor}</td>
                    <td>{p.product || "—"}</td>
                    <td>{p.qty || "—"}</td>
                    <td>{p.plazoEntrega || "—"}</td>
                    <td>{p.date}</td>
                    <td>{p.total}</td>
                    <td><span className="badge">{p.status}</span></td>
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
