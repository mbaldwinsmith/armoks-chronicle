# The Bestiary

The Chronicler’s Desk opens a field journal with searchable, paginated **Recorded Individuals** and **Creature Definitions** views. A definition can have zero linked figures: this does not mean the species is extinct or absent. Linked historical-figure counts are not population estimates. The fixed chronicler’s aside is editorial flavour, not generated world history.

## Species and individuals

DFHack exports a `creature_raw` family containing `creature` records with `creature_id`, `name_singular`, `name_plural` and empty raw-flag presence markers. These records have no numeric source ID. The importer’s `@N` addresses are record addresses only; they are never compared with numeric figure race IDs.

Matching first uses the exported creature identifier, then a unique normalised singular-name alias. Duplicate aliases or conflicting figure race values remain unclassified. Race values containing raw indices are not resolved by assuming the parser’s order matches the game’s creature vector. Names, deity flags, curses and words such as “dragon” or “vampire” in an individual’s name never establish a species.

The default scope includes definitions with `has_any_megabeast`, `has_any_semimegabeast`, `has_any_feature_beast`, `has_any_titan`, `has_any_unique_demon`, `has_any_demon`, `has_any_night_creature`, or `large_roaming`. The `has_any` flags describe at least one caste in a definition; they do not prove an individual has that trait or performed any deed. Other exported raw fields remain in the source inspector.

**All Recorded Creatures** deliberately includes citizens. **Unclassified Figures** offers a fallback when definitions are absent, unsupported, ambiguous or conflicting. This is an explicit browsing scope, not a claim that every unclassified figure is a beast. Existing archives need no migration or reimport if they already contain the relevant raw family.

## Individual evidence

Dossiers retain directed roles for supported event types:

| Event | Individual roles |
| --- | --- |
| `hf attacked site`, `hf destroyed site` | Attacker |
| `hf wounded` | Wounder and wounded figure |
| `hf abducted` | Abductor and abducted figure |
| `creature devoured` | Eater and named victim; unnamed prey stays unnamed |
| `hf died` / `hist figure died` | Deceased figure and separately named slayer |
| `changed creature type` / `change creature type` | Transformed figure and separately recorded changer |
| `hf learns secret` | Learner and recorded teacher |

A slayer is not marked dead. A changer is not marked transformed. Secret-learning events do not establish a current curse or ability; the full figure record links to the existing Supernatural History panel. Missing deaths never establish survival. The exported race/definition is a snapshot, not a reconstructed transformation chronology.

Each retained event has a linked source record and resolved named participants. Missing targets remain unavailable references; unnamed victims do not become invented figures or population totals. Aliases that disagree withhold that directed role. Standard/Plus source disagreement is flagged while the merged standard rendering remains authoritative. Devouring’s otherwise ambiguous `eater` and `victim` fields are interpreted only for that exact event type, including reverse thread links and natural-language timelines.

The full historical-figure record remains the route to Recorded Whereabouts, supernatural evidence, relationships, annotations and the complete indexed timeline. Browser Back also retains the Bestiary route. Dossier-to-gallery return preserves the field-journal filters.

## Bounds and limitations

Indexing runs lazily in the existing explorer worker: definitions first, figures second, events last. The cache belongs to one world and is discarded on world changes. Limits are 500,000 examined records, 20,000 definitions, 100,000 figures, eight most recent retained evidence rows per figure and twelve directory cards per page. Role counts describe supported events examined within these limits; one event can provide several distinct roles. Sampling and indexing limits are disclosed. Year −1 is unknown; other safe integer years retain their sign. Equal-year ordering is deterministic by source ID and is not presented as a precise within-year chronology.

The gallery uses text-only safe DOM, native SVG ornaments, existing theme tokens, native labelled form controls, explicit submit/reset and cancellable requests. It adds no dependencies, database schema, network requests for world data, build step, image service or server.

Population definitions, comprehensive generated-creature compatibility, caste/power encyclopaedias and reference-hardware/mobile/browser qualification remain future work. All fixtures and visual verification use independently authored fictional records.

## Compatibility evidence

- [DFHack exportlegends.lua](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua): `creature_raw` export shape, raw flags and Plus singular race names.
- [DFHack creature schema](https://github.com/DFHack/df-structures/blob/d8ff8a6326db37c11dc4173fadcf30b56e51b42d/df.creature.xml): creature-raw `HAS_ANY_*` and `LARGE_ROAMING` flag identifiers.
- [LegendsViewer-Next](https://github.com/Kromtec/LegendsViewer-Next/tree/6045eb08a42d09882cad43c1ef6db37e551cd580): `Various/CreatureInfo.cs`, `Events/CreatureDevoured.cs`, `Events/ChangedCreatureType.cs` and `WorldObjects/HistoricalFigurePropertyParser.cs` under `LegendsViewer.Backend/Legends`, used to cross-check event participants and definition fields.
