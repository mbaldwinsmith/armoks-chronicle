# Supernatural History

Open **Supernatural Figures** on the Chronicler’s Desk, or select Historical Figures in the record directory. Vampire, werebeast, necromancer and deity filters are independent and combine with AND. A figure can have more than one kind of evidence. The directory shows the same states used by each figure’s **Supernatural History** panel.

## Evidence states and scope

- **Evidence Found** means an implemented rule matched a supported recorded marker or event. Badges say “Vampire Evidence”, for example; they do not assert a current condition, continued survival, a complete history or game-mechanical validity for every mod.
- **Possible** means a recognised identifier convention, ambiguous marker or form-name clue exists without enough supporting definition to promote it.
- **Unknown** means no supported evidence was found in the examined data. This never means ordinary, mortal or definitely absent. Source/index limits can leave relevant evidence unexamined.

Choose **Only show figures with subtype evidence** for an OR across the four subtypes, then narrow with the individual AND filters. **Include possible evidence in positive-only selections** explicitly expands Evidence Found/positive-only matches to include Possible. Possible Only and Unknown remain exact state selections. Name/ID search, categories, paging, filter choices and uncertainty opt-in persist in archive URLs and linked-record navigation. Directory filters apply only to figures; other record-family searches retain their normal behaviour.

This implementation has no recorded-absence state: the inspected deity export convention is a presence marker, and missing tags do not establish a negative. Explicit negative mappings must be verified before an absence filter can be added. Rankings continue to include all eligible figures; supernatural inclusion/exclusion controls for Book of Records remain a separate PLAN task.

## Rules v1

| Recorded evidence | Result | Qualifications |
|---|---|---|
| Figure `active_interaction` exactly `VAMPIRE_CURSE` | Vampire Evidence Found | Matches the documented game example identifier; active field is kept distinct from learned knowledge. |
| Figure `active_interaction` exactly `WEREBEAST_CURSE` | Werebeast Evidence Found | Matches the documented game example identifier. |
| Generated vampire/werebeast-style numeric identifiers, or a werebeast bite interaction in the active field | Possible corresponding subtype | The raw effect definition is not exported; a bite action is not independently equated with carrying a curse. |
| `interaction_knowledge` or active `SECRET_<number>` / `EXAMPLE SECRET` | Possible Necromancer | A known/active identifier alone does not identify the secret’s effects. Knowledge of a vampire/werebeast interaction does not classify its knower as cursed. |
| `hf learns secret`, with the recorded life-and-death secret text | Necromancer Evidence Found for the learner | The exact normalised English name, including its supported `IS_NAME` wrapper, matches the documented necromancy example. Teachers do not inherit the student’s label. |
| `hf does interaction` naming a target and a recognised vampire/werebeast interaction | Possible target subtype | A recorded interaction is not promoted to an established active or continuing effect. Doers are not inferred to share or transmit the condition. |
| `changed creature type` naming a were-form as `new_race` | Possible Werebeast for the changed figure | Form/species naming is kept separate from an established curse; changers do not inherit it. |
| Explicit empty/true/1 `deity` marker | Deity Evidence Found | Unsupported marker values or conflicting merged/Plus values remain Possible. |

An unspecified `DEITY_MAJOR_CURSE` does not automatically identify a vampire. Figure names, species such as vampire bats, death spheres, worship links, religious organisations and `force` markers do not establish any of the four subtypes. A force marker is retained as context rather than silently relabelled a deity. Unrelated learned secrets and unknown interaction IDs remain inspectable context. No teacher chains, infection genealogy, guilt, hidden motives or curse-removal dates are invented.

Historical events describe recorded history. A later transformation does not silently erase earlier evidence, and a missing end/removal event does not prove an ongoing condition. Unsupported/localised/modded identifiers can remain Possible or Unknown even when a human familiar with that world could classify them.

## Source research and compatibility

Rules were designed against field semantics and explicit evidence, rather than copying a competitor’s classifier:

