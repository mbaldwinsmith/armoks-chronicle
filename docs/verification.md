# Faction warfare-network verification

28 October 2026

- 117 Node tests pass. New cases cover nested war/battle/event grouping, counterattacks without reversed war aggression, coalitions without same-side links, one-sided/self/sentinel exclusions, independent/shared/cyclic families, year/type filters, standalone events, uncertain missing/truncated membership, canonical ID ordering, pagination, display/source budgets, cancellation and archive isolation.
- A generated 50,000-pair-role-claim case produces bounded ten-connection neighbour pages and 24-claim source pages. One observed Node 24.22.1 run built and filtered it in roughly 0.5 seconds. This excludes browser storage/rendering and is not a browser latency guarantee.
- The deployed Chrome integration suite passes. Authored standard/Plus fixtures verify that a war and its nested battle/event evidence contribute one group for a faction pair, while record counts and separate source roles remain inspectable. Tests cover neighbour expansion, evidence labels, counterattacks, source-type/year filters, safe semantic HTML tables and cache isolation after changing worlds.
- Live UI on the fictional campaign: the organisation entry opens the dedicated view; expanding the neighbouring faction reveals the third side of a triangle; the table and diagram agree. Inspection exposes four nested source claims behind one group, with collection-history, inspector and selected-conflict atlas links.
- Attack-event and battle-only filters remove war-aggressor arrows while keeping explicit attack-side roles. The selected source type is restored after reload. Applying later years yields the expected empty state without claiming the organisation had no conflicts.
- Draft year edits leave the graph, evidence and URL at their last applied filter values; Apply updates all of them together. Reset and clear retain their stated scope. Zoom in changes SVG size and Fit restores it.
- Additional local checks use the supplied archive through war → organisation → warfare network. Its original names, counts, connections, source contents, derived findings and screenshots are not committed.
- [Faction warfare definitions](faction-warfare.md) explain group weights, non-unique context, missing/truncated grouping, source-role direction, budgets and source compatibility. Graph positions do not claim geography or chronology, and recorded settlements are a separate ownership snapshot.

# Conflict-chronicle verification

28 October 2026

- 105 Node tests pass. New cases cover repeated membership and parent aliases, nested deaths, separate squad reports, rollup exclusion, shared events/victims, cycles/missing data, malformed/zero/unsafe counts, date semantics, stable pagination, role evidence, cancellation, work limits and archive isolation.
- A generated 50,000-event campaign with five battle reports reaches the supported event bound without truncating membership. Participant roles cap explicitly at 5,000 and response pages at 50 events. One observed Node 24.22.1 run indexed and analysed it in approximately 0.6 seconds; this excludes IndexedDB, browser rendering and device-specific costs and is not a browser latency guarantee.
- The deployed Chrome integration suite passes. It imports authored standard/Plus campaign fixtures, verifies that conflicting Plus counts/outcomes do not replace authoritative standard values, and checks nested event/victim deduplication, separate squad subtotals, missing references, safe cards, chronological DOM, contextual event links and world isolation.
- The atlas worker is checked with an explicitly selected battle: only its direct/nested events appear, and unrelated world events are excluded. Collection scope is deduplicated and missing events remain explicit.
- Live UI checks cover the ledger, search during initial index preparation, conflict type filters, nested conflicts, squad reports and section restoration after reload. Chronicle year filtering leaves overview totals unchanged; following an event and returning restores its year context.
- Live atlas checks confirm selected-war scope, source-history return links and scope retention after colour changes and reloads. Existing stored archives work without reimport. Original integration-world names, source records, counts, rankings, derived findings and screenshots are not committed.
- The event-row integration assertion uses the nested chronological event list, keeping year-group headings out of event counts. The campaign ledger also has a proper section heading above its cards.
- See [warfare.md](warfare.md) for primary format definitions, conservative casualty rules, traversal budgets and performance boundaries. Bloodiest-battle rankings and faction warfare networks remain planned.

# Family-tree verification

28 October 2026

- 93 Node tests pass. Eight new layout tests cover target-role direction, reciprocal diagram grouping, several recorded spouses and parents, shared ancestors, missing/unplaced relatives, sibling generations, parent cycles, conflicting roles and self links, merged/Plus evidence, empty families, determinism and forty-node non-overlap.
- The complete deployed Chrome integration suite passes. New worker-backed DOM cases check family-only filtering, parent/spouse rows, missing figures without invented links, safe labels, retained timeline query context, expanding a child to reveal both parents, and returning to the network filter controls.
- A separate authored conflict fixture checks a parent cycle plus incompatible spouse/child claims. Red dashed diagram connectors and equivalent list warnings agree, every source claim remains inspectable, and the display explicitly declines to choose a historical truth.
- Live UI checks cover the dedicated figure-page entry button, layout restored after reload, a linked relative becoming the new family focus, branch expansion, zoom and fit. Original supplied-world checks are local; no original names, counts, source contents, derived findings or screenshots are committed.
- Conflict-line contrast is 3.74:1 against the dark panel and 3.26:1 against the parchment panel. Labels, dashed styles and list warnings provide additional distinctions. SVG bounds reserve room for side-routed conflict labels.
- Limits and uncertainty are documented in [family-trees.md](family-trees.md). Snapshot spouses do not establish marriage chronology, and distant family does not invent intermediate ancestors.

