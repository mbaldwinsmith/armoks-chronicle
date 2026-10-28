# Biome palette and provenance

Reviewed 28 October 2026.

`js/data/biomes.js` maps the 51 numeric `biome_type` values (0–50) to the captions in DFHack's definitions. The enum begins at Mountain (0), followed by Glacier (1) and Tundra (2); ocean types are 27–29, lake types 36–41, and underground types 48–50. The table includes the full enum; a surface-world atlas does not reconstruct underground terrain.

The biome IDs/captions are factual export metadata. Colours are Armok’s Chronicle’s own palette, with a different hex colour for each known code. No biome is inferred from elevation, evilness, savagery or water flags. Unsupported codes receive an explicit Unknown Biome label and a diagnostic magenta colour. The legend counts each world tile once, includes only codes present in that archive, and uses the same palette as the map.

Primary sources pinned for reproducibility:

- [DFHack structure definitions, `biome_type` in df.d_basics.xml](https://github.com/DFHack/df-structures/blob/d8ff8a6326db37c11dc4173fadcf30b56e51b42d/df.d_basics.xml).
- [DFHack exporter, `export_world_map_metadata` in exportlegends.lua](https://github.com/DFHack/scripts/blob/4c4f5bf510e22fb96857328638e93ded3f608d0e/exportlegends.lua). CSV v3 writes `dfhack.maps.getBiomeType(x, y)` into `biome_type`.

Compatibility is tied to these reviewed definitions and the supported CSV v3 contract. New or unverified codes remain unknown rather than borrowing another biome’s name. Names do not establish historical biome changes: terrain is the export-time snapshot. Rivers and settlement/conflict markers remain overlays on the selected palette.
