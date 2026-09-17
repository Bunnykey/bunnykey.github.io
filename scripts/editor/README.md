# Local Editor

Local publishing studio with Tiptap visual editing and a Markdown source mode. Renders with the same Shiki dual theme the production site uses, so the preview matches the deployed page.

## Run

```bash
npm run editor
```

Opens at <http://localhost:4322>. `npm run editor` bundles the visual editor automatically.

For iPhone on a **trusted** home LAN or tailnet, start with `EDITOR_HOST=0.0.0.0 npm run editor` and open your computer's address on port 4322. Keep the computer running. This is a local tool without authentication, not a publicly hosted CMS. Default binding is loopback. `EDITOR_PORT` overrides the port.

## Features

### Visual editor and media
- New posts use Tiptap: bold/italic/headings/tables/images without typing Markdown.
- Markdown toggles source mode. Existing MDX/HTML stays in source mode to preserve custom components.
- Paste a Spotify, YouTube / YouTube Music, or GitHub repository URL, or use **미디어**.
- Spotify and YouTube render players; GitHub renders a linked repository card (no live stars/metadata).
- Media is saved as a fenced `embed` block. The same renderer is used by Preview and Astro.
- **Preview** opens the preview, including on narrow mobile layouts; **계속 쓰기** returns to writing.
- External player availability/playback still depends on the provider, browser and user session.

### Authoring
- Split-pane markdown editor with live preview (250ms debounce)
- Shiki dual theme (`github-light` / `github-dark`) so code blocks match deployed post
- Auto-generated TOC from `h2`/`h3` with smooth scroll on click
- Word count + reading time in the status bar
- Scroll sync between editor and preview
- Drag the center divider to resize panes (persisted to localStorage)
- Dark/light theme toggle (persisted)

### Shortcuts
- `Cmd/Ctrl+S` — save
- `Cmd/Ctrl+B` — bold, `Cmd/Ctrl+I` — italic, `Cmd/Ctrl+K` — link
- `Cmd/Ctrl+Shift+C` — code block
- `Cmd/Ctrl+F` — find & replace
- `Enter` on a list item — continues list (numbered lists auto-increment); Enter on empty list item removes the marker

### Images
- Toolbar button → file picker
- Paste image from clipboard
- Drag-drop onto the editor pane
- All uploads land in `public/img/<timestamp>-<name>.<ext>` and the markdown is inserted at the cursor

### Demos (React components, MDX)
- "+ 데모 삽입" dropdown inserts `<DemoName client:visible />` at cursor
- Auto-adds the `import` line at top of file when needed
- Saves as `.mdx` automatically when inline demo tags are present
- Preview shows a placeholder card (actual component renders on deployed page)

### Post management
- Sidebar lists `flora` / `nursery` / `seeds` posts with draft badges and extension
- Slug uniqueness warning on input
- Tag autocomplete from the union of all existing post tags
- Auto-save snapshot to `localStorage` every 1.5s; offers restore on next load
- Delete button (removes file; does not commit)

### AI autocomplete (optional)
- Toggle "AI" in the toolbar to turn on Copilot-style ghost-text completion
- After a 700ms idle pause, the editor calls Ollama via `/api/complete` and streams the suggestion as grey text
- `Tab` accepts, `Esc` dismisses, any other keystroke restarts the request
- Default model: `qwen3.5:2b` (fast, ~1-2s, decent Korean). Override with `EDITOR_COMPLETION_MODEL=llama3.2:3b-instruct-q4_K_M npm run editor`
- Suggestions overlapping with the existing prefix are auto-trimmed
- Requires a running Ollama with the chosen model pulled

### Git workflow
- Sidebar shows current branch, uncommitted-change count, commits ahead of origin
- "발행" button — requires `main`, removes `draft`, builds Astro, commits the post and referenced images only, then pushes to GitHub. It preserves unrelated staged changes.
  - Safe to re-click; if no diff, the push is a no-op. The UI reports **GitHub 전송 완료** and links to Actions; it does not claim that deployment has finished.

## Endpoints

- `GET  /api/list` — all posts grouped by collection
- `GET  /api/get?collection=&slug=` — single post frontmatter + body + ext
- `GET  /api/demos` — available demo component names from `content/config.ts`
- `GET  /api/tags` — union of tags across all posts
- `GET  /api/check-slug?collection=&slug=` — slug existence check
- `GET  /api/git-status` — branch, dirty files, commits ahead
- `POST /api/render` — markdown → HTML with Shiki (demo tags become placeholders)
- `POST /api/save` — write to `src/content/<c>/<slug>.{md,mdx}`; `.mdx` chosen when inline demo tag detected
- `POST /api/publish` — save with `draft` stripped, then `git add/commit/push`
- `POST /api/delete` — unlink the file
- `POST /api/upload` — multipart image upload into `public/img/`

## Files

- `server.mjs` — Express server
- `public/index.html` — UI shell
- `public/app.js` — vanilla JS client (no build step)
- `public/styles.css` — editor UI + preview prose styles

## Security

No authentication. Only run on trusted networks (home wifi / tailnet). Don't expose the port publicly.

## Verification

`npm test` includes URL allowlisting, rich editor Markdown round trips, and an isolated API integration test: image upload → draft save → preview → real Astro build → Git commit/push to a temporary bare repository → rendered output checks for all three providers. It also checks that unrelated staged changes remain staged. This is not a browser or production deployment test.

Cloud Browser could not reach localhost in the implementation environment (`ERR_BLOCKED_BY_CLIENT`). Desktop browser interaction, iPhone Safari interaction, live provider playback, and the production Pages publish round trip still require verification before calling the complete acceptance flow finished.

## Publishing contract v1

See [publishing-contract.md](../../docs/architecture/publishing-contract.md) for authoritative storage, lifecycle and conflict rules. These supersede the earlier direct-file save/delete endpoint descriptions above.

- Save writes a server working draft under `.publishing/`, never the public source. Back up this directory on the editor host.
- Every saved post has an immutable document ID and opaque revision; stale saves return 409 instead of overwriting another device.
- Category, series and nursery stage are editable under 글 설정. Saved route/collection changes require a future explicit move workflow.
- Device recovery is per document. **최신본 비교** supports explicit manual reconciliation of body and metadata; it rechecks the latest draft and source at save time.
- **초안 버리기** removes only the working draft. It does not unpublish a live article.
- Build failures restore public source and retain the draft. Push failures preserve a retryable draft and identify the failed phase.
- GitHub delivery is not a verified Pages deployment. Publication receipts persist under `.publishing/jobs/`.
