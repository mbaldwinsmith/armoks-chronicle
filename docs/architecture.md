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
