# Deployment Runbook

## Authoritative Model

- Framework: Astro
- Public URL: `https://the-greenhouse.github.io`
- Authoritative production branch: `main`
- Deployment model: GitHub Actions workflow in [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
- Deployment target: GitHub Pages
- Expected Pages state during phase 1:
  - `build_type=workflow`
  - branch authority is `main`
  - public output comes from Astro `dist/`

## Pre-Deploy Checks

Before changing any GitHub Pages settings or merging production-impacting changes:

1. Confirm local branch state:

```bash
git status --short --branch
```

2. Build the Astro site:

```bash
npm run build
```

3. Check current GitHub Pages state:

```bash
gh api repos/the-greenhouse/the-greenhouse.github.io/pages
```

4. Confirm the deploy workflow still targets `main`:

```bash
rg -n "branches: \\[main\\]" .github/workflows/deploy.yml
```

## Cutover Steps

Phase-1 cutover is the alignment of GitHub Pages metadata and workflow reality.

1. Keep the existing workflow-based deploy path.
2. Do not introduce a second deployment method.
3. Update GitHub Pages settings only after local build and workflow verification are green.
4. Align the Pages branch metadata with `main` while preserving `build_type=workflow`.

Reference command:

```bash
gh api -X PUT repos/the-greenhouse/the-greenhouse.github.io/pages \
  -F build_type=workflow \
  -F source[branch]=main \
  -F source[path]=/
```

## Post-Deploy Verification

After a production deploy or Pages configuration change:

1. Confirm Pages state:

```bash
gh api repos/the-greenhouse/the-greenhouse.github.io/pages
```

2. Run public smoke checks:

```bash
python3 scripts/verify_public_site.py https://the-greenhouse.github.io
```

3. Confirm the pinned routes still respond:
- `/`
- `/about/`
- `/flora/`
- `/flora/perplexity-computer/`
- `/nursery/`
- `/nursery/hello-world/`
- `/seeds/`
- `/seeds/hello-note/`

4. Confirm the public site still exposes:
- valid page titles
- route-level descriptions
- expected canonical URLs on stabilized pages

## Rollback

Rollback policy for phase 1 is intentionally conservative.

1. If verification fails before any Pages settings change:
   do not cut over

2. If a bad deploy reaches production:
   redeploy the last known-good commit on `main` through the same GitHub Actions workflow

3. Do not add or switch to a second deployment path during rollback.

4. Re-check Pages state after rollback:

```bash
gh api repos/the-greenhouse/the-greenhouse.github.io/pages
```

## No-Cutover Rule

If any of the following fail, stop and keep the current public configuration unchanged:

- Astro build fails
- deploy workflow does not clearly target `main`
- Pages API state cannot be confirmed
- public smoke checks fail
- route inventory is not intact after deployment
