# Notion CMS Integration

## Purpose

Use Notion as the editing surface for high-frequency `flora` and `seeds` content while keeping Astro content files as the local publish surface.

## Environment Variables

- `NOTION_TOKEN`
- `NOTION_FLORA_DATA_SOURCE_ID`
- `NOTION_SEEDS_DATA_SOURCE_ID`

## Sync Model

1. Query the configured Notion data sources
2. Fetch page block trees
3. Normalize pages into the CMS adapter boundary
4. Convert supported blocks into markdown
5. Write normalized entries into local Astro content files

## Safety Rules

- Git-owned slug collisions are skipped
- Unsupported sections are rejected
- Draft/unpublished entries are skipped
- Notion is not the public renderer
- Astro remains the final presentation layer

## Supported Content Types

- `flora`
- `seeds`

## Recommended Notion Data Source Schema

Use one data source per section.

### Flora Data Source

Required properties:
- `Title` - `title`
- `Date` - `date`
- `Summary` - `rich_text`

Optional properties:
- `Slug` - `rich_text`
- `Tags` - `multi_select`
- `Highlight` - `checkbox`
- `Published` - `checkbox`

Behavior:
- If `Slug` is empty, the title is slugified
- If `Published` is present and `false`, the entry is skipped
- If `Highlight` is missing, it defaults to `false`

### Seeds Data Source

Required properties:
- `Title` - `title`
- `Date` - `date`
- `Summary` - `rich_text`

Optional properties:
- `Slug` - `rich_text`
- `Tags` - `multi_select`
- `Published` - `checkbox`

Behavior:
- If `Slug` is empty, the title is slugified
- If `Published` is present and `false`, the entry is skipped

## Naming Rules

- Use the property names exactly as listed above for the least-friction path
- `Slug` must be a single path segment
- `Title` should be human-readable; slug normalization happens in the adapter

## Setup Flow

1. Create a Notion integration and copy the token
2. Create one data source for `flora` and one for `seeds`
3. Add the recommended properties
4. Share both data sources with the integration
5. Set:
   - `NOTION_TOKEN`
   - `NOTION_FLORA_DATA_SOURCE_ID`
   - `NOTION_SEEDS_DATA_SOURCE_ID`
6. Run:

```bash
npm run sync:notion
```

## Current Limitation

This integration is intentionally one-way and file-writing only. It does not yet include webhook automation, conflict resolution UI, or runtime rendering directly from Notion.
