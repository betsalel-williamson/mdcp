#!/usr/bin/env python3
"""Scan guide shards for {#anchor} IDs and emit anchors.json."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDE_DIRS = ("overview", "admin-guide", "developer-guide")
ANCHOR_RE = re.compile(r"\{#([^}]+)\}")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")
SKIP_NAMES = {"index.md"}
CHAPTER_KEY_RE = re.compile(
    r"^([A-Z]{2,4})\s+Chapter\s+(\d+)",
    re.IGNORECASE,
)


def slugify_title(title: str) -> str:
    t = re.sub(r"\{#.*\}", "", title).strip()
    t = re.sub(r"^\*\*|\*\*$", "", t).strip()
    return t


def scan_file(path: Path) -> list[dict]:
    entries: list[dict] = []
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT).as_posix()
    guide = path.parts[-2] if len(path.parts) > 1 else ""

    for i, line in enumerate(text.splitlines(), start=1):
        hm = HEADING_RE.match(line)
        if not hm:
            continue
        title = slugify_title(hm.group(2))
        anchors = ANCHOR_RE.findall(line)
        if not anchors:
            continue
        for anchor in anchors:
            key = None
            m = CHAPTER_KEY_RE.match(title)
            if m:
                prefix = m.group(1).lower()
                num = m.group(2)
                key = f"{prefix}.ch{num}"
            elif guide and title:
                safe = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48]
                key = f"{guide}.{safe}" if safe else None

            entries.append(
                {
                    "key": key,
                    "anchor": anchor,
                    "title": title,
                    "file": rel,
                    "line": i,
                    "level": len(hm.group(1)),
                }
            )
    return entries


def build_registry() -> dict:
    by_anchor: dict[str, dict] = {}
    by_key: dict[str, str] = {}
    all_entries: list[dict] = []

    for dirname in GUIDE_DIRS:
        guide_dir = ROOT / dirname
        if not guide_dir.is_dir():
            continue
        for path in sorted(guide_dir.glob("*.md")):
            if path.name in SKIP_NAMES:
                continue
            for entry in scan_file(path):
                all_entries.append(entry)
                anchor = entry["anchor"]
                if anchor not in by_anchor:
                    by_anchor[anchor] = {
                        "anchor": anchor,
                        "title": entry["title"],
                        "file": entry["file"],
                    }
                key = entry.get("key")
                if key and key not in by_key:
                    by_key[key] = anchor

    return {
        "generated_from": "legacy/scripts/generate-anchor-registry.py",
        "keys": by_key,
        "anchors": by_anchor,
        "entries": all_entries,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit 1 if anchors.json would change",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=ROOT / ".cache" / "anchors.json",
    )
    args = parser.parse_args()

    registry = build_registry()
    out = json.dumps(registry, indent=2, ensure_ascii=False) + "\n"

    if args.check:
        if not args.output.exists():
            print(f"Missing {args.output}; run generator without --check")
            raise SystemExit(1)
        if args.output.read_text(encoding="utf-8") != out:
            print("anchors.json is stale; run: python3 scripts/generate-anchor-registry.py")
            raise SystemExit(1)
        print("anchors.json is up to date")
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(out, encoding="utf-8")
    print(f"Wrote {args.output} ({len(registry['anchors'])} anchors)")


if __name__ == "__main__":
    main()
