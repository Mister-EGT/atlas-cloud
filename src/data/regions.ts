import { CLOUDFLARE_LOCATION_INPUTS } from "./cloudflareLocations";

export type ProviderId = "azure" | "aws" | "gcp" | "cloudflare";
export type Continent =
  | "Afrika"
  | "Asien"
  | "Europa"
  | "Nordamerika"
  | "Ozeanien"
  | "Südamerika";

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
  scope: "standard" | "sovereign";
  restricted?: boolean;
  locationType: "cloud-region" | "edge-location";
  networkRegion?: string;
  trackedSince?: string;
  source: string;
}

export const PROVIDERS = {
  azure: {
    name: "Microsoft Azure",
    shortName: "Azure",
    color: "#087bd4",
  },
  aws: {
    name: "Amazon Web Services",
    shortName: "AWS",
    color: "#ff9900",
  },
  gcp: {
    name: "Google Cloud",
    shortName: "Google Cloud",
    color: "#34a853",
  },
  cloudflare: {
    name: "Cloudflare",
    shortName: "Cloudflare",
    color: "#f6821f",
  },
} as const;

const AZURE_SOURCE = "https://learn.microsoft.com/azure/reliability/regions-list";
const AZURE_CHINA_SOURCE = "https://learn.microsoft.com/azure/china/overview-regions";
const AZURE_GOV_SOURCE = "https://learn.microsoft.com/azure/azure-government/documentation-government-welcome";
const AZURE_DOD_SOURCE = "https://learn.microsoft.com/azure/azure-government/documentation-government-overview-dod";
const AWS_SOURCE = "https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html";
const AWS_INFRA_SOURCE = "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/";
const AWS_EU_SOVEREIGN_SOURCE = "https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/";
const GCP_SOURCE = "https://cloud.google.com/about/locations";
const CLOUDFLARE_SOURCE = "https://www.cloudflarestatus.com/";

type RegionInput = Omit<CloudRegion, "id" | "provider" | "status" | "scope" | "source" | "locationType"> & {
  status?: CloudRegion["status"];
  scope?: CloudRegion["scope"];
  locationType?: CloudRegion["locationType"];
  source?: string;
};

export type CloudflareLocationInput = Pick<
  CloudRegion,
  "name" | "code" | "location" | "country" | "continent" | "lat" | "lng" | "networkRegion" | "trackedSince"
>;

function makeRegion(provider: ProviderId, input: RegionInput): CloudRegion {
  const source =
    input.source ??
    (provider === "azure" ? AZURE_SOURCE : provider === "aws" ? AWS_SOURCE : GCP_SOURCE);
  const stableCode = input.code ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    ...input,
    id: `${provider}-${stableCode}`,
    provider,
    status: input.status ?? "active",
    scope: input.scope ?? "standard",
    locationType: input.locationType ?? (provider === "cloudflare" ? "edge-location" : "cloud-region"),
    source,
  };
}

const azure = (input: RegionInput) => makeRegion("azure", input);
const aws = (input: RegionInput) => makeRegion("aws", input);
const gcp = (input: RegionInput) => makeRegion("gcp", input);
const cloudflare = (input: CloudflareLocationInput) => makeRegion("cloudflare", {
  ...input,
  name: `${input.name} Edge`,
  availabilityZones: false,
  locationType: "edge-location",
  source: CLOUDFLARE_SOURCE,
});

