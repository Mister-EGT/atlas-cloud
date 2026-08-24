import { Cloud, GitCompareArrows, Globe2, Map, Sparkles, Table2 } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { SettingsPanel } from "./components/SettingsPanel";
import { CLOUD_REGIONS, DATA_METADATA, type CloudRegion } from "./data/regions";
import { DEFAULT_FILTERS, DEFAULT_WORKBENCH_STATE, filterWorkbenchRegions, parseWorkbenchState, serializeWorkbenchState, type WorkbenchState, type WorkbenchView } from "./data/workbench";

const validIds = new Set(CLOUD_REGIONS.map((region) => region.id));
const LocationTable = lazy(() => import("./components/LocationTable").then((module) => ({ default: module.LocationTable })));
const ComparisonView = lazy(() => import("./components/ComparisonView").then((module) => ({ default: module.ComparisonView })));
const DecisionAssistant = lazy(() => import("./components/DecisionAssistant").then((module) => ({ default: module.DecisionAssistant })));
const viewItems: Array<{ id: WorkbenchView; label: string; icon: typeof Map }> = [
  { id: "map", label: "Karte", icon: Map }, { id: "table", label: "Tabelle", icon: Table2 },
  { id: "compare", label: "Vergleich", icon: GitCompareArrows }, { id: "assistant", label: "Assistent", icon: Sparkles },
];

export function filterRegions(regions: CloudRegion[], state: WorkbenchState) {
  return filterWorkbenchRegions(regions, state.filters);
}

