# Armok’s Chronicle

*Every world a history. Every downfall a story.*

A local-first Dwarf Fortress Legends explorer, built with semantic HTML, CSS, and native JavaScript modules. An unofficial fan project, independent of Bay 12 Games and DFHack.

## Current edition: recorded lives, histories and personal chronicles

Import standard Legends XML and matching Legends Plus XML in a background worker, save worlds in IndexedDB, reopen them from the bookshelf, browse categories with pagination, and inspect raw fields and supplementary provenance. Imports support progress, cancellation, malformed-file rollback, and unfinished-import recovery.

The parser supports CP437 and UTF-8, reports removed XML control characters, preserves repeated/nested fields, and supplements records by family and ID. Standard values remain authoritative; conflicting Plus values remain inspectable. An in-memory background index supports name/ID search and reverse event references. Implemented event aliases and directed relationship adapters preserve source roles; remaining specialist interpretation is tracked in PLAN.md.

Search any saved world by name, event type, or `#ID`; select a category and sort by name or event year. Open results for recorded facts, explicit references, related events, and source provenance. Search state is retained in the hash URL when following record links. Links identify a local archive and are not shareable hosted records. Existing saved worlds work without reimporting.

Choose **Try a tiny fictional example** on the import page to test without your own files. It is explicitly synthetic, not a game export.

Version 3 world_map.csv exports now power a Canvas atlas with elevation, evilness and savagery layers, selectable sites, pan/zoom, and an optional isometric Raised Relief preview. Existing archives with a saved CSV work without reimport. Saved text reports have a searchable reader and conservative population snapshots. Search and linked source-record pages are available. Figure pages now show recorded life dates and labelled relationships. Event lists and pages have deterministic prose templates, linked participants, and an explicit fallback for other types. Timelines support type/year filters and a documented major-events preset. Broader biographies, event coverage, specialist networks and offline caching remain in development. Personal bookmarks, notes, tags and annotation backups are available. Reimporting creates a separate archive; enrichment of existing worlds is planned.

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

Arrows point from the source to the figure, organisation or site it lists. A Child label means that the source lists the target as a child; organisation membership describes the source figure’s affiliation with the target organisation. Reciprocal roles are shown only when separately recorded. Duplicate merged/Plus links combine evidence; conflicting labels remain separate. Missing records are dashed placeholders. Source evidence links open the supporting record with its source inspector expanded. Strength and date fields, when present, are labelled as source values.

The graph uses explicit `hf_link`, `entity_link` and `site_link` fields, including incoming-only links. Shared events, vague associations and shared membership do not establish personal relationships. Snapshot links do not establish current status or dates. The layout shows connections rather than generations. Display is bounded at 40 records and 100 edges; neighbourhood reads are bounded too, with an explicit incomplete-data notice when reached. Graph code loads on demand and uses native SVG without an extra library or build step. A dedicated family-tree layout remains planned.

### Finding a connection between two figures

Choose **Find a connection** on a figure page. The first figure is preselected; search either picker by name or `#ID`, then explicitly choose a match. Select the maximum number of links and choose whether to allow paths through organisations. Organisation paths are excluded by default; sites and shared-event participation never create shortcuts.

The result shows one shortest recorded connection in the available data, preserving the source’s direction and evidence even when a step follows the link backwards. It does not establish a meeting, current status or simultaneous relationships. If a source scan is incomplete, a found route is qualified because a shorter connection may have been missed. No-path, search-limit, missing-endpoint and cancelled results are distinct; missing intermediate records are disclosed and never traversed.

Search runs in the exploration worker with limits of eight links, 500 discovered records, 40,000 examined links and 4,000 fresh source reads, in addition to the documented per-neighbourhood limits. Cancel preserves your selections, and navigating away cancels active work. Source and record links retain timeline filters. No import or database migration is needed for existing archives.

### Biome colours

The atlas opens in **Biomes** by default. Each mapped biome has its own colour, with an expandable legend beneath the map showing names, exported codes and world-tile counts. Hover or inspect a tile to read its biome name. Elevation, Evilness and Savagery remain available under **Colour layer**. Layer choices travel in atlas URLs and survive reloads; changing layers preserves your camera position.

