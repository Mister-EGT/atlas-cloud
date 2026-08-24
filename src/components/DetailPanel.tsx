import { ChevronDown, ExternalLink, LocateFixed } from "lucide-react";
import { PROVIDERS, type CloudRegion, type ProviderId } from "../data/regions";
import { Panel } from "./Panel";
import { ProviderMark } from "./ProviderMark";

const NETWORK_REGION_LABELS: Record<string, string> = {
  Africa: "Afrika",
  Asia: "Asien",
  Europe: "Europa",
  "Latin America & the Caribbean": "Lateinamerika und Karibik",
  "Middle East": "Naher Osten",
  "North America": "Nordamerika",
  Oceania: "Ozeanien",
};

function DetailRow({ label, children, mono = false }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd className={mono ? "mono" : ""}>{children}</dd>
    </div>
  );
}

function getAvailability(region: CloudRegion) {
  if (region.locationType === "edge-location") return "Nicht anwendbar";
  if (region.zones) return `${region.zones} Zonen`;
  if (region.availabilityZones) return "Unterstützt";
  return "Nicht ausgewiesen";
}

function RegionDetailList({ region, includeStatus = false }: { region: CloudRegion; includeStatus?: boolean }) {
  const provider = PROVIDERS[region.provider];

  return (
    <dl className="detail-list">
      <DetailRow label="Anbieter">{provider.name}</DetailRow>
      {includeStatus ? (
        <DetailRow label="Status">
          {region.status === "planned" ? "Geplant" : "Aktiv"}
          {region.restricted ? " · Eingeschränkter Zugriff" : ""}
        </DetailRow>
      ) : null}
      <DetailRow label="Standortart">{region.locationType === "edge-location" ? "Edge-Rechenzentrum" : "Cloud-Region"}</DetailRow>
      <DetailRow label="Cloud-Umgebung">
        {region.scope === "sovereign" ? "Sovereign Cloud" : region.provider === "cloudflare" ? "Globales Anycast-Netzwerk" : "Public Cloud"}
      </DetailRow>
      {region.networkRegion ? <DetailRow label="Netzwerkregion">{NETWORK_REGION_LABELS[region.networkRegion] ?? region.networkRegion}</DetailRow> : null}
      <DetailRow label="Standort">{region.location}</DetailRow>
      <DetailRow label="Land">{region.country}</DetailRow>
      <DetailRow label="Standortcode" mono>{region.code ?? "Noch nicht veröffentlicht"}</DetailRow>
      <DetailRow label="Verfügbarkeitszonen">{getAvailability(region)}</DetailRow>
      <DetailRow label="Zugriff">{region.restricted ? "Eingeschränkt" : "Allgemein verfügbar"}</DetailRow>
      {region.pairedRegion ? <DetailRow label="Gepaarte Region">{region.pairedRegion}</DetailRow> : null}
      {region.provider === "cloudflare" ? <DetailRow label="Leistungsumfang">Vollständiger Cloudflare-Service-Stack</DetailRow> : null}
      {region.trackedSince ? (
        <DetailRow label="Statussystem seit">
          {new Date(`${region.trackedSince}T00:00:00Z`).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" })}
        </DetailRow>
      ) : null}
      <DetailRow label="Breitengrad" mono>{region.lat.toFixed(4)}°</DetailRow>
      <DetailRow label="Längengrad" mono>{region.lng.toFixed(4)}°</DetailRow>
      <DetailRow label="Pin-Genauigkeit">Stadt- oder Flughafenmittelpunkt</DetailRow>
    </dl>
  );
}

function RegionSourceLink({ region }: { region: CloudRegion }) {
  return (
    <a className="source-link" href={region.source} target="_blank" rel="noreferrer">
      <span>
        <small>Offizielle Quelle</small>
        Anbieter-Dokumentation
      </span>
      <ExternalLink aria-hidden="true" />
    </a>
  );
}

function SingleRegionDetails({ region }: { region: CloudRegion }) {
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

      <RegionDetailList region={region} />
      <RegionSourceLink region={region} />
    </>
  );
}

function GroupedRegionDetails({ regions }: { regions: CloudRegion[] }) {
  const providerIds = (["azure", "aws", "gcp", "cloudflare"] as ProviderId[]).filter((provider) =>
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
          <span>{regions.length} Standorte von {providerIds.length} {providerIds.length === 1 ? "Anbieter" : "Anbietern"}</span>
        </div>
      </div>

      <div className="status-line status-line--summary">
        {activeCount > 0 ? <span><i className="status-dot status-dot--active" />{activeCount} aktiv</span> : null}
        {plannedCount > 0 ? <span><i className="status-dot status-dot--planned" />{plannedCount} geplant</span> : null}
      </div>

      <div className="grouped-region-list" aria-label="Anbieter und Standorte an diesem Standort">
        <h3>Anbieter und Standorte</h3>
        {regions.map((region) => (
          <details className={`grouped-region-card is-${region.status}`} key={region.id}>
            <summary aria-label={`Details zu ${region.name} von ${PROVIDERS[region.provider].name} anzeigen`}>
              <ProviderMark provider={region.provider} compact />
              <div className="grouped-region-card__identity">
                <small>{PROVIDERS[region.provider].shortName}</small>
                <strong>{region.name}</strong>
                <code>{region.code ?? "Code noch nicht veröffentlicht"}</code>
              </div>
              <span className="region-status">{region.status === "planned" ? "Geplant" : "Aktiv"}</span>
              <ChevronDown className="grouped-region-card__chevron" aria-hidden="true" />
            </summary>
            <div className="grouped-region-card__details">
              <RegionDetailList region={region} includeStatus />
              <RegionSourceLink region={region} />
            </div>
          </details>
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
          <strong>Kein Standort ausgewählt</strong>
          <span>Wähle einen Marker auf der Karte oder suche nach einem Standort.</span>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Standortdetails" className="detail-panel">
      {regions.length === 1 ? <SingleRegionDetails region={regions[0]} /> : <GroupedRegionDetails regions={regions} />}

      <p className="source-note">
        Gezeigt werden veröffentlichte Cloud-Regionen und Cloudflare-Edge-Standorte. Pins markieren Stadt- oder Flughafenmittelpunkte, keine Gebäudeadressen.
      </p>
    </Panel>
  );
}
