# Armok’s Chronicle — Development Plan

*Every world a history. Every downfall a story.*

Status: atlas and isometric relief preview implemented; broader features in progress. Updated: 29 October 2026.

## Current iteration

Structures and Settlement Life: a searchable type/context/association-filtered register and source-linked building dossiers now preserve settlement-local IDs, snapshot inhabitants, explicit property owners, associated organisations, temple dedications, copied-artifact references and historical roles. Construction, replacement, destruction, modification, visits and property acquisition retain their source meanings; history-only entries, conflicting owners and snapshot-mapped acquisition uncertainty remain explicit. Settlement, figure, organisation and artifact panels link the new register. All 339 Node tests and the deployed 0.31.0 browser suite pass; existing archives need no migration or reimport. See `docs/structures-and-settlement-life.md`.

Intrigue Explorer: plots, directed corruption/justice events and identity records now have separate searchable directories and source-linked dossiers. Plot/actor IDs remain local to their source figure; explicit participants, parent/delegated plots, current/used identities and named judicial roles retain their meanings. Outcome filters distinguish failed attempts, explicit relationship success, interrogations, convictions and wrongful-conviction markers without inferring plot success, guilt or executions. Figure/identity specialist panels, bounded worker indexing, safe native mask glyphs and source-return context are implemented. All 316 Node tests and the deployed 0.30.0 browser suite pass; existing archives need no migration or reimport. See `docs/intrigue-explorer.md`.

Deities and Religions: the sacred annals now separate explicit deity markers, religious organisations, forces, other worshipping entities and unclassified worship targets. Spheres, named worship/membership links, direct versus group-associated temples, local structure identity, source disagreement and dated religious events have bounded worker dossiers and figure/entity/site panels. Source inspector links retain gallery return filters; membership and temple visits never imply personal worship. All 293 Node tests and the deployed 0.29.1 browser integration suite pass; existing archives need no migration or reimport. See `docs/deities-and-religions.md`.

Bestiary: searchable individual and definition galleries, source-linked directed deeds, exact/unique-alias species matching and explicit unclassified fallback are implemented and verified in 0.28.1 (272 Node tests and the live browser suite). See `docs/bestiary.md`.

The Artifact Cabinet: a dedicated searchable/filterable relic gallery and characterful dossiers now distinguish snapshot holders/places, historical possession, recorded claims and unknown ownership. Slabs show explicit secret-source learning evidence separately from description mentions, teacher ambiguity and unknown status. Safe quoted inscriptions, linked writing, source/return context, native relic glyphs and deterministic editorial asides enrich the reading experience. Recovery/destruction and naming-only records retain their meaning; existing archives need no reimport. All 255 Node tests and the deployed 0.27.1 browser suite pass, including safe inscriptions, Cabinet/source navigation and world isolation. See docs/artifact-cabinet.md.

Settlement Chronicles: source-linked site histories now combine founding/reclamation, attacks/destruction, diplomacy, local-government changes and structure construction/rebuilding. Export-time owners/civilisations remain separate from dated governments. Category/year controls, paging, source returns and flat/relief map returns retain reader context. Most Contested Settlements compares conservative dated government-change groups, excluding attacks, tribute, surrender, undated/missing/conflicting government claims and unchanged owners. Related sources are grouped with timing limits disclosed. All 231 Node tests and the deployed 0.26.0 browser integration suite pass, including source/map return flows and archive isolation. See docs/settlement-chronicles.md.

Offices and Succession: figure/organisation panels now distinguish dated appointment/removal terms from export-time holder assignments and office-creation context. Source-linked appointer/promise roles, organisation-scoped office definitions, neighbouring recorded holders, uncertain handovers and overlapping/open terms remain explicit. Longest and Shortest Completed Office Terms rank eligible calendar-year spans separately, with ties, both endpoints and exclusions. Existing archives require no reimport. All 209 Node tests and the deployed 0.25.1 browser integration suite pass; live checks verify organisation/figure panels, assignment snapshots, tied rankings, reload and source inspection. See docs/offices-and-succession.md.

Supernatural History: figure directories now compose vampire/werebeast/necromancer/deity evidence filters with optional uncertain matches, linked badges and biography evidence/context panels. Exact supported markers and learned-secret evidence are separated from identifier/form-name clues, species, known interactions and forces. Versioned bounded worker profiles retain source roles, missing records and uncertainty; aliases feed Follow the Thread without inferred infection lineages. 170 Node tests and the deployed 0.23.1 browser integration suite pass. Live checks cover composed filters, uncertainty opt-in, reload, evidence strength/source inspection and participant links with retained filter state. See docs/supernatural-history.md.

Personal Chronicles: named world-scoped collections now support record-page collection, bookmarked records, the bounded recent trail, keyboard reordering, per-entry commentary, saved source summaries, reversible archiving, Markdown/JSON export, explicit new-copy backup restore and a print reading layout. IndexedDB v3 retains both annotations and chronicles when source archives are removed. Explicit saves and stale-tab checks protect drafts. 156 Node tests and the deployed browser integration suite pass. Live checks cover record collection, recent-trail capture, bookmark/note collection, reordering/commentary, save/reload, Markdown/JSON downloads, new-copy restore, archive filtering and reading view. See docs/personal-chronicles.md.

Checklist reconciliation (see docs/plan-audit.md): completed items below were checked against committed modules, authored fixtures and recorded live checks. Combined tasks were split where only part is implemented. An unchecked release/audit item still requires its stated evidence; this reconciliation is not a WCAG, cross-browser, offline or performance certification.

Grudge Ledger: five source-entry categories separate recorded harms and faction conflicts from explicit grudge relationship labels. Applied name/ID, person, faction, place and year filters persist with stable paginated order. Evidence links return to the ledger’s selection and lead onward through Follow the Thread. Natural/unexplained deaths, inferred ownership and faction membership, undated revenge claims and overlapping-source incident totals are excluded. A lazy compact worker cache has explicit source/entry/reference bounds, cancellation and archive isolation. 146 Node tests and the deployed browser integration suite pass. Live checks cover filters, reload, evidence/return navigation, undated explicit grudges, invalid years, faction roles and sort order. See docs/grudge-ledger.md.

Follow the Thread: record pages offer bounded, varied next stops with directed relationship wording, natural event context, cultural references and conflict membership evidence. Progressive cards use the reverse-reference index, exclude self/missing targets and abort on navigation. 134 Node tests and deployed browser checks passed in that iteration. See docs/follow-the-thread.md.

Chronicler’s Desk: saved archives and completed imports now open a dedicated world starting page with six linked record totals, explicit dated era records, up to four evidence-linked ranking discoveries, category-aware random previews and a twelve-record recent trail. The old world-root directory remains available. Discoveries reuse the Book of Records cache/definitions; random selection prefers explicit names, avoids repeats where alternatives exist and uses unbiased bounded sampling. Era ends are never inferred. Reading history is a separate bounded world-scoped localStorage cache, with storage failure recovery and exact-key cleanup on source deletion; annotations are unchanged. 126 Node tests and the deployed browser integration suite pass. Live checks cover import/bookshelf landing, discovery-to-ranking navigation, random singleton previews without visits, record-to-Desk trail updates, trail/category reload and explicit unknown era ends. See docs/chroniclers-desk.md.

Faction warfare networks: organisation pages link to a dedicated bounded SVG/table view with year/source-type filters, paginated neighbour expansion, evidence cards, source-role direction and conflict/map links. War aggressors remain distinct from battle/event attack roles. Connected collection families, including shared-event memberships, contribute once per faction pair; missing grouping context and shared/non-unique roots are explicit. Existing worker indexes are reused with four filtered-network caches and cancellation. 117 Node tests pass, including a generated 50,000-claim case and uncertainty for truncated membership. The deployed browser integration suite verifies worker expansion, source evidence, deduplicated group weights, role directions, filters, accessible tables and archive isolation. Live checks also cover neighbour expansion, attack-only arrows, source inspection, applied-versus-draft filters, empty states, reload restoration, zoom/fit and an existing supplied archive. See docs/faction-warfare.md.

