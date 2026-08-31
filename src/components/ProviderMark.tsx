import awsLogo from "devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg";
import azureLogo from "devicon/icons/azure/azure-original.svg";
import googleCloudLogo from "devicon/icons/googlecloud/googlecloud-original.svg";
import cloudflareLogo from "devicon/icons/cloudflare/cloudflare-original.svg";
import digitaloceanLogo from "devicon/icons/digitalocean/digitalocean-original.svg";
import protonLogo from "../assets/proton-logo.svg";
import oracleLogo from "devicon/icons/oracle/oracle-original.svg";
import akamaiLogo from "../assets/akamai-logo.svg";
import hetznerLogo from "../assets/hetzner-logo.svg";
import ibmLogo from "../assets/ibm-logo.svg";
import ovhcloudLogo from "../assets/ovhcloud-logo.svg";
import type { ProviderId } from "../data/regions";

const providerLogos: Record<ProviderId, { src: string; label: string }> = {
  azure: { src: azureLogo, label: "Microsoft Azure" },
  aws: { src: awsLogo, label: "Amazon Web Services" },
  gcp: { src: googleCloudLogo, label: "Google Cloud" },
  cloudflare: { src: cloudflareLogo, label: "Cloudflare" },
  proton: { src: protonLogo, label: "Proton" },
  hetzner: { src: hetznerLogo, label: "Hetzner" },
  ovhcloud: { src: ovhcloudLogo, label: "OVHcloud" },
  oracle: { src: oracleLogo, label: "Oracle Cloud" },
  ibm: { src: ibmLogo, label: "IBM Cloud" },
  digitalocean: { src: digitaloceanLogo, label: "DigitalOcean" },
  akamai: { src: akamaiLogo, label: "Akamai Cloud" },
};

export function ProviderMark({ provider, compact = false }: { provider: ProviderId; compact?: boolean }) {
  const logo = providerLogos[provider];
  return (
    <span className={`provider-mark provider-mark--${provider} ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <img src={logo.src} alt={logo.label} />
    </span>
  );
}
