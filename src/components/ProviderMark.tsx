import type { ProviderId } from "../data/regions";

export function ProviderMark({ provider, compact = false }: { provider: ProviderId; compact?: boolean }) {
  if (provider === "azure") {
    return (
      <span className={`provider-mark provider-mark--azure ${compact ? "is-compact" : ""}`} aria-hidden="true">
        A
      </span>
    );
  }

  if (provider === "aws") {
    return (
      <span className={`provider-mark provider-mark--aws ${compact ? "is-compact" : ""}`} aria-hidden="true">
        <span>aws</span>
        <i />
      </span>
    );
  }

  return (
    <span className={`provider-mark provider-mark--gcp ${compact ? "is-compact" : ""}`} aria-hidden="true">
      G
    </span>
  );
}
