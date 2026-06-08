import { chromium } from "playwright";
import { mkdir, rename } from "fs/promises";

const BASE = process.env.APP_URL || "http://localhost:4173";
const OUT = "/opt/cursor/artifacts";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
});

const page = await context.newPage();
const checks = [];

async function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await check("App carga", true, BASE);

  await page.click('button[aria-label="Abrir asistente"]');
  await page.waitForSelector(".chat-panel");
  const homePath = new URL(page.url()).pathname;

  // Chat normal: hola
  await page.fill(".chat-input-row input", "hola");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(2500);

  const afterHolaPath = new URL(page.url()).pathname;
  const chatOpen1 = await page.isVisible(".chat-panel");
  const holaReply = await page.locator(".chat-msg.assistant").last().textContent();
  await check("Chat abierto tras 'hola'", chatOpen1);
  await check("Sin redirección tras 'hola'", afterHolaPath === homePath, afterHolaPath);
  await check("Respuesta útil (no Internal Server Error)", !/internal server error/i.test(holaReply || ""), holaReply?.slice(0, 60));

  // Segunda pregunta
  await page.fill(".chat-input-row input", "¿Qué puedes hacer por mí?");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(2500);
  const after2Path = new URL(page.url()).pathname;
  await check("Sin redirección tras 2ª pregunta", after2Path === homePath, after2Path);
  await check("Chat sigue abierto", await page.isVisible(".chat-panel"));

  // Inventario casual — no demo
  await page.fill(".chat-input-row input", "¿cómo está el inventario?");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(2500);
  const afterInvPath = new URL(page.url()).pathname;
  await check("Pregunta inventario no redirige", afterInvPath === homePath, afterInvPath);
  await check("Demo no activado", !(await page.isVisible(".agent-live")));

  await page.screenshot({ path: `${OUT}/foodie-fixed-screenshot.png`, fullPage: true });

  // Demo jurado explícito
  await page.fill(
    ".chat-input-row input",
    "Haz una predicción simple para este mes de ventas y, de acuerdo a eso y según nuestro inventario, haz las órdenes de compra para este mes para mejorar el ROI."
  );
  await page.click(".chat-input-row .btn-primary");
  await page.waitForSelector(".agent-live", { timeout: 10000 });
  await check("Demo jurado inicia", true);
  await page.waitForURL("**/planificacion**", { timeout: 15000 });
  await check("Demo navega a planificación", page.url().includes("/planificacion"));
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/foodie-demo-flow.png`, fullPage: true });
} catch (e) {
  await check("Error inesperado", false, e.message);
  await page.screenshot({ path: `${OUT}/foodie-error.png`, fullPage: true });
}

const video = page.video();
await page.close();
await context.close();
await browser.close();

if (video) {
  const src = await video.path();
  await rename(src, `${OUT}/foodie-chat-correcto.webm`);
  console.log(`\nVideo: ${OUT}/foodie-chat-correcto.webm`);
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} pruebas OK`);
if (failed.length) process.exit(1);
