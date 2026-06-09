import { chromium } from "playwright";
import { mkdir, rename } from "fs/promises";

const BASE = process.env.APP_URL || "https://odoo-demo-olive.vercel.app";
const OUT = "/opt/cursor/artifacts";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  locale: "es-PE",
});

const page = await context.newPage();
const t0 = Date.now();

const wait = (ms) => page.waitForTimeout(ms);
const elapsed = () => `${((Date.now() - t0) / 1000).toFixed(0)}s`;

async function openChat() {
  if (!(await page.isVisible(".chat-panel"))) {
    await page.click('button[aria-label="Abrir asistente"]');
    await page.waitForSelector(".chat-panel");
  }
  const expanded = await page.locator(".chat-panel.expanded").count();
  if (!expanded) {
    await page.click('.chat-header button[aria-label="Expandir"]');
    await wait(400);
  }
}

async function chatSend(text, replyWait = 4500) {
  await openChat();
  const input = page.locator(".chat-input-row input");
  await input.fill("");
  await wait(300);
  await input.type(text, { delay: 35 });
  await wait(500);
  await page.click(".chat-input-row .btn-primary");
  await wait(replyWait);
}

async function navModule(label) {
  await page.click(`a.nav-link:has-text("${label}")`);
  await page.waitForLoadState("networkidle");
  await wait(1200);
}

async function scrollPage(px = 350) {
  await page.mouse.wheel(0, px);
  await wait(800);
}

async function scrollUp(px = 200) {
  await page.mouse.wheel(0, -px);
  await wait(600);
}

console.log("🎬 Demo Smart Food — producción\n");

try {
  // ── 1. HOME ──────────────────────────────────────────
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await wait(2500);
  console.log(`[${elapsed()}] Home — Patty Pastelería`);

  await page.hover(".hero-card");
  await wait(1500);
  await page.hover('.module-btn:has-text("Planificación")');
  await wait(1200);

  // ── 2. CHAT: saludo + capacidades ────────────────────
  await chatSend("hola Foodie, ¿cómo estás?");
  console.log(`[${elapsed()}] Chat: saludo`);

  await chatSend("¿Qué módulos de Smart Food puedes ayudarme a usar?", 5000);
  console.log(`[${elapsed()}] Chat: módulos`);

  // ── 3. PLANIFICACIÓN ─────────────────────────────────
  await page.click('.module-btn:has-text("Planificación")');
  await page.waitForURL("**/planificacion**");
  await wait(2000);
  await scrollPage(280);
  console.log(`[${elapsed()}] Módulo Planificación`);

  await chatSend("¿Cuál es el pronóstico de ventas del Brownie este mes?", 5500);
  console.log(`[${elapsed()}] Chat: pronóstico`);

  await scrollUp(150);
  await wait(1000);

  // ── 4. INVENTARIO ────────────────────────────────────
  await navModule("Inventario");
  await scrollPage(400);
  await wait(1500);
  console.log(`[${elapsed()}] Módulo Inventario`);

  await chatSend("¿Qué productos tienen quiebre de stock?", 5000);
  console.log(`[${elapsed()}] Chat: quiebres`);

  await scrollUp(200);
  await wait(800);

  // ── 5. FINANZAS + ROI ────────────────────────────────
  await navModule("Finanzas");
  await wait(2000);
  await scrollPage(300);
  console.log(`[${elapsed()}] Módulo Finanzas`);

  await chatSend("¿Cómo puedo optimizar el ROI reduciendo la merma del Brownie?", 6000);
  console.log(`[${elapsed()}] Chat: optimizar ROI`);

  // ── 6. VENTAS ────────────────────────────────────────
  await navModule("Ventas");
  await wait(2000);
  await scrollPage(250);
  console.log(`[${elapsed()}] Módulo Ventas`);

  await chatSend("¿Cuál es el canal de ventas más fuerte?", 4500);

  // ── 7. COMPRAS ───────────────────────────────────────
  await navModule("Compras");
  await wait(2000);
  console.log(`[${elapsed()}] Módulo Compras`);

  await chatSend("¿Qué órdenes de compra recomiendas para este mes?", 5000);
  console.log(`[${elapsed()}] Chat: OC recomendadas`);

  // ── 8. FLUJO AGENTICO COMPLETO (DEMO JURADO) ─────────
  const jury =
    "Haz una predicción simple para este mes de ventas y, de acuerdo a eso y según nuestro inventario, haz las órdenes de compra para este mes para mejorar el ROI.";
  await chatSend(jury, 2000);
  await page.waitForSelector(".agent-live", { timeout: 15000 });
  console.log(`[${elapsed()}] Demo jurado — flujo agentico iniciado`);

  await page.waitForURL("**/planificacion**", { timeout: 20000 });
  await wait(5000);
  console.log(`[${elapsed()}] Agente: pronóstico + merma`);

  await page.waitForURL("**/inventario**", { timeout: 25000 });
  await wait(4000);
  console.log(`[${elapsed()}] Agente: inventario`);

  await page.waitForURL("**/finanzas**", { timeout: 25000 });
  await wait(4000);
  console.log(`[${elapsed()}] Agente: finanzas / ROI 104%`);

  await page.waitForURL("**/compras**", { timeout: 30000 });
  await wait(6000);
  console.log(`[${elapsed()}] Agente: órdenes de compra`);

  // Esperar formulario OC o factura
  await wait(8000);
  const hasPO = await page.locator(".po-form-overlay, .invoice-document").count();
  if (hasPO) console.log(`[${elapsed()}] Agente: formularios OC / factura`);

  await wait(5000);
  await page.screenshot({ path: `${OUT}/demo-full-final.png`, fullPage: true });

  const totalSec = (Date.now() - t0) / 1000;
  console.log(`\n✅ Demo completado — ${totalSec.toFixed(0)} segundos`);
  if (totalSec < 60) console.warn(`⚠ Duración ${totalSec.toFixed(0)}s < 60s objetivo`);
} catch (e) {
  console.error("Error:", e.message);
  await page.screenshot({ path: `${OUT}/demo-full-error.png`, fullPage: true });
}

const video = page.video();
await page.close();
await context.close();
await browser.close();

if (video) {
  const src = await video.path();
  const webm = `${OUT}/foodie-demo-completo.webm`;
  await rename(src, webm);
  console.log(`\nVideo WebM: ${webm}`);
}
