# The Intrigue Explorer

The Chronicler’s Desk opens a searchable ledger with three views: **Recorded Plots**, **Intrigue and Justice**, and **Identity Records**. Dossiers link named participants, organisations, artifacts, source records and explicit parent/delegated plots. Figures receive an **Assumed Identities and Intrigue** panel; identity record pages receive a specialist persona dossier. Fixed editorial asides and native mask ornaments provide flavour without generating world history.

Name/participant/ID, event outcome and year filters persist in the route. Source links open the existing provenance inspector and return to the same dossier and filters. Dated-event filters deliberately exclude undated snapshot plots and identity metadata. Missing fields and references remain unknown or unavailable.

## Plot identity and participants

`intrigue_plot` and `intrigue_actor` are nested under a historical figure. Plot keys are **source figure ID + local plot ID**; actor IDs are resolved only against that same figure’s actor list. Zero is a valid local ID. Actor #7 never becomes historical figure #7 merely because the numbers match. Only an actor definition’s explicit `hfid` names its figure. Competing local actor definitions withhold a figure match. Duplicate plot variants flag source disagreement rather than silently merging their fields.

Plot `entity_id` and `artifact_id` links remain explicit source associations. `actor_id`, `plot_actor.actor_id`, `plot_role`, `role` and `strategy` are displayed with their source meanings. A figure whose snapshot contains a plot is not automatically labelled its mastermind. A named participant receives a link to that plot in its own figure panel without being assigned an invented role. An immortality promise remains a recorded promise, not evidence of a power.

Parent/delegated links require both the referenced figure and its local plot ID. Missing targets remain missing. Cycles do not trigger recursive expansion. Agreement, handler and strategy population references are local or separately typed metadata; no historical figure is inferred from them. Handler IDs are shown as local actor references; unsupported agreement/population details remain in the source inspector.

An explicit supported `on_hold` presence marker says **On Hold in the Snapshot**. Its absence does not prove an ongoing plot. The inspected plot schema has no universal completed/succeeded field, so **Outcome Not Recorded** remains the default. Events are never attached to a plot, or used to decide its outcome, simply because they share participants, names, dates, organisations or artifacts.

## Identity records are not biographies

The exported `identities` family contains separately named persona metadata. Figure `current_identity_id` and repeated `used_identity_id` values are source-qualified snapshot links. Current and previously used roles remain distinct; identical source links deduplicate. They do not independently establish a dated adoption, deception or wrongdoing.

An identity’s `histfig_id` is labelled **Figure Named by Identity**. It is not silently substituted for an identity user. `nemesis_id` and `identity_nemesis_id` are not treated as historical figure IDs. Persona race, profession and organisation describe the identity record and never replace the user’s biography.

An `assume identity` event uses the verified `trickster_hfid` / `trickster` fields for the user, `identity_id` for the identity, `target_enid` / `target` for the target organisation, and `identity_histfig_id` for the separately named figure. Conflicting aliases withhold a person/organisation match. If no trickster is recorded, no user is inferred from identity metadata. Optional inline identity names stay literal and source-derived.

## Events and outcomes

| Supported event | What the dossier establishes |
| --- | --- |
| `failed intrigue corruption` | An explicitly failed corruption attempt, with corruptor and target roles kept separate |
| `hfs formed intrigue relationship` | A recorded intrigue relationship; success requires a supported explicit `successful` marker and applies to this relationship event only |
| `assume identity` | A recorded identity assumption, with persona and user references kept separate |
| `hf interrogated` | An interrogation, its named roles and supported resistance/recognition markers; no inferred confession, guilt or release |
| `hf convicted` | A recorded conviction and named judicial roles; explicit wrongful-conviction and punishment fields remain qualified |

A failed judgment test is not a success flag. Missing success is unknown. A corruptor’s target is not automatically declared corrupted. Named lures, contacts, implicated figures, framers, interrogators, plotters and co-conspirator source roles remain distinct. Shared organisation membership never becomes evidence of guilt.

Conviction is a recorded judicial action, not independent proof of the crime. A supported `wrongful_conviction` marker is shown explicitly. A `death_penalty` marker records a sentence; it does not establish an execution or death. Interrogation and resistance do not invent a confession or release. Standard/Plus event disagreements are disclosed and qualify positive success/wrongful outcome badges. Unknown flags and unsupported event types remain inspectable without guessed interpretations.

The general event narrative and reverse-reference index reuse these schema-specific role mappings. Generic names such as `target` and local actor IDs are not globally assigned a new meaning.

## Bounds and compatibility

Indexing is lazy in the existing explorer worker, in phases: identities, figures, events. It is cancellable, cached per world and reset when worlds change. Limits: 500,000 scanned records; 30,000 plots; 50,000 identity records and 50,000 relevant figure contexts; 100,000 selected events; 128 repeated/nested entries per supported source field; 200,000 accepted actor/participant/identity link entries; twelve retained evidence samples per figure/identity group and twelve directory cards per page. Source truncation, group sampling and global limits are disclosed. Examined counts describe the accepted index, not all world history. Figure/identity samples use archive order, not a recency claim.

This remains native JS/HTML/CSS/SVG served from `main`, without a build Action, dependency, database migration or remote processing of world files. Existing archives need no reimport when their stored records contain the relevant fields. Broader DF/DFHack version, translation and mod compatibility remains unqualified. Unsupported intrigue event families, full agreement interpretation and complete historical plot reconstruction remain future work. Fixtures, screenshots and performance exercises use independently authored fictional data only.

## Inspected compatibility evidence

- [DFHack exportlegends.lua](https://github.com/DFHack/scripts/blob/682648a696b8b6f0055e8aa4145c45b175487e01/exportlegends.lua): exported identity metadata and the distinction between historical-figure and nemesis identity tags.
- [HistoricalFigurePropertyParser.cs](https://github.com/Kromtec/LegendsViewer-Next/blob/6045eb08a42d09882cad43c1ef6db37e551cd580/LegendsViewer.Backend/Legends/WorldObjects/HistoricalFigurePropertyParser.cs): nested plot/actor fields and current/used identity IDs.
- `IntriguePlot.cs`, `IntrigueActor.cs`, `PlotActor.cs` and `Identity.cs` under `LegendsViewer.Backend/Legends/Various` in that pinned consumer source.
- `HfsFormedIntrigueRelationship.cs`, `FailedIntrigueCorruption.cs`, `AssumeIdentity.cs`, `HfConvicted.cs` and `HfInterrogated.cs` under `LegendsViewer.Backend/Legends/Events` in the same pinned source.

The Chronicle deliberately avoids the consumer’s substitution of identity-associated or nemesis IDs for a missing trickster, inferred release/guilt, or treating local actor IDs as global figures. These inspected mappings establish the bounded feature contract, not certification of every export version.
