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
