import { Cloud, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { SettingsPanel, type ViewSettings } from "./components/SettingsPanel";
import { CLOUD_REGIONS, type CloudRegion } from "./data/regions";

const initialSettings: ViewSettings = {
  providers: {
    azure: true,
    aws: true,
    gcp: true,
    cloudflare: true,
    proton: true,
    hetzner: true,
    ovhcloud: true,
    oracle: true,
    ibm: true,
    digitalocean: true,
    akamai: true,
  },
  status: "all",
  continent: "all",
  clusterMarkers: true,
  autoRotate: false,
  atmosphere: true,
};

export function filterRegions(regions: CloudRegion[], settings: ViewSettings) {
  return regions.filter((region) => {
    if (!settings.providers[region.provider]) return false;
    if (settings.status !== "all" && region.status !== settings.status) return false;
    if (settings.continent !== "all" && region.continent !== settings.continent) return false;
    return true;
  });
}

export function keepVisibleSelection(current: CloudRegion[], visibleRegions: CloudRegion[]) {
  if (current.length === 0) return current;
  const visibleIds = new Set(visibleRegions.map((region) => region.id));
  const stillVisible = current.filter((region) => visibleIds.has(region.id));
  return stillVisible.length === current.length ? current : stillVisible;
}

export function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("2d");
  const [selectedRegions, setSelectedRegions] = useState<CloudRegion[]>([]);

  const visibleRegions = useMemo(() => filterRegions(CLOUD_REGIONS, settings), [settings]);

  useEffect(() => {
    setSelectedRegions((current) => keepVisibleSelection(current, visibleRegions));
  }, [visibleRegions]);

  useEffect(() => {
    if (settings.clusterMarkers) return;
    setSelectedRegions((current) => current.length > 1 ? current.slice(0, 1) : current);
  }, [settings.clusterMarkers]);

  const handleSearchSelect = (region: CloudRegion) => {
    setSettings((current) => ({
      ...current,
      providers: { ...current.providers, [region.provider]: true },
      status: current.status !== "all" && current.status !== region.status ? "all" : current.status,
      continent: current.continent !== "all" && current.continent !== region.continent ? "all" : current.continent,
    }));
    setSelectedRegions([region]);
  };

  const handleMarkerSelect = (regions: CloudRegion[]) => setSelectedRegions(regions);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__mark"><Globe2 aria-hidden="true" /></span>
          <strong>Atlas Cloud</strong>
        </div>
        <nav aria-label="Hauptnavigation">
          <a href="#weltkarte" aria-current="page"><Cloud aria-hidden="true" />Weltkarte</a>
        </nav>
        <div className="data-date">
          <span />
          Stand 29. August 2026
        </div>
      </header>

      <main className="workspace" id="weltkarte">
        <DetailPanel regions={selectedRegions} />
        <GlobeCanvas
          regions={visibleRegions}
          selectedRegions={selectedRegions}
          clusterMarkers={settings.clusterMarkers}
          autoRotate={settings.autoRotate}
          atmosphere={settings.atmosphere}
          onSelect={handleMarkerSelect}
          onRenderModeChange={setRenderMode}
        />
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSelect={handleSearchSelect}
          visibleRegions={visibleRegions}
          renderMode={renderMode}
        />
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {selectedRegions.length > 1
          ? `${selectedRegions.length} Standorte bei ${selectedRegions[0].location} ausgewählt`
          : selectedRegions[0]
            ? `${selectedRegions[0].name}, ${selectedRegions[0].location} ausgewählt`
            : "Kein Standort ausgewählt"}
      </div>
    </div>
  );
}
