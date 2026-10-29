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

`offices-legends.xml` / `offices-legends_plus.xml` are independently authored Crown and Ledger fixtures under the same MIT licence. They cover organisation-scoped office IDs, appointer/promise roles, repeated/overlapping offices, tied long terms, an ordered zero-year term, open/unknown/missing-holder endpoints, office creation without appointment and separate snapshot assignment IDs. No original export content or findings were copied.

`settlements-legends.xml` / `settlements-legends_plus.xml` are independently authored Stone and Standard fixtures under the same MIT licence. They cover founding, attacks, related takeover/leader sources, tribute/surrender, destruction/reclamation, explicit structure rebuilding, disputes, owner/government/civilisation separation, unknown/missing targets, competing same-year records and a supplementary government conflict. Reuse the authored example map as `settlements-world_map.csv` for normal UI import. No original game-world data or derived findings were copied.

`artifacts-legends.xml` / `artifacts-legends_plus.xml` are independently authored Cabinet of Loose Claims fixtures under the same MIT licence. They cover a secret-source slab, a memorial with a misleading name, description-only evidence, teacher ambiguity, conflicting holder/site snapshots, figure/organisation claims, possession distinct from holding, writing aliases/missing works and destruction. Names, descriptions and humour are invented test content, not original world exports or claims about normal world generation.

For a normal Cabinet import with terrain, reuse `example-world_map.csv` as `artifacts-world_map.csv` alongside the two authored artifact XML files.

`bestiary-legends.xml` and `bestiary-legends_plus.xml` are independently authored fictional fixtures for exported creature definitions, zero-figure species, exact/unique-alias matching, ordinary citizens with misleading names, unclassified figures, directed attacks/devouring, unnamed prey, changer/changee separation, secret learning and deceased/slayer separation. They contain no supplied-world data.

`religion-legends.xml` and `religion-legends_plus.xml` are independently authored fictional sacred-annals fixtures. They include two marked deities, a force, a disputed marker, misleading names/spheres, a missing worship target, religious organisations and a military order, separate named membership/worship links, direct and group-associated temples, conflicting patrons, repeated local structure IDs across settlements, and historical worship/prayer/profanation context. They contain no supplied-world content.

`intrigue-legends.xml` and `intrigue-legends_plus.xml` are independently authored fictional fixtures for source-local plot/actor IDs, participant links, missing actors, on-hold and unknown plot outcomes, parent/delegated references, named persona metadata versus identity users, unmapped nemesis IDs, failed/explicit-success/unknown relationship events, interrogation and wrongful-conviction roles, and punishment without inferred execution. They contain no supplied-world content.

`structures-legends.xml` and `structures-legends_plus.xml` are independently authored fictional fixtures for settlement-local buildings, named inhabitants, explicit site-property owners and unlinked properties, disputed ownership, libraries/tavern/keep/guildhall/temple/tomb metadata, copied-artifact references, construction/razing/rebuilding, replacement, property-profile acquisition, modification and visits, and a history-only structure. They contain no supplied-world content.

The three `reports-00042-03-07-*` files are independently authored fictional census fixtures under the same MIT licence. They cover matching IDs/names, conflicting names, duplicate site sections and group labels, missing IDs, ambiguous organisation names, owner disagreement, Unnumbered groups, separate world/wildlife scopes, filename date clues, literal markup and world-history placeholder dates. They contain no supplied-world content.

`atlas-legends.xml` and `atlas-world_map.csv` are independently authored fixtures derived from this repository’s fictional warfare example. They add explicit valid/invalid region and construction footprints, negative and unknown dates, founding/destruction/government events, recorded figure races and two construction endpoints. They contain no supplied-world data.

