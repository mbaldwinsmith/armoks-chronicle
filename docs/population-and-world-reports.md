# Population and World Reports

Open **Population and World Reports** on the Chronicler’s Desk. Reports already saved with an archive work without a database migration or reimport. If reports were omitted, import matching reports together with Legends XML as a separate archive; adding optional files to an existing archive remains future work.

## Sources and compatibility

This implementation was checked against DFHack scripts commit [`682648a696b8b6f0055e8aa4145c45b175487e01`](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua), specifically `exportlegends.lua`, and the [`SitesAndPopsParser.cs`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Parser/SitesAndPopsParser.cs) consumer at LegendsViewer-Next commit `6045eb08a42d09882cad43c1ef6db37e551cd580`. This is a pinned format contract, not certification of all DF or DFHack versions.

The exporter writes UTF-8 via `dfhack.df2utf`. The consumer reads Windows-1252; this difference is why the reader exposes an encoding choice. Automatic mode tries strict UTF-8, honours UTF-16 byte-order marks, then uses a visibly uncertain Windows-1252 fallback. Explicit UTF-8, Windows-1252 and CP437 choices are available. The choice applies to the loaded report set. Automatic legacy fallback cannot establish settlement associations. Original saved File blobs are never rewritten and Download Original Report preserves them.

The exporter’s dated filename uses year, month and day. The reader labels a valid date a **Filename Clue**, never the import timestamp or an independently verified census date. Unknown/invalid dates remain unknown.

## Snapshot interpretation

Supported headings separate Civilized World Population, Sites, Outdoor Animal Populations (Including Undead), and Underground Animal Populations (Including Undead). Settlement headings contain a numeric site ID, native name and English name. Tab-indented numeric or literal `Unnumbered` population rows retain their source line.

Rows can include animals as well as untracked inhabitants. Numeric rows are safe nonnegative integers; explicit zero stays zero. `Unnumbered` stays unknown, never zero or an arbitrarily large integer. A sum is labelled **Sum of Listed Numeric Rows**, not a count of people. Unknown counts, duplicate group labels, unsupported indented lines, unsafe sums or partial parsing suppress a complete subtotal. World, settlement and wildlife scopes stay separate; multiple files are never combined into a census. Historical figure records are shown separately and are neither added to nor subtracted from population counts.

## Association rules

Automatic settlement panels require all of: a matching Legends filename prefix, a supported complete source decoded with confidence, a unique report section for that site ID, an existing XML site with that exact ID, and agreement with one of the report’s native/translated names. Comparison normalises Unicode, case and whitespace only. Missing IDs never fall back to name-only matching. Duplicate site IDs, malformed name pairs, conflicting XML names and name mismatches stay visible in the directory. Conflicting recognised world-history world-name headers also prevent automatic settlement enrichment. These checks provide conservative association, not proof that two independently supplied files are historically identical.

Owner and parent civilisation names link only to a uniquely exact-matching XML organisation, and only after the settlement match is established. Duplicate organisation names remain ambiguous. Report ownership and XML affiliation disagreements are labelled. Reports never change XML ownership, historical events or research notes. Organisation panels list separate named report sections; they do not calculate a territorial census or infer political dates.

World-history reports are readable, searchable text. The checked exporter includes placeholder birth dates such as `b. 0`; these are not interpreted as verified births or dated office terms. There is no historical population reconstruction.

## Reader, navigation and bounds

The reader displays literal text, original line numbers, source highlights and 100-line pages. Source searches preserve original line numbers. Snapshot filters, source jumps and record return links retain reading context. Population tables have captions and scoped headers; source markup is never executed.

Worker reads are bounded to four reports, 16 MiB per file, 32 MiB combined, eight million decoded characters, 200,000 lines, 8,192 characters per line, 5,000 sections, 50,000 rows and 256 rows per section. Matching scans at most 100,000 combined site/organisation records. A reached read/parse/matching limit prevents automatic attachment and discloses partial coverage. Population pages contain 12 sections; record contexts show at most 12 separate sections. Oversize or otherwise unsupported files remain available as original downloads. Work runs off the main thread, supports cancellation and is cached by archive and selected encoding; route changes and archive switches invalidate appropriate work.

## Validation

`tests/reports.test.mjs` adds 22 pure tests for decoding, strict matching, scope separation, Unnumbered, duplicates, partial sources, source paging and query round trips. The full Node suite passes 361 tests. Browser integration checks exercise saved File import, worker caches and cancellation, source download equality, semantic safe DOM, snapshot/source/return navigation and settlement panels using only independently authored fixtures.

Live browser verification will be recorded after the published runtime is checked.
