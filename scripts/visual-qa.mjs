import { chromium } from "playwright";
import { createServer } from "vite";

// The managed QA container rejects ownership changes while unpacking the
// bundled browser. Present a non-root uid so tar-fs skips that unnecessary step.
Object.defineProperty(process, "getuid", { value: () => 1000 });
const { default: chromiumBundle } = await import("@sparticuz/chromium");

const vite = await createServer({
  server: { host: "127.0.0.1", port: 4173 },
  logLevel: "silent",
});
await vite.listen();

const executablePath = await chromiumBundle.executablePath();
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: chromiumBundle.args,
  env: {
    ...process.env,
    XDG_CACHE_HOME: "/tmp/atlas-chrome-cache",
  },
});

const errors = [];

async function openPage(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  if (await page.locator("canvas").count() === 0) {
    const bodyText = await page.locator("body").innerText();
    throw new Error(`Canvas fehlt. Seite: ${bodyText}\n${errors.join("\n")}`);
  }
  await page.waitForSelector("canvas", { state: "visible", timeout: 10000 });
  await page.waitForTimeout(2200);
  return { context, page };
}

const desktop = await openPage({ width: 1440, height: 960 });
await desktop.page.screenshot({ path: "/tmp/atlas-cloud-desktop.png" });

const canvasSize = await desktop.page.locator("canvas").evaluate((element) => ({
  width: element.clientWidth,
  height: element.clientHeight,
}));

await desktop.page.getByPlaceholder("Standort suchen").fill("Frankfurt");
await desktop.page.getByRole("option").filter({ hasText: "Europe (Frankfurt)" }).click();
await desktop.page.getByText("eu-central-1", { exact: true }).waitFor({ state: "visible" });
await desktop.page.getByRole("switch", { name: "Globus automatisch drehen" }).click();
await desktop.page.waitForTimeout(900);
const globeBounds = await desktop.page.locator("canvas").boundingBox();
if (!globeBounds) throw new Error("Der Globus hat keine sichtbare Zeichenfläche.");
const targetMarker = desktop.page.locator('[data-region-codes~="eu-central-1"]').first();
await targetMarker.waitFor({ state: "visible" });
await targetMarker.hover({ force: true });
await desktop.page.waitForTimeout(240);
const hoverTooltipState = await targetMarker.evaluate((element) => {
  const tooltip = element.querySelector(".globe-html-marker__tooltip");
  if (!tooltip) return { className: element.className, missing: true };
  const style = getComputedStyle(tooltip);
  return {
    className: element.className,
    visibility: style.visibility,
    opacity: style.opacity,
    inlineStyle: tooltip.getAttribute("style"),
    connected: element.isConnected,
  };
});
const hoverTooltipVisible = hoverTooltipState.visibility !== "hidden" && Number(hoverTooltipState.opacity) > 0;
await targetMarker.evaluate((element) => element.click());
const markerClickSelected = await desktop.page.getByText("germanywestcentral", { exact: true }).isVisible();
await desktop.page.getByRole("switch", { name: "Azure anzeigen" }).click();
await desktop.page.getByRole("button", { name: "Geplant", exact: true }).click();
const plannedVisible = await desktop.page.locator(".summary-total b").innerText();
await desktop.page.getByRole("button", { name: "Alle", exact: true }).click();
await desktop.page.getByRole("button", { name: "Vergrößern" }).click();
await desktop.page.getByRole("button", { name: "Ansicht zurücksetzen" }).click();

const desktopOverflow = await desktop.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

const mobile = await openPage({ width: 390, height: 844 });
const mobileOverflow = await mobile.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
await mobile.page.screenshot({ path: "/tmp/atlas-cloud-mobile.png" });

await browser.close();
await vite.close();

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log(JSON.stringify({
  canvasSize,
  plannedVisible,
  hoverTooltipVisible,
  hoverTooltipState,
  markerClickSelected,
  desktopOverflow,
  mobileOverflow,
  screenshots: ["/tmp/atlas-cloud-desktop.png", "/tmp/atlas-cloud-mobile.png"],
}, null, 2));