Conflict chronicles: a Wars & Battles ledger and specialised collection record pages expose explicit war/battle/duel hierarchies, dated event chronicles, participant-role evidence, outcomes and separate identified-victim/squad measures. Shared events and victims deduplicate; parent rollups are omitted from more-specific subtotals, and overlapping or incomplete reports suppress combined squad totals. Selected-conflict atlas overlays use explicit nested event membership, retain their scope in URLs and return to the source history. Lazy worker indexes, eight-summary caches, iterative traversal and bounded section pages keep heavy work off the UI thread. 105 Node tests and the deployed browser integration suite pass. Live checks cover search during initial indexing, nested sections and reload, Chronicle year filters, event return links, selected-war atlas scope and scope persistence. A generated 50,000-event stress case keeps participant and response bounds explicit. See docs/warfare.md.

Family trees: figure pages offer a dedicated entry button and a switchable generational layout inside the bounded relationship explorer. Explicit parent/child roles determine rows, spouses and siblings share relative generations, reciprocal diagram connectors combine without removing directed source claims, and distant relatives remain unplaced unless a direct generational chain exists. Multiple spouses, missing records and shared ancestors remain distinct; cyclic or contradictory constraints are retained as placement conflicts with source evidence and equivalent list warnings. Layout links restore after reload; expansion remains bounded and requests are disposed on navigation. 93 Node tests and the full deployed Chrome integration suite pass, including matching SVG/list conflict warnings. Live checks verify expansion, layout reload/restoration, linked relatives, zoom and fit. See docs/family-trees.md.

Book of Records: eight world-scoped rankings cover distinct named kills, completed calendar-year life spans, explicitly open-ended life records, distinct written works by author, eventful settlements, knowledge-discovery events, artifact event histories and distinct physical artifacts containing written works. Safe semantic tables link source records and bounded evidence samples; highlights disclose ties. Competition ranks, eligibility/exclusions and source uncertainty are explicit. Categories and pages persist in hash routes; a lazy worker aggregation is cached for one immutable archive and cleared on world/worker changes. Supernatural filters, reigns and deduplicated battle casualty rankings remain open. 85 Node tests and the full deployed Chrome integration suite pass; live checks verify all eight categories, pagination/reload and supporting-record navigation. See docs/book-of-records.md.

Biome atlas: Biomes is now the default terrain colour layer, with 51 named, distinct palette entries, a world-specific labelled legend and tile/hover names. Explicit layer choices are retained in atlas URLs and restored on reload; changing colour layers preserves the camera, filters and selection. Unknown codes use an explicit diagnostic label/colour. The same palette colours flat tiles and relief tops, while the translucent ocean geometry is retained. 77 Node tests and the full live browser integration suite pass. Live UI checks cover the default Biomes layer, named tile inspection, legend visibility, explicit layer restoration on reload, zoom preservation on colour changes, and both flat/relief rendering. The supplied export was verified locally; public verification notes retain only authored fixture results.

Connection finder: figure pages offer two explicit name/ID pickers and a bounded worker breadth-first search. Figure links can be followed in either direction with unchanged source roles; organisation intermediaries are opt-in. Results include every intermediate record and evidence, distinguish exhausted searches, limits, missing endpoints and cancellation, and qualify paths found with incomplete neighbourhood data. Searches are bounded by the selected depth (up to eight links), 500 discovered records, 40,000 examined links or 4,000 fresh source reads; per-neighbourhood limits remain explicit. Navigation and Cancel abort a search without discarding selections. 71 Node tests and the live browser integration suite pass, including shortest/reverse paths, organisation-only connections, missing endpoints, no-path results, world isolation, cancellation and subsequent worker reuse. Live picker checks verify explicit selection, ID search and invalidation of stale results.

Relationship networks: figure pages lazily open a native SVG graph with explicit directed figure/organisation/site links, category filters, eight-link expansion pages, a 40-node/100-edge display budget, zoom/scroll controls and a matching keyboard-accessible evidence list. Incoming-only links, reciprocal/cyclic links, separate conflicting labels, merged/Plus evidence and missing records are retained. Worker neighbourhood reads and caching are bounded and disclose incomplete scans. Shared events and vague association fields never create personal edges. A generational family layout and two-record connection search are now implemented; see the newer iteration notes above. 62 Node tests and the live Chrome integration suite pass. Live UI checks cover expansion, category filtering, keyboard focus retention, source evidence, diagram-to-biography navigation and timeline filters while a graph is open.

Timeline reading: All Events, Major Events, Warfare and Personal History presets; optional occupation/movement/affiliation exclusions; shared worker filtering/counts for event directories and record timelines; chronological year groups and URL-persisted filters across linked navigation/reload. 52 Node tests pass. Browser integration covers shared counts, reset, restored controls, year-heading DOM and a 55-event pagination fixture. Live Chrome checks pass for Warfare and Major presets, independent movement exclusion, hidden counts, linked navigation, reload restoration, reset and chronological directory grouping.

Language polish: display-only Title Case for record names, human-readable event headings, and direct prose for settlement, movement, occupations, affiliations, clashes and deaths. Canonical filter keys, source fields, notes and tags retain their original values. 47 automated tests and live browser integration checks pass, including the linked settlement sentence, Title Case display names and preservation of raw source values. Raw event-type searches retain compatibility with the new headings.

Personal research is implemented: record/event bookmarks, plain-text notes and tags, a cross-world research directory, explicit Save with unsaved-change protection and stale-tab rejection, versioned annotation backups, and additive restore/transfer preview. IndexedDB v2 adds a separate annotations store while preserving existing source stores. Deleting a source archive retains annotations.

39 automated tests and the live browser integration suite pass. UI checks cover note save/reload, bookmark/tag search, JSON download, additive restore preview and unsaved-navigation cancellation. Public verification notes describe synthetic fixtures and behaviour; integration-export contents and derived findings are kept out of this documentation.

Earlier completed slices include streaming imports, searchable linked records, narrative event templates, artifact and culture panels, author bibliographies, world terrain and relief, political settlement filters, and conflict overlays. The remaining tasks below track their fuller requirements and qualification limits.

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
- [x] Establish modules for routing, application state, import workers, storage, data queries, event formatting, maps, graphs, and views.
- [x] Document module boundaries and worker message contracts before implementing cross-module features.
- [x] Use relative asset URLs and module-relative worker URLs that work beneath `/armoks-chronicle/`.
- [x] Add a useful no-JavaScript explanation and browser capability checks.
- [x] Add a local static-server command to the README; optional developer tooling must not be required to serve production files.
- [x] Document Pages configuration: “Deploy from a branch”, branch `main`, folder `/ (root)`.
- [x] Configure that Pages source when repository administration access is available; otherwise document the exact manual setting.
- [x] Verify a root page, nested module, vendor file, worker, and asset load from the actual Pages project path.
- [x] Verify no custom build Action or generated output directory is needed. GitHub’s own branch-based Pages publishing infrastructure is acceptable.

**Exit check:** committed static files can be served unchanged locally and on Pages.

## 02 — Export research and compatibility fixtures

- [ ] Catalogue sections, IDs, nested fields, repeated elements, event types, and cross-references in standard Legends XML.
- [ ] Catalogue supplementary fields in Legends Plus XML and define how each supplements standard records.
- [x] Catalogue the world map CSV header/version, dimensions, column types, and coordinate ranges.
- [x] Inspect the pinned DFHack text-report format and LegendsViewer-Next consumer: encodings, site IDs, headings, counts, Unnumbered and names. See `docs/population-and-world-reports.md`; other exporter versions remain unverified.
- [ ] Create a compatibility matrix recording tested DF/DFHack export versions; mark unknown versions as unverified.
- [x] Document the 51 biome code mappings and primary-source provenance in docs/biomes.md; unknown codes remain explicit.
- [ ] Complete version-specific provenance verification for map flag bits, river directions and elevation units; retain raw-unit labels until verified.
- [x] Create redistributable authored fixtures for implemented figure, site, organisation, event, artifact, work/form, era and conflict features, with provenance and licence notes.
- [ ] Extend compatibility fixtures to remaining specialist record families as their typed views are implemented.
- [x] Include fixtures for repeated tags, missing names, empty sections, unknown types, sentinel IDs, and missing linked records.
- [x] Include CP437 names, UTF-8 names, invalid XML control characters, escaped entities, and split multibyte chunks.
- [x] Include truncated XML, malformed CSV, mismatched supplementary exports, and duplicate record IDs.
- [x] Keep original user exports out of public commits unless explicitly authorised; use the attached examples locally for integration checks.
- [x] Reconcile local integration imports against reference totals without publishing export-derived details.
- [x] Record supplied-export baseline verification privately; keep original game-world-derived reference values out of public documentation.
- [ ] Define expected optional-data capabilities separately from required standard-XML capabilities.
- [x] Add authored supernatural fixtures covering supported/unknown/possible states, overlapping evidence, role direction, merged/Plus conflicts and false positives.
- [x] Add competing-government/source-conflict fixtures with conservative ownership-change exclusions.
- [x] Add independently authored structure/property fixtures, including local-ID collisions, missing snapshots, disputed owners and explicit temple dedications.
- [ ] Verify any future recorded-absence mapping before treating it as a negative state.
- [x] Test tied ranks, copied works versus physical artifacts and nested/overlapping casualty totals with authored fixtures.
- [x] Add completed/open/unknown/overlapping office-term fixtures and fair-comparison exclusions.
- [x] Add authored competing-government fixtures for contested-settlement comparisons, including duplicate takeover/leader sources, same-year timing uncertainty, missing targets and conflicting supplementary fields.
- [x] Cover unknown/sentinel ownership, missing battle coordinates and date-filtered conflict events in politics/conflict fixtures.
- [ ] Add a dedicated same-tile settlement fixture and automate chooser behaviour across overlapping site markers.

