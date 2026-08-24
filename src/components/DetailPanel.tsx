import { ExternalLink, LocateFixed } from "lucide-react";
import { PROVIDERS, type CloudRegion, type ProviderId } from "../data/regions";
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

function SingleRegionDetails({ region }: { region: CloudRegion }) {
  const provider = PROVIDERS[region.provider];
  const availability = region.zones
    ? `${region.zones} Zonen`
    : region.availabilityZones
      ? "Unterstützt"
      : "Nicht ausgewiesen";

  return (
    <>
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
    </>
  );
}

function GroupedRegionDetails({ regions }: { regions: CloudRegion[] }) {
  const providerIds = (["azure", "aws", "gcp"] as ProviderId[]).filter((provider) =>
    regions.some((region) => region.provider === provider),
  );
  const locations = [...new Set(regions.map((region) => region.location))];
  const countries = [...new Set(regions.map((region) => region.country))];
  const location = locations.length === 1 ? locations[0] : countries.join(", ");
  const activeCount = regions.filter((region) => region.status === "active").length;
  const plannedCount = regions.length - activeCount;

  return (
    <>
      <div className="selected-region selected-region--group">
        <div className="provider-stack" aria-label={providerIds.map((provider) => PROVIDERS[provider].name).join(", ")}>
          {providerIds.map((provider) => <ProviderMark key={provider} provider={provider} compact />)}
        </div>
        <div>
          <strong>{location}</strong>
          <span>{regions.length} Regionen von {providerIds.length} {providerIds.length === 1 ? "Anbieter" : "Anbietern"}</span>
        </div>
      </div>

      <div className="status-line status-line--summary">
        {activeCount > 0 ? <span><i className="status-dot status-dot--active" />{activeCount} aktiv</span> : null}
        {plannedCount > 0 ? <span><i className="status-dot status-dot--planned" />{plannedCount} geplant</span> : null}
      </div>

      <div className="grouped-region-list" aria-label="Anbieter und Regionen an diesem Standort">
        <h3>Anbieter und Regionen</h3>
        {regions.map((region) => (
          <article className={`grouped-region-card is-${region.status}`} key={region.id}>
            <ProviderMark provider={region.provider} compact />
            <div>
              <small>{PROVIDERS[region.provider].shortName}</small>
              <strong>{region.name}</strong>
              <code>{region.code ?? "Code noch nicht veröffentlicht"}</code>
            </div>
            <span className="region-status">{region.status === "planned" ? "Geplant" : "Aktiv"}</span>
            <a href={region.source} target="_blank" rel="noreferrer" aria-label={`Offizielle Quelle für ${region.name}`}>
              <ExternalLink aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>

      <dl className="detail-list detail-list--group">
        <DetailRow label="Standort">{location}</DetailRow>
        <DetailRow label="Land">{countries.join(", ")}</DetailRow>
      </dl>
    </>
  );
}

export function DetailPanel({ regions }: { regions: CloudRegion[] }) {
  if (regions.length === 0) {
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

  return (
    <Panel title="Standortdetails" className="detail-panel">
      {regions.length === 1 ? <SingleRegionDetails region={regions[0]} /> : <GroupedRegionDetails regions={regions} />}

      <p className="source-note">
        Regionen sind veröffentlichte Metropolstandorte. Die Anbieter nennen aus Sicherheitsgründen meist keine Gebäudeadressen.
      </p>
    </Panel>
  );
}
