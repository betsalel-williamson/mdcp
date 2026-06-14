#!/usr/bin/env python3
"""Write sections.txt for each guide dir from index.md link order."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def section_order(guide_dir: Path) -> list[str]:
    index = (guide_dir / "index.md").read_text(encoding="utf-8")
    files: list[str] = []
    for match in re.finditer(r"\]\(\./([^)]+\.md)\)", index):
        name = match.group(1)
        if name not in files:
            files.append(name)
    for match in re.finditer(r"\]\(#([^)]+)\)", index):
        slug = match.group(1)
        if slug in ("table-of-contents",):
            continue
        name = f"{slug}.md"
        if (guide_dir / name).exists() and name not in files:
            files.append(name)
    if not files:
        files = sorted(p.name for p in guide_dir.glob("*.md") if p.name != "index.md")
    return files


def main() -> None:
    for name in sys.argv[1:] or ("overview", "admin-guide", "developer-guide"):
        guide_dir = ROOT / name
        if not guide_dir.is_dir():
            continue
        files = section_order(guide_dir)
        (guide_dir / "sections.txt").write_text("\n".join(files) + "\n", encoding="utf-8")
        print(f"{name}: {len(files)} sections")


if __name__ == "__main__":
    main()
