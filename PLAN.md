# Armok’s Chronicle — Development Plan

*Every world a history. Every downfall a story.*

Status: recorded lives and event narrative iteration implemented; broader features in progress. Updated: 27 October 2026.

## Current iteration

Local archives are implemented: streaming standard/Plus XML import, CP437/UTF-8 decoding, staged IndexedDB writes, progress/cancellation controls, saved-world bookshelf, raw record pagination, provenance inspection, and exact-world deletion. Map/text files are retained but their contents are not yet interpreted.

Nineteen Node tests pass; live checks for the new narrative iteration are pending. The previous deployed browser integration suite passed. All five supplied Cadenilina files were imported through the live UI; the saved world exposes 7,700 figures, 31,903 events, 577 sites, 276 artifacts, and 1,246 written works. Reload and pagination were verified. No user exports are committed.

Structural merging is implemented; semantic event aliases, broader relationship interpretation, advanced mismatch detection, migrations, cross-browser/mobile qualification, and complete accessibility review remain open. Searchable linked source records are now implemented, including case/accent folding, ID lookup, category selection, stable sorting, hash query persistence, and reverse event references. The new iteration adds 28 deterministic event templates, explicit fallbacks, life-date summaries, labelled figure relationships, and type/year/preset controls for related-event timelines. Complete biographies, broader templates, and maps remain open. See [verification notes](docs/verification.md).

## Goal and working rules

Build a complete, accessible, local-first Dwarf Fortress Legends explorer. Players import their own exports, explore linked histories and geography, discover stories, and preserve personal research.

Completed tasks are checked below; unchecked tasks remain planned or await verification. Tick a task only after its behaviour has been verified; record material limitations beside the task. Complete phases in order unless their dependencies explicitly allow otherwise.

### Fixed architecture

- GitHub Pages serves committed, browser-ready files from the root of `main`.
- No custom GitHub Actions build/deployment workflow, compilation, bundler, framework runtime, server, account system, or remote database is required.
- Use semantic HTML, CSS, native JavaScript ES modules, Canvas, Web Workers, IndexedDB, and a service worker.
- Use small, justified libraries for streaming XML import and IndexedDB; add a graph library only for graph features.
- Commit browser-compatible dependency distributions and licences under `vendor/`; never depend on npm resolution or a CDN at runtime.
- Imported worlds, indexes, bookmarks, and notes remain on the device. No uploads, analytics, or AI service are required.
- Use hash routes so deep links and reloads work on GitHub Pages without server rewrites.
- Target current desktop Chromium, Firefox, and Safari, with responsive mobile reading and honest device limits for large imports.
- Distinguish source facts, derived statistics, reconstructed states, and user annotations throughout.

### Completion criteria

A feature-complete v1 includes every required phase below, including specialist views, the Book of Records, supernatural filters, political and war maps, warfare networks, the world bookshelf, event-noise controls, personal chronicles, offline support, documentation, and release validation. Later ideas at the end are explicitly outside v1.

## 01 — Repository and static hosting foundation

- [x] Confirm the existing MIT licence and preserve its notices.
- [x] Add root `index.html`, `.nojekyll`, and directories for `css/`, `js/`, `vendor/`, `assets/`, `docs/`, and `tests/`.
- [x] Keep core landmarks, navigation, import controls, dialogs, and page templates explicit in HTML; populate records using DOM APIs and templates.
- [ ] Establish modules for routing, application state, import workers, storage, data queries, event formatting, maps, graphs, and views.
- [x] Document module boundaries and worker message contracts before implementing cross-module features.
- [x] Use relative asset URLs and module-relative worker URLs that work beneath `/armoks-chronicle/`.
- [ ] Add a useful no-JavaScript explanation and browser capability checks.
- [x] Add a local static-server command to the README; optional developer tooling must not be required to serve production files.
- [x] Document Pages configuration: “Deploy from a branch”, branch `main`, folder `/ (root)`.
- [ ] Configure that Pages source when repository administration access is available; otherwise document the exact manual setting.
- [x] Verify a root page, nested module, vendor file, worker, and asset load from the actual Pages project path.
- [x] Verify no custom build Action or generated output directory is needed. GitHub’s own branch-based Pages publishing infrastructure is acceptable.

**Exit check:** committed static files can be served unchanged locally and on Pages.

## 02 — Export research and compatibility fixtures

