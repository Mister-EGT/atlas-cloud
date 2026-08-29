# Atlas Cloud

Atlas Cloud ist eine lokale, interaktive Web App zur Erkundung der veröffentlichten Cloud-Regionen von Microsoft Azure, Amazon Web Services und Google Cloud, der Edge-Rechenzentren von Cloudflare sowie der veröffentlichten Proton-Rechenzentren. Im Zentrum steht ein frei dreh- und zoombarer 3D-Globus. Marker zeigen Details beim Überfahren und laden beim Anklicken die vollständige Standortansicht.

## Funktionsumfang

- 496 recherchierte Einträge, davon 494 aktive und 2 angekündigte Standorte
- Azure: 68 Einträge aus Public Cloud, China, Government und DoD
- AWS: 41 Einträge, davon 39 aktiv und 2 angekündigt
- Google Cloud: 43 aktive Regionen
- Cloudflare: 341 einzeln im offiziellen Statussystem geführte Edge-Rechenzentren
- Proton: 3 offiziell belegte Infrastrukturstandorte in der Schweiz, Deutschland und Norwegen
- Suche nach Region, Standort, Land oder Regionscode
- Filter nach Anbieter, Status und Kontinent
- Gruppierbare Marker, automatische Rotation und Atmosphäre
- Automatische 2D-Kompatibilitätsansicht, wenn WebGL nicht verfügbar ist
- Anbieterkennzeichnung für Azure, AWS, Google Cloud, Cloudflare und Proton
- Detailansicht mit Standortart, Cloud-Umgebung, Betriebsmodell, Leistungsumfang, Ausfallschutz, Regions- oder Colo-Code, Zonen, Zugriff, Netzwerkregion, Standortoffenlegung, Koordinatengenauigkeit und offizieller Quelle
- Responsive Oberfläche für Desktop, Tablet und Mobilgeräte
- Vollständig lokaler Betrieb ohne API-Schlüssel oder externes Backend

## Datenabdeckung

Cloud-Anbieter veröffentlichen in der Regel Regionen und Metropolstandorte, aber aus Sicherheitsgründen keine vollständigen Listen einzelner Gebäudeadressen. Atlas Cloud visualisiert deshalb die offiziellen Cloud-Regionen sowie die im Cloudflare-Statussystem einzeln geführten Edge-Rechenzentren. Die Marker verwenden Stadt-, Flughafen-, Bundesstaats- oder Metropolmittelpunkte und sind nicht als exakte Gebäudeadresse zu verstehen.

Cloudflare nennt auf seiner Netzwerkseite 348 Städte. Das öffentliche Statussystem weist davon aktuell 341 Standorte mit eindeutigem dreistelligem Colo-Code und Kontinentzuordnung einzeln aus. Nur diese einzeln belegbaren Standorte werden als Pins dargestellt. Cloudflare-Standorte sind Edge-Rechenzentren im globalen Anycast-Netzwerk und keine klassischen Public-Cloud-Regionen.

Proton bestätigt eigene Server- und Netzwerkinfrastruktur in der Schweiz, Deutschland und Norwegen. Zürich ist als primäres Rechenzentrum und Frankfurt als weiterer Standort veröffentlicht. Für Norwegen nennt Proton keinen konkreten Ort, daher verwendet dieser Pin ausdrücklich gekennzeichnet den Landesmittelpunkt. Globale Proton-VPN-Ausgangsserver werden nicht als Proton-Rechenzentren gezählt.

Souveräne und eingeschränkte Partitionen werden als eigene Einträge geführt. Dazu gehören Azure China, Azure Government, Azure DoD und die AWS European Sovereign Cloud. Die zwei angekündigten AWS Regionen in Saudi-Arabien und Chile sind als geplant markiert.

Datenstand: 29. August 2026.

## Offizielle Quellen

- [Azure Public Regions](https://learn.microsoft.com/azure/reliability/regions-list)
- [Azure China Regions](https://learn.microsoft.com/azure/china/overview-regions)
- [Azure Government](https://learn.microsoft.com/azure/azure-government/documentation-government-welcome)
- [Azure Government DoD](https://learn.microsoft.com/azure/azure-government/documentation-government-overview-dod)
- [AWS Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [AWS Region Codes](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- [AWS European Sovereign Cloud](https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/)
- [Google Cloud Locations](https://cloud.google.com/about/locations)
- [Cloudflare Global Network](https://www.cloudflare.com/network/)
- [Cloudflare System Status](https://www.cloudflarestatus.com/)
- [Proton: Technologische Unabhängigkeit](https://proton.me/blog/sustaining-mission-over-time)
- [Proton: Primäres Rechenzentrum Zürich](https://proton.me/support/who-owns-protonmail)
- [Proton: Rechenzentrum Frankfurt](https://proton.me/blog/crv-investment-other-news)

## Lokal starten

Voraussetzung ist Node.js 20 oder neuer.

```bash
npm install
npm run dev
```

Vite zeigt anschließend die lokale URL im Terminal an.

## Qualität prüfen

```bash
npm test
npm run build
```

Die Datentests prüfen Anbieterzählungen, eindeutige IDs, gültige Koordinaten, geplante Regionen, souveräne Partitionen, die veröffentlichte AWS-Zonensumme sowie Standortart und Colo-Codes der Cloudflare-Rechenzentren.

Der 3D-Globus wird als eigener JavaScript-Chunk erst bei WebGL-Unterstützung geladen. Dadurch bleibt die erste Übertragung klein und Browser ohne WebGL laden ausschließlich die 2D-Kompatibilitätsansicht.

## Technologie

- React 19 und TypeScript
- Vite
- Three.js und react-globe.gl
- World Atlas und TopoJSON
- Vitest

## Lizenz

MIT
