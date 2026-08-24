import { CONTINENTS, PROVIDERS, SERVICES, type CloudRegion, type Continent, type LifecycleStatus, type LocationKind, type ProviderId, type ServiceId } from "./regions";

export type WorkbenchView = "map" | "table" | "compare" | "assistant";
export type RenderModePreference = "auto" | "3d" | "2d";

export interface WorkbenchFilters {
  layers: LocationKind[];
  providers: ProviderId[];
  status: "all" | LifecycleStatus;
  continent: "all" | Continent;
  services: ServiceId[];
  scope: "all" | "sovereign";
  minZones: 0 | 3;
  colocated: boolean;
}

export interface WorkbenchState {
  view: WorkbenchView;
  filters: WorkbenchFilters;
  selectedId: string | null;
  compareIds: string[];
  originId: string | null;
  renderMode: RenderModePreference;
  clusterMarkers: boolean;
  autoRotate: boolean;
  atmosphere: boolean;
}

export const DEFAULT_FILTERS: WorkbenchFilters = {
  layers: ["cloud-region"], providers: ["azure", "aws", "gcp", "cloudflare"], status: "all", continent: "all", services: [], scope: "all", minZones: 0, colocated: false,
};
export const DEFAULT_WORKBENCH_STATE: WorkbenchState = {
  view: "map", filters: DEFAULT_FILTERS, selectedId: null, compareIds: [], originId: null,
  renderMode: "auto", clusterMarkers: true, autoRotate: false, atmosphere: true,
};

const providerIds = Object.keys(PROVIDERS) as ProviderId[];
const serviceIds = Object.keys(SERVICES) as ServiceId[];
const views: WorkbenchView[] = ["map", "table", "compare", "assistant"];
const lifecycleStatuses: LifecycleStatus[] = ["active", "planned", "retired"];

function validList<T extends string>(value: string | null, allowed: T[]): T[] {
  if (!value) return [];
  return [...new Set(value.split(",").filter((item): item is T => allowed.includes(item as T)))];
}

export function parseWorkbenchState(search: string, validIds = new Set<string>()): WorkbenchState {
  const params = new URLSearchParams(search);
  const view = params.get("view") as WorkbenchView | null;
  const layers = validList(params.get("layers"), ["cloud-region", "edge-location"] as LocationKind[]);
  const providers = validList(params.get("providers"), providerIds);
  const services = validList(params.get("services"), serviceIds);
  const status = params.get("status");
  const continent = params.get("continent");
  const selectedId = params.get("selected");
  const originId = params.get("origin");
  const compareIds = params.get("compare")?.split(",").filter((id) => validIds.has(id)).slice(0, 4) ?? [];
  const renderMode = params.get("mode");
  return {
    view: view && views.includes(view) ? view : "map",
    filters: {
      layers: layers.length ? layers : DEFAULT_FILTERS.layers,
      providers: providers.length ? providers : DEFAULT_FILTERS.providers,
      services,
      scope: params.get("scope") === "sovereign" ? "sovereign" : "all",
      minZones: params.get("minZones") === "3" ? 3 : 0,
      colocated: params.get("colocated") === "1",
      status: status === "all" || lifecycleStatuses.includes(status as LifecycleStatus) ? status as WorkbenchFilters["status"] : "all",
      continent: continent === "all" || CONTINENTS.includes(continent as Continent) ? continent as WorkbenchFilters["continent"] : "all",
    },
    selectedId: selectedId && validIds.has(selectedId) ? selectedId : null,
    compareIds,
    originId: originId && validIds.has(originId) ? originId : null,
    renderMode: renderMode === "2d" || renderMode === "3d" ? renderMode : "auto",
    clusterMarkers: params.get("cluster") !== "0",
    autoRotate: params.get("rotate") === "1",
    atmosphere: params.get("atmosphere") !== "0",
  };
}