- [ ] Catalogue sections, IDs, nested fields, repeated elements, event types, and cross-references in standard Legends XML.
- [ ] Catalogue supplementary fields in Legends Plus XML and define how each supplements standard records.
- [ ] Catalogue the world map CSV header/version, dimensions, column types, and coordinate ranges.
- [ ] Inspect text report encodings, site-number semantics, headings, population rows, and naming conventions.
- [ ] Create a compatibility matrix recording tested DF/DFHack export versions; mark unknown versions as unverified.
- [ ] Derive biome codes, flags, river direction bits, and height units from the matching DFHack/game definitions; document sources and versions rather than guessing meanings.
- [ ] Create small, redistributable fixtures covering every supported record family, with provenance and permission recorded.
- [ ] Include fixtures for repeated tags, missing names, empty sections, unknown types, sentinel IDs, and missing linked records.
- [x] Include CP437 names, UTF-8 names, invalid XML control characters, escaped entities, and split multibyte chunks.
- [ ] Include truncated XML, malformed CSV, mismatched supplementary exports, and duplicate record IDs.
- [x] Keep original user exports out of public commits unless explicitly authorised; use the attached examples locally for integration checks.
- [x] Record baseline sample totals: 7,700 figures, 577 sites, 31,903 standard events, 276 artifacts, and 1,246 written works.
- [ ] Record the sample map baseline of 129 × 129 tiles and event years 1–73.
- [ ] Define expected optional-data capabilities separately from required standard-XML capabilities.
- [ ] Add fixtures for supernatural evidence, absent/ambiguous status, vague relationships, dedicated structures, and competing sources for ownership.
- [ ] Add ranking fixtures for tied values, incomplete reign dates, copied works versus physical copies, contested sites, and nested casualty totals.
- [ ] Add political/war-map fixtures for unknown owners, multiple sites on one tile, battles without coordinates, and events outside a selected date range.

**Exit check:** fixtures and a documented format contract exist before parser assumptions become application behaviour.

## 03 — Dependency selection and delivery

- [ ] Evaluate a streaming SAX-style XML parser against fixtures, browser-worker execution, memory use, licence, and maintenance status.
- [x] Select and pin a parser release; do not assume a Node/CommonJS package works directly in browser modules.
- [x] Select a browser-ready storage implementation: the initial schema uses an application-specific native IndexedDB adapter, avoiding a wrapper dependency; see docs/architecture.md.
- [ ] Validate Cytoscape.js for graph views and select a compatible browser distribution and any necessary layout extension.
- [x] Commit ready-to-run distributions, licences, source/version references, and checksums under `vendor/`.
- [ ] Write dependency adapters so application code does not directly depend on library-specific records everywhere.
- [x] Document how maintainers replace vendor files without introducing a production build pipeline.
- [ ] Load graph code only when a graph view is opened.
- [ ] Verify the application makes no runtime CDN, remote font, or package-registry requests.
- [ ] Record why each dependency is needed; avoid a framework, general mapping engine, or chart suite without a demonstrated requirement.

## 04 — Import experience and file validation

- [ ] Provide keyboard-accessible file selection and drag-and-drop for multiple export files.
- [ ] Recognise standard XML, Plus XML, map CSV, history text, and sites/populations text by content as well as filenames.
- [x] Require standard Legends XML for a complete world; explain what each optional file adds.
- [ ] Display a pre-import manifest with detected formats, sizes, world/date clues, and warnings.
- [ ] Check filename/date consistency and overlapping IDs to detect likely mismatches; disclose that matching names alone do not prove world identity.
- [ ] Reject ambiguous mixed-world batches or require an explicit assignment before merging.
- [ ] Allow users to add optional files to an existing compatible world without discarding notes.
- [ ] Show separate reading, decoding, parsing, merging, indexing, and saving progress stages.
- [ ] Report byte progress where measurable; label indeterminate work honestly.
- [ ] Support cancellation during each expensive stage and remove temporary data.
- [ ] Handle unsupported files, empty files, permission errors, and worker crashes with actionable messages.
- [x] Keep the previous usable world available if a replacement import fails.
- [ ] Show a completion summary with counts, enabled features, sanitation changes, unsupported records, and unresolved references.
- [ ] Offer an import diagnostics download without automatically exposing the entire source export.

## 05 — Streaming parsing and normalisation

- [x] Read files in bounded chunks in a dedicated worker; avoid a full XML DOM or repeated full-file string copies.
- [x] Detect BOM/XML declaration and implement explicit CP437 decoding; do not assume native TextDecoder supports CP437.
- [x] Decode UTF-8 incrementally while preserving character boundaries between chunks.
- [x] Remove only characters illegal in the selected XML version; count and report removals rather than silently rewriting text.
- [x] Preserve meaningful Unicode, accents, punctuation, XML entities, line breaks, and repeated child elements.
- [x] Fail clearly on unrecoverable structural corruption; never present a partial parse as a complete import.
- [x] Reject unsupported DTD/external-entity constructs and never fetch resources referenced by imported XML.
- [ ] Parse integers and booleans consistently while preserving raw values for diagnostics.
- [x] Treat negative sentinel references as unknown/unavailable rather than valid links.
- [ ] Normalise standard and Plus field/type aliases through explicit mappings.
- [ ] Merge by record family and ID, preserving provenance and reporting conflicting fields.
- [x] Supplement standard events with Plus fields rather than counting both exports as separate event streams.
- [x] Preserve unknown fields/types for inspection and future compatibility.
- [ ] Parse nested structures, site properties, entity positions, assignments, identities, and written-work references.
- [ ] Parse event collections and nested child collections without recursion loops.
- [ ] Parse map CSV incrementally; validate version, dimensions, duplicate coordinates, and missing cells.
- [ ] Parse text population reports conservatively; validate site matches and flag ambiguous matches.
- [ ] Preserve original text reports for a readable fallback when structured extraction cannot be trusted.
- [ ] Implement DF calendar conversion from verified units; distinguish unknown dates, negative years, and year-only dates.
- [x] Record import/parser versions and original filenames on the world metadata record.

