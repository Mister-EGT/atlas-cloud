import { ExternalLink, MapPin, Scale, X } from "lucide-react";
import { PRICE_WORKLOAD, PROVIDERS, SERVICES, type CloudRegion } from "../data/regions";
import { distanceInKilometres } from "../data/workbench";
import { ProviderMark } from "./ProviderMark";

export function ComparisonView({ regions, origin, onRemove, onOpenTable }: {
  regions: CloudRegion[];
  origin: CloudRegion | null;
  onRemove: (region: CloudRegion) => void;
  onOpenTable: () => void;
}) {
  if (!regions.length) return <section className="workbench-card workbench-empty workbench-empty--large"><Scale /><strong>Noch keine Shortlist</strong><span>Füge in Karte oder Tabelle bis zu vier Standorte hinzu.</span><button type="button" className="primary-button" onClick={onOpenTable}>Standorte auswählen</button></section>;
  const rows: Array<{ label: string; render: (region: CloudRegion) => React.ReactNode }> = [
    { label: "Art", render: (region) => region.locationType === "edge-location" ? "Edge-Standort" : "Cloud-Region" },
    { label: "Lifecycle", render: (region) => region.lifecycleStatus === "planned" ? "Geplant" : region.lifecycleStatus === "retired" ? "Stillgelegt" : "Aktiv" },
    { label: "Zonen", render: (region) => region.zones ?? (region.availabilityZones ? "3+" : "Nicht ausgewiesen") },
    { label: "Cloud-Umgebung", render: (region) => region.scope === "sovereign" ? "Sovereign Cloud" : "Public Cloud" },
    { label: "Zugriff", render: (region) => region.restricted ? "Eingeschränkt" : "Allgemein" },
    { label: "Dienste", render: (region) => region.services.map((service) => SERVICES[service].shortLabel).join(", ") || "Nicht ausgewiesen" },
    { label: "Preisbaseline", render: (region) => region.referencePrice ? `$${region.referencePrice.hourlyUsd.toFixed(4)}/h · ${region.referencePrice.sku}` : "Nicht verfügbar" },
    { label: "Proximity", render: (region) => origin ? `${Math.round(distanceInKilometres(region, origin)).toLocaleString("de-DE")} km Luftlinie` : "Keine Ursprungsregion" },
    { label: "Nachhaltigkeit", render: (region) => region.sustainability?.label ?? "Keine vergleichbare offizielle Metrik" },
    { label: "Verifiziert", render: (region) => new Date(region.provenance.verifiedAt).toLocaleDateString("de-DE") },
    { label: "Quelle", render: (region) => <a href={region.provenance.sourceUrl} target="_blank" rel="noreferrer">Offizielle Quelle <ExternalLink /></a> },
  ];
  return <section className="workbench-card comparison-card" aria-labelledby="compare-title"><div className="workbench-card__header"><div><span className="eyebrow">Shortlist · maximal vier</span><h2 id="compare-title">Regionsvergleich</h2><p>{PRICE_WORKLOAD.label}; ohne Rabatte, Steuern, Storage und Egress.</p></div></div><div className="comparison-scroll"><table><thead><tr><th>Kriterium</th>{regions.map((region) => <th key={region.id}><div className="comparison-heading"><ProviderMark provider={region.provider} compact /><span><small>{PROVIDERS[region.provider].shortName}</small><strong>{region.name}</strong><em><MapPin />{region.location}</em></span><button type="button" onClick={() => onRemove(region)} aria-label={`${region.name} aus Vergleich entfernen`}><X /></button></div></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th>{row.label}</th>{regions.map((region) => <td key={region.id}>{row.render(region)}</td>)}</tr>)}</tbody></table></div></section>;
}