**Exit check:** fixtures and a documented format contract exist before parser assumptions become application behaviour.

## 03 — Dependency selection and delivery

- [x] Use pinned sax 1.6.1 through the bounded worker parser adapter; verify browser import, fixture behaviour and licence/checksum notices.
- [ ] Record upstream maintenance review and measured large-import memory observations as part of dependency qualification.
- [x] Select and pin a parser release; do not assume a Node/CommonJS package works directly in browser modules.
- [x] Select a browser-ready storage implementation: the initial schema uses an application-specific native IndexedDB adapter, avoiding a wrapper dependency; see docs/architecture.md.
- [ ] Evaluate Cytoscape.js for broader graph layouts when needed; the initial bounded relationship network uses native SVG and a deterministic layout with no added dependency.
- [x] Commit ready-to-run distributions, licences, source/version references, and checksums under `vendor/`.
- [x] Write dependency adapters so application code does not directly depend on library-specific records everywhere.
- [x] Document how maintainers replace vendor files without introducing a production build pipeline.
- [x] Load graph code only when a graph view is opened.
- [x] Verify the application makes no runtime CDN, remote font, or package-registry requests.
- [x] Record why each dependency is needed; avoid a framework, general mapping engine, or chart suite without a demonstrated requirement.

## 04 — Import experience and file validation

- [x] Provide keyboard-accessible file selection and drag-and-drop for multiple export files.
- [x] Preview bounded XML/map/report headers and filename hints, including readable failures for unknown or inaccessible files.
- [ ] Strengthen standard-versus-Plus and report identity validation beyond filename hints before any optional-file enrichment.
- [x] Require standard Legends XML for a complete world; explain what each optional file adds.
- [x] Display detected header formats, sizes, filename-prefix consistency and actionable pre-import manifest warnings.
- [ ] Extract verified world/date clues from source headers for richer manifest identity checks.
- [x] Reject filename-prefix mismatches, duplicate/empty files and missing core XML; disclose filename identity limits.
- [ ] Validate source dates and overlapping record identity before merging enrichment into an existing archive.
- [x] Reject ambiguous mixed-world batches or require an explicit assignment before merging.
- [ ] Allow users to add optional files to an existing compatible world without discarding notes.
- [x] Show reading, combined parsing/saving, supplementary-file and final-index progress stages.
- [ ] Expose separately measurable decoding and merge stages where they improve import feedback.
- [x] Report byte progress where measurable; label indeterminate work honestly.
- [x] Support cancellation during each expensive stage and remove temporary data.
- [x] Handle unsupported files, empty files, permission errors, and worker crashes with actionable messages.
- [x] Keep the previous usable world available if a replacement import fails.
- [x] Show imported record counts, parser encodings, sanitation diagnostics and available explorer entry points.
- [ ] Add a consolidated completion report of unsupported types and unresolved references, with per-feature capability status.
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
- [x] Normalise implemented event aliases and allowlisted reference fields through shared explicit mappings.
- [ ] Extend verified alias mappings for remaining specialist source schemas; preserve unknown raw fields.
- [x] Merge by world, family and ID, retaining authoritative standard values and inspectable Plus source conflicts.
- [ ] Summarise merge conflicts explicitly in import diagnostics instead of requiring source-field comparison.
- [x] Supplement standard events with Plus fields rather than counting both exports as separate event streams.
- [x] Preserve unknown fields/types for inspection and future compatibility.
- [x] Retain nested/repeated source structures and interpret supported written-work and cultural references.
- [x] Add typed entity office definitions and snapshot assignment views with organisation-scoped IDs.
- [x] Add typed interpretation and dedicated views for assumed identities, with source-qualified figure/persona links.
- [x] Add general dedicated views for site structures/properties beyond the source-qualified temple panels. The Structures register, dossiers and settlement property list retain explicit owner/building mapping and source limits; see `docs/structures-and-settlement-life.md`.
- [ ] Verify figure-level position-link and squad-leadership structures before deriving additional office terms from them.
- [x] Parse event collections and nested child collections without recursion loops.
- [x] Validate map CSV v3 columns, dimensions, coordinate bounds/uniqueness, field ranges and complete tile coverage in a worker.
- [ ] Stream map CSV incrementally; the current bounded-size parser reads one complete map text.
- [x] Parse supported population reports conservatively; require settlement ID and exact native/translated name agreement, flag missing/conflicting/duplicate matches, and retain source lines.
- [x] Keep original text-report File blobs with each imported archive.
- [x] Provide a searchable, paged, literal-text reader and original download for saved population and world-history reports, with encoding choices and original line numbers. World-history office/date extraction remains unsupported.
- [ ] Implement DF calendar conversion from verified units; distinguish unknown dates, negative years, and year-only dates.
- [x] Record import/parser versions and original filenames on the world metadata record.

**Exit check:** the supplied world imports with expected standard totals and no duplicate events from Plus enrichment.

## 06 — Data model, indexes, and storage

- [x] Define world-scoped keys for figures, sites, entities, artifacts, events, collections, regions, constructions, identities, works, and art forms.
- [x] Define schemas/adapters for terrain, source relationships, import metadata, annotations and personal chronicles.
- [x] Define bounded population-section, group, source-line and validated-association schemas with pinned exporter evidence.
- [ ] Complete typed creature-definition schemas and compatibility evidence beyond the existing Bestiary adapters.
- [x] Store source provenance and unknown values explicitly.
- [x] Build indexes by name, record type, event year, participant, site, entity, artifact, and collection.
- [x] Build reverse references so biographies and site histories do not repeatedly scan all events.
- [x] Distinguish relationship types, directions, strengths, dates, and provenance.
- [x] Track unresolved references without inventing replacement records or guessed identities.
- [x] Save imports in batches under a staging world ID; expose the world only after successful finalisation.
- [x] Show browser storage estimates and actionable import quota errors.
- [ ] Request and explain persistent-storage permission outcomes, and qualify low-storage behaviour across browsers.
- [x] Add non-destructive IndexedDB v1→v2→v3 store migrations; preserve source records, annotations and chronicles, close version-changed connections and explain blocked upgrades.
- [ ] Exercise failed migration, corrupt-database and quota-recovery cases before v1 release.
- [x] Separate replaceable source indexes from irreplaceable user notes.
- [x] Support multiple stored worlds, world switching, storage usage, and explicit world deletion.
- [ ] Store cached map thumbnails, dimensions, export date, import date, and last-opened time for the world bookshelf.
- [ ] Support explicitly validated world-family grouping and a snapshot selector; keep every snapshot’s records, annotations, indexes, and cache keys independent.
- [x] Cache world-scoped supernatural profiles with bounded source evidence, derivation rule version and Unknown/Possible states; recompute from immutable source records rather than defaulting to false.
- [x] Keep exploration history, caches, bookmarks, and notes isolated by world.
- [x] Coordinate multiple tabs and database upgrades; handle blocked connections and conflicting edits.
- [ ] Provide an in-memory session mode when durable storage is unavailable, with a clear persistence notice.
- [ ] Offer personal-data backup before destructive removal or incompatible migration.

