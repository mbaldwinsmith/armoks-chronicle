# Conflict atlas and terrain overlay verification

27 October 2026

- All 31 Node tests pass. New cases cover conflict classification, referenced-site vs explicit-coordinate placement, negative years, location-unknown preservation, composed organisation/date/type filters, tile clustering, explicit river edges, inferred adjacent roads, and height scaling.
- Live browser integration suite passes, including a synthetic death event placed at the referenced fixture site by the atlas worker.
- Independently parsed Cadenilina baseline: 6,403 supported conflict events, 5,875 mapped and 528 location unknown; 14 field battles. Live atlas reports the same totals.
- Field-battle list sorts by year (20–72), and every field battle has explicit event coordinates. Battle #5105 renders distinct attacker/defender names and its atlas link selects tile 54,100 with a matching event chooser.
- Tile 54,115 offers battles #12508 (year 40) and #19840 (year 52). Changing the chooser updates the event link correctly.
- Field-battle organisation filter #300 returns eight events. Reversed year range 80–20 is rejected. Conflict filter state persists alongside relief mode.
- Relief height set to 2× and roads enabled; reload restores both. Rivers use exported connections; roads are explicitly labelled inferred. Desktop visual checks cover the overlays and red battle markers.
- War collections, army routes, casualty analysis, territorial boundaries and reconstructed historical ownership remain planned. The overlay describes events, not a complete military simulation. Mobile/non-Chrome and large-world performance qualification remain open.

# Political geography verification

27 October 2026

