#!/usr/bin/env bash
# Rebuild guides.md from sharded guide directories.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CLIENT="$(cd "$ROOT/.." && pwd)"
OUTPUT="$CLIENT/guides.md"
ORDER_FILE="$ROOT/compile-order.txt"
BUILD="$ROOT/.compile-build"

rm -rf "$BUILD"
mkdir -p "$BUILD"

concat_guide() {
  local name="$1"
  local dir="$ROOT/$name"
  local out="$BUILD/${name}.md"

  if [[ ! -d "$dir" ]]; then
    echo "Missing guide directory: $dir" >&2
    exit 1
  fi

  echo "  → $name"
  GUIDE_DIR="$dir" OUT_FILE="$out" python3 "$ROOT/compile_sections.py"
}

BANNER='<!-- AUTO-GENERATED — edit shards, then run: ./legacy/compile.sh -->

'

echo "Compiling guides.md"
: >"$BUILD/combined.md"

while IFS= read -r guide || [[ -n "${guide:-}" ]]; do
  guide="${guide%%#*}"
  guide="${guide// /}"
  [[ -z "$guide" ]] && continue
  concat_guide "$guide"
  cat "$BUILD/${guide}.md" >>"$BUILD/combined.md"
  printf '\n' >>"$BUILD/combined.md"
done <"$ORDER_FILE"

printf '%s' "$BANNER" >"$OUTPUT"
cat "$BUILD/combined.md" >>"$OUTPUT"

rm -rf "$BUILD"
echo "→ $OUTPUT ($(wc -l <"$OUTPUT") lines)"
