# Application architecture

The committed repository is the deployable site. Native browser ES modules load from index.html. There is no build step or custom Actions workflow.

## Boundaries

- `index.html`: semantic shell, fixed controls, view sections, reusable row templates.
- `css/app.css`: responsive layout, reading themes, focus states, reduced motion.
- `js/app.js`: bootstrapping, feature checks, theme controls.
- `js/router.js`: hash navigation, page visibility, document titles, focus on navigation.
- `js/state.js`: session state and namespaced reading preference storage.
- `js/views/import-preview.js`: file selection UI and worker lifecycle.
- `js/import/preview-worker.js`: bounded header inspection, no XML parsing or persistence.
- `js/data/`: future schemas, storage, query indexes, and migrations.
- Future `js/events/`, `js/maps/`, and `js/graphs/` modules own event formatting, atlas rendering, and relationship layouts respectively. Add them with their implementation.

All imported strings go through textContent. The view receives file metadata, not HTML. The preview reads at most 8 KiB from each file and is limited to 50 selected files. It is not a format validator: supplemental XML identification currently uses a filename hint after checking the world root.

## Preview worker contract

Request: `{ type: 'preview', requestId: number, files: File[] }`.
Per-file response: `{ type: 'file', requestId, index, name, size, kind }`.
Completion: `{ type: 'complete', requestId, count }`.

A newer selection or Clear terminates the old worker and increments requestId. Messages for stale request IDs are ignored. File-read failures produce an explicit per-file label. Worker failures produce a recoverable UI message.

The full import protocol will add cancellable decoding/parsing/merge/index/save stages, staging-world IDs and structured diagnostics. It must not reuse preview labels as proof of compatible worlds.

## Hosting and navigation

Use relative asset URLs and worker URLs resolved against import.meta.url. Hash routes work under `/armoks-chronicle/` without rewrites. Unknown hashes show a recovery page. No service worker is registered yet, so this edition does not promise offline reloads.

All future stored data must use world/snapshot-scoped keys. Theme preferences use `armoks-chronicle:theme`; blocked localStorage is tolerated. Libraries belong under vendor/ with their licences. Tests are developer-only and never required to publish the committed site.

## Local archive iteration

`js/import/parser.js` streams SAX events in 64 KiB chunks and emits records per top-level family. `encoding.js` explicitly decodes CP437; UTF-8 uses a streaming fatal TextDecoder. DTDs, duplicate IDs, unsupported encodings, excessive nesting, and malformed XML are rejected. Sanitisation only removes forbidden C0 XML controls and reports the number removed.

`js/import/import-worker.js` accepts `{type:'import', worldId, files: File[]}` and emits `progress` (stage, percent or null), `complete` (world metadata), or `error` (message), all carrying worldId. Each selected import has a unique ID. Terminating the worker cancels work; the UI then deletes that exact staging world. Errors trigger cleanup in the worker. Interrupted imports remain staging and can be explicitly discarded after closing other import tabs.

`js/data/database.js` uses native IndexedDB, with worlds, records, and supplementary files stores. Records have compound world/family/ID keys and world/family indexes. Standard XML is loaded first, then Plus. Merged data retains standard values; raw supplementary records preserve conflicts and source provenance. This is structural merging, not semantic alias normalisation. No server, database dependency, or build is needed.

Worlds are exposed only after all writes complete and status becomes ready. A failed import never replaces a ready world. Each import is a distinct snapshot. Map and text files are stored as Blobs for later feature work. Reopening and raw record pagination use indexed reads; UI receives only one page at a time.

`js/views/worlds.js` renders saved worlds, record pages, import diagnostics, exact-world deletion, and staging recovery. Navigation uses `#/world/<local-id>`; such links require the same browser storage. No sharing or offline reload guarantee is implied.

Native IndexedDB was chosen for this limited schema to keep browser-ready distribution simple. Broader migrations, annotation conflict handling, quota estimation, advanced search indexes, and in-memory fallback remain planned; quota errors already produce explicit import failures.

## Asset updates

Runtime module, worker, and stylesheet URLs carry an explicit release query (`?v=0.14.1`) to prevent mixed releases during GitHub Pages cache revalidation. Bump these references together for code releases. This is plain source maintenance, not a build step.

## Exploration (0.3.0)