- 27 Node tests pass. New cases cover independent owner/civilisation IDs, valid zero IDs, missing and −1 categories, composed name/type/faction filters, deterministic colours, unresolved names and group totals.
- Live Chrome integration suite passes, including the atlas worker retaining different owner and civilisation values and resolving entity labels from IndexedDB.
- Independently parsed Cadenilina sites: 577 sites, 351 current-owner groups and 170 recorded-civilisation groups. Hammerbit (#76) has current owner #275 and recorded civilisation #274.
- Live search “hammerbit” + type “fortress” matches one site. Switching to civilisation labels it “the brilliant axe”; filter state survives reload.
- Hide all factions gives zero matching sites; show all restores them. Toggling the Brilliant Axe alone hides/restores the matching site.
- Legend → Brilliant Axe organisation → civilisation-settlement atlas action focuses 21 matching sites. Switching to Raised Relief retains the faction filter.
- Political marker rendering is settlement association only. Founding dates, reconstructed ownership transitions, territory boundaries, wars and historical overlays remain planned. Mobile and non-Chrome qualification remain pending.

# Atlas iteration verification

27 October 2026

- 23 Node tests pass, including complete/duplicate/missing cells, bounds, unknown CSV versions, elevation range, site coordinate alignment, rectangle noninterpretation, and isometric orientation.
- Supplied map validates as 129 × 129, 16,641 cells, elevation 1–250.
- Live Chrome integration suite passes, including the actual atlas worker loading a saved synthetic CSV and matching a site at tile 4,7.
- Existing Cadenilina archive loads without reimport: 16,641 cells, 577 mapped sites, zero out-of-bounds site coordinates. Event → Hammerbit → atlas selects tile 28,104 (elevation 168). Flat and Raised Relief views visually reviewed; relief tile picking updates the selected coordinates.
- Free camera rotation, pinch zoom, verified biome names, river/road drawing, political and historical overlays, and mobile/browser qualification remain planned. The optional Raised Relief view is an isometric preview.

# Recorded lives iteration verification

27 October 2026

## New automated checks

- 19 Node tests pass. New coverage includes event aliases, victim/killer and wound/abduction roles, missing IDs, unnamed killer details, unknown event fallback, source relationship direction, negative birth years, qualified lifespan differences, inconsistent dates, and composed timeline filters.
- The merged Cadenilina dataset contains 31,903 events across 75 canonical types: 22,193 use a prose template; 9,710 use the explicit structured fallback. All events produce a nonempty rendering. No user data is committed.
- Expanded explicit reference fields now identify 147 events associated with Smangba (#315), compared with 79 in the narrower previous reference index. New references include battle, wound, abduction, and artifact roles. This is broader coverage of the same archive, not new imported events.
- Live Chrome integration tests pass, including narrative DOM links, role order, untrusted type text, lifespan uncertainty, and date-filter counts.

## Live narrative checks

- Existing Cadenilina opened without reimport. Smangba’s page shows birth year −254, an explicitly unknown death status, labelled source relationships, and 147 related events.
- Type “hf died” with year 21–21 shows one event, 146 hidden, and the correct victim Lor Ringedbulb / killer Smangba / site Hammerbit. Filter state survives reload.
- The major-events preset retains 124 of 147 events and reports 23 hidden routine events. A reversed 50–20 year range is rejected with a clear message.
- Opened event #5351 from the filtered timeline; linked narrative, source-field disclosure and provenance are visible. Desktop parchment layout was visually reviewed.
- Qualification remains desktop Chrome. Other browsers, mobile, screen readers, and large-world performance budgets remain pending. Calendar-day conversion, full role/alias coverage, biographies with offices and supernatural evidence, and prose templates for the remaining event types are still planned.

## Previous iteration verification

27 October 2026

## Exploration checks (0.3.1)

- Twelve Node tests pass, including accent/case folding, exact/partial name matching, family-scoped ID lookup, pagination, stable event ordering, negative years, empty/unknown dates, reference roles, nested paths, sentinel exclusion, ambiguous-field exclusion, and route encoding.
- Live Chrome integration suite passes with the new exploration module worker: name search, reverse-event index, name resolution and missing-target fallback, plus all existing import/storage checks.
- Existing Cadenilina archive opened without reimport. ID search #315 restricted to historical figures returns Smangba; his page exposes 79 related events, with page two showing 51–79. This matches the independently parsed standard-export count.
- Followed figure → death event #5351 → Hammerbit site #76. Victim and slayer remain distinct source references. The site page survives a reload.
- Return to results restores the #315 query and figure category. Name search and no-result guidance were checked, along with clear search.
- Reference lists with more than ten entries are collapsed by default; small lists remain open. These pages are structured source views, not complete narrative biographies.
- Search indexes are rebuilt in a background worker for each world/session. No IndexedDB schema change or migration was required. Large-world memory/performance budgets are not yet qualified.

## Previous import checks

- Eight Node tests pass (`node --test tests/parser.test.mjs tests/preview.cjs`): nested/repeated/unknown XML fields, entities, CP437, invalid control counts, UTF-8 chunk boundaries, duplicate IDs, malformed XML, DTD rejection, unsupported encodings, merge precedence, filename manifests, bounded header reads, and per-file failures.
- Both supplied XML exports parsed in Node: 47,697 standard source records and 46,523 supplementary source records; 24 invalid controls removed from standard XML and none from Plus.
- Merging supplied records retained 31,903 events, 7,700 figures, 577 sites, 276 artifacts, and 1,246 written works without duplicate Plus events.
- Live Chrome integration suite (`tests/browser.html`) passed: actual module worker import; structural merge and provenance; database close/reopen; malformed import rollback; staging isolation; batched writes; indexed pagination; exact-world deletion; preservation of unrelated worlds.
- Live UI: fictional example selection/import, source-field expansion, theme persistence, navigation, bookshelf card, and reload.
- All five supplied Cadenilina exports imported through the live file selector. The stored archive displays the expected figures/events/sites/artifacts/works totals. Page two displays records 51–100 of 7,700; reload reopens the world successfully.
- Live deployment exposed a mixed-cache release issue. Runtime module/worker/style URLs now carry a release query. The importer was verified working after this change.
- Existing MIT licence retained; sax 1.6.1 is vendored with its own Blue Oak licence, source/version, wrapper adaptation, and checksum. No build action or CDN dependency added.

## Scope and pending checks

- The archive now has search, linked source-record pages, and related-event lists. Rich biographies, semantic event aliases, narrative templates, and comprehensive relationship interpretation remain planned. Merged-field references and raw Plus references are labelled separately.
- Map CSV and text reports are saved as supplementary files but not interpreted or visualised yet.
- Cancellation and unfinished-import recovery are implemented; exhaustive timing/race and quota-failure tests remain pending.
- Browser qualification so far is desktop Chrome. Firefox, Safari, mobile, screen-reader and full keyboard/contrast audits remain pending.
- The automated Playwright smoke script is available but was not run in the local container because the Chromium download was invalid. Live Chrome checks were performed through the connected cloud browser instead.
- Storage migrations, advanced matching of world identity, backup/export, notes, and offline reload caching remain planned. Preserve original export files.
- Pages serves the committed site successfully. Its administrative branch-source setting has not been inspected through a settings API.
