# Settlement Chronicles and Recorded Changes of Government

Open a saved site and find **Settlement Chronicle**. It brings together supported founding, reclamation, attack, destruction, diplomacy, local-government and construction records. Source-linked cards preserve the recorded participants and distinguish parent civilisations, local governments, named attackers/builders and new leaders. No missing owner, reign, motive or political boundary is supplied by inference.

**Export-Time Snapshot** shows `cur_owner_id` and `civ_id` separately. A positive ID links the saved organisation; −1 remains an explicit no-recorded-affiliation value; an absent/unsupported field is unknown. A missing referenced organisation is labelled and unlinked. These undated snapshot fields do not fill historical gaps or replace the government names recorded in earlier events.

## Supported history and source roles

| Source family | Interpretation | Ownership-count treatment |
|---|---|---|
| `created site` | Founding or construction, retaining `civ_id`, `site_civ_id`, optional `resident_civ_id` and `builder_hfid` roles. | Not a change from a known previous owner. |
| `reclaim site` | Recorded reclamation. | Does not supply the previous local government or prove site-wide rebuilding. |
| `attacked site`, `hf attacked site` | Organisation/figure attack, with defender and site organisation where recorded. | Attack is not automatically conquest. |
| `destroyed site`, `hf destroyed site`, `plundered site` | Recorded destruction/plunder, preserving attacker roles. | Does not automatically install the attacker as owner. |
| `site taken over`, `new site leader` | Takeover/leadership event with previous `site_civ_id` and new `new_site_civ_id` local governments; `attacker_civ_id` and `defender_civ_id` remain distinct parent-civilisation roles. | A dated event can qualify only when different old/new local governments are explicitly identified, both are saved, and relevant source fields do not conflict. A named new leader alone is insufficient. |
| `site surrendered`, `site tribute forced` | Surrender or tribute relationship, preserving the named parties. | Does not equate the recipient/attacker with a new local-government owner. |
| `site dispute` | Links `site_id_1` and `site_id_2`, with each disputing organisation and the recorded subject. | Both settlements get the context; neither changes owner by inference. |
| `site abandoned`, `site died`, `site retired` | The recorded site-fate or retirement event, without claiming that all inhabitants died. | No new owner is invented. |
| `created structure`, `replaced structure`, `razed structure` | Construction, replacement or razing within the site. A recognised empty/true/1 `rebuild`/`rebuilt` marker explicitly describes rebuilding a structure. | Does not reconstruct the entire settlement, dedicated structures or political control. |

The normal site reference is `site_id`. Verified structure creation/replacement schemas also support `site`. Contradictory structure-site aliases remain flagged. Unsupported specialist events stay in the general event timeline and source inspector. Structure IDs remain site-scoped raw details; this feature does not invent standalone structure URLs.

## Most Contested Settlements

The Book of Records category counts **recorded changes of local government**, not attacks or every form of contest. Each qualifying source must name a dated takeover/new-leader event, a saved site, and two different saved local-government organisations. Missing IDs, sentinel −1 IDs, unknown years, unchanged government IDs, missing organisations and conflicting standard/Plus fields are excluded. Negative prehistory years other than −1 remain valid.

Related takeover and leadership records can describe the same change. Records sharing site, calendar year and old/new government pair are grouped as follows:

- If every record has a valid `seconds72` timestamp, each distinct timestamp counts once.
- If any timestamp is missing, that same-year government pair counts once. The cards disclose this conservative grouping; it may undercount real repeated changes.

Different pairs and different years remain separate. Equal or incomplete timestamps do not establish their order. An undated event never acquires a date from a neighbouring event, collection or snapshot. Standard/Plus copies merged by event ID are not counted twice. Nested conflict totals are not added to these source-event counts.

Tied sites share competition ranks. The table samples up to five qualifying change sources per site and links to its full curated chronicle, where all retained related records and exclusions can be examined. Sites without qualifying changes are excluded rather than ranked as zero; missing site targets are counted separately. Partial source indexes are visibly disclosed. This is not an archive-complete claim of historical ownership, disputed sovereignty or territorial borders.

## Reading controls and map links

Category and inclusive year filters apply to the curated reading list. Year bounds exclude undated records. Invalid/reversed bounds produce a useful message. The headline comparison count continues to use the whole examined history, as its explanation states. Twelve-card pages, category and year selections survive URLs and reloads, alongside existing reader filters.

Source links open the original event inspector and offer **Return to This Settlement Chronicle**, retaining the history selection. **Explore This Settlement on the Map** selects its recorded tile and retains the return-to-chronicle context across flat/relief projection and atlas URL changes. Missing coordinates leave the chronicle usable. A missing CSV does not produce fabricated terrain. Atlas terrain and faction colours remain export-time snapshots; no dated ownership layer, political border reconstruction or year slider is introduced here.

## Source verification

Primary consumer schemas inspected at LegendsViewer-Next commit `6045eb08a42d09882cad43c1ef6db37e551cd580`: [`SiteTakenOver`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/SiteTakenOver.cs), `NewSiteLeader`, `CreatedSite`, `ReclaimSite`, `SiteSurrendered`, `SiteTributeForced`, `SiteDispute`, `AttackedSite`, `HfAttackedSite`, `DestroyedSite`, `HfDestroyedSite`, `PlunderedSite`, `SiteAbandoned`, `SiteDied`, `SiteRetired`, `CreatedStructure`, `ReplacedStructure` and `RazedStructure` in that directory. These establish the supported field-role conventions. The app does not copy the consumer’s invented baseline/founded owner periods or parent-organisation mutations. No upstream code is bundled. Compatibility with every DF/DFHack version, localisation or mod is not claimed.

## Bounds and storage

A lazy worker index scans at most 500,000 event records and retains up to 100,000 supported facts across at most 50,000 referenced sites. A dispute can reference two sites; the fact is shared rather than copying its raw record. Lists are sorted once in the index. Source/fact/site limits produce explicit partial-history/comparison notices. Evidence IDs and display tokens are bounded; all DOM rendering uses safe text.

One derived settlement index is cached for the loaded immutable archive and cleared on world switch. The existing Book of Records pass can populate/reuse the same index. Navigation cancellation prevents interrupted cursor scans being cached; stale profile replies cannot replace another record. No database version, original source, research or chronicle is modified. Existing archives work without reimporting. The site still serves native modules directly from `main`, with no build action, remote runtime dependency or new library.
