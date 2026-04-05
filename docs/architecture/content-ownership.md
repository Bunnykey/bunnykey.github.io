# Content Ownership

## Phase 1 Rule

Phase 1 production content is Git-owned. Astro is the only public presentation layer.

## Ownership Matrix

| Route / Content Type | Phase 1 Source | Future Source | Slug Owner | Template Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | Git | Astro route path | Astro layout | Core brand page |
| `/about/` | `src/pages/about.astro` | Git | Astro route path | Astro layout | Core trust page |
| `/flora/` | `src/pages/flora/index.astro` | Git + future CMS-fed list | Astro route path | Astro layout | Index may aggregate later |
| `/flora/[slug]/` | `src/content/flora/*.md` | Future CMS candidate | Astro content entry slug derived from file path | Astro detail template | Git wins on slug conflicts |
| `/nursery/` | `src/pages/nursery/index.astro` | Git | Astro route path | Astro layout | Curated section index |
| `/nursery/[slug]/` | `src/content/nursery/*.md` | Git by default | Astro content entry slug derived from file path | Astro detail template | No live CMS in phase 1 |
| `/seeds/` | `src/pages/seeds/index.astro` | Git + future CMS-fed list | Astro route path | Astro layout | Future CMS candidate |
| `/seeds/[slug]/` | `src/content/seeds/*.md` | Future CMS candidate | Astro content entry slug derived from file path | Astro detail template | Git remains authoritative |

## Conflict Rules

- Git-owned routes and content always win during phase 1.
- A future CMS entry may not replace a Git-owned slug without a later migration decision.
- Astro templates remain the only public renderer even after future CMS integration.
