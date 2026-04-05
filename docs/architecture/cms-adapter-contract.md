# Future CMS Adapter Contract

## Goal

Define the normalized shape for future CMS-managed content without introducing a live CMS integration in phase 1.

## Required Fields

- `sourceId`
- `section`
- `slug`
- `title`
- `date`
- `summary`
- `body`
- `canonicalPath`

## Optional Fields

- `tags`
- `highlight`
- `updatedAt`
- `draft`

## Validation Rules

- `slug` must be lowercase and a single path segment
- `slug` must be unique within a section
- missing required fields exclude the entry from publishable output
- invalid dates exclude the entry from publishable output
- unsupported sections exclude the entry from publishable output

## Ownership Rules

- Git-owned slugs always win over future CMS-imported slugs
- Astro remains the only public presentation layer
- CMS is an editing source, not a public renderer

## Fallback Rules

- In phase 1, no live CMS data is fetched
- Future CMS failures must never block Git-owned pages from building
- If a future CMS fetch fails, the site must continue rendering the Git-owned surface without route ownership changes
