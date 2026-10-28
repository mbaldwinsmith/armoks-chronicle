# Recorded Whereabouts and Journeys

Open a historical figure or artifact and find **Recorded Whereabouts**. Its summary shows the latest dated location evidence in the retained supported records, linking each source. Different locations in the latest year remain competing evidence unless all relevant timestamps establish an order. Later or equally dated observations with unknown places are disclosed. This is not a current-location, residence, survival or complete-history claim.

The historical list is chronological, followed by undated records. “Year −1” is treated as unknown; earlier negative years remain valid prehistory. Raw within-year `seconds72` values are used only to compare supported timestamps, never presented as an unverified calendar conversion. Equal timestamps and missing timestamps do not establish sequence. When both site aliases disagree, the event remains visible with an explicit conflict and no chosen location.

## Supported sources

| Record | Subject receiving an observation | Meaning |
|---|---|---|
| `change hf state` | `hfid` | Recorded state at a site/region, or a location gap. |
| `hf died` / `hist figure died` | `hfid` or `victim_hf` | Victim’s recorded death location. The killer does not inherit it. |
| `hf abducted` | `target_hfid` | Abducted figure’s recorded event location. No destination or abductor route is inferred. |
| `artifact created` | `artifact_id` | Creation and recorded creator; a `name_only` event is context, not proof of physical creation/presence. |
| `artifact possessed` | `artifact_id` | A recorded possession event at its explicit location; does not establish continuing custody. |
| `artifact stored`, `artifact lost`, `artifact found` | `artifact_id` | Explicit event location, without inferring later movement. |
| `artifact claim formed` | `artifact_id` | Ownership claim context only; never a location observation, including claims “from afar”. |
| `artifact given` | `artifact_id` | Giver/receiver roles; no physical locations or route implied. |
| Artifact `site_id`, `holder_hfid` | Artifact’s own snapshot | Undated export-time fields, shown separately. A holder’s movements never become the object’s route. |

Locations use explicit `site_id`/`site`, otherwise `subregion_id` or `feature_layer_id`. Only saved sites with validated world-tile coordinates are mapped. Regional and underground references stay linked/unmapped; event coordinate strings, site rectangles, current organisation affiliations, worship, kinship, incidental references and assumed identities do not imply physical presence. Missing referenced records remain labelled and unlinked. Other events (including theft, copies, battles and unsupported specialist schemas) remain available in the general event timeline; they are not silently promoted into journey observations. Individually recorded beasts use the historical-figure rules; creature definitions and unnamed populations have no inferred route.

“Recorded Possession” is kept distinct from a physical-holder snapshot, an ownership claim and a dated location. The source consumer sometimes renders possession events as claims/acquisitions depending on reason, so the app does not derive a definitive ongoing holder or ownership ledger from them.

The inspected schema evidence is the upstream LegendsViewer-Next primary implementation at commit `6045eb08a42d09882cad43c1ef6db37e551cd580`: [ChangeHFState](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/ChangeHFState.cs), [HFDied](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/HFDied.cs), [HFAbducted](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/Events/HFAbducted.cs), and the `ArtifactCreated`, `ArtifactPossessed`, `ArtifactStored`, `ArtifactLost`, `ArtifactFound`, `ArtifactClaimFormed`, and `ArtifactGiven` event classes in that directory. These are verified field-role conventions in that consumer, not universal DF/DFHack version, localisation or mod compatibility claims. No upstream code is bundled. Broader mappings require additional evidence and fixtures.

## Atlas behaviour

**Explore Recorded Appearances on the Map** opens a source-linked list and numbered markers. Repeated appearances on the same tile share a `first-number+` marker; the list and tile readout identify each appearance separately. **Locate Marker** centres the tile and exposes its source links. The same world-tile positions project onto the flat atlas and Raised Relief.

**Show inferred connections** controls dashed straight lines. Lines connect distinct, ordered mapped observations, never actual travelled routes. Missing/unmapped locations break connections. Competing or incompletely timed same-year observations break connections to and from that group. Undated observations have markers where coordinates exist but never a connecting segment. Repeated same-tile observations do not create zero-length segments. Gaps between otherwise ordered records still represent unknown time and travel. There is no estimated distance, speed or travel-time metric.

Settlement/faction filters and conflict-year controls do not filter this separate subject history. Terrain and political colours remain the export-time snapshot. Projection, lines, subject and originating record filters survive atlas URL updates/reloads. Return to the record preserves the originating query. Without terrain, the source-linked list remains available; no terrain or coordinate route is fabricated.

## Bounds and persistence

Profiles scan at most 500,000 events per subject, retain the latest 200 dated events and first 40 undated events in source-ID order, and page 12 at a time. The summary uses the retained sample; if recent context crowds out earlier location records, the app says no dated location evidence is retained. Scan limits explicitly warn that additional/latest evidence may remain unexamined. Map data is bounded by the same sample. Eight derived profiles are cached per loaded archive, cleared on world switch; cancelled scans do not populate the cache. No source data or notes are modified. Existing archives require no reimport or database migration.
