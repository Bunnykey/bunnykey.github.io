#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/Users/ralph/projects/bunnykey.github.io"
ENV_FILE="$PROJECT_DIR/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

token="$(grep '^NOTION_TOKEN=' "$ENV_FILE" | head -n1 | cut -d= -f2-)"

if [[ -z "${token:-}" ]]; then
  echo "NOTION_TOKEN is missing in $ENV_FILE" >&2
  exit 1
fi

export OPENAPI_MCP_HEADERS
OPENAPI_MCP_HEADERS="$(node -e 'process.stdout.write(JSON.stringify({Authorization:`Bearer ${process.argv[1]}`, "Notion-Version":"2025-09-03"}))' "$token")"

exec npx -y @notionhq/notion-mcp-server
