import { Gauge, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { PROVIDERS, type CloudRegion, type ServiceId } from "../data/regions";
import { DEFAULT_ASSISTANT_WEIGHTS, scoreRegion, type AssistantWeights } from "../data/workbench";
import { ProviderMark } from "./ProviderMark";

const weightLabels: Record<keyof AssistantWeights, string> = { services: "Services", proximity: "Nähe", resilience: "Resilienz", cost: "Preis", sustainability: "Nachhaltigkeit" };

export function DecisionAssistant({ regions, allRegions, requiredServices, origin, onOriginChange, onCompare }: {
  regions: CloudRegion[];
  allRegions: CloudRegion[];
  requiredServices: ServiceId[];
  origin: CloudRegion | null;
  onOriginChange: (id: string | null) => void;
  onCompare: (region: CloudRegion) => void;
}) {
  const [weights, setWeights] = useState(DEFAULT_ASSISTANT_WEIGHTS);
  const ranked = useMemo(() => regions.filter((region) => region.locationType === "cloud-region" && region.lifecycleStatus === "active" && requiredServices.every((service) => region.services.includes(service))).map((region) => ({ region, result: scoreRegion(region, requiredServices, origin, weights) })).sort((left, right) => right.result.score - left.result.score).slice(0, 12), [origin, regions, requiredServices, weights]);
  return <div className="assistant-layout"><section className="workbench-card assistant-controls"><div className="workbench-card__header"><div><span className="eyebrow">Transparentes Ranking</span><h2>Entscheidungsassistent</h2><p>Nur verfügbare, belegte Kriterien fließen ein. Die Datenabdeckung bleibt sichtbar.</p></div></div><label className="origin-select"><span>Ursprungsregion für Proximity</span><select value={origin?.id ?? ""} onChange={(event) => onOriginChange(event.target.value || null)}><option value="">Keine Ursprungsregion</option>{allRegions.filter((region) => region.locationType === "cloud-region" && region.lifecycleStatus === "active").sort((a, b) => a.name.localeCompare(b.name, "de")).map((region) => <option value={region.id} key={region.id}>{PROVIDERS[region.provider].shortName} · {region.name}</option>)}</select><small>Gezeigt wird Luftlinie, keine gemessene Netzwerklatenz.</small></label><div className="weight-grid">{(Object.keys(weights) as Array<keyof AssistantWeights>).map((key) => <label key={key}><span>{weightLabels[key]} <b>{weights[key]} %</b></span><input type="range" min="0" max="60" step="5" value={weights[key]} onChange={(event) => setWeights((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div><div className="assistant-note"><ShieldCheck /><span><strong>Harte Anforderungen</strong>{requiredServices.length ? `${requiredServices.length} Pflichtdienste aus dem aktuellen Filter` : "Keine Pflichtdienste gesetzt"}{origin ? ` · Ursprung: ${origin.name}` : " · Keine Proximity-Basis"}</span></div></section><section className="ranking-list" aria-label="Empfohlene Cloud-Regionen">{ranked.length ? ranked.map(({ region, result }, index) => <article className="ranking-card" key={region.id}><div className="ranking-card__rank">{index + 1}</div><ProviderMark provider={region.provider} /><div className="ranking-card__body"><small>{PROVIDERS[region.provider].shortName} · {region.country}</small><h3>{region.name}</h3><div className="score-bar"><span style={{ width: `${result.score}%` }} /></div><p>{result.categories.filter((category) => category.value !== null).map((category) => category.explanation).join(" · ")}</p></div><div className="ranking-card__score"><Gauge /><strong>{Math.round(result.score)}</strong><small>{Math.round(result.coverage)} % Datenabdeckung</small><button type="button" onClick={() => onCompare(region)}>Shortlist</button></div></article>) : <div className="workbench-empty"><Gauge /><strong>Keine Region erfüllt die harten Anforderungen.</strong><span>Reduziere Pflichtdienste oder setze Filter zurück.</span></div>}</section></div>;
}
