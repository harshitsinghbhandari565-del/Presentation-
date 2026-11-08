# Current update — catalog ordering + hosted-plan preparation (2026-11-03)

AO accepted the deterministic V1 correction and rejected v2; rank-narrow-then-fetch-wide is deferred. The V1 migration is byte-identical to `c5c6ce3` and unapplied. Live PostgREST and JS catalog document orders now append stable IDs without changing preceding priorities; live related-score ties preserve server candidate precedence. Existing `get_catalog_facets` RPC option-name ties remain a separate hosted schema limitation. Full current scope, tests and caveats: `CATALOG_ORDERING_REVIEW.md`.

**MEASURED-AC:** 28 reconstructed and 20 extra cases matched full ID sets/totals/ordered pages, 4,000-row walk over 84 pages exact/no duplicates; 53 unit/28 DB, lint/typecheck/build passed. Actual hosted SQL plan remains **UNVERIFIED**; exact approval-bound preparation: `docs/HOSTED_SEARCH_PLAN_REVIEW.md` and `docs/hosted-search-plan-review.sql` (locally tested without installing RPC). Slow-GL genuine refusal remains unverified.

---

# Deterministic V1 ordering follow-up — 2026-11-03 (current)

**Implemented locally; awaiting AO review.** The historical rejected-v2 evaluation below remains evidence, not an approval of v2. The local, still-unapplied V1 migration now completes its existing window order with `f.id ASC`, preserving all earlier precedence, pagination and JSON aggregation by `rn`. No v2 optimizer, schema/table change, hosted application, deployment or merge.

## Contract and nondeterminism

For a fixed database snapshot, filters, query, sort, collation and permissions:

| Mode | Total order |
| --- | --- |
| Nonblank relevance (also NULL/unknown sort) | `ts_rank` DESC, `title` ASC, document UUID ASC |
| Blank relevance (also NULL/unknown sort) | `is_featured` DESC, `title` ASC, UUID ASC |
| Title | `title` ASC, UUID ASC |
| Newest | `created_at` DESC NULLS LAST, `title` ASC, UUID ASC |

`public.documents.id` is a non-null UUID primary key with `gen_random_uuid()` default; application edits do not set it. UUID order is a unique deterministic final key without displacing rank, title, date or featured priority. This deliberately specifies the previously unspecified tied-row order, so pages can change for ties; it does not promise parity with the former arbitrary order. Database grants allow authorized UPDATE generally and no immutable-id constraint exists, so identity stability assumes no out-of-band ID mutation; none was added.

Previously equal rank/title, equal featured/title, equal created_at/title, or equal titles in title mode had no final key; text collation may treat distinct strings as equal. Candidate `UNION` and planner scan/sort choice do not promise input order, so `row_number()` could assign different row numbers to ties and LIMIT/OFFSET could pick different members. The existing aggregate explicitly orders by unique `rn`; without that explicit `jsonb_agg` order, subquery ordering alone would not guarantee array order. The new UUID resolves ties for one fixed visible set. `created_at` is currently NOT NULL, though explicit NULLS LAST remains. Different collation versions, record edits, inserts, deletes, changed RLS visibility or permissions, ID mutation, and separate RPC snapshots can still change order or page membership. Offset pagination does **not** provide a cross-request snapshot under concurrent writes. The pre-existing no-RPC PostgREST browse/fallback and JavaScript compatibility sorts still end in non-unique keys; their pagination stability is not guaranteed by this RPC change. They remain untouched, including honest narrower-coverage disclosure and fail-closed error behavior.

## Verification — MEASURED-AC

