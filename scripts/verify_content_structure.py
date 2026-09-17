#!/usr/bin/env python3
"""Compatibility entry point: use the same contract as Astro, editor and CMS."""
from pathlib import Path
import subprocess
import sys
if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    sys.exit(subprocess.call(["node", "scripts/verify-content.mjs"], cwd=root))
