# The Chronicler’s Desk

Saved-world cards and successful imports now open `#/world/ID/desk`. The existing world-root route still opens the searchable record directory, so older links keep working. The directory and record pages provide a Desk link; the Desk links directly to records, the atlas, Book of Records and Wars & Battles.

## Totals and recorded eras

The six total tiles count stored historical figures, sites, organisations, events, artifacts and written works. Each tile opens its source directory. They do not estimate the entire world population, all historical activity or surviving objects. Metadata totals appear before expensive discovery queries complete.

Era names and explicit `start_year`/optional `end_year` values are displayed in start-year order, twelve per page. Unknown/sentinel dates remain unknown; inverted dates are flagged. A subsequent era’s start never invents the previous era’s end. Era source records remain clickable, including parser-assigned IDs when the export omits an era ID.

## Evidence-linked starting points

Up to four cards reuse existing Book of Records leaders and counting definitions. Eligible categories are considered in a stable order: completed lives, authors, event-rich sites, artifact histories, recorded kills, physical records of written works, and knowledge-discovery events. Empty categories are skipped, as are zero-length completed-life spans. A record can lead more than one category; those are separate explicitly labelled metrics, not extra people.

Cards show the recorded metric, criterion and tied-first count, and link to the source record and complete ranking/evidence table. Stable ranking name/ID order chooses the displayed member of a tie. These are reproducible archive-derived suggestions, not AI stories, new historical discoveries or complete-world superlatives. Supernatural figures follow the existing ranking rules and are not silently excluded.

The worker reuses its cached Book of Records derivation. Opening its ranking afterwards does not require another full source scan for the same immutable archive. Changing worlds or stopping the worker clears the existing cache. See [Book of Records definitions](book-of-records.md).

## Random exploration

The picker offers figures, sites, organisations, artifacts, written works, events, supported conflict collections, or all these families. Only present, non-negative numeric record IDs are eligible. Generic raw-definition families and ordinary non-conflict collections are excluded.

An explicit non-empty name/title (or artifact item name) qualifies for the named pool. If that pool is non-empty, selection is uniform within it; otherwise all eligible records in the selected category form the pool. This is a declared preference for readable entries, not uniform selection across the entire export. Event fallback headings are not treated as explicit names. The UI discloses pool size and named preference.

The previous preview is excluded when another choice exists in the current pool. A singleton remains available and is labelled accordingly. No eligible records yields an explicit empty state. A preview links to a record rather than navigating automatically, and previews do not enter reading history. Native worker `crypto.getRandomValues` uses bounded rejection sampling to avoid modulo bias. Random work scans only the existing compact metadata index, without reparsing source exports. Category choice persists in the Desk URL; the random result itself is not a saved story.

## Your recent trail

A successful record view records its world, family, ID, bounded display label and visit time. The latest twelve distinct family/ID pairs are kept in action order; revisiting a record moves it to the front. Previewing a random candidate does not count as opening it. The Desk resolves stored IDs against current source records; missing records are labelled unavailable rather than linked as present.

This is a disposable navigation aid, separate from annotations and saved chronicles. It is stored under the exact world-scoped localStorage key `armoks-chronicle:trail:v1:ENCODED_WORLD_ID`, with a validated versioned envelope and bounded text/entry sizes. Clearing a trail removes only that key. Deleting its source archive also attempts to remove its trail while retaining the existing separate annotations. No global storage clear or unrelated-key removal occurs. Ordinary storage failures do not block reading or saving research. In multi-tab races, last-writer behaviour is acceptable for this disposable trail; it is not an audit log or backup of research.

The Desk listens for this world’s storage updates while mounted and removes the listener on navigation. Record labels are re-resolved for display, kept out of HTML markup and capped in the trail. Original source values, notes and tags are unchanged.

## Bounds, lifecycle and verification

The UI shows at most four discovery cards, twelve eras and twelve recent visits. Random responses contain one record. Metadata is shown first; ranking scans remain in the existing module worker with stage progress. Navigation aborts pending requests and suppresses stale replies. No dependency, server, build action, remote service or database migration was added.

`data/desk.js` holds ranking-card selection, random eligibility/sampling and era summaries. `data/trail.js` owns the disposable history adapter; the bounded label utility lives in the existing language module. `views/desk.js` renders safe DOM and request state. Source database deletion uses the trail adapter only for best-effort cleanup; workers without localStorage remain supported.

Authored fixtures and tests cover empty/singleton categories, no immediate repeats, named preference and fallback, rejection sampling, negative/unknown era years, unknown ends and era paging, tied discovery leaders, bounded labels, blocked/corrupt storage, world/family isolation and exact-key cleanup. The fictional example now includes two explicitly open-ended era records. Original exports and derived world findings are not committed.
