import { validateSnapshots } from "./data-lib.mjs";

const result = validateSnapshots();
if (result.errors.length) {
  console.error(result.errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${result.locationCount} locations: ${Object.entries(result.counts).map(([provider, count]) => `${provider} ${count}`).join(", ")}.`);
}
