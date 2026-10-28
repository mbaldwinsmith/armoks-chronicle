# The Artifact Cabinet

Choose **Artifact Explorer** on the Chronicler’s Desk, or its Artifacts total, to open the Cabinet. Twelve-object pages have native vector relic marks, names/materials, selected history counts and secret-evidence badges. Search names, materials or `#ID`; combine object type, evidence state and named-holder/place/claim filters. Order by name or selected history count. Choices and page offsets live in archive URLs and survive record/source return links. Ordinary artifact directory URLs remain available.

The editorial asides are fixed, type-based flavour—not generated game events, motives, curses or hidden facts. Names, participants, inscriptions and histories come from the imported records. Descriptions are rendered as source text, preserving paragraphs, and never interpreted as HTML.

## Whose artifact is it?

The dossier separates four questions:

- **Who Owns It?** The inspected artifact schema does not provide a universal legal-owner field. The app therefore says ownership is not established, rather than promoting another relationship into ownership.
- **Who Has It?** `holder_hfid` is the physical-holder reference in the saved snapshot. A sentinel −1 means no name is supplied; missing fields are unknown. Different merged/Plus values are both shown with a disagreement notice.
- **Where Is It?** Artifact `site_id` and `subregion_id` are snapshot place references. They are separate from the latest retained dated location events. A holder’s home or travels are never inherited by the object. Missing saved targets remain labelled and unlinked.
- **Who Claims It?** Explicit `artifact claim formed` events retain figure and organisation claimants, claim kind, circumstance and date. More than one party can be recorded. A claim “from afar” is still a claim, not a visit or possession. Claims are historical source assertions, not a complete active-rights registry or confirmed current ownership.

Historical possession records, creation/naming, recovery, loss, storage and destruction remain evidence with dates and source links. Naming-only creation events name a **Naming Figure**, not a physical creator. A destruction record produces a prominent notice; snapshot fields do not prove the object survived. Latest-location cards describe retained dated evidence, not a current position. The existing Recorded Whereabouts/journey panel remains available below the dossier.

## Slabs and secrets

The Cabinet makes three states explicit:

| Badge | Evidence | Limits |
|---|---|---|
| **Recorded Secret Source** | A supported `hf learns secret` event names this artifact and has no recorded teacher; supported aliases and source fields do not disagree. | It records learning from this object, not the learner’s current powers or a complete inscription text. The secret name is shown when exported; otherwise it remains unidentified. |
| **Possible Secret Connection** | The exported object description mentions “secret”/“secrets”, or a secret-learning record names both a teacher and artifact, malformed/conflicting source fields or oversized secret text. | A description mention is not promoted into proof of an encoded teaching. Teacher/artefact co-occurrence does not establish the object as the learning source. |
| **Secret Status Unknown** | No supported evidence in the examined data. | Does not mean a blank, mundane or secret-free slab. Source/sample limits may leave evidence unexamined. |

Only `item_type=slab` identifies the item as a slab; names such as “The Secret Keeper” do not. Ordinary writing, book titles and unsupported hypothetical secret flags never establish a secret. The dossier distinguishes quoted exported descriptions from source-event evidence. A linked written work is metadata, not automatically a secret or the full work text.

The standard/Plus written-content aliases `writing`, `item.page_written_content_id` and `item.writing_written_content_id` are deduplicated. Missing written-content records remain visible. The same additional nested alias now participates in physical-copy rankings.

## Verified source conventions

DFHack [`exportlegends.lua` at 682648a696b8b6f0055e8aa4145c45b175487e01](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua) exports artifact item type/subtype, writing IDs, page counts, description and material, and enriches secret-learning events with `secret_text`. It does not export a universal slab-topic/engraving secret flag in that artifact block. Underlying in-memory slab topic/engraving fields are not silently treated as fields present in every Legends XML.

Primary consumer schemas inspected at LegendsViewer-Next commit `6045eb08a42d09882cad43c1ef6db37e551cd580`: [`Artifact`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/Artifact.cs), `HFLearnsSecret`, `ArtifactClaimFormed`, `ArtifactPossessed`, `ArtifactRecovered` and `ArtifactDestroyed`. These distinguish snapshot holder/place, writing aliases, teacher-versus-artifact learning sources and claim parties. The app does not derive current owners from possession events, copy coordinate conversions or interpret ambiguous destroyer IDs. No upstream code is bundled. Unknown DF/DFHack versions, languages and mod conventions remain unverified; description mentions currently recognise English whole words only.

## Bounds and persistence

The lazy worker reads artifact records before events and caches one derived Cabinet for the current immutable world. Budgets are 500,000 source records, 50,000 artifacts and 100,000 supported artifact/secret facts. Snapshot IDs, labels, types and source tokens are bounded. Each dossier retains up to twelve claim records, twelve recent location records, and six each of secret, possession, creation and destruction evidence; definite secret-source evidence is retained ahead of weaker samples. Totals and partial-index/sample notices remain explicit. No absence/current-state conclusion is drawn from truncation.

Writing links are bounded to 64 distinct IDs. Up to four distinct descriptions are clipped at 24,000 characters each, with a partial notice; paragraph rendering is bounded without turning source markup into HTML. Full raw records remain in the source inspector. Directory messages contain only a twelve-card page. World changes clear the cache; cancelled scans and stale dossier replies cannot overwrite another world’s page.

No import, database, research or chronicle migration is needed. Existing archives work without reimporting. Source records remain unchanged. The static site still uses native ES modules, DOM, inline SVG and CSS, with no new dependency, remote asset or build step.
