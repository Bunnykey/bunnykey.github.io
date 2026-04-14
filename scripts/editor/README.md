# Local Editor

Dev-only markdown editor for blog posts. Renders with the same Shiki dual theme the production site uses, so the preview matches the deployed page.

## Run

```bash
npm run editor
```

Opens at <http://localhost:4322>. Bound to `127.0.0.1` only — never reachable from the network.

## What it does

- Lists posts across `flora`, `nursery`, `seeds` collections in the sidebar
- Frontmatter form (title/date/summary/tags/draft/demo)
- Markdown editor with live preview (250ms debounce)
- Auto TOC from `h2`/`h3`
- Toolbar inserts: code block, link, table, headings, image upload
- Image upload writes to `public/img/<timestamp>-<name>.<ext>` and inserts the markdown
- Cmd/Ctrl+S to save
- Save writes directly to `src/content/<collection>/<slug>.md`

## Not in v1

- Mobile layout (desktop only)
- Git commit button (run `git` yourself after saving)
- Authentication (loopback only)
- Live render of React demo components in preview (frontmatter `demo:` field is set; the actual component renders on the deployed page)

## Files

- `server.mjs` — Express server with `/api/{list,get,render,save,upload,demos}` endpoints
- `public/index.html` — single-page UI shell
- `public/app.js` — vanilla JS, no build step
- `public/styles.css` — editor + preview prose styles
