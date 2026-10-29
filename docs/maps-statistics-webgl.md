# Recorded History, Comparative Statistics and Rotatable Terrain

Open **World Atlas** or **World Statistics** from the Chronicler’s Desk. Statistics also work when no map CSV was saved. All core assets, including the optional renderer, remain local static files and are included in the offline inventory; no framework, CDN, runtime package download or Pages build is required.

## Historical controls and comparisons

All Recorded Years includes undated events. Through the Selected Year and Only the Selected Year use explicit recorded years and exclude undated records. Negative recorded years remain supported; the existing `-1` unknown-year sentinel stays unknown. The slider and numeric field share a source-derived range; exceptionally wide ranges use the numeric field. Changes are debounced while dragging and committed in the route. There is no autoplay.

The event heatmap counts distinct archived historical event IDs at usable locations. An event with a unique primary site uses its recorded site coordinates; otherwise an explicit event coordinate can locate it. Ambiguous or unavailable locations stay in the source list and counts. Heat uses logarithmic intensity with the current maximum labelled, no smoothing and no population, danger or completeness estimate.

Comparisons group those same filtered events by year, type, explicitly referenced settlement, explicit organisation references or the recorded races of referenced historical figures. Organisation and race are not inferred from current memberships, names, species definitions or geography. Settlement, organisation and race groups may overlap: an event can appear once in each applicable group, so group totals must not be summed into a census or grand total. Missing/no-qualifying-reference groups stay explicit. A chart bar or table evidence button drills into the underlying source events; clearing the group restores the comparison. Tables, event lists and pagination are equivalent alternatives to the graphics.

Terrain, footprint geometry and current affiliations remain export-time snapshots. A past event does not establish uninterrupted ownership, a past border, a population estimate or a construction’s continuous existence. Historical ownership reconstruction is deliberately not implied by this release.

## Recorded footprints

The checked DFHack exporter writes regions from `region_coords.x/y` and world constructions from `square_pos.x/y`, using pipe-delimited `x,y|` coordinates. These are drawn as explicit tiles, never guessed rectangles, interpolated roads or political borders. Repeated points deduplicate. Invalid/out-of-bounds coordinates, truncation and conflicting standard/Plus coordinates remain qualified; disputed footprints are not drawn. Named footprint lists and tile details link the source records and their available recorded event history.

Primary format evidence: DFHack scripts [`682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua`](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua), region and world-construction exports. The [`WorldConstruction.cs`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/WorldConstruction.cs) consumer confirms direct coordinate lists. [`CreatedWorldConstruction.cs`](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/CreatedWorldConstruction.cs) supports explicit `wcid`, `master_wcid`, `site_id1` and `site_id2` references. Two endpoint sites do not automatically locate a historical event at either endpoint. Other exporter versions remain unverified.

## Battle map details

Battle markers use a recorded collection site or coordinates, or one unique location among direct member events. Unknown places stay in the paged battle list. A selected war retains its explicit nested membership scope. Battle collection visibility follows known valid date spans (or a single known endpoint), independently of event-type/comparison filters. Undated battles are excluded when a year window is active.

Selecting a battle tile offers a source-linked dossier loaded on demand through the existing warfare worker. It retains participants, outcomes, distinct named death victims, unidentified death events and separate squad reports. Existing overlap, nested-report, missing-member and work-limit rules govern whether a squad subtotal is reliable. Named and squad casualties are never added together. The detailed dossier describes the complete collection rather than inventing casualties for just the selected map year.

## Optional native WebGL renderer

Choose **Rotatable Terrain (WebGL)**. It is lazy-loaded and supports maps up to 129 × 129 tiles. As of the map-first release, supported maps attempt WebGL by default with a flat fallback; explicit projection choices are retained. Canvas Raised Relief retains its separate 257 × 257 limit. Geometry consists of batched top surfaces and exposed sides, not hidden stacks of cube objects. Per-face colours remain sharp without enlarging a low-resolution texture. Ocean surfaces are translucent over lower exported elevations; lakes are not silently reclassified as ocean.