**Exit check:** the supplied world imports with expected standard totals and no duplicate events from Plus enrichment.

## 06 — Data model, indexes, and storage

- [ ] Define world-scoped keys for figures, sites, entities, artifacts, events, collections, regions, constructions, identities, works, and art forms.
- [ ] Define schemas for terrain, creature definitions, population snapshots, relationships, import metadata, and user research.
- [ ] Store source provenance and unknown values explicitly.
- [ ] Build indexes by name, record type, event year, participant, site, entity, artifact, and collection.
- [x] Build reverse references so biographies and site histories do not repeatedly scan all events.
- [ ] Distinguish relationship types, directions, strengths, dates, and provenance.
- [ ] Track unresolved references without inventing replacement records or guessed identities.
- [x] Save imports in batches under a staging world ID; expose the world only after successful finalisation.
- [ ] Check storage estimates, handle quota failures, and explain persistent-storage permission outcomes.
- [ ] Add schema migrations that preserve annotations and support safe failure recovery.
- [ ] Separate replaceable source indexes from irreplaceable user notes.
- [ ] Support multiple stored worlds, world switching, storage usage, and explicit world deletion.
- [ ] Store cached map thumbnails, dimensions, export date, import date, and last-opened time for the world bookshelf.
- [ ] Support explicitly validated world-family grouping and a snapshot selector; keep every snapshot’s records, annotations, indexes, and cache keys independent.
- [ ] Store supernatural classifications with evidence and derivation version, retaining unknown/ambiguous states rather than defaulting to false.
- [ ] Keep exploration history, caches, bookmarks, and notes isolated by world.
- [ ] Coordinate multiple tabs and database upgrades; handle blocked connections and conflicting edits.
- [ ] Provide an in-memory session mode when durable storage is unavailable, with a clear persistence notice.
- [ ] Offer personal-data backup before destructive removal or incompatible migration.

## 07 — Interface, navigation, and visual design

- [ ] Define a readable stone, copper, and parchment palette with measured contrast.
- [ ] Use locally bundled fonts with licences, or system fallbacks; keep decorative typography out of dense body text.
- [ ] Build a responsive shell with world selector, primary navigation, global search, and accessible page headings.
- [ ] Implement hash routes for directories, record pages, map, timeline, discoveries, and personal chronicles.
- [ ] Add routes for the world bookshelf, Book of Records categories, political map selections, selected-war maps, and faction warfare networks.
- [ ] Preserve filters, selected tabs, and pagination in route state where useful.
- [ ] Support browser back/forward, copied links, reloads, invalid routes, and missing-world links.
- [x] Explain that a shared record link requires the same locally imported world; do not imply records are hosted publicly.
- [ ] Add exploration breadcrumbs and a recent-records list.
- [ ] Implement reusable record cards, metadata rows, linked references, empty states, loading states, and error boundaries.
- [ ] Use textContent/safe DOM construction for all imported names, descriptions, and user notes.
- [ ] Provide touch-friendly controls, visible focus, skip links, and consistent dialog focus restoration.
- [ ] Respect reduced-motion preferences; use subtle CSS transitions without delaying navigation.
- [ ] Add light/dark or parchment/dark reading options, adjustable text size, and persisted preferences.
- [ ] Make long names, unnamed records, and unknown races display gracefully.
- [ ] Build a visual world bookshelf with local map thumbnails, dimensions, export date, last-opened time, and clear open/import/delete actions.
- [ ] Group validated related snapshots under one world card with an explicit date selector; offer manual grouping/ungrouping when identity is uncertain.
- [ ] Provide a labelled thumbnail fallback when terrain is unavailable and avoid presenting import time as the in-game export date.

## 08 — Search and directories

Implemented slice: all-family name/ID search, category filter, name/year sorting, linked source-record pages, explicit references and paginated related events. Full biographies and per-directory specialist filters remain open.

- [x] Implement universal name search across all primary record families.
- [x] Normalise case and accents for matching while preserving original display names.
- [x] Support ID lookup, exact matches, partial matches, and deterministic result ordering.
- [ ] Add record-type filters and per-directory filters for relevant race, date, status, affiliation, and site type.
- [ ] Add composable vampire, werebeast, necromancer, and deity filters; support overlapping classifications rather than a mutually exclusive creature type.
- [ ] Provide explicit present/absent/unknown classification filters, with evidence links and the option to include uncertain matches.
- [x] Provide sorting, result counts, pagination, and clear-all controls.
- [ ] Debounce input, cancel stale queries, and avoid main-thread full-world scans per keystroke.
- [ ] Highlight matched text safely and expose result summaries to assistive technology.
- [x] Provide useful no-result suggestions without silently changing the query.
- [ ] Add fuzzy search only if measured user needs justify it; pin and vendor any added dependency.
- [x] Verify search results and filters persist when returning from a record page.

