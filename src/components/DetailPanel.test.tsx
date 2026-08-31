import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CLOUD_REGIONS } from "../data/regions";
import { DetailPanel } from "./DetailPanel";
import { groupRegions } from "./globeMarkers";
import { ProviderMark } from "./ProviderMark";

describe("grouped location details", () => {
  it("makes the full details of every provider location available", () => {
    const santiago = groupRegions(CLOUD_REGIONS, true).find((marker) =>
      marker.regions.some((region) => region.code === "southamerica-west1"),
    );

    expect(santiago?.regions).toHaveLength(5);

    const html = renderToStaticMarkup(<DetailPanel regions={santiago!.regions} />);

    expect(html.match(/<details/g)).toHaveLength(5);
    expect(html.match(/Standortart/g)).toHaveLength(5);
    expect(html.match(/Pin-Genauigkeit/g)).toHaveLength(5);
    expect(html).toContain("Details zu Chile Central von Microsoft Azure anzeigen");
    expect(html).toContain("Details zu Chile von Amazon Web Services anzeigen");
    expect(html).toContain("Details zu Santiago von Google Cloud anzeigen");
    expect(html).toContain("Details zu Santiago Edge von Cloudflare anzeigen");
    expect(html).toContain("Details zu Chile Central von Oracle Cloud Infrastructure anzeigen");
    expect(html).toContain("CDN, DNS, DDoS-Schutz und Edge-Dienste");
    expect(html).toContain("Code noch nicht veröffentlicht");
  });

  it("shows the published Proton infrastructure details and disclosure precision", () => {
    const norway = CLOUD_REGIONS.find((region) => region.id === "proton-rechenzentrum-norwegen")!;
    const html = renderToStaticMarkup(<DetailPanel regions={[norway]} />);

    expect(html).toContain("Privates Rechenzentrum");
    expect(html).toContain("Eigene Server, eigenes Netzwerk und eigener ISP-Betrieb");
    expect(html).toContain("Geografisch verteilte und standortübergreifend redundante Infrastruktur");
    expect(html).toContain("Landesmittelpunkt, genauer Ort nicht veröffentlicht");
    expect(html).toContain("Proton bestätigt ein Rechenzentrum in Norwegen");
  });

  it("uses the official Proton P logo instead of a text monogram", () => {
    const html = renderToStaticMarkup(<ProviderMark provider="proton" />);

    expect(html).toContain("data:image/svg+xml");
    expect(html).toContain("%23A995FF");
    expect(html).toContain("%236652F5");
    expect(html).toContain('alt="Proton"');
    expect(html).not.toContain("provider-mark__monogram");
  });
});
