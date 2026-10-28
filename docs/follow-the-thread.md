# Follow the Thread

Record pages end with a small set of evidence-linked next stops. Explicit family and affiliation links, authorship and cultural references, shared event references, and conflict membership can lead to another figure, place, organisation, work, artifact, event or collection. Recommendations never create an inferred friendship, meeting, motive, revenge narrative or ownership timeline.

## Selection and evidence

The exploration worker reuses its incoming-reference index. Collection membership and supported participant roles are added to this index using the existing collection adapter. Requests fetch the current record and at most 60 incoming source records, interleaved by source family in index order. Ordinary events therefore cannot consume every source slot when other source families are available. The worker examines at most 500 supported references per fetched source, retains at most 36 distinct available target records, excludes the current record, and attaches at most three evidence references per target. Sampling/candidate limits and unavailable references are disclosed. Counts describe suggestions, not all possible connections.

Explicit source-record relationship wording retains its direction: if a parent lists a child, an incoming recommendation on the child's page still says that the parent lists the child. It does not reverse the relationship label. Vague relationships retain the source label. Event connections reuse the deterministic narrative formatter, including natural settlement wording and victim/killer direction. Several actors in one event share that source context; this does not establish a personal relationship. Unknown event types retain their source-type fallback.

Direct references and incoming records can be recommended. An incoming cultural record must explicitly reference the current record. A collection can lead to explicit parent/war, child collection, member event or supported participant references; incoming member collections are indexed too. No transitive world-wide war traversal runs for this feature. Dates, motives and historical ownership are not inferred.

Retained suggestions sort by explicit relationship roles, other direct roles, then event context, using stable labels and IDs for ties. Target categories interleave so the first six cards offer varied next stops. Show more reveals six further cards at a time and focuses the first newly revealed record link. Each card provides a reason plus an expandable source-inspector link and field path. Further evidence can be found in the existing relationships, linked references, timelines and conflict sections.

## Runtime and navigation

Calculations run in the existing serial exploration worker with IndexedDB reads bounded to 61 records. This reuses the compact index rather than scanning the archive for each record page. No new dependency, build step, network request or database migration is needed. Recommendations load independently after the main record content, and navigation aborts outstanding requests and suppresses stale DOM updates. Expanded suggestions are temporary view state. Following a card opens an ordinary record URL; source links use `source=1`. The existing recent reading trail records successful record opens. A separately named, saved exploration trail remains an open PLAN task.

## Verification

Authored fixtures test incoming/outgoing family direction, natural death/settlement prose, cultural authorship, explicit conflict membership, self/missing/unrelated exclusions, category diversity, stable deduplication, bounded source sampling and candidate/evidence limits. Browser integration covers worker results, safe text rendering, source links, progressive disclosure and cancellation. Original supplied-export contents are not published in tests or documentation.
