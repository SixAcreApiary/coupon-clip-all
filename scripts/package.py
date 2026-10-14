#!/usr/bin/env python3
"""Build dist/coupon-clip-all-v<version>.zip containing only the extension files.

Usage: scripts/package.py [tag]
If a tag (e.g. v1.0.4) is given, it must match the manifest version.
Prints the path of the created zip.
"""
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INCLUDE = ["manifest.json", "src", "README.md", "LICENSE"]
FOLDER = "coupon-clip-all"


def main(argv):
    version = json.loads((ROOT / "manifest.json").read_text())["version"]
    tag = argv[1] if len(argv) > 1 else ""
    if tag and tag.removeprefix("v") != version:
        sys.exit(f"Tag {tag} does not match manifest version {version}")

    files = []
    for name in INCLUDE:
        path = ROOT / name
        files.extend(sorted(p for p in path.rglob("*") if p.is_file()) if path.is_dir() else [path])

    bad = [p for p in files if any(part.startswith("_") for part in p.relative_to(ROOT).parts)]
    if bad:
        sys.exit(f"Chrome rejects files starting with '_': {bad}")

    out = ROOT / "dist" / f"{FOLDER}-v{version}.zip"
    out.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in files:
            zf.write(p, f"{FOLDER}/{p.relative_to(ROOT).as_posix()}")
    print(out.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main(sys.argv)