- [DFHack exportlegends.lua at 682648a696b8b6f0055e8aa4145c45b175487e01](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua) documents supplementary `secret_text`, `interaction_action`, creature-change labels and event field export. The Plus figure section does not provide a universal supernatural-status flag.
- [LegendsViewer-Next’s property parser at d972ad09e7d9c7f32d5a1f3cc3252f44643a8843](https://github.com/Kromtec/LegendsViewer-Next/blob/d972ad09e7d9c7f32d5a1f3cc3252f44643a8843/LegendsViewer.Backend/Legends/WorldObjects/HistoricalFigurePropertyParser.cs) supplies primary consumer-schema evidence for deity/force presence markers and scalar/repeated active/known interactions. Its event source was also inspected for teacher/student, doer/target and changer/changee aliases. No competitor implementation is copied or bundled.
- The distributed Dwarf Fortress 0.44.12 [vampire](https://sources.debian.org/src/dwarf-fortress/0.44.12%2Bdfsg1-0%2Bdeb10u1/i386/raw/interaction%20examples/interaction_vampire.txt), [werebeast](https://sources.debian.org/src/dwarf-fortress/0.44.12%2Bdfsg1-0%2Bdeb10u1/i386/raw/interaction%20examples/interaction_werebeast.txt) and [secret](https://sources.debian.org/src/dwarf-fortress/0.44.12%2Bdfsg1-0%2Bdeb10u1/i386/raw/interaction%20examples/interaction_secret.txt) example definitions establish the exact supported identifiers/name and their effects. These are compatibility references, not a claim that all later/generated/modded exports use those names.

Original supplied exports were checked locally for field shapes using the existing CP437/control-character-aware parser. Their names, counts, histories and classifications are not copied into public fixtures or documentation. The new Midnight Archive fixtures are independently authored. Their deliberately overlapping vampire/necromancy evidence exercises composable filters; it is not presented as an ordinary unmodded world-generation outcome.

## Biography and navigation

The panel displays each subtype’s state and expandable counting/rule evidence, with source origins/paths and direct source-inspector links. **How Did They Become This?** offers dated secrets/interactions/transformations and undated snapshot fields. Roles link teachers, learners, actors, targets, changers, changed figures, sites and artifacts directly to their records. Missing referenced records stay labelled and unlinked. Event-specific aliases also feed the reverse-reference index and Follow the Thread, so these records can lead onward without inventing personal relationships.

Context sorts known years first, including negative years other than the unknown sentinel `-1`. Equal dates use stable source keys and do not establish exact temporal order. Pagination is reloadable through `superOffset`. This is a bounded evidence sample; the ordinary timeline and source inspector remain available for other history.

## Performance and lifecycle

A lazy exploration-worker pass reads figure records first, then events, and caches compact versioned profiles for the current immutable archive. No full XML records are retained in this cache. The cache is cleared on archive/worker changes; no database migration or reimport is needed. Navigation aborts profile requests and stale replies cannot update the view.

Construction bounds: 100,000 indexed figures, 500,000 source records, 256 relevant field values per figure. Each profile retains six evidence items per subtype and 24 context items; context pages contain six items. Repeated merged/Plus field facts deduplicate while keeping bounded origin samples. Evidence upgrades retain a positive supporting source even if earlier possible evidence filled the sample. Display strings and reference IDs are bounded. Limit flags and incomplete/unknown states remain explicit.

## Verification

Fourteen pure tests cover independent traits, supported markers, uncertain identifiers, learner-only attribution, actor/changer separation, generic-curse/race/force/name false positives, conflicting/duplicate sources, AND/uncertainty filters, URL restoration, context paging/dates, missing participants/artifact IDs, bounded positive proof retention, limits and archive isolation. Browser integration imports standard/Plus Midnight Archive fixtures, checks worker/profile/filter agreement and safe DOM/evidence links, then switches archives to verify cache isolation.
