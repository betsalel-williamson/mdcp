#!/usr/bin/env python3
"""Run Vale with JSON output and print findings grouped by Check."""

from __future__ import annotations

import json
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATHS = [
    "overview",
    "admin-guide",
    "developer-guide",
]
OUTPUT_JSON = ROOT / ".cache" / "vale-report.json"


def run_vale_json() -> dict:
    cmd = ["vale", "--output=JSON", "--minAlertLevel=suggestion", *PATHS]
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    stdout = proc.stdout.strip()
    if not stdout:
        if proc.stderr.strip():
            try:
                err = json.loads(proc.stderr)
                if isinstance(err, dict) and err.get("Code", "").startswith("E"):
                    print(proc.stderr, file=sys.stderr)
                    raise SystemExit(2)
            except json.JSONDecodeError:
                print(proc.stderr, file=sys.stderr)
                raise SystemExit(proc.returncode or 1)
        return {}
    return json.loads(stdout)


def flatten_issues(data: dict | list) -> list[dict]:
    issues: list[dict] = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and "Check" in item:
                issues.append(item)
        return issues
    if not isinstance(data, dict):
        return issues
    for path, entries in data.items():
        if path in ("Line", "Path", "Text", "Code", "Span"):
            continue
        if not isinstance(entries, list):
            continue
        for e in entries:
            if not isinstance(e, dict):
                continue
            issues.append(
                {
                    "Path": path,
                    "Check": e.get("Check") or e.get("check") or "unknown",
                    "Severity": e.get("Severity") or e.get("severity") or "",
                    "Line": e.get("Line") or e.get("line") or 0,
                    "Message": (e.get("Message") or e.get("message") or "")[:120],
                }
            )
    return issues


def main() -> None:
    sync = subprocess.run(["vale", "sync"], cwd=ROOT, capture_output=True, text=True)
    if sync.returncode != 0:
        print(sync.stderr or sync.stdout, file=sys.stderr)
        raise SystemExit(sync.returncode)

    data = run_vale_json()
    issues = flatten_issues(data)

    by_check: dict[str, list[dict]] = defaultdict(list)
    for issue in issues:
        by_check[issue["Check"]].append(issue)

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    report = {
        "total": len(issues),
        "by_check": {
            check: {"count": len(items), "samples": items[:8]}
            for check, items in sorted(by_check.items(), key=lambda x: -len(x[1]))
        },
    }
    OUTPUT_JSON.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(f"Vale report: {len(issues)} finding(s) → {OUTPUT_JSON.name}\n")
    print(f"{'Check':<36} {'Count':>6}")
    print("-" * 44)
    for check, items in sorted(by_check.items(), key=lambda x: -len(x[1])):
        print(f"{check:<36} {len(items):>6}")
        paths: dict[str, int] = defaultdict(int)
        for it in items:
            p = str(it.get("Path") or "?")
            if p.startswith(str(ROOT)):
                p = p[len(str(ROOT)) + 1 :]
            paths[p] += 1
        for path, count in sorted(paths.items(), key=lambda x: -x[1])[:3]:
            print(f"      {count:>3}  {path}")
    print()


if __name__ == "__main__":
    main()
