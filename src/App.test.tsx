import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("initial app state", () => {
  it("starts without a selected location", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Kein Standort ausgewählt");
    expect(html).toContain("Wähle einen Marker auf der Karte oder suche nach einem Standort.");
    expect(html).not.toContain("Germany West Central");
    expect(html).not.toContain("germanywestcentral");
  });
});