`explorer-worker.js` reads one ready world via the IndexedDB world index and retains compact names/dates and a reverse-reference index. Full source records stay in IndexedDB. Search folds case and accents, supports exact #ID and partial names, sorts deterministically, and returns 50 rows. The initial index is rebuilt per world/session; no database migration or reimport is required. Queries run in the worker; input is debounced and stale responses discarded. Large-world memory/latency targets are not yet qualified.

`exploration.js` is the shared pure search/reference policy. Only explicit allowlisted ID fields become references. Ambiguous fields and negative sentinel IDs remain source data. References from standard and Plus fields both contribute; reverse event results deduplicate each event. A reference is not interpreted as a current relationship. Related events sort by recorded year, raw seconds72, then ID; unknown dates are last. Calendar conversion and prose templates are deferred.

Directory query/filter/order/page state lives in the hash query and travels with record links. Record routes are `#/world/:world/record/:kind/:id`. User-controlled strings are rendered with textContent. Navigation invalidates pending render work; changing worlds releases the worker index.

## Narrative rendering (0.4.0)

`data/narrative.js` canonicalises selected known event aliases and defines 28 deterministic token templates. Tokens are plain text or typed record IDs. `views/narrative.js` resolves names in a batch and creates text nodes/links; no export text is interpreted as HTML. Known standard field names take precedence over aliases when both occur. Raw merged fields and raw Plus provenance remain inspectable. Unsupported types use a labelled fallback, so no event is silently dropped.

Event text is hydrated only for the visible page, without retaining all source event data in the worker. The compact worker index now includes canonical event types. Related-event filtering happens before pagination; counts, hidden totals, and results use the same predicate. Major events hides only the documented routine types, retaining unknown types. Year ranges exclude undated events, support negative years, and persist in record hash parameters. Figure summaries never infer survival from missing death dates; calendar-year differences are explicitly qualified, and relationship labels retain the source direction without asserting current status.

## Atlas (0.5.0)

The atlas worker reads saved File blobs and site records from IndexedDB, with no schema changes. Only DFHACK_WORLD_MAP version 3 is currently accepted; dimensions are capped at 1025, file size at 64 MB, and rows require complete unique in-bounds integer coordinates. Invalid files fail visibly. Site `coords` are world tile positions; site rectangles are retained as source data and not rescaled or interpreted.

The flat canvas caches one pixel per tile and scales without smoothing. Canvas output accounts for device pixel ratio (capped at 2). Native Canvas is also used for an isometric stepped-column preview, capped at 257 × 257. Relief is a regional elevation illustration with fixed exaggeration, not a free-camera WebGL scene. It builds only when requested. Projection picking uses a colour-ID buffer. Both views expose a site selector, selected-tile linked list, numeric coordinate controls and keyboard pan/zoom.

Format provenance: DFHack/scripts `exportlegends.lua`, function `export_world_map_metadata`, reviewed 27 October 2026: https://github.com/DFHack/scripts/blob/master/exportlegends.lua . The exporter emits x increasing across rows, y increasing between rows; flags are lake=1, river=2, road=4. River direction bits are N=1,S=2,W=4,E=8. River connections are drawn from these bits. Elevation is shown in raw export units; biome names now use the verified enum mapping described below. Elevation colours are an application palette.

Relief ocean fill (0.5.2): translucent top and side faces cover non-lake tiles below elevation 100. Terrain retains its exported seafloor elevation; picking and marker projection use the water surface. Faces are drawn in the same back-to-front tile order as terrain so dry land occludes water correctly. Classification follows DFHack `Maps::getBiomeTypeWithRef` (lake first, then elevation < 100 for oceans): https://github.com/DFHack/dfhack/blob/develop/library/modules/Maps.cpp . Lakes retain their own exported levels.

Relief sharpness (0.5.3): colour geometry is rasterised at up to 4× the original linear resolution (16× pixels), with a 16-million-pixel buffer budget. High-quality resampling is enabled for relief; the flat tile atlas retains nearest-neighbour rendering. Logical map coordinates, marker positions, zoom and the picking buffer are independent of colour-buffer resolution.

Political geography (0.6.0): the atlas worker reads entity labels and copies site `cur_owner_id` and `civ_id` into distinct fields. `politics.js` resolves groups and pure filters; unknown/missing values and the explicit −1 sentinel remain separate categories. ID zero is valid. Colour hashing is deterministic by entity ID. No field is inferred from the other. `basis`, `hidden`, `siteQ`, and `siteType` hash parameters preserve political filter state through view switches/reload. Organisation atlas links use `faction` plus `basis` to isolate and fit matching settlements. The site selector, marker set, selected-tile links, and paginated accessible list use the same filtered records. Legend counts describe all mapped sites per group; the visible match count describes active filters.