- Starting branch `arena/c9d0d599-presentation` at `2b46c60d8945a6a10a9f05be49994b32d5939343`, parent `3ffd555fc8b0f41ba8ef4e62676b8941335db1aa`, clean; fetched origin matched. AK `4d7c56cee8cc34c2daeb1ac0ff53a102ae9af9f5` review read via `git show`; original AK scratch cases/SQL remain unavailable. Current commit identity: `git rev-parse HEAD`; parent must be the starting commit above.
- `node scripts/evaluate-search-ordering.mjs` runs entirely in memory, creates the same reconstructed 4,016-published/one-draft scale dataset, and independently scans all published rows with full weighted query and facet predicates. **28/28 reconstructed cases and 20/20 extra cases:** exact complete candidate/re-filter ID sets, totals and ordered RPC pages matched that no-candidate, unpaginated oracle. Cases cover mixed taxonomy/document, numeric, phrase/OR/NOT-only, blank/null, malformed/injection, truncation, subject/course/semester/type/platform/topic/featured and paging. These are not AK's exact unrecoverable 28 cases or an exhaustive proof.
- Full 4,000-result `filler` order: **84 pages of 48**, concatenation exactly equals the unpaginated oracle, **zero duplicates**. Duplicate-title `Equal`: 80 rows over seven pages of 12 also exactly match, zero duplicates; repeats match. Extra probes include offset 1,980 and tail 3,990, and NULL/zero/negative/oversized size and offset bounds.
- `tests/database/search-ranking.test.ts` adds 150 controlled rows, 144 equal title/rank/timestamp ties inserted in reverse UUID order plus lower-ranked body-only hits. For relevance, title, newest and blank featured browse, repeated queries and every adjacent page match an independent unpaginated full-scan order, including offset 132 and empty offset 150; full concatenations have no duplicates, and title relevance remains above body relevance. Against the old migration from `2b46c60` in an isolated temporary directory, the new test **failed as expected** on the relevance page at offset 0. First attempt in that directory failed at setup because its TS path-alias configuration was missing; rerunning with `TSX_TSCONFIG_PATH` set to the repo config reached the ordering assertion.
- Local ephemeral `anon` and unauthenticated-claims `authenticated` both saw no draft through RPC and direct subject inserts failed `42501`; existing policy/admin tests passed. No hosted authorization re-test.
- `npm run check` **passed** (lint, typecheck, 47 unit, 27 DB, build). After adding the scale script, lint and typecheck were rerun and passed. `npm audit --omit=dev`: 0 vulnerabilities. Serial production Chromium/SwiftShader E2E: **23 passed, 1 dev-only skipped**; no test-only override should be read as real GPU validation. No dependency manifests/lockfiles changed.

## Deterministic V1 baseline — MEASURED-AC, local only

After correctness checks, with no concurrent test/build job: PGlite 0.5.14, Node 22.22.3, analyzed 4,016 published synthetic/fixture rows, 48-row pages, two warmups then five sequential wall-clock measurements. Reproduce with `node scripts/evaluate-search-ordering.mjs`; optional `SEARCH_ORDER_RESULTS=/path/to/local.json` saves detailed plans/samples. This is a baseline, not a controlled pre/post optimization comparison or hosted latency.

| Query / offset | Matches | Median ms | Range ms |
| --- | ---: | ---: | ---: |
| graviton / 0 | 2,667 | 294.83 | 293.40–301.12 |
| filler / 0 | 4,000 | 415.55 | 410.34–435.80 |
| graviton / 1,980 | 2,667 | 312.00 | 302.94–316.63 |
| kw12 / 0 | 45 | 65.03 | 64.56–66.12 |
| filler + Sem 1 / Worksheet / Google Drive | 66 | 12.50 | 11.69–14.44 |

`EXPLAIN ANALYZE` on the document predicate naturally chose sequential scans for graviton and kw12. With seqscan disabled, the full published predicate used a bitmap on the **btree** `documents_public_course_idx`, filtering text. A separate forced simplified kw12 predicate **without** publication filter used `documents_search_idx` GIN; this proves eligibility only for that simplified predicate, not natural/hosted usage or speedup. Extracted literal V1 body still contains `WindowAgg → Sort` (under `Limit → Sort`) and candidate seq scans; one instrumented execution was 405.021 ms, not the median. Hosted plans/latency unverified.

## Slow-GL and next step

