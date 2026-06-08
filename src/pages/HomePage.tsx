import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { APPS, USER } from "@/data/mockData";
import { Logo } from "@/components/ui/Logo";

export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-top">
        <div className="home-logo">
          <Logo size={44} /> Smart Food
        </div>
        <div className="nav-user">
          <span>{USER.company}</span>
          <div className="avatar">{USER.initials}</div>
        </div>
      </div>

      <div className="home-split">
        <motion.section
          className="hero-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hero-tag">Smart Food AI</span>
          <h2>Reduce la merma.<br />Pronostica la demanda.</h2>
          <p>Para pastelerías y restaurantes</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span>−35%</span>
              <small>reducción de merma<br />en 1 mes</small>
            </div>
            <div className="hero-stat hero-stat-active">
              <span>91%</span>
              <small>precisión del<br />pronóstico de ventas</small>
            </div>
            <div className="hero-stat">
              <span>S/ 2,847</span>
              <small>ahorro estimado<br />por mes</small>
            </div>
          </div>
        </motion.section>

        <nav className="module-nav">
          {APPS.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i }}
              whileHover={{ scale: 1.02, x: 4 }}
            >
              <Link to={app.path} className={`module-btn ${i === 0 ? "active" : ""}`}>
                <span className="module-emoji">{app.emoji}</span>
                <span>{app.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </div>
  );
}
