#!/usr/bin/env python3
"""AK research tooling — atlas integrity spot-checker.

Re-validates a random sample of `REPOSITORY_ATLAS.md` rows against the live GitHub API,
so a reader can trust the table without re-crawling 1,914 repositories.

    GH_TOKEN=… python3 verify_atlas.py --sample 18 [--seed 42] [--atlas ../REPOSITORY_ATLAS.md]

Exit code is 0 unless a sampled repository is missing (404) — a missing row means a
fabricated URL, which is the one failure mode this check exists to catch.
Star/date/licence differences are reported for triage, not treated as failures:
stars drift constantly, `pushed_at` rolls over at midnight UTC, and this atlas writes
`NONE ⚠️` where the API returns no SPDX id.
"""
import argparse, json, os, random, re, sys, urllib.request

API = "https://api.github.com"


def headers():
    h = {"User-Agent": "ak-research", "Accept": "application/vnd.github+json"}
    tok = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if tok:
        h["Authorization"] = "Bearer " + tok
    return h


def get(url):
    req = urllib.request.Request(url, headers=headers())
    with urllib.request.urlopen(req, timeout=25) as f:
        return json.load(f)


ROW = re.compile(r"^\| \[`([^`]+)`\]\((https://github\.com/[^)]+)\)")


def parse_rows(path):
    rows = {}
    for line in open(path, encoding="utf8"):
        m = ROW.match(line)
        if m:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            rows[m.group(1)] = {"url": m.group(2), "cells": cells}
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--atlas", default="../REPOSITORY_ATLAS.md")
    ap.add_argument("--sample", type=int, default=18)
    ap.add_argument("--seed", type=int, default=42)
    a = ap.parse_args()

    rows = parse_rows(a.atlas)
    print(f"atlas rows parsed: {len(rows)}")
    random.seed(a.seed)
    picks = random.sample(sorted(rows), min(a.sample, len(rows)))
    missing, flagged = [], []
    for name in picks:
        local = rows[name]
        cells = local["cells"]
        try:
            d = get(f"{API}/repos/{name}")
        except Exception as e:  # noqa: BLE001
            missing.append((name, str(e)[:60]))
            continue
        if not d.get("full_name"):
            missing.append((name, "no full_name"))
            continue
        api = {
            "stars": d["stargazers_count"],
            "pushed": (d.get("pushed_at") or "")[:10],
            "lic": (d.get("license") or {}).get("spdx_id") or "NONE",
        }
        got = {
            "stars": int(cells[1].replace(",", "")) if cells[1].replace(",", "").isdigit() else None,
            "pushed": cells[2],
            "lic": cells[4].replace("⚠️", "").strip().strip("`").strip(),
        }
        diff = []
        if got["stars"] is not None and abs(got["stars"] - api["stars"]) > max(30, api["stars"] * 0.02):
            diff.append(f"stars {got['stars']}→{api['stars']}")
        if got["pushed"] and got["pushed"] != api["pushed"]:
            diff.append(f"pushed {got['pushed']}→{api['pushed']}")
        if got["lic"] and got["lic"] not in (api["lic"], "NONE", "NOASSERTION"):
            diff.append(f"lic {got['lic']}→{api['lic']}")
        if diff:
            flagged.append((name, "; ".join(diff)))

    print(f"sampled: {len(picks)} | missing (404): {len(missing)} | value diffs: {len(flagged)}")
    for n, why in flagged:
        print(f"  DIFF {n}: {why}")
    for n, why in missing:
        print(f"  MISSING {n}: {why}")
    if missing:
        print("FAIL — a catalogued repository does not exist at that URL")
        return 1
    print("OK — every sampled repository exists; value diffs above are drift/parser artefacts, triage by hand")
    return 0


if __name__ == "__main__":
    sys.exit(main())