Native unmodified separate-canvas WebGL2 probes on temporary Chromium 153: default, `--disable-gpu`, and explicit ANGLE SwiftShader all produced contexts with both `failIfMajorPerformanceCaveat: true` and false (unmasked renderer SwiftShader); disabling both GPU and software rasterizer produced neither. Thus no genuine strict-only refusal condition was available. The existing software success helper rewrites the option, and the generic null stub is unconditional; neither proves refusal. **UNVERIFIED**, no misleading test added. A controlled browser/driver must demonstrate strict-null/relaxed-success without rewriting options and then check ambient and shelf fallback/status.

AO review of the tie-contract behavior change is next. Keep `202611020001_search_ranking.sql` unapplied until separate AO approval. Do not deploy or merge. Consider non-RPC tie ordering and snapshot/cursor semantics separately; do not assume this resolves concurrent-write pagination or re-accepts v2.

Files changed in this follow-up: `supabase/migrations/202611020001_search_ranking.sql`, `tests/database/search-ranking.test.ts`, `scripts/evaluate-search-ordering.mjs`, `SEARCH_V2_VALIDATION.md`, `FRONTEND_CORRECTIONS.md`, `FRONTEND_ACCEPTANCE_CHECKLIST.md`, `KNOWN_ISSUES.md`, `AC_HANDOVER.md`, `AO_HANDOVER.md`, `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md` and `DEVELOPMENT_GUIDE.md`. No dependency, production data, fallback application, previously applied migrations, hosted Auth, Vercel, or AK branch changes. Git's final commit hash and remote agreement must be checked after committing and pushing; a commit cannot embed its own hash.

---

# Search optimization v2 validation — AC, 2026-11-03

**Decision: REJECT this reconstructed v2; no migration or application change.** The exact-order/pagination gate fails and the claimed large speedup was not reproduced. This is not an acceptance of v1's tie stability: the unchanged v1 order ends in `title`, not a unique key. Do not apply `202611020001_search_ranking.sql` to hosted Supabase without separate AO approval. Stop for AO review.

## Provenance and reproducibility

- Branch `arena/c9d0d599-presentation`; reviewed start/parent of this work `3ffd555fc8b0f41ba8ef4e62676b8941335db1aa`, whose parent is `681800f894b2cf17021bb540e177a68c05e8f72e`. AK's read-only branch tip `4d7c56cee8cc34c2daeb1ac0ff53a102ae9af9f5`; reviewed `frontend-intelligence/phase2/AC_CORRECTION_INDEPENDENT_REVIEW.md` with `git show`.
- AK's original `probe5.mjs`, `probe9.mjs`, exact v2 SQL and data generator were scratch-only, not present in that commit or this sandbox. The following is a **new reconstruction**, not a reproduction of AK's exact 28 inputs, exact v2 or dataset. AK's timing and 28/28 findings remain **REPORTED-AK**.
- Run `npm ci`, then `node scripts/evaluate-search-v2.mjs` from repo root. Optional `SEARCH_V2_RESULTS=/some/local/path.json` saves detailed local output. It uses only in-memory PGlite 0.5.14, real local migrations and local fixture seeds, and an ephemeral `search_catalog_v2`; it contacts no hosted service. It generates 4,000 published rows plus 16 existing published and one existing draft (4,017 total), then `ANALYZE`. Rows have subject Fixture Mathematics, course Fixture Class 10, varied semester/type/platform/featured, common `filler`, 2,667 `graviton`, 1,333 `zephyrq`, 45 `kw12`, and 80 identical titles. Two extra titles exercise cross-field matching and apostrophe. IDs are generated locally, so exact tie members/timings can vary.
- v2 uses the existing function's query/candidate/weighted/filter stages unchanged, makes `filtered` MATERIALIZED, removes `row_number()`, applies the **same sort expressions** directly before LIMIT/OFFSET, and explicitly orders `jsonb_agg` by the same expressions. This implements AK's described shape, not an unavailable byte-for-byte candidate. No UUID tiebreak is added because that would itself change v1's unspecified tie order and violate the requested exact comparison.
- Node 22.22.3, npm 10.9.8. Each call below returned up to 48 JSON rows. Timing uses wall clock in one in-memory database: two warmups per variant, five alternating measured calls, ms medians and min–max; see script for exact filters and generator. PGlite timings/plan are not hosted PostgreSQL measurements.

