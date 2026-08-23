import type { ReactNode } from "react";

export function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel__title-row">
        <h2>{title}</h2>
      </div>
      <div className="panel__inset">{children}</div>
    </section>
  );
}