## 09 — Historical figures and biographies

- [ ] Show names, race/caste/sex as recorded, birth, appearance, death, and qualified age calculations.
- [ ] Show skills and goals with verified labels; preserve raw labels when a mapping is unknown.
- [ ] List current/former affiliations and offices, keeping source snapshot state distinct from dated events.
- [ ] Link relatives, spouses, companions, rivals, pets, worship, and other recorded relationships.
- [ ] Separate close/explicit relationships from vaguely recorded associations, preserving the original relationship label and supporting record.
- [ ] Add dedicated linked panels for notable kills, abducted figures, and structures dedicated to the figure; show counts and source evidence.
- [ ] Keep abductor, victim, killer, and dedication roles distinct; do not label a structure as owned or built by its dedicatee.
- [ ] Show supernatural badges with explanations and supporting secrets, transformations, interactions, or other verified evidence; show uncertainty when classification is inconclusive.
- [x] Add a chronological life timeline with category and date filters.
- [ ] Summarise major recorded events using deterministic templates.
- [ ] Show death cause, killer when identified, and location; retain unnamed killer race/caste details.
- [ ] Link artifacts held/created, authored works, relevant sites, and event collections.
- [ ] Show identities and aliases with a clear distinction between assumed identities and historical figures.
- [ ] Add recorded journeys and a link to the map; mark gaps and avoid implying continuous travel.
- [x] Provide raw/source details behind an expandable inspector.
- [ ] Handle deities, supernatural beings, transformed creatures, unknown birth dates, and living-status uncertainty.

## 10 — Settlements, organisations, and geography records

- [ ] Create site pages with type, coordinates, map link, names, and available structures.
- [ ] Show founding, attacks, destruction, reclamation, disputes, and other recorded site events.
- [ ] Show original civilisation and current owner separately; reconstruct ownership only from supported events.
- [ ] Display population reports as export-date snapshots, including untracked inhabitants.
- [ ] Keep named historical figures separate from total population estimates.
- [ ] Create entity pages distinguishing civilisations, governments, religions, military groups, and criminal organisations.
- [ ] Show parent/child organisations, memberships, positions, and appointments.
- [ ] Add leadership succession timelines where dates can be established.
- [ ] Link associated settlements, conflicts, worship, and artifacts.
- [ ] Create region and underground-region pages, retaining depth and coordinate information.
- [ ] Create pages/details for rivers, peaks, landmasses, and constructions when supplied.
- [ ] Provide clear unavailable-data explanations when optional exports are absent.

## 11 — Event language and world timeline

- [x] Define a formatter registry keyed by normalised event type.
- [ ] Prioritise readable templates for deaths, wounds, battles, jobs, affiliations, family links, founding, thefts, and artifacts.
- [x] Cover every event type in the supplied example with a readable template or an explicitly labelled structured fallback.
- [x] Support unknown future event types without hiding them.
- [ ] Resolve linked names consistently, including unidentified participants.
- [ ] Preserve source roles: attacker, defender, victim, killer, witness, author, claimant, and owner must not be conflated.
- [ ] Order events deterministically and avoid claiming precise order when timestamps are missing.
- [ ] Provide year/range controls, era markers, category filters, and record-specific filters.
- [ ] Add event exclusion controls and named reading presets, including a major-events preset that hides routine job and affiliation changes.
- [ ] Keep deaths, discoveries, thefts, and conflicts available in the major-events preset; let users inspect and customise the exact included/excluded types.
- [ ] Use one filter state for event lists, counts, and associated charts; show a persistent hidden-events count and a one-click reset.
- [ ] Preserve event-noise controls in navigation and saved searches while retaining a clear distinction between raw and filtered totals.
- [ ] Support bookmarking and direct links to individual events.
- [ ] Add expandable event details showing the underlying fields and provenance.
- [ ] Paginate or virtualise event rows without breaking keyboard reading and focus.
- [x] Label generated prose as a rendering of export data; do not invent dialogue, intentions, or causation.

## 12 — Interactive world atlas

