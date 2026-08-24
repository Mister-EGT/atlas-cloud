import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatedDirectory, readJson, root, validateSnapshots } from "./data-lib.mjs";

const sources = {
  cloudflareStatus: "https://www.cloudflarestatus.com/api/v2/summary.json",
  azureReferencePrices: "https://prices.azure.com/api/retail/prices?$filter=serviceName%20eq%20%27Virtual%20Machines%27%20and%20armSkuName%20eq%20%27Standard_D2s_v5%27%20and%20priceType%20eq%20%27Consumption%27&$top=1000",
  awsRegionIndex: "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/region_index.json",
  gcpLocations: "https://cloud.google.com/compute/docs/regions-zones",
};
const staging = resolve(root, ".data-refresh-staging");
const rawDirectory = resolve(root, "src/data/raw");

async function download([name, url]) {
  const response = await fetch(url, { headers: { "user-agent": "atlas-cloud-data-pipeline/1.0" }, signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const body = await response.text();
  if (body.length < 100) throw new Error(`${name}: unerwartet kleine Antwort`);
  return [name, { sourceUrl: url, contentType: response.headers.get("content-type"), body }];
}

try {
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  const downloads = Object.fromEntries(await Promise.all(Object.entries(sources).map(download)));
  for (const [name, payload] of Object.entries(downloads)) {
    if (name !== "gcpLocations") JSON.parse(payload.body);
    writeFileSync(resolve(staging, `${name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  }

  const validation = validateSnapshots();
  if (validation.errors.length) throw new Error(`Snapshot-Validierung fehlgeschlagen:\n${validation.errors.join("\n")}`);
  const changed = !existsSync(rawDirectory) || Object.keys(downloads).some((name) => {
    const currentFile = resolve(rawDirectory, `${name}.json`);
    return !existsSync(currentFile) || readFileSync(currentFile, "utf8") !== readFileSync(resolve(staging, `${name}.json`), "utf8");
  });
  if (!changed) {
    rmSync(staging, { recursive: true, force: true });
    console.log("Official sources are unchanged; snapshots remain untouched.");
    process.exit(0);
  }
  const metadata = readJson("metadata.json");
  metadata.generatedAt = new Date().toISOString();
  writeFileSync(resolve(generatedDirectory, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  rmSync(rawDirectory, { recursive: true, force: true });
  renameSync(staging, rawDirectory);
  console.log(`Downloaded and validated ${Object.keys(downloads).length} official public sources.`);
} catch (error) {
  rmSync(staging, { recursive: true, force: true });
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