## 07 — Interface, navigation, and visual design

- [ ] Define a readable stone, copper, and parchment palette with measured contrast.
- [x] Use locally bundled fonts with licences, or system fallbacks; keep decorative typography out of dense body text.
- [x] Build a responsive primary-navigation shell, world bookshelf, archive-scoped universal search and labelled page headings.
- [ ] Add a persistent in-explorer world switcher and decide whether cross-world search is useful.
- [x] Implement hash routes for directories, record pages, map, timeline, discoveries, and personal chronicles.
- [x] Add routes for the world bookshelf, Book of Records categories, political map selections, selected-war maps, and faction warfare networks.
- [x] Preserve filters, selected tabs, and pagination in route state where useful.
- [x] Support browser back/forward, copied links, reloads, invalid routes, and missing-world links.
- [x] Explain that a shared record link requires the same locally imported world; do not imply records are hosted publicly.
- [x] Show a bounded, world-scoped recent-record trail with navigable record links.
- [ ] Add multi-step exploration breadcrumbs beyond the current record/Desk/return links.
- [x] Implement reusable record cards, metadata rows, linked references, empty states, loading states, and error boundaries.
- [x] Use textContent/safe DOM construction for all imported names, descriptions, and user notes.
- [x] Provide 44px action/navigation targets, visible focus, named main landmarks, skip links and safe archive-dialog focus restoration; see `docs/mobile-accessibility-performance.md`.
- [ ] Qualify touch interaction and dialog focus with physical devices and representative assistive technology.
- [x] Respect reduced-motion preferences across elements and pseudo-elements; suppress transitions, animation and smooth scrolling. OS/device qualification remains in the accessibility section.
- [x] Provide persisted parchment/dark reading themes with storage-failure fallback.
- [ ] Add an adjustable reading text-size preference.
- [x] Make long names, unnamed records, and unknown races display gracefully.
- [ ] Build a visual world bookshelf with local map thumbnails, dimensions, export date, last-opened time, and clear open/import/delete actions.
- [ ] Group validated related snapshots under one world card with an explicit date selector; offer manual grouping/ungrouping when identity is uncertain.
- [ ] Provide a labelled thumbnail fallback when terrain is unavailable and avoid presenting import time as the in-game export date.

## 08 — Search and directories

Implemented slice: all-family name/ID search, category filter, name/year sorting, linked source-record pages, explicit references and paginated related events. Full biographies and per-directory specialist filters remain open.

- [x] Implement universal name search across all primary record families.
- [x] Normalise case and accents for matching while preserving original display names.
- [x] Support ID lookup, exact matches, partial matches, and deterministic result ordering.
- [x] Filter universal search by record family, timelines by type/date and atlas sites by name/type/faction.
- [ ] Add remaining directory-specific race, status and affiliation filters.
- [x] Add composable vampire, werebeast, necromancer, and deity filters; support overlapping classifications rather than a mutually exclusive creature type.
- [x] Provide Evidence Found/Possible/Unknown filters, supporting source links and explicit uncertainty opt-in; unknown never means ordinary.
- [ ] Add a recorded-absence filter only if a verified export schema can establish negative supernatural evidence.
- [x] Provide sorting, result counts, pagination, and clear-all controls.
- [x] Debounce directory input, compute searches in a worker and suppress stale replies after query/navigation changes.
- [ ] Abort superseded same-world directory worker queries rather than only discarding their replies.
- [ ] Highlight matched text safely and expose result summaries to assistive technology.
- [x] Provide useful no-result suggestions without silently changing the query.
- [ ] Add fuzzy search only if measured user needs justify it; pin and vendor any added dependency.
- [x] Verify search results and filters persist when returning from a record page.

## 09 — Historical figures and biographies

- [x] Show names, race/caste/sex as recorded, birth, appearance, death, and qualified age calculations.
- [ ] Show skills and goals with verified labels; preserve raw labels when a mapping is unknown.
- [x] Show recorded current/former affiliation labels as snapshot claims, separately from dated affiliation events.
- [x] Add typed office/appointment panels and qualified neighbouring-holder interpretation, without inferred inheritance or missing endpoints.
- [x] Link relatives, spouses, companions, rivals, pets, worship, and other recorded relationships.
- [x] Separate close/explicit relationships from vaguely recorded associations, preserving the original relationship label and supporting record.
- [ ] Add dedicated linked panels for notable kills, abducted figures, and structures dedicated to the figure; show counts and source evidence.
- [x] Preserve abductor, victim and killer roles in event prose, evidence and the Grudge Ledger.
- [ ] Interpret dedication references separately from building/ownership when dedicated-structure panels are added.
- [x] Show supernatural badges with explanations and supporting secrets, transformations, interactions, or other verified evidence; show uncertainty when classification is inconclusive.
- [x] Add a chronological life timeline with category and date filters.
- [x] Summarise major recorded events using deterministic templates.
- [x] Show death cause, killer when identified, and location; retain unnamed killer race/caste details.
- [x] Link artifacts held/created, authored works, relevant sites, and event collections.
- [x] Show identities and aliases with a clear distinction between assumed identities and historical figures. Intrigue identity dossiers separate current/used persona links, explicitly named identity figures, tricksters and unmapped nemesis IDs.
- [x] Add recorded journeys and a link to the map; mark gaps and avoid implying continuous travel. Initial verified subject schemas cover state changes, deaths and abductions; other source families remain in the general event timeline.
- [x] Provide raw/source details behind an expandable inspector.
- [x] Display unknown birth/death dates and explicitly avoid inferring survival from a missing death record.
- [x] Add evidence-based supernatural/deity biography panels and overlapping classifications, keeping force markers and worship associations distinct.
- [x] Add specialist deity/religion context with source-qualified worship, membership and temple panels.
- [ ] Extend verified supernatural mappings beyond the conservative initial rules.

## 10 — Settlements, organisations, and geography records

- [x] Create named site record pages with recorded type/coordinates, atlas links, source references and event histories.
- [x] Add dedicated site structure/property panels instead of source-inspector-only nested fields. Settlement pages list structures and properties, with filtered-register links and qualified snapshot roles.
- [x] Show founding, attacks, destruction, reclamation, disputes, and other recorded site events.
- [x] Separate recorded civilisation and current owner in atlas filters, legends and organisation actions.
- [x] Show explicit dated previous/new local-government transitions from supported takeover/leader events, separately from export-time owners and parent civilisations.
- [x] Add curated settlement founding, reclamation, attack, destruction, diplomacy and construction/rebuilding histories with source links, filters and paging.
- [ ] Reconstruct continuous ownership periods only where additional verified evidence can establish continuity; do not fill historical gaps or draw inferred borders.
- [x] Display population reports as source snapshots, including untracked inhabitants and animals; label parsed filename dates as clues rather than independently verified census dates.
- [x] Keep named historical figure counts separate from population rows; never aggregate world, settlement and wildlife scopes or organisation associations into an invented census.
- [ ] Create entity pages distinguishing civilisations, governments, religions, military groups, and criminal organisations.
- [x] Show recorded office definitions, assignments and dated appointments on organisation pages.
- [ ] Add dedicated parent/child organisation and membership panels beyond raw references.
- [x] Add chronological organisation office terms and source-linked earlier/next recorded holders where dates establish order; do not infer exclusive rulership or hereditary succession.
- [x] Link associated settlements, conflicts, worship, and artifacts.
- [x] Create region and underground-region pages, retaining depth and coordinate information.
- [ ] Create pages/details for rivers, peaks, landmasses, and constructions when supplied.
- [x] Provide clear unavailable-data explanations when optional exports are absent.

## 11 — Event language and world timeline

