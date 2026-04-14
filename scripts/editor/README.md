# Local Editor

Dev-only markdown editor for blog posts. Renders with the same Shiki dual theme the production site uses, so the preview matches the deployed page.

## Run

```bash
npm run editor
```

Opens at <http://localhost:4322> (loopback) and, when Tailscale is installed and running, at the MagicDNS hostname of the machine too. The server binds `0.0.0.0`, so anyone on the same LAN / tailnet can reach it — treat it accordingly.

## Features

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
- "발행" button — writes with `draft: false`, `git add`, `git commit`, `git push origin HEAD`
  - Safe to re-click; if no diff, the push is a no-op

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