Names follow the DFHack `biome_type` definitions documented in the architecture notes; colours are an application palette. Unknown codes remain explicitly labelled. Biome colours also apply to Raised Relief tile tops, with the existing translucent ocean surface retained. Previously imported maps work without reimporting.

### Book of Records

Open a world and choose **Book of Records** to find notable figures, settlements, artifacts and written works. Eleven evidence-linked rankings cover named kills, completed lives, open-ended life records, prolific authors, eventful sites, knowledge discoveries, artifact histories, recorded physical copies, and longest/shortest completed office terms, and recorded changes of settlement government. Highlights disclose ties; category and page choices survive reloads. Every table explains its metric and exclusions. Open-ended life records do not prove survival, and all categories currently include supernatural figures. See [counting definitions and limits](docs/book-of-records.md).

### Family trees

On a figure page, choose **Open family tree** to explore parents, children and recorded spouses by relative generation. Expand branches on demand, inspect the same directed claims in a readable evidence list, or switch to the relationship network. Missing relatives and conflicting generation claims remain explicit. Layout choice survives reloads and linked figure navigation; existing imports work immediately. See [placement rules and limits](docs/family-trees.md).

### Wars & Battles

Choose **Wars & Battles** in a saved world to browse the campaign ledger. Open a war, battle or duel for its nested conflicts, chronological events, linked people/factions, recorded outcomes and separately explained death measures. The selected-conflict atlas shows only its member conflict events; chronology links provide a return to the conflict. Results are paginated and calculated in a worker. See [counting rules, source definitions and limits](docs/warfare.md).

### Faction warfare networks

On an organisation page, choose **Explore warfare network**. Expand recorded opponents, filter years and source conflict types, and inspect an accessible table with links to supporting wars/battles and their maps. Arrows distinguish recorded war aggressors from battle/raid attack sides. Nested and overlapping collection sources contribute once per conflict group, with uncertainty kept explicit. See [counting rules and bounds](docs/faction-warfare.md).

### The Chronicler’s Desk

Opening an archive now starts at the **Chronicler’s Desk**: linked record totals, recorded eras, evidence-based starting points, a category-aware random picker and your recent twelve-record trail. Browse All Records preserves the existing directory and search flow. Discovery cards reuse Book of Records rules; unknown era ends stay unknown, and random previews do not write reading history. The trail is local, world-scoped and separate from saved research. See [rules and limits](docs/chroniclers-desk.md).

Record pages include **Follow the Thread**: bounded suggestions across family, places, works, events and conflict membership, each with a recorded reason and supporting source. See [Follow the Thread](docs/follow-the-thread.md).

The **Grudge Ledger** separates recorded killings, thefts, abductions and faction conflict sources from explicit grudge links. Applied people, faction, place and year filters retain evidence and uncertainty. See [Grudge Ledger](docs/grudge-ledger.md).

## Personal Chronicles

Collect records while browsing, add bookmarks or the recent reading trail, arrange their order and write your own commentary. Chronicles have a clean reading/print view, Markdown export and a versioned JSON backup that restores as an explicit new copy. Existing source archives and notes survive the IndexedDB v3 upgrade; deleting source data retains your collected story. Save edits explicitly, and export a backup to keep a separate copy. See [Personal Chronicles](docs/personal-chronicles.md).

PLAN.md has also been [reconciled against implementation and verification evidence](docs/plan-audit.md): completed work is checked off, and partially completed tasks are split so remaining v1 requirements stay visible.

