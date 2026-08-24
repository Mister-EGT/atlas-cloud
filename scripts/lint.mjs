import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { root } from "./data-lib.mjs";

const files = ["src/App.tsx", "src/data/workbench.ts", "src/components/SettingsPanel.tsx"];
const errors = [];
for (const file of files) {
  const text = readFileSync(resolve(root, file), "utf8");
  if (/\bany\b/.test(text)) errors.push(`${file}: explizites any gefunden.`);
  if (/console\.(log|debug)\(/.test(text)) errors.push(`${file}: Debug-Ausgabe gefunden.`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else console.log("Static lint checks passed.");
