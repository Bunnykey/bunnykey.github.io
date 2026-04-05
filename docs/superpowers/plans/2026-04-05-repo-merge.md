# Repo Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the-greenhouse (A) into bunnykey.github.io, bringing B's CI/CD, verification scripts, infra tests, and docs into A's codebase, then deploy.

**Architecture:** A is the base (design system + components complete). B's infrastructure files are copied into A with taxonomy updated from ai/garden/notes → flora/nursery/seeds. Content is cleaned to one article. A is then force-pushed to B's remote.

**Tech Stack:** Astro 5, Tailwind CSS v4, GitHub Actions, Python 3 (verification scripts), Node.js 22

**Spec:** `docs/superpowers/specs/2026-04-05-repo-merge.md`

---

## File Map

| File | Role | Action |
|------|------|--------|
| `.github/workflows/deploy.yml` | CI/CD pipeline | Create (from B) |
| `scripts/deploy.sh` | Manual deploy helper | Create (from B, update paths) |
| `scripts/verify_repo_state.py` | Git state check | Create (from B, no changes) |
| `scripts/verify_content_structure.py` | Frontmatter validation | Create (from B, update taxonomy) |
| `scripts/verify_dist.py` | Build output validation | Create (from B, update routes) |
| `scripts/run_notion_mcp.sh` | Notion MCP launcher | Create (from B) |
| `public/.nojekyll` | GitHub Pages config | Create |
| `public/robots.txt` | Search engine config | Create (from B) |
| `tests/cms-adapter.test.mjs` | CMS adapter tests | Create (from B, update taxonomy) |
| `tests/notion-adapter.test.mjs` | Notion adapter tests | Create (from B, update taxonomy) |
| `tests/notion-client.test.mjs` | Notion client tests | Create (from B, no changes) |
| `tests/deploy-script.test.mjs` | Deploy script test | Create (from B) |
| `docs/architecture/*.md` | Architecture docs | Create (from B) |
| `docs/operations/*.md` | Operations docs | Create (from B) |
| `src/content/flora/*.md` | Content files | Delete all except context-engineering |
| `src/content/nursery/*.md` | Content files | Delete all |
| `src/content/seeds/*.md` | Content files | Delete all |

---

### Task 1: GitHub Pages Static Files

**Files:**
- Create: `public/.nojekyll`
- Create: `public/robots.txt`

- [ ] **Step 1: Create .nojekyll**

```bash
touch /Users/ralph/projects/the-greenhouse/public/.nojekyll
```

This empty file tells GitHub Pages not to process files with Jekyll.