- [x] Define a formatter registry keyed by normalised event type.
- [x] Prioritise readable templates for deaths, wounds, battles, jobs, affiliations, family links, founding, thefts, and artifacts.
- [x] Cover every event type in the supplied example with a readable template or an explicitly labelled structured fallback.
- [x] Support unknown future event types without hiding them.
- [x] Resolve linked names consistently, including unidentified participants.
- [x] Preserve source roles: attacker, defender, victim, killer, witness, author, claimant, and owner must not be conflated.
- [x] Order events deterministically and avoid claiming precise order when timestamps are missing.
- [x] Provide year/range, event-type and preset controls for world and record timelines, plus explicit dated era summaries on the Desk.
- [ ] Integrate era markers into chronological event displays.
- [x] Add event exclusion controls and named reading presets, including a major-events preset that hides routine job and affiliation changes.
- [x] Keep deaths, discoveries, thefts, and conflicts available in the major-events preset; let users inspect and customise the exact included/excluded types.
- [x] Share timeline filter state between event lists, matching/hidden counts and reset controls.
- [ ] Apply the same filters to future timeline charts.
- [x] Preserve event-noise filters in record/directory navigation and distinguish raw versus filtered totals.
- [ ] Add saved searches that retain event-noise settings.
- [x] Support bookmarking and direct links to individual events.
- [x] Add expandable event details showing the underlying fields and provenance.
- [x] Paginate or virtualise event rows without breaking keyboard reading and focus.
- [x] Label generated prose as a rendering of export data; do not invent dialogue, intentions, or causation.

## 12 — Interactive world atlas

- [x] Render terrain from map CSV using Canvas with device-pixel-ratio handling.
- [x] Default to a named Biomes layer with distinct per-biome colours, a world-specific legend and biome-aware tile/hover inspection.
- [x] Render named biome colours, elevation shading, oceans and recorded river connections, including translucent relief ocean surfaces.
- [ ] Add verified peak/volcano markers and complete their source semantics.
- [x] Overlay selectable site markers and linked settlement lists from explicit world-tile coordinates.
- [x] Draw source-verified region/construction coordinate tiles with named selection, source/history links and explicit invalid/disputed/partial coverage; see `docs/maps-statistics-webgl.md`.
- [x] Test flat/relief coordinate orientation, tile bounds and explicit site coordinates; do not guess rectangle conversion.
- [ ] Verify and implement site-rectangle interpretation against matching source definitions.
- [x] Implement pointer pan, wheel zoom, zoom/fit controls and keyboard map navigation.
- [ ] Implement and qualify multi-pointer pinch zoom.
- [x] Provide biome, elevation, evilness and savagery map layers with named biome legend and raw tile inspection.
- [x] Add a raw-index volcanism layer and numeric legend captions for elevation/evilness/savagery/volcanism.
- [x] Display unknown biome/flag codes explicitly instead of assigning guessed terrain.
- [x] Add site-type filters, name search, marker clustering or scale-dependent labels, and selected-site emphasis.
- [x] Add a political settlement layer with stable faction colours, owner legend, individual faction toggles, and show-all/hide-all controls.
- [x] Keep unknown ownership and unaffiliated sites visible as explicit categories; combine colour with labels/shapes for accessibility.
- [x] Add entity-page actions to fit/highlight all associated settlements, distinguishing founding civilisation from current ownership.
- [x] Persist export-time settlement faction selections and dated conflict filters in atlas routes without inventing borders.
- [ ] Add dated political reconstruction only when supported ownership events can establish it.
- [x] Link selected map sites to their record history and centre the atlas from site/event/organisation pages.
- [x] Link named region/construction footprints and selected tiles to source records and supported event-reference histories, with atlas-return state.
- [ ] Provide a coordinate/site-list map fallback when CSV is absent; do not fabricate terrain.
- [x] Draw recorded figure journeys, labelling inferred straight-line connections rather than actual travelled paths.
- [x] Add through-year/single-year controls for explicit historical events, including recorded settlement changes; keep snapshots separate and avoid inferred continuous ownership.
- [x] Label implemented terrain/settlement affiliations as export-time snapshots; year filters affect recorded events, not reconstructed terrain or ownership.
- [ ] Add population snapshot dates and historical-reconstruction limitations when population layers are implemented.
- [x] Add battle markers and paged unlocated lists, retain selected-war scope, and load source-qualified participants/outcomes/named deaths/squad reports on demand.
- [x] Scope the existing conflict-event atlas by explicit nested collection membership, retain selected-conflict URLs, and link the atlas back to its conflict history; collection-level marker/pop-up enrichment remains above.
- [x] Link conflict event markers/lists to event records and conflict collections to scoped atlases with return-to-history links.
- [x] Add collection-level battle tile dossiers with complete-history links and source-qualified counting.
- [ ] Add any future war-level aggregate popup only when a meaningful multi-location representation can avoid inventing one war position.
- [x] Filter conflict-event overlays by recorded date, explicit organisation and selected collection, retaining atlas route state.
- [ ] Unify map and timeline controls where the event/collection scopes are demonstrably equivalent.
- [x] Show location-unknown conflicts in a linked list rather than inventing coordinates; provide a chooser for multiple records on the same tile.
- [ ] Label connecting lines/arrows as associations between conflict locations, never as verified army routes or territorial fronts.
- [x] Supply an accessible linked location list for Canvas-only information.
- [x] Coalesce/cancel atlas redraws, cache relief ordering, cull offscreen site markers and test pointer gesture state without accidental selections.
- [ ] Qualify physical mobile gestures, weaker-device detail and large marker-count frame times.

### Optional atlas setting — Raised Relief

- [x] Implement an initial opt-in isometric Canvas relief preview using stepped exported elevation, with flat-view escape, site selection and a bounded 257 × 257 tile budget. Full 3D interaction remains in the tasks below.

Canvas Raised Relief remains an optional projection. As of the map-first release, supported maps attempt WebGL by default, with flat fallback. It depicts regional elevation as stepped voxel-style columns, not individual fortress blocks or reconstructed underground geometry.

- [x] Provide Flat Atlas/Raised Relief controls and persist the chosen view in atlas URLs.
- [x] Lazy-load the optional native WebGL terrain renderer and geometry only when selected.
- [x] Implement native WebGL without a rendering dependency, remote runtime request or production build step.
- [x] Generate bounded batched top/exposed-side terrain meshes with translucent ocean surfaces and no hidden cube stacks.
- [ ] Verify elevation scale, baseline, water classification, and sea-level interpretation against the export format before displaying height labels; do not imply raw values are metres.
- [x] Apply shared biome colours, translucent ocean surfaces and river overlays to the Canvas relief projection.
- [ ] Add source-verified peak and volcano markers to both atlas projections.
- [x] Provide relief zoom, pan, fit and vertical-exaggeration controls with keyboard alternatives in the fixed isometric projection.
- [x] Add native orbit/tilt/pan/zoom, keyboard/sliders and URL camera state for WebGL terrain.
- [ ] Qualify physical multi-touch and graphics-driver behaviour on reference devices.
- [x] Preserve selected tile/site, layer, faction and conflict filters when switching between flat and Canvas relief views.
- [ ] Preserve arbitrary camera centre/scale across flat/relief switching; current projection changes fit the map.
- [x] Project site markers above Canvas relief terrain and retain site-selector/linked-list alternatives when markers overlap.
- [x] Implement depth-tested terrain/markers and GPU colour/depth tile picking, with an authored occluded-wall case in the focused browser runner.
- [ ] Run the real GPU occlusion, orbit and context-loss cases on a WebGL-capable browser; the cloud browser reports WebGL unavailable. Broader device/driver qualification remains above.
- [x] Project political settlement colours and scoped conflict-event overlays at Canvas relief terrain height using shared source labels.
- [x] Add recorded journey lines with the same evidence limits in both projections.
- [x] Label terrain/footprints/current affiliations as snapshots; year controls affect dated events and battle spans.
- [ ] Disable relief with a useful explanation when elevation data or graphics support is unavailable; retain the accessible location list and flat atlas.
- [x] Explain graphics setup/context-loss failures and return to the flat atlas with historical filters and selection retained.
- [x] Verify unavailable-WebGL fallback, year state, source-return links, 390px reflow, battle dossiers and archive isolation in the live fictional-fixture runner; see `docs/maps-statistics-webgl.md`. Actual GPU/context-loss execution remains open above.
- [x] Bound Canvas relief to 257 × 257 tiles, cache scene rendering, redraw on interaction and release canvases/listeners when leaving the atlas.
- [x] Bound native WebGL terrain, overlay/marker and framebuffer work; suspend hidden-tab paints and dispose GPU resources on exit.
- [ ] Qualify adaptive detail beyond the initial 129-square WebGL budget on reference hardware.
- [x] Avoid automatic relief camera rotation and provide labelled controls plus a Flat Atlas escape action.
- [x] Apply reduced-motion preferences globally; current relief has no animated camera transition.
- [ ] Qualify OS reduced-motion behaviour on physical devices and any future camera animation.

