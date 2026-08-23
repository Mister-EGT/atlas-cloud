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
  autoRotate: true,
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
  const [selected, setSelected] = useState<CloudRegion | null>(
    CLOUD_REGIONS.find((region) => region.code === "germanywestcentral") ?? CLOUD_REGIONS[0],
  );

  const visibleRegions = useMemo(() => filterRegions(CLOUD_REGIONS, settings), [settings]);

  useEffect(() => {
    if (visibleRegions.length === 0) {
      setSelected(null);
      return;
    }
    if (!selected || !visibleRegions.some((region) => region.id === selected.id)) {
      setSelected(visibleRegions[0]);
    }
  }, [visibleRegions, selected]);

  const handleSelect = (region: CloudRegion) => {
    setSettings((current) => ({
      ...current,
      providers: { ...current.providers, [region.provider]: true },
      status: region.status === "planned" && current.status === "active" ? "all" : current.status,
      continent: current.continent !== "all" && current.continent !== region.continent ? "all" : current.continent,
    }));
    setSelected(region);
  };

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
        <DetailPanel region={selected} />
        <GlobeCanvas
          regions={visibleRegions}
          selected={selected}
          clusterMarkers={settings.clusterMarkers}
          autoRotate={settings.autoRotate}
          atmosphere={settings.atmosphere}
          onSelect={handleSelect}
        />
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onSelect={handleSelect}
          visibleRegions={visibleRegions}
        />
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {selected ? `${selected.name}, ${selected.location} ausgewählt` : "Keine Region ausgewählt"}
      </div>
    </div>
  );
}
