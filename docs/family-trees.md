# Family trees

Open a historical figure and choose **Open family tree**. The existing relationship explorer also offers a **Diagram layout** selector for switching between Family Tree and Relationship Network. The selected layout is retained in the figure’s hash URL, restored on reload, and carried through linked figure navigation. Expansion starts again at the focused figure after a reload.

## Evidence and placement

A relationship label describes the target as recorded by the source. A source listing a target as its mother, father or parent places that target above the source; child, son and daughter do the reverse. Explicit spouses and siblings impose a shared relative generation. Birth years do not place generations. Shared parenthood never creates a spouse relationship.

The diagram groups reciprocal descriptions of the same parent/child or spouse relationship into one connector. The accessible Recorded Connections list retains every directed claim and its merged/Plus source evidence. Figure names open biographies; evidence links open the supporting source record. Missing figures retain their explicit family position and a dashed, non-clickable node. Invalid/sentinel IDs are counted separately and never create people.

Multiple recorded spouses are shown as distinct figures in the same generation, grouped alongside the focused figure where possible. Snapshot links do not establish marriage order, remarriage dates, current marital status, or that every spouse claim describes the same time. Available source start/end years remain in the evidence list. The view does not infer unexported former spouses or additional parents.

Distant relationships such as cousin, aunt or grandparent remain inspectable. They do not invent an intervening ancestry chain. Unless explicit parent/child, spouse or sibling links establish their generation relative to the focus, these figures appear in an **Unplaced Relatives** band. Parent links among unplaced figures remain source claims; their generation relative to the focused figure is still unknown. Opening a figure makes it the new focus.

## Conflicting generations and cycles

The bounded layout processes direct parent constraints first, then spouses, then siblings, with a stable key order. Each new constraint is checked against already placed relative offsets. An inconsistent constraint or self-relative claim is retained and flagged as a **Placement Conflict**, with a red dashed diagram connector and a matching warning in its list row. A consistent subset determines positions; this ordering is a display rule, not a decision that one source is true. Parent cycles terminate without recursively duplicating figures. A shared ancestor appears once.

Lines, labels and the equivalent list distinguish parent/child, spouse, other family and conflicting connections. Visual generations are relative to the focused figure; they are neither historical eras nor a reconstruction of biological ancestry beyond the exported claims.

## Navigation and bounds

Choose **Expand a figure**, then **Expand family branch**, or use the per-figure expansion buttons in the list. Each request adds up to eight explicit family links. Parents and children can both be explored, including incoming-only links stored on another figure. Nodes remain unique across branch expansions. Reset returns to the focus; Zoom in/out, Fit family tree and scrollbars control the diagram. The diagram is a keyboard-focusable scroll region; an ordinary HTML list exposes all displayed claims and actions.

The existing bounds apply: 40 displayed records, 100 displayed source connections, 500 source records per neighbourhood, 5,000 inspected links per source record and 4,000 incident links per neighbourhood. Incomplete scans, unusable IDs, remaining pages and display caps are disclosed. These bounds can omit further family; an empty display is not proof that a figure has no relatives. A diagram connector may summarise several displayed claims, so connector counts need not equal list-row counts.

Leaving the record disposes the panel and aborts its pending request. Layout switches reset expansion and retain timeline query context. The feature uses native SVG and existing worker/storage infrastructure, adds no dependency, and works with already stored archives.

## Implementation

- `js/data/family-tree.js`: canonical diagram relations, deterministic relative-generation constraints, contradiction detection, spouse grouping and bounded row layout.
- `js/views/family-tree.js`: safe SVG rendering and generation bands.
- `js/views/relationships.js`: shared branch expansion, evidence list, mode controls and disposal.
- `js/views/explore.js`: entry buttons and URL restoration.

Authored fixtures cover reciprocal direction, multiple spouses, several parents, repeated ancestors, missing relatives, unplaced extended family, sibling rows, contradictory links, cycles, self links, merged/Plus evidence, empty families and non-overlapping forty-node rows. Browser checks exercise actual worker-backed family filtering, expansion, evidence and layout switching. Original world exports and derived findings are not published.
