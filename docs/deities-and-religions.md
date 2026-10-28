# Deities and Religions

The Chronicler’s Desk opens the sacred annals: a searchable, paginated gallery of **Recorded Deities**, **Religious Organisations**, **Unexplained Forces**, **Other Worshipping Organisations** and **Unclassified Worship Targets**. Source-derived sphere labels can be searched or selected explicitly. Spheres on an ordinary figure do not establish divinity. Decorative SVG stars, temple fronts and spirals are editorial ornaments, not inferred world heraldry.

Individual dossiers show recorded spheres, named worshippers, worshipping organisations, memberships, temples and supported religious events. Compact Faith and Worship panels also appear on relevant figure, organisation and settlement records. Source links open the existing provenance inspector and return to the selected annals dossier with filters preserved. All content is rendered as safe text and DOM nodes.

## What the classifications mean

- A deity requires an explicit supported `deity` presence marker. The existing supernatural evidence rules qualify conflicting or unsupported marker values; ambiguous markers never become confirmed deities.
- A religious organisation requires the exact normalised entity type `religion`, without conflicting source types.
- A force requires an explicit supported `force` marker; a force is not automatically a deity. An explicit deity classification takes priority if both supported markers coexist; raw fields remain inspectable.
- Military orders and other entity types can record `worship_id` links without being religious organisations. They have a separate directory category.
- A worship target with no unambiguous deity marker stays unclassified, including missing target records. Worship relations establish the recorded association, not the target’s ontology.
- Names, sphere lists, generic entity links, membership and supernatural abilities do not independently establish a deity, religion or personal belief.

## Snapshot associations

Historical figures’ `hf_link` children with `link_type=deity` name the worship target in `hfid`. The source figure is the worshipper; the target does not thereby worship the source. Link strength is retained in the raw source but is not rewritten, scored, or treated as a percentage of devotion.

Entities’ repeated `worship_id` fields name worship targets. Figures’ `entity_link` children with `link_type=member` identify membership separately. Former membership is not shown as a current snapshot membership; a member does not automatically worship every target of an organisation. `histfig_id` entity lists and temple inhabitants are not used to infer living members or worshippers.

Merged standard fields and supplementary snapshots are examined with bounded repeated lists. Identical directed associations deduplicate. Differing supported associations are retained as a union with source origin/path and source-disagreement notices; they do not reconstruct a dated conversion or affiliation change. Named-link counts describe examined records, not a population census or total number of believers. Missing references remain explicitly missing, with their original source links available.

## Temples and local structure identity

Temples are nested under `sites → structures → structure`. Their identity is the pair **site ID + local structure ID**, never a globally unique building number. Supported `id`/`local_id` aliases must agree. Explicit `type=temple` is required. `deity` / `worship_hfid` directly names a figure; `religion` names an organisation. The numeric `deity_type` is not independently interpreted.

Conflicting source types, competing deity values, competing religion values, or simultaneous figure and organisation patrons withhold the dedication rather than choosing a patron. Such temples remain visible on their settlement’s panel with a source link. Temples with no identified patron are also visible on the settlement panel. Tombs, generic buildings, owners and inhabitants are not inferred to be deity dedications or congregations.

A deity dossier distinguishes **Directly Associated Temples** from **Temples of Associated Religious Groups**. The latter explicitly states the chain through an organisation’s worship link. No organisation’s temple is silently converted into a direct dedication to every deity it worships. These are export-time associations, not dated reconstructions of historical patrons.

## Religious history

Supported dated context includes explicit `add hf hf link` / `remove hf hf link` events with a deity relationship, membership-link events, organisation creation/dissolution, and prayer/profanation at a supported site-local temple. Historical worship events can create a source-linked unclassified target dossier even where no snapshot relation survives. They never increase snapshot worshipper counts.

Prayer and profanation events use the verified `hist_fig_id` / `histfig`, `site_id` / `site`, and `structure_id` / `structure` aliases. Their temple link is resolved by site and local ID. Association with an export-time temple patron is explicitly qualified: it does not establish who the visitor worshipped, membership, the temple’s patron at that event date, conversion, or motive. Unknown event types remain in the general explorer. No negative relationship is inferred from a missing removal event.

Event prose now says that a figure “began worshipping” another figure rather than forming a raw “deity relationship.” Prayer and profanation templates retain named participants and sites without inventing historical structure names in the generic timeline.

## Bounds and delivery

The existing explorer worker lazily indexes figures, entities, sites and events, in that order. The cache is world-scoped, cancellable and reset when worlds change. Bounds: 500,000 examined records, 100,000 context nodes, 150,000 accepted facts, 256 examined repeated-field/structure entries per source record family, 64 retained sphere labels, twelve source samples per group and twelve gallery cards per page. Dossiers show examined relation/event counts separately from retained evidence samples. Per-group limits, source clipping and index limits remain disclosed. Samples use archive order, not a claim of recency or historical completeness. Equal IDs do not merge figures and organisations because keys include the record family.

The feature remains native ES modules, HTML, CSS and inline SVG served from `main`, with no build Action, backend, remote image service or runtime dependency. Existing archives need no schema migration or reimport if they already contain relevant records. Missing optional Plus fields leave classifications or associations unavailable rather than invented.

Broad DF/DFHack/mod/localisation compatibility, comprehensive religious ceremony/performance interpretation, dedicated standalone structure pages and historical patron reconstruction remain unqualified or future work. Fixtures and screenshots use independently authored fictional records only.

## Compatibility evidence

- [DFHack exportlegends.lua](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua): entity types and repeated `worship_id`, site-local nested temple structures, alternative deity/religion patron fields.
- [Historical figure property parser](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/HistoricalFigurePropertyParser.cs): deity/force markers, repeated spheres, figure/entity links.
- [Historical figure relationships](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/HistoricalFigureRelationships.cs): directed deity links and worshippers.
- [Entity](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/Entity.cs) and [Structure](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/Structure.cs): type/worship fields and local building identity.
- Event adapters `AddHFHFLink.cs`, `RemoveHfHfLink.cs`, `HfPrayedInsideStructure.cs` and `HFProfanedStructure.cs` in that same pinned LegendsViewer source were inspected for participant aliases. The Chronicle deliberately avoids the consumer’s inferred missing link types or inferred religion/deity temple combinations.
