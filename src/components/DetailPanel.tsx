import { ExternalLink, LocateFixed } from "lucide-react";
import type { CloudRegion } from "../data/regions";
import { PROVIDERS } from "../data/regions";
import { Panel } from "./Panel";
import { ProviderMark } from "./ProviderMark";

function DetailRow({ label, children, mono = false }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd className={mono ? "mono" : ""}>{children}</dd>
    </div>
  );
}

export function DetailPanel({ region }: { region: CloudRegion | null }) {
  if (!region) {
    return (
      <Panel title="Standortdetails" className="detail-panel">
        <div className="empty-state">
          <LocateFixed aria-hidden="true" />
          <strong>Kein Standort sichtbar</strong>
          <span>Ändere die Filter, um wieder Cloud-Regionen anzuzeigen.</span>
        </div>
      </Panel>
    );
  }

  const provider = PROVIDERS[region.provider];
  const availability = region.zones
    ? `${region.zones} Zonen`
    : region.availabilityZones
      ? "Unterstützt"
      : "Nicht ausgewiesen";

  return (
    <Panel title="Standortdetails" className="detail-panel">
      <div className="selected-region">
        <ProviderMark provider={region.provider} />
        <div>
          <strong>{region.name}</strong>
          <span>{region.location}</span>
        </div>
      </div>

      <div className="status-line">
        <span className={`status-dot status-dot--${region.status}`} />
        {region.status === "planned" ? "Geplant" : "Aktiv"}
        {region.restricted ? <span className="restricted-note">Eingeschränkter Zugriff</span> : null}
      </div>

      <dl className="detail-list">
        <DetailRow label="Anbieter">{provider.name}</DetailRow>
        {region.scope === "sovereign" ? <DetailRow label="Cloud-Umgebung">Sovereign Cloud</DetailRow> : null}
        <DetailRow label="Standort">{region.location}</DetailRow>
        <DetailRow label="Land">{region.country}</DetailRow>
        <DetailRow label="Regionscode" mono>{region.code ?? "Noch nicht veröffentlicht"}</DetailRow>
        <DetailRow label="Verfügbarkeitszonen">{availability}</DetailRow>
        {region.pairedRegion ? <DetailRow label="Gepaarte Region">{region.pairedRegion}</DetailRow> : null}
        <DetailRow label="Breitengrad" mono>{region.lat.toFixed(4)}°</DetailRow>
        <DetailRow label="Längengrad" mono>{region.lng.toFixed(4)}°</DetailRow>
      </dl>

      <a className="source-link" href={region.source} target="_blank" rel="noreferrer">
        <span>
          <small>Offizielle Quelle</small>
          Anbieter-Dokumentation
        </span>
        <ExternalLink aria-hidden="true" />
      </a>

      <p className="source-note">
        Regionen sind veröffentlichte Metropolstandorte. Die Anbieter nennen aus Sicherheitsgründen meist keine Gebäudeadressen.
      </p>
    </Panel>
  );
}