Drag to orbit, Shift-drag to pan, pinch or use buttons to zoom. Arrow keys orbit, Shift-arrow keys pan. Labelled rotation/tilt sliders and the existing site/coordinate selectors provide alternatives. Rotation zero looks north; the source grid’s X increases east and Y south. Camera rotation, tilt, zoom and pan are retained in the URL. Changing projection still fits the Canvas map; arbitrary cross-projection camera equivalence is not claimed.

Elevation is exaggerated regional export data, not metres, fortress blocks, caves or reconstructed historical terrain. Rivers use exported connections; adjacent-road connections retain their inferred status. Heat, explicit footprints and markers share the terrain projection. Markers are depth-tested against terrain; an offscreen colour/depth picking buffer selects the visible tile, including a front wall occluding a rear tile. Same-tile evidence remains in linked lists.

The renderer has no automatic rotation or continuous animation loop. Interaction paints are coalesced; hidden documents suspend painting. Geometry, marker and raster work are bounded, and GPU buffers, shaders, textures, framebuffer, renderbuffer, observers and event handlers are disposed on exit. Failed setup or lost graphics context returns to the flat atlas while retaining historical filters and selected data. Renderer failure is explained in the status text. Native graphics references: [WebGLRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext) and [context-loss events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event).

## Bounds and qualification

Atlas scans at most 100,000 events, 100,000 records per site/organisation/figure family, 5,000 collections, 4,000 footprint records and 200,000 footprint coordinates, with 65,536 points per footprint. Collection work additionally bounds member references and graph edges. Event-reference work is bounded per record. Hitting a limit discloses partial coverage; counts then describe the examined archive subset, not the complete world.

Combined map overlays draw up to 30,000 tile cells, prioritising heat; source lists remain available. Comparisons retain up to 2,000 groups, show twelve chart bars and page tables/events. WebGL geometry is limited to 700,000 vertices, up to 12,000 point markers and about two million framebuffer pixels with DPR at most 1.5. These are work budgets rather than measured phone frame-rate guarantees. Physical touch, large-world device memory/frame times and additional graphics drivers remain qualification work.

Run the focused checks with `node --test tests/atlas-analysis.test.mjs tests/terrain-mesh.test.mjs tests/terrain.test.mjs tests/warfare.test.mjs tests/offline.test.mjs`. The 39 checks cover source coordinates, ambiguous places, date filters, overlapping comparisons, event heat counts, source snapshots, exposed geometry, ocean/lake distinction, camera maths, a 129-square geometry stress case, existing casualty rules and the new offline inventory. The authored `atlas-*` fixtures contain no supplied world data. `tests/maps.html` adds real worker, source-return, battle dossier, GPU picking/orbit and context-loss fallback checks using one removable fictional archive.

## Live verification — 29 October 2026

Published runtime `44e7b86` uses app cohort `0.35.0` and offline inventory `0.35.0-1de358438b218f4d` (92 pinned files). The focused browser runner was refreshed independently in `e170baf`.

The live authored-fixture run passed real XML/CSV import and atlas workers, 12-event totals, exact-year filtering (three events in year 10), heat controls, explicit/unsupported footprint handling, overlapping organisation comparisons and drill-down, source-record return state, 390px reflow, lazy battle participants and separate named/squad casualties, unavailable-WebGL fallback, and isolation of existing archives. The current 39 focused Node checks pass. Runtime source files also pass syntax checks. The broader suite was not rerun for this bounded pass.

The cloud browser returns no WebGL context. The runner explicitly skips real GPU upload, occluded-wall picking, orbit and context-loss cases in that environment; those remain unverified on a graphics-capable browser. The app’s unsupported-graphics path was exercised and returned to the flat atlas with its year and heat settings retained. Geometry/camera mathematics and the 129-square mesh budget are covered by Node checks; they do not establish graphics-driver correctness or device frame rates.

Manual checks also confirmed statistics without a terrain export (nine events, all explicitly unmapped), readable comparison labels, and the flat and Canvas-relief atlas with recorded overlays. Existing archives were retained. Only the runner’s generated fictional atlas was removed after inspection. No supplied export data was used or published.
