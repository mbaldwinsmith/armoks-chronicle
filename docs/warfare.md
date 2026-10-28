# Wars and battles

Open a stored world and choose **Wars & Battles**. The campaign ledger has name/ID search, collection-type and year filters, dated cards, linked locations/factions and paginated results. It includes wars, battles, duels, beast attacks, conquests, raids, abductions, thefts, persecutions, purges, insurrections and overthrows. Ceremonies and unrelated collection types are not silently classified as combat.

Collection record pages add an editorial overview and four sections: **Chronicle**, **Battles & Nested Conflicts**, **People & Factions**, and **Squad Reports**. Record notes, source fields and provenance remain available. Existing saved archives work without reimport.

## Explicit hierarchy and dates

Supported XML membership fields are `event` and `eventcol`; child-side `parent_eventcol` and `war_eventcol` also establish containment. Duplicate references and shared descendants are visited once. No hierarchy is invented from common dates, factions or locations. Missing links and cycles stay explicit. Nested non-conflict collections can still contribute events when an explicit parent names them.

Start/end years are displayed as recorded. The -1 sentinel is unknown, not evidence that a conflict is ongoing. Directory date filters intersect known bounds; if only one date is recorded it is treated as a point. Undated or inverted ranges do not match an active year filter. Chronicle years apply only to its paginated event list; overview totals continue to cover the examined whole conflict. Unknown-year events appear last when no year filter is active.

Root factions and locations are source claims. Participant rows distinguish direct collection roles (including non-combatants) from being mentioned in events. A person may appear in several role entries; these are not unique-person counts or proof of participation beyond the stated role. Each row retains up to three source references. Recorded outcomes are rendered without inferring victory from casualty numbers. Generic scalar/source fields preserve unsupported information.

## Casualty counting, derivation version 1

There is deliberately no combined named-plus-squad death total.

1. A named/identified death victim is a distinct usable figure ID in a member death event. Duplicate events and repeated victims do not multiply the count. Unresolved figure IDs remain identified references; unusable victim IDs are reported separately. Death events grouped into a conflict are not automatically interpreted as combat kills.
2. Squad death arrays are read from battle collection fields `attacking_squad_deaths` and `defending_squad_deaths`. Zero is a recorded value; absent, negative, malformed and unsafe integer values are unknown/invalid. Available valid values form an explicitly partial subtotal when other counts are invalid or absent.
3. If a battle report has a more-specific descendant battle report, its parent rollup is shown for inspection but excluded from the combined subtotal. Shared descendant collections are not counted repeatedly.
4. Most-specific reports are checked for overlapping collections, event IDs and identified death victims. Overlap prevents a combined subtotal. Cycles, missing membership, traversal limits, analysis-budget exhaustion and unsafe aggregate sums also prevent a confident combination.
5. Attacking/defending sides are local to each battle. Their aggregate subtotals do not establish that the same faction was on that side in every battle. Squad records may overlap named figures; these two measures are never added together. Even disjoint reports cannot establish a complete world casualty total.

Every battle report links back to the original source inspector, including excluded rollups and conflicting supplementary values. Standard/Plus merged records are counted once; the existing standard-authoritative merge rules remain unchanged.

## Selected-conflict atlas

**Show this conflict in the atlas** uses `collection=ID` to restrict the existing conflict-event overlay to unique member events across that collection and its descendants. It retains the normal date/type/faction controls and works in flat/relief modes. The selected collection survives atlas control changes and reloads. The scope notice links back to its history and offers **Show all world conflicts**.

Event positions come from their own referenced site or explicit coordinates, checked against the actual imported terrain. Collection coordinates are not silently assigned to unlocated events. Unsupported/non-combat events remain in the Chronicle and do not become map markers. Unknown locations remain in the event list. A war with no single location can still open its located member events. Without the optional matching map CSV, the atlas gives its existing missing-terrain explanation and a return link.

Chronicle event links carry a return-to-conflict address, including its section/page/year state. Section selection and pagination are hash-route state; copied links require the same locally imported archive.

## Performance and bounds

No dependency, server, build step or migration was added. A lazy module-worker index reads collection/event/site summaries by world-kind cursors. It is cleared on world/worker changes. Up to eight calculated conflict summaries are cached, with shared compact event references rather than duplicate raw records. Raw collection JSON is constructed only when its inspector is opened. The UI renders one section at a time: 50 events or 24 collection/participant/report entries per page. Event prose is loaded only for the visible page.

Membership visits at most 2,000 collections, 50,000 unique events and 20,000 hierarchy edges per conflict. Each membership field accepts at most 10,000 references, collection role extraction is capped at 10,000 references, participant aggregation at 5,000 role entries and event role extraction at 500 references. Casualty analysis has a 200,000-operation budget. Incomplete results are disclosed and do not yield a confident squad sum. Iterative traversal avoids recursive-stack growth; expensive event work yields periodically and accepts cancellation. Navigating away disposes panel requests. The atlas performs its membership/event work in its own disposable worker.

## Format provenance and compatibility

The pinned primary [DFHack collection definitions](https://github.com/DFHack/df-structures/blob/917d63fc8eea5a1522c747aa50067bea6b53724f/df.history_collection.xml) define collection kinds, nested collections/events, parent relationships, faction/figure roles and separate attacker/defender squad-death vectors. They do not establish that named deaths and squad counts are disjoint. This application’s conservative aggregation rules are its own documented derivation. XML spellings are covered by authored export-format fixtures; unknown aliases remain unverified rather than guessed.

Authored fixtures `warfare-legends.xml` and `warfare-legends_plus.xml` cover nested wars/battles/duels, repeated membership, outcomes, participant roles, missing references and conflicting supplemental counts. They are fictional MIT-licensed fixtures, not redistributed world exports. Battle rankings and faction warfare networks remain future work.
