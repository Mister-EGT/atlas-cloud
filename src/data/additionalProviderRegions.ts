import type { CloudRegion, Continent, ProviderId } from "./regions";

type AdditionalRegionInput = {
  code: string;
  name: string;
  location: string;
  country: string;
  continent: Continent;
  lat: number;
  lng: number;
  zones?: number;
  locationType?: CloudRegion["locationType"];
  networkRegion?: string;
  restricted?: boolean;
  resilience?: string;
};

type ProviderDefaults = Pick<
  CloudRegion,
  "source" | "sourceLabel" | "infrastructureModel" | "serviceCoverage" | "coordinateAccuracy"
>;

const SOURCES = {
  hetzner: "https://docs.hetzner.com/cloud/general/locations/",
  ovhcloud: "https://www.ovhcloud.com/en/about-us/global-infrastructure/regions/",
  oracle: "https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm",
  ibm: "https://cloud.ibm.com/docs/vpc?topic=vpc-creating-a-vpc-in-a-different-region",
  digitalocean: "https://docs.digitalocean.com/platform/regional-availability/",
  akamai: "https://www.akamai.com/why-akamai/global-infrastructure/availability",
} as const;

const DEFAULTS: Record<Exclude<ProviderId, "azure" | "aws" | "gcp" | "cloudflare" | "proton">, ProviderDefaults> = {
  hetzner: {
    source: SOURCES.hetzner,
    sourceLabel: "Hetzner Cloud Locations",
    infrastructureModel: "Hetzner-eigene Rechenzentren in Europa, Colocation in den USA und Singapur",
    serviceCoverage: "Cloud Server, Volumes, Netzwerke, Load Balancer und Object Storage je nach Standort",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
  ovhcloud: {
    source: SOURCES.ovhcloud,
    sourceLabel: "OVHcloud Global Infrastructure",
    infrastructureModel: "OVHcloud Public Cloud mit Regionen, 3-AZ-Regionen und latenznahen Local Zones",
    serviceCoverage: "Compute, Speicher, Datenbanken, Netzwerk und Managed Services je nach Standorttyp",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
  oracle: {
    source: SOURCES.oracle,
    sourceLabel: "Oracle Cloud Infrastructure Regions",
    infrastructureModel: "Oracle Cloud Infrastructure in kommerziellen Public-Cloud-Regionen",
    serviceCoverage: "Compute, Storage, Datenbanken, Netzwerk und OCI-Plattformdienste",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
  ibm: {
    source: SOURCES.ibm,
    sourceLabel: "IBM Cloud VPC Regions",
    infrastructureModel: "IBM Cloud VPC in Multi-Zone Regions",
    serviceCoverage: "VPC Compute, Block- und Object Storage, Netzwerk sowie IBM Cloud Services",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
  digitalocean: {
    source: SOURCES.digitalocean,
    sourceLabel: "DigitalOcean Regional Availability",
    infrastructureModel: "DigitalOcean-Rechenzentren innerhalb regionaler Cloud-Standorte",
    serviceCoverage: "Droplets, Kubernetes, Datenbanken, Spaces und weitere Dienste je nach Rechenzentrum",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
  akamai: {
    source: SOURCES.akamai,
    sourceLabel: "Akamai Cloud Computing Regions",
    infrastructureModel: "Akamai Connected Cloud, vormals Linode, mit globalen Compute-Regionen",
    serviceCoverage: "Compute, Kubernetes, Storage, Datenbanken und Netzwerkdienste je nach Region",
    coordinateAccuracy: "Stadtmittelpunkt, keine Gebäudeadresse",
  },
};

function makeAdditionalRegion(
  provider: keyof typeof DEFAULTS,
  input: AdditionalRegionInput,
): CloudRegion {
  const defaults = DEFAULTS[provider];
  return {
    id: `${provider}-${input.code.toLowerCase()}`,
    provider,
    status: "active",
    scope: "standard",
    locationType: "cloud-region",
    availabilityZones: Boolean(input.zones),
    ...defaults,
    ...input,
  };
}

const createRegions = (provider: keyof typeof DEFAULTS, regions: AdditionalRegionInput[]) =>
  regions.map((region) => makeAdditionalRegion(provider, region));

export const HETZNER_REGIONS = createRegions("hetzner", [
  { code: "fsn1", name: "Falkenstein", location: "Falkenstein", country: "Deutschland", continent: "Europa", lat: 50.4779, lng: 12.3713, networkRegion: "eu-central" },
  { code: "nbg1", name: "Nürnberg", location: "Nürnberg", country: "Deutschland", continent: "Europa", lat: 49.4521, lng: 11.0767, networkRegion: "eu-central" },
  { code: "hel1", name: "Helsinki", location: "Helsinki", country: "Finnland", continent: "Europa", lat: 60.1699, lng: 24.9384, networkRegion: "eu-central" },
  { code: "ash", name: "Ashburn", location: "Ashburn, Virginia", country: "USA", continent: "Nordamerika", lat: 39.0438, lng: -77.4874, networkRegion: "us-east" },
  { code: "hil", name: "Hillsboro", location: "Hillsboro, Oregon", country: "USA", continent: "Nordamerika", lat: 45.5229, lng: -122.9898, networkRegion: "us-west" },
  { code: "sin", name: "Singapur", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, networkRegion: "ap-southeast" },
]);

export const OVHCLOUD_REGIONS = createRegions("ovhcloud", [
  { code: "SBG", name: "Strasbourg", location: "Straßburg", country: "Frankreich", continent: "Europa", lat: 48.5734, lng: 7.7521 },
  { code: "GRA", name: "Gravelines", location: "Gravelines", country: "Frankreich", continent: "Europa", lat: 50.9871, lng: 2.1255 },
  { code: "RBX", name: "Roubaix", location: "Roubaix", country: "Frankreich", continent: "Europa", lat: 50.6927, lng: 3.1778 },
  { code: "PAR", name: "Paris 3-AZ", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522, zones: 3 },
  { code: "MIL", name: "Mailand 3-AZ", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, zones: 3 },
  { code: "ERI", name: "London", location: "Erith, London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.4839, lng: 0.1749 },
  { code: "LIM", name: "Frankfurt", location: "Limburg an der Lahn", country: "Deutschland", continent: "Europa", lat: 50.3986, lng: 8.0796 },
  { code: "WAW", name: "Warschau", location: "Warschau", country: "Polen", continent: "Europa", lat: 52.2297, lng: 21.0122 },
  { code: "BHS", name: "Montréal", location: "Beauharnois, Québec", country: "Kanada", continent: "Nordamerika", lat: 45.3151, lng: -73.8779 },
  { code: "TOR", name: "Toronto", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832 },
  { code: "HIL", name: "Seattle", location: "Hillsboro, Oregon", country: "USA", continent: "Nordamerika", lat: 45.5229, lng: -122.9898 },
  { code: "VIN", name: "Washington, D.C.", location: "Vint Hill, Virginia", country: "USA", continent: "Nordamerika", lat: 38.7598, lng: -77.6747 },
  { code: "SGP", name: "Singapur", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198 },
  { code: "SYD", name: "Sydney", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093 },
  { code: "MUM", name: "Mumbai", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777 },
  { code: "eu-west-lz-vie", name: "Vienna Local Zone", location: "Wien", country: "Österreich", continent: "Europa", lat: 48.2082, lng: 16.3738, locationType: "local-zone" },
  { code: "eu-west-lz-bru", name: "Brussels Local Zone", location: "Brüssel", country: "Belgien", continent: "Europa", lat: 50.8503, lng: 4.3517, locationType: "local-zone" },
  { code: "eu-central-lz-sof", name: "Sofia Local Zone", location: "Sofia", country: "Bulgarien", continent: "Europa", lat: 42.6977, lng: 23.3219, locationType: "local-zone" },
  { code: "eu-central-lz-prg", name: "Prague Local Zone", location: "Prag", country: "Tschechien", continent: "Europa", lat: 50.0755, lng: 14.4378, locationType: "local-zone" },
  { code: "eu-north-lz-cph", name: "Copenhagen Local Zone", location: "Kopenhagen", country: "Dänemark", continent: "Europa", lat: 55.6761, lng: 12.5683, locationType: "local-zone" },
  { code: "eu-north-lz-hel", name: "Helsinki Local Zone", location: "Helsinki", country: "Finnland", continent: "Europa", lat: 60.1699, lng: 24.9384, locationType: "local-zone" },
  { code: "eu-west-lz-mrs", name: "Marseille Local Zone", location: "Marseille", country: "Frankreich", continent: "Europa", lat: 43.2965, lng: 5.3698, locationType: "local-zone" },
  { code: "eu-west-lz-dln", name: "Dublin Local Zone", location: "Dublin", country: "Irland", continent: "Europa", lat: 53.3498, lng: -6.2603, locationType: "local-zone" },
  { code: "eu-south-lz-mil", name: "Milan Local Zone", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, locationType: "local-zone" },
  { code: "eu-west-lz-lux", name: "Luxembourg Local Zone", location: "Luxemburg", country: "Luxemburg", continent: "Europa", lat: 49.6116, lng: 6.1319, locationType: "local-zone" },
  { code: "eu-west-lz-ams", name: "Amsterdam Local Zone", location: "Amsterdam", country: "Niederlande", continent: "Europa", lat: 52.3676, lng: 4.9041, locationType: "local-zone" },
  { code: "eu-north-lz-osl", name: "Oslo Local Zone", location: "Oslo", country: "Norwegen", continent: "Europa", lat: 59.9139, lng: 10.7522, locationType: "local-zone" },
  { code: "eu-south-lz-lis", name: "Lisbon Local Zone", location: "Lissabon", country: "Portugal", continent: "Europa", lat: 38.7223, lng: -9.1393, locationType: "local-zone" },
  { code: "eu-central-lz-buh", name: "Bucharest Local Zone", location: "Bukarest", country: "Rumänien", continent: "Europa", lat: 44.4268, lng: 26.1025, locationType: "local-zone" },
  { code: "eu-south-lz-mad", name: "Madrid Local Zone", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, locationType: "local-zone" },
  { code: "eu-north-lz-sto", name: "Stockholm Local Zone", location: "Stockholm", country: "Schweden", continent: "Europa", lat: 59.3293, lng: 18.0686, locationType: "local-zone" },
  { code: "eu-west-lz-zrh", name: "Zurich Local Zone", location: "Zürich", country: "Schweiz", continent: "Europa", lat: 47.3769, lng: 8.5417, locationType: "local-zone" },
  { code: "eu-west-lz-mnc", name: "Manchester Local Zone", location: "Manchester", country: "Vereinigtes Königreich", continent: "Europa", lat: 53.4808, lng: -2.2426, locationType: "local-zone" },
]);

export const ORACLE_REGIONS = createRegions("oracle", [
  { code: "ap-sydney-1", name: "Australia East", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093, zones: 1 },
  { code: "ap-melbourne-1", name: "Australia Southeast", location: "Melbourne", country: "Australien", continent: "Ozeanien", lat: -37.8136, lng: 144.9631, zones: 1 },
  { code: "sa-saopaulo-1", name: "Brazil East", location: "São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5505, lng: -46.6333, zones: 1 },
  { code: "sa-vinhedo-1", name: "Brazil Southeast", location: "Vinhedo", country: "Brasilien", continent: "Südamerika", lat: -23.0302, lng: -46.9833, zones: 1 },
  { code: "ca-montreal-1", name: "Canada Southeast", location: "Montréal", country: "Kanada", continent: "Nordamerika", lat: 45.5019, lng: -73.5674, zones: 1 },
  { code: "ca-toronto-1", name: "Canada Southeast 2", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832, zones: 1 },
  { code: "sa-santiago-1", name: "Chile Central", location: "Santiago", country: "Chile", continent: "Südamerika", lat: -33.4489, lng: -70.6693, zones: 1 },
  { code: "sa-valparaiso-1", name: "Chile West", location: "Valparaíso", country: "Chile", continent: "Südamerika", lat: -33.0472, lng: -71.6127, zones: 1 },
  { code: "sa-bogota-1", name: "Colombia Central", location: "Bogotá", country: "Kolumbien", continent: "Südamerika", lat: 4.711, lng: -74.0721, zones: 1 },
  { code: "eu-paris-1", name: "France Central", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522, zones: 1 },
  { code: "eu-marseille-1", name: "France South", location: "Marseille", country: "Frankreich", continent: "Europa", lat: 43.2965, lng: 5.3698, zones: 1 },
  { code: "eu-frankfurt-1", name: "Germany Central", location: "Frankfurt am Main", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821, zones: 3 },
  { code: "ap-hyderabad-1", name: "India South", location: "Hyderabad", country: "Indien", continent: "Asien", lat: 17.385, lng: 78.4867, zones: 1 },
  { code: "ap-mumbai-1", name: "India West", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777, zones: 1 },
  { code: "ap-batam-1", name: "Indonesia West", location: "Batam", country: "Indonesien", continent: "Asien", lat: 1.1301, lng: 104.0529, zones: 1 },
  { code: "il-jerusalem-1", name: "Israel Central", location: "Jerusalem", country: "Israel", continent: "Asien", lat: 31.7683, lng: 35.2137, zones: 1 },
  { code: "eu-milan-1", name: "Italy Northwest", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19, zones: 1 },
  { code: "eu-turin-1", name: "Italy North", location: "Turin", country: "Italien", continent: "Europa", lat: 45.0703, lng: 7.6869, zones: 1 },
  { code: "ap-osaka-1", name: "Japan Central", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023, zones: 1 },
  { code: "ap-tokyo-1", name: "Japan East", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503, zones: 1 },
  { code: "ap-kulai-2", name: "Malaysia West", location: "Kulai", country: "Malaysia", continent: "Asien", lat: 1.6561, lng: 103.6032, zones: 1 },
  { code: "mx-queretaro-1", name: "Mexico Central", location: "Querétaro", country: "Mexiko", continent: "Nordamerika", lat: 20.5888, lng: -100.3899, zones: 1 },
  { code: "mx-monterrey-1", name: "Mexico Northeast", location: "Monterrey", country: "Mexiko", continent: "Nordamerika", lat: 25.6866, lng: -100.3161, zones: 1 },
  { code: "af-casablanca-1", name: "Morocco Central", location: "Casablanca", country: "Marokko", continent: "Afrika", lat: 33.5731, lng: -7.5898, zones: 1 },
  { code: "eu-amsterdam-1", name: "Netherlands Northwest", location: "Amsterdam", country: "Niederlande", continent: "Europa", lat: 52.3676, lng: 4.9041, zones: 1 },
  { code: "me-riyadh-1", name: "Saudi Arabia Central", location: "Riad", country: "Saudi-Arabien", continent: "Asien", lat: 24.7136, lng: 46.6753, zones: 1 },
  { code: "me-jeddah-1", name: "Saudi Arabia West", location: "Dschidda", country: "Saudi-Arabien", continent: "Asien", lat: 21.4858, lng: 39.1925, zones: 1 },
  { code: "eu-jovanovac-1", name: "Serbia Central", location: "Jovanovac", country: "Serbien", continent: "Europa", lat: 44.446, lng: 20.908, zones: 1 },
  { code: "ap-singapore-1", name: "Singapore", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, zones: 1 },
  { code: "ap-singapore-2", name: "Singapore West", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198, zones: 1 },
  { code: "af-johannesburg-1", name: "South Africa Central", location: "Johannesburg", country: "Südafrika", continent: "Afrika", lat: -26.2041, lng: 28.0473, zones: 1 },
  { code: "ap-seoul-1", name: "South Korea Central", location: "Seoul", country: "Südkorea", continent: "Asien", lat: 37.5665, lng: 126.978, zones: 1 },
  { code: "ap-chuncheon-1", name: "South Korea North", location: "Chuncheon", country: "Südkorea", continent: "Asien", lat: 37.8813, lng: 127.73, zones: 1 },
  { code: "eu-madrid-1", name: "Spain Central", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, zones: 1 },
  { code: "eu-madrid-3", name: "Spain Central 3", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, zones: 1 },
  { code: "eu-stockholm-1", name: "Sweden Central", location: "Stockholm", country: "Schweden", continent: "Europa", lat: 59.3293, lng: 18.0686, zones: 1 },
  { code: "eu-zurich-1", name: "Switzerland North", location: "Zürich", country: "Schweiz", continent: "Europa", lat: 47.3769, lng: 8.5417, zones: 1 },
  { code: "me-abudhabi-1", name: "UAE Central", location: "Abu Dhabi", country: "Vereinigte Arabische Emirate", continent: "Asien", lat: 24.4539, lng: 54.3773, zones: 1 },
  { code: "me-dubai-1", name: "UAE East", location: "Dubai", country: "Vereinigte Arabische Emirate", continent: "Asien", lat: 25.2048, lng: 55.2708, zones: 1 },
  { code: "uk-london-1", name: "UK South", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5074, lng: -0.1278, zones: 3 },
  { code: "uk-cardiff-1", name: "UK West", location: "Newport", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5842, lng: -2.9977, zones: 1 },
  { code: "us-ashburn-1", name: "US East", location: "Ashburn, Virginia", country: "USA", continent: "Nordamerika", lat: 39.0438, lng: -77.4874, zones: 3 },
  { code: "us-chicago-1", name: "US Midwest", location: "Chicago", country: "USA", continent: "Nordamerika", lat: 41.8781, lng: -87.6298, zones: 3 },
  { code: "us-phoenix-1", name: "US West", location: "Phoenix", country: "USA", continent: "Nordamerika", lat: 33.4484, lng: -112.074, zones: 3 },
  { code: "us-sanjose-1", name: "US West 2", location: "San José", country: "USA", continent: "Nordamerika", lat: 37.3382, lng: -121.8863, zones: 1 },
]);

export const IBM_REGIONS = createRegions("ibm", [
  { code: "us-south", name: "US South", location: "Dallas", country: "USA", continent: "Nordamerika", lat: 32.7767, lng: -96.797, zones: 3 },
  { code: "us-east", name: "US East", location: "Washington, D.C.", country: "USA", continent: "Nordamerika", lat: 38.9072, lng: -77.0369, zones: 3 },
  { code: "br-sao", name: "Brazil", location: "São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5505, lng: -46.6333, zones: 3 },
  { code: "ca-tor", name: "Toronto", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832, zones: 3 },
  { code: "ca-mon", name: "Montréal", location: "Montréal", country: "Kanada", continent: "Nordamerika", lat: 45.5019, lng: -73.5674, zones: 3 },
  { code: "eu-gb", name: "London", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5074, lng: -0.1278, zones: 3 },
  { code: "eu-de", name: "Frankfurt", location: "Frankfurt am Main", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821, zones: 3 },
  { code: "eu-es", name: "Madrid", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, zones: 3 },
  { code: "in-che", name: "Chennai", location: "Chennai", country: "Indien", continent: "Asien", lat: 13.0827, lng: 80.2707, zones: 3 },
  { code: "in-mum", name: "Mumbai", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777, zones: 3 },
  { code: "jp-tok", name: "Tokyo", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503, zones: 3 },
  { code: "jp-osa", name: "Osaka", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023, zones: 3 },
  { code: "au-syd", name: "Sydney", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093, zones: 3 },
]);

export const DIGITALOCEAN_REGIONS = createRegions("digitalocean", [
  { code: "NYC1", name: "New York 1", location: "New York City", country: "USA", continent: "Nordamerika", lat: 40.7128, lng: -74.006 },
  { code: "NYC2", name: "New York 2", location: "New York City", country: "USA", continent: "Nordamerika", lat: 40.7128, lng: -74.006 },
  { code: "NYC3", name: "New York 3", location: "New York City", country: "USA", continent: "Nordamerika", lat: 40.7128, lng: -74.006 },
  { code: "AMS3", name: "Amsterdam 3", location: "Amsterdam", country: "Niederlande", continent: "Europa", lat: 52.3676, lng: 4.9041 },
  { code: "SFO2", name: "San Francisco 2", location: "San Francisco", country: "USA", continent: "Nordamerika", lat: 37.7749, lng: -122.4194 },
  { code: "SFO3", name: "San Francisco 3", location: "San Francisco", country: "USA", continent: "Nordamerika", lat: 37.7749, lng: -122.4194 },
  { code: "SGP1", name: "Singapore 1", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198 },
  { code: "LON1", name: "London 1", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5074, lng: -0.1278 },
  { code: "FRA1", name: "Frankfurt 1", location: "Frankfurt am Main", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821 },
  { code: "TOR1", name: "Toronto 1", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832 },
  { code: "BLR1", name: "Bangalore 1", location: "Bengaluru", country: "Indien", continent: "Asien", lat: 12.9716, lng: 77.5946 },
  { code: "SYD1", name: "Sydney 1", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093 },
  { code: "ATL1", name: "Atlanta 1", location: "Atlanta", country: "USA", continent: "Nordamerika", lat: 33.749, lng: -84.388 },
  { code: "RIC1", name: "Richmond 1", location: "Richmond, Virginia", country: "USA", continent: "Nordamerika", lat: 37.5407, lng: -77.436 },
  { code: "MKC1", name: "Kansas City 1", location: "Kansas City, Missouri", country: "USA", continent: "Nordamerika", lat: 39.0997, lng: -94.5786 },
  { code: "MEM1", name: "Memphis 1", location: "Memphis, Tennessee", country: "USA", continent: "Nordamerika", lat: 35.1495, lng: -90.049 },
]);

export const AKAMAI_REGIONS = createRegions("akamai", [
  { code: "us-southeast", name: "Atlanta", location: "Atlanta", country: "USA", continent: "Nordamerika", lat: 33.749, lng: -84.388 },
  { code: "us-ord", name: "Chicago", location: "Chicago", country: "USA", continent: "Nordamerika", lat: 41.8781, lng: -87.6298 },
  { code: "us-central", name: "Dallas", location: "Dallas", country: "USA", continent: "Nordamerika", lat: 32.7767, lng: -96.797 },
  { code: "us-west", name: "Fremont", location: "Fremont, Kalifornien", country: "USA", continent: "Nordamerika", lat: 37.5485, lng: -121.9886 },
  { code: "us-lax", name: "Los Angeles", location: "Los Angeles", country: "USA", continent: "Nordamerika", lat: 34.0522, lng: -118.2437 },
  { code: "us-mia", name: "Miami", location: "Miami", country: "USA", continent: "Nordamerika", lat: 25.7617, lng: -80.1918 },
  { code: "us-east", name: "Newark", location: "Newark, New Jersey", country: "USA", continent: "Nordamerika", lat: 40.7357, lng: -74.1724 },
  { code: "us-sea", name: "Seattle", location: "Seattle", country: "USA", continent: "Nordamerika", lat: 47.6062, lng: -122.3321 },
  { code: "us-iad", name: "Washington, D.C.", location: "Washington, D.C.", country: "USA", continent: "Nordamerika", lat: 38.9072, lng: -77.0369, restricted: true },
  { code: "ca-central", name: "Toronto", location: "Toronto", country: "Kanada", continent: "Nordamerika", lat: 43.6532, lng: -79.3832 },
  { code: "se-sto", name: "Stockholm", location: "Stockholm", country: "Schweden", continent: "Europa", lat: 59.3293, lng: 18.0686 },
  { code: "nl-ams", name: "Amsterdam", location: "Amsterdam", country: "Niederlande", continent: "Europa", lat: 52.3676, lng: 4.9041 },
  { code: "it-mil", name: "Milan", location: "Mailand", country: "Italien", continent: "Europa", lat: 45.4642, lng: 9.19 },
  { code: "eu-west", name: "London", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5074, lng: -0.1278, restricted: true },
  { code: "gb-lon", name: "London Expansion", location: "London", country: "Vereinigtes Königreich", continent: "Europa", lat: 51.5074, lng: -0.1278 },
  { code: "fr-par", name: "Paris", location: "Paris", country: "Frankreich", continent: "Europa", lat: 48.8566, lng: 2.3522 },
  { code: "es-mad", name: "Madrid", location: "Madrid", country: "Spanien", continent: "Europa", lat: 40.4168, lng: -3.7038, restricted: true },
  { code: "eu-central", name: "Frankfurt", location: "Frankfurt am Main", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821 },
  { code: "de-fra-2", name: "Frankfurt Expansion", location: "Frankfurt am Main", country: "Deutschland", continent: "Europa", lat: 50.1109, lng: 8.6821 },
  { code: "ap-south", name: "Singapore", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198 },
  { code: "sg-sin-2", name: "Singapore Expansion", location: "Singapur", country: "Singapur", continent: "Asien", lat: 1.3521, lng: 103.8198 },
  { code: "jp-osa", name: "Osaka", location: "Osaka", country: "Japan", continent: "Asien", lat: 34.6937, lng: 135.5023 },
  { code: "ap-northeast", name: "Tokyo", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503 },
  { code: "jp-tyo-3", name: "Tokyo Expansion", location: "Tokio", country: "Japan", continent: "Asien", lat: 35.6762, lng: 139.6503 },
  { code: "in-maa", name: "Chennai", location: "Chennai", country: "Indien", continent: "Asien", lat: 13.0827, lng: 80.2707 },
  { code: "ap-west", name: "Mumbai", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777 },
  { code: "in-bom-2", name: "Mumbai Expansion", location: "Mumbai", country: "Indien", continent: "Asien", lat: 19.076, lng: 72.8777 },
  { code: "id-cgk", name: "Jakarta", location: "Jakarta", country: "Indonesien", continent: "Asien", lat: -6.2088, lng: 106.8456, restricted: true },
  { code: "br-gru", name: "São Paulo", location: "São Paulo", country: "Brasilien", continent: "Südamerika", lat: -23.5505, lng: -46.6333 },
  { code: "au-mel", name: "Melbourne", location: "Melbourne", country: "Australien", continent: "Ozeanien", lat: -37.8136, lng: 144.9631, restricted: true },
  { code: "ap-southeast", name: "Sydney", location: "Sydney", country: "Australien", continent: "Ozeanien", lat: -33.8688, lng: 151.2093 },
]);
