import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const generatedDirectory = resolve(root, "src/data/generated");

export function readJson(name) {
  return JSON.parse(readFileSync(resolve(generatedDirectory, name), "utf8"));
}

export function validateSnapshots() {
  const locations = readJson("locations.json");
  const pricing = readJson("pricing.json");
  const services = readJson("services.json");
  const metadata = readJson("metadata.json");
  const errors = [];
  const ids = new Set();
  const allowedProviders = new Set(["aws", "azure", "gcp", "cloudflare"]);
  const allowedKinds = new Set(["cloud-region", "edge-location"]);
  const allowedLifecycle = new Set(["planned", "active", "retired"]);

  if (!Array.isArray(locations) || locations.length < 450) errors.push("Standort-Snapshot enthält unerwartet wenige Einträge.");
  for (const [index, location] of locations.entries()) {
    const label = location?.id || `Index ${index}`;
    if (!location?.id || ids.has(location.id)) errors.push(`${label}: ID fehlt oder ist doppelt.`);
    ids.add(location?.id);
    if (!allowedProviders.has(location?.provider)) errors.push(`${label}: unbekannter Provider.`);
    if (!allowedKinds.has(location?.locationType)) errors.push(`${label}: unbekannter Standorttyp.`);
    if (!allowedLifecycle.has(location?.lifecycleStatus)) errors.push(`${label}: ungültiger Lifecycle.`);
    if (!Number.isFinite(location?.lat) || location.lat < -90 || location.lat > 90) errors.push(`${label}: ungültiger Breitengrad.`);
    if (!Number.isFinite(location?.lng) || location.lng < -180 || location.lng > 180) errors.push(`${label}: ungültiger Längengrad.`);
    if (!Array.isArray(location?.services)) errors.push(`${label}: Services fehlen.`);
    const sourceUrl = location?.provenance?.sourceUrl;
    if (typeof sourceUrl !== "string" || !sourceUrl.startsWith("https://")) errors.push(`${label}: offizielle HTTPS-Quelle fehlt.`);
    for (const dateKey of ["retrievedAt", "verifiedAt"]) {
      if (Number.isNaN(Date.parse(location?.provenance?.[dateKey]))) errors.push(`${label}: ${dateKey} ist ungültig.`);
    }
  }

  const counts = Object.fromEntries([...allowedProviders].map((provider) => [provider, locations.filter((item) => item.provider === provider).length]));
  const minimums = { azure: 60, aws: 35, gcp: 40, cloudflare: 300 };
  for (const [provider, minimum] of Object.entries(minimums)) if ((counts[provider] ?? 0) < minimum) errors.push(`${provider}: unerwarteter Mengenrückgang (${counts[provider] ?? 0} < ${minimum}).`);
  if (metadata.locationCount !== locations.length) errors.push("metadata.locationCount stimmt nicht mit locations.json überein.");
  if (!Array.isArray(services) || services.some((service) => !service.id || !service.label)) errors.push("services.json ist ungültig.");
  const workload = pricing?.workload;
  if (workload?.id !== "linux-general-2x8" || workload?.currency !== "USD") errors.push("Preisbaseline ist nicht die dokumentierte Linux-2x8-USD-Referenz.");
  if (workload?.providerSkus?.aws !== "m7i.large" || workload?.providerSkus?.azure !== "Standard_D2s_v5" || workload?.providerSkus?.gcp !== "n2-standard-2") errors.push("Preisbaseline enthält falsche Provider-SKUs.");
  if (pricing.prices.some((price) => !ids.has(price.regionId) || !Number.isFinite(price.hourlyUsd) || price.hourlyUsd < 0 || !price.sourceUrl?.startsWith("https://"))) errors.push("Mindestens ein Referenzpreis ist unvollständig oder nicht belegt.");

  return { errors, counts, locationCount: locations.length };
}