- [ ] Render terrain from map CSV using Canvas with device-pixel-ratio handling.
- [ ] Add verified biome colours, elevation shading, oceans, rivers, peaks, and volcano markers.
- [ ] Overlay selectable sites, regions, and constructions from XML coordinates.
- [ ] Verify coordinate orientation, scale conversion, edge cells, and site-rectangle interpretation against fixtures.
- [ ] Implement pan, wheel/pinch zoom, fit-world, zoom buttons, and keyboard alternatives.
- [ ] Add layers for biome, elevation, evilness, savagery, and volcanism, each with a legend.
- [ ] Display unknown biome/flag codes explicitly instead of assigning guessed terrain.
- [ ] Add site-type filters, name search, marker clustering or scale-dependent labels, and selected-site emphasis.
- [ ] Add a political settlement layer with stable faction colours, owner legend, individual faction toggles, and show-all/hide-all controls.
- [ ] Keep unknown ownership and unaffiliated sites visible as explicit categories; combine colour with labels/shapes for accessibility.
- [ ] Add entity-page actions to fit/highlight all associated settlements, distinguishing founding civilisation from current ownership.
- [ ] Synchronise faction selection with map routes and dates; do not turn settlement markers into unsupported territorial borders.
- [ ] Open site/region history from a map selection and centre the map from record pages.
- [ ] Provide a coordinate/site-list map fallback when CSV is absent; do not fabricate terrain.
- [ ] Draw recorded figure journeys, labelling inferred straight-line connections rather than actual travelled paths.
- [ ] Add a year slider for dated events, founding/destruction, and supported ownership transitions.
- [ ] Mark export-time terrain/population and incomplete historical reconstruction in the legend.
- [ ] Add heatmaps of recorded events with explicit counting rules.
- [ ] Add battle markers and selected-war overlays with dates, participants, outcomes, and separate named/squad casualty details where available.
- [ ] Link map markers/popups to battle and war pages, and add reciprocal “view on map” actions from those pages.
- [ ] Filter warfare overlays by date, faction, and selected conflict using the shared map/timeline state.
- [ ] Show location-unknown conflicts in a linked list rather than inventing coordinates; provide a chooser for multiple records on the same tile.
- [ ] Label connecting lines/arrows as associations between conflict locations, never as verified army routes or territorial fronts.
- [ ] Supply an accessible linked location list for Canvas-only information.
- [ ] Test mobile gestures, reduced detail, redraw scheduling, and large marker counts.

### Optional atlas setting — Raised Relief

This setting is part of v1 implementation but opt-in for users; the flat atlas remains the default. It depicts regional elevation as stepped voxel-style columns, not individual fortress blocks or reconstructed underground geometry.

- [ ] Add a “Flat atlas / Raised Relief” setting and persist the user's preference; load 3D code and terrain geometry only when relief is requested.
- [ ] Choose native WebGL or a small, justified rendering library; vendor any browser-ready dependency and licence without adding a build step or remote runtime request.
- [ ] Generate column-top and exposed-side surfaces from map CSV elevation using batched meshes or instancing, avoiding one object per voxel and hidden stacks of cubes.
- [ ] Verify elevation scale, baseline, water classification, and sea-level interpretation against the export format before displaying height labels; do not imply raw values are metres.
- [ ] Apply verified biome colours and water surfaces, with rivers, peaks, and volcano markers aligned to the shared atlas coordinates.
- [ ] Add rotate, tilt, zoom, pan, fit-world, reset-view, and adjustable vertical-exaggeration controls with keyboard and touch alternatives.
- [ ] Preserve selected site, map centre, year, faction filters, and active overlays when switching between flat and relief views.
- [ ] Keep settlement markers selectable and readable above terrain; support selection where terrain or overlapping markers obscure a record.
- [ ] Support political settlement colours, battle/war overlays, and recorded journey lines at terrain height with the same evidence labels as the flat atlas.
- [ ] Label terrain as an export-time regional snapshot; the year slider changes supported historical overlays, not past terrain.
- [ ] Disable relief with a useful explanation when elevation data or graphics support is unavailable; retain the accessible location list and flat atlas.
- [ ] Handle graphics-context loss and excessive resource demands by offering a flat-map fallback without losing exploration state.
- [ ] Add bounded geometry/detail budgets for larger worlds, render on demand, pause when hidden, and release GPU resources when relief is closed.
- [ ] Respect reduced motion and avoid automatic camera rotation; provide labelled controls and a flat-view escape action.

## 13 — Artifacts, books, and culture

- [ ] Build artifact pages with material, item type, description, creator, holder, and location where supplied.
- [ ] Link creation, theft, gift, claim, storage, loss, finding, possession, and copying events.
- [ ] Distinguish claimed ownership, physical possession, and last recorded location.
- [ ] Connect physical books/scrolls to their written contents.
- [ ] Build written-work pages with title, author, form, style, page metadata, and references.
- [ ] Do not imply full book text exists when only metadata is exported.
- [ ] Build author bibliographies and searchable world-library directories.
- [ ] Expose poetic, musical, and dance forms, descriptions, creators, and associated performances where available.
- [ ] Link ceremonies, processions, competitions, and discoveries of knowledge.
- [ ] Add culture and scholarship summaries whose totals link back to their underlying records.

## 14 — Conflicts, religion, beasts, and intrigue

- [ ] Build nested war/battle/attack/duel pages from event collections.
- [ ] Show dates, locations, factions, participants, recorded outcomes, and casualties.
- [ ] Avoid double-counting casualties across nested collections; distinguish named deaths from squad totals.
- [ ] Link abductions, theft collections, persecutions, and site conquests.
- [ ] Build deity pages with spheres, associated organisations, worshippers, and relevant structures.
- [ ] Separate deities from religious organisations and unexplained supernatural forces.
- [ ] Build a bestiary using creature definitions and linked historical figures.
- [ ] Show known attacks, victims, transformations, secrets, and deaths without treating species traits as individual deeds.
- [ ] Build intrigue views for plots, participants, relationships, assumed identities, and recorded outcomes.
- [ ] Implement supernatural-status derivation from verified export fields and mappings, documenting evidence rules and their compatibility limits.
- [ ] Keep species, deity status, learned secrets, transformations, and supernatural abilities distinct; absence of a known marker does not prove a figure is ordinary.
- [ ] Explain source limits and avoid inferring hidden motives or guilt from membership alone.
- [ ] Add “last recorded whereabouts” panels for figures, beasts, and artifacts, with source date/event.
- [ ] Handle conflicting or undated location evidence as uncertainty rather than a definitive current position.

