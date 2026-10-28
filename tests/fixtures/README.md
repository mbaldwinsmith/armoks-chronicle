# Synthetic fixture provenance

These tiny example XML files were authored specifically for Armok's Chronicle under its MIT licence. They contain invented figures and events, not copied game exports. They are also offered in the import UI as an explicitly labelled demonstration.

They cover standard/Plus ID overlap, conflicting race/event labels, supplemental fields, nested relationships, and unknown negative dates. See parser.test.mjs for generated edge-case fixtures. Real user exports are not committed.

The fictional example includes six figures with directed family, friendship, rivalry and deity links, affiliations, reciprocal/one-sided links, a missing target and a sentinel ID. The Plus spouse link deliberately repeats main evidence. These are authored examples, not claims about game-world relationships.

The authored 8 × 8 map now includes named forest, grassland, savanna, desert, mountain, lake and ocean biome codes for palette/legend checks. It is a fictional demonstration, not copied game terrain.

The `warfare-legends.xml` and `warfare-legends_plus.xml` pair is an independently authored fictional campaign fixture under the same MIT licence. Its central campaign includes two battles, a nested duel, a duplicated death membership, named and squad deaths, explicit factions/non-combatant roles, missing membership, an unrelated ceremony and conflicting Plus outcome/count fields. The existing authored map can be reused with it. No original game-world data was copied.

For a normal UI import of the campaign, name the reused authored map `warfare-world_map.csv` so that all three selected filenames share the `warfare-` prefix.

The faction-network extension adds the fictional Silver Compact, a second connected war, a separate raid and a standalone battle event. Explicit opposing fields and a counterattack exercise distinct-group weights and source-role directions. The added history remains entirely authored test data.

The base fictional example includes two authored era records with start years and no end years or IDs. This tests parser-assigned era addresses and explicitly unknown end dates; no intervening end year is inferred.

`grudge-legends.xml` is an independently authored fictional ledger world under the same MIT licence. It tests explicit directed grudge labels versus enemy links, killings versus natural/unexplained deaths, theft without an invented owner, abduction roles, missing and undated references, and war/counterattack/member-event overlap. No original game export was copied.

The independently authored `supernatural-legends.xml` / `supernatural-legends_plus.xml` Midnight Archive pair tests overlapping vampire/necromancy evidence, werebeast/deity markers, role-specific secrets and transformations, ambiguous identifiers, an unsupported/conflicting marker, force-versus-deity distinction, a vampire-bat false positive, missing actors and a book-linked secret. Deliberate overlaps are classifier fixtures, not claims about normal unmodded world generation. No original export content was copied.

`journeys-legends.xml` is an independently authored Wayfarer World fixture under the same MIT licence. It covers repeated visits, competing same-year places, wandering without a location, unknown dates, a killer who must not inherit the victim’s location, artifact creation/storage/possession, claims from afar, missing sites, gifts and undated snapshot fields. Reuse the authored map as `journeys-world_map.csv` for normal UI import. No original game-world data was copied.
