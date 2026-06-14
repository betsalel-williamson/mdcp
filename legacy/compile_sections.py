#!/usr/bin/env python3
"""Assemble sharded guide sections with correct heading hierarchy (H1 = guide, H2 = chapter)."""

from __future__ import annotations

import os
import re
from pathlib import Path

HEADING_RE = re.compile(r"^(#{1,6})(\s+)(.*)$")
ABOUT_H1_RE = re.compile(r"^#\s+About this guide\s*$", re.IGNORECASE)


def demote_headings(text: str, levels: int = 1) -> str:
    """Promote depth: # -> ##, ## -> ###, etc."""
    out: list[str] = []
    for line in text.splitlines():
        m = HEADING_RE.match(line)
        if m:
            hashes, space, rest = m.groups()
            depth = min(len(hashes) + levels, 6)
            out.append("#" * depth + space + rest)
        else:
            out.append(line)
    body = "\n".join(out)
    if text.endswith("\n"):
        body += "\n"
    return body


def demote_except_first_h1(text: str) -> str:
    """Keep the first H1; demote all other headings by one level."""
    out: list[str] = []
    kept_first_h1 = False
    for line in text.splitlines():
        m = HEADING_RE.match(line)
        if m and len(m.group(1)) == 1 and not kept_first_h1:
            out.append(line)
            kept_first_h1 = True
        elif m:
            hashes, space, rest = m.groups()
            depth = min(len(hashes) + 1, 6)
            out.append("#" * depth + space + rest)
        else:
            out.append(line)
    body = "\n".join(out)
    if text.endswith("\n"):
        body += "\n"
    return body


def strip_about_this_guide_heading(text: str) -> str:
    """Remove synthetic preamble heading; leave body under the guide H1."""
    lines = text.splitlines()
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and ABOUT_H1_RE.match(lines[i].strip()):
        i += 1
        while i < len(lines) and not lines[i].strip():
            i += 1
    body = "\n".join(lines[i:]).strip()
    return body + "\n\n" if body else ""


def extract_guide_h1(index_text: str) -> str | None:
    for line in index_text.splitlines():
        if line.startswith("# ") and not line.startswith("## "):
            return line.rstrip() + "\n\n"
    return None


def section_files(guide_dir: Path) -> list[str]:
    index = guide_dir / "index.md"
    if not index.exists():
        raise SystemExit(f"No index.md in {guide_dir}")

    text = index.read_text(encoding="utf-8")
    manifest = guide_dir / "sections.txt"
    if manifest.exists():
        return [
            line.strip()
            for line in manifest.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.strip().startswith("#")
        ]

    files: list[str] = []
    for match in re.finditer(r"\]\(\./([^)]+\.md)\)", text):
        name = match.group(1)
        if name not in files:
            files.append(name)
    for match in re.finditer(r"\]\(#([^)]+)\)", text):
        slug = match.group(1)
        if slug in ("table-of-contents",):
            continue
        name = f"{slug}.md"
        if (guide_dir / name).exists() and name not in files:
            files.append(name)
    if not files:
        files = sorted(p.name for p in guide_dir.glob("*.md") if p.name != "index.md")
    return files


def process_section(guide_name: str, filename: str, content: str) -> str:
    if filename == "about-this-guide.md":
        body = strip_about_this_guide_heading(content)
        return demote_headings(body, levels=1) if body.strip() else body

    if guide_name == "overview" and "coverage-and-where-to-look" in filename:
        return demote_except_first_h1(content)

    return demote_headings(content, levels=1)


def assemble_guide(guide_dir: Path) -> str:
    guide_name = guide_dir.name
    index_text = (guide_dir / "index.md").read_text(encoding="utf-8")
    parts: list[str] = []

    h1 = extract_guide_h1(index_text)
    if h1:
        parts.append(h1)

    for name in section_files(guide_dir):
        path = guide_dir / name
        if not path.exists():
            raise SystemExit(f"Missing section file: {path}")
        raw = path.read_text(encoding="utf-8")
        parts.append(process_section(guide_name, name, raw).rstrip() + "\n\n")

    return "".join(parts)


def main() -> None:
    guide_dir = Path(os.environ["GUIDE_DIR"])
    out = Path(os.environ["OUT_FILE"])
    out.write_text(assemble_guide(guide_dir), encoding="utf-8")


if __name__ == "__main__":
    main()