## 15 — Relationships and Threads of Fate

- [ ] Build a relationship graph adapter with typed nodes/edges and source links.
- [ ] Add person-centred networks with filters for family, affiliation, conflict, worship, and artifacts.
- [ ] Limit initial graph depth and node count; expand neighbours on demand.
- [ ] Provide family-tree layouts that handle remarriage, multiple parents, unknown relatives, and cycles.
- [ ] Preserve distinct edge meanings; shared battle participation must not imply a personal meeting.
- [ ] Add keyboard-accessible equivalent relationship lists.
- [ ] Implement two-record connection search using bounded graph traversal in a worker.
- [ ] Let users include/exclude broad membership edges that create unhelpful shortcuts.
- [ ] Display the shortest found path with every intermediate record, relationship type, and supporting source.
- [ ] Report no path, truncated search, and missing data distinctly.
- [ ] Support cancellation, maximum path depth, and deterministic results.
- [ ] Add graph zoom/reset controls and dispose of graph instances when leaving the view.
- [ ] Add a faction-centred warfare network showing opponents, dated conflicts, and links to the underlying wars/battles.
- [ ] Let users filter warfare networks by years and conflict type and expand neighbours within bounded node/edge limits.
- [ ] Define edge counts/weights explicitly, deduplicate nested collections, and distinguish aggression from undirected opposition when source roles are known.
- [ ] Link selected graph factions/conflicts to their political/war map views and provide an equivalent accessible conflict table.

## 16 — Discovery and story exploration

- [ ] Build the Chronicler’s Desk with useful world totals, eras, recent discoveries, and suggested records.
- [ ] Define reproducible discovery rules for long lives, prolific authors, contested artifacts, notable beasts, and event-rich sites.
- [ ] Explain each discovery card’s selection criterion and link to supporting records.
- [ ] Qualify superlatives as “among recorded figures/events”; handle ties, unknown dates, and incomplete data.
- [ ] Implement Follow the Thread recommendations from the current record.
- [ ] Keep a navigable thread history and allow users to save an exploration trail.
- [ ] Add a random-record option with category filters and preference for usable records.
- [ ] Build the Grudge Ledger from recorded killings, thefts, abductions, and faction conflicts.
- [ ] Add family/faction context without presenting a later attack as proven revenge.
- [ ] Add comparative statistics by year, race, faction, site, and event category with transparent counting definitions.
- [ ] Provide accessible tables alongside charts; avoid suggesting historical figures represent the whole world population.
- [ ] Cache expensive discovery calculations and invalidate them when source data changes.
- [ ] Build a dedicated Book of Records with category tabs, ranked tables, highlight cards, source links, and preserved route/filter state.
- [ ] Include deadliest creatures/figures by recorded notable kills, bloodiest battles by available casualty totals, and separate summaries for named victims and squad casualties.
- [ ] Include longest and shortest reigns, defining treatment of incomplete dates, concurrent offices, ongoing terms, and tied durations.
- [ ] Include most contested settlements using a documented metric such as recorded ownership changes; distinguish this from attack count.
- [ ] Include most copied written works, most prolific authors, and greatest scholars by recorded knowledge discoveries, with separate work/artifact/copy counts.
- [ ] Include longevity, travel, relic history, and geographical records where supported, reusing existing discovery metrics rather than duplicating calculation logic.
- [ ] Expose metric definitions, eligibility, missing-data exclusions, ties, and source snapshot on each ranking; qualify every superlative as applying to recorded data.
- [ ] Offer supernatural inclusion/exclusion controls on relevant rankings and recalculate results consistently with the selected filters.

## 17 — Personal chronicles, backups, and export

- [ ] Add bookmarks for records, events, maps, and saved searches.
- [ ] Add plain-text notes, tags, and named collections.
- [ ] Let users reorder selected records/events into a personal chronicle.
- [ ] Keep user commentary visually distinct from source-derived descriptions.
- [ ] Implement local autosave, unsaved-change handling, and multi-tab conflict feedback.
- [ ] Export/import versioned JSON backups of notes, bookmarks, collections, and world association metadata.
- [ ] Validate backup format and size; preview merges, conflicts, and missing record references before restoring.
- [ ] Preserve stable world identity and annotations across compatible optional-file enrichment and reimports.
- [ ] Treat later export snapshots as distinct datasets unless an explicit, validated annotation transfer is requested.
- [ ] Provide Markdown/plain-text chronicle export and print-friendly biography/chronicle layouts.
- [ ] Ensure exported links explain their dependency on locally available world data.
- [ ] Make deletion scope clear: source world, derived indexes, annotations, and backups are separate concerns.

