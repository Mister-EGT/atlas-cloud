import { validateSnapshots, readJson } from "./data-lib.mjs";

const result = validateSnapshots();
const metadata = readJson("metadata.json");
const ageDays = (Date.now() - Date.parse(metadata.verifiedAt)) / 86_400_000;
if (ageDays > 45) result.errors.push(`Daten sind ${Math.floor(ageDays)} Tage alt (Grenzwert: 45 Tage).`);
if (ageDays < -1) result.errors.push("Verifikationsdatum liegt in der Zukunft.");
if (result.errors.length) {
  console.error(result.errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Snapshot ist gültig und ${Math.max(0, Math.floor(ageDays))} Tage alt.`);
}