Feature planning was informed by [LegendsViewer-Next](https://github.com/Kromtec/LegendsViewer-Next). Runtime dependency notices are recorded under `vendor/`; the explorer uses native SVG/Canvas and application-specific source adapters.

## Supernatural History

Choose **Supernatural Figures** on a world’s Desk or filter the Historical Figures directory. Combine vampire, werebeast, necromancer and deity evidence, optionally include possible matches, then inspect the supporting fields and events in each biography. Secrets link learners, teachers and artifacts; interactions and transformations retain their actual source roles. Unknown evidence never labels a figure ordinary. Existing archives work without reimporting. See [rules, sources and limits](docs/supernatural-history.md).

## Recorded Whereabouts and Journeys

Figure and artifact pages now show **Recorded Whereabouts**: source-linked appearances, qualified latest-location evidence and an atlas link. Repeated visits get numbered markers in the flat atlas and Raised Relief. Optional dashed lines connect ordered observations; they are not actual travelled paths. Missing places, uncertain dates and conflicting records remain visible. Artifact claims, recorded possession, transfers and undated holder/site snapshots stay distinct. Existing archives work without reimporting. See [supported events and limits](docs/recorded-journeys.md).

## Offices and Succession

Historical figure and organisation pages now show **Offices and Succession**: dated appointment/removal terms, explicit appointers, neighbouring recorded holders and separate export-time assignment snapshots. Missing ends, uncertain handovers and overlapping holders stay visible. Book of Records adds **Longest** and **Shortest Completed Office Terms**, comparing separate eligible calendar-year spans with both source events. Office definitions do not automatically identify rulers or hereditary successors. Existing archives need no reimport. See [evidence rules, pairing and bounds](docs/offices-and-succession.md).

## Settlement Chronicles

Site pages now offer a **Settlement Chronicle** with founding, reclamation, attacks, destruction, government/diplomacy and structure construction/rebuilding records. Category/year filters and source/map return links preserve your reading context. **Most Contested Settlements** ranks conservatively grouped dated changes of local government, with supporting events and clear exclusions. Export-time owners remain separate; an attack does not automatically change ownership. Existing archives need no reimport. See [sources, counting rules and limits](docs/settlement-chronicles.md).

## The Artifact Cabinet

Choose **Artifact Explorer** on the Desk for a gallery of relics, slabs and written objects. Filter by type, secret evidence, named holders/places or recorded claims. Each dossier asks **Who Owns It?**, **Who Has It?**, **Where Is It?** and **Who Claims It?**, keeping those relationships distinct. Slab inscriptions and secret-learning sources are prominent; description hints and unknowns remain qualified. Native relic marks and dry editorial asides add some dwarven character without inventing history. Existing archives need no reimport. See [evidence rules and bounds](docs/artifact-cabinet.md).

### The Bestiary

Open **Bestiary** from the Chronicler’s Desk to browse creature definitions and linked historical figures. Search species or individuals, inspect recorded attacks, victims, transformations, secret-learning and deaths, and follow each source. Unclassified/all-creature scopes support archives with missing definitions; species traits never become invented individual deeds. See [Bestiary evidence and limits](docs/bestiary.md).

### Deities and Religions

Open **Deities and Religions** from the Chronicler’s Desk to browse recorded gods, religious organisations, forces and unclassified worship targets. Search spheres, follow named worshippers and separate membership links, explore direct versus group-associated temples, and inspect religious history. Relevant figure, organisation and settlement pages include a Faith and Worship panel. See [evidence rules and limits](docs/deities-and-religions.md).

### The Intrigue Explorer

Open **Intrigue Explorer** from the Chronicler’s Desk to browse source-recorded plots, corruption/justice events and identity records. Follow explicitly named participants and local plot references, inspect current/used personae, and filter dated events by recorded state. Figure and identity pages have specialist panels. Plot outcomes, guilt, executions and identity users are never inferred from unrelated fields. See [evidence rules and limits](docs/intrigue-explorer.md).

### Structures and Settlement Life

Open **Structures and Settlement Life** from the Chronicler’s Desk to browse exported libraries, taverns, keeps, guildhalls, temples and other buildings. Follow separate inhabitants, property owners, organisations, dedications and building histories. Settlement, figure, organisation and artifact records link their recorded building associations. Missing snapshots and destruction records never imply a building’s present condition. See [source rules and limits](docs/structures-and-settlement-life.md).

### Population and World Reports

Open **Population and World Reports** from the Desk to read saved population and world-history reports, search original lines, download the original files and browse conservative population snapshots. Verified settlement matches add source-linked panels to site and organisation pages. Unknown counts, wildlife, named historical figures and disputed affiliations remain distinct. Existing archives work when the report files were saved with them. See [format evidence, matching rules and limits](docs/population-and-world-reports.md).
