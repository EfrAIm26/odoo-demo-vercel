import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { FORKAST_PRODUCTS } from "@/data/mockData";
import type { ProductionOrder } from "@/types";

const RESOURCES = ["Horno 1", "Horno 2", "Pastelería", "Empaque"];

const EMPTY: Partial<ProductionOrder> = {
  product: "Brownie",
  qty: 100,
  resource: "Horno 2",
  ingredients: "",
  duration: "4h",
  startTime: "08:00",
  endTime: "12:00",
  status: "Programada",
};

export function MOModal() {
  const modal = useAppStore((s) => s.moModal);
  const close = useAppStore((s) => s.closeMOModal);
  const save = useAppStore((s) => s.saveMO);
  const orders = useAppStore((s) => s.productionOrders);

  const order = modal.orderId ? orders.find((o) => o.id === modal.orderId) : null;
  const isView = modal.mode === "view" && !!order;
  const isCreate = modal.mode === "create";

  const [form, setForm] = useState<Partial<ProductionOrder>>(EMPTY);

  useEffect(() => {
    if (isView && order) setForm(order);
    else if (isCreate) setForm({ ...EMPTY, ...modal.prefilled });
  }, [modal.mode, modal.orderId, modal.prefilled, isView, order]);

  if (modal.mode === "closed") return null;

  function setField<K extends keyof ProductionOrder>(key: K, value: ProductionOrder[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product || !form.resource) return;
    save({ ...form, status: form.status || "Programada" });
    close();
  }

  return (
    <AnimatePresence>
      <motion.div className="order-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="order-modal" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="order-modal-header">
            <div>
              <span className="order-modal-tag">{isView ? "Detalle OP" : "Nueva orden de producción"}</span>
              <h3>{isView ? order?.reference : "Registrar OP manualmente"}</h3>
            </div>
            <button type="button" className="order-modal-close" onClick={close} aria-label="Cerrar"><X size={20} /></button>
          </div>

          <form className="order-form" onSubmit={handleSubmit}>
            <div className="order-form-grid">
              {isView && (
                <>
                  <Field label="Referencia" value={order?.reference || ""} readOnly />
                  <Field label="Estado" value={order?.status || ""} readOnly />
                  <Field label="Fecha" value={order?.date || ""} readOnly />
                </>
              )}
              <label className="order-field">
                <span>Producto</span>
                {isView ? (
                  <div className="order-field-read">{form.product}</div>
                ) : (
                  <select value={form.product} onChange={(e) => setField("product", e.target.value)}>
                    {FORKAST_PRODUCTS.filter((p) => p.route === "Fabricar").map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                )}
              </label>
              <Field label="Cantidad" value={String(form.qty ?? "")} onChange={(v) => setField("qty", Number(v) || 0)} readOnly={isView} type="number" />
              <label className="order-field">
                <span>Recurso</span>
                {isView ? (
                  <div className="order-field-read">{form.resource}</div>
                ) : (
                  <select value={form.resource} onChange={(e) => setField("resource", e.target.value)}>
                    {RESOURCES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
              </label>
              <Field label="Ingredientes" value={form.ingredients || ""} onChange={(v) => setField("ingredients", v)} readOnly={isView} wide />
              <Field label="Duración" value={form.duration || ""} onChange={(v) => setField("duration", v)} readOnly={isView} />
              <Field label="Hora inicio" value={form.startTime || ""} onChange={(v) => setField("startTime", v)} readOnly={isView} />
              <Field label="Hora fin" value={form.endTime || ""} onChange={(v) => setField("endTime", v)} readOnly={isView} />
            </div>

            <div className="order-modal-actions">
              {isView ? (
                <button type="button" className="btn btn-secondary" onClick={close}>Cerrar</button>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary" onClick={close}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Crear OP</button>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, readOnly, type = "text", wide }: {
  label: string; value: string; onChange?: (v: string) => void; readOnly?: boolean; type?: string; wide?: boolean;
}) {
  return (
    <label className={`order-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      {readOnly ? (
        <div className="order-field-read">{value || "—"}</div>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} />
      )}
    </label>
  );
}
