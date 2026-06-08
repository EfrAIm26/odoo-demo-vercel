import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const FIELD_LABELS: Record<string, string> = {
  proveedor: "Proveedor",
  producto: "Producto / SKU",
  cantidad: "Cantidad",
  precioUnit: "Precio unitario",
  subtotal: "Subtotal",
  igv: "IGV (18%)",
  total: "Total",
  plazoEntrega: "Plazo de entrega",
  direccion: "Dirección de entrega",
  condicionPago: "Condición de pago",
  metodoPago: "Método de pago",
  contacto: "Contacto proveedor",
};

export function POFormOverlay() {
  const active = useAppStore((s) => s.poFormActive);
  const fields = useAppStore((s) => s.poFormFields);
  const filledKeys = useAppStore((s) => s.poFormFilledKeys);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="po-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="po-form-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          <div className="po-form-header">
            <span>Orden de compra · Smart Food</span>
            <span className="po-form-badge">Foodie completando...</span>
          </div>
          <div className="po-form-body">
            {Object.entries(FIELD_LABELS).map(([key, label]) => {
              const value = fields[key];
              const filled = filledKeys.includes(key);
              return (
                <div key={key} className={`po-field ${filled ? "filled" : ""}`}>
                  <label>{label}</label>
                  <div className="po-field-val">
                    {filled ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{value}</motion.span>
                    ) : (
                      <span className="po-field-empty">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
