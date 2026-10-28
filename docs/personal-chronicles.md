# Personal Chronicles

A chronicle is an ordered personal collection from one local world archive. Open **Personal chronicles** in the sidebar or **Personal Chronicles** on a world’s Desk. Begin an empty chronicle, or use **Add to a Personal Chronicle** on any record page to create or extend one while browsing.

## Collect, arrange and read

- Collect figures, places, events, artifacts, written works and other available records. The source record remains unchanged.
- In the editor, add a bookmarked record with a copy of its saved research note, or capture the world’s twelve-record recent reading trail oldest first. Existing entries keep their order; duplicates never replace commentary.
- Use Move Up/Move Down to arrange entries with a keyboard. Remove From Draft takes an entry out of the draft; it does not delete source records or research.
- Add an introduction and per-entry commentary. Event entries capture a deterministic recorded summary when added. That saved summary is labelled separately from personal commentary and is retained if the source archive disappears.
- Choose Save Chronicle to persist changes. Navigation and unload guards protect unsaved edits. Transactional revisions reject stale saves from another tab; a rejected draft can still be exported before reopening. Autosave is not implemented.
- Read Chronicle provides a clean reading layout. Print Chronicle prints that current draft with navigation/editor controls removed. Printed links and the source notice explain their dependence on the local archive.
- Archive Chronicle is reversible and takes effect on Save; Include archived chronicles reveals archived collections in the library. The app does not permanently delete a chronicle through this interface.

Changes to a saved research note do not silently rewrite a copy already collected into a chronicle. A record may appear only once in each chronicle; distinct record families can share the same numeric ID. Each chronicle is bounded to 100 entries, and each source archive to 100 chronicles including archived ones.

## Export and restore

Export Markdown produces a readable ordered account, with escaped imported text, separately labelled recorded summaries/commentary and absolute source links. Export JSON Backup creates a versioned `armoks-chronicle-story` backup containing the current draft, its world association, saved summaries, commentary and archive status. Neither format contains the source XML or terrain. Exports include unsaved changes but do not mark them saved.

Use Restore a Chronicle Backup in the library to validate a JSON file and preview the world association, number of entries and unavailable source records. Restore always creates a new chronicle ID. Existing chronicles are never overwritten. Choose the matching saved archive explicitly, or retain the original unavailable archive association. Names alone cannot establish identity; transfer to another local archive is an explicit choice, with missing references disclosed.

JSON files are limited to 5 MB. Titles, introductions, summaries, commentary, record references and collection sizes are validated. Malformed, incompatible, duplicate-reference or oversized backups are rejected. A chronicle with no available source records is still readable, editable and exportable; missing sources have no fabricated record links. Reimports remain separate datasets until a user explicitly restores a copy into a chosen archive.

## Storage and lifecycle

IndexedDB v3 adds only the `chronicles` store keyed by chronicle ID, with a world index. Existing v1/v2 source stores and annotations are retained. Each save uses a compare-and-swap revision within one write transaction. World identity cannot be silently changed on an existing chronicle; explicit backup restoration creates a new copy instead. Browser connections close on version changes and blocked upgrades explain that other tabs should be closed/reloaded.

Deleting an imported world touches only source world/record/file stores and its disposable reading trail. Personal annotations and chronicles remain. Clearing browser/site data can still remove local work, so keep JSON backups and original exports separately. All data stays in the browser; there is no hosted world sharing, cloud sync or runtime service dependency.

## Verification

Pure tests cover schema validation, reference deduplication, atomic size-bound failure, stable entry order, single-step reordering, archived backup round trips, malformed/oversized backups, escaped Markdown, safe source URLs, commentary/source separation and empty collections. Browser integration verifies v3 storage, persistence, world indexes, stale-save rejection, immutable source association, explicit new-copy transfer, reversible archiving, safe reading, missing links and survival after source-world deletion. Fixture cleanup is exact-ID scoped and never deletes pre-existing personal collections.
