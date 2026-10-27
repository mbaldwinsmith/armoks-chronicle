# Relationship-network verification

27 October 2026

- 61 Node tests pass. Relationship tests cover typed categories, source-to-target direction, zero and sentinel IDs, unknown labels, main/Plus evidence deduplication, conflicting labels, incoming-only and reciprocal/cyclic links, exclusion of vague/shared-event associations, neighbour pagination, node/edge budgets, bounded source lists, deterministic non-overlapping node layout and affiliation wording.
- The live Chrome integration suite passes with six authored fictional figures: lazy worker requests, eight/three edge pagination, missing-target placeholders, invalid target counts, merged/Plus evidence, category filtering, incoming family links and equivalent safe SVG/list rendering. Imported script-like graph text remains literal. Existing import, atlas, timeline, research and storage-isolation checks still pass.
- Live UI: launch from a figure, expand more neighbours, filter to Family, expand a child with Enter, retain focus in the figure selector, inspect main/Plus evidence, open its supporting record with the source inspector expanded, and open a biography through an SVG node.
- Major Events filtering works while a graph is open, and both existing and subsequently rendered graph links preserve that timeline choice. Directory and record timeline controls now have distinct IDs so labels target the correct controls when a hidden directory remains mounted.
- Fit Network accounts for both diagram dimensions. Zoom and a keyboard-focusable scroll region complement the equivalent linked list. Full cross-browser/screen-reader qualification, dedicated generational family trees and two-record path searches remain open.

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
