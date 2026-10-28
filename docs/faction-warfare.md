# Faction warfare networks

On an organisation or civilisation page, choose **Explore warfare network**. The dedicated view combines a bounded native SVG diagram, an equivalent HTML table and paginated source evidence. Its focused faction links back to its organisation record and recorded owned settlements. Evidence opens conflict histories, source inspectors and selected-conflict atlas overlays.

## Which connections exist?

Only explicit opposing-side fields create a pair:

- War collections: `aggressor_ent_id` against `defender_ent_id`. These carry the **recorded war aggressor** role and may draw an arrow.
- Conflict collections: `attacking_enid` against `defending_enid`. These retain **recorded attack-side** roles; they do not establish who started a war.
- Field-battle, site-attack, site-destruction and site-plunder events: `attacker_civ_id` against `defender_civ_id`. These also retain attack-side roles, not war aggression.

A faction appearing in a shared event, on the same side, as a victim/target without an opposing side, or merely in an involved-organisation field does not create opposition. Coalition members are paired across their explicitly opposing sides; this does not prove a personal encounter or a separate declaration of war between every pair. Sentinels, unusable sides and self-pairs are excluded. Missing organisation records retain a labelled, non-clickable node; no organisation is invented or guessed from population or site ownership.

Sources use the existing merged-record authority rules. Supplementary conflicts remain inspectable in the source record and are not counted as additional copies of a record. Role evidence is preserved in both directions: a counterattack never reverses the war aggressor. If different source wars name opposite aggressors, both recorded directions remain visible.

## What the weight means

An edge weight counts **distinct connected conflict groups**, not battles, individual encounters, deaths or a definitive count of wars.

Collections connected by explicit parent/child membership belong to the same family. Collections sharing an explicit event also belong to that family, conservatively preventing an overlapping source from counting twice. A standalone opposing-side event with no examined collection membership is its own group. A family contributes once per faction pair even if a war, its battles and several events all mention that pair.

Families spanning several wars or lacking a unique root are marked as shared/non-unique-root context. Their grouping is a conservative display definition rather than a claim that the wars are historically identical. A representative source war is preferred as grouping context; otherwise a conflict collection is preferred. Cycles terminate through iterative union/find and never recursively duplicate nodes.

Each edge also reports distinct source-record count and separate directional role counts. Role counts can overlap and must not be summed into a group count. Evidence pages list every retained role claim in the selected pair, including several roles from one record if present. Their grouping-context link may refer to a source outside the active year/type filter; the link is context, not an extra matching source.

Grouping limits and incomplete membership are explicit. A `*` marks edges whose group count may split unexamined or missing hierarchy links; those values are labelled examined components rather than confident distinct-group totals. An incomplete unrelated component does not automatically make a complete edge uncertain. Truncated source extraction can hide links across components, so it conservatively qualifies group counts more broadly. Source extraction limits may omit further opposition; empty results do not establish that the faction had no conflicts.

## Filters and exploration

Year bounds intersect recorded source start/end dates. A single recorded date is a point; an unknown end does not establish an ongoing war. Undated/inverted ranges do not match active year filters. Collection and event types are separate options. Draft control edits take effect only after Apply, keeping expansion, evidence and the saved URL consistent with the displayed graph. Filtering happens before counting and role aggregation, so choosing only battles removes war-aggressor arrows while retaining recorded battle attack roles.

Initial loading returns ten connections around the focus. Choose another displayed faction and **Expand opponents**, or use the equivalent table buttons, to add neighbours. Multiple pages for a faction remain available until exhausted or the display cap is reached. Reset restarts around the same focus without changing filters. The graph shows at most 25 factions and 60 pairs; it does not draw the whole world at once. Names open source records, and missing nodes cannot be expanded. A deterministic network layout does not represent geography, territory or chronology.

**Inspect sources** opens the selected connection’s evidence cards, at most 24 role claims per page. Both factions, roles, dates, source record and grouping context are visible. Collection evidence links directly to the scoped atlas; event evidence opens the event with its existing map action. The focus’s **View recorded settlements** link uses snapshot ownership and does not reconstruct historical borders from the network’s year filter.

Years/type and the selected evidence pair/page are hash-query state. Reload restarts graph expansion at the focus; evidence selection is restored when the pair is present in the initial page, otherwise the first displayed pair is used. Browser history, source links and copied routes still require the same locally imported archive.

## Performance and lifetime

The existing conflict worker/index is reused. A lazy source/group derivation is cached for the active world, with up to four filtered networks. Switching worlds or terminating the explorer clears these caches. Neighbour expansion and source pagination reuse them. The UI draws only the bounded graph/table and visible evidence page. Existing graph-layout code is dynamically imported when the network view opens. No new library, build step, server, migration or external request is required.

Source derivation examines at most 20,000 collections, 250,000 hierarchy/event membership references, 250,000 event records and 250,000 side-role references. It retains at most 100,000 pair/role claims and at most 128 cross-side pairs per source record. These are separate budgets with explicit diagnostics. Work yields periodically and checks cancellation; record/route changes abort pending requests and suppress stale responses. Supporting sources remain world-scoped.

The underlying field definitions and compatibility limits are shared with [warfare.md](warfare.md), including its pinned primary DFHack structure definitions. New graph weights and conservative family grouping are application derivations, not exported game statistics.

## Verification fixtures

Authored tests cover war/battle/event deduplication, counterattack roles, coalitions without same-side links, one-sided/self/sentinel exclusions, independent and overlapping wars, cycles, date/type filters, standalone events, missing/incomplete context, deterministic paging, display/source budgets, cancellation, canonical padded-ID ordering and archive isolation. A synthetic 50,000-claim case checks bounded neighbour/evidence pages. It measures worker-algorithm work in Node, excluding browser storage and rendering.

The fictional campaign fixture now includes a third faction, another war, a raid and a standalone battle event. These form a small expandable triangle and demonstrate one pair supported by several nested sources without multiplying its group weight. No original export contents or derived world findings are committed.