## 18 — Offline use and application updates

- [ ] Add a web manifest with name, icons, theme, start URL, and scope appropriate to the project subpath.
- [ ] Add a service worker scoped to this app, caching local shell assets and vendor files.
- [ ] Keep imported worlds in IndexedDB rather than the service-worker asset cache.
- [ ] Confirm offline reload, navigation, search, maps, and saved research after initial installation/import.
- [ ] Implement explicit asset-cache versioning and old-cache cleanup within this app’s scope only.
- [ ] Provide an update-available prompt and avoid reloading during imports or unsaved edits.
- [ ] Handle missing cache assets and first-visit-offline errors usefully.
- [ ] Verify installation where supported and normal browser use where installation is unavailable.
- [ ] Document that offline data is device/browser-specific and may be evicted; offer backups and storage status.
- [ ] Test coexistence with other Pages apps on the same origin without broad cache deletion or worker scope interference.

## 19 — Accessibility, privacy, and resilience

- [ ] Target WCAG 2.2 AA for primary import, search, reading, navigation, annotation, and export flows.
- [ ] Audit heading structure, labels, announcements, contrast, touch targets, and focus order.
- [ ] Test complete primary flows with keyboard only and representative screen readers.
- [ ] Provide text/list alternatives for maps, graphs, statistics, and visual timelines.
- [ ] Test narrow screens, long names, 200% zoom, reduced motion, and high-contrast settings.
- [ ] Bound parser depth, string sizes, graph expansion, and other potentially unbounded work with clear diagnostics.
- [ ] Test imported script-like names, markup, malicious links, and unsafe note content.
- [ ] Keep all parsing and presentation independent of remote services.
- [ ] Add an appropriate static-host-compatible Content Security Policy; account for local modules, workers, styles, and vendor behaviour.
- [ ] Explain local storage, backup responsibility, and the absence of uploads in a concise privacy page.
- [ ] Provide recoverable errors for corrupt databases, interrupted imports, stale caches, and failed migrations.

## 20 — Testing and performance qualification

Tests may run locally using optional developer tooling. They must not compile production assets or become a prerequisite for branch-based Pages publication.

- [ ] Add parser/normalisation tests for fixtures, encodings, alias mapping, sentinel values, and malformed-input handling.
- [ ] Add merge tests proving Plus enrichment does not duplicate events or erase richer standard fields.
- [ ] Add query/index tests for linked records, unresolved references, date ordering, and world isolation.
- [ ] Add formatter tests for roles, unknown dates, missing names, and structured fallbacks.
- [ ] Add database tests for staged imports, cancellation, quota failures, migrations, backups, and annotation preservation.
- [ ] Add map tests for dimensions, coordinate alignment, unknown codes, and absent optional data.
- [ ] Add graph tests for cycles, relationship direction, path bounds, and misleading shared-event shortcuts.
- [ ] Test supernatural classifications with overlapping traits, missing evidence, unknown versions, and false-positive cases; verify badges and filters agree.
- [ ] Test close/vague relationship separation and biography role panels against supporting records.
- [ ] Test Book of Records metrics for ties, partial reign dates, ongoing reigns, copied-work deduplication, knowledge counts, and nested casualty overlap.
- [ ] Test faction toggles, unknown owners, same-tile marker selection, date-filtered war overlays, missing coordinates, and graph/map reciprocal links.
- [ ] Test event-noise presets and custom exclusions keep lists, charts, counts, saved searches, and navigation state synchronised.
- [ ] Test bookshelf thumbnails, sorting, snapshot grouping/ungrouping, reload, and snapshot deletion preserve other worlds and annotations.
- [ ] Add end-to-end checks for import → search → biography → linked event → map → bookmark → reload.
- [ ] Add end-to-end checks for optional enrichment, second-world import, switching, cancellation, deletion, and restore.
- [x] Test the attached sample as a local integration dataset and reconcile counts against the baseline.
- [ ] Test at least one substantially larger authorised dataset and a generated stress fixture; document their characteristics.
- [ ] Establish a reproducible reference desktop/device and record import time, stored size, interaction latency, and memory observations.
- [ ] Target visible feedback within 100 ms, indexed search within 200 ms, and common cached-page navigation within 200 ms on the reference desktop.
- [ ] Require a responsive, cancellable import rather than promising an unmeasured fixed import duration.
- [ ] Test memory growth across repeated imports, world switches, graph visits, and map redraws.
- [ ] Verify browser behaviour in Chromium, Firefox, and Safari; document tested versions and large-world mobile limits.
- [ ] Verify every runtime asset is present in the repository and no bare package specifiers or build-only imports remain.
- [ ] Test an HTTP server mounted at the repository subpath, not only a site served at origin root.
- [ ] Test the actual Pages deployment, hash-route reloads, workers, manifest scope, offline mode, and updates.
- [ ] Test relief heights, water classification, coordinate alignment, vertical exaggeration, terrain picking, and overlay placement using known fixtures.
- [ ] Test flat/relief switching, persisted preferences, keyboard/touch navigation, missing elevation, graphics-context loss, and fallback state preservation.
- [ ] Benchmark relief with the supplied 129 × 129 map and a larger fixture on desktop and a weaker device; record frame times, memory use, detail limits, and repeated-open cleanup.
- [ ] Resolve release-blocking errors and record any supported-data limitations in the compatibility documentation.

