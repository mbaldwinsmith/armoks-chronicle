# Language and presentation verification

27 October 2026

- 45 Node tests pass. New cases cover Title Case, Unicode/minor words/internal capitals, settlement aliases, missing locations, visits, occupations/articles, role-specific affiliations, source immutability, old-age deaths and ended marriages without invented causes.
- Synthetic browser fixtures now include lowercase source names and a settlement event, with matching Plus aliases. Browser checks assert the natural linked sentence and unchanged source values.
- Existing role-order tests now assert direct victim/killer prose rather than the previous mechanical phrasing. Untrusted strings remain text nodes; raw descriptions, notes and source fields remain unchanged.
- Live verification is pending publication.

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