export function App() {
  const [state, setState] = useState<WorkbenchState>(() => typeof window === "undefined" ? DEFAULT_WORKBENCH_STATE : parseWorkbenchState(window.location.search, validIds));
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("3d");
  const [selectedRegions, setSelectedRegions] = useState<CloudRegion[]>(() => state.selectedId ? CLOUD_REGIONS.filter((region) => region.id === state.selectedId) : []);
  const [compareNotice, setCompareNotice] = useState("");
  const [updateReady, setUpdateReady] = useState(false);
  const visibleRegions = useMemo(() => filterWorkbenchRegions(CLOUD_REGIONS, state.filters), [state.filters]);
  const compareRegions = state.compareIds.map((id) => CLOUD_REGIONS.find((region) => region.id === id)).filter((region): region is CloudRegion => Boolean(region));
  const origin = state.originId ? CLOUD_REGIONS.find((region) => region.id === state.originId) ?? null : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextUrl = serializeWorkbenchState(state, window.location.pathname);
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) window.history.replaceState(null, "", nextUrl);
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePopState = () => setState(parseWorkbenchState(window.location.search, validIds));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleUpdate = () => setUpdateReady(true);
    window.addEventListener("atlas-update-ready", handleUpdate);
    return () => window.removeEventListener("atlas-update-ready", handleUpdate);
  }, []);

  useEffect(() => {
    const visibleIds = new Set(visibleRegions.map((region) => region.id));
    setSelectedRegions((current) => current.filter((region) => visibleIds.has(region.id)));
    setState((current) => current.selectedId && !visibleIds.has(current.selectedId) ? { ...current, selectedId: null } : current);
  }, [visibleRegions]);

  useEffect(() => {
    if (state.clusterMarkers) return;
    setSelectedRegions((current) => current.length > 1 ? current.slice(0, 1) : current);
  }, [state.clusterMarkers]);

  const handleSearchSelect = (region: CloudRegion) => {
    setState((current) => ({ ...current, view: "map", selectedId: region.id, filters: {
      ...current.filters,
      layers: current.filters.layers.includes(region.locationType) ? current.filters.layers : [...current.filters.layers, region.locationType],
      providers: current.filters.providers.includes(region.provider) ? current.filters.providers : [...current.filters.providers, region.provider],
      status: current.filters.status !== "all" && current.filters.status !== region.lifecycleStatus ? "all" : current.filters.status,
      continent: current.filters.continent !== "all" && current.filters.continent !== region.continent ? "all" : current.filters.continent,
      scope: current.filters.scope !== "all" && region.scope !== "sovereign" ? "all" : current.filters.scope,
      minZones: current.filters.minZones && (region.zones ?? 0) < current.filters.minZones ? 0 : current.filters.minZones,
      colocated: false,
    } }));
    setSelectedRegions([region]);
  };
  const handleMarkerSelect = (regions: CloudRegion[]) => { setSelectedRegions(regions); setState((current) => ({ ...current, selectedId: regions[0]?.id ?? null })); };
  const handleToggleCompare = (region: CloudRegion) => setState((current) => {
    if (current.compareIds.includes(region.id)) { setCompareNotice(`${region.name} aus der Shortlist entfernt`); return { ...current, compareIds: current.compareIds.filter((id) => id !== region.id) }; }
    if (current.compareIds.length >= 4) { setCompareNotice("Die Shortlist enthält bereits vier Standorte."); return current; }
    setCompareNotice(`${region.name} zur Shortlist hinzugefügt`);
    return { ...current, compareIds: [...current.compareIds, region.id] };
  });
  const setView = (view: WorkbenchView) => setState((current) => ({ ...current, view }));

  return <div className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand__mark"><Globe2 aria-hidden="true" /></span><span><strong>Atlas Cloud</strong><small>Cloud-Architect Workbench</small></span></div><nav aria-label="Workbench-Navigation">{viewItems.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={state.view === id ? "is-active" : ""} aria-current={state.view === id ? "page" : undefined} onClick={() => setView(id)}><Icon aria-hidden="true" />{label}{id === "compare" && state.compareIds.length ? <b>{state.compareIds.length}</b> : null}</button>)}</nav><div className="data-date"><span /><div><small>Daten verifiziert</small>{new Date(DATA_METADATA.verifiedAt).toLocaleDateString("de-DE")}</div></div></header>

    {state.view === "map" ? <main className="workspace" id="weltkarte"><DetailPanel regions={selectedRegions} compareIds={state.compareIds} onToggleCompare={handleToggleCompare} /><GlobeCanvas regions={visibleRegions} selectedRegions={selectedRegions} clusterMarkers={state.clusterMarkers} autoRotate={state.autoRotate} atmosphere={state.atmosphere} onSelect={handleMarkerSelect} forcedMode={state.renderMode} onRenderModeChange={setRenderMode} /><SettingsPanel state={state} onChange={setState} onSelect={handleSearchSelect} visibleRegions={visibleRegions} renderMode={renderMode} /></main> : <main className="workbench-page"><div className="workbench-main"><Suspense fallback={<div className="view-loading" role="status">Ansicht wird geladen …</div>}>{state.view === "table" ? <LocationTable regions={visibleRegions} compareIds={state.compareIds} onToggleCompare={handleToggleCompare} onSelect={handleSearchSelect} /> : null}{state.view === "compare" ? <ComparisonView regions={compareRegions} origin={origin} onRemove={handleToggleCompare} onOpenTable={() => setView("table")} /> : null}{state.view === "assistant" ? <DecisionAssistant regions={visibleRegions} allRegions={CLOUD_REGIONS} requiredServices={state.filters.services} origin={origin} onOriginChange={(originId) => setState((current) => ({ ...current, originId }))} onCompare={handleToggleCompare} /> : null}</Suspense></div><SettingsPanel state={state} onChange={setState} onSelect={handleSearchSelect} visibleRegions={visibleRegions} renderMode={renderMode} /></main>}

    {updateReady ? <div className="update-banner" role="status"><span>Eine neue Datenversion ist verfügbar.</span><button type="button" onClick={() => window.location.reload()}>Jetzt aktualisieren</button><button type="button" onClick={() => setUpdateReady(false)}>Später</button></div> : null}
    <div className="sr-only" role="status" aria-live="polite">{compareNotice || (selectedRegions.length > 1 ? `${selectedRegions.length} Standorte bei ${selectedRegions[0].location} ausgewählt` : selectedRegions[0] ? `${selectedRegions[0].name}, ${selectedRegions[0].location} ausgewählt` : "Kein Standort ausgewählt")}</div>
    <footer className="app-footer"><Cloud /><span>Statischer Snapshot · keine API-Schlüssel zur Laufzeit · <button type="button" onClick={() => setState((current) => ({ ...current, filters: DEFAULT_FILTERS }))}>Filter zurücksetzen</button></span></footer>
  </div>;
}
