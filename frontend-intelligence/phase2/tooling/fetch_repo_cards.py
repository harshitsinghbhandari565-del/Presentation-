#!/usr/bin/env python3
"""AK research tooling — deep-evaluation fetcher.

For each repository, pull README.md + package.json (+ npm registry metadata) and print a
compact, source-of-truth card: what the project really depends on, its licence as declared
in two places, its activity, and its peer constraints against our React/Next version.

    GH_TOKEN=… python3 fetch_repo_cards.py protectwise/troika oframe/ogl TanStack/virtual dip/cmdk

`--npm-only` skips GitHub (handy when the 5,000/hr core budget is tight).
This is the tool that turned "shortlisted but uninspected" into ◆ inspected rows in
`TOP_35_DEEP_EVALUATIONS.md`. Everything it prints is `[VERIFIED-FILE]` (a file AK read)
or `[VERIFIED-API]`; it never infers.
"""
import argparse, base64, json, os, re, sys, urllib.request

GH = "https://api.github.com"
NPM = "https://registry.npmjs.org"


def headers():
    h = {"User-Agent": "ak-research", "Accept": "application/vnd.github+json"}
    tok = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if tok:
        h["Authorization"] = "Bearer " + tok
    return h


def gh(path):
    with urllib.request.urlopen(urllib.request.Request(GH + path, headers=headers()), timeout=25) as f:
        return json.load(f)


def npm(name):
    with urllib.request.urlopen(urllib.request.Request(NPM + "/" + name, headers={"User-Agent": "ak"}), timeout=25) as f:
        return json.load(f)


def contents(repo, file):
    try:
        c = gh(f"/repos/{repo}/contents/{file}")
        return base64.b64decode(c["content"]).decode("utf8", "ignore")
    except Exception as e:  # noqa: BLE001
        return f"__ERR__ {e}"


def card(repo, npm_pkg=None, readme_chars=460):
    out = {"repo": repo}
    try:
        m = gh("/repos/" + repo)
        out.update(
            stars=m["stargazers_count"],
            pushed=(m.get("pushed_at") or "")[:10],
            gh_license=(m.get("license") or {}).get("spdx_id"),
            archived=m.get("archived"),
            fork=m.get("fork"),
            desc=(m.get("description") or "")[:150],
            homepage=m.get("homepage"),
            topics=(m.get("topics") or [])[:8],
        )
    except Exception as e:  # noqa: BLE001
        out["gh_error"] = str(e)[:80]
        return out
    if not npm_pkg:  # guess from package.json name
        pkg = contents(repo, "package.json")
        if not pkg.startswith("__ERR__"):
            try:
                npm_pkg = json.loads(pkg).get("name")
            except json.JSONDecodeError:
                pass
    pkg = contents(repo, "package.json")
    if not pkg.startswith("__ERR__"):
        try:
            j = json.loads(pkg)
            out["pkg"] = {
                "name": j.get("name"),
                "version": j.get("version"),
                "license": j.get("license"),
                "deps": list((j.get("dependencies") or {}).keys())[:10],
                "peer": j.get("peerDependencies"),
                "exports": list((j.get("exports") or {}).keys())[:10],
            }
        except json.JSONDecodeError as e:
            out["pkg_error"] = str(e)[:60]
    else:
        out["pkg_error"] = pkg[:60]
    readme = contents(repo, "README.md")
    out["readme"] = re.sub(r"\s+", " ", readme)[:readme_chars] if not readme.startswith("__ERR__") else readme[:60]
    if npm_pkg:
        try:
            j = npm(npm_pkg)
            v = j["dist-tags"]["latest"]
            t = j["versions"][v]
            out["npm"] = {
                "package": npm_pkg,
                "latest": v,
                "published": j["time"][v][:10],
                "license": t.get("license"),
                "repository": (t.get("repository") or {}).get("url", "").replace("git+https://github.com/", ""),
                "deps": list((t.get("dependencies") or {}).keys())[:8],
                "peer": t.get("peerDependencies"),
            }
        except Exception as e:  # noqa: BLE001
            out["npm_error"] = str(e)[:70]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("repos", nargs="+")
    ap.add_argument("--json", default="")
    a = ap.parse_args()
    cards = []
    for r in a.repos:
        pkg = None
        if "=" in r:  # repo=npm-package form
            r, pkg = r.split("=", 1)
        c = card(r, pkg)
        cards.append(c)
        print(json.dumps(c, indent=1)[:1800])
        print("-" * 60)
    if a.json:
        json.dump(cards, open(a.json, "w"), indent=1)
        print("wrote", a.json, len(cards), "cards")
    return 0


if __name__ == "__main__":
    sys.exit(main())
