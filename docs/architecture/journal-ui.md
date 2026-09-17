# Journal UI — representative article

The home page features Clearance Sale. Other source posts and existing URLs are preserved; this change does not archive or delete them.

- `/nursery/clearance-sale/`: Korean reading layout, original article body and photograph.
- `public/design/reading.css`: shared typography and reading tokens, served by Astro and the editor. Fonts are self-hosted; no external font CDN is required.
- `scripts/editor/client/shell.jsx`: Radix Themes components rendered at build time. The shell deliberately has no React hydration: the existing controller owns input state and Tiptap owns its document. Buttons and text fields use Themes; selects and modal dialogs remain native HTML. Add interactive Radix components with a deliberate state bridge, not a second owner of the editor DOM.
- `scripts/editor/build.mjs`: regenerates the committed editor HTML and ignored JS/CSS bundles. Edit shell.jsx, not generated index.html.

## Run

```sh
npm ci
npm run dev
# in another terminal
npm run editor
```

Read: `http://localhost:4321/nursery/clearance-sale/`
Edit: `http://localhost:4322/?collection=nursery&slug=clearance-sale`

The editor listens on loopback by default. Do not expose the publishing API publicly. Save creates a working draft; Publish runs the existing build/commit/push flow and requires working Git credentials.

## Verification

Astro build and 48 automated tests passed, including an isolated Git remote publication test covering upload, three embed providers, preview, build, push, rollback and conflict handling. Controller integration uses jsdom, not a real browser.

Cloud Browser returned ERR_BLOCKED_BY_CLIENT for the local editor. Desktop layout inspection, physical iPhone/Safari input and iframe playback remain unverified. Nothing has been deployed to GitHub Pages by this change. Remaining posts still use the previous site layout; this is the representative-page implementation.
