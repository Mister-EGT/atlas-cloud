import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CLOUD_REGIONS } from "../data/regions";
import { DetailPanel } from "./DetailPanel";
import { groupRegions } from "./globeMarkers";

describe("grouped location details", () => {
  it("makes the full details of every provider location available", () => {
    const santiago = groupRegions(CLOUD_REGIONS, true).find((marker) =>
      marker.regions.some((region) => region.code === "southamerica-west1"),
    );

    expect(santiago?.regions).toHaveLength(4);

    const html = renderToStaticMarkup(<DetailPanel regions={santiago!.regions} />);

    expect(html.match(/<details/g)).toHaveLength(4);
    expect(html.match(/Standortart/g)).toHaveLength(4);
    expect(html.match(/Pin-Genauigkeit/g)).toHaveLength(4);
    expect(html).toContain("Details zu Chile Central von Microsoft Azure anzeigen");
    expect(html).toContain("Details zu Chile von Amazon Web Services anzeigen");
    expect(html).toContain("Details zu Santiago von Google Cloud anzeigen");
    expect(html).toContain("Details zu Santiago Edge von Cloudflare anzeigen");
    expect(html).toContain("Vollständiger Cloudflare-Service-Stack");
    expect(html).toContain("Code noch nicht veröffentlicht");
  });
});
