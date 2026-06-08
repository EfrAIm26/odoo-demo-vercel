import { chromium } from "playwright";
import { mkdir, rename } from "fs/promises";

const BASE = process.env.APP_URL || "https://odoo-demo-olive.vercel.app";
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
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await check("1. App carga", true, BASE);

  await page.click('button[aria-label="Abrir asistente"]');
  await page.waitForSelector(".chat-panel", { timeout: 10000 });
  const homePath = new URL(page.url()).pathname;

  await page.fill(".chat-input-row input", "hola");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(4000);

  const path1 = new URL(page.url()).pathname;
  const reply1 = await page.locator(".chat-msg.assistant").last().textContent();
  await check("2. Chat abierto tras hola", await page.isVisible(".chat-panel"));
  await check("3. Sin redirección tras hola", path1 === homePath, path1);
  await check("4. Respuesta real (no error)", !/internal server error/i.test(reply1 || ""), reply1?.slice(0, 50));

  await page.fill(".chat-input-row input", "¿Qué puedes hacer por mí?");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(4000);
  const path2 = new URL(page.url()).pathname;
  await check("5. Segunda pregunta sin redirección", path2 === homePath);
  await check("6. Chat sigue abierto", await page.isVisible(".chat-panel"));

  await page.fill(".chat-input-row input", "¿cómo está el inventario?");
  await page.click(".chat-input-row .btn-primary");
  await page.waitForTimeout(4000);
  const path3 = new URL(page.url()).pathname;
  await check("7. Inventario no redirige", path3 === homePath);
  await check("8. Demo no activado", !(await page.isVisible(".agent-live")));

  await page.screenshot({ path: `${OUT}/prod-chat-normal.png`, fullPage: true });

  const jury =
    "Haz una predicción simple para este mes de ventas y, de acuerdo a eso y según nuestro inventario, haz las órdenes de compra para este mes para mejorar el ROI.";
  await page.fill(".chat-input-row input", jury);
  await page.click(".chat-input-row .btn-primary");
  await page.waitForSelector(".agent-live", { timeout: 15000 });
  await check("9. Demo jurado inicia", true);
  await page.waitForURL("**/planificacion**", { timeout: 20000 });
  await check("10. Demo en planificación", page.url().includes("/planificacion"));
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${OUT}/prod-demo-flow.png`, fullPage: true });
} catch (e) {
  await check("Error", false, e.message);
  await page.screenshot({ path: `${OUT}/prod-error.png`, fullPage: true });
}

const video = page.video();
await page.close();
await context.close();
await browser.close();

if (video) {
  const src = await video.path();
  await rename(src, `${OUT}/foodie-demo-produccion.webm`);
  console.log(`Video: ${OUT}/foodie-demo-produccion.webm`);
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} OK`);
process.exit(failed.length ? 1 : 0);
