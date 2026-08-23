import { feature } from "topojson-client";
import countries from "world-atlas/countries-110m.json";

const topology = countries as unknown as Parameters<typeof feature>[0];
const topologyObject = countries.objects.countries as unknown as Parameters<typeof feature>[1];

export const countryFeatures = (feature(topology, topologyObject) as { features: object[] }).features;
export const countryFeatureCollection = feature(topology, topologyObject);
