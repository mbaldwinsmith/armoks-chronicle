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

Runtime module, worker, and stylesheet URLs carry an explicit release query (`?v=0.2.1`) to prevent mixed releases during GitHub Pages cache revalidation. Bump these references together for code releases. This is plain source maintenance, not a build step.
