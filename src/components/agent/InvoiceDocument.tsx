import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const RECIPIENTS = [
  { email: "contabilidad@pattypasteleria.pe", label: "Contabilidad" },
  { email: "compras@pattypasteleria.pe", label: "Compras" },
  { email: "gerencia@pattypasteleria.pe", label: "Gerencia" },
];

const LINE_ITEMS = [
  { desc: "Harina de trigo 25kg × 8 sacos", supplier: "Molinos del Perú SAC", amount: 885.0 },
  { desc: "Leche entera UHT × 50 L", supplier: "Distribuidora Lácteos SAC", amount: 247.8 },
  { desc: "Chocolate cobertura 70% × 20 kg", supplier: "Chocolates Premium EIRL", amount: 660.8 },
];

export function InvoiceDocument() {
  const open = useAppStore((s) => s.showInvoiceDocument);
  const setOpen = useAppStore((s) => s.setShowInvoiceDocument);

  const subtotal = LINE_ITEMS.reduce((a, l) => a + l.amount / 1.18, 0);
  const igv = LINE_ITEMS.reduce((a, l) => a + l.amount, 0) - subtotal;
  const total = LINE_ITEMS.reduce((a, l) => a + l.amount, 0);
  const invoiceNo = `FP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const date = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="invoice-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="invoice-doc"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button type="button" className="invoice-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              <X size={20} />
            </button>

            <div className="invoice-sent-banner">
              <CheckCircle2 size={28} className="invoice-check" />
              <div>
                <strong>Enviado correctamente</strong>
                <p>Documento distribuido a todos los correos autorizados</p>
              </div>
            </div>

            <div className="invoice-emails">
              {RECIPIENTS.map((r) => (
                <motion.span
                  key={r.email}
                  className="invoice-email-chip"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * RECIPIENTS.indexOf(r) }}
                >
                  <CheckCircle2 size={12} /> {r.label}: {r.email}
                </motion.span>
              ))}
            </div>

            <div className="invoice-paper">
              <div className="invoice-paper-header">
                <div>
                  <FileText size={32} color="#1b4332" />
                  <h2>FACTURA PROFORMA</h2>
                  <p className="invoice-ruc">RUC 20123456789 · Patty Pastelería SAC</p>
                </div>
                <div className="invoice-meta">
                  <div><label>N° Documento</label><strong>{invoiceNo}</strong></div>
                  <div><label>Fecha emisión</label><strong>{date}</strong></div>
                  <div><label>Moneda</label><strong>PEN (S/)</strong></div>
                </div>
              </div>

              <div className="invoice-parties">
                <div>
                  <label>Emisor</label>
                  <p><strong>Patty Pastelería SAC</strong></p>
                  <p>Av. Primavera 120, Santiago de Surco, Lima</p>
                </div>
                <div>
                  <label>Cliente / Destino</label>
                  <p><strong>Operaciones — Reabastecimiento mensual</strong></p>
                  <p>Centro de distribución ALM/Stock</p>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Proveedor</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {LINE_ITEMS.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.desc}</td>
                      <td>{item.supplier}</td>
                      <td>S/ {item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                <div><span>IGV (18%)</span><span>S/ {igv.toFixed(2)}</span></div>
                <div className="invoice-total-row"><span>TOTAL</span><span>S/ {total.toFixed(2)}</span></div>
              </div>

              <div className="invoice-footer">
                <p>Condición de pago: según OC individuales · Lead time promedio: 3.3 días</p>
                <p>Ahorro merma proyectado del mes: <strong>S/ 2,847.00</strong> · ROI estimado: <strong>104%</strong></p>
                <p className="invoice-legal">Documento generado automáticamente por Smart Food AI · Válido como referencia proforma</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