- [x] Add separate organisation actions to fit settlements by recorded owner or recorded civilisation; preserve the source distinction.

- [x] Add river connections from exported direction bits, explicitly inferred adjacent-road links, and a persistent 0.5×–3× regional relief-height control.

## 13 — Artifacts, books, and culture

- [x] Show artifact material/type/description metadata, recorded holder/site references and related creation/history events.
- [x] Add a dedicated evidence-qualified artifact creator/ownership timeline panel for creation, possession, storage, loss, finding, claims and gifts; keep undated holder/site snapshots separate.
- [x] Link creation, theft, gift, claim, storage, loss, finding, possession, and copying events.
- [x] Distinguish claimed ownership, physical possession, and last recorded location.
- [x] Add an Artifact Cabinet gallery with name/material/ID search, type, secret-evidence and holder/place/claim filters, stable paging and reloadable routes.
- [x] Add flavourful artifact dossiers with safe exported inscriptions, distinct holder/place/claimant cards, explicit ownership uncertainty and dated source links.
- [x] Distinguish slabs with recorded secret-source learning from description-only/teacher-ambiguous evidence and unknown secret status.
- [x] Preserve conflicting snapshot sources, missing writing/claimant records, naming-only creation and destruction evidence without inferred survival.
- [x] Recognise nested writing_written_content_id alongside existing writing aliases, deduplicating works and physical-copy counts.
- [x] Connect physical books/scrolls to their written contents.
- [x] Build written-work pages with title, author, form, style, page metadata, and references.
- [x] Do not imply full book text exists when only metadata is exported.
- [x] Build author bibliographies and searchable world-library directories.
- [x] Expose cultural-form records/descriptions and associated works through explicit source links.
- [ ] Add dedicated creator/performance/ceremony panels where verified references exist.
- [ ] Link ceremonies, processions, competitions, and discoveries of knowledge.
- [ ] Add culture and scholarship summaries whose totals link back to their underlying records.
- [x] Add artifact/work/form directory shortcuts with source-family totals.

## 14 — Conflicts, religion, beasts, and intrigue

- [x] Build bounded nested war/battle/attack/duel histories from explicit event collections, including missing/cyclic-link diagnostics.
- [x] Show recorded dates, locations, factions, participant roles, outcomes and separate identified-victim/squad measures in conflict pages; unknown data remains explicit.
- [x] Deduplicate nested events and identified victims; omit parent squad rollups when more-specific reports exist, withhold overlapping/incomplete aggregates, and never add named deaths to squad totals.
- [x] Link abductions, theft collections, persecutions, and site conquests.
- [x] Build deity pages with spheres, associated organisations, worshippers, and relevant structures. Sacred-annals dossiers and figure panels distinguish source snapshots, direct/group-associated temples and dated events; see `docs/deities-and-religions.md`.
- [x] Separate deities from religious organisations and unexplained supernatural forces. Explicit marker/type rules, separate military/other worshipping entities and unclassified targets avoid ontology inference from names, spheres or affiliation.
- [x] Build a bestiary using creature definitions and linked historical figures. See `docs/bestiary.md`: searchable individual/definition views, exact or unique-alias species matching, unclassified fallback, source-linked dossiers and bounded worker indexing.
- [x] Show known attacks, victims, transformations, secrets, and deaths without treating species traits as individual deeds. Bestiary dossiers retain directed roles, unnamed prey, source disagreement and unknown survival; full figure records link existing whereabouts and supernatural evidence.
- [x] Build intrigue views for plots, participants, relationships, assumed identities, and recorded outcomes. The bounded Intrigue Explorer keeps local actor/plot identity, relationship-versus-plot outcomes, justice roles and persona metadata distinct; see `docs/intrigue-explorer.md`.
- [x] Implement conservative supernatural evidence derivation from inspected fields and documented example mappings, with versioned rules and compatibility limits. Broader/localised/modded mappings remain explicitly unverified.
- [x] Keep species, deity status, learned secrets, transformations, and supernatural abilities distinct; absence of a known marker does not prove a figure is ordinary.
- [x] Explain source limits and avoid inferring hidden motives or guilt from membership alone.
- [x] Add “last recorded whereabouts” panels for historical figures (including individually recorded beasts) and artifacts, with source date/event; creature-definition and population whereabouts remain unsupported.
- [x] Handle conflicting or undated location evidence as uncertainty rather than a definitive current position; retain competing latest-year evidence, later unknown locations and missing source records.

## 15 — Relationships and Threads of Fate

Implemented slice: directed source-record networks with family/social/rivalry/affiliation/worship/other filters. Snapshot relationships are separate from dated event reconstruction. Both a network and a bounded generational family layout are available; conflict-event and artifact networks remain open.

- [x] Build a relationship graph adapter with typed nodes/edges and source links.
- [x] Provide person-centred family/social/rivalry/affiliation/worship/other snapshot relationship filters.
- [ ] Add evidence-qualified person-centred conflict and artifact network edges.
- [x] Limit initial graph depth and node count; expand neighbours on demand.
- [x] Provide a bounded generational family-tree layout with multiple recorded spouses and parents, missing/unplaced relatives, shared ancestors and cycle/conflict warnings. Marriage order and remarriage chronology are not inferred from snapshot links.
- [x] Preserve distinct edge meanings; shared battle participation must not imply a personal meeting.
- [x] Add keyboard-accessible equivalent relationship lists.
- [x] Implement two-record connection search using bounded graph traversal in a worker.
- [x] Let users include/exclude broad membership edges that create unhelpful shortcuts.
- [x] Display the shortest found path with every intermediate record, relationship type, and supporting source.
- [x] Report no path, truncated search, and missing data distinctly.
- [x] Support cancellation, maximum path depth, and deterministic results.
- [x] Add graph zoom/reset controls and dispose of graph instances when leaving the view.
- [x] Add a faction-centred warfare network showing explicit opponents, dated source evidence, and links to the underlying wars/battles.
- [x] Let users filter warfare networks by applied years and source conflict type, expand paginated neighbours, and retain bounded node/edge limits and reloadable filters.
- [x] Define edge weights as connected conflict groups, deduplicate nested/shared memberships, and distinguish recorded war aggression from opposing attack/defence roles. Incomplete grouping is qualified explicitly.
- [x] Link the focused faction to its recorded-settlement atlas, displayed factions to records with existing political-map actions, and source conflicts directly to scoped maps; provide an equivalent accessible conflict table.

## 16 — Discovery and story exploration

- [x] Build the Chronicler’s Desk with linked archive totals, recorded eras, reproducible discovery suggestions and a recent record trail; it is the default saved/imported-world landing page.
- [x] Reuse documented lifespan, author, artifact-history and event-rich-site rankings for reproducible Desk discoveries.
- [ ] Define contested-artifact and notable-beast discovery rules beyond event-count proxies.
- [x] Explain each implemented Desk discovery card’s reused ranking criterion and ties, with record and full-ranking evidence links.
- [x] Qualify Book of Records superlatives as among recorded figures/events; disclose ties, unknown dates and incomplete data in each implemented metric.
- [x] Implement bounded, evidence-linked Follow the Thread recommendations from the current record, with directed relationship wording, natural event context, cultural links, explicit conflict membership, category diversity and progressive disclosure. See docs/follow-the-thread.md.
- [x] Keep a navigable twelve-record recent trail and collect it oldest first into a saved, ordered personal chronicle.
- [ ] Consider a longer session traversal history only if the bounded recent trail is insufficient.
- [x] Add category-filtered random previews, an explicit named-record preference/fallback, unbiased bounded sampling and no immediate repeat when alternatives exist.
- [x] Build the Grudge Ledger from recorded killings, thefts, abductions and direct faction conflict sources, with separate explicit grudge links, evidence cards, applied people/faction/place/year filters, reloadable pages and bounded worker caching. See docs/grudge-ledger.md.
- [x] Link ledger participants and factions to their source records and Follow the Thread context, preserving directed snapshot labels and distinguishing war aggression from battle attack roles; later attacks are never labelled proven revenge.
- [x] Compare recorded-event incidences by year, type, explicit settlement/organisation references and referenced figure race, disclosing overlapping groups and missing data. No population census is inferred.
- [x] Supply equivalent semantic comparison tables and paged source-event lists; distinguish event/figure references from total population.
- [x] Cache rankings, relationship neighbourhoods, conflicts, faction networks and ledger calculations per immutable archive; discard caches on world/worker changes.
- [ ] Define invalidation for future in-place source enrichment before enabling mutable archives.
- [x] Build a dedicated Book of Records with category links, ranked tables, highlight cards, source links, and preserved category/page route state. Additional metric and supernatural filters remain below.
- [x] Rank figures by distinct recorded notable kills and show separate named/squad casualty evidence in conflict histories.
- [ ] Add bloodiest-battle rankings and creature-specific ranking controls, preserving overlap/incompleteness rules.
- [x] Include longest and shortest completed office terms (including supported reigns), defining treatment of incomplete dates, concurrent offices, open terms and tied durations. Ruler-only classification is not inferred.
- [ ] Add ruler-specific office/reign controls only when export definitions can support that classification.
- [x] Include Most Contested Settlements using documented, conservatively grouped dated local-government changes; distinguish this from attacks, tribute, surrender and parent-civilisation control.
- [x] Include most copied written works, most prolific authors, and greatest scholars by recorded knowledge discoveries, with separate work/artifact/copy counts.
- [x] Rank completed/open-ended recorded lives and artifact event histories using shared discovery metrics.
- [ ] Add supported travel and geographical rankings with verified definitions.
- [x] Expose metric definitions, eligibility, missing-data exclusions, ties, and source snapshot on each ranking; qualify every superlative as applying to recorded data.
- [ ] Offer supernatural inclusion/exclusion controls on relevant rankings and recalculate results consistently with the selected filters.

