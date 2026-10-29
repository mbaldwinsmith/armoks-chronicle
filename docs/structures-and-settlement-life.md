# Structures and Settlement Life

The Chronicler’s Desk opens a searchable, paginated settlement register for libraries, taverns, guildhalls, keeps, temples, tombs and other exported building types. Filters select type, source context, and recorded inhabitants, property-owner links, direct deity dedications or organisations. Search includes building and settlement names, explicit snapshot associations and local structure IDs. A settlement panel opens the directory already scoped to that settlement; clearing filters restores the full archive.

Dossiers show source-qualified snapshot roles, linked building history, replacement buildings, missing references and source disagreement. Settlement records list structures and site properties. Figure, organisation and artifact records show explicit building associations, including historical roles and copied-artifact references. Native book, tavern and building SVG ornaments and fixed editorial asides provide flavour without inventing world history.

## Local identity and missing snapshots

Building identity is **settlement ID + local structure ID**, not a globally unique building number. Zero is valid. Supported `id`/`local_id` and event aliases must agree. Standard/Plus structures are grouped by that pair, with source origins retained. Unresolved aliases are not matched by position or name.

A source event naming a structure whose snapshot is missing creates a qualified **History Without Snapshot** entry. Its label is simply its local source number; name, type and present condition remain unknown. An absent building in the snapshot is not treated as a destruction record. A missing settlement target remains an unavailable source reference.

## Different roles stay different

- Repeated `inhabitant` fields are individually recorded snapshot associations, not population totals, memberships, builders or owners.
- Nested site-property `owner_hfid` fields identify property owners separately. A property must explicitly name a `structure_id` before its owner is associated with a building. Multiple properties can name the same structure; no universal legal-owner field is invented.
- `entity_id` is shown as an associated organisation, not silently as the owner, government or builder.
- Explicit temple `deity` / `worship_hfid` or `religion` fields identify a deity dedication or religious organisation. Figure and entity patrons remain distinct. Conflicting patrons/types withhold a direct dedication. Tomb names, generic owner fields and inhabitants do not establish dedications.
- Repeated `copied_artifact_id` fields remain artifact-copy references, not proof that the original artifact is currently stored in or owned by the building.
- Builders, modifiers, visitors, acquirers, previous owners and destroyers come only from supported events and retain historical-role labels. They do not override snapshot property-owner or inhabitant fields.

Properties without a matched building remain visible in the settlement’s property list. Conflicting owners, including a named owner versus the −1 sentinel, remain unresolved. Conflicting source lists are qualified; repeated matching references deduplicate. Per-field context retains its source origin/path. Alternate exported building names remain metadata rather than separate structures.

## Source-linked history

Supported history includes `created structure` / `created building`, `replaced structure`, `razed structure`, `hf razed structure`, `modified building`, `hf disturbed structure`, `hf profaned structure`, `hf prayed inside structure` and `building profile acquired`.

Construction recognises explicit builder/organisation roles and supported `rebuild` / `rebuilt` presence markers. It does not infer ownership periods or an underworld gateway from a builder reference. Replacement uses `old_ab_id` / `old_structure` and `new_ab_id` / `new_structure` separately, retaining links to each building in the same settlement. Equal old/new IDs count one event for that structure and preserve both roles.

Property acquisition uses **site ID + building-profile/property ID**, then an explicit snapshot property-to-structure mapping. It never compares the profile ID directly with a structure ID. Missing or conflicting property mappings withhold the join. The dossier states that the mapping is from the export-time snapshot and may not describe the event date. Acquirers and previous owners named by an event remain historical, not inferred present owners.

Prayer, profanation and disturbance do not establish residence, membership or worship. Modification text is retained as exported. Each source can be inspected in the existing provenance panel, with a route back to the same structure and filters. New generic narrative templates preserve named participants and settlements without inventing historical building names.

A destruction event is explicitly flagged even if it falls outside the retained history sample. Later rebuilding or a surviving snapshot does not establish current intact/ruined status. No current-condition or survival field is inferred. Unknown years remain unknown; sampled history is ordered by recorded year/seconds and source ID, with equal dates not claiming an exact sequence.

## Bounds and delivery

Indexing is lazy in the existing explorer worker, in settlement-then-event phases. The cache belongs to one world, supports cancellation and resets when worlds change. Bounds: 500,000 examined source records; 50,000 structures and settlement contexts; 100,000 accepted events; 256 examined nested structure/property entries per source settlement; 128 retained references per building; 200,000 retained site properties, snapshot references and distinct reverse-context building links per corresponding budget; twelve retained recent history sources per building; twelve directory/context cards per page. Property, reference and event limits are disclosed. All counts describe accepted examined data, not complete world totals.

The reverse context index is separate from the twelve-event display sample, so an older builder does not disappear from its figure’s building associations merely because newer visits fill that building’s history sample. Overall index limits still apply. Properties are retained only within the global budget so many small settlement records cannot grow those lists without bound.

The feature uses native JS/HTML/CSS/SVG served from `main`, with no build Action, remote images, backend, new dependency or database migration. Existing archives require no reimport when relevant source fields are already stored. Raw source fields remain available for unsupported building/property schemas. Broad export-version, localisation/mod, mobile/browser and reference-hardware qualification remains open. Population report interpretation and historical ownership/patron reconstruction remain separate future tasks.

## Inspected compatibility evidence

- [DFHack exportlegends.lua](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua): `sites → structures → structure`, building IDs/types/names, inhabitants, temple patron fields and dungeon subtype metadata. Numeric dungeon/deity-type values are not independently decoded here.
- [Structure.cs](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/Structure.cs): structure aliases, associated entities, inhabitants and copied-artifact fields.
- [Site.cs](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/Site.cs) and `Various/SiteProperty.cs` in that pinned source: nested site properties, property IDs, `structure_id` and `owner_hfid`.
- `CreatedStructure.cs`, `ReplacedStructure.cs`, `RazedStructure.cs`, `HFRazedStructure.cs`, `ModifiedBuilding.cs`, `HFDisturbedStructure.cs`, `HFProfanedStructure.cs`, `HfPrayedInsideStructure.cs` and `BuildingProfileAcquired.cs` under `LegendsViewer.Backend/Legends/Events` in the same pinned consumer source were inspected for structure, property and participant roles.

These mappings define the bounded feature contract, not certification of every DF/DFHack export. All fixtures and screenshots use independently authored fictional records only.
