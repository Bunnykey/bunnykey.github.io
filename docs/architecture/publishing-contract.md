# Publishing contract v1

Status: implemented in the working branch. No production migration or deployment performed.

## Scope and authority

Git content files are the public source; Astro remains the public renderer. One running editor host owns the working draft store. Desktop and iPhone connect to that same host. This does not provide offline multi-device synchronization, collaborative cursors, public authentication, or hosting.

| Dimension | Meaning | Rule |
|---|---|---|
| collection | Writing format / existing route namespace | `seeds`: short records, `flora`: essays, `nursery`: evolving projects |
| category | Subject | Exactly one of life, food, music, travel, tech, notes; absent legacy values default to notes |
| tags | Optional discovery labels | Trimmed, lowercase, deduplicated; no replacement for category |
| series | Ordered reading sequence | Optional `{name, title, order}`; URL-safe name, nonempty title, positive integer order |
| stage | Project maturity | nursery only: seed, growing, evergreen |
| highlight | Featured selection | true only for flora |
| demo | Existing interactive component | Allowlisted for the collection |

Existing collections, URLs and articles are retained. No mass reclassification. Metadata fields outside the core schema survive editor saves; known fields are validated. Empty optional fields can be explicitly cleared.

## Identity and version

- `id`: immutable `post_…` identifier, independent of title and route. Newly authored drafts receive a random ID. Existing files without IDs receive a deterministic ID derived from their current route; the ID is persisted on first publication. CMS IDs derive from the external source ID.
- `contractVersion: 1`: stored on newly saved/published documents. Legacy files without it remain readable.
- `revision`: opaque SHA-256 version of source bytes, or the complete draft envelope. This is a compare-and-swap token, not a human version number or timestamp. It changes on body/metadata/source-base changes, and stays stable for identical saves.
- Every mutation carries `document: {id, revision, collection, slug}`. New creation requires explicit `revision: null`; update requires the exact revision previously read. Missing version returns 428; stale versions, collisions and identity mismatches return 409.
- Existing route changes are rejected. A future explicit move operation must preserve ID and create redirects. Direct filesystem renames are outside the editor contract, especially before a legacy ID has been persisted.
- Build verification checks both Markdown and MDX, duplicate routes/IDs, metadata and routes with the same contract used by the editor/CMS.

## Storage and state

| Layer | Location | What it proves |
|---|---|---|
| Device backup | localStorage, keyed by document ID | Unsaved input on this browser only |
| Saved working draft | `.publishing/drafts/<id>.json` | Server-side saved draft, readable from another device on this host |
| Public source | `src/content/<collection>/<slug>.md[x]` | Version selected for publication; Git preserves history |
| Publication receipt | `.publishing/jobs/<id>.json` | Last attempted publication state and revision/commit when available |

`.publishing/` is ignored by Git. Back it up on the editor host; cloning the repository on another machine does not copy working drafts. A localStorage snapshot is not server storage and is not automatically transferred between devices.

Saving always writes a working draft and does not change public source files. Publishing promotes that specific draft, builds Astro and commits only that post and referenced images. This keeps an unrelated post's saved changes out of another publication.

Publication receipt states:

| State | Evidence / next action |
|---|---|
| idle | No publication receipt on this host; not proof that an existing source is unpublished |
| building | Candidate source is being verified by the Astro build |
| committed | A local commit SHA exists; delivery to GitHub is not confirmed |
| pushed | Git push succeeded; Pages deployment and live rendering remain unverified |
| failed | Failed phase plus error; draft retained for correction/retry |

A successful API response explicitly returns `deploymentVerified: false`. `deployed` requires a successful Pages deployment associated with the same commit plus public rendering checks; that observer belongs to the subsequent E2E/deployment work, and is not simulated here. Receipts identify the last publication attempt, not necessarily a later edited draft.

## Conflict and recovery rules

1. Open on device A and device B: both receive the same revision.
2. A saves: B's old revision is rejected. B's text stays in the editor/device backup.
3. **최신본 비교** shows server metadata/body, and the public source too if externally changed.
4. The author closes the comparison to edit/merge body and metadata, then explicitly saves the current input as the merge result.
5. Reconciliation checks both the compared draft revision and public-source revision again. A change during review causes another 409; no last-write-wins fallback.

All cooperating writers use `.publishing-lock` and fail with 423 while another write/publish/import runs. Draft replacements use temporary files and atomic rename. Direct Git commands or external file editors do not participate in that lock; close the editor while performing repository maintenance.

A caught build failure restores the prior public source (including MD↔MDX conversion) and keeps the working draft. A push failure keeps the committed source, updates the draft's base revision and allows retry without silently losing work. Errors return the caller's updated document token when its own save already succeeded.

A process kill/power loss is not a caught failure: a stale lock, candidate source and a `building`/`committed` receipt can remain. Recovery requires checking the lock owner, source diff and Git history before removing a stale lock or resuming publication. This version does not claim automatic crash recovery or a transaction across Git and Pages.

**초안 버리기** removes only the server working draft with a matching version; it never removes an already published URL. Unpublish/archive/redirect workflows are separate future operations.

## Notion adapter

Notion is an import-only source in v1. Imported files become Git-owned. Re-import never overwrites a source, existing draft, MDX route or matching document ID. It uses the same slug normalization, metadata validator and serializer. Category is read from the Notion `Category` select property. Korean slug letters are preserved and normalized to NFC. The importer validates/filters ownership before downloading blocks; imported image filenames include a content hash so changed bytes do not overwrite a published image.

Notion's Published flag selects import candidates; it does not mean this editor has verified a Pages deployment. Bidirectional sync is not enabled.

## Validation

`npm test` covers the shared contract, serializer, stale device writes, missing versions, source isolation, route/ID collisions, locking, explicit reconciliation, real Astro MD/MDX builds, isolated Git push, build rollback and push-failure retry. `npm run build` also runs the content-contract gate. These are API/unit/build checks, not Desktop/iPhone browser E2E.