# Book of Records verification

28 October 2026

- 85 Node tests pass, including eight ranking tests covering distinct victims, source aliases, old-age/self/missing exclusions, negative and sentinel life dates, unsafe date ranges, explicitly open-ended records, author/work/artifact counts, repeated references, knowledge events, competition ranks, bounded evidence, empty states, independent worlds and 55-entry pagination.
- The full deployed Chrome integration suite passes. New checks exercise a genuine imported standard/Plus fixture, the ranking worker and cache, resolved source links, completed/open-ended date separation, one physical artifact per written work despite repeated references, safe semantic table construction and world-switch cache isolation.
- Live UI checks confirm the archive entry link, all eight categories, 50-row pagination, page restoration after reload, supporting-work navigation and browser-back restoration. Explicit open-ended-date wording and reference year are visible. Existing saved archives work without reimport.
- Additional integration checks use the supplied export locally. Original contents, names, counts, rankings, derived findings and screenshots are not included in these public verification notes.
- Rankings are limited to the definitions in [book-of-records.md](book-of-records.md). Supernatural filters, reigns and nested battle-casualty metrics remain planned.

# Biome-atlas verification

28 October 2026

- 77 Node tests pass. Biome cases cover the verified 0–50 mapping, distinct valid colours, independence from elevation/alignment, explicit unsupported-code labels, present-only legend totals, bounded aggregation of many unknown codes, and default/explicit layer selection.
- The full live Chrome integration suite passes, including authored map biome codes, named ocean/lake tiles, matching map/legend colours and total counts. Existing import, atlas, graph, connection, timeline, research and isolation checks also pass. Path evidence assertions are scoped to path steps alongside the independent Search Details panel.
- Live UI on the fictional map: a bare atlas opens in Biomes; tile (3,3) reports Temperate Freshwater Lake with code 36; switching to Elevation hides the biome legend; reload restores Elevation and the selected tile; Biomes restores the legend and works in Raised Relief.
- Additional local UI verification with the supplied export confirms default colours, named inspection, flat/relief rendering and translucent oceans. Export-derived names, counts, locations and screenshots are not committed here.
- Zooming and then changing colour layers retains the camera instead of refitting the world. Explicit layer choices are included in atlas hash URLs. Existing stored map data is read without migration or rewriting source values.
- [Biome palette provenance](biomes.md) pins the primary structure definitions and exporter. Colours are application choices; unknown codes are never guessed from other terrain fields.

# Connection-finder verification

27 October 2026

- 71 Node tests pass. New cases cover shortest breadth-first routes, deterministic ties, cycles, unchanged source evidence on reverse traversal, organisation opt-in, depth/record/link/source budgets, complete exhaustion versus limited searches, missing endpoints/intermediates, qualified results after partial scans, same-figure selections and cancellation.
- The live Chrome integration suite passes. Synthetic cases verify a two-step figure path with intermediate records and source evidence, organisation-only routes, original membership roles on reverse steps, no-path and missing-endpoint states, world isolation, AbortSignal cancellation and successful worker reuse afterwards. Existing graph, atlas, timeline, research and storage-isolation cases pass.
- Live UI on authored fictional records: launch from a figure page; search by name and by #ID; explicitly choose a result; render a two-step path with a reverse-link explanation; and retain timeline filters on each record/evidence link. Editing a search input removes the previous result and selection.
- Results distinguish a shortest recorded path from a path found with incomplete search data. Unknown intermediate records are disclosed and not traversed. Organisation paths are excluded by default; site links and shared events do not create shortcuts.
- Path search is bounded, periodically yields in the worker, and is cancelled on figure-page disposal. Search-result counts and missing-data copy use natural singular/plural wording; implementation statistics are available under Search details. Broader cross-browser/screen-reader qualification remains open.

# Relationship-network verification

27 October 2026

- 62 Node tests pass. Relationship tests cover typed categories, source-to-target direction, zero and sentinel IDs, unknown labels, main/Plus evidence deduplication, conflicting labels, incoming-only and reciprocal/cyclic links, exclusion of vague/shared-event associations, neighbour pagination, node/edge budgets, bounded source lists, deterministic non-overlapping node layout and affiliation wording.
- The live Chrome integration suite passes with six authored fictional figures: lazy worker requests, eight/three edge pagination, missing-target placeholders, invalid target counts, merged/Plus evidence, category filtering, incoming family links and equivalent safe SVG/list rendering. Imported script-like graph text remains literal. Existing import, atlas, timeline, research and storage-isolation checks still pass.
- Live UI: launch from a figure, expand more neighbours, filter to Family, expand a child with Enter, retain focus in the figure selector, inspect main/Plus evidence, open its supporting record with the source inspector expanded, and open a biography through an SVG node.
- Major Events filtering works while a graph is open, and both existing and subsequently rendered graph links preserve that timeline choice. Directory and record timeline controls now have distinct IDs so labels target the correct controls when a hidden directory remains mounted.
- Reciprocal connections use opposite curve/label offsets, checked in a dedicated geometry test and the live preview. Fit Network accounts for both diagram dimensions. Zoom and a keyboard-focusable scroll region complement the equivalent linked list. Full cross-browser/screen-reader qualification, dedicated generational family trees and two-record path searches remain open.

