# AC's deterministic V1 search ordering — independent review (AK → AO)

**Reviewed object:** `arena/c9d0d599-presentation` @ **`c5c6ce3ca65113680be614c20ff2c12be95b0954`**
("fix: make ranked search pagination deterministic"), parent **`2b46c60d8945a6a10a9f05be49994b32d5939343`**
("review: reject search v2 after local validation"), 14 files, +294 / −2, `2026-11-03T00:36:59Z`.
**Reviewer:** AK, branch `arena/9d055deb-presentation` @ `4d7c56c` before this review.
**Question asked:** is this safe to accept for *eventual* hosted-migration approval?

**Labels.** `[VERIFIED-AK]` = reproduced by AK in this sandbox on AK's own install. `[VERIFIED-SHARED]` = the same
artefact inspected by both sides. `[REPORTED-AC]` = AC's claim, not reproduced here. `[UNAVAILABLE]` = could not run
here — never reported as passing. `[INFERRED]` = reasoned, not measured.

> ## Verdict: **ACCEPT**
>
> The change is correct, minimal, provably a total order, cheap, regression-tested in a way that **fails the old SQL
> and passes the new** (I reproduced both), and documented including its own limits. I found no defect in it.
>
> Three conditions attach to **hosted application**, not to this commit, and AO holds all three gates:
> **(A1)** one `EXPLAIN (ANALYZE, BUFFERS)` against the real hosted table before applying;
> **(A2)** an explicit decision on the **non-RPC paths**, which still end in a non-unique key (§9) — the RPC now
> promises a total order and the fallback and the rails do not;
> **(A3)** optional: if a speedup is wanted, §8's measured lever (narrow the intermediates, −27…−38 % with
> byte-identical output) supersedes the window-removal idea that AC correctly rejected.

---

## 1. Branch, commit, parent, remote and tree integrity `[VERIFIED-AK]`

