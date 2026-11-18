# Deployment Runbook

Astro builds the site to `dist/`. The [GitHub Actions deployment workflow](../../.github/workflows/deploy.yml) publishes that artifact to GitHub Pages from `main`. The public URL is <https://bunnykey.github.io/>.

## Before merging

```bash
npm ci
npm test
npm run build
python3 scripts/verify_dist.py dist
```

In repository settings, confirm Pages uses GitHub Actions. With GitHub CLI access, you can check the same setting with `gh api repos/Bunnykey/bunnykey.github.io/pages --jq .build_type`. The expected value is `workflow`.

## After deploying

Confirm the workflow succeeded for the intended commit. Open the homepage and follow the links to an article, search, about, music and the workspace. From the workspace, confirm the writing, preview, listening studio and demo entry points. Check that `/rss.xml`, `/favicon.svg` and `/og-default.png` load. Inspect an article's share metadata and open its `og:image` URL.

## Rollback

Revert the affected change on `main` and let the same workflow publish the restored build.
