# Local archive iteration verification

27 October 2026

## Passed

- Eight Node tests pass (`node --test tests/parser.test.mjs tests/preview.cjs`): nested/repeated/unknown XML fields, entities, CP437, invalid control counts, UTF-8 chunk boundaries, duplicate IDs, malformed XML, DTD rejection, unsupported encodings, merge precedence, filename manifests, bounded header reads, and per-file failures.
- Both supplied XML exports parsed in Node: 47,697 standard source records and 46,523 supplementary source records; 24 invalid controls removed from standard XML and none from Plus.
- Merging supplied records retained 31,903 events, 7,700 figures, 577 sites, 276 artifacts, and 1,246 written works without duplicate Plus events.
- Live Chrome integration suite (`tests/browser.html`) passed: actual module worker import; structural merge and provenance; database close/reopen; malformed import rollback; staging isolation; batched writes; indexed pagination; exact-world deletion; preservation of unrelated worlds.
- Live UI: fictional example selection/import, source-field expansion, theme persistence, navigation, bookshelf card, and reload.
- All five supplied Cadenilina exports imported through the live file selector. The stored archive displays the expected figures/events/sites/artifacts/works totals. Page two displays records 51–100 of 7,700; reload reopens the world successfully.
- Live deployment exposed a mixed-cache release issue. Runtime module/worker/style URLs now carry a release query. The importer was verified working after this change.
- Existing MIT licence retained; sax 1.6.1 is vendored with its own Blue Oak licence, source/version, wrapper adaptation, and checksum. No build action or CDN dependency added.

## Scope and pending checks

- This is a raw archive browser, not yet linked biographies or narrative event exploration. Structural merging preserves standard values and exposes raw Plus values; semantic aliases and relationship indexes remain planned.
- Map CSV and text reports are saved as supplementary files but not interpreted or visualised yet.
- Cancellation and unfinished-import recovery are implemented; exhaustive timing/race and quota-failure tests remain pending.
- Browser qualification so far is desktop Chrome. Firefox, Safari, mobile, screen-reader and full keyboard/contrast audits remain pending.
- The automated Playwright smoke script is available but was not run in the local container because the Chromium download was invalid. Live Chrome checks were performed through the connected cloud browser instead.
- Storage migrations, advanced matching of world identity, backup/export, notes, and offline reload caching remain planned. Preserve original export files.
- Pages serves the committed site successfully. Its administrative branch-source setting has not been inspected through a settings API.
