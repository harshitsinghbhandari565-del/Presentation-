# Catalog ordering and hosted-plan handover — 2026-11-03

**Status: locally implemented and tested; awaiting AO review.** AO accepted deterministic V1 (`c5c6ce3ca65113680be614c20ff2c12be95b0954`), rejected v2, approved non-RPC ID tie-breaks, and deferred rank-narrow-then-fetch-wide. Hosted inspection and migration application are separately **NOT AUTHORIZED**. No hosted resource was contacted, migration applied, production data modified, deployment made, branch merged, Auth or Vercel changed.

## Branch and scope

Starting branch `arena/c9d0d599-presentation`, starting commit `c5c6ce3ca65113680be614c20ff2c12be95b0954`, parent `2b46c60d8945a6a10a9f05be49994b32d5939343`. At sandbox start HEAD was the original `4307a68` and prior work appeared as modified/untracked files; all 145 target tracked blobs were verified byte-for-byte and no extra untracked files were present. After fetch, a mixed reset restored the index to the starting commit without discarding any working files; the resulting tree was clean. AK's `frontend-intelligence/phase2/AC_DETERMINISTIC_SEARCH_REVIEW.md` at `2944e0a7c27106e25b6982ec9c87ce1c0e9e5615` was read via `git show`, including §9; AK's branch was not changed. New commit is this document's commit (`git rev-parse HEAD`); its parent should be the starting commit above. Exact final commit and remote agreement are reported after push.

The deterministic V1 migration was **not edited**. Its Git blob is `17b05a01ecd8ce319b5a47099b7af5042b9c3188` both at the starting commit and this worktree. The accepted RPC's search/rank/window/paging logic, candidate superset, error handling and disclosed narrower fallback are unchanged. No v2 or narrow-then-fetch-wide optimization was implemented; no new dependency or manifest/lockfile change.

## Order contract and preserved semantics

All added keys below are **ascending**, only after existing keys. A total order assumes unique, unchanged IDs and a fixed visible dataset, filters, role and collation. Equal ties may deliberately change relative order; earlier keys do not change.

| Path | Existing precedence retained → final key |
| --- | --- |
| Live blank browse | featured DESC → title ASC → ID; title sort: title → ID; newest: created_at DESC → title → ID |
| Live missing-RPC fallback | title ASC → ID, or created_at DESC → title → ID for newest; library keeps `document-fields-fallback` disclosure and non-missing RPC failures remain fail-closed |
| Live command palette missing-RPC/blank | featured DESC → ID (there was **no title key** here; none was invented); missing-RPC disclosure retained |
| Live featured rail | title → ID, after featured filter |
| Live recent rail | created_at DESC → ID (no added title key) |
| Live related resources | candidate window remains same-subject/course/topic selection and `featured DESC → title → ID`, limit 12; stable JS score sort keeps candidate order for equal scores. Sorting equal scores directly by ID would incorrectly override existing featured/title candidate precedence, so it is intentionally not done. |
| JS compatibility/fixture search | original score/featured/newest/title precedence → code-unit ID order; UUID strings use canonical PostgreSQL-compatible ID order; `localeCompare` is still used for titles, as before. |
| JS highlights and related | existing featured/title and date/title rails, or score for related → ID. |
| Admin documents/categories | updated_at DESC → ID for paginated documents; name → ID for subjects/courses. |
| Derived compatibility/fixture facets | name → category ID (unique slug when ID is missing); unique primitive facet values use code-unit comparison only when locale comparison ties. |

There is no blanket cross-mode equality guarantee: JS compatibility substring scoring differs from PostgreSQL `simple`/`ts_rank`, JS and PostgreSQL title collations may differ, live and compatibility recent/related paths already use different primary/secondary keys, and the taxonomy-limited fallback remains disclosed. Offset pagination is not a shared snapshot across requests; inserts, deletes, edits, visibility changes, collation changes or authorized out-of-band ID mutation may move rows. `documents.id` is unique/non-null, but database permissions do not make it immutable.

**Residual boundary:** the already-applied hosted `get_catalog_facets` RPC uses `jsonb_agg(... order by s.name/c.name)` without an ID key. Those **facet option** ties can still be unstable; that SQL RPC is not a PostgREST document-order chain and cannot be changed without a separately reviewed schema migration. Client-side resorting could change the existing PostgreSQL collation order, so it was not silently introduced. The previous applied migration and hosted function are untouched; this does not invalidate deterministic document pagination. Existing physical GPU/device/thermal, AT/screen-reader, Safari/Firefox, visual/1:1, Lighthouse and forced-colors device review remain unverified.

## Tests — MEASURED-AC

