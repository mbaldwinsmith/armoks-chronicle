# Offline Reading, Installation and Updates

Open **On This Device · Installation and Storage** above any explorer view. Wait for **Offline Copy Ready** before relying on a connection-free visit. The full static shell, all lazy explorers, import/search/map workers, the vendored XML parser, icons and the tiny authored example are cached. Imported XML, maps, report File blobs, annotations and chronicles remain in IndexedDB v3. No migration or reimport is required, and original world content is not put into the service-worker cache or uploaded.

## Installation and storage

The manifest has project-relative ID, scope and start URL, standalone display and 192/512-pixel PNG icons derived from the existing mark. An in-app Install button appears only when the browser supplies an installation prompt. Otherwise the panel explains the browser’s Install/Add to Home Screen option. Installation is optional and does not imply that preparation completed.

Storage information is approximate and belongs to the origin, including other apps on the same Pages website. Request Persistent Storage is explicit; the result is reported without promising permanence. A browser may refuse it. Clearing site data can still remove both app files and archives. Keep original exports, export research JSON and chronicle backups, and keep them separately. Installing on another device or opening another browser does not transfer worlds.

## Cache and update rules

The registration is scoped to this project directory. Only GET requests for known app paths or the project’s root/index navigation are intercepted. Other projects, external origins, unlisted paths and non-GET requests are left alone. Root/index queries share the canonical cached index; hashes retain the selected explorer route. Module and worker URLs keep their exact version query.

A committed asset inventory pins SHA-256 bytes. Installation downloads at most four files concurrently, verifies the complete download set before writing it, and marks a release complete only after storage succeeds. Failed, redirected, missing or mismatched downloads cannot activate an incomplete release. Runtime cache misses attempt a verified repair; if disconnected, a missing module returns a useful 503 and a missing shell offers the self-contained repair page. If the browser has never loaded this app and has no worker/cache, an initial connection is unavoidable; the app cannot replace the browser’s first-visit offline error.

A new release waits naturally. **Update and Reload** is disabled during active imports, unsaved research/chronicle edits and pending local writes. The waiting worker independently refuses explicit activation unless the requester is the sole in-scope window, so other Chronicle tabs and test/preview windows must be closed first. No tab reloads just because a worker activates. The requesting page reloads only after explicit update consent and a final local activity check. If new activity starts meanwhile, the update stays applied but reload waits for another explicit click. First installation claims clients without reloading them.

Cleanup uses a project-path-specific cache namespace. It preserves the current release and one complete previous release so older versioned modules can finish loading; newer candidate caches are not removed. No broad origin-cache deletion or IndexedDB deletion is used by the service worker. Offline files are not a backup of source data.

## Maintenance without a production build

Static files are committed and served directly from `main` root. When changing runtime assets, update the app’s coherent module/CSS version references, run `node scripts/generate-offline-assets.mjs VERSION`, and commit `offline-assets.js` and the changed `sw.js` release header alongside those files. The helper reads the module cohort from `index.html`. It is optional local maintenance tooling, never a Pages build Action or a prerequisite to serving committed files. A byte change without a regenerated inventory intentionally fails preparation rather than mixing a partial release. Documentation-only edits need no inventory regeneration unless they change cached HTML.

**Prepare Offline Copy** repairs an incomplete current cache and checks for newer releases. **Check for App Updates** asks the browser to fetch the worker and its inventory without using an outdated HTTP script cache. A failed check never erases saved archives. Reconnect and retry after publishing completes if a release was encountered mid-deployment.

## Focused validation

Run `node --test tests/offline.test.mjs tests/chronicles.test.mjs tests/research.test.mjs`. The 23 focused checks cover simulated network loss, exact cached shell/module/worker responses, scope/GET isolation, failed integrity verification, repair/fallback, sole-window activation, scoped cleanup, previous-module retention, import/draft/write blockers, committed hashes/icons/manifest and existing research/chronicle data rules.

The live focused runner is `tests/offline.html`. It verifies the real worker, all inventory entries and cache-served app navigation with import/search/map workers, saved population reports, annotations and a chronicle. It creates one clearly identified fictional proof archive and offers an exact cleanup button. Existing archives are compared for isolation. It does not rerun unrelated specialist/layout suites. Physical-device install prompts, OS home-screen launching, browser-specific eviction and a hardware airplane-mode run remain qualification work; cache-first navigation and network-rejection policy tests are recorded separately from those device checks.

Primary references: [service-worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [skipWaiting](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/skipWaiting), [claim](https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim), and [installability and browser-specific prompts](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

Live verification will be recorded after the published runtime and update flow are checked.
