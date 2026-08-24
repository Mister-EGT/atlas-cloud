import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve } from "node:path";
import { root } from "./data-lib.mjs";

const manifest = JSON.parse(readFileSync(resolve(root, "dist/.vite/manifest.json"), "utf8"));
const gzipBytes = (file) => gzipSync(readFileSync(resolve(root, "dist", file))).byteLength;
const entry = Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error("Vite entry chunk not found.");
const eagerFiles = new Set();
function visit(item) {
  if (!item || eagerFiles.has(item.file)) return;
  eagerFiles.add(item.file);
  for (const key of item.imports ?? []) visit(manifest[key]);
}
visit(entry);
const eagerGzip = [...eagerFiles].filter((file) => file.endsWith(".js")).reduce((sum, file) => sum + gzipBytes(file), 0);
const webGlEntry = Object.entries(manifest).find(([key]) => key.endsWith("components/WebGLGlobe.tsx"))?.[1];
const webGlGzip = webGlEntry ? gzipBytes(webGlEntry.file) : 0;
const limits = { eager: 125_000, webgl: 531_000 };
console.log(`Eager JavaScript: ${(eagerGzip / 1024).toFixed(1)} KB gzip; WebGL entry: ${(webGlGzip / 1024).toFixed(1)} KB gzip.`);
if (eagerGzip > limits.eager) throw new Error(`Eager JavaScript exceeds 125 KB gzip (${eagerGzip} bytes).`);
if (webGlGzip > limits.webgl) throw new Error(`WebGL chunk exceeds 531 KB gzip (${webGlGzip} bytes).`);
const assets = resolve(root, "dist/assets");
if (!statSync(assets).isDirectory() || !readdirSync(assets).some((file) => file.endsWith(".js"))) throw new Error("Production JavaScript assets missing.");
