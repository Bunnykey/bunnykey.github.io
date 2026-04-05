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
