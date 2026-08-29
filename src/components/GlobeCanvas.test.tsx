import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GlobeCanvas } from "./GlobeCanvas";

describe("globe empty state", () => {
  it("explains when the active filters hide every location", () => {
    const html = renderToStaticMarkup(
      <GlobeCanvas
        regions={[]}
        selectedRegions={[]}
        clusterMarkers
        autoRotate={false}
        atmosphere
        onSelect={() => undefined}
      />,
    );

    expect(html).toContain("Keine Standorte sichtbar");
    expect(html).toContain("Passe Status, Kontinent oder Anbieterfilter an.");
  });
});
