import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { PlanningPage } from "@/pages/PlanningPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { PurchasePage } from "@/pages/PurchasePage";
import { FinancePage } from "@/pages/FinancePage";
import { SalesPage } from "@/pages/SalesPage";
import { AgentChat } from "@/components/agent/AgentChat";
import { AgentOrchestrator } from "@/components/agent/AgentOrchestrator";
import { POFormOverlay } from "@/components/agent/POFormOverlay";
import { InvoiceDocument } from "@/components/agent/InvoiceDocument";
import { ThinkingDock } from "@/components/agent/ThinkingDock";
import { POModal } from "@/components/orders/POModal";
import { MOModal } from "@/components/orders/MOModal";
import { Toast } from "@/components/ui/Toast";

export default function App() {
  return (
    <>
      <AgentOrchestrator />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/planificacion/*" element={<PlanningPage />} />
          <Route path="/inventario/*" element={<InventoryPage />} />
          <Route path="/compras/*" element={<PurchasePage />} />
          <Route path="/finanzas/*" element={<FinancePage />} />
          <Route path="/ventas/*" element={<SalesPage />} />
        </Route>
      </Routes>
      <AgentChat />
      <ThinkingDock />
      <POFormOverlay />
      <POModal />
      <MOModal />
      <InvoiceDocument />
      <Toast />
    </>
  );
}