Conflict atlas (0.7.0): the worker makes a compact event index for an explicit allowlist of battle, attack, destruction, plunder, wound, death and abduction types. Location precedence is referenced site coordinates, then explicit in-bounds event coords, otherwise unknown. No region-centre location is fabricated. Organisation filters use explicit event organisation fields, independently of present-day site affiliation. One filter predicate drives event list, counts, marker groups and selected-tile chooser. Source event pages retain participant roles and raw evidence. Year/type/faction and overlay state lives in the hash query.

Rivers use exported cardinal direction bits. Road segments connect neighbouring flagged road cells and are labelled as inferred. The atlas draws tile-centre connection lines at the shared projected tile elevation; these are regional connections, not surveyed local paths. Height exaggeration is 0.5–3 and changes geometry, picking, water and marker projection together. Relief buffer bounds account for increased height.

Culture (0.8.0): `culture.js` supplies contextual references for artifact `writing`→written content, work author/form, and typed work references. Ambiguous `author`, `form_id` and `reference.id` fields are never globally interpreted outside their source family/context. Unknown reference types remain raw source data. The worker merges these edges into the reverse-reference index and supports paginated `associations` requests. This enables author bibliographies, physical-copy lists, citing works and form-linked works without repeated full-world scans. Raw Plus fields remain inspectable when merged values differ. Source `[B]` description markers become paragraph boundaries; other source strings remain literal text nodes. Item-name fallback labels are computed on read, without reimport or database migration.

Research (0.9.0): IndexedDB v2 adds `annotations` keyed by world/kind/id with a world index. The v1 stores are created only on a fresh database; upgrading adds annotations without rewriting source data. `deleteWorld` intentionally does not touch annotations. Database connections close on version changes; a blocked open is rejected and closed if it later succeeds.

Research saves compare expected revision inside a read/write transaction, rejecting stale tabs without overwriting saved data. The editor uses explicit Save, route-leave confirmation and a beforeunload guard. Draft text is retained after save errors. Backup v1 is a whitelisted annotation/world JSON format, capped at 5 MB, 10,000 entries and bounded note/tag fields. Restore previews missing references and requires an explicit target for different local world IDs. A single transaction checks the target world and adds only missing keys; concurrent existing entries are retained. This is annotation backup/transfer, not full world export or automatic world-identity matching.

Display language (0.10.0): presentation helpers apply Title Case to proper record names, retaining minor title words and recognised acronyms/internal capitals. Friendly event headings are separate from canonical type keys, so date/type filters and reference identities keep the same values. Display labels are computed when reading existing archives and do not rewrite exported fields or user notes. Common settlement/visitor/wanderer states, occupations, memberships, enmities, captivity and deaths have direct prose templates. Unknown states/types retain a labelled fallback. Ended spouse links do not imply divorce, prisoner-link removal does not imply escape/release, and claims do not establish ownership. Raw fields remain literal in source inspectors.

## Relationship networks

`views/relationships.js` is dynamically loaded from the figure-page launch button. It renders safe native SVG and a semantic list; `data/relationships.js` owns typed edge extraction, category policy, bounded merge and deterministic layout. The exploration worker loads this adapter only for relationship requests, reads the selected figure and candidate incoming figure records using the existing reverse-reference index, and filters actual explicit relationship fields. It caches at most 16 neighbourhoods per world.

Each neighbourhood reads at most 500 candidate source records, at most 5,000 link children per record, and keeps at most 4,000 incident edges. Expansion returns eight edges at a time; the view bounds the network to 40 nodes and 100 edges. Reaching any read limit marks the result incomplete. Evidence carries merged/Plus origin, source fields, available source strength/date values and an explicit source-record link. No event co-occurrence or inferred reciprocal edges are introduced. No database migration is required.

## Connection search

`data/connections.js` implements async breadth-first traversal through injected neighbour/existence adapters. The worker reuses bounded neighbourhood reads and reverse references for figures and optional organisation intermediaries; it never derives edges from event co-occurrence. It preserves the exact supporting edge and traversal direction at each hop. Complete searches can claim shortest recorded paths; truncated source/graph searches qualify their results.

