import { Outlet, Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { USER } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";
import { Logo } from "@/components/ui/Logo";

const MODULE_LINKS = [
  { path: "/planificacion", label: "Planificación" },
  { path: "/inventario", label: "Inventario" },
  { path: "/compras", label: "Compras" },
  { path: "/finanzas", label: "Finanzas" },
  { path: "/ventas", label: "Ventas" },
];

export function AppShell() {
  const location = useLocation();
  const setChatOpen = useAppStore((s) => s.setChatOpen);
  const dockVisible = useAppStore((s) => s.workflowActive || s.thinkingChain.length > 0);
  const isHome = location.pathname === "/";

  return (
    <div className={`shell ${dockVisible ? "has-dock" : ""}`}>
      <div className="hero-bg" />
      {!isHome && (
        <header className="navbar">
          <Link to="/" className="navbar-brand">
            <Logo size={28} />
            <span>Smart</span> Food
          </Link>
          {MODULE_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-link ${location.pathname.startsWith(l.path) ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="nav-spacer" />
          <div className="nav-user">
            <span>{USER.company}</span>
            <div className="avatar">{USER.initials}</div>
          </div>
        </header>
      )}
      <main className="main">
        <Outlet />
      </main>
      <button className="chat-fab" onClick={() => setChatOpen(true)} type="button" aria-label="Abrir asistente">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
