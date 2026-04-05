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
