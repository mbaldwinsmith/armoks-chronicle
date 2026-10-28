# Development checklist reconciliation — 28 October 2026

PLAN.md has been reconciled against implemented modules, authored tests and the existing live-verification record. This corrects stale checkboxes; it does not certify full v1, WCAG compliance, cross-browser compatibility, offline use or performance targets.

Combined tasks were split wherever only part was complete. For example, record bookmarks and ordered chronicles are implemented, while map/search bookmarks remain open; the Canvas relief controls work, while a rotatable WebGL renderer remains open. Parsing and preserving a raw field is not treated as a completed specialist view.

| Area | Evidence used | Remaining scope kept explicit |
|---|---|---|
| Static foundation and dependencies | `index.html`, `js/app.js`, `js/router.js`, `vendor/README.md`, architecture and live Pages checks | Upstream maintenance qualification; no framework/build requirement added |
| Import and encoding | Parser/manifest modules, `parser.test.mjs`, `preview.cjs`, browser worker import/rollback | Stronger source-identity matching, in-place enrichment, separate progress stages and downloadable diagnostics |
| Storage | Native IndexedDB adapter, annotation/chronicle adapters, exact-world deletion and stale-save tests | Quota exhaustion, corrupt databases and failed/blocked migration recovery qualification |
| Search and language | Exploration/narrative/language modules and their unit/browser checks | Specialist directory filters, fully aborting same-world directory queries and exact calendar conversion |
| Figures, sites and culture | Generic linked records, biography dates, relationships, culture references, bibliographies and source inspectors | Offices, identities, structures, journeys and specialist ownership/creator timelines |
| Timeline and discovery | Shared filters/presets, eras, Desk, Follow the Thread and Grudge Ledger | Era markers in event lists, charts, saved searches and new evidence rules |
| Atlas | Terrain/politics/conflict/biome modules; authored coordinate, river/ocean and political tests; recorded live checks | Region/construction overlays, absent-terrain list fallback, pinch/3D interaction, historical ownership and mobile qualification |
| Relationships and warfare | Bounded native SVG networks, family layout, BFS connection search, nested conflict/faction adapters and evidence lists | Person-centred artifact/conflict graph edges and additional specialist views |
| Rankings | Book of Records definitions/tests and conflict casualty evidence | Reign lengths, bloodiest-battle rankings, ownership-change metrics and supernatural controls |
| Personal research | Existing bookmarks/notes/tags/backups plus named ordered chronicles, Markdown/JSON and print layout | Autosave, standalone text export, print biographies, map/search bookmarks and source enrichment |
| Tests and documentation | Dependency-free unit suite, live project-subpath browser integration, feature docs and README | Firefox/Safari, screen readers, reference-device targets, broad release journey and consolidated release docs |

Text reports remain stored source files; population parsing and a report reader remain open. Unknown source markers do not become negative supernatural classifications. Faction snapshots do not become dated borders. War/battle/event source entries do not become independent incident totals. Original exports remain excluded from public fixtures and audit evidence.
