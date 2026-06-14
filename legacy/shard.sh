#!/usr/bin/env bash
# Split guides.md into per-guide directories (md-tree workflow).
# Uses: npx @kayvan/markdown-tree-parser explode
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CLIENT="$(cd "$ROOT/.." && pwd)"
SOURCE="$CLIENT/guides.md"
MDTREE=(npx --yes @kayvan/markdown-tree-parser)

if [[ ! -f "$SOURCE" ]]; then
  echo "Missing source: $SOURCE" >&2
  exit 1
fi

WORK="$ROOT/.shard-work"
rm -rf "$WORK"
mkdir -p "$WORK"

echo "→ Extracting top-level sections from guides.md"
"${MDTREE[@]}" extract-all "$SOURCE" 1 --output "$WORK/h1"

WORK="$WORK" python3 <<'PY'
import os
import re
from pathlib import Path

work = Path(os.environ["WORK"])
h1 = work / "h1"


def promote_preamble_to_h2(text: str) -> str:
    lines = text.splitlines(keepends=True)
    h1_idx = next((i for i, l in enumerate(lines) if l.startswith("# ") and not l.startswith("## ")), None)
    if h1_idx is None:
        return text
    h2_idx = next(
        (i for i, l in enumerate(lines[h1_idx + 1 :], h1_idx + 1) if l.startswith("## ") and not l.startswith("### ")),
        None,
    )
    if h2_idx is None:
        return text
    preamble = "".join(lines[h1_idx + 1 : h2_idx]).strip()
    if not preamble or preamble.lstrip().startswith("## "):
        return text
    out = lines[: h1_idx + 1]
    if out[-1] != "\n":
        out.append("\n")
    out.append("## About this guide\n\n")
    out.extend(lines[h1_idx + 1 : h2_idx])
    if not out[-1].endswith("\n"):
        out.append("\n")
    out.append("\n")
    out.extend(lines[h2_idx:])
    return "".join(out)


def demote_h1_to_h2(text: str) -> str:
  return re.sub(r"^# ", "## ", text, count=1, flags=re.MULTILINE)


# Overview = first H1 section + second H1 section (coverage router)
extracted = sorted(h1.glob("*.md"))
preface = extracted[0].read_text(encoding="utf-8")
coverage = demote_h1_to_h2(extracted[1].read_text(encoding="utf-8"))
overview_src = preface.rstrip() + "\n\n" + coverage.lstrip()
overview_src = promote_preamble_to_h2(overview_src)
(work / "overview.source.md").write_text(overview_src, encoding="utf-8")

guides = {
    "admin-guide": extracted[2].name,
    "developer-guide": extracted[3].name,
}

for dest, src_name in guides.items():
    src = h1 / src_name
    if not src.exists():
        raise SystemExit(f"Missing H1 extract: {src}")
    (work / f"{dest}.source.md").write_text(promote_preamble_to_h2(src.read_text(encoding="utf-8")), encoding="utf-8")

print("Prepared source files in .shard-work/")
PY

explode_guide() {
  local name="$1"
  local src="$WORK/${name}.source.md"
  local dest="$ROOT/${name}"
  rm -rf "$dest"
  mkdir -p "$dest"
  echo "→ Exploding $name"
  "${MDTREE[@]}" explode "$src" "$dest"
  python3 "$ROOT/write-sections-manifest.py" "$name"
}

explode_guide overview
explode_guide admin-guide
explode_guide developer-guide

# Compile order for full guides.md
cat > "$ROOT/compile-order.txt" <<EOF
overview
admin-guide
developer-guide
EOF

rm -rf "$WORK"
echo ""
echo "Done. Edit sections under guide directories, then rebuild guides.md with compile.sh"
