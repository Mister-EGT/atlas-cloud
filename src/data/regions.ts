import locationsSnapshot from "./generated/locations.json";
import metadataSnapshot from "./generated/metadata.json";
import pricingSnapshot from "./generated/pricing.json";
import servicesSnapshot from "./generated/services.json";

export type ProviderId = "azure" | "aws" | "gcp" | "cloudflare";
export type LocationKind = "cloud-region" | "edge-location";
export type LifecycleStatus = "planned" | "active" | "retired";
export type OperationalStatus = "operational" | "degraded" | "partial-outage" | "major-outage" | "unknown";
export type Continent = "Afrika" | "Asien" | "Europa" | "Nordamerika" | "Ozeanien" | "Südamerika";
export type ServiceId = "compute" | "containers" | "object-storage" | "serverless" | "postgresql" | "key-management" | "edge-network";

export interface DataProvenance {
  sourceUrl: string;
  sourceKind: "official-provider-documentation" | "official-public-api";
  retrievedAt: string;
  verifiedAt: string;
}

export interface ReferencePrice {
  workloadId: "linux-general-2x8";
  hourlyUsd: number;
  sku: string;
  effectiveAt: string;
  sourceUrl: string;
}

export interface SustainabilityMetric {
  label: string;
  score: number;
  effectiveAt: string;
  sourceUrl: string;
}

export interface CloudRegion {
  id: string;
  provider: ProviderId;
  name: string;
  code: string | null;
  location: string;
  country: string;
  continent: Continent;
  lat: number;
  lng: number;
  zones?: number;
  availabilityZones?: boolean;
  pairedRegion?: string;
  status: "active" | "planned";
  lifecycleStatus: LifecycleStatus;
  operationalStatus: OperationalStatus;
  scope: "standard" | "sovereign";
  restricted?: boolean;
  locationType: LocationKind;
  networkRegion?: string;
  trackedSince?: string;
  source: string;
  coordinateAccuracy: "city-or-airport-centroid";
  services: ServiceId[];
  provenance: DataProvenance;
  referencePrice?: ReferencePrice;
  sustainability?: SustainabilityMetric;
}

export const PROVIDERS = {
  azure: { name: "Microsoft Azure", shortName: "Azure", color: "#087bd4" },
  aws: { name: "Amazon Web Services", shortName: "AWS", color: "#ff9900" },
  gcp: { name: "Google Cloud", shortName: "Google Cloud", color: "#34a853" },
  cloudflare: { name: "Cloudflare", shortName: "Cloudflare", color: "#f6821f" },
} as const;

const shortLabels: Record<ServiceId, string> = { compute: "Compute", containers: "Kubernetes", "object-storage": "Storage", serverless: "Serverless", postgresql: "PostgreSQL", "key-management": "KMS", "edge-network": "Edge" };
export const SERVICES = Object.fromEntries(servicesSnapshot.map((service) => [service.id, { label: service.label, shortLabel: shortLabels[service.id as ServiceId] }])) as Record<ServiceId, { label: string; shortLabel: string }>;

type PriceSnapshot = ReferencePrice & { regionId: string };
const pricesByRegion = new Map((pricingSnapshot.prices as PriceSnapshot[]).map((price) => [price.regionId, price]));

export const CLOUD_REGIONS: CloudRegion[] = (locationsSnapshot as unknown as CloudRegion[]).map((region) => ({
  ...region,
  referencePrice: pricesByRegion.get(region.id),
}));
export const AZURE_REGIONS = CLOUD_REGIONS.filter((region) => region.provider === "azure");
export const AWS_REGIONS = CLOUD_REGIONS.filter((region) => region.provider === "aws");
export const GCP_REGIONS = CLOUD_REGIONS.filter((region) => region.provider === "gcp");
export const CLOUDFLARE_REGIONS = CLOUD_REGIONS.filter((region) => region.provider === "cloudflare");
export const CONTINENTS: Continent[] = ["Afrika", "Asien", "Europa", "Nordamerika", "Ozeanien", "Südamerika"];
export const DATA_METADATA = metadataSnapshot;
export const PRICE_WORKLOAD = pricingSnapshot.workload;
