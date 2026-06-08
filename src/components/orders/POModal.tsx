import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { SUPPLIERS } from "@/data/mockData";
import type { PurchaseOrder } from "@/types";

const EMPTY: Partial<PurchaseOrder> = {
  vendor: "",
  product: "",
  qty: 10,
  precioUnit: 0,
  plazoEntrega: "2 días",
  condicionPago: "30 días",
  metodoPago: "Transferencia",
  contacto: "",
  direccion: "ALM/Stock · Surco",
  status: "Borrador",
};

function calcTotal(qty: number, unit: number) {
  const sub = qty * unit;
  const igv = sub * 0.18;
  return sub + igv;
}

export function POModal() {
  const modal = useAppStore((s) => s.poModal);
  const close = useAppStore((s) => s.closePOModal);
  const save = useAppStore((s) => s.savePO);
  const purchases = useAppStore((s) => s.purchases);

  const order = modal.orderId ? purchases.find((p) => p.id === modal.orderId) : null;
  const isView = modal.mode === "view" && !!order;
  const isCreate = modal.mode === "create";

  const [form, setForm] = useState<Partial<PurchaseOrder>>(EMPTY);

  useEffect(() => {
    if (isView && order) setForm(order);
    else if (isCreate) setForm({ ...EMPTY, ...modal.prefilled });
  }, [modal.mode, modal.orderId, modal.prefilled, isView, order]);

  if (modal.mode === "closed") return null;

  function setField<K extends keyof PurchaseOrder>(key: K, value: PurchaseOrder[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSupplierPick(name: string) {
    const s = SUPPLIERS.find((x) => x.name === name);
    if (!s) return;
    setForm((f) => ({
      ...f,
      vendor: s.name,
      contacto: s.contact,
      plazoEntrega: s.plazoEntrega,
      precioUnit: s.unitPrice,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vendor || !form.product) return;
    const qty = form.qty || 1;
    const unit = form.precioUnit || 0;
    save({
      ...form,
      qty,
      precioUnit: unit,
      total: `S/ ${calcTotal(qty, unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: form.status || "RFQ enviada",
    });
    close();
  }

  const qty = form.qty || 0;
  const unit = form.precioUnit || 0;
  const total = calcTotal(qty, unit);

  return (
    <AnimatePresence>
      <motion.div className="order-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="order-modal" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            <div className="order-modal-header">
              <div>
                <span className="order-modal-tag">{isView ? "Detalle OC" : "Nueva orden de compra"}</span>
                <h3>{isView ? order?.reference : "Registrar OC manualmente"}</h3>
              </div>
              <button type="button" className="order-modal-close" onClick={close} aria-label="Cerrar"><X size={20} /></button>
            </div>

            {isCreate && (
              <div className="supplier-chips">
                <span className="supplier-chips-label">Cotizar con proveedor:</span>
                {SUPPLIERS.map((s) => (
                  <button key={s.id} type="button" className={`supplier-chip ${form.vendor === s.name ? "active" : ""}`} onClick={() => handleSupplierPick(s.name)}>
                    {s.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}

            <form className="order-form" onSubmit={handleSubmit}>
              <div className="order-form-grid">
                <Field label="Proveedor" value={form.vendor || ""} onChange={(v) => setField("vendor", v)} readOnly={isView} />
                <Field label="Producto / SKU" value={form.product || ""} onChange={(v) => setField("product", v)} readOnly={isView} />
                <Field label="Cantidad" value={String(form.qty ?? "")} onChange={(v) => setField("qty", Number(v) || 0)} readOnly={isView} type="number" />
                <Field label="Precio unitario (S/)" value={String(form.precioUnit ?? "")} onChange={(v) => setField("precioUnit", Number(v) || 0)} readOnly={isView} type="number" />
                <Field label="Plazo de entrega" value={form.plazoEntrega || ""} onChange={(v) => setField("plazoEntrega", v)} readOnly={isView} />
                <Field label="Condición de pago" value={form.condicionPago || ""} onChange={(v) => setField("condicionPago", v)} readOnly={isView} />
                <Field label="Método de pago" value={form.metodoPago || ""} onChange={(v) => setField("metodoPago", v)} readOnly={isView} />
                <Field label="Contacto proveedor" value={form.contacto || ""} onChange={(v) => setField("contacto", v)} readOnly={isView} />
                <Field label="Dirección entrega" value={form.direccion || ""} onChange={(v) => setField("direccion", v)} readOnly={isView} />
                {isView && (
                  <>
                    <Field label="Referencia" value={order?.reference || ""} readOnly />
                    <Field label="Estado" value={order?.status || ""} readOnly />
                    <Field label="Fecha" value={order?.date || ""} readOnly />
                    <Field label="Total" value={order?.total || ""} readOnly />
                  </>
                )}
              </div>

              {!isView && (
                <div className="order-totals-inline">
                  <span>Subtotal: S/ {(qty * unit).toFixed(2)}</span>
                  <span>IGV: S/ {(qty * unit * 0.18).toFixed(2)}</span>
                  <strong>Total: S/ {total.toFixed(2)}</strong>
                </div>
              )}

              <div className="order-modal-actions">
                {isView ? (
                  <button type="button" className="btn btn-secondary" onClick={close}>Cerrar</button>
                ) : (
                  <>
                    <button type="button" className="btn btn-secondary" onClick={close}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Crear OC</button>
                  </>
                )}
              </div>
            </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, readOnly, type = "text" }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string;
}) {
  return (
    <label className="order-field">
      <span>{label}</span>
      {readOnly ? (
        <div className="order-field-read">{value || "—"}</div>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} />
      )}
    </label>
  );
}
