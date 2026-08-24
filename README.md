# Atlas Cloud

Atlas Cloud ist eine statische, offline-fähige Cloud-Architect Workbench. Sie trennt 152 Cloud-Regionen von 341 Cloudflare-Edge-Standorten und stellt Karte, Datentabelle, Shortlist-Vergleich und einen transparenten Entscheidungsassistenten bereit.

## Funktionen

- Layer, Anbieter, Lifecycle, Kontinent, Dienste und Architektur-Presets als kombinierbare Filter
- tastaturbedienbare Token-Suche nach Region, Code, Anbieter, Land und Dienst
- sortierbare Tabelle mit Spaltenauswahl sowie CSV-/JSON-Export
- Shortlist für bis zu vier Regionen mit Quellen, Datenalter, Proximity und Datenlücken
- Assistent mit harten Anforderungen und anpassbarer Gewichtung: Services 35 %, Nähe 25 %, Resilienz 20 %, Preis 10 %, Nachhaltigkeit 10 %
- kanonische Deep Links für Ansicht, Filter, Auswahl, Vergleich, Ursprung und Kartenmodus
- lazy geladener 3D-Globus, barrierefreie 2D-Fallback-Karte und markerabhängiges Level of Detail
- installierbare PWA mit offline verfügbarem App-Shell und Update-Hinweis

Proximity bezeichnet ausschließlich die Luftlinienentfernung zu einer gewählten Ursprungsregion. Atlas Cloud behauptet ohne Messinfrastruktur keine Netzwerklatenz. Fehlende Preis- und Nachhaltigkeitsdaten werden sichtbar als nicht verfügbar behandelt und nie geschätzt.

## Daten und Referenzpreis

Die geprüften JSON-Snapshots liegen unter `src/data/generated`. Jedes Standortobjekt enthält Lifecycle, getrennten Betriebsstatus, Koordinatengenauigkeit, Services und Provenienz. Cloudflare-Standorte sind Edge-Rechenzentren und keine Public-Cloud-Regionen.

Die Preisbaseline ist ein Linux-On-Demand-Workload mit 2 vCPU und 8 GB RAM in USD pro Stunde: AWS `m7i.large`, Azure `Standard_D2s_v5`, GCP `n2-standard-2`. Rabatte, Steuern, Storage und Egress sind ausgeschlossen; Cloudflare ist nicht vergleichbar. Ein Preis wird nur angezeigt, wenn eine offizielle öffentliche Quelle belegt ist. Das Gleiche gilt für Nachhaltigkeitsmetriken.

Offizielle Quellen umfassen [Azure Regions](https://learn.microsoft.com/azure/reliability/regions-list), [Azure Retail Prices](https://learn.microsoft.com/rest/api/cost-management/retail-prices/azure-retail-prices), [AWS Regions](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/), [Google Cloud Locations](https://cloud.google.com/about/locations) und die [Cloudflare Status API](https://www.cloudflarestatus.com/api).

## Entwicklung und Qualität

Node.js 24.x ist erforderlich. Installation und lokale Entwicklung:

```bash
npm ci
npm run dev
```

Der vollständige lokale Gate führt Lint, Typecheck, Unit-Tests, Datenvalidierung, Produktionsbuild und Größenprüfung aus:

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
```

Weitere Datenbefehle:

```bash
npm run data:validate
npm run data:check
npm run data:refresh
```

`data:refresh` lädt offizielle öffentliche Quellen zunächst in ein Staging-Verzeichnis. Nur wenn alle Abrufe und Validierungen erfolgreich sind, werden Rohdaten und Metadaten veröffentlicht. Der wöchentliche GitHub-Workflow öffnet bei gültigen Änderungen eine eigene Daten-PR; Parser- oder Netzwerkfehler verändern keine Snapshots.

Die CI verwendet `npm ci`, prüft Produktionsabhängigkeiten, führt responsive Playwright- und axe-Tests aus und erzwingt maximal 125 KB gzip eager JavaScript sowie maximal 531 KB gzip für den lazy WebGL-Einstieg.

## Lizenz

MIT
