import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App, keepVisibleSelection } from "./App";
import { CLOUD_REGIONS } from "./data/regions";

describe("initial app state", () => {
  it("starts without a selected location", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Kein Standort ausgewählt");
    expect(html).toContain("Wähle einen Marker auf der Karte oder suche nach einem Standort.");
    expect(html).not.toContain("Germany West Central");
    expect(html).not.toContain("germanywestcentral");
  });

  it("clears a filtered-out selection instead of selecting an unrelated location", () => {
    const santiago = CLOUD_REGIONS.find((region) => region.code === "southamerica-west1")!;
    const withoutGoogleCloud = CLOUD_REGIONS.filter((region) => region.provider !== "gcp");

    expect(keepVisibleSelection([santiago], withoutGoogleCloud)).toEqual([]);
  });

  it("keeps the visible members of a grouped selection", () => {
    const santiago = CLOUD_REGIONS.filter((region) =>
      ["chilecentral", "southamerica-west1", "SCL"].includes(region.code ?? ""),
    );
    const withoutGoogleCloud = CLOUD_REGIONS.filter((region) => region.provider !== "gcp");

    expect(keepVisibleSelection(santiago, withoutGoogleCloud).map((region) => region.code)).toEqual([
      "chilecentral",
      "SCL",
    ]);
  });
});
