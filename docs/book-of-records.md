# Book of Records

Open a stored world, then choose **Book of Records**. Ten category links and a collapsible set of highlight cards lead into ranked, paginated evidence tables. Rankings apply only to that locally imported archive. No reimport, remote service or new dependency is needed.

## Counting contract (derivation version 1)

The definitions displayed above each table are authoritative and are maintained in `js/data/book-of-records.js`.

| Category | Metric | Important exclusions and limits |
| --- | --- | --- |
| Deadliest Figures | Distinct available historical-figure victims in death events explicitly naming a killer | Duplicate victim attributions per killer, self-kills and old-age deaths do not add kills. Unnamed units and missing victim records do not count. Conflicting killers remain separate source attributions. |
| Longest Completed Lives | Recorded death year minus birth year | Excludes absent, malformed, sentinel -1 and inverted dates. Includes other negative years and supernatural figures. Calendar-year differences are not precise ages. |
| Open-ended Life Records | Latest dated event year minus recorded birth year when death_year is explicitly -1 | Neither a claim of survival nor an export-time age. Excludes missing death fields and births after the reference year. No dated event means no eligible entries. |
| Most Prolific Authors | Distinct written-content records naming the figure | Physical copies and repeated composition events do not multiply works. Missing author records do not rank. |
| Most Eventful Settlements | Distinct events explicitly referencing a recognised site-ID field | Repeated references within an event count once per site. Includes routine events and source/destination references; does not measure attack count or population. |
| Most Recorded Knowledge Discoveries | Distinct knowledge-discovered events naming a figure | Repeated topics remain separate event records. Secrets, learned knowledge and written works are separate concepts. |
| Most Chronicled Artifacts | Distinct events explicitly referencing recognised artifact-ID fields | Does not establish value, age, ownership changes or possession. |
| Works With the Most Recorded Copies | Distinct artifact records linking written content through writing or item.page_written_content_id | Multiple page references in one artifact count once. Neither copying-event count nor a survival claim. |

All categories use merged records, with standard fields authoritative and supplementary fields filling gaps. Conflicting raw Plus fields are inspectable on record pages, but are not counted as additional evidence. Supported aliases use the stated precedence. Recognised site and artifact fields are shared with the linked-record adapter. Unknown event types are retained elsewhere but do not silently become knowledge or death events.

Equal values share competition rank (1, 1, 3); alphabetical label and numeric ID provide stable ordering inside ties. Ties spanning pages retain the same rank. Every result includes the number of eligible and excluded records in its family, plus missing referenced targets. Missing evidence and genuine zero activity cannot always be distinguished; zero-count rows are omitted except valid zero-year life spans.

Each row links its source record and at most five sample supporting records. Life rows link the figure containing the dates; the open-ended category also links the event establishing its reference year. Samples are explicitly partial; complete linked histories and raw source fields remain accessible through the ranked record. Highlight cards disclose first-place ties.

## Implementation and limits

`js/data/book-of-records.js` contains streaming aggregation and deterministic ranking; `js/views/book-of-records.js` renders safe DOM tables and route state. A lazy request to the existing module worker reads one archive through an IndexedDB cursor. The worker caches the completed derived rankings for its currently loaded archive, and clears them when the worker or world changes. Raw records are not duplicated in that cache. Deduplication sets grow with distinct referenced records; result messages and evidence samples are bounded to 50 rows and five sources per row. Progress is reported during the scan. Leaving the view aborts its request; switching archives terminates the worker. The existing importer creates independent immutable archive IDs; future optional-file enrichment must invalidate this derivation cache.

The category and page offset live in the hash URL; back, forward, reload and copied links restore them. Links still require the same local archive. Data does not leave the device.

This is the first Book of Records slice. Battle casualty rankings, ruler-only reign classification, contested ownership, travel records, supernatural inclusion controls, metric-specific full evidence directories and comparative charts remain planned. No battle ranking is inferred from named kills or nested collection totals.

## Verification

Authored Node fixtures cover aliases, distinct kills, missing victims and targets, self/old-age exclusions, negative and unknown life dates, equal ranks, five-source bounds, author/work/copy distinctions, repeated site/artifact references, repeated knowledge topics, independent calculations and 55-row pagination. Browser integration checks import/Plus merging, real worker evidence, cached categories, semantic safe tables and world-isolated recomputation. Original integration exports and derived findings are not committed.

## Completed office terms

Longest and Shortest Completed Office Terms use the shared office index and rank each eligible paired appointment/removal separately. Both endpoints are linked, not sampled away. Candidates/exclusions count term/endpoint entries rather than figures. Calendar-year differences, open terms, unknown dates, concurrency, source conflicts and same-year handover boundaries follow [Offices and Succession](offices-and-succession.md). These categories compare all supported offices, not only rulers, and disclose partial-index limits.