The search bounds depth, discovered nodes, examined links and fresh source reads separately. It yields periodically and accepts cancellation messages outside the serial request queue. `explorer-client.js` accepts an AbortSignal, cleans listeners on completion/navigation and discards aborted responses. `views/connections.js` provides explicit name/ID selections, progress/cancel controls, linked path steps and source evidence. Figure-page disposal aborts a search on navigation.

## Biome layer

`data/biomes.js` owns the verified numeric code/name map, immutable palette, unknown-code fallback, layer validation and world legend aggregation. See [Biome provenance](biomes.md) for pinned primary sources and compatibility limits. The atlas defaults to Biomes when no valid layer is requested, stores explicit `layer` state in its hash URL, and uses the same biome colours in flat and relief rendering. Colour-only changes preserve camera and selection. Existing saved CSV files need no migration.

## Book of Records

A lazy `records` explorer-worker request scans the selected archive once with `createRecordBook`, using merged records and recognised explicit references. It retains ranked summaries, counts and up to five evidence links per entry, not full source records. Category/page queries use the same world-scoped worker cache. View disposal aborts requests and cursor aggregation; world switches clear the cache. Definitions, evidence rules and remaining metrics are documented in [book-of-records.md](book-of-records.md).

## Generational family layout

The relationship panel shares its bounded neighbourhood worker, expansion state and accessible evidence list between network and family layouts. `data/family-tree.js` creates diagram-only canonical constraints and marks conflicts without altering directed source edges; `views/family-tree.js` draws native SVG. Record routes retain `relationships=family|network`; record disposal aborts outstanding panel requests. See [family-trees.md](family-trees.md).

## Conflict chronicles

`data/warfare.js` owns collection facts, iterative containment, conservative casualty analysis and bounded pages. The explorer worker lazily indexes compact collection/event/site records with world-kind cursors, clears them with the selected world and caches eight derived summaries. `views/warfare.js` renders a paginated ledger and one detail section at a time. Record disposal aborts requests; raw collection JSON remains lazy. The atlas worker can scope its existing event overlay by the same explicit membership traversal using `collection=ID`. See [warfare.md](warfare.md) for supported fields, limits and source provenance.

## Faction warfare networks

`data/faction-warfare.js` derives explicit opposing-side claims and conservative connected-family groups from the conflict index. The explorer worker lazily caches that derivation plus four filtered adjacency indexes. Requests return bounded neighbour pages or selected-edge evidence pages. `views/faction-warfare.js` provides a dedicated organisation route, safe SVG and an equivalent HTML connection table; graph layout code loads only when that view opens. World changes and navigation dispose caches/requests through the existing worker client. See [faction-warfare.md](faction-warfare.md).

## The Chronicler’s Desk

The `/world/ID/desk` route displays metadata immediately, then requests bounded discovery/era summaries from the existing explorer worker. Discovery cards reuse the Book of Records cache. Compact index rows add explicit-name and era metadata for random selection and era paging. `data/desk.js` implements pure selection rules; `data/trail.js` provides a capped, world-scoped localStorage history cache independent of IndexedDB annotations. Source deletion attempts to clear only its trail key. Desk disposal aborts pending requests and removes its storage listener. See [chroniclers-desk.md](chroniclers-desk.md).

Follow the Thread reuses the worker reverse-reference index, augmented with explicit collection membership/participant roles from the existing conflict adapter. Requests read at most 61 source records, examine up to 500 references per source, and return at most 36 distinct available suggestions with three source links each. The view initially renders six cards; navigation aborts requests and stale results cannot update the record. See [Follow the Thread](follow-the-thread.md).

The Grudge Ledger uses a lazy world-scoped compact worker cache built from indexed event, collection and figure records, reusing the existing source adapters. Its explicit 500,000-source, 100,000-entry and 24-reference bounds are disclosed; cancellable filters return only 24 cards per page. Hash routes preserve applied filters, dates, order and page, while record/evidence links carry return context. See [Grudge Ledger](grudge-ledger.md).

## Personal chronicles and IndexedDB v3

The native storage adapter upgrades v1/v2 databases by adding a `chronicles` store keyed by collection ID, with a world index. Source records and annotations are retained. The pure chronicle adapter validates ordered entries, reference uniqueness, field/backup limits and Markdown escaping; transactional revisions prevent stale-tab overwrites. World deletion never touches the chronicle store. Views collect record snapshots, bookmarks and a bounded recent trail, keep explicit draft/save state, and provide a source-qualified reading/print layout. Separate versioned JSON backups restore only as new copies with explicit archive association. See [Personal Chronicles](personal-chronicles.md).
