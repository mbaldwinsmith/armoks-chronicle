# Armok’s Chronicle

*Every world a history. Every downfall a story.*

A local-first Dwarf Fortress Legends explorer, built with semantic HTML, CSS, and native JavaScript modules. An unofficial fan project, independent of Bay 12 Games and DFHack.

## Current edition: recorded lives and histories

Import standard Legends XML and matching Legends Plus XML in a background worker, save worlds in IndexedDB, reopen them from the bookshelf, browse categories with pagination, and inspect raw fields and supplementary provenance. Imports support progress, cancellation, malformed-file rollback, and unfinished-import recovery.

The parser supports CP437 and UTF-8, reports removed XML control characters, preserves repeated/nested fields, and supplements records by family and ID. Standard values remain authoritative; conflicting Plus values remain inspectable. An in-memory background index supports name/ID search and reverse event references. Semantic event aliases and broader relationship interpretation are planned.

Search any saved world by name, event type, or `#ID`; select a category and sort by name or event year. Open results for recorded facts, explicit references, related events, and source provenance. Search state is retained in the hash URL when following record links. Links identify a local archive and are not shareable hosted records. Existing saved worlds work without reimporting.

Choose **Try a tiny fictional example** on the import page to test without your own files. It is explicitly synthetic, not a game export.

Version 3 world_map.csv exports now power a Canvas atlas with elevation, evilness and savagery layers, selectable sites, pan/zoom, and an optional isometric Raised Relief preview. Existing archives with a saved CSV work without reimport. Text reports remain stored for future interpretation. Search and linked source-record pages are available. Figure pages now show recorded life dates and labelled relationships. Event lists and pages have deterministic prose templates, linked participants, and an explicit fallback for other types. Timelines support type/year filters and a documented major-events preset. Broader biographies, event coverage, specialist networks and offline caching remain in development. Personal bookmarks, notes, tags and annotation backups are available. Reimporting creates a separate archive; enrichment of existing worlds is planned.

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
node --test tests/*.test.mjs tests/preview.cjs
```

Serve the site and open `tests/browser.html` to run module-worker/IndexedDB integration tests with synthetic fixtures. These tests only remove archives they create.


The browser smoke test is optional development tooling. Install Playwright and its Chromium browser in your development environment, then start a static server from the repository's parent directory on port 8000 and run:

```sh
node tests/smoke.cjs
```

The default URL is http://127.0.0.1:8000/armoks-chronicle/; set `BASE_URL` to override it. These tests do not build production assets. See [verification notes](docs/verification.md) for checks and remaining limits.

## Licence

MIT © 2026 Mark Baldwin-Smith. See [LICENSE](LICENSE). The vendored sax parser is separately licensed under Blue Oak Model License 1.0.0; see [vendor notices](vendor/README.md).

## Political geography

Atlas markers can be coloured by recorded current owner or recorded civilisation. Search and site-type filters compose with faction visibility toggles. Faction colours are deterministic, and missing/−1 affiliations have separate labels and marker shapes. Use the faction legend or the paginated linked settlement list for names. Organisation pages provide separate atlas actions for owned settlements and civilisation references. These are export-time settlement associations, not territorial boundaries or dated ownership reconstructions.

## Conflict atlas and terrain overlays

Open **Battles and conflict events** in the atlas to enable grouped red markers, filter by type/year/explicit event organisation, and browse paginated linked events. Events with unknown locations remain in the list. Clicking a marked tile offers a chooser for its events. Conflict event pages have reciprocal atlas links. Event filters do not change terrain or export-time settlement ownership.

Rivers follow exported N/S/W/E connections. Road links are inferred between adjacent flagged tiles. Both can be toggled; relief height can be adjusted from 0.5× to 3×. These settings and conflict filters persist in the atlas URL.

## Artifacts and culture

World records include direct directories for artifacts, written works and artistic forms. Artifact pages show available item/material/page metadata, recorded holders, content links and source-linked event histories. Written-work pages show author/form/style/page metadata and typed references, with reverse lists of physical copies and citing works. Figure pages include paginated author bibliographies. Artistic-form pages present exported descriptions as plain text with paragraph breaks and link to works using that form. Full book text is not included in Legends metadata. Claims, possession, and event locations remain separate evidence.

## Personal research

Open **Your research** on any record to bookmark it, write a plain-text note, add comma-separated tags, and choose **Save research**. The sidebar research page searches and filters saved entries across worlds. Unsaved edits prompt before leaving, and stale saves from another tab are rejected with the draft retained.

Use **Download research JSON** to export annotations for one archive. Restore validates version/size/fields and previews new, existing, and missing-record counts. Select the matching saved world explicitly when transferring to a reimport: names and record IDs alone do not establish world identity. Restore only adds absent entries and never replaces existing entries. Backups contain annotations, not source XML, terrain or a full world archive. Keep your original exports too.

The annotations store is separate from source records. Deleting a world retains notes and bookmarks under **Your research**, with its source marked unavailable. Browser storage clearing can still remove everything; keep backups. IndexedDB schema v2 adds this store without replacing existing worlds. If storage upgrade is blocked, close other app tabs and reload.

### Reading histories

Record timelines and the Historical Events directory offer **All Events**, **Major Events**, **Warfare** and **Personal History** presets. Open **Hide routine events** to exclude occupation, movement or affiliation changes independently, then apply your filters. Major Events keeps unknown types visible. Warfare includes deaths, wounds and abductions even when the export does not connect them to a war.

Chronological views group events by year, with undated records last. Year bounds exclude undated events. The status reports visible and hidden totals; **Show all events** clears timeline filters. Filter choices travel in local hash links and survive reloads. They are independent of atlas conflict filters; saved-search management and timeline charts remain planned.

### Family and relationship networks

On a figure page, choose **Explore family and relationships**. Names in the diagram open their records. Use **Expand a figure** or the buttons in **Recorded Connections** to reveal more links, eight at a time. Filter family, social, rivalry, affiliation, worship or other links; changing the group or resetting starts again from the original figure. Zoom controls and a scrollable diagram keep larger networks usable. The list provides the same links, expansion controls and source evidence with a keyboard.

Arrows point from the source to the figure, organisation or site it lists. A Child label means that the source lists the target as a child; reciprocal roles are shown only when separately recorded. Duplicate merged/Plus links combine evidence; conflicting labels remain separate. Missing records are dashed placeholders. Source evidence links open the supporting record with its source inspector expanded. Strength and date fields, when present, are labelled as source values.

The graph uses explicit `hf_link`, `entity_link` and `site_link` fields, including incoming-only links. Shared events, vague associations and shared membership do not establish personal relationships. Snapshot links do not establish current status or dates. The layout shows connections rather than generations. Display is bounded at 40 records and 100 edges; neighbourhood reads are bounded too, with an explicit incomplete-data notice when reached. Graph code loads on demand and uses native SVG without an extra library or build step. Two-record path searches and a dedicated family-tree layout remain planned.