## Correctness / completeness — MEASURED-AC

- The script reconstructs **28** cases including mixed document/taxonomy, digit boundaries, subject/course names, semester/type/platform text, quoted phrase, OR, negation-only `-algebra`, blank, malformed quotes, punctuation, injection-shaped text, 300-character input, apostrophe, zero matches and broad matches. The independent oracle scans all published rows, constructs the full weighted vector and applies the full query without candidate restriction. Exact **complete ID sets** from the actual v1 candidate+re-filter CTE agree with the oracle in 28/28 reconstructed cases; v2 shares those unchanged stages. RPC totals from both agree with oracle in 28/28. In particular, `akzephyr graviton mathematics worksheet` matched 1, `1` 1,341, `10` 4,006, and `-algebra` 4,012. This is evidence on these inputs, not a proof of all possible queries or AK's original cases. AK's example `zephyrq -Title` has a positive term; `-algebra` is the separate negation-only probe here.
- Exact JSON page comparison **FAILED** in 14 of the 28 reconstructed cases and 12 of 20 additional page/sort/filter/bounds cases. In the observed run for `Equal`, title sort, page size 12, offsets 0 and 12: v1 and v2 each reported 80 total; one second-page member differed (`akv2-scale-59` old vs `akv2-scale-100` new), and v2 repeated `akv2-scale-100` across both pages. Ties also permute within pages. Equality of non-tied cases and equal totals does not rescue this gate. IDs and tie permutations may vary on rerun. Because v1 also lacks a unique tiebreak, its stable pagination with duplicate keys is **not guaranteed** even if this particular pair of v1 pages did not overlap.
- Both variants returned 12 for explicit null size/offset, 1 for size 0 or -5, 48 for oversized 9999, clamped negative offset to zero and returned no rows at offset 99999 while preserving total. All 20 extra cases also matched independent oracle totals, including subject/course/topic filters, null query and tail page. Composite `filler`/`Sem 1`/`Worksheet`/`Google Drive` gave 66, and `featured` gave 571; exact ordered comparison still failed where ties appeared. Baseline DB tests exercise additional filter/RLS/admin scenarios. This is not an exhaustive authorization or all-filter proof.
- In ephemeral local DB, anon and authenticated with empty claims saw no fixture draft through either RPC and both were denied a direct subject insert with SQLSTATE `42501`; neither role was elevated. The existing local DB suite passed 26/26. Hosted RLS/authorization was not retested.

## Performance — MEASURED-AC (last run)

| Query / scope | Matches | v1 median (min–max) ms | reconstructed v2 median (min–max) ms |
| --- | ---: | ---: | ---: |
| `graviton`, offset 0 | 2,667 | 348.94 (313.89–374.01) | 332.33 (301.97–352.36) |
| `filler`, offset 0 | 4,000 | 420.33 (414.45–473.93) | 451.58 (398.03–486.72) |
| `graviton`, offset 1,980 | 2,667 | 300.98 (298.58–314.54) | 306.60 (298.93–329.03) |
| `kw12`, offset 0 | 45 | 63.57 (63.39–66.31) | 63.31 (62.64–65.07) |
| `filler` + semester/type/platform | 66 | 12.11 (11.69–12.44) | 12.02 (11.66–12.13) |

The final run has graviton 4.8% faster, but filler 7.4% slower and deep page 1.9% slower, with overlapping ranges; selective/facet medians are nearly unchanged. An earlier run had graviton 310.90→304.90 ms and filler 439.06→421.24 ms. AK **REPORTED** 309→214 ms graviton, 343→261 filler, and 367→266 deep page with different unrecoverable SQL/fixtures/conditions; the direct comparison is not controlled and those figures were not independently reproduced. No speedup is claimed for hosting.

