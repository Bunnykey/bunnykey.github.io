#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import sys


FORBIDDEN_PREFIXES = [
    ".astro/",
    "dist/",
    "node_modules/",
]


def main() -> int:
    result = subprocess.run(
        ["git", "ls-files"],
        check=True,
        capture_output=True,
        text=True,
    )
    tracked = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    violations: list[str] = []

    for path in tracked:
        for prefix in FORBIDDEN_PREFIXES:
            if path.startswith(prefix):
                violations.append(path)
                break

    if violations:
        print("REPO STATE VERIFICATION FAILED")
        for path in violations:
            print(f"- tracked generated artifact: {path}")
        return 1

    print("REPO STATE VERIFICATION PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