| Check | How | Result |
|---|---|---|
| Target is the branch tip | `git ls-remote origin` | `arena/c9d0d599-presentation` → `c5c6ce3ca651…` ✅ (AO's stated target, full sha matched) |
| Parent | `api.github.com/…/commits/c5c6ce3` | `2b46c60d8945…` ✅ as stated |
| Parent's own parent | `api.github.com/…/commits/2b46c60` | `3ffd555fc8b0…` ✅ — the chain is `681800f → 3ffd555 → 2b46c60 → c5c6ce3`, exactly as AC's `SEARCH_V2_VALIDATION.md` describes |
| File scope | commit payload `files[]` | 14 files = 13 modified + 1 added, +294/−2 ✅ matches AC's "Files changed" list exactly |
| Tree integrity | `github.com/…/archive/<sha>.tar.gz` → `/home/user/scratch2/t2` and `/p2`, `diff -rq p2 t2` | 14 differing paths, **nothing extra, nothing missing** ✅ |
| `main` | `git ls-remote` | `4307a688452…` unchanged ✅ nothing merged |
| AC's other branch | `git ls-remote` | `AC-Branch` `cac9c7f` unchanged ✅ |
| AK branch | `git ls-remote` | `arena/9d055deb-presentation` `4d7c56c` — read-only for AC; AK wrote only under `frontend-intelligence/` |
| Sandbox re-provision | `git status` at session start showed the pack untracked | restored via `git fetch` + `git reset --hard 4d7c56c`; `git log -1` and the pack file count verified before any work |

**The diff contains no application code at all** — no `src/**`, no `package.json`, no `package-lock.json`, no
`next.config.ts`, no `tsconfig.json`, no seed, no applied migration, no `.env*`. The only executable artefacts are
the migration (5 lines, §2), the DB test (+70) and `scripts/evaluate-search-ordering.mjs` (+96). AC's sentence
"no dependency manifests/lockfiles changed" is true by construction here.

## 2. The migration diff — UUID ascending is the final key, after everything `[VERIFIED-AK]`

```sql
-        f.title asc
+        f.title asc,
+        -- UUID primary keys complete the order when every visible sort key ties.
+        -- Keep this inside row_number so pagination and aggregation use it too.
+        f.id asc
```
plus one extension of the `comment on function` string ("… A/B/C/D ranking **and a final ascending document UUID
tie-break** …"). Nothing else: `begin`/`commit`, `language sql stable security invoker set search_path=''`, the
candidate-UNION structure, the A/B/C/D weights, the re-filter, the
`limit greatest(1, least(coalesce(page_size,12),48)) offset greatest(0, coalesce(page_offset,0))` clamp and the
revoke/grant pair are all untouched (I diffed the whole file, not just the hunk).

**Ordering contract, as implemented** (all four modes, each ending in `f.id asc`):

| mode | effective order |
|---|---|
| non-blank relevance (also `sort_option` NULL/unknown) | `ts_rank` DESC → `title` ASC → `id` ASC |
| blank relevance | `is_featured` DESC → `title` ASC → `id` ASC |
| `title` | `title` ASC → `id` ASC |
| `newest` | `created_at` DESC NULLS LAST → `title` ASC → `id` ASC |

**Why this is a proof, not only a measurement:** `public.documents.id` is `uuid primary key default
gen_random_uuid()` in the **already-applied** `202611010001_catalog.sql:41` `[VERIFIED-AK]` — non-null and unique —
so each key list above is a **total order** on any fixed visible set. AC's own caveat ("no immutable-id constraint
exists, so identity stability assumes no out-of-band ID mutation") is the only escape hatch, it is honestly stated,
and it applies equally to the alternative key (`slug` is unique but equally mutable) `[INFERRED]`.

## 3. Pagination, window and aggregation use one ordering expression `[VERIFIED-AK]`

`rn` comes from `row_number() over (order by <the table above>)`; `ordered` then does `order by rn limit … offset …`;
the payload is `jsonb_agg(… order by o.rn)`. All three consumers derive from the **same** window — there is no
duplicated key list that could drift. That is the stronger property AO asked about ("exactly consistent"), and AC's
in-code comment says why the key must live *inside* the window.

Two structural facts I confirmed rather than assumed: the aggregate's explicit `order by o.rn` is load-bearing
(dropping it would rely on subquery-order propagation), and `filtered` is referenced twice (`count(*)` for `total`,
plus the `weighted` input path) but executed **once** — the plan shows one materialised CTE and two `CTE Scan` nodes
(§8), which closes the question I left open in the previous review.

## 4. The independent oracle and the regression tests — do they really detect the defect? `[VERIFIED-AK]`

**Yes — and I proved it by running AC's new test against the old SQL.** In my working install I swapped in
`2b46c60`'s migration while keeping `c5c6ce3`'s test file:

```
not ok 10 - duplicate keys use UUID as the final order across complete, repeated and deep pages
    relevance/tieprobe: offset 0
# tests 10   # pass 9   # fail 1     ← only the new test fails; the other 9 are unaffected
```
Restoring the target migration: **27/27 pass** ✅. AC's claim "against the old migration … the new test failed as
expected on the relevance page at offset 0" reproduces exactly, down to the failure location.

Why the test is a detector and not decoration (all verified by reading, plus the run above):

* 144 rows share title **and** rank **and** timestamp, and the test asserts `Set(ranks).size === 1` — an
  **anti-vacuity guard**: it fails if the tie set isn't actually tied.
* ids are inserted in **descending** order, so physical/scan order ≠ required order — it cannot pass by luck.
* Expected order comes from a **separately written, unpaginated, window-free full scan**, not from the RPC.
* It checks repeat-equality, every adjacent page, offset 132, empty offset 150, duplicate-free concatenation, and
  that relevance/title/newest/blank-featured precedence is *not* displaced by the new key (the 6 body-only rows).
* `sort_option => null` and `=> 'unknown'` are compared against `'relevance'` through a named-argument call — the
  NULL-vs-default trap I raised last round is covered.
* Cleanup is in `finally` (delete by slug), so the shared fixture database stays clean for the other 26 tests.

**AC's scale harness, run by me** (`node scripts/evaluate-search-ordering.mjs`): **28/28** reconstructed cases +
**20/20** extras matched its independent full-set / totals / ordered-pages oracle; `filler` = **84 pages of 48
concatenated with 0 duplicates**; `Equal` = 80 rows over 7 pages exact; anon and authenticated both hide the draft and
are denied direct writes (`42501`); timings and plans printed. Every gate agrees with AC's recorded outcome; my
wall-clock medians ran 5–10 % higher than AC's on the same script (graviton 318.9 vs 294.8 ms, filler 455.3 vs
415.6 ms) — machine variance, and AC's doc already states these are local medians, not hosted latency.
One nuance worth recording: their harness compares the **post-re-filter** set against the oracle, which is the right
completeness test (any candidate loss surfaces as a set difference, and a leak would too), and it is labelled
"reconstructed", not "AK's inputs" — accurate.

## 5. My own independent probes (not AC's harness) `[VERIFIED-AK]`

Own corpus (4,016 published / 4,018 rows: 4,000 synthetic of which **400 share title+rank+timestamp** and 80 share a
second title; ids deliberately descending; 16 fixtures; 1 draft), own oracle (`setweight` A/B/C/D assembled from the
applied schema, full facet predicate, no candidate CTE, no window, no limit).

| Probe | Outcome |
|---|---|
| 36 cases: `total` **and** ordered page vs oracle (mixed taxonomy+document, `"1"` 1,341 / `"10"` 4,006 / `"481"`, `Sem 1`, `Class 10` vs `Class 1`, `Worksheet`, `Google Drive`, phrase, OR, `graviton -title`, `-title`, blank, whitespace-only, injection-shaped, unbalanced quote, 300-char, `it's`, zero-match, all three sorts, facet combos, wrong-subject → empty) | **36/36 exact** — candidate completeness survives the ordering change, with no extra rows either |
| Tie contract, 400-row exact-tie set | page 1 == the ascending-`id` prefix; full walks at size 12 × 34 pages and size 48 × 9 pages, **each run twice** → concatenation identical to the total order, 0 duplicates, `total` stable on every page |
| Adjacency | last id of page *k* < first id of page *k+1*; page content exact at offsets 12 and 24 |
| Precedence not overridden | `newest` keeps `created_at` desc; `title` keeps title asc with `id` only inside exact-title ties; blank browse keeps the featured block first; `akzephyr` title-match rows stay ahead of body-only matches that have smaller ids |
| 4,000-row result, **all 84 pages of 48**, twice | 4,000 rows, 84 pages, **0 duplicates, exact-order yes** on both passes |
| Deep / tail / beyond | offset 3,990 → exact 10-row tail; offset 99,999 → empty page with true `total` |
| Clamps | `page_size` 0→1, −5→1, 9999→48, **null→12**, 49→48; `page_offset` −5→0, null→0 |
| Draft / RLS / integrity | draft invisible to a query matching its title exactly; anon sees 4,016 published; anon and authenticated both denied direct writes `42501`; `documents` row count unchanged after every probe |
| Variant order-equivalence (§8) | 7 shapes × 2 variants — byte-identical id sequences and `total`s |

**Two observations that are *not* defects but belong on the record:**

1. **`btrim` strips spaces only.** A query of `"\t "` is *not* treated as blank browse — it becomes a search term
   matching nothing. RPC and my oracle agree, so behaviour is consistent, and the app is immune because both
   `parseFilters` and `searchCatalog` `trim()` before SQL (`src/lib/search.ts:88`, `src/lib/catalog.ts:208`)
   `[VERIFIED-AK]`. A direct RPC caller could hit it; worth a one-line doc note, not a code change.
2. **My control could not make the *old* SQL misbehave on my data — and that is informative.** The pre-fix order
   matched ascending-`id` on my corpus under every planner setting I tried (`default`, `enable_hashagg=off`,
   `enable_sort=off`, both off, `enable_seqscan=off`), because the candidate `UNION` executes as
   `Merge Append → Unique`, which happens to emit ids sorted, and the downstream sorts preserve that order for ties.
   AC's fixture takes the other path and *does* fail. So pre-fix behaviour was **accidentally** stable, not
   guaranteed — exactly what the fix replaces with a contract. Recorded so nobody later reads "I couldn't reproduce
   it locally" as "it was fine before" `[VERIFIED-AK]`.

## 6. The rejected v2 has not entered the implementation `[VERIFIED-AK]`

`grep -c materialized` on the shipped migration = **0**; `row_number() over` is present; the only hunk in the file is
the `f.id asc` addition (§2). The `sc_nowin` / `sc_mat` / `sc_narrow` shapes exist **only** in my probe files and, for
v2, in AC's separate clearly-labelled validation script. Nothing in `src/**`, no test and no migration references
them. AC's two commits are also explicit about *why* v2 was rejected: its reconstruction failed an exact-order gate
and the speedup did not reproduce (their table: graviton −4.8 %, filler +7.4 %, deep +1.9 %, overlapping ranges).
**On the merits, §8 shows AC's rejection was right and my earlier recommendation was mis-attributed.**

## 7. Candidate completeness, totals, facets, draft exclusion, RLS, paging bounds

Covered twice over: by my §5 table (36/36 oracle cases, clamps, roles, per-page `total` stability across 84 pages,
draft invisibility, table intact) and independently by AC's harness running clean on my machine. Both agree:
**no candidate loss, no extra rows, no over-fetch beyond the 48 clamp, no privilege leakage.** The ordering change
disturbed none of it — which was the main regression risk of editing a window's `ORDER BY`.

## 8. Performance baseline — sequential scan vs GIN eligibility vs actual index use `[VERIFIED-AK]`

`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on my corpus (4,016 published rows, analysed):

| predicate | natural plan | with `enable_seqscan=off` |
|---|---|---|
| `search_vector @@ 'filler' AND publication_status='published'` | **Seq Scan**, 5.36 ms | Bitmap Heap Scan → **btree `documents_public_course_idx`**, 3.13 ms |
| `… @@ 'kw7' AND published` | Seq Scan, 1.16 ms | Bitmap Heap Scan → btree `documents_public_course_idx`, 1.36 ms |
| `… @@ 'kw7'` **without** the publication filter | Seq Scan, 1.02 ms | **GIN `documents_search_idx`**, 2.07 ms |

→ Exactly the distinction AC documents: the GIN is demonstrably **eligible** only for a *simplified* predicate; the
real predicate at this size is served by a sequential scan or an unrelated btree; and none of that establishes a
hosted plan or a speedup. AC's refusal to claim hosted latency is warranted, and their "eligibility only" wording
matches my own plans.

**Cost of the determinism change itself** — controlled A/B, same session, same data, alternating, median of 5–7:

| shape | target (with `f.id asc`) | parent (without) | Δ |
|---|--:|--:|--:|
| `filler` /48 (4,000 matches) | 418.5 ms | 412.5 ms | **+1.4 %** |
| 400 exact ties /48 | 105.1 ms | 99.6 ms | +5.5 % |
| `filler` deep page (offset 1,980) | 395.5 ms | 393.9 ms | +0.4 % |
| selective `kw7` (45 matches) | 61.1 ms | 61.5 ms | −0.6 % |
| blank browse /48 (4,016) | 293.5 ms | 290.5 ms | +1.0 % |

The full-body plan with literal inputs is **node-for-node identical** between target and parent
(`… → Limit → Sort → WindowAgg → Sort → CTE Scan → …`, one materialised `filtered` CTE, two `CTE Scan`s), 208.3 ms
vs 214.7 ms instrumented. **For AO: the total order costs ~0–5 % and no plan change — accept it without performance
reservation.**

**The disputed optimisation, re-measured properly.** Window removal alone is not the lever: `sc_nowin` (same key
list, no window) measured −3.6 % / −2.1 % / **+4.4 %** on the shipped payload and within ±3 % on a 3-key payload —
noise. What *is* the lever: `weighted` → `filtered` → `ordered` carry all ~26 columns **including a `tsvector`**
through the window and the aggregate for every candidate, though only 12–48 rows are ever returned. Narrowing the
intermediates to `(id, title, created_at, is_featured, rank)`, ranking on that, and joining back for the page — a
variant I built by splicing AC's own CTE text — measured:

| shape | shipped V1 | rank-narrow-then-fetch-wide | Δ | output check |
|---|--:|--:|--:|---|
| `filler` /48 (4,000) | 420.6 ms | 277.8 ms | **−34.0 %** | order identical, first row **byte-equal** |
| 400 exact ties /48 | 96.2 ms | 85.3 ms | −11.3 % | identical, byte-equal |
| `filler` deep (offset 1,980) | 401.8 ms | 289.1 ms | −28.0 % | identical, byte-equal |
| `newest` page 2 | 391.8 ms | 284.4 ms | −27.4 % | identical, byte-equal |
| `title` page 2 | 385.5 ms | 280.7 ms | −27.2 % | identical, byte-equal |
| blank browse /48 | 301.6 ms | 187.5 ms | **−37.8 %** | identical, byte-equal |
| selective `kw7` | 62.1 ms | 60.0 ms | −3.4 % | identical, byte-equal |
| full 400-tie single page | — | — | — | sequences identical |

This is the gate AC's v2 reconstruction could not pass — **it preserves the exact total order**, which is only
possible *because* `id` is now a unique final key. It is **not** in AC's tree; it is a single-machine PGlite
measurement on one corpus; offered only as AO's **(A3)** option. AC's rejection as written stands.

## 9. Fallback and non-RPC browse paths — unchanged, and the consequences `[VERIFIED-AK]`

`src/**` is untouched by this commit, so the JS/PostgREST ordering paths still end in non-unique keys:

| site | order | consequence |
|---|---|---|
| `src/lib/catalog.ts:186–189` — browse **and** missing-RPC fallback | `created_at desc, title` / `title` / `is_featured desc, title` | `.range(from, from+PAGE_SIZE-1)` over a **non-total** order ⇒ adjacent pages can duplicate or drop tied rows whenever titles (or `created_at`+titles) collide. **The library's default browse page is in this group**, because the RPC is only used when `filters.q` is non-empty |
| `src/lib/catalog.ts:232–234` | `is_featured desc, title limit 3` and `created_at desc limit 3` | the landing featured/recent rails can **change membership** between requests when titles tie or a bulk seed shares timestamps (no offset involved, so no gaps — a reshuffling rail) |
| `src/lib/catalog.ts:252` | `is_featured desc, title limit 12` | same, for "related resources" selection |
| `src/lib/search.ts:63–65, 78–82` — compatibility mode | every comparator ends `a.title.localeCompare(b.title)` | JS `Array#sort` is stable and the compat input is a static module ⇒ **deterministic in compatibility/fixture mode**. The instability lives in the live PostgREST paths, not the JS one |
| `src/lib/catalog.ts:76` | `.order("id")` | the 500-row compatibility snapshot fetch **is** deterministic — a precedent for the one-line fix |
| `src/proxy.ts` | matcher `/admin/:path*` only | the proxy neither caches nor rewrites `/library`, so it neither masks nor worsens any of the above |

**Stated plainly:** the product now has *two* ordering regimes — a total order for hosted ranked search, and
unspecified tie order for blank browse, the disclosed missing-RPC fallback, and the three rails. A user who searches
gets stable pages; the same user clearing the search box gets pages that stay stable only while no two rows tie on
the remaining keys. AC documents exactly this ("Fallback and non-RPC browse remain unchanged and are not guaranteed
total-order"), so it is a **known, disclosed limitation, not a hidden one** — but it is cheap to close and AO may
prefer consistency: append `.order("id")` to the six PostgREST chains and `|| a.id.localeCompare(b.id)` to the two
comparators (≈8 one-line edits, no migration, no hosted change; the only behaviour change is that ties stop being
arbitrary). Recommend doing it **with** the migration approval, not as a condition on this commit.

## 10. Concurrency / offset-pagination documentation `[VERIFIED-AK]`

Accurate and, unusually, self-critical. `SEARCH_V2_VALIDATION.md` scopes the promise honestly: a total order **for a
fixed database snapshot** with fixed filters, sort, collation and permissions; then it enumerates what can still move
— edits, inserts, deletes, changed RLS visibility or permissions, out-of-band `id` mutation, collation-version
changes, "separate RPC snapshots" — with the explicit sentence **"Offset pagination does not provide a cross-request
snapshot under concurrent writes."** `KNOWN_ISSUES.md` repeats it in the risk list, and `DECISIONS.md` records that
the change "intentionally specifies formerly arbitrary tied-row order … it does not provide cross-request snapshot
consistency or change fallback behavior".

My own check of the mechanism: each RPC call is one statement, so a page is internally consistent (the stable `total`
across 84 pages and the identical repeat walks are the empirical side of that), but two calls are two snapshots — no
cursor, no keyset. Keyset pagination is the real remedy and is correctly left out of scope, since it would change the
`?page=` contract. **No overclaim found.** One forward note rather than a defect: a keyset/`search_after` design
becomes *possible* now that `id` is a unique tail — worth a line in the next design pass.

## 11. Handovers and known-issue records vs actual Git state `[VERIFIED-SHARED]`

Every Git statement I could check is true: starting parent `2b46c60…`, that commit's own parent `3ffd555…`, "clean;
fetched origin matched", AK tip `4d7c56c…` read via `git show`, "no dependency manifests/lockfiles changed", "no
hosted migration/deployment/merge", and the deliberate refusal to pre-embed its own hash ("`git rev-parse HEAD` after
committing"). The same facts are mirrored consistently across `AC_HANDOVER.md`, `AO_HANDOVER.md`, `PROJECT_CONTEXT.md`,
`IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DEVELOPMENT_GUIDE.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`,
`FRONTEND_CORRECTIONS.md`, `FRONTEND_ACCEPTANCE_CHECKLIST.md` and `SEARCH_V2_VALIDATION.md` — I diffed all of them
against the parent; no contradiction between the documents and none with the code.

**Reproduced by me:** lint 0, `tsc` 0, `next build` exit 0, **47/47 unit**, **27/27 DB** (was 26 — the +1 is exactly
the new tie test), `npm audit --omit=dev` **0**, "old SQL fails / new passes" (§4), the 28+20+84-page harness (§4),
the plan/eligibility wording (§8), the 12/48/1 clamp behaviour (§5).
**Reported, not reproducible here `[REPORTED-AC]`:** the serial production-Chromium result (**23 passed, 1 dev-only
skipped**) — see §12 — and everything about real GPU behaviour.
One wording nit, no action needed: `npm run check` is `lint && typecheck && test && build` and does **not** include
`test:db`, so "check passed (… 27 DB …)" means the DB suite ran separately, as it did in my log too. The numbers are
right; only the grouping is loose.

## 12. Not verified in this sandbox `[UNAVAILABLE]` — stated as such

1. **Chromium E2E.** `playwright@1.64.1` resolves in AC's install; there are **no browser binaries**
   (`~/.cache/ms-playwright` absent; no `chrome`/`headless_shell` on the image) and the download CDN is outside this
   sandbox's network allowlist. Reproduce with `npx playwright install chromium` then
   `PLAYWRIGHT_SOFTWARE_GL=1 npx playwright test`. AC additionally discloses that the software-GL helper rewrites
   `failIfMajorPerformanceCaveat`, and that a *first* E2E run came out `22 passed, 1 failed` (a 5 s command-search
   timeout) before a clean one-worker rerun. Documenting the flake rather than erasing it is the right call.
2. **Strict slow-WebGL refusal.** AC's unmodified-canvas probe on Chromium 153 returned a context for **both**
   `true` and `false`, and neither when GPU and software rasteriser were both disabled → no reproducible refusal
   condition in that harness, so `UNVERIFIED` is the honest label and **no fake refusal test was added**. I have no
   browser, so I cannot improve on it; it stays open for a real-device pass.
3. **Hosted Supabase.** Not contacted by me, not modified by AC. The migration remains **unapplied** — its own first
   line still reads "REVIEW REQUIRED: NOT APPLIED TO HOSTED SUPABASE" `[VERIFIED-AK]`.
4. **Full `npm audit` including dev dependencies** — not run; AC reports "20 moderate development-toolchain
   advisories, no dependency changes" in the v2-rejection commit.
5. Real GPU / thermals / Safari / Firefox / screen readers / Lighthouse / 1:1 visual review — out of reach here.
   Nothing in this diff touches the visual layer, so it adds no new risk in that category.

## 13. Corrections to AK's own prior review (recorded, not replaced)

* **C23 — my "−30 % by materialising `filtered` and dropping the `row_number()` window" recommendation was
  mis-attributed; AC's rejection of v2 stands.** Re-measured against the shipped 25-key payload, window removal is
  worth −3.6 % / −2.1 % / **+4.4 %** (noise), and materialisation is similarly mixed. My earlier number came from a
  variant that *also* narrowed the intermediate tuple — tuple width is the mechanism, not the window. The correct
  measured statement is §8's rank-narrow-then-fetch-wide table (−27…−38 %, byte-identical output). AC could not
  reproduce my figure because my figure described a different change than my sentence claimed.
* **C24 — "no divergence observed" is not evidence of determinism.** My control corpus returned parent == target
  order under five planner settings (§5.2) because the `UNION`'s `Merge Append → Unique` sorted ids incidentally. My
  instinct ("Postgres guarantees nothing here") was right; my *method* for checking it was not. A detector must force
  the other plan shape — which is what AC's descending-id fixture does, and why their test fails on the old SQL.
* **C25 — process fix on AK's side.** My scratch probes lived in `/home/user/scratch` and were lost when the sandbox
  was re-provisioned, so AC had to *reconstruct* my v2 from prose and I had to rebuild my oracle. My harness is now
  committed at `phase2/tooling/verify-search-ordering.mjs`; AC's note "AK's exact scratch cases/SQL remain
  unavailable" was accurate, not a complaint.

## 14. What AO should do with this

| # | Action | Owner | Blocks what? |
|---|---|---|---|
| 1 | **Accept `c5c6ce3`** as the deterministic-V1 correction; no code change requested | AO | — |
| 2 | **(A1)** Before any hosted application: one `EXPLAIN (ANALYZE, BUFFERS)` at real table size — and note that a sequential scan at small N is *expected*, so a local plan must not be the acceptance test | AO + AC | blocks *application*, not acceptance |
| 3 | **(A2)** Decide the non-RPC tie question: append `.order("id")` to the six PostgREST chains and the id tie-break to the two JS comparators (≈8 one-line edits, no migration) — or accept a documented two-regime product | AO → AC | recommend "do it" |
| 4 | **(A3)** Optionally take the rank-narrow-then-fetch-wide restructure (§8, −27…−38 %, byte-identical) into the *unapplied* migration; it is order-equivalent by construction now that `id` is unique | AO → AC | no |
| 5 | Keep the slow-WebGL refusal item open for a real-device pass; do not add a synthetic "refusal" test | AC → PO | no |
| 6 | Re-run `phase2/tooling/verify-search-ordering.mjs` after any further migration edit — cheapest total-order + completeness gate available | AC | no |

**Bottom line:** deterministic, tested in a way that actually fails without the fix, documented without
overclaiming, and ~free to run. **Accept.** The open decisions are about *applying* the migration and about the
non-RPC paths — not about this commit.

---
*AK modified nothing on AC's branch, no hosted resource, no application code, dependency, env, Auth or deployment
setting. All probes ran in in-memory PGlite against local copies of the target and parent trees; the `documents`
table was verified intact after every probe.*
