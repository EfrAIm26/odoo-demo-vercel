import { motion } from "framer-motion";
import { REPLENISHMENT, SUPPLIERS, PRODUCT_INGREDIENTS, calcToOrder } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";

export function InventoryPage() {
  const openPOCreate = useAppStore((s) => s.openPOCreate);
  const openMOCreate = useAppStore((s) => s.openMOCreate);
  const stockouts = REPLENISHMENT.filter((r) => r.onHand <= 0 || r.forecast < 0).length;

  return (
    <div className="page">
      <div className="cp" style={{ margin: "-20px -20px 20px", maxWidth: "none" }}>
        <div className="cp-title">Inventario · Reabastecimiento</div>
      </div>

      {stockouts > 0 && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          🚨 <strong>{stockouts} quiebre(s) de stock</strong> detectados — revisa productos en rojo.
        </div>
      )}

      <motion.div className="kpi-grid" style={{ marginBottom: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="kpi"><label>Productos</label><div className="val">{REPLENISHMENT.length}</div></div>
        <div className="kpi kpi-red"><label>Quiebres</label><div className="val">{stockouts}</div></div>
        <div className="kpi"><label>Por reordenar</label><div className="val">{REPLENISHMENT.filter((r) => calcToOrder(r) > 0).length}</div></div>
      </motion.div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="section-title">🏪 Proveedores — cotiza en la plataforma</h3>
        <div className="supplier-list">
          {SUPPLIERS.map((s) => (
            <button key={s.id} type="button" className="supplier-list-item" onClick={() => openPOCreate({ vendor: s.name, contacto: s.contact, plazoEntrega: s.plazoEntrega, precioUnit: s.unitPrice })}>
              <strong>{s.name}</strong>
              <span>Plazo {s.plazoEntrega}</span>
              <span className="supplier-quote">Cotizar →</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card table-wrap">
        <table className="data">
          <thead>
            <tr><th>Producto</th><th>Insumos / ingredientes</th><th>Existencias</th><th>Pronóstico</th><th>A pedir</th><th></th></tr>
          </thead>
          <tbody>
            {REPLENISHMENT.map((r) => {
              const toOrder = calcToOrder(r);
              const name = r.product.split("] ")[1] || r.product;
              const ingredients = PRODUCT_INGREDIENTS[name] || "—";
              const isStockout = r.onHand <= 0 || r.forecast < 0;
              return (
                <tr key={r.id} className={isStockout ? "row-stockout" : ""}>
                  <td><strong>{r.product}</strong>{isStockout && " ⚠️"}</td>
                  <td style={{ fontSize: 12, color: "var(--sf-muted)" }}>{ingredients}</td>
                  <td style={{ color: r.onHand <= 0 ? "var(--sf-danger)" : undefined, fontWeight: r.onHand <= 0 ? 700 : 400 }}>{r.onHand}</td>
                  <td style={{ color: r.forecast < 0 ? "var(--sf-danger)" : undefined }}>{r.forecast}</td>
                  <td><strong>{toOrder}</strong></td>
                  <td>
                    {toOrder > 0 && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                        onClick={() => {
                          if (r.route === "Fabricar") {
                            openMOCreate({ product: name, qty: toOrder, ingredients });
                          } else {
                            openPOCreate({ product: name, qty: toOrder, vendor: r.supplier, precioUnit: r.unitPrice, plazoEntrega: "2 días" });
                          }
                        }}
                      >
                        {r.route === "Fabricar" ? "Producir" : "Ordenar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
