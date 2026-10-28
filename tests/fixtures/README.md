# Synthetic fixture provenance

These tiny example XML files were authored specifically for Armok's Chronicle under its MIT licence. They contain invented figures and events, not copied game exports. They are also offered in the import UI as an explicitly labelled demonstration.

They cover standard/Plus ID overlap, conflicting race/event labels, supplemental fields, nested relationships, and unknown negative dates. See parser.test.mjs for generated edge-case fixtures. Real user exports are not committed.

The fictional example includes six figures with directed family, friendship, rivalry and deity links, affiliations, reciprocal/one-sided links, a missing target and a sentinel ID. The Plus spouse link deliberately repeats main evidence. These are authored examples, not claims about game-world relationships.

The authored 8 × 8 map now includes named forest, grassland, savanna, desert, mountain, lake and ocean biome codes for palette/legend checks. It is a fictional demonstration, not copied game terrain.

The `warfare-legends.xml` and `warfare-legends_plus.xml` pair is an independently authored fictional campaign fixture under the same MIT licence. Its central campaign includes two battles, a nested duel, a duplicated death membership, named and squad deaths, explicit factions/non-combatant roles, missing membership, an unrelated ceremony and conflicting Plus outcome/count fields. The existing authored map can be reused with it. No original game-world data was copied.

For a normal UI import of the campaign, name the reused authored map `warfare-world_map.csv` so that all three selected filenames share the `warfare-` prefix.

The faction-network extension adds the fictional Silver Compact, a second connected war, a separate raid and a standalone battle event. Explicit opposing fields and a counterattack exercise distinct-group weights and source-role directions. The added history remains entirely authored test data.