export function serializeWorkbenchState(state: WorkbenchState, pathname = "/") {
  const params = new URLSearchParams();
  if (state.view !== "map") params.set("view", state.view);
  if (state.filters.layers.join(",") !== DEFAULT_FILTERS.layers.join(",")) params.set("layers", state.filters.layers.join(","));
  if (state.filters.providers.length !== providerIds.length) params.set("providers", state.filters.providers.join(","));
  if (state.filters.status !== "all") params.set("status", state.filters.status);
  if (state.filters.continent !== "all") params.set("continent", state.filters.continent);
  if (state.filters.services.length) params.set("services", state.filters.services.join(","));
  if (state.filters.scope === "sovereign") params.set("scope", "sovereign");
  if (state.filters.minZones === 3) params.set("minZones", "3");
  if (state.filters.colocated) params.set("colocated", "1");
  if (state.selectedId) params.set("selected", state.selectedId);
  if (state.compareIds.length) params.set("compare", state.compareIds.slice(0, 4).join(","));
  if (state.originId) params.set("origin", state.originId);
  if (state.renderMode !== "auto") params.set("mode", state.renderMode);
  if (!state.clusterMarkers) params.set("cluster", "0");
  if (state.autoRotate) params.set("rotate", "1");
  if (!state.atmosphere) params.set("atmosphere", "0");
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function filterWorkbenchRegions(regions: CloudRegion[], filters: WorkbenchFilters) {
  return regions.filter((region) => filters.layers.includes(region.locationType)
    && filters.providers.includes(region.provider)
    && (filters.status === "all" || region.lifecycleStatus === filters.status)
    && (filters.continent === "all" || region.continent === filters.continent)
    && filters.services.every((service) => region.services.includes(service))
    && (filters.scope === "all" || region.scope === "sovereign")
    && (filters.minZones === 0 || (region.zones ?? (region.availabilityZones ? 3 : 0)) >= filters.minZones)
    && (!filters.colocated || regions.some((other) => other.provider !== region.provider && other.locationType === "cloud-region" && distanceInKilometres(region, other) <= 45)));
}

export function distanceInKilometres(left: Pick<CloudRegion, "lat" | "lng">, right: Pick<CloudRegion, "lat" | "lng">) {
  const toRadians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = toRadians(right.lat - left.lat);
  const longitudeDelta = toRadians(right.lng - left.lng);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(left.lat)) * Math.cos(toRadians(right.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface AssistantWeights { services: number; proximity: number; resilience: number; cost: number; sustainability: number }
export const DEFAULT_ASSISTANT_WEIGHTS: AssistantWeights = { services: 35, proximity: 25, resilience: 20, cost: 10, sustainability: 10 };

export function scoreRegion(region: CloudRegion, requiredServices: ServiceId[], origin: CloudRegion | null, weights: AssistantWeights) {
  const categories: Array<{ key: keyof AssistantWeights; value: number | null; explanation: string }> = [
    { key: "services", value: requiredServices.length ? requiredServices.filter((service) => region.services.includes(service)).length / requiredServices.length : 1, explanation: requiredServices.length ? `${requiredServices.filter((service) => region.services.includes(service)).length}/${requiredServices.length} Pflichtdienste` : "Keine Pflichtdienste gesetzt" },
    { key: "proximity", value: origin ? Math.max(0, 1 - distanceInKilometres(region, origin) / 12_000) : null, explanation: origin ? `${Math.round(distanceInKilometres(region, origin)).toLocaleString("de-DE")} km Luftlinie` : "Keine Ursprungsregion gesetzt" },
    { key: "resilience", value: region.locationType === "cloud-region" ? Math.min(1, (region.zones ?? (region.availabilityZones ? 3 : 1)) / 3) : null, explanation: region.locationType === "cloud-region" ? `${region.zones ?? (region.availabilityZones ? "3+" : "nicht ausgewiesene")} Zonen` : "Nicht auf Edge anwendbar" },
    { key: "cost", value: region.referencePrice ? Math.max(0, 1 - region.referencePrice.hourlyUsd / 0.4) : null, explanation: region.referencePrice ? `$${region.referencePrice.hourlyUsd.toFixed(4)}/h` : "Keine öffentliche Preisbaseline" },
    { key: "sustainability", value: region.sustainability ? Math.max(0, Math.min(1, region.sustainability.score)) : null, explanation: region.sustainability?.label ?? "Keine vergleichbare offizielle Metrik" },
  ];
  const available = categories.filter((category) => category.value !== null && weights[category.key] > 0);
  const availableWeight = available.reduce((sum, category) => sum + weights[category.key], 0);
  const score = availableWeight ? available.reduce((sum, category) => sum + (category.value ?? 0) * weights[category.key], 0) / availableWeight * 100 : 0;
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return { score, coverage: totalWeight ? availableWeight / totalWeight * 100 : 0, categories };
}

function quoteCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
export function regionsToCsv(regions: CloudRegion[]) {
  const header = ["id", "provider", "kind", "name", "code", "location", "country", "continent", "status", "zones", "restricted", "services", "verifiedAt", "source"];
  const rows = regions.map((region) => [region.id, region.provider, region.locationType, region.name, region.code, region.location, region.country, region.continent, region.lifecycleStatus, region.zones ?? "", Boolean(region.restricted), region.services.join("|"), region.provenance.verifiedAt, region.provenance.sourceUrl]);
  return [header, ...rows].map((row) => row.map(quoteCsv).join(",")).join("\n");
}

export function regionsToJson(regions: CloudRegion[]) {
  return `${JSON.stringify(regions, null, 2)}\n`;
}
