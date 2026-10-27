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

Runtime module, worker, and stylesheet URLs carry an explicit release query (`?v=0.5.0`) to prevent mixed releases during GitHub Pages cache revalidation. Bump these references together for code releases. This is plain source maintenance, not a build step.

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

Format provenance: DFHack/scripts `exportlegends.lua`, function `export_world_map_metadata`, reviewed 27 October 2026: https://github.com/DFHack/scripts/blob/master/exportlegends.lua . The exporter emits x increasing across rows, y increasing between rows; flags are lake=1, river=2, road=4. River direction bits are N=1,S=2,W=4,E=8. This version retains river bits but does not draw river connections. Elevation is shown in raw export units; biome names and sea-level interpretation are not guessed. Elevation colours are an application palette.
