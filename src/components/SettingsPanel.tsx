import { Check, ChevronDown, Database, Layers3, RotateCcw, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { CLOUD_REGIONS, CONTINENTS, DATA_METADATA, PROVIDERS, SERVICES, type CloudRegion, type LocationKind, type ProviderId, type ServiceId } from "../data/regions";
import { DEFAULT_FILTERS, type WorkbenchFilters, type WorkbenchState } from "../data/workbench";
import { Panel } from "./Panel";
import { ProviderMark } from "./ProviderMark";

function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
  return <button className={`toggle ${checked ? "is-on" : ""}`} type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><span /></button>;
}
const providerIds = Object.keys(PROVIDERS) as ProviderId[];
const serviceIds = Object.keys(SERVICES) as ServiceId[];

function normalizedTokens(value: string) {
  return value.trim().toLocaleLowerCase("de").split(/\s+/).filter(Boolean);
}

export function SettingsPanel({ state, onChange, onSelect, visibleRegions, renderMode }: {
  state: WorkbenchState;
  onChange: (state: WorkbenchState) => void;
  onSelect: (region: CloudRegion) => void;
  visibleRegions: CloudRegion[];
  renderMode: "3d" | "2d";
}) {
  const [query, setQuery] = useState("");
  const [activeResult, setActiveResult] = useState(0);
  const tokens = normalizedTokens(query);
  const matches = useMemo(() => {
    if (!tokens.length) return [];
    return CLOUD_REGIONS.filter((region) => {
      const text = [region.name, region.code ?? "", region.location, region.country, region.continent, region.networkRegion ?? "", PROVIDERS[region.provider].name, ...region.services.map((service) => SERVICES[service].label)].join(" ").toLocaleLowerCase("de");
      return tokens.every((token) => text.includes(token));
    }).slice(0, 10);
  }, [tokens.join("|")]);
  const filters = state.filters;
  const setFilters = (next: WorkbenchFilters) => onChange({ ...state, filters: next });
  const toggleList = <T,>(list: T[], value: T) => list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  const selectResult = (region: CloudRegion) => { onSelect(region); setQuery(""); setActiveResult(0); };
  const applyPreset = (preset: "eu" | "sovereign" | "zones" | "multicloud") => {
    const base = { ...DEFAULT_FILTERS, providers: ["azure", "aws", "gcp"] as ProviderId[] };
    setFilters(preset === "eu" ? { ...base, continent: "Europa" }
      : preset === "sovereign" ? { ...base, scope: "sovereign" }
        : preset === "zones" ? { ...base, minZones: 3 }
          : { ...base, colocated: true });
  };

  return <Panel title="Filter & Daten" className="settings-panel">
    <div className="search-control">
      <Search aria-hidden="true" />
      <input value={query} onChange={(event) => { setQuery(event.target.value); setActiveResult(0); }} placeholder="Region, Code, Land oder Dienst" aria-label="Standort suchen" role="combobox" aria-expanded={Boolean(query)} aria-controls="location-search-results" aria-activedescendant={matches[activeResult] ? `search-${matches[activeResult].id}` : undefined} autoComplete="off" onKeyDown={(event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); setActiveResult((index) => Math.min(matches.length - 1, index + 1)); }
        if (event.key === "ArrowUp") { event.preventDefault(); setActiveResult((index) => Math.max(0, index - 1)); }
        if (event.key === "Enter" && matches[activeResult]) { event.preventDefault(); selectResult(matches[activeResult]); }
        if (event.key === "Escape") { setQuery(""); setActiveResult(0); }
      }} />
      {query ? <div className="search-results" id="location-search-results" role="listbox" aria-label="Suchergebnisse">{matches.length ? matches.map((region, index) => <button id={`search-${region.id}`} key={region.id} type="button" role="option" aria-selected={index === activeResult} className={index === activeResult ? "is-active" : ""} onMouseEnter={() => setActiveResult(index)} onClick={() => selectResult(region)}><ProviderMark provider={region.provider} compact /><span><strong>{region.name}</strong><small>{region.code ?? region.location} · {region.country}</small></span></button>) : <div className="search-empty">Keine Treffer für „{query}“</div>}<div className="search-hint">↑↓ navigieren · Enter auswählen · Esc schließen</div></div> : null}
    </div>

    <div className="settings-section"><div className="settings-section__heading"><Layers3 /><span><strong>Layer</strong><small>Regionen und Edge getrennt</small></span></div><div className="layer-selector">{(["cloud-region", "edge-location"] as LocationKind[]).map((layer) => <button key={layer} type="button" className={filters.layers.includes(layer) ? "is-active" : ""} onClick={() => { const layers = toggleList(filters.layers, layer); if (layers.length) setFilters({ ...filters, layers }); }}><i className={`layer-mark is-${layer}`} />{layer === "cloud-region" ? "Cloud-Regionen" : "Edge-Standorte"}<b>{CLOUD_REGIONS.filter((region) => region.locationType === layer).length}</b></button>)}</div></div>

    <div className="provider-list">{providerIds.map((providerId) => <div className="provider-row" key={providerId}><ProviderMark provider={providerId} compact /><span>{PROVIDERS[providerId].shortName}</span><small>{visibleRegions.filter((region) => region.provider === providerId).length} sichtbar</small><Toggle label={`${PROVIDERS[providerId].shortName} anzeigen`} checked={filters.providers.includes(providerId)} onChange={() => { const providers = toggleList(filters.providers, providerId); if (providers.length) setFilters({ ...filters, providers }); }} /></div>)}</div>

    <div className="settings-grid"><div className="settings-group"><label>Status</label><div className="segmented" role="group" aria-label="Lifecycle filtern">{([["all", "Alle"], ["active", "Aktiv"], ["planned", "Geplant"], ["retired", "Stillgelegt"]] as const).map(([value, label]) => <button key={value} type="button" className={filters.status === value ? "is-active" : ""} onClick={() => setFilters({ ...filters, status: value })}>{label}</button>)}</div></div><div className="settings-group"><label htmlFor="continent">Kontinent</label><div className="select-wrap"><select id="continent" value={filters.continent} onChange={(event) => setFilters({ ...filters, continent: event.target.value as WorkbenchFilters["continent"] })}><option value="all">Alle Kontinente</option>{CONTINENTS.map((continent) => <option key={continent}>{continent}</option>)}</select><ChevronDown aria-hidden="true" /></div></div></div>

    <div className="settings-section"><div className="settings-section__heading"><Database /><span><strong>Pflichtdienste</strong><small>Alle ausgewählten Dienste müssen verfügbar sein</small></span></div><div className="service-pills">{serviceIds.filter((id) => id !== "edge-network").map((service) => <button type="button" key={service} className={filters.services.includes(service) ? "is-active" : ""} onClick={() => setFilters({ ...filters, services: toggleList(filters.services, service) })}>{SERVICES[service].shortLabel}{filters.services.includes(service) ? <Check /> : null}</button>)}</div></div>

    <div className="settings-section"><div className="settings-section__heading"><Sparkles /><span><strong>Architektur-Presets</strong><small>Setzen transparente harte Filter</small></span></div><div className="preset-grid"><button type="button" onClick={() => applyPreset("eu")}>EU Data Residency</button><button type="button" onClick={() => applyPreset("sovereign")}>Sovereign Cloud</button><button type="button" onClick={() => applyPreset("zones")}>Mindestens 3 Zonen</button><button type="button" onClick={() => applyPreset("multicloud")}>Multi-Cloud am Ort</button></div></div>

    {state.view === "map" ? <div className="switch-list"><div><span>Marker gruppieren</span><Toggle label="Nahe Marker gruppieren" checked={state.clusterMarkers} onChange={(value) => onChange({ ...state, clusterMarkers: value })} /></div><div><span>Automatisch drehen {renderMode === "2d" ? <small>Nur 3D</small> : null}</span><Toggle label="Globus automatisch drehen" disabled={renderMode === "2d"} checked={state.autoRotate} onChange={(value) => onChange({ ...state, autoRotate: value })} /></div><div><span>Atmosphäre {renderMode === "2d" ? <small>Nur 3D</small> : null}</span><Toggle label="Atmosphäre anzeigen" disabled={renderMode === "2d"} checked={state.atmosphere} onChange={(value) => onChange({ ...state, atmosphere: value })} /></div></div> : null}

    <div className="summary-box"><strong>Aktuelle Auswahl</strong><div><span><Check /> Sichtbar</span><b>{visibleRegions.length}</b></div><div><span>Cloud-Regionen</span><b>{visibleRegions.filter((region) => region.locationType === "cloud-region").length}</b></div><div><span>Edge-Standorte</span><b>{visibleRegions.filter((region) => region.locationType === "edge-location").length}</b></div><div className="summary-total"><span>Daten verifiziert</span><b>{new Date(DATA_METADATA.verifiedAt).toLocaleDateString("de-DE")}</b></div></div>
    <button type="button" className="reset-button" onClick={() => setFilters(DEFAULT_FILTERS)}><RotateCcw /> Filter zurücksetzen</button>
  </Panel>;
}
