import { Check, ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CLOUD_REGIONS,
  CONTINENTS,
  PROVIDERS,
  type CloudRegion,
  type Continent,
  type ProviderId,
} from "../data/regions";
import { Panel } from "./Panel";
import { ProviderMark } from "./ProviderMark";

export type StatusFilter = "all" | "active" | "planned";

export interface ViewSettings {
  providers: Record<ProviderId, boolean>;
  status: StatusFilter;
  continent: "all" | Continent;
  clusterMarkers: boolean;
  autoRotate: boolean;
  atmosphere: boolean;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      className={`toggle ${checked ? "is-on" : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function SettingsPanel({
  settings,
  onChange,
  onSelect,
  visibleRegions,
}: {
  settings: ViewSettings;
  onChange: (settings: ViewSettings) => void;
  onSelect: (region: CloudRegion) => void;
  visibleRegions: CloudRegion[];
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("de");
    if (!normalized) return [];
    return CLOUD_REGIONS.filter((region) =>
      [region.name, region.code ?? "", region.location, region.country, PROVIDERS[region.provider].name]
        .join(" ")
        .toLocaleLowerCase("de")
        .includes(normalized),
    ).slice(0, 7);
  }, [query]);

  const providerIds: ProviderId[] = ["azure", "aws", "gcp"];

  return (
    <Panel title="Ansicht" className="settings-panel">
      <div className="search-control">
        <Search aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Standort suchen"
          aria-label="Standort suchen"
          autoComplete="off"
        />
        {matches.length > 0 ? (
          <div className="search-results" role="listbox" aria-label="Suchergebnisse">
            {matches.map((region) => (
              <button
                key={region.id}
                type="button"
                role="option"
                onClick={() => {
                  onSelect(region);
                  setQuery("");
                }}
              >
                <ProviderMark provider={region.provider} compact />
                <span>
                  <strong>{region.name}</strong>
                  <small>{region.code ?? region.location}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="provider-list">
        {providerIds.map((providerId) => {
          const count = CLOUD_REGIONS.filter((region) => region.provider === providerId).length;
          return (
            <div className="provider-row" key={providerId}>
              <ProviderMark provider={providerId} compact />
              <span>{PROVIDERS[providerId].shortName}</span>
              <small>{count} Regionen</small>
              <Toggle
                label={`${PROVIDERS[providerId].shortName} anzeigen`}
                checked={settings.providers[providerId]}
                onChange={(value) => onChange({
                  ...settings,
                  providers: { ...settings.providers, [providerId]: value },
                })}
              />
            </div>
          );
        })}
      </div>

      <div className="settings-group">
        <label>Status</label>
        <div className="segmented" role="group" aria-label="Status filtern">
          {([
            ["all", "Alle"],
            ["active", "Aktiv"],
            ["planned", "Geplant"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={settings.status === value ? "is-active" : ""}
              onClick={() => onChange({ ...settings, status: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label htmlFor="continent">Kontinent</label>
        <div className="select-wrap">
          <select
            id="continent"
            value={settings.continent}
            onChange={(event) => onChange({ ...settings, continent: event.target.value as ViewSettings["continent"] })}
          >
            <option value="all">Alle Kontinente</option>
            {CONTINENTS.map((continent) => <option key={continent}>{continent}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </div>
      </div>

      <div className="switch-list">
        <div>
          <span>Marker gruppieren</span>
          <Toggle label="Nahe Marker gruppieren" checked={settings.clusterMarkers} onChange={(value) => onChange({ ...settings, clusterMarkers: value })} />
        </div>
        <div>
          <span>Automatisch drehen</span>
          <Toggle label="Globus automatisch drehen" checked={settings.autoRotate} onChange={(value) => onChange({ ...settings, autoRotate: value })} />
        </div>
        <div>
          <span>Atmosphäre</span>
          <Toggle label="Atmosphäre anzeigen" checked={settings.atmosphere} onChange={(value) => onChange({ ...settings, atmosphere: value })} />
        </div>
      </div>

      <div className="summary-box">
        <strong>Zusammenfassung</strong>
        {providerIds.map((providerId) => (
          <div key={providerId}>
            <span className="summary-dot" style={{ background: PROVIDERS[providerId].color }} />
            <span>{PROVIDERS[providerId].shortName}</span>
            <b>{visibleRegions.filter((region) => region.provider === providerId).length}</b>
          </div>
        ))}
        <div className="summary-total">
          <span><Check aria-hidden="true" /> Sichtbar</span>
          <b>{visibleRegions.length}</b>
        </div>
      </div>
    </Panel>
  );
}
