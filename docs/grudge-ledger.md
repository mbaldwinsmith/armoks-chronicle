# Grudge Ledger

The world-scoped Grudge Ledger (`#/world/ID/grudges`) offers source-linked reading paths into killings, thefts, abductions, faction conflicts and explicit grudge relationships. Open it from the Chronicler’s Desk or world record directory. It works with existing saved archives without reimporting.

## What qualifies

- **Recorded killings:** a supported death event with a nonnegative named-killer ID, a recorded unnamed slayer race, or a recognised violent cause. Recognised natural/accidental causes such as old age, starvation, drowning and a fall are conservatively excluded even when a killer field also exists. An unexplained death alone is not a killing. This is an evidence filter, not an exhaustive death classification.
- **Thefts:** `item stolen` and `artifact stolen` event types. Only explicit thief, artifact and other supported references are shown. A theft event does not establish an unnamed owner or victim, and an artifact’s later holder is not substituted for one.
- **Abductions:** `hf abducted` events retain the recorded abductor and target fields. Unknown participants stay unknown.
- **Faction conflict sources:** supported conflict collections with direct war-aggressor/defender or attacking/defending organisation fields, plus supported site-attack, destruction, plunder and field-battle events with at least one explicit opposing-side organisation field. One-sided sources remain visible; no missing opponent is invented. War aggression and battle attack roles are displayed distinctly. The ledger reuses the existing collection adapter and event formatter; it performs no transitive opponent or faction-membership inference.
- **Explicit grudge links:** only the exact normalised relationship types `grudge`, `grudge bearer` and `grudge holder` qualify. Enemy, rivalry, friendship, a shared battle and a later attack do not. The existing relationship adapter preserves source-to-target wording and merges duplicate standard/Plus evidence. Snapshot links have no inferred dates or cause.

The ledger counts **source entries**, not independent incidents or a world’s complete set of wrongs. A war, its battle and its member event can each have an entry. They remain separate sources, with an overlap note, and are never summed into a casualty or revenge claim. Multiple explicit grudge labels are separate source relationship claims. The summary tiles describe the current selection; they do not claim population-wide prevalence.

## Filters, dates and reading flow

Search matches entry types, labels, resolved narratives and directly referenced names; `#ID` matches an exact source ID. Person, faction and place filters match directly referenced IDs or case/accent-insensitive label substrings. The three filters intersect. They never project a figure’s civilisation or a place’s ownership onto an incident. Missing references are explicitly labelled and remain searchable by their recorded ID. Reference caps can omit filter matches; incomplete results are flagged.

Choose Apply filters to commit draft controls. The applied category, text filters, year bounds, order and page live in the hash URL. Reload restores them. Clear filters resets the selection. Changing controls alone does not alter the current cards or counts. Queries cancel superseded work, clamp page offsets and return 24 entries per page. Earliest/latest sorting keeps unknown start dates last and uses stable source keys for ties; equal years do not establish an exact event sequence.

Years must be safe whole integers. Negative recorded years other than the export’s unknown `-1` sentinel are supported. With a year filter, wholly unknown dates, undated grudge snapshots and inconsistent ranges do not match. For a partially dated conflict, only its known endpoint is used; the missing endpoint is not extrapolated. Date captions retain unknown ends and inconsistent values.

Cards render source roles and linked narrative tokens as text. Missing records have no fabricated links. Evidence expands to source fields, bounded path labels, the ordinary record’s Follow the Thread section and, for collections, its conflict history. The main source/evidence links retain an explicit return-to-ledger query so readers can recover their applied filters. Person/place links remain ordinary archive links. Browser back also restores the ledger.

## Performance and lifecycle

A lazy worker request reads indexed historical events, collections and figures once per active immutable archive. It reuses existing narrative and relationship/collection adapters. A compact ledger cache is discarded on world switches and worker shutdown. It stores no full XML records. Construction caps scanned source records at 500,000, retained entries at 100,000 and displayed references at 24 per entry. Relationship parsing uses the existing per-record link bound; truncated relationship sources are flagged even if no eligible grudge appears in the examined links. Scan, entry and reference limits are disclosed.

Filtering runs in the existing serial worker, checks cancellation and yields every 1,000 entries. Only a 24-entry page crosses to the main thread. Navigation aborts outstanding view requests and stale replies cannot render. This adds no build step, runtime dependency, backend or database migration.

## Verification

The independently authored `grudge-legends.xml` fixture contains a killing, explicit theft/abduction, a missing killer, natural/unexplained death exclusions, a directed grudge link, a non-grudge enemy link, a war and counterattack with overlapping member events. No supplied game-world content is published. Node tests cover role direction and deduplication, direct-filter intersections, date ambiguity/validation, pagination/sort, bounded output, cancellation/cache reuse, and a generated 50,000-entry filtering case. Browser integration imports the fixture through the real worker and checks categories, source counts, filters, missing records, safe card/evidence links and cache isolation.