export const AZURE_REGIONS: CloudRegion[] = [
  azure({ name: "Australia Central", code: "australiacentral", location: "Canberra", country: "Australien", continent: "Ozeanien", lat: -35.2809, lng: 149.13, pairedRegion: "Australia Central 2", restricted: true }),
  azure({ name: "Australia Central 2", code: "australiacentral2", location: "Canberra", country: "Australien", continent: "Ozeanien", lat: -35.33, lng: 149.18, pairedRegion: "Australia Central", restricted: true }),
  azure({ name: "Australia East", code: "australiaeast", location: "New South Wales", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093, availabilityZones: true, pairedRegion: "Australia Southeast" }),
  azure({ name: "Australia Southeast", code: "australiasoutheast", location: "Victoria", country: "Australien", continent: "Ozeanien", lat: -37.8136, lng: 144.9631, pairedRegion: "Australia East" }),
  azure({ name: "Austria East", code: "austriaeast", location: "Wien", country: "Österreich", continent: "Europa", lat: 48.2082, lng: 16.3738, availabilityZones: true }),
  azure({ name: "Belgium Central", code: "belgiumcentral", location: "Brüssel", country: "Belgien", continent: "Europa", lat: 50.8503, lng: 4.3517, availabilityZones: true }),
  azure({ name: "Brazil South", code: "brazilsouth", location: "Bundesstaat São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5505, lng: -46.6333, availabilityZones: true, pairedRegion: "South Central US" }),
  azure({ name: "Brazil Southeast", code: "brazilsoutheast", location: "Rio de Janeiro", country: "Brasilien", continent: "Südamerika", lat: -22.9068, lng: -43.1729, pairedRegion: "Brazil South", restricted: true }),
  azure({ name: "Canada Central", code: "canadacentral", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832, availabilityZones: true, pairedRegion: "Canada East" }),
  azure({ name: "Canada East", code: "canadaeast", location: "Québec", country: "Kanada", continent: "Nordamerika", lat: 46.8139, lng: -71.208, pairedRegion: "Canada Central" }),
  azure({ name: "Central India", code: "centralindia", location: "Pune", country: "Indien", continent: "Asien", lat: 18.5204, lng: 73.8567, availabilityZones: true, pairedRegion: "South India" }),
  azure({ name: "Central US", code: "centralus", location: "Iowa", country: "USA", continent: "Nordamerika", lat: 41.5868, lng: -93.625, availabilityZones: true, pairedRegion: "East US 2" }),
  azure({ name: "Chile Central", code: "chilecentral", location: "Santiago", country: "Chile", continent: "Südamerika", lat: -33.4489, lng: -70.6693, availabilityZones: true }),
  azure({ name: "Denmark East", code: "denmarkeast", location: "Kopenhagen", country: "Dänemark", continent: "Europa", lat: 55.6761, lng: 12.5683, availabilityZones: true }),
  azure({ name: "East Asia", code: "eastasia", location: "Hongkong", country: "Hongkong", continent: "Asien", lat: 22.3193, lng: 114.1694, availabilityZones: true, pairedRegion: "Southeast Asia" }),
  azure({ name: "East US", code: "eastus", location: "Virginia", country: "USA", continent: "Nordamerika", lat: 37.4316, lng: -78.6569, availabilityZones: true, pairedRegion: "West US" }),
  azure({ name: "East US 2", code: "eastus2", location: "Virginia", country: "USA", continent: "Nordamerika", lat: 36.6676, lng: -78.3875, availabilityZones: true, pairedRegion: "Central US" }),
  azure({ name: "France Central", code: "francecentral", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522, availabilityZones: true, pairedRegion: "France South" }),
  azure({ name: "France South", code: "francesouth", location: "Marseille", country: "Frankreich", continent: "Europa", lat: 43.2965, lng: 5.3698, pairedRegion: "France Central", restricted: true }),
  azure({ name: "Germany North", code: "germanynorth", location: "Berlin", country: "Deutschland", continent: "Europa", lat: 52.52, lng: 13.405, pairedRegion: "Germany West Central", restricted: true }),
  azure({ name: "Germany West Central", code: "germanywestcentral", location: "Frankfurt", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821, availabilityZones: true, pairedRegion: "Germany North" }),
  azure({ name: "India South Central", code: "indiasouthcentral", location: "Hyderabad", country: "Indien", continent: "Asien", lat: 17.385, lng: 78.4867, availabilityZones: true, pairedRegion: "Central India" }),
  azure({ name: "Indonesia Central", code: "indonesiacentral", location: "Jakarta", country: "Indonesien", continent: "Asien", lat: -6.2088, lng: 106.8456, availabilityZones: true }),
  azure({ name: "Israel Central", code: "israelcentral", location: "Israel", country: "Israel", continent: "Asien", lat: 32.0853, lng: 34.7818, availabilityZones: true }),
  azure({ name: "Italy North", code: "italynorth", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, availabilityZones: true }),
  azure({ name: "Japan East", code: "japaneast", location: "Tokio, Saitama", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503, availabilityZones: true, pairedRegion: "Japan West" }),
  azure({ name: "Japan West", code: "japanwest", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023, availabilityZones: true, pairedRegion: "Japan East" }),
  azure({ name: "Korea Central", code: "koreacentral", location: "Seoul", country: "Südkorea", continent: "Asien", lat: 37.5665, lng: 126.978, availabilityZones: true, pairedRegion: "Korea South" }),
  azure({ name: "Korea South", code: "koreasouth", location: "Busan", country: "Südkorea", continent: "Asien", lat: 35.1796, lng: 129.0756, pairedRegion: "Korea Central" }),
  azure({ name: "Malaysia West", code: "malaysiawest", location: "Kuala Lumpur", country: "Malaysia", continent: "Asien", lat: 3.139, lng: 101.6869, availabilityZones: true }),
  azure({ name: "Mexico Central", code: "mexicocentral", location: "Bundesstaat Querétaro", country: "Mexiko", continent: "Nordamerika", lat: 20.5888, lng: -100.3899, availabilityZones: true }),
  azure({ name: "New Zealand North", code: "newzealandnorth", location: "Auckland", country: "Neuseeland", continent: "Ozeanien", lat: -36.8509, lng: 174.7645, availabilityZones: true }),
  azure({ name: "North Central US", code: "northcentralus", location: "Illinois", country: "USA", continent: "Nordamerika", lat: 41.8781, lng: -87.6298, pairedRegion: "South Central US" }),
  azure({ name: "North Europe", code: "northeurope", location: "Irland", country: "Irland", continent: "Europa", lat: 53.3498, lng: -6.2603, availabilityZones: true, pairedRegion: "West Europe" }),
  azure({ name: "Norway East", code: "norwayeast", location: "Norwegen", country: "Norwegen", continent: "Europa", lat: 59.9139, lng: 10.7522, availabilityZones: true, pairedRegion: "Norway West" }),
  azure({ name: "Norway West", code: "norwaywest", location: "Norwegen", country: "Norwegen", continent: "Europa", lat: 58.969, lng: 5.7331, pairedRegion: "Norway East", restricted: true }),
  azure({ name: "Poland Central", code: "polandcentral", location: "Warschau", country: "Polen", continent: "Europa", lat: 52.2297, lng: 21.0122, availabilityZones: true }),
  azure({ name: "Qatar Central", code: "qatarcentral", location: "Doha", country: "Katar", continent: "Asien", lat: 25.2854, lng: 51.531, availabilityZones: true }),
  azure({ name: "South Africa North", code: "southafricanorth", location: "Johannesburg", country: "Südafrika", continent: "Afrika", lat: -26.2041, lng: 28.0473, availabilityZones: true, pairedRegion: "South Africa West" }),
  azure({ name: "South Africa West", code: "southafricawest", location: "Kapstadt", country: "Südafrika", continent: "Afrika", lat: -33.9249, lng: 18.4241, pairedRegion: "South Africa North", restricted: true }),
  azure({ name: "South Central US", code: "southcentralus", location: "Texas", country: "USA", continent: "Nordamerika", lat: 29.4241, lng: -98.4936, availabilityZones: true, pairedRegion: "North Central US" }),
  azure({ name: "South India", code: "southindia", location: "Chennai", country: "Indien", continent: "Asien", lat: 13.0827, lng: 80.2707, pairedRegion: "Central India" }),
  azure({ name: "Southeast Asia", code: "southeastasia", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, availabilityZones: true, pairedRegion: "East Asia" }),
  azure({ name: "Spain Central", code: "spaincentral", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, availabilityZones: true }),
  azure({ name: "Sweden Central", code: "swedencentral", location: "Gävle", country: "Schweden", continent: "Europa", lat: 60.6749, lng: 17.1413, availabilityZones: true, pairedRegion: "Sweden South" }),
  azure({ name: "Switzerland North", code: "switzerlandnorth", location: "Zürich", country: "Schweiz", continent: "Europa", lat: 47.3769, lng: 8.5417, availabilityZones: true, pairedRegion: "Switzerland West" }),
  azure({ name: "Switzerland West", code: "switzerlandwest", location: "Genf", country: "Schweiz", continent: "Europa", lat: 46.2044, lng: 6.1432, pairedRegion: "Switzerland North", restricted: true }),
  azure({ name: "UAE Central", code: "uaecentral", location: "Abu Dhabi", country: "Vereinigte Arabische Emirate", continent: "Asien", lat: 24.4539, lng: 54.3773, pairedRegion: "UAE North", restricted: true }),
  azure({ name: "UAE North", code: "uaenorth", location: "Dubai", country: "Vereinigte Arabische Emirate", continent: "Asien", lat: 25.2048, lng: 55.2708, availabilityZones: true, pairedRegion: "UAE Central" }),
  azure({ name: "UK South", code: "uksouth", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5072, lng: -0.1276, availabilityZones: true, pairedRegion: "UK West" }),
  azure({ name: "UK West", code: "ukwest", location: "Cardiff", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.4816, lng: -3.1791, pairedRegion: "UK South" }),
  azure({ name: "West Central US", code: "westcentralus", location: "Wyoming", country: "USA", continent: "Nordamerika", lat: 41.14, lng: -104.8202, pairedRegion: "West US 2" }),
  azure({ name: "West Europe", code: "westeurope", location: "Niederlande", country: "Niederlande", continent: "Europa", lat: 52.3676, lng: 4.9041, availabilityZones: true, pairedRegion: "North Europe" }),
  azure({ name: "West India", code: "westindia", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777, pairedRegion: "South India" }),
  azure({ name: "West US", code: "westus", location: "Kalifornien", country: "USA", continent: "Nordamerika", lat: 37.7749, lng: -122.4194, pairedRegion: "East US" }),
  azure({ name: "West US 2", code: "westus2", location: "Washington", country: "USA", continent: "Nordamerika", lat: 47.233, lng: -119.852, availabilityZones: true, pairedRegion: "West Central US" }),
  azure({ name: "West US 3", code: "westus3", location: "Phoenix", country: "USA", continent: "Nordamerika", lat: 33.4484, lng: -112.074, availabilityZones: true, pairedRegion: "East US" }),
  azure({ name: "China East", code: "chinaeast", location: "Ostchina", country: "China", continent: "Asien", lat: 31.2304, lng: 121.4737, pairedRegion: "China North", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "China East 2", code: "chinaeast2", location: "Ostchina", country: "China", continent: "Asien", lat: 31.38, lng: 121.61, pairedRegion: "China North 2", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "China East 3", code: "chinaeast3", location: "Ostchina", country: "China", continent: "Asien", lat: 31.08, lng: 121.33, pairedRegion: "China North 3", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "China North", code: "chinanorth", location: "Nordchina", country: "China", continent: "Asien", lat: 39.9042, lng: 116.4074, pairedRegion: "China East", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "China North 2", code: "chinanorth2", location: "Nordchina", country: "China", continent: "Asien", lat: 40.04, lng: 116.55, pairedRegion: "China East 2", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "China North 3", code: "chinanorth3", location: "Nordchina", country: "China", continent: "Asien", lat: 39.76, lng: 116.27, availabilityZones: true, pairedRegion: "China East 3", scope: "sovereign", restricted: true, source: AZURE_CHINA_SOURCE }),
  azure({ name: "US Gov Arizona", code: "usgovarizona", location: "Arizona", country: "USA", continent: "Nordamerika", lat: 33.4484, lng: -112.074, pairedRegion: "US Gov Texas", scope: "sovereign", restricted: true, source: AZURE_GOV_SOURCE }),
  azure({ name: "US Gov Texas", code: "usgovtexas", location: "Texas", country: "USA", continent: "Nordamerika", lat: 29.4241, lng: -98.4936, pairedRegion: "US Gov Arizona", scope: "sovereign", restricted: true, source: AZURE_GOV_SOURCE }),
  azure({ name: "US Gov Virginia", code: "usgovvirginia", location: "Virginia", country: "USA", continent: "Nordamerika", lat: 37.4316, lng: -78.6569, availabilityZones: true, pairedRegion: "US Gov Texas", scope: "sovereign", restricted: true, source: AZURE_GOV_SOURCE }),
  azure({ name: "US DoD Central", code: "usdodcentral", location: "Zentrale USA", country: "USA", continent: "Nordamerika", lat: 41.5868, lng: -93.625, scope: "sovereign", restricted: true, source: AZURE_DOD_SOURCE }),
  azure({ name: "US DoD East", code: "usdodeast", location: "Östliche USA", country: "USA", continent: "Nordamerika", lat: 38.9072, lng: -77.0369, scope: "sovereign", restricted: true, source: AZURE_DOD_SOURCE }),
];

export const AWS_REGIONS: CloudRegion[] = [
  aws({ name: "US East (N. Virginia)", code: "us-east-1", location: "Nord-Virginia", country: "USA", continent: "Nordamerika", lat: 39.0438, lng: -77.4874, zones: 6 }),
  aws({ name: "US East (Ohio)", code: "us-east-2", location: "Ohio", country: "USA", continent: "Nordamerika", lat: 39.9612, lng: -82.9988, zones: 3 }),
  aws({ name: "US West (N. California)", code: "us-west-1", location: "Nordkalifornien", country: "USA", continent: "Nordamerika", lat: 37.3382, lng: -121.8863, zones: 3 }),
  aws({ name: "US West (Oregon)", code: "us-west-2", location: "Oregon", country: "USA", continent: "Nordamerika", lat: 45.8399, lng: -119.7006, zones: 4 }),
  aws({ name: "Africa (Cape Town)", code: "af-south-1", location: "Kapstadt", country: "Südafrika", continent: "Afrika", lat: -33.9249, lng: 18.4241, zones: 3 }),
  aws({ name: "Asia Pacific (Hong Kong)", code: "ap-east-1", location: "Hongkong", country: "Hongkong", continent: "Asien", lat: 22.3193, lng: 114.1694, zones: 3 }),
  aws({ name: "Asia Pacific (Hyderabad)", code: "ap-south-2", location: "Hyderabad", country: "Indien", continent: "Asien", lat: 17.385, lng: 78.4867, zones: 3 }),
  aws({ name: "Asia Pacific (Jakarta)", code: "ap-southeast-3", location: "Jakarta", country: "Indonesien", continent: "Asien", lat: -6.2088, lng: 106.8456, zones: 3 }),
  aws({ name: "Asia Pacific (Malaysia)", code: "ap-southeast-5", location: "Malaysia", country: "Malaysia", continent: "Asien", lat: 3.139, lng: 101.6869, zones: 3 }),
  aws({ name: "Asia Pacific (Melbourne)", code: "ap-southeast-4", location: "Melbourne", country: "Australien", continent: "Ozeanien", lat: -37.8136, lng: 144.9631, zones: 3 }),
  aws({ name: "Asia Pacific (Mumbai)", code: "ap-south-1", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777, zones: 3 }),
  aws({ name: "Asia Pacific (New Zealand)", code: "ap-southeast-6", location: "Auckland", country: "Neuseeland", continent: "Ozeanien", lat: -36.8509, lng: 174.7645, zones: 3 }),
  aws({ name: "Asia Pacific (Osaka)", code: "ap-northeast-3", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023, zones: 3 }),
  aws({ name: "Asia Pacific (Seoul)", code: "ap-northeast-2", location: "Seoul", country: "Südkorea", continent: "Asien", lat: 37.5665, lng: 126.978, zones: 4 }),
  aws({ name: "Asia Pacific (Singapore)", code: "ap-southeast-1", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, zones: 3 }),
  aws({ name: "Asia Pacific (Sydney)", code: "ap-southeast-2", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093, zones: 3 }),
  aws({ name: "Asia Pacific (Taipei)", code: "ap-east-2", location: "Taipeh", country: "Taiwan", continent: "Asien", lat: 25.033, lng: 121.5654, zones: 3 }),
  aws({ name: "Asia Pacific (Thailand)", code: "ap-southeast-7", location: "Bangkok", country: "Thailand", continent: "Asien", lat: 13.7563, lng: 100.5018, zones: 3 }),
  aws({ name: "Asia Pacific (Tokyo)", code: "ap-northeast-1", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503, zones: 4 }),
  aws({ name: "Canada (Central)", code: "ca-central-1", location: "Montreal", country: "Kanada", continent: "Nordamerika", lat: 45.5019, lng: -73.5674, zones: 3 }),
  aws({ name: "Canada West (Calgary)", code: "ca-west-1", location: "Calgary", country: "Kanada", continent: "Nordamerika", lat: 51.0447, lng: -114.0719, zones: 3 }),
  aws({ name: "Europe (Frankfurt)", code: "eu-central-1", location: "Frankfurt", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821, zones: 3 }),
  aws({ name: "Europe (Ireland)", code: "eu-west-1", location: "Dublin", country: "Irland", continent: "Europa", lat: 53.3498, lng: -6.2603, zones: 3 }),
  aws({ name: "Europe (London)", code: "eu-west-2", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5072, lng: -0.1276, zones: 3 }),
  aws({ name: "Europe (Milan)", code: "eu-south-1", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, zones: 3 }),
  aws({ name: "Europe (Paris)", code: "eu-west-3", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522, zones: 3 }),
  aws({ name: "Europe (Spain)", code: "eu-south-2", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, zones: 3 }),
  aws({ name: "Europe (Stockholm)", code: "eu-north-1", location: "Stockholm", country: "Schweden", continent: "Europa", lat: 59.3293, lng: 18.0686, zones: 3 }),
  aws({ name: "Europe (Zurich)", code: "eu-central-2", location: "Zürich", country: "Schweiz", continent: "Europa", lat: 47.3769, lng: 8.5417, zones: 3 }),
  aws({ name: "Israel (Tel Aviv)", code: "il-central-1", location: "Tel Aviv", country: "Israel", continent: "Asien", lat: 32.0853, lng: 34.7818, zones: 3 }),
  aws({ name: "Mexico (Central)", code: "mx-central-1", location: "Querétaro", country: "Mexiko", continent: "Nordamerika", lat: 20.5888, lng: -100.3899, zones: 3 }),
  aws({ name: "Middle East (Bahrain)", code: "me-south-1", location: "Bahrain", country: "Bahrain", continent: "Asien", lat: 26.0667, lng: 50.5577, zones: 3 }),
  aws({ name: "Middle East (UAE)", code: "me-central-1", location: "Vereinigte Arabische Emirate", country: "Vereinigte Arabische Emirate", continent: "Asien", lat: 25.2048, lng: 55.2708, zones: 3 }),
  aws({ name: "South America (São Paulo)", code: "sa-east-1", location: "São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5505, lng: -46.6333, zones: 3 }),
  aws({ name: "China (Beijing)", code: "cn-north-1", location: "Peking", country: "China", continent: "Asien", lat: 39.9042, lng: 116.4074, zones: 3, scope: "sovereign" }),
  aws({ name: "China (Ningxia)", code: "cn-northwest-1", location: "Ningxia", country: "China", continent: "Asien", lat: 38.4872, lng: 106.2309, zones: 3, scope: "sovereign" }),
  aws({ name: "AWS GovCloud (US-East)", code: "us-gov-east-1", location: "Östliche USA", country: "USA", continent: "Nordamerika", lat: 39.9612, lng: -82.9988, zones: 3, scope: "sovereign", restricted: true }),
  aws({ name: "AWS GovCloud (US-West)", code: "us-gov-west-1", location: "Westliche USA", country: "USA", continent: "Nordamerika", lat: 45.8399, lng: -119.7006, zones: 3, scope: "sovereign", restricted: true }),
  aws({ name: "European Sovereign Cloud (Germany)", code: "eusc-de-east-1", location: "Brandenburg", country: "Deutschland", continent: "Europa", lat: 52.4125, lng: 12.5316, zones: 3, scope: "sovereign", source: AWS_EU_SOVEREIGN_SOURCE }),
  aws({ name: "Kingdom of Saudi Arabia", code: null, location: "Riad", country: "Saudi-Arabien", continent: "Asien", lat: 24.7136, lng: 46.6753, status: "planned", source: AWS_INFRA_SOURCE }),
  aws({ name: "Chile", code: null, location: "Santiago", country: "Chile", continent: "Südamerika", lat: -33.4489, lng: -70.6693, status: "planned", source: AWS_INFRA_SOURCE }),
];

export const GCP_REGIONS: CloudRegion[] = [
  gcp({ name: "Johannesburg", code: "africa-south1", location: "Johannesburg", country: "Südafrika", continent: "Afrika", lat: -26.2041, lng: 28.0473, zones: 3 }),
  gcp({ name: "Changhua County", code: "asia-east1", location: "Landkreis Changhua", country: "Taiwan", continent: "Asien", lat: 24.0518, lng: 120.5161, zones: 3 }),
  gcp({ name: "Hong Kong", code: "asia-east2", location: "Hongkong", country: "Hongkong", continent: "Asien", lat: 22.3193, lng: 114.1694, zones: 3 }),
  gcp({ name: "Tokyo", code: "asia-northeast1", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503, zones: 3 }),
  gcp({ name: "Osaka", code: "asia-northeast2", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023, zones: 3 }),
  gcp({ name: "Seoul", code: "asia-northeast3", location: "Seoul", country: "Südkorea", continent: "Asien", lat: 37.5665, lng: 126.978, zones: 3 }),
  gcp({ name: "Mumbai", code: "asia-south1", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777, zones: 3 }),
  gcp({ name: "Delhi", code: "asia-south2", location: "Delhi", country: "Indien", continent: "Asien", lat: 28.6139, lng: 77.209, zones: 3 }),
  gcp({ name: "Singapore", code: "asia-southeast1", location: "Jurong West", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, zones: 3 }),
  gcp({ name: "Jakarta", code: "asia-southeast2", location: "Jakarta", country: "Indonesien", continent: "Asien", lat: -6.2088, lng: 106.8456, zones: 3 }),
  gcp({ name: "Bangkok", code: "asia-southeast3", location: "Bangkok", country: "Thailand", continent: "Asien", lat: 13.7563, lng: 100.5018, zones: 3 }),
  gcp({ name: "Sydney", code: "australia-southeast1", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093, zones: 3 }),
  gcp({ name: "Melbourne", code: "australia-southeast2", location: "Melbourne", country: "Australien", continent: "Ozeanien", lat: -37.8136, lng: 144.9631, zones: 3 }),
  gcp({ name: "Warsaw", code: "europe-central2", location: "Warschau", country: "Polen", continent: "Europa", lat: 52.2297, lng: 21.0122, zones: 3 }),
  gcp({ name: "Hamina", code: "europe-north1", location: "Hamina", country: "Finnland", continent: "Europa", lat: 60.5697, lng: 27.1979, zones: 3 }),
  gcp({ name: "Stockholm", code: "europe-north2", location: "Stockholm", country: "Schweden", continent: "Europa", lat: 59.3293, lng: 18.0686, zones: 3 }),
  gcp({ name: "Madrid", code: "europe-southwest1", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, zones: 3 }),
  gcp({ name: "St. Ghislain", code: "europe-west1", location: "Saint-Ghislain", country: "Belgien", continent: "Europa", lat: 50.4482, lng: 3.8189, zones: 3 }),
  gcp({ name: "London", code: "europe-west2", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5072, lng: -0.1276, zones: 3 }),
  gcp({ name: "Frankfurt", code: "europe-west3", location: "Frankfurt", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821, zones: 3 }),
  gcp({ name: "Eemshaven", code: "europe-west4", location: "Eemshaven", country: "Niederlande", continent: "Europa", lat: 53.4489, lng: 6.8355, zones: 3 }),
  gcp({ name: "Zurich", code: "europe-west6", location: "Zürich", country: "Schweiz", continent: "Europa", lat: 47.3769, lng: 8.5417, zones: 3 }),
  gcp({ name: "Milan", code: "europe-west8", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, zones: 3 }),
  gcp({ name: "Paris", code: "europe-west9", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522, zones: 3 }),
  gcp({ name: "Berlin", code: "europe-west10", location: "Berlin", country: "Deutschland", continent: "Europa", lat: 52.52, lng: 13.405, zones: 3 }),
  gcp({ name: "Turin", code: "europe-west12", location: "Turin", country: "Italien", continent: "Europa", lat: 45.0703, lng: 7.6869, zones: 3 }),
  gcp({ name: "Doha", code: "me-central1", location: "Doha", country: "Katar", continent: "Asien", lat: 25.2854, lng: 51.531, zones: 3 }),
  gcp({ name: "Dammam", code: "me-central2", location: "Dammam", country: "Saudi-Arabien", continent: "Asien", lat: 26.4207, lng: 50.0888, zones: 3 }),
  gcp({ name: "Tel Aviv", code: "me-west1", location: "Tel Aviv", country: "Israel", continent: "Asien", lat: 32.0853, lng: 34.7818, zones: 3 }),
  gcp({ name: "Montreal", code: "northamerica-northeast1", location: "Montreal", country: "Kanada", continent: "Nordamerika", lat: 45.5019, lng: -73.5674, zones: 3 }),
  gcp({ name: "Toronto", code: "northamerica-northeast2", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832, zones: 3 }),
  gcp({ name: "Querétaro", code: "northamerica-south1", location: "Querétaro", country: "Mexiko", continent: "Nordamerika", lat: 20.5888, lng: -100.3899, zones: 3 }),
  gcp({ name: "Council Bluffs", code: "us-central1", location: "Council Bluffs, Iowa", country: "USA", continent: "Nordamerika", lat: 41.2619, lng: -95.8608, zones: 4 }),
  gcp({ name: "Moncks Corner", code: "us-east1", location: "Moncks Corner, South Carolina", country: "USA", continent: "Nordamerika", lat: 33.196, lng: -80.0131, zones: 3 }),
  gcp({ name: "Ashburn", code: "us-east4", location: "Ashburn, Virginia", country: "USA", continent: "Nordamerika", lat: 39.0438, lng: -77.4874, zones: 3 }),
  gcp({ name: "Columbus", code: "us-east5", location: "Columbus, Ohio", country: "USA", continent: "Nordamerika", lat: 39.9612, lng: -82.9988, zones: 3 }),
  gcp({ name: "Dallas", code: "us-south1", location: "Dallas, Texas", country: "USA", continent: "Nordamerika", lat: 32.7767, lng: -96.797, zones: 3 }),
  gcp({ name: "The Dalles", code: "us-west1", location: "The Dalles, Oregon", country: "USA", continent: "Nordamerika", lat: 45.5946, lng: -121.1787, zones: 3 }),
  gcp({ name: "Los Angeles", code: "us-west2", location: "Los Angeles, Kalifornien", country: "USA", continent: "Nordamerika", lat: 34.0522, lng: -118.2437, zones: 3 }),
  gcp({ name: "Salt Lake City", code: "us-west3", location: "Salt Lake City, Utah", country: "USA", continent: "Nordamerika", lat: 40.7608, lng: -111.891, zones: 3 }),
  gcp({ name: "Las Vegas", code: "us-west4", location: "Las Vegas, Nevada", country: "USA", continent: "Nordamerika", lat: 36.1699, lng: -115.1398, zones: 3 }),
  gcp({ name: "São Paulo", code: "southamerica-east1", location: "Osasco, São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5329, lng: -46.7917, zones: 3 }),
  gcp({ name: "Santiago", code: "southamerica-west1", location: "Santiago", country: "Chile", continent: "Südamerika", lat: -33.4489, lng: -70.6693, zones: 3 }),
];

export const CLOUDFLARE_REGIONS: CloudRegion[] = CLOUDFLARE_LOCATION_INPUTS.map(cloudflare);

export const CLOUD_REGIONS: CloudRegion[] = [
  ...AZURE_REGIONS,
  ...AWS_REGIONS,
  ...GCP_REGIONS,
  ...CLOUDFLARE_REGIONS,
];

export const CONTINENTS: Continent[] = [
  "Afrika",
  "Asien",
  "Europa",
  "Nordamerika",
  "Ozeanien",
  "Südamerika",
];
