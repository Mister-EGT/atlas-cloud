import { Cloud, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DetailPanel } from "./components/DetailPanel";
import { GlobeCanvas } from "./components/GlobeCanvas";
import { SettingsPanel, type ViewSettings } from "./components/SettingsPanel";
import { CLOUD_REGIONS, type CloudRegion } from "./data/regions";

const initialSettings: ViewSettings = {
  providers: { azure: true, aws: true, gcp: true },
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

export function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [renderMode, setRenderMode] = useState<"3d" | "2d">("3d");
  const [selectedRegions, setSelectedRegions] = useState<CloudRegion[]>(() => [
    CLOUD_REGIONS.find((region) => region.code === "germanywestcentral") ?? CLOUD_REGIONS[0],
  ]);

  const visibleRegions = useMemo(() => filterRegions(CLOUD_REGIONS, settings), [settings]);

  useEffect(() => {
    const visibleIds = new Set(visibleRegions.map((region) => region.id));
    setSelectedRegions((current) => {
      const stillVisible = current.filter((region) => visibleIds.has(region.id));
      if (stillVisible.length === current.length) return current;
      return stillVisible.length > 0 ? stillVisible : visibleRegions.slice(0, 1);
    });
  }, [visibleRegions]);

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
          Stand 23. August 2026
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
          ? `${selectedRegions.length} Regionen bei ${selectedRegions[0].location} ausgewählt`
          : selectedRegions[0]
            ? `${selectedRegions[0].name}, ${selectedRegions[0].location} ausgewählt`
            : "Keine Region ausgewählt"}
      </div>
    </div>
  );
}
