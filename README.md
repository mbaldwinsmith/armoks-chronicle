# Armok’s Chronicle

*Every world a history. Every downfall a story.*

A local-first Dwarf Fortress Legends explorer, built with semantic HTML, CSS, and native JavaScript modules. An unofficial fan project, independent of Bay 12 Games and DFHack.

## Current edition: searchable archives

Import standard Legends XML and matching Legends Plus XML in a background worker, save worlds in IndexedDB, reopen them from the bookshelf, browse categories with pagination, and inspect raw fields and supplementary provenance. Imports support progress, cancellation, malformed-file rollback, and unfinished-import recovery.

The parser supports CP437 and UTF-8, reports removed XML control characters, preserves repeated/nested fields, and supplements records by family and ID. Standard values remain authoritative; conflicting Plus values remain inspectable. An in-memory background index supports name/ID search and reverse event references. Semantic event aliases and broader relationship interpretation are planned.

Search any saved world by name, event type, or `#ID`; select a category and sort by name or event year. Open results for recorded facts, explicit references, related events, and source provenance. Search state is retained in the hash URL when following record links. Links identify a local archive and are not shareable hosted records. Existing saved worlds work without reimporting.

Choose **Try a tiny fictional example** on the import page to test without your own files. It is explicitly synthetic, not a game export.

Map CSV and text reports are retained as files but not interpreted yet. Search and linked source-record pages are available. Rich biographies, narrative events, maps, offline caching, and personal notes remain in development. Reimporting creates a separate archive; enrichment of existing worlds is planned.

See [PLAN.md](PLAN.md) for the development checklist and [architecture](docs/architecture.md) for module boundaries and the worker protocol.

## Run locally

From the repository directory, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. No npm install, compilation, or build is needed. Opening index.html using file:// is not supported by browser module/worker security rules.

## GitHub Pages

In repository **Settings → Pages**, select:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save. Once GitHub publishes the branch, the site should be available at https://mbaldwinsmith.github.io/armoks-chronicle/.

All deployable assets are committed. `.nojekyll` disables Jekyll processing. No custom build/deploy Action is needed; GitHub's own Pages publishing infrastructure may still appear in Actions. Pages settings and live publication must be verified separately from local checks.

## Export import

Choose standard `legends.xml` and any matching `legends_plus.xml`, `world_map.csv`, `world_history.txt`, and `world_sites_and_pops.txt` files. The preview identifies likely types and sizes. Import requires a matching filename prefix and validates XML structure; filenames alone cannot prove world identity. Plus records are merged by record family and ID. Keep your original exports: browser data can be cleared or evicted.

## Tests

Run the dependency-free parser/preview tests with Node 22 or newer:

```sh
node --test tests/parser.test.mjs tests/preview.cjs tests/exploration.test.mjs
```

Serve the site and open `tests/browser.html` to run module-worker/IndexedDB integration tests with synthetic fixtures. These tests only remove archives they create.


The browser smoke test is optional development tooling. Install Playwright and its Chromium browser in your development environment, then start a static server from the repository's parent directory on port 8000 and run:

```sh
node tests/smoke.cjs
```

The default URL is http://127.0.0.1:8000/armoks-chronicle/; set `BASE_URL` to override it. These tests do not build production assets. See [verification notes](docs/verification.md) for checks and remaining limits.

## Licence

MIT © 2026 Mark Baldwin-Smith. See [LICENSE](LICENSE). The vendored sax parser is separately licensed under Blue Oak Model License 1.0.0; see [vendor notices](vendor/README.md).
