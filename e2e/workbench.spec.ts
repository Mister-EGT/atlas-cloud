import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("search, filters, shortlist and deep-link restore", async ({ page }) => {
  await page.goto("/?mode=2d");
  await expect(page.getByText("Atlas Cloud", { exact: true })).toBeVisible();
  const search = page.getByRole("combobox", { name: "Standort suchen" });
  await search.fill("aws frankfurt");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.getByRole("option", { name: /Europe \(Frankfurt\)/ })).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(page).toHaveURL(/selected=aws-eu-central-1/);

  await page.getByRole("button", { name: "Tabelle" }).click();
  await expect(page.getByRole("heading", { name: "Standorttabelle" })).toBeVisible();
  const csvDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  expect((await csvDownload).suggestedFilename()).toBe("atlas-cloud-standorte.csv");
  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  expect((await jsonDownload).suggestedFilename()).toBe("atlas-cloud-standorte.json");
  const compareButtons = page.getByRole("button", { name: /zum Vergleich hinzufügen/ });
  for (let index = 0; index < 4; index += 1) await compareButtons.nth(0).click();
  await page.locator("header nav").getByRole("button", { name: /^Vergleich/ }).click();
  await expect(page.getByRole("heading", { name: "Regionsvergleich" })).toBeVisible();
  await expect(page).toHaveURL(/compare=/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Regionsvergleich" })).toBeVisible();
});

test("assistant, empty state and reset remain keyboard accessible", async ({ page }) => {
  await page.goto("/?view=assistant&mode=2d");
  await expect(page.getByRole("heading", { name: "Entscheidungsassistent" })).toBeVisible();
  const proximity = page.getByRole("slider").nth(1);
  await proximity.fill("40");
  await page.getByRole("button", { name: "Sovereign Cloud" }).click();
  await expect(page.getByText(/Datenabdeckung/).first()).toBeVisible();
  await page.getByRole("button", { name: "Filter zurücksetzen" }).last().click();
  await expect(page.getByText("Aktuelle Auswahl")).toBeVisible();
});

test("main views have no serious accessibility violations or horizontal overflow", async ({ page }) => {
  for (const view of ["map", "table", "compare", "assistant"]) {
    await page.goto(`/?view=${view}&mode=2d`);
    await page.locator("main").waitFor();
    const report = await new AxeBuilder({ page }).analyze();
    expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), JSON.stringify(report.violations, null, 2)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("installed app shell reloads offline", async ({ page, context }) => {
  await page.goto("/?mode=2d");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("Atlas Cloud", { exact: true })).toBeVisible();
});