# Timeline reading verification

27 October 2026

- 52 Node tests pass. New coverage checks explicit preset membership, unknown types retained in Major Events, composable routine exclusions, inclusive/negative year bounds, undated handling, filter URL round trips, reset isolation, and year groups.
- Live Chrome integration suite passes: shared worker filters/counts in event directories and related timelines; restored controls and reset; semantic year headings; 55 synthetic events split into 50/5 pages and 28 Major Events. Existing import, source-preservation, atlas, research and isolation checks also pass.
- Live UI checks on authored fictional records: Warfare follows a person-to-site link and survives reload; Show all events resets filters; movement exclusion hides the settlement event with an accurate hidden count. The event directory defaults to chronological grouping and Major Events produces the same filtered count.
- Timeline filters are encoded in local hash URLs. Atlas conflict state, saved-search management and timeline charts are separate future work. Warfare includes deaths/wounds/abductions without claiming they belong to a war.

# Language and presentation verification

27 October 2026

- 47 Node tests pass. New cases cover Title Case, Unicode/minor words/internal capitals, settlement aliases, missing locations, visits, occupations/articles, role-specific affiliations, source immutability, old-age deaths and ended marriages without invented causes.
- Synthetic browser fixtures now include lowercase source names and a settlement event, with matching Plus aliases. Browser checks assert the natural linked sentence and unchanged source values.
- Existing role-order tests now assert direct victim/killer prose rather than the previous mechanical phrasing. Untrusted strings remain text nodes; raw descriptions, notes and source fields remain unchanged.
- Live browser integration suite passes, including the synthetic sentence “Urist Examplekeeper settled at Example Copperhall.” The UI renders linked names in Title Case, labels event headings in readable English, and replaces raw reference paths with role labels.
- A new synthetic example import was browsed through figure → settlement event. Its source names remain lowercase in storage. Raw event terms are retained as search aliases for compatibility.

# Verification notes

27 October 2026

## Personal research

- 39 Node tests pass. Research cases cover backup version/format/field/size validation, duplicate record keys, whitelisted round trips, literal note text, and bounded tags.
- Live Chrome integration suite passes using authored synthetic fixtures: annotation persistence across database reopen, stale revision rejection, JSON round trip, explicit transfer to a separate fixture world, additive restore preserving existing notes, and retention after source-world deletion. Cleanup is scoped to synthetic test IDs.
- A pre-existing archive remained accessible after the IndexedDB v1-to-v2 upgrade without reimport. No source stores are rewritten by this migration.
- Live UI on the authored fictional example: bookmark a figure, save a note and tags, reload, and find it in Your research. Search and bookmarks-only filtering retain the saved entry.
- The downloaded research JSON was read back and validated. Selecting it through the file chooser previews existing/new/missing entries. Repeated restore keeps the existing entry.
- Cancelling the unsaved-navigation prompt preserves the draft. The original fictional example annotation was saved afterwards.

## Existing integration coverage

- Parser/preview checks cover bounded reads, CP437/UTF-8, malformed XML, duplicate IDs, source merge precedence, and unknown source fields.
- Browser checks cover module-worker import, source provenance, persistent reopen, staged-world isolation, failed-import rollback, pagination, exact-world deletion and preservation of unrelated worlds.
- Atlas tests cover complete grids, duplicate/missing cells, dimensions, flags, site-coordinate validation, projection, ocean levels, network directions and height scaling.
- Search and narrative tests cover matching, deterministic ordering, typed references, source-role distinctions, missing data, safe text rendering and date/type filters.
- Political filters, conflict groups, unknown locations, artistic descriptions, bibliography/copy/form indexes and metadata disclosure are checked with synthetic data.
- Runtime module/worker/style URLs carry explicit release versions to prevent mixed cached assets. Deployment serves committed files from main without a custom build step.

## Remaining qualification

Storage quota exhaustion, blocked upgrades, all multi-tab UI timings, non-Chrome/mobile/screen-reader qualification, and large-world performance budgets remain open. The transactional stale-save case is tested.

Research JSON contains annotations, not source records or terrain. Map/search bookmarks, named collections, ordered chronicles, autosave, automatic world matching, full-world backups and Markdown/print exports remain planned. Preserve original exports and annotation backups.

Source export contents, names, coordinates and export-derived counts are intentionally excluded from public verification notes. Public test fixtures are authored synthetic examples.