## 21 — Documentation and v1 release

- [ ] Rewrite README with purpose, screenshots, live Pages URL, supported inputs, and quick start.
- [ ] Explain how to export compatible Legends/DFHack data, citing tested versions and relevant upstream documentation.
- [ ] Explain required versus optional files and features that degrade gracefully without them.
- [ ] Document architecture, source layout, dependency versions/licences, database schema, and event-type extension points.
- [ ] Document direct-from-main hosting, project-relative paths, local serving, and vendor-update procedures.
- [ ] Add troubleshooting for CP437 imports, invalid XML, mismatched worlds, storage limits, blank maps, and stale offline assets.
- [ ] Document source uncertainty, incomplete histories, population snapshots, and the difference between derived stories and source facts.
- [ ] Document Book of Records metrics, supernatural evidence rules, political/war-map semantics, event-noise presets, and snapshot grouping.
- [ ] Record LegendsViewer-Next as feature research inspiration with upstream links; retain applicable notices for any code or assets actually reused.
- [ ] Document the opt-in Raised Relief setting, controls, graphics requirements, performance limits, and regional/export-time resolution.
- [ ] Add contributing guidance, fixture provenance rules, compatibility reporting, and meaningful test commands.
- [ ] Add appropriate Dwarf Fortress/DFHack attribution and clarify that the app is an unofficial fan project.
- [ ] Add changelog, application version, dependency notices, and known-limitations page.
- [ ] Run the full release acceptance journey below against committed files.
- [ ] Confirm production Pages serves `main` root without a custom build/deploy action.
- [ ] Tag v1 only after required tasks are complete or explicitly revised with a documented scope decision.

### Release acceptance journey

- [ ] A new visitor understands the app and imports standard XML without registering or uploading data.
- [ ] Adding matching Plus/map/text files unlocks appropriate features and preserves the existing research.
- [ ] The visitor follows a figure → event → settlement → faction → artifact through working links.
- [ ] The visitor uses timeline and map controls to inspect dated history without confusing snapshot data with reconstructed data.
- [ ] Family, intrigue, conflict, religion, culture, and creature views expose supporting records.
- [ ] Discovery cards, relationship paths, and grudges provide interesting, accurately labelled connections.
- [ ] The visitor browses the Book of Records and follows a ranked entry to evidence explaining its metric and limitations.
- [ ] The visitor filters supernatural figures, inspects classification evidence, and distinguishes vague associations from explicit personal relationships.
- [ ] The visitor selects a faction on the political map, explores a war overlay and warfare network, and returns through working record links.
- [ ] The visitor hides routine events and sees the same filtered totals in lists and charts, with an obvious way to restore all events.
- [ ] The visitor chooses a dated snapshot from a world bookshelf card without merging its history or notes into another snapshot.
- [ ] The visitor saves and exports a chronicle, restores notes from backup, and resumes after reload.
- [ ] The imported world works offline after setup; app updates preserve user data.
- [ ] A second world can be imported and removed without contaminating the first world.
- [ ] Core flows remain usable with a keyboard, on a narrow screen, and with optional exports absent.
- [ ] The visitor enables Raised Relief, adjusts terrain exaggeration, selects a settlement and war overlay, then returns to the flat atlas with filters and selection intact.
- [ ] Malformed or oversized imports fail or cancel cleanly without destroying a usable world.

## Delivery checkpoints

| Checkpoint | Required phases | Reviewable outcome |
|---|---|---|
| Foundation | 01–03 | Static shell, format contract, fixtures, vendored dependencies |
| Reliable import | 04–06 | Cancellable local import, merged records, indexed persistent worlds |
| Core explorer | 07–11 | Searchable linked encyclopaedia and readable timelines |
| Atlas and specialist records | 12–14 | Map, artifacts, culture, conflicts, religion, beasts, intrigue |
| Discovery and research | 15–17 | Networks, connection paths, story discovery, saved chronicles |
| Complete v1 | 18–21 | Offline updates, accessibility, qualification, documentation, release |

## Explicitly outside v1

These ideas must not delay the feature-complete static app above.

- Hosted/shared world databases, authentication, cloud sync, and collaboration.
- Required AI-generated biographies, paid APIs, or remote inference.
- Live integration with a running game or direct save-file parsing.
- Full historical terrain, population, or border reconstruction unsupported by export data.
- Automatic semantic diffing between world snapshots.
- Full-resolution fortress/block-level 3D reconstruction, unbounded volumetric worlds, or unbounded global relationship graphs; the bounded optional regional Raised Relief atlas is included in v1.
- A build pipeline, framework migration, or server solely for convenience.

