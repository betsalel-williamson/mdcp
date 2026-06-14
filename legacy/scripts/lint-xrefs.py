#!/usr/bin/env python3
"""Flag bare Ch. N / Chapter N references not inside markdown links."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = ("overview", "admin-guide", "developer-guide")
SKIP_FILES = {
    "index.md",
}
SKIP_PREFIXES = ("table-of-contents",)
LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
CH_REF_RE = re.compile(
    r"\b(?:Ch\.?\s*\d+(?:\s*[–—-]\s*[^|.\n]+)?|Chapter\s+\d+(?:\s*[–—-]\s*[^|.\n]+)?)\b",
    re.IGNORECASE,
)
SEE_CHAPTER_RE = re.compile(r"\bSee\s+Chapter\s+\d+\b", re.IGNORECASE)
# "See …" must use a markdown link on the same line (See [text](url)).
SEE_CAPITAL_UNLINKED_RE = re.compile(r"\bSee\s+(?!your\s)(?!\[)\w")
SEE_LOWERCASE_UNLINKED_RE = re.compile(r"(?<=[(,])\s*see\s+(?!\[)\w")


def strip_links(line: str) -> str:
    return LINK_RE.sub("", line)


def should_skip(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return True
    if any(path.name.startswith(p) for p in SKIP_PREFIXES):
        return True
    return False


def lint_file(path: Path) -> list[str]:
    issues: list[str] = []
    rel = path.relative_to(ROOT)
    in_fence = False
    for num, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not stripped:
            continue
        if stripped.startswith("#") and "{#" in line:
            continue
        plain = strip_links(line)
        for m in CH_REF_RE.finditer(plain):
            issues.append(f"{rel}:{num}: bare cross-ref: {m.group(0)!r}")
        for m in SEE_CHAPTER_RE.finditer(plain):
            if not LINK_RE.search(line):
                issues.append(f"{rel}:{num}: unlinked: {m.group(0)!r}")
        if "| See |" in line:
            continue
        if re.search(r"\b[Ss]ee\s+\[", line):
            continue
        if SEE_CAPITAL_UNLINKED_RE.search(line) or SEE_LOWERCASE_UNLINKED_RE.search(
            line
        ):
            issues.append(f"{rel}:{num}: unlinked See … (add markdown link)")
    return issues


def main() -> int:
    all_issues: list[str] = []
    for dirname in SCAN_DIRS:
        d = ROOT / dirname
        if not d.is_dir():
            continue
        for path in sorted(d.glob("*.md")):
            if should_skip(path):
                continue
            all_issues.extend(lint_file(path))

    # WRITING-GUIDE documents patterns — skip intentional examples in tables
    wg = ROOT / "WRITING-GUIDE.md"
    if wg.exists():
        for num, line in enumerate(wg.read_text(encoding="utf-8").splitlines(), start=1):
            if "Wrong:" in line or "| Avoid |" in line:
                continue
            plain = strip_links(line)
            if CH_REF_RE.search(plain) and "bare cross-ref" not in line:
                if "Ch. 5" in plain and "Wrong" not in line and "`" not in line:
                    pass  # appendix uses linked examples only

    if all_issues:
        print("Cross-reference lint failed:\n")
        for issue in all_issues:
            print(f"  {issue}")
        print(f"\n{len(all_issues)} issue(s). See WRITING-GUIDE.md")
        return 1

    print("Cross-reference lint passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
