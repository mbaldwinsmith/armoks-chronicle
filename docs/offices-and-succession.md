# Offices and Succession

Historical figure and organisation pages include **Offices and Succession**, with chronological appointment/removal evidence and source links. Office titles are displayed in Title Case. Explicit appointers and people named in promises keep those roles; neither becomes the officeholder or an inferred heir. Gendered title alternatives are retained in definitions, but the app uses the generic recorded office name rather than guessing a holder’s title from race/caste/sex.

## What the records establish

- `add hf entity link` and `remove hf entity link` become office endpoints only when `link`/`link_type` is explicitly `position`. Member, prisoner, squad and other associations do not become appointments.
- Holder IDs use `hfid`/`histfig`; organisation IDs use `civ_id`/`civ`. Office `position_id` is scoped to that organisation. A textual `position` can match one unique office definition, otherwise its normalised title remains a separate recorded office key. Ambiguous same-name definitions do not establish a unique office.
- Entity `entity_position` definitions provide `id`, generic `name`, and male/female name alternatives. They do not independently establish holding dates or identify which office is the sole ruler. Conflicting generic source names are flagged.
- `entity_position_assignment` contains an assignment `id`, `histfig` holder and `position_id`. These are **export-time snapshot assignments**, shown separately and without invented dates. Assignment IDs are not office IDs. Current survival is not inferred.
- `create entity position` describes office creation associated with `site_civ`, falling back to `civ`, and the recorded `histfig` creator. It does not appoint the creator. Creation records have their own source-linked context list.
- Figure-level position-link structures, inferred hereditary succession, spouse offices, squad leadership and unverified specialist schemas remain in raw fields/general references; they do not silently create dated terms here.

The source inspector retains the original fields and supplementary source. Repeated merged/Plus definitions and assignment facts are deduplicated. Contradictory scalar event fields or source dates are disclosed and withheld from ranking. Missing figure/organisation records remain labelled, unlinked references and do not enter comparisons.

## Pairing and chronology

Endpoints are grouped by organisation, office and holder. A uniquely pending appointment can pair with a later removal. A later holder never supplies a missing end date; neither death, export date nor a snapshot assignment supplies one. Reappointments remain separate terms. Multiple starts before a removal are retained as ambiguous/unpaired entries. Removals without a matching appointment remain visible.

Unknown-year sentinel −1, malformed dates and missing dates do not establish order; negative prehistory years other than −1 remain valid. If a holder/office’s endpoint group contains an undated event or ambiguously ordered same-year events, endpoints remain separate rather than inventing pairings. Raw `seconds72` values can establish within-year order without claiming a calendar conversion. Equal timestamps remain ambiguous.

Organisation pages show office terms in chronological order, with different offices kept distinct. **Earlier Recorded Holder** and **Next Recorded Holder** link neighbouring terms only when their dates establish a non-overlapping order and no unresolved endpoints obscure that office’s sequence. They do not prove a direct handover, biological inheritance, political legitimacy or an unbroken succession. Gaps are not filled.

Overlapping intervals, including later appointments following an earlier open term in the same office, are flagged as potentially overlapping holders. They may reflect multiple seats or incomplete sources. Different offices can be held concurrently without being merged. Same-year handover boundaries with unknown order are explicitly labelled; they do not erase separately established multi-year term lengths, but no exclusive succession link is invented.

## Longest and Shortest Completed Office Terms

Book of Records now offers both comparisons. Each eligible term gets its own row, even if the same figure held several offices or returned to office. The metric is **removal year minus appointment year**, not elapsed days, anniversaries or combined time in power. Zero-year terms qualify only when timestamps establish appointment before removal within that year.

Both categories use the same eligibility set and link both endpoint events. Missing/open endpoints, ambiguous ordering, conflicting source/office fields, missing holder/organisation records, and potentially overlapping terms of the same office are excluded. Concurrent different offices remain separate. Equal durations share competition ranks; shortest sorts ascending and longest descending. Exclusion counts use recorded term/endpoint entries, not a count of distinct figures or inferred offices. Missing-target entries are a subset of those exclusions.

The export does not reliably identify a single ruler among all offices, so these categories are called **office terms**, not exclusively royal reigns. Supernatural figures remain included; supernatural/ruler-specific comparison controls require further verified rules. A bounded/partial index is visibly labelled and is not an archive-complete world record.

## Verified source conventions

Primary exporter evidence: DFHack [`exportlegends.lua` at 682648a696b8b6f0055e8aa4145c45b175487e01](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua) exports entity office definitions and assignment IDs/holders/office IDs, and supplements appointment/removal position names. The exporter’s HTML helper can default an absent start year to zero; this app does **not** adopt that inferred date.

Primary consumer schema inspected: LegendsViewer-Next at commit `6045eb08a42d09882cad43c1ef6db37e551cd580`, specifically [`AddHFEntityLink`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/AddHFEntityLink.cs), `RemoveHFEntityLink`, `CreateEntityPosition`, `EntityPosition`, `EntityPositionAssignment`, and the entity/figure property parsers. The app uses verified field roles but does not copy the consumer’s inference of current-day/death endpoints. No upstream code is bundled. These inspected conventions are not universal DF/DFHack version, translation or mod compatibility claims.

## Bounds, performance and storage

The worker lazily indexes at most 500,000 entity/event records, 100,000 office event facts, 50,000 definitions and 50,000 snapshot assignment facts. It examines at most 512 children per relevant nested field/origin and discloses limits. One derived office index is cached for the currently loaded immutable archive; the existing Book of Records scan can populate/reuse it without another scan. World switches clear it, and cancelled cursor scans do not cache incomplete results.

Profiles page 12 term/endpoint entries, show at most 24 definitions and snapshot assignments, and sample up to 12 creation records with totals. Ranking pages retain their existing 50-row bound. DOM uses safe text and source-qualified links. No source records, research, chronicles or database schemas change. Existing archives require no reimport. The application remains native modules served directly from `main`, without a build step or new dependency.
