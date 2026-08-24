import { Columns3, Download, MapPin, Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { PROVIDERS, SERVICES, type CloudRegion } from "../data/regions";
import { regionsToCsv, regionsToJson } from "../data/workbench";
import { ProviderMark } from "./ProviderMark";

type ColumnId = "provider" | "code" | "location" | "continent" | "status" | "zones" | "services" | "verified";
const columns: Array<{ id: ColumnId; label: string }> = [
  { id: "provider", label: "Anbieter" }, { id: "code", label: "Code" }, { id: "location", label: "Standort" },
  { id: "continent", label: "Kontinent" }, { id: "status", label: "Status" }, { id: "zones", label: "Zonen" },
  { id: "services", label: "Dienste" }, { id: "verified", label: "Verifiziert" },
];

function download(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LocationTable({ regions, compareIds, onToggleCompare, onSelect }: {
  regions: CloudRegion[];
  compareIds: string[];
  onToggleCompare: (region: CloudRegion) => void;
  onSelect: (region: CloudRegion) => void;
}) {
  const [sort, setSort] = useState<"name" | "provider" | "country" | "zones">("name");
  const [visibleColumns, setVisibleColumns] = useState<ColumnId[]>(columns.map((column) => column.id));
  const [showColumns, setShowColumns] = useState(false);
  const sorted = useMemo(() => [...regions].sort((left, right) => {
    if (sort === "zones") return (right.zones ?? 0) - (left.zones ?? 0);
    const leftValue = sort === "provider" ? PROVIDERS[left.provider].shortName : sort === "country" ? left.country : left.name;
    const rightValue = sort === "provider" ? PROVIDERS[right.provider].shortName : sort === "country" ? right.country : right.name;
    return leftValue.localeCompare(rightValue, "de");
  }), [regions, sort]);

  const has = (column: ColumnId) => visibleColumns.includes(column);
  return (
    <section className="workbench-card location-table-card" aria-labelledby="table-title">
      <div className="workbench-card__header">
        <div><span className="eyebrow">Entscheidungsdaten</span><h2 id="table-title">Standorttabelle</h2><p>{regions.length} gefilterte Standorte</p></div>
        <div className="table-actions">
          <label>Sortieren<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="name">Name</option><option value="provider">Anbieter</option><option value="country">Land</option><option value="zones">Zonen</option></select></label>
          <button type="button" className="secondary-button" onClick={() => setShowColumns((value) => !value)}><Columns3 /> Spalten</button>
          <button type="button" className="secondary-button" onClick={() => download("atlas-cloud-standorte.csv", regionsToCsv(sorted), "text/csv;charset=utf-8")}><Download /> CSV</button>
          <button type="button" className="secondary-button" onClick={() => download("atlas-cloud-standorte.json", regionsToJson(sorted), "application/json")}><Download /> JSON</button>
        </div>
      </div>
      {showColumns ? <div className="column-picker" aria-label="Sichtbare Spalten">{columns.map((column) => <label key={column.id}><input type="checkbox" checked={has(column.id)} onChange={() => setVisibleColumns((current) => current.includes(column.id) ? current.filter((id) => id !== column.id) : [...current, column.id])} />{column.label}</label>)}</div> : null}
      {regions.length === 0 ? <div className="workbench-empty"><MapPin /><strong>Keine Standorte entsprechen diesen Filtern.</strong><span>Filter zurücksetzen oder weitere Layer aktivieren.</span></div> : (
        <div className="table-scroll"><table><thead><tr><th>Standort</th>{has("provider") && <th>Anbieter</th>}{has("code") && <th>Code</th>}{has("location") && <th>Land</th>}{has("continent") && <th>Kontinent</th>}{has("status") && <th>Status</th>}{has("zones") && <th>Zonen</th>}{has("services") && <th>Dienste</th>}{has("verified") && <th>Verifiziert</th>}<th><span className="sr-only">Aktionen</span></th></tr></thead>
          <tbody>{sorted.map((region) => <tr key={region.id}><td><button type="button" className="table-location" onClick={() => onSelect(region)}><strong>{region.name}</strong><span>{region.location}</span></button></td>{has("provider") && <td><span className="provider-cell"><ProviderMark provider={region.provider} compact />{PROVIDERS[region.provider].shortName}</span></td>}{has("code") && <td><code>{region.code ?? "—"}</code></td>}{has("location") && <td>{region.country}</td>}{has("continent") && <td>{region.continent}</td>}{has("status") && <td><span className={`status-pill is-${region.lifecycleStatus}`}>{region.lifecycleStatus === "planned" ? "Geplant" : region.lifecycleStatus === "retired" ? "Stillgelegt" : "Aktiv"}</span></td>}{has("zones") && <td>{region.zones ?? (region.availabilityZones ? "3+" : "—")}</td>}{has("services") && <td><span className="service-count" title={region.services.map((id) => SERVICES[id].label).join(", ")}>{region.services.length}</span></td>}{has("verified") && <td>{new Date(region.provenance.verifiedAt).toLocaleDateString("de-DE")}</td>}<td><button type="button" className={`icon-text-button ${compareIds.includes(region.id) ? "is-active" : ""}`} onClick={() => onToggleCompare(region)} aria-label={`${region.name} ${compareIds.includes(region.id) ? "aus Vergleich entfernen" : "zum Vergleich hinzufügen"}`}><Scale />{compareIds.includes(region.id) ? "Entfernen" : "Vergleichen"}</button></td></tr>)}</tbody></table></div>
      )}
    </section>
  );
}
