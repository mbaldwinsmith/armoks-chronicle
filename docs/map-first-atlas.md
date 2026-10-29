# Map-first atlas

The map appears above historical statistics. Primary projection, colour and zoom controls precede the canvas. Secondary map controls, source-linked site selection, legends, recorded footprint controls and battle details remain below. Historical Filters & Statistics opens the year and comparison controls.

Supported maps attempt WebGL by default, with an explained flat-map fallback. Explicit flat/Canvas relief URLs remain supported. Rivers start off. Biome, elevation, evilness, savagery and volcanism colour layers remain available.

Heatmaps have been removed entirely at the user’s request: controls, colour legends, demographic/event density calculations, population-report loading within the atlas, special WebGL marker rings, styling and heatmap-only verification assets. Old heatmap URL parameters are ignored and removed when atlas state is written. Regular site markers, explicit region/construction footprints, battle markers, year filtering and comparative statistics remain. Population reports continue to work through their dedicated reader and source-record panels. Saved archive data is unchanged.

Live validation on 29 October 2026 passed against `7e1600f`, offline release `0.36.2-7e3cafe8f20272ac` (92 assets). All 61 focused Node checks pass, including the independent population-report reader. The live fixture runner verified absent heat controls, removal of legacy heat URL settings, source-return routes, year filters, comparisons, footprints, battle details, 390px reflow, fallback and archive isolation. Manual inspection confirmed the clean map-first UI. Only the generated fictional test archive was removed afterward. The optional WebGL browser checks remain conditional on graphics support; the cloud browser does not expose WebGL.

## Civilisation-level factions

The default settlement grouping and colour key now use the exported `civ_id` civilisation/entity reference. All mapped sites sharing that entity use one faction colour and one legend visibility group, even if their `cur_owner_id` local governments differ. Local Site Owner remains an explicit alternate view; an explicit `basis=owner` URL still requests it. Missing civilisation fields stay unknown rather than silently falling back to a different local-owner grouping. The same grouping feeds flat, Canvas relief and WebGL site colours, filters and linked lists. Faction warfare pages link to civilisation settlements by default; entity records list that action before the separate local-ownership action. Saved archives need no migration or reimport.

The authored atlas fixture now has two sites sharing civilisation 5 but local owners 6 and 7. Regression checks verify one shared default group with two sites, two explicit owner groups, shared visibility and source-return state.

Verified live on 29 October 2026 against runtime `c94dd31`, offline release `0.36.3-dbad21b96eca8ca4`. The 26 focused politics/atlas/mesh/offline checks pass. The browser runner confirms one default Copper League legend group with two differently owned sites, shared visibility hiding both sites, two explicit local-owner groups, source-return preservation and existing atlas/battle/fallback/narrow-screen checks. Manual inspection confirms Civilisation / Entity selected with The Copper League (2). The authored test archive was removed; the existing archives remain intact.