## Plans — MEASURED-AC, local only

`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on the published document-vector predicate: natural planner chose `Seq Scan` for `graviton` (2,667 rows) and `kw12` (45 rows). With `enable_seqscan=off`, both used `Bitmap Heap Scan` via btree `documents_public_subject_idx` and filtered search terms; this does **not** demonstrate GIN use in the actual predicate. A separate forced `kw12` predicate **without** publication filter selected `Bitmap Index Scan documents_search_idx` → bitmap heap scan: demonstrates index eligibility for that simplified predicate, not natural planner use or end-to-end RPC performance. All switches reset locally.

To see inside the SQL function, the script also EXPLAINs its extracted body with literal graviton inputs. v1 contains `Limit → Sort → WindowAgg → Sort → CTE Scan`; v2 contains `Limit → Sort → CTE Scan` with no WindowAgg; both still show candidate seq scans. Single EXPLAIN execution time 371.027 vs 359.650 ms is diagnostic, not a benchmark median; literal planning and instrumentation differ from RPC calls. Full JSON available by rerunning with `SEARCH_V2_RESULTS`.

## Baseline gates and slow WebGL

- `npm run check`: **PASS** lint, typecheck, 47/47 unit, 26/26 DB, build. `npm audit --omit=dev`: **0 vulnerabilities**. Full `npm ci` reported 20 moderate development-toolchain advisories; no dependency changes.
- Production-browser suite in temporary npm-packed `@sparticuz/chromium` 153, local production server, software-GL flags: initial two-worker run **22 passed, 1 failed, 1 skipped**: command-search option timed out after 5s; the failure snapshot subsequently contained the option, consistent with late arrival but root cause unconfirmed. Isolated retry **1 passed**; full one-worker rerun **23 passed, 1 dev-only skipped**. No weakening/change to tests. This does not erase the first failure; timing sensitivity remains to monitor.
- Existing software-GL initialization helper explicitly changes `failIfMajorPerformanceCaveat` to false; generic unavailable test returns null regardless of attributes. Neither proves the real slow-GL refusal path. Separate unmodified native canvas probes (new canvas per request) with software ANGLE/SwiftShader and also default flags returned a WebGL2 context for **both** true and false; this browser did not provide a reproducible strict-refusal condition. Therefore no fake refusal test was added and actual production-condition slow-GL refusal is **UNVERIFIED**. A follow-up needs a controlled browser/driver that demonstrably returns null for true and a context for false, no option rewriting, then must check ambient fallback and on-demand shelf poster/status/retry. Physical GPU/thermal remains unverified.

## Safe next step for AO

Obtain AK's exact scratch SQL/dataset and harness, or review this reproducible reconstruction. Decide explicitly whether to define a unique final tie key as a behavior change, then add duplicate-title/rank/newest paging regression tests for both boundaries and repeat the complete oracle + benchmark on controlled identical workloads and real representative Postgres. Alternative query designs must retain the candidate superset, full semantics, RLS, explicit aggregate order and disclosed missing-RPC fallback. Do not substitute a bounded-prefix v3. Until AO's separate approval there is no hosted migration, deployment, merge, or data change.

## Work product and Git boundary

Files changed in this validation commit: `scripts/evaluate-search-v2.mjs`, `SEARCH_V2_VALIDATION.md`, `AO_HANDOVER.md`, `AC_HANDOVER.md`, `FRONTEND_CORRECTIONS.md`, `FRONTEND_ACCEPTANCE_CHECKLIST.md`, `FRONTEND_IMPLEMENTATION.md`, `KNOWN_ISSUES.md`, `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, and `DEVELOPMENT_GUIDE.md`. No migration, application, test, seed, data, manifest or lockfile changes. This file is committed in the new validation commit; its exact self-hash is obtained with `git rev-parse HEAD`, and its parent must be `3ffd555fc8b0f41ba8ef4e62676b8941335db1aa`. Final remote agreement and exact commit are reported after push, not predeclared inside the commit.