- [ ] **Step 2: Create robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://bunnykey.github.io/sitemap-index.xml
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npx astro build 2>&1 | tail -3`

Expected: Build succeeds. `dist/.nojekyll` and `dist/robots.txt` exist.

- [ ] **Step 4: Commit**

```bash
git add public/.nojekyll public/robots.txt
git commit -m "chore: add GitHub Pages config files (.nojekyll, robots.txt)"
```

---

### Task 2: Content Cleanup

**Files:**
- Delete: All `.md` files in `src/content/flora/` except `context-engineering-token-flow.md`
- Delete: All `.md` files in `src/content/nursery/`
- Delete: All `.md` files in `src/content/seeds/`

- [ ] **Step 1: Delete flora content (keep context-engineering)**

```bash
cd /Users/ralph/projects/the-greenhouse
find src/content/flora -name "*.md" ! -name "context-engineering-token-flow.md" -delete
```

- [ ] **Step 2: Delete nursery and seeds content**

```bash
rm -f src/content/nursery/*.md
rm -f src/content/seeds/*.md
```

- [ ] **Step 3: Create .gitkeep files for empty directories**

```bash
touch src/content/nursery/.gitkeep
touch src/content/seeds/.gitkeep
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/ralph/projects/the-greenhouse && npx astro build 2>&1 | tail -5`

Expected: Build succeeds with fewer pages. Only context-engineering post remains.

- [ ] **Step 5: Commit**

```bash
git add -A src/content/
git commit -m "chore: clean content to single article (context-engineering)"
```

---

### Task 3: CI/CD Pipeline

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow directory and file**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/.github/workflows
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure GitHub Pages
        uses: actions/configure-pages@v5

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Verify Repository State
        run: python3 scripts/verify_repo_state.py

      - name: Verify Content Structure
        run: python3 scripts/verify_content_structure.py

      - name: Run Adapter Tests
        run: npm test

      - name: Build Astro
        run: npm run build

      - name: Verify Dist Output
        run: python3 scripts/verify_dist.py dist

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

---

### Task 4: Verification Scripts

**Files:**
- Create: `scripts/verify_repo_state.py`
- Create: `scripts/verify_content_structure.py`
- Create: `scripts/verify_dist.py`
- Create: `scripts/deploy.sh`
- Create: `scripts/run_notion_mcp.sh`

- [ ] **Step 1: Copy verify_repo_state.py (no changes needed)**

Copy from B as-is — it checks for tracked generated artifacts, no taxonomy references.

```bash
cp /Users/ralph/projects/bunnykey.github.io/scripts/verify_repo_state.py /Users/ralph/projects/the-greenhouse/scripts/verify_repo_state.py
```

- [ ] **Step 2: Create verify_content_structure.py with flora/nursery/seeds taxonomy**

Create `scripts/verify_content_structure.py`:

```python
#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import sys


CONTENT_ROOT = Path("src/content")

RULES = {
    "flora": {
        "required": {"title", "date", "summary"},
        "allowed": {"title", "date", "summary", "highlight", "tags", "series", "demo"},
    },
    "nursery": {
        "required": {"title", "date", "summary"},
        "allowed": {"title", "date", "summary", "stage", "tags", "series"},
    },
    "seeds": {
        "required": {"title", "date", "summary"},
        "allowed": {"title", "date", "summary", "tags", "series"},
    },
}


def parse_frontmatter_keys(path: Path) -> set[str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("missing opening frontmatter delimiter")

    keys: set[str] = set()
    for line in lines[1:]:
        if line.strip() == "---":
            return keys
        if line.startswith((" ", "\t")):
            continue
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key = line.split(":", 1)[0].strip()
        if key:
            keys.add(key)

    raise ValueError("missing closing frontmatter delimiter")


def main() -> int:
    errors: list[str] = []

    for section, rule in RULES.items():
        for path in sorted((CONTENT_ROOT / section).glob("*.md")):
            try:
                keys = parse_frontmatter_keys(path)
            except ValueError as exc:
                errors.append(f"{path}: {exc}")
                continue

            missing = sorted(rule["required"] - keys)
            unexpected = sorted(keys - rule["allowed"])

            if missing:
                errors.append(f"{path}: missing required keys: {', '.join(missing)}")
            if unexpected:
                errors.append(f"{path}: unexpected keys: {', '.join(unexpected)}")

    if errors:
        print("CONTENT STRUCTURE VERIFICATION FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("CONTENT STRUCTURE VERIFICATION PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 3: Create verify_dist.py with A's routes**

Create `scripts/verify_dist.py`:

```python
#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path


PINNED_DIST_FILES = [
    "index.html",
    "flora/index.html",
    "flora/context-engineering-token-flow/index.html",
    "nursery/index.html",
    "seeds/index.html",
    "gardener/index.html",
    "search/index.html",
    "privacy/index.html",
    "404.html",
]

METADATA_EXPECTATIONS = {
    "index.html": [],
    "flora/index.html": [],
    "nursery/index.html": [],
    "seeds/index.html": [],
    "flora/context-engineering-token-flow/index.html": [],
}


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    if len(sys.argv) != 2:
      print("Usage: python3 scripts/verify_dist.py <dist-path>")
      return 2

    dist = Path(sys.argv[1])
    errors: list[str] = []

    require(dist.exists(), f"dist path does not exist: {dist}", errors)
    if errors:
        print("\n".join(errors))
        return 1

    for rel in PINNED_DIST_FILES:
        require((dist / rel).exists(), f"missing built route file: {rel}", errors)

    for rel, expected_snippets in METADATA_EXPECTATIONS.items():
        file_path = dist / rel
        if not file_path.exists():
            continue
        html = read_text(file_path)
        require("<title>" in html, f"{rel}: missing <title>", errors)
        require('meta name="description"' in html, f"{rel}: missing meta description", errors)
        require('rel="canonical"' in html, f"{rel}: missing canonical link", errors)
        require('property="og:title"' in html, f"{rel}: missing og:title", errors)
        require('property="og:description"' in html, f"{rel}: missing og:description", errors)
        for expected in expected_snippets:
            require(expected in html, f"{rel}: missing expected metadata snippet: {expected}", errors)

    if errors:
        print("DIST VERIFICATION FAILED")
        for error in errors:
            print(f"- {error}")
        return 1

    print("DIST VERIFICATION PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 4: Create deploy.sh**

Create `scripts/deploy.sh`:

```bash
#!/bin/bash
set -euo pipefail

EXPECTED_BRANCH="main"

cd "$(git rev-parse --show-toplevel)"

# Safety: verify we're on the expected branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
  echo "❌ Expected branch '$EXPECTED_BRANCH', but on '$CURRENT_BRANCH'. Aborting."
  exit 1
fi

# Safety: check remote divergence
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
BASE=$(git merge-base HEAD origin/main)
if [ "$REMOTE" != "$LOCAL" ] && [ "$REMOTE" != "$BASE" ]; then
  echo "❌ origin/main has diverged. Pull first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "content: $(date +%Y-%m-%d) update"
fi

git push origin main

echo "✅ Pushed to main. GitHub Actions will deploy automatically."
echo "📊 Check: https://github.com/Bunnykey/bunnykey.github.io/actions"
```

```bash
chmod +x /Users/ralph/projects/the-greenhouse/scripts/deploy.sh
```

- [ ] **Step 5: Copy run_notion_mcp.sh from B**

```bash
cp /Users/ralph/projects/bunnykey.github.io/scripts/run_notion_mcp.sh /Users/ralph/projects/the-greenhouse/scripts/run_notion_mcp.sh
```

- [ ] **Step 6: Run verification scripts locally**

```bash
cd /Users/ralph/projects/the-greenhouse
python3 scripts/verify_repo_state.py
python3 scripts/verify_content_structure.py
npx astro build && python3 scripts/verify_dist.py dist
```

Expected: All three pass.

- [ ] **Step 7: Commit**

```bash
git add scripts/verify_repo_state.py scripts/verify_content_structure.py scripts/verify_dist.py scripts/deploy.sh scripts/run_notion_mcp.sh
git commit -m "infra: add verification scripts and deploy helper"
```

---

### Task 5: Infrastructure Tests

**Files:**
- Create: `tests/cms-adapter.test.mjs`
- Create: `tests/notion-adapter.test.mjs`
- Create: `tests/notion-client.test.mjs`
- Create: `tests/deploy-script.test.mjs`

- [ ] **Step 1: Create cms-adapter.test.mjs with flora/seeds taxonomy**

Create `tests/cms-adapter.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeCmsEntry } from '../src/content/cms-adapter.mjs';

test('normalizes a valid flora entry into a stable route shape', () => {
  const result = normalizeCmsEntry({
    sourceId: 'abc',
    section: 'flora',
    slug: 'GPT-5-Launch',
    title: 'GPT-5 Launch',
    date: '2026-03-16',
    summary: 'A summary',
    body: 'Body copy',
    tags: ['OpenAI', 'Launch'],
  });

  assert.equal(result.status, 'ready');
  assert.equal(result.entry.section, 'flora');
  assert.equal(result.entry.slug, 'gpt-5-launch');
  assert.equal(result.entry.canonicalPath, '/flora/gpt-5-launch/');
  assert.deepEqual(result.entry.tags, ['openai', 'launch']);
});

test('rejects unsupported sections', () => {
  assert.throws(
    () =>
      normalizeCmsEntry({
        sourceId: 'abc',
        section: 'garden',
        slug: 'future-item',
        title: 'Future Item',
        date: '2026-03-16',
        summary: 'A summary',
        body: 'Body copy',
      }),
    /unsupported section/i,
  );
});

test('rejects slugs with nested path separators', () => {
  assert.throws(
    () =>
      normalizeCmsEntry({
        sourceId: 'abc',
        section: 'flora',
        slug: 'nested/path',
        title: 'Nested Path',
        date: '2026-03-16',
        summary: 'A summary',
        body: 'Body copy',
      }),
    /single path segment/i,
  );
});

test('skips entries that collide with git-owned slugs', () => {
  const result = normalizeCmsEntry(
    {
      sourceId: 'abc',
      section: 'flora',
      slug: 'context-engineering-token-flow',
      title: 'Context Engineering',
      date: '2026-03-16',
      summary: 'A summary',
      body: 'Body copy',
    },
    {
      gitOwnedSlugs: {
        flora: new Set(['context-engineering-token-flow']),
      },
    },
  );

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'git_slug_conflict',
  });
});

test('skips draft entries before they become publishable', () => {
  const result = normalizeCmsEntry({
    sourceId: 'abc',
    section: 'seeds',
    slug: 'draft-note',
    title: 'Draft Note',
    date: '2026-03-16',
    summary: 'A summary',
    body: 'Body copy',
    draft: true,
  });

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'draft',
  });
});
```

- [ ] **Step 2: Create notion-adapter.test.mjs with flora taxonomy**

Create `tests/notion-adapter.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  blocksToMarkdown,
  normalizeNotionPage,
  slugify,
} from '../src/content/notion-adapter.mjs';

test('slugify normalizes mixed-case titles into single-segment slugs', () => {
  assert.equal(slugify('GPT-5.4 Launch Notes'), 'gpt-54-launch-notes');
});

test('normalizeNotionPage maps common property names into cms entry shape', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'A Notion Entry' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
      Tags: {
        type: 'multi_select',
        multi_select: [{ name: 'AI' }, { name: 'Agents' }],
      },
      Highlight: {
        type: 'checkbox',
        checkbox: true,
      },
    },
  }, 'flora');

  assert.equal(result.status, 'ready');
  assert.equal(result.entry.title, 'A Notion Entry');
  assert.equal(result.entry.slug, 'a-notion-entry');
  assert.equal(result.entry.summary, 'A short summary');
  assert.deepEqual(result.entry.tags, ['ai', 'agents']);
  assert.equal(result.entry.highlight, true);
  assert.equal(result.entry.canonicalPath, '/flora/a-notion-entry/');
});

test('normalizeNotionPage prefers explicit Slug property when present', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'Ignored Title Slug' }],
      },
      Slug: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'custom-slug' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
    },
  }, 'seeds');

  assert.equal(result.entry.slug, 'custom-slug');
  assert.equal(result.entry.canonicalPath, '/seeds/custom-slug/');
});

test('normalizeNotionPage skips unpublished entries', () => {
  const result = normalizeNotionPage({
    id: 'page-1',
    properties: {
      Title: {
        type: 'title',
        title: [{ plain_text: 'Draft' }],
      },
      Date: {
        type: 'date',
        date: { start: '2026-03-16' },
      },
      Summary: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'A short summary' }],
      },
      Published: {
        type: 'checkbox',
        checkbox: false,
      },
    },
  }, 'flora');

  assert.deepEqual(result, {
    status: 'skipped',
    reason: 'unpublished',
  });
});

test('blocksToMarkdown renders supported block types into markdown', () => {
  const markdown = blocksToMarkdown([
    {
      type: 'heading_2',
      heading_2: {
        rich_text: [{ plain_text: 'Heading' }],
      },
      has_children: false,
    },
    {
      type: 'paragraph',
      paragraph: {
        rich_text: [{ plain_text: 'Paragraph body' }],
      },
      has_children: false,
    },
    {
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ plain_text: 'Bullet item' }],
      },
      has_children: false,
    },
    {
      type: 'code',
      code: {
        language: 'javascript',
        rich_text: [{ plain_text: 'console.log("hi")' }],
      },
      has_children: false,
    },
  ]);

  assert.match(markdown, /^## Heading/m);
  assert.match(markdown, /Paragraph body/);
  assert.match(markdown, /^- Bullet item/m);
  assert.match(markdown, /```javascript/);
  assert.match(markdown, /console\.log\("hi"\)/);
});
```

- [ ] **Step 3: Copy notion-client.test.mjs (no taxonomy references)**

```bash
cp /Users/ralph/projects/bunnykey.github.io/tests/notion-client.test.mjs /Users/ralph/projects/the-greenhouse/tests/notion-client.test.mjs
```

This test has no taxonomy references — it tests Notion API client pagination and error handling.

- [ ] **Step 4: Create deploy-script.test.mjs**

Create `tests/deploy-script.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const deployScriptPath = path.join(process.cwd(), 'scripts/deploy.sh');

test('deploy script exists with safety flags and deployment commands', () => {
  const content = fs.readFileSync(deployScriptPath, 'utf8');

  assert.match(content, /^#!\/bin\/bash/m);
  assert.match(content, /set -euo pipefail/);
  assert.match(content, /git add -A/);
  assert.match(content, /git commit -m "content: \$\(date \+%Y-%m-%d\) update"/);
  assert.match(content, /git push origin main/);
  assert.match(content, /GitHub Actions will deploy automatically/);
});
```

- [ ] **Step 5: Run all tests**

Run: `cd /Users/ralph/projects/the-greenhouse && npm test 2>&1`

Expected: All tests pass (existing unit tests + new infra tests).

- [ ] **Step 6: Commit**

```bash
git add tests/cms-adapter.test.mjs tests/notion-adapter.test.mjs tests/notion-client.test.mjs tests/deploy-script.test.mjs
git commit -m "test: add infrastructure tests (CMS adapter, Notion, deploy)"
```

---

### Task 6: Architecture and Operations Docs

**Files:**
- Create: `docs/architecture/cms-adapter-contract.md`
- Create: `docs/architecture/content-ownership.md`
- Create: `docs/architecture/notion-cms.md`
- Create: `docs/operations/deployment.md`

- [ ] **Step 1: Copy docs from B**

```bash
mkdir -p /Users/ralph/projects/the-greenhouse/docs/architecture
mkdir -p /Users/ralph/projects/the-greenhouse/docs/operations
cp /Users/ralph/projects/bunnykey.github.io/docs/architecture/cms-adapter-contract.md /Users/ralph/projects/the-greenhouse/docs/architecture/
cp /Users/ralph/projects/bunnykey.github.io/docs/architecture/content-ownership.md /Users/ralph/projects/the-greenhouse/docs/architecture/
cp /Users/ralph/projects/bunnykey.github.io/docs/architecture/notion-cms.md /Users/ralph/projects/the-greenhouse/docs/architecture/
cp /Users/ralph/projects/bunnykey.github.io/docs/operations/deployment.md /Users/ralph/projects/the-greenhouse/docs/operations/
```

- [ ] **Step 2: Update taxonomy references in docs**

In all copied doc files, replace:
- `ai` section references → `flora`
- `garden` section references → `nursery`
- `notes` section references → `seeds`
- `bunnykey` site name → `The Greenhouse` (where appropriate)
- `stellar-shepherd` → `the-greenhouse`

Use sed or manual edits. The docs are reference material, so broad-stroke replacements are acceptable.

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/ docs/operations/
git commit -m "docs: add architecture and operations documentation"
```

---

### Task 7: Deploy to bunnykey.github.io

- [ ] **Step 1: Full build verification**

```bash
cd /Users/ralph/projects/the-greenhouse
npm run build 2>&1 | tail -5
python3 scripts/verify_dist.py dist
```

Expected: Build succeeds and dist verification passes.

- [ ] **Step 2: Run all tests**

```bash
npm test 2>&1
npx playwright test tests/e2e/atmosphere.spec.ts --reporter=list 2>&1 | tail -15
```

Expected: All unit tests pass. All atmosphere E2E tests pass.

- [ ] **Step 3: Add deploy remote**

```bash
git remote add deploy git@github.com:Bunnykey/bunnykey.github.io.git 2>/dev/null || true
git remote -v
```

Expected: `deploy` remote points to `Bunnykey/bunnykey.github.io`.

- [ ] **Step 4: Force push to deploy remote**

```bash
git push deploy main --force
```

This replaces bunnykey.github.io's content with the-greenhouse codebase. Force push is required because the histories are unrelated.

- [ ] **Step 5: Verify GitHub Actions triggered**

```bash
gh run list --repo Bunnykey/bunnykey.github.io --limit 1
```

Expected: A workflow run is in progress or completed.

- [ ] **Step 6: Verify live site**

Wait for the GitHub Actions deploy to complete, then verify:

```bash
gh run watch --repo Bunnykey/bunnykey.github.io
```

Then open `https://bunnykey.github.io` in browser and verify:
- Site loads with "The Greenhouse" branding
- Dark mode toggle works (D key)
- Atmospheric modes work (S/M/R/N keys)
- Flora section shows context-engineering article
- Nursery and Seeds sections are empty but accessible
- Search page works
- 404 page works

- [ ] **Step 7: Commit deploy remote for future use**

No commit needed — the remote is a local git config. Document it:

```bash
echo "Deploy remote configured: git push deploy main"
```
