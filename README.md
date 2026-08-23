# Atlas Cloud

Atlas Cloud ist eine lokale, interaktive Web App zur Erkundung der veröffentlichten Cloud-Regionen von Microsoft Azure, Amazon Web Services und Google Cloud. Im Zentrum steht ein frei dreh- und zoombarer 3D-Globus. Marker zeigen Details beim Überfahren und laden beim Anklicken die vollständige Regionsansicht.

## Funktionsumfang

- 152 recherchierte Einträge, davon 150 aktive und 2 angekündigte Regionen
- Azure: 68 Einträge aus Public Cloud, China, Government und DoD
- AWS: 41 Einträge, davon 39 aktiv und 2 angekündigt
- Google Cloud: 43 aktive Regionen
- Suche nach Region, Standort, Land oder Regionscode
- Filter nach Anbieter, Status und Kontinent
- Gruppierbare Marker, automatische Rotation und Atmosphäre
- Detailansicht mit Regionscode, Zonen, gekoppelter Region, Koordinaten und offizieller Quelle
- Responsive Oberfläche für Desktop, Tablet und Mobilgeräte
- Vollständig lokaler Betrieb ohne API-Schlüssel oder externes Backend

## Datenabdeckung

Cloud-Anbieter veröffentlichen in der Regel Regionen und Metropolstandorte, aber aus Sicherheitsgründen keine vollständigen Listen einzelner Gebäudeadressen. Atlas Cloud visualisiert deshalb die offiziellen Cloud-Regionen. Die Marker verwenden den Mittelpunkt des veröffentlichten Ortes, Bundesstaats oder der Metropolregion und sind nicht als exakte Gebäudeadresse zu verstehen.

Souveräne und eingeschränkte Partitionen werden als eigene Einträge geführt. Dazu gehören Azure China, Azure Government, Azure DoD und die AWS European Sovereign Cloud. Die zwei angekündigten AWS Regionen in Saudi-Arabien und Chile sind als geplant markiert.

Datenstand: 23. August 2026.

## Offizielle Quellen

- [Azure Public Regions](https://learn.microsoft.com/azure/reliability/regions-list)
- [Azure China Regions](https://learn.microsoft.com/azure/china/overview-regions)
- [Azure Government](https://learn.microsoft.com/azure/azure-government/documentation-government-welcome)
- [Azure Government DoD](https://learn.microsoft.com/azure/azure-government/documentation-government-overview-dod)
- [AWS Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [AWS Region Codes](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)
- [AWS European Sovereign Cloud](https://aws.amazon.com/blogs/aws/opening-the-aws-european-sovereign-cloud/)
- [Google Cloud Locations](https://cloud.google.com/about/locations)

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
npm run qa:visual
```

Die Datentests prüfen Anbieterzählungen, eindeutige IDs, gültige Koordinaten, geplante Regionen, souveräne Partitionen und die veröffentlichte AWS-Zonensumme. Die visuelle QA startet die App lokal in einem Headless-Browser und prüft Desktop, Mobile, Suche, Filter, Marker-Hover, Marker-Auswahl, Zoom sowie horizontalen Überlauf.

## Technologie

- React 19 und TypeScript
- Vite
- Three.js und react-globe.gl
- World Atlas und TopoJSON
- Vitest und Playwright

## Lizenz

MIT
