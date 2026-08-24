import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { root } from "./data-lib.mjs";

const manifest = JSON.parse(readFileSync(resolve(root, "dist/.vite/manifest.json"), "utf8"));
const assets = new Set();
for (const item of Object.values(manifest)) {
  if (item.file) assets.add(`/${item.file}`);
  for (const key of ["css", "assets"]) for (const file of item[key] ?? []) assets.add(`/${file}`);
}
const workerPath = resolve(root, "dist/sw.js");
const worker = readFileSync(workerPath, "utf8");
const placeholder = "self.__ATLAS_PRECACHE__ || []";
if (!worker.includes(placeholder)) throw new Error("Service-worker precache placeholder missing.");
writeFileSync(workerPath, worker.replace(placeholder, JSON.stringify([...assets].sort())), "utf8");
console.log(`Injected ${assets.size} production assets into the offline cache manifest.`);
