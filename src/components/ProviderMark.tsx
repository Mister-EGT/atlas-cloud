import awsLogo from "devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg";
import azureLogo from "devicon/icons/azure/azure-original.svg";
import googleCloudLogo from "devicon/icons/googlecloud/googlecloud-original.svg";
import cloudflareLogo from "devicon/icons/cloudflare/cloudflare-original.svg";
import type { ProviderId } from "../data/regions";

const providerLogos: Record<ProviderId, { src?: string; label: string; monogram?: string }> = {
  azure: { src: azureLogo, label: "Microsoft Azure" },
  aws: { src: awsLogo, label: "Amazon Web Services" },
  gcp: { src: googleCloudLogo, label: "Google Cloud" },
  cloudflare: { src: cloudflareLogo, label: "Cloudflare" },
  proton: { label: "Proton", monogram: "P" },
};

export function ProviderMark({ provider, compact = false }: { provider: ProviderId; compact?: boolean }) {
  const logo = providerLogos[provider];
  return (
    <span className={`provider-mark provider-mark--${provider} ${compact ? "is-compact" : ""}`} aria-hidden="true">
      {logo.src
        ? <img src={logo.src} alt={logo.label} />
        : <span className="provider-mark__monogram" aria-label={logo.label}>{logo.monogram}</span>}
    </span>
  );
}