- `npm ci`: existing lockfile; 429 packages, 20 moderate dev-toolchain advisories. `npm run check`: lint, typecheck, **53/53 unit**, **28/28 PGlite DB**, production build passed. `npm audit --omit=dev`: 0 vulnerabilities.
- New unit tests use reversed synthetic ties and an in-process mock of real PostgREST URL/order/limit/offset handling. Repeated browse, adjacent pages, featured and recent rails, related 12-candidate limit and score precedence, compatibility/fixture ordering, duplicate category names, admin paging/categories, and ranked RPC pass-through are covered. The mock is not a hosted PostgREST or PostgreSQL collation test. Existing fallback test was updated to assert the stricter `title.asc,id.asc`, not removed; failure/disclosure tests remain.
- `node scripts/evaluate-search-ordering.mjs`: **28/28 reconstructed cases and 20/20 boundary/facet cases** matched independent unpaginated full-set, total and ordered-page oracle; **4,000 filler rows across 84 pages and 80 equal-title rows across seven pages** matched exactly, no duplicate IDs; local anon and authenticated-with-empty-claims draft exclusion and write denial `42501` passed. These reconstructed inputs are not AK's original unavailable scratch probes. Existing DB suite covers additional admin/RLS boundaries.
- `tests/database/hosted-plan-review.test.ts` verifies that the prepared SQL is precisely the parameterized V1 function body, executes all four EXPLAINs in ephemeral PGlite **without installing the ranking RPC**, and confirms the one seeded document remains. No hosted execution was attempted.
- Production Chromium 153, local production server, one worker, test-only SwiftShader flags: **23 passed, one dev-only skipped**. Software-GL success helper changes `failIfMajorPerformanceCaveat` to false; generic null stub is unconditional. **Genuine slow-GL refusal remains UNVERIFIED**, not proven by these tests. The previous native strict-vs-relaxed probe is documented in `SEARCH_V2_VALIDATION.md`. No synthetic refusal claim added.

## Local search baseline and plans

Same PGlite 4,016-published synthetic fixture and deterministic V1, two warmups + five sequential runs, 48-row pages (wall-clock median/range ms): graviton **230.46 (229.89–235.24)**; filler **326.59 (322.99–327.94)**; graviton offset 1,980 **232.25 (232.24–233.40)**; `kw12` **48.63 (47.95–51.73)**; facet case **9.14 (9.01–9.46)**. These rerun numbers differ from earlier machine runs and are not a controlled speedup comparison or hosted measurements. Natural simple published predicates used seq scans for both broad and selective terms. Forced full predicate used a btree bitmap; only a forced **simplified** no-publication predicate showed GIN eligibility. The V1 body EXPLAIN retained WindowAgg; no hosted plan or latency was measured.

## Hosted plan preparation / next action

Review the exact read-only, role-scoped [`docs/hosted-search-plan-review.sql`](docs/hosted-search-plan-review.sql) and [`docs/HOSTED_SEARCH_PLAN_REVIEW.md`](docs/HOSTED_SEARCH_PLAN_REVIEW.md). The SQL prepares the exact V1 function body with eleven typed parameters, three `EXPLAIN (ANALYZE, BUFFERS, SETTINGS, FORMAT JSON)` executions and a simple predicate plan under an anon, empty-claims, read-only transaction. It does not require the RPC to exist; PREPARE and SET LOCAL are session-only. `EXPLAIN ANALYZE` still runs queries and consumes production resources. AO/PO must separately authorize hosted inspection, approve inputs and operational conditions, and later separately approve any migration application. Stop if role/session requirements cannot be met; no bypass or forced planner settings. Full instructions distinguish prepared-body plans, eligibility, natural planner usage, instrumented execution and end-to-end latency.

Files for this follow-up: `src/lib/catalog.ts`, `src/lib/search.ts`, `src/lib/admin/repository.ts`, `tests/unit/catalog-ordering.test.ts`, `tests/unit/catalog-search-fallback.test.ts`, `tests/database/hosted-plan-review.test.ts`, `docs/HOSTED_SEARCH_PLAN_REVIEW.md`, `docs/hosted-search-plan-review.sql`, `CATALOG_ORDERING_REVIEW.md`, `SEARCH_V2_VALIDATION.md`, `FRONTEND_CORRECTIONS.md`, `FRONTEND_ACCEPTANCE_CHECKLIST.md`, `FRONTEND_IMPLEMENTATION.md`, `KNOWN_ISSUES.md`, `AC_HANDOVER.md`, `AO_HANDOVER.md`, `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `DEVELOPMENT_GUIDE.md`. Final commit ID cannot be self-embedded; use Git after commit.