## 17 — Personal chronicles, backups, and export

- [x] Bookmark records and events in world-scoped research.
- [ ] Add map-view and saved-search bookmarks.
- [x] Add plain-text research notes/tags and named personal chronicle collections.
- [x] Let users reorder selected records/events into a personal chronicle.
- [x] Keep user commentary visually distinct from source-derived descriptions.
- [x] Provide explicit Save, unsaved-change navigation/unload guards and transactional stale-tab checks for research and chronicle edits.
- [ ] Implement local autosave/draft recovery without weakening stale-tab protections.
- [x] Export/import versioned annotation and chronicle JSON backups with explicit source-world association; chronicle restores create new copies.
- [x] Validate backup format and size; preview merges, conflicts, and missing record references before restoring.
- [ ] Preserve stable world identity and annotations across compatible optional-file enrichment and reimports.
- [x] Treat later export snapshots as distinct datasets unless an explicit, validated annotation transfer is requested.
- [x] Export ordered personal chronicles as Markdown and provide a print-friendly chronicle reading layout.
- [ ] Add standalone plain-text export and print-friendly biography layouts.
- [x] Ensure exported links explain their dependency on locally available world data.
- [x] Make deletion scope clear: source world, derived indexes, annotations, and backups are separate concerns.

- [x] Add record/event bookmark, note and tag editors with explicit Save, unsaved-change guards, and stale-tab protection.
- [x] Add versioned annotation-only JSON export and validated additive restore with explicit target selection and missing-record preview.

## 18 — Offline use and application updates

- [x] Add a project-relative manifest, standalone display and 192/512-pixel icons, plus progressive installation UI.
- [x] Add a project-scoped worker and committed integrity-checked inventory for the shell, lazy views, workers, vendor parser, icons and tiny authored example.
- [x] Keep archives, maps, reports and personal research in IndexedDB v3; cache only explicit shipped assets.
- [x] Verify cache-served reloads/navigation, search and map workers, population reports and saved research/chronicles, with network-rejection runtime tests; see `docs/offline-and-updates.md`.
- [ ] Qualify hardware airplane-mode use, browser eviction and offline launch on reference desktop/iOS/Android devices.
- [x] Version the offline inventory and clean only this project’s cache namespace; retain a previous complete release for older module requests.
- [x] Provide explicit update/reload UI with import, draft and pending-write guards, sole-window activation checks and no unsolicited reload.
- [x] Provide verified cache repair, a missing-shell recovery page and useful missing-module errors; explain that a never-prepared first visit needs a connection.
- [x] Supply manifest/icons and progressive install controls while retaining normal browser use.
- [ ] Qualify native installation prompts and home-screen launching on reference desktop/iOS/Android devices.
- [x] Explain browser/device-local data and eviction, report approximate origin storage and persistence outcomes, and link research/chronicle backups; see `docs/offline-and-updates.md`.
- [x] Test GET/path/origin boundaries and foreign-cache preservation with a project-specific registration/cache namespace.
- [ ] Qualify live coexistence with separately installed sibling Pages apps across reference browsers.

## 19 — Accessibility, privacy, and resilience

- [ ] Target WCAG 2.2 AA for primary import, search, reading, navigation, annotation, and export flows.
- [x] Complete an initial shared-shell and primary-route DOM/layout audit for labels, headings, landmark names, palette contrast and action targets at 320px/390px; see `docs/mobile-accessibility-performance.md`. Verified with 366 Node tests, the full live Chromium suite, 38 narrow-route checks, long-name and enlarged-root-text checks, plus manual keyboard/dialog checks.
- [ ] Complete assistive-technology announcement/focus-order and full rendered-contrast audits.
- [ ] Test complete primary flows with keyboard only and representative screen readers.
- [x] Provide linked lists for mapped sites/conflicts, source-evidence equivalents for SVG relationships and semantic timeline/ranking lists/tables.
- [ ] Maintain equivalent accessible tables for future statistical charts and new map layers.
- [ ] Test narrow screens, long names, 200% zoom, reduced motion, and high-contrast settings.
- [x] Bound XML nesting/text fields, graph/path expansion, conflict calculations, ledger rows/references, recent trails, chronicle entries and backup sizes with explicit messages.
- [ ] Audit aggregate memory and pathological repeated/nested source structures beyond the existing per-field and per-query bounds.
- [x] Test imported script-like names, markup, malicious links, and unsafe note content.
- [x] Keep all parsing and presentation independent of remote services.
- [ ] Add an appropriate static-host-compatible Content Security Policy; account for local modules, workers, styles, and vendor behaviour.
- [ ] Explain local storage, backup responsibility, and the absence of uploads in a concise privacy page.
- [x] Recover interrupted staging imports, preserve usable archives on parse failure and surface blocked upgrades or stale research/chronicle saves.
- [ ] Add guided corrupt-database, failed-migration and future service-worker cache recovery.

## 20 — Testing and performance qualification

Tests may run locally using optional developer tooling. They must not compile production assets or become a prerequisite for branch-based Pages publication.

