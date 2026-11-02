# AK research tooling (committed so it cannot be lost again)

Phase 2's discovery pipeline originally lived in the sandbox scratch directory
(`/home/user/research/`) and **did not survive a sandbox re-provisioning** — see `../VERIFICATION_LOG.md` §1.
What survives, and what matters for auditing the research, is committed here.

## Scripts

| script | what it does | run |
|---|---|---|
| `verify_atlas.py` | Parses `../REPOSITORY_ATLAS.md`, samples N rows, refetches each repo from `api.github.com`, reports **missing rows** (the fabrication test) and value drift (stars / `pushed_at` / SPDX licence) | `GH_TOKEN=… python3 verify_atlas.py --atlas ../REPOSITORY_ATLAS.md --sample 40` |
| `fetch_repo_cards.py` | For each `owner/repo` (optionally `owner/repo=npm-package`): repo metadata + `README.md` + `package.json` + npm registry latest version/date/licence/deps/peers, printed as one card and optionally dumped to JSON | `GH_TOKEN=… python3 fetch_repo_cards.py protectwise/troika oframe/ogl TanStack/virtual --json /tmp/cards.json` |

Both are stdlib-only, use `GH_TOKEN` when present (unauthenticated = 60 req/h, authenticated = 5,000/h), and never write outside the paths you pass them.

## Last recorded runs

```
$ python3 verify_atlas.py --sample 6
atlas rows parsed: 1914
sampled: 6 | missing (404): 0 | value diffs: 0
OK — every sampled repository exists

$ python3 verify_atlas.py --seed 42 --sample 18     # 2026-11-02 verification pass
atlas rows parsed: 1914
sampled: 18 | missing (404): 0 | value diffs: 6      # all six were parser artefacts / 1–3★ drift / UTC rollover
```

## What is *not* here, and how to rebuild it if AO re-opens discovery

The corpus builders (`discover.py` topic+org+search crawler, `gapfill.py`, `catalog.py` dedupe/scoring,
`deep_eval.py`, `gen_atlas.py`, `gen_demos.py`, `gen_websites.py`) are gone with the scratch directory.
Their contract is documented in `../REPOSITORY_ATLAS.md` §0 (methods, page sizes, pacing, dedupe key,
scoring formula, status ladder `· → ▲ → ◆ → ★`) and in `../GITHUB_RESEARCH_GAPS.md`.
To rebuild: `/search/repositories` at ≤30 req/min with `topic:`, `stars:>`, `pushed:>` query shapes per
category; `/topics/{t}/repositories` and `/orgs/{o}/repos?sort=updated` for curation; key everything by
`full_name`; keep the raw JSONL **inside the pack** this time.