- [x] Add parser/normalisation tests for fixtures, encodings, alias mapping, sentinel values, and malformed-input handling.
- [x] Add merge tests proving Plus enrichment does not duplicate events or erase richer standard fields.
- [x] Add query/index tests for linked records, unresolved references, date ordering, and world isolation.
- [x] Add formatter tests for roles, unknown dates, missing names, and structured fallbacks.
- [x] Test staging isolation, failed-import rollback, persistent reopen, annotations/chronicles, stale saves, additive/new-copy backups and source-deletion preservation.
- [ ] Automate quota exhaustion, interrupted transactions and failed/blocked migration recovery cases.
- [x] Add map tests for dimensions, coordinate alignment, unknown codes, and absent optional data.
- [x] Add graph tests for cycles, relationship direction, path bounds, and misleading shared-event shortcuts.
- [x] Test overlapping supernatural traits, missing/unsupported markers, generated identifiers, false-positive exclusions and badge/filter agreement with authored standard/Plus fixtures.
- [ ] Expand the compatibility matrix to additional known DF/DFHack versions, translations and mod definitions.
- [x] Test directed family/social/vague relationship categories, source-role wording and graph/list evidence, including shared-event non-friendship.
- [ ] Test future dedicated biography kill/abduction/dedication panels.
- [x] Test tied ranks, physical-copy deduplication, knowledge counts and nested casualty overlap.
- [x] Test completed/open/unknown office terms, repeated appointments, concurrency, source conflicts, tied durations, zero-year spans and both ranking orders.
- [x] Test faction filters/unknown owners, date-filtered/scoped conflicts, missing coordinates and source graph/map routes.
- [ ] Automate same-tile settlement chooser and touch marker selection, beyond the existing conflict tile chooser.
- [x] Test event-noise presets/exclusions across lists, counts, reset and navigation state.
- [ ] Extend shared-filter tests to future charts and saved searches.
- [x] Test stored-world ordering/reopen and exact-world deletion while retaining other worlds, notes and chronicles.
- [ ] Test thumbnails and validated snapshot grouping/ungrouping when those bookshelf features are implemented.
- [ ] Add end-to-end checks for import → search → biography → linked event → map → bookmark → reload.
- [x] Exercise multi-world import/switching, failed import isolation, source deletion and annotation/chronicle restore in the deployed browser suite.
- [ ] Automate the complete optional-enrichment and active import-cancellation user journeys.
- [x] Test the attached sample as a local integration dataset and reconcile counts against the baseline.
- [x] Run documented generated 50,000-event/claim ledger, warfare and faction stress fixtures with bounded output assertions.
- [ ] Qualify a substantially larger authorised real export on reference hardware without publishing its contents.
- [x] Defer specialist view modules and verify the initial bookshelf dependency/resource graph, preserving route cancellation and unsaved drafts.
- [ ] Establish a reproducible reference desktop/device and record import time, stored size, interaction latency, and memory observations.
- [ ] Target visible feedback within 100 ms, indexed search within 200 ms, and common cached-page navigation within 200 ms on the reference desktop.
- [ ] Require a responsive, cancellable import rather than promising an unmeasured fixed import duration.
- [ ] Test memory growth across repeated imports, world switches, graph visits, and map redraws.
- [x] Run the deployed Chromium integration suite and live authored-world navigation checks.
- [ ] Qualify Firefox, Safari and large-world mobile behaviour; record tested versions and limits.
- [x] Verify every runtime asset is present in the repository and no bare package specifiers or build-only imports remain.
- [x] Test an HTTP server mounted at the repository subpath, not only a site served at origin root.
- [x] Test the actual Pages project-subpath deployment, hash-route reloads and module workers.
- [x] Test project manifest/cache scope, simulated network loss, repair, retained versioned modules and live guarded waiting-worker activation/reload while preserving saved research.
- [x] Test relief projection orientation, bounded site coordinates and ocean-surface classification with authored fixtures.
- [ ] Automate visual terrain picking, vertical-exaggeration controls and overlay alignment across flat/relief modes.
- [x] Record live checks of flat/relief switching, URL state and shared biome/site/conflict overlays.
- [ ] Automate switching/keyboard/touch cases and qualify missing elevation, graphics failure and fallback state recovery.
- [ ] Benchmark relief with the supplied 129 × 129 map and a larger fixture on desktop and a weaker device; record frame times, memory use, detail limits, and repeated-open cleanup.
- [ ] Resolve release-blocking errors and record any supported-data limitations in the compatibility documentation.

## 21 — Documentation and v1 release

- [x] Document purpose, live Pages address, supported inputs, local/static quick start and current features in README.
- [ ] Refresh README into a concise release guide with committed authored-example screenshots.
- [ ] Explain how to export compatible Legends/DFHack data, citing tested versions and relevant upstream documentation.
- [x] Explain required versus optional files and features that degrade gracefully without them.
- [x] Document architecture, module/worker boundaries, IndexedDB schema versions, parser licence/version and source adapters.
- [ ] Add a concise contributor recipe for extending event templates and specialist evidence mappings.
- [x] Document branch/main-root Pages hosting, project-relative assets, local serving and pinned parser update/checksum procedures.
- [x] Document supported encodings, malformed/mismatched imports, source uncertainty and absent/unsupported terrain limitations.
- [ ] Create a consolidated troubleshooting page with quota/recovery and future stale-offline-cache guidance.
- [x] Document uncertainty, incomplete event/relationship histories and the distinction between recorded summaries and personal commentary.
- [x] Document supported report snapshots, strict matches, encoding uncertainty, source limits and lack of historical population reconstruction in `docs/population-and-world-reports.md`.
- [x] Document implemented ranking metrics, political/conflict map semantics, event-noise presets and independent archive identity.
- [x] Document supernatural evidence rules, primary-source references, conservative compatibility scope and uncertainty.
- [ ] Document snapshot grouping when that feature is implemented.
- [x] Record LegendsViewer-Next as feature research inspiration with upstream links; retain applicable notices for any code or assets actually reused.
- [ ] Document the opt-in Raised Relief setting, controls, graphics requirements, performance limits, and regional/export-time resolution.
- [x] Document authored-fixture provenance rules and dependency-free Node/browser test commands.
- [ ] Add contributor/compatibility-report templates and a release contribution guide.
- [x] Add appropriate Dwarf Fortress/DFHack attribution and clarify that the app is an unofficial fan project.
- [ ] Add changelog, application version, dependency notices, and known-limitations page.
- [ ] Run the full release acceptance journey below against committed files.
- [x] Confirm production Pages serves `main` root without a custom build/deploy action.
- [ ] Tag v1 only after required tasks are complete or explicitly revised with a documented scope decision.

### Release acceptance journey

- [x] A new visitor understands the app and imports standard XML without registering or uploading data.
- [x] Import matching standard/Plus/map files as one archive, with tested provenance and available features; retain original report files for the in-app reader.
- [ ] Accept optional-file enrichment into an existing archive and preserve research.
- [x] Interpret supported saved population reports and read world-history text without mutating XML records or inventing dated rulership. Verified against runtime `209b7c9` / cache version `0.32.0`: 361 Node tests, the full live browser suite, manual literal-source search/highlight and byte-identical original download; see `docs/population-and-world-reports.md`.
- [ ] The visitor follows a figure → event → settlement → faction → artifact through working links.
- [ ] The visitor uses timeline and map controls to inspect dated history without confusing snapshot data with reconstructed data.
- [x] Family, conflict, culture, discovery and ledger views link their supporting source records.
- [x] Complete and verify the initial bestiary specialist views within documented compatibility limits.
- [x] Complete and verify the initial deity/religion specialist views within documented compatibility limits.
- [x] Complete and verify initial intrigue specialist views within the documented schema, index and sampling limits.
- [x] Discovery cards, relationship paths, and grudges provide interesting, accurately labelled connections.
- [x] The visitor browses the Book of Records and follows a ranked entry to evidence explaining its metric and limitations.
- [x] Verify the complete live supernatural filter → biography → evidence → linked participant journey, retaining filter context and role-specific classifications.
- [x] The visitor selects a faction on the political map, explores a war overlay and warfare network, and returns through working record links.
- [x] The visitor hides routine events, sees matching list/hidden totals and restores all events with one control.
- [ ] Verify matching charts once shared timeline charts are implemented.
- [ ] The visitor chooses a dated snapshot from a world bookshelf card without merging its history or notes into another snapshot.
- [x] The visitor saves and exports a chronicle, restores notes from backup, and resumes after reload.
- [x] Verify the imported fictional archive through cache-served views and a real safe-update/reload, retaining saved data; physical-device offline qualification remains above.
- [x] A second world can be imported and removed without contaminating the first world.
- [ ] Core flows remain usable with a keyboard, on a narrow screen, and with optional exports absent.
- [ ] The visitor enables Raised Relief, adjusts terrain exaggeration, selects a settlement and war overlay, then returns to the flat atlas with filters and selection intact.
- [x] Malformed imports roll back while preserving existing worlds; import cancellation removes staging data with recovery feedback.
- [ ] Qualify oversized imports, quota exhaustion and interrupted cleanup on reference browsers/devices.

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


### Map-first layout

- [x] Put the map above statistics; keep secondary map controls in disclosures.
- [x] Default supported maps to WebGL with an explained flat-map fallback; disable river overlays by default.
- [x] Remove all heatmap controls, computations, demographic-map loading, styling and renderer-specific handling at the user’s request. Heatmaps are no longer in scope.
- [x] Remove heatmap-only fixtures, tests and verification scripts; retain historical statistics, source reports, footprint overlays and battle dossiers.
- [x] Verify the simplified live atlas, absent heat controls, discarded legacy URL settings, source-return routes, year filters, comparisons, battle details, 390px reflow and fallback after removal; 61 focused Node checks pass.

- [x] Default map factions, colours and visibility to recorded civilisation/entity groups, retaining local site ownership as an explicit alternate.
- [x] Make faction/entity map shortcuts prefer civilisation settlements and cover multiple sites with different local owners in the authored fixture.
- [ ] Verify civilisation grouping, shared visibility and source-return state in the live browser.
