# Catalog ordering + hosted-plan preparation — AO review (2026-11-03)

Starting commit `c5c6ce3ca65113680be614c20ff2c12be95b0954`; this handover is in the current commit (`git rev-parse HEAD`). AO accepted V1, rejected v2, approved application ID tie-breaks, deferred narrow-fetch. Added final IDs to live document browse/fallback/palette/rails/related candidate and admin order chains, plus compatibility/fixture comparators; related score ties retain server candidate precedence. Existing hosted `get_catalog_facets` RPC still has name-only facet-option ties; changing applied SQL is separately gated. V1 migration byte-identical and unapplied.

**MEASURED-AC:** 53 unit, 28 DB, lint/typecheck/build; 28 reconstructed + 20 extras match independent oracle and 4,000 rows/84 pages have no duplicates; serial browser 23 pass/1 dev-only skip; production audit 0. Exact SQL and approval-bound hosted instructions: `docs/HOSTED_SEARCH_PLAN_REVIEW.md` and `docs/hosted-search-plan-review.sql`; never executed hosted. Slow-GL genuine refusal, physical GPU/AT/device and hosted performance remain unverified. Details, fixed-snapshot limits and scope: `CATALOG_ORDERING_REVIEW.md`. Stop for AO review; no deployment/merge/migration.

---

# Deterministic search ordering — AO review handover (2026-11-03)

**Locally implemented; AO review pending.** Parent `2b46c60d8945a6a10a9f05be49994b32d5939343`; this section belongs to the current commit (`git rev-parse HEAD`). The unapplied V1 RPC retains ranking/window/paging and adds ascending UUID primary key after title. The change intentionally resolves previously unspecified ties; no v2 optimization. `SEARCH_V2_VALIDATION.md` records contract, reconstructed 28+20 oracle cases, complete 4,000-row / 84-page comparison, local baseline and natural/forced plans. Tests: lint/typecheck/build, 47 unit, 27 DB, serial Chromium 23 pass/1 dev-only skip; audit production 0. Slow-GL strict refusal remains unverified. Fallback and non-RPC browse remain unchanged and are not guaranteed total-order; cross-request writes can shift offsets. No hosted application/deploy/merge. Review and separately approve any hosted migration.

---

# Search v2 review handover — 2026-11-03 (current)

**REJECT reconstructed v2 / stop for AO review.** Parent `3ffd555fc8b0f41ba8ef4e62676b8941335db1aa`; this section is in the current commit (use `git rev-parse HEAD` for its identity). Migration unchanged and unapplied. Exact v2 page order/membership differed on duplicate ties, including a repeated row across adjacent v2 pages; 14/28 reconstructed JSON cases and 12/20 extra cases differed. Existing v1 itself has no unique tie key. Candidate-stage full ID sets and both totals matched independent no-candidate oracle for all 28 reconstructed cases. Exact AK scratch files absent; do not claim AK's 28 were reproduced. Small overlapping-range local speedups did not reproduce AK's reported ~30% improvement. Full setup, numbers, RLS/plan and boundaries: `SEARCH_V2_VALIDATION.md`; rerunnable local script `scripts/evaluate-search-v2.mjs`.

**Current gates:** `npm run check` passed (47 unit, 26 DB), production audit 0; production E2E initial 22 pass/1 fail/1 skip (search result timed out), isolated retry passed and serial full rerun 23 pass/1 skip. Slow-GL refusal **UNVERIFIED**: native software WebGL2 accepted the strict option; override tests and unconditional-null stubs are not production-condition refusal proof. No hosted service, deploy, merge or membership action. Resolve tie policy and obtain AK harness/representative Postgres benchmark before any further optimization or hosted approval. Existing narrower missing-RPC fallback disclosure remains.

---

# AO handover — consolidated frontend corrections for independent re-review

Updated: 2026-11-02 · Branch `arena/c9d0d599-presentation` · Reviewed starting commit `681800f894b2cf17021bb540e177a68c05e8f72e` · Reviewed parent `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`.

**Status: correction implementation and local gates complete; NOT accepted.** The correction commit is the commit containing this section (obtain its exact SHA with `git log -1` after committing). Ask AK to independently review that commit against parent `681800f`, then AO decides acceptance. Full D-1–D-13, projector, F1/E4b, proof and caveats: `FRONTEND_CORRECTIONS.md`; per-criterion map: `FRONTEND_ACCEPTANCE_CHECKLIST.md`.

- **Completed / MEASURED-AC:** 47/47 unit, 26/26 local PGlite DB/RLS/search, production build, lint, typecheck, production dependency audit 0; production Chromium 23 passed / 1 dev-only skipped; dev fixture Chromium 1/1 passed. Production landing JS 187.5 KB gzip; about 180.2; dynamic library 187.6; shader 1.8 and lazy Three 129.0. CSS and JS+CSS are separate in the report. Context loss used `WEBGL_lose_context` in a test-only software-GL override, not a real GPU.
- **Blocking approval:** `supabase/migrations/202611020001_search_ranking.sql` is still **unapplied to hosted Supabase**. AO must independently approve a later hosted migration application. Vercel environment/deployment, hosted Auth, administrator membership and production data were not changed.
- **Important remaining fallback:** without the RPC, hosted document-vector search cannot match joined subject/course names. Library and command palette now disclose this; explicit missing RPC falls back, other RPC errors fail honestly. Compatibility JSON mode remains intact. Local GIN eligibility was proven with `enable_seqscan=off`; natural PGlite plan and future hosted plans may choose a sequential scan. No hosted performance claim.
- **Pending / UNVERIFIED:** physical GPU/device/thermal and visual approval; Safari/Firefox, screen readers/AT, physical forced-colors/200% zoom, Lighthouse/RUM, hosted migration plan and interactive owner login. Ambient continues throttled while shelf is active; AK's optional single-producer suggestion is deferred pending GPU evidence.
- **Existing tracked issues:** `embed_url` validation limits Dropbox embedding (do not weaken without review); many pre-existing <12px microtype declarations need legibility assessment; `src/db/schema.ts` is an empty optional Drizzle scaffold, not a second catalog; health readiness, CSP/HSTS, HttpOnly, MFA challenge and preview isolation remain open. No indiscriminate rewrite or unrelated architecture changes.
- **Review screenshots:** `review-screenshots/landing-{dark,light}-software-webgl.jpg` and `library-fixtures-{empty,one,multi}.jpg`. Dev fixtures are isolated synthetic records, not production content.

---

# AO handover — approved frontend implementation

Updated: 2026-11-02
Branch: `arena/c9d0d599-presentation` (active)
Reconciliation reference: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`
Starting HEAD verified: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`, clean.
Implementation evidence: `FRONTEND_IMPLEMENTATION.md`.

## Frontend decision status

Product Owner decisions implemented: Geist + Newsreader; pinned storytelling + one optional lazy 3D scene; GLSL ambient background with CSS fallback. No GSAP. No deployment/Vercel change, AK merge, hosted schema/Auth/membership change or production document-data change.

Key results: landing initial JS 228.7 → 187.0 KB gz (-41.7 KB); ambient shader lazy chunk ~1.5 KB gz; optional Three shelf lazy chunk ~128.9 KB gz and not requested initially. `framer-motion` removed; `three@0.187.0` added exact + dev types. Search ranking migration and 16-row fixture seed are reviewed/unapplied local deliverables only.

Verification: lint/typecheck passed; unit 35/35; DB/RLS/ranking 21/21; production build passed; production-server E2E 17/17 including reduced-motion, WebGL fallback, keyboard/pinned story, search announcements and axe; production dependency audit clean. Headless Chromium only; no real-device/GPU/AT sign-off.

Next approval gates: apply hosted search-ranking migration only if approved; hosted Supabase env/deploy and interactive owner login remain gated. Remaining pre-production findings: health readiness, CSP/HSTS, HttpOnly/server-owned login, MFA challenge flow, real-device/AT review.

---



Updated: 2026-11-02
Workstream: AC — Backend Finalization / AO consolidated directive
Branch: `arena/c9d0d599-presentation` (active)
Implementation source inspected: `0077a01c35a7d0a588d2f31dc8167f935b7c8d98`
Milestone commit: the commit containing this handover and the added regression tests (see `PROGRESS.md` / git log for the final hash).

## Decision-ready status

**Part A complete:** the architecture discrepancy is reconciled. AK’s named baseline `4307a68` is the initial `main` upload, not the current AC implementation. The active branch has the Supabase catalog/Auth/admin backend, migrations, tests and CI. AK’s later notes already recognized this; the stale broad claim is “the application has no Supabase backend.” Full evidence and comparison table: `ARCHITECTURE_RECONCILIATION.md`.

**Part B membership complete:** AO’s consolidated directive records explicit Product Owner confirmation/approval for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`. AC re-verified the hosted account and inserted exactly that membership idempotently. Hosted administrator count is 1; target count is 1; the FK references the confirmed Auth user. No further approval is needed for this already-completed membership insertion.

**Hosted application activation remains gated:** no Vercel environment variable, deployment, Auth setting, schema migration or existing document record was changed. Interactive owner login/session/CRUD/logout on the deployed origin is not verified.

## Architecture comparison

| Tree | Commit | Backend reality | Auth/admin | Migrations / quality |
| --- | --- | --- | --- | --- |
| `main` / AK named baseline | `4307a68` | Empty Drizzle stub; raw `pg` requires `DATABASE_URL`; JSON resource | None | No Supabase dir, lockfile, tests or CI |
| AK pinned research branch | `2f3c352` on `arena/9d055deb-presentation` | Baseline app data path + research docs | No Supabase backend in that tree; later notes inspect AC refs | Lockfile; no app Supabase migrations |
| Earlier AC line | `cac9c7f` on `AC-Branch` | Supabase catalog/RLS | Hardened Auth/admin | Same migrations/tests/CI; key security files identical to current source |
| Active AC source | `0077a01` on `arena/c9d0d599-presentation` | Supabase catalog/RLS; optional JSON compatibility; Drizzle only for optional health | Supabase Auth/SSR + exact UUID membership | Three hosted migrations verified; lockfile/tests/CI |

The empty `src/db/schema.ts` still exists on AC, but the catalog schema lives in SQL migrations. `src/db/index.ts` is now lazy/optional and is imported only by the health route. Catalog/admin runtime paths use `src/lib/supabase/*` and `src/lib/admin/*`. Do not replace the working architecture based on the legacy stub.

## Membership evidence

- Target: `nypojddjzzycicfinxbv` (`eu-north-1`).
- Pre-write: one Auth user; UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`; email confirmed at `2026-11-01T23:51:46.943756+00:00`; not deleted/banned; zero memberships.
- Executed: `insert into public.administrators(user_id) values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a') on conflict (user_id) do nothing;`.
- Created: `2026-11-02T11:55:09.431269+00:00`.
- Repeat insert: total/target counts remained 1/1; timestamp unchanged.
- FK: `administrators_user_id_fkey` → `auth.users(id) ON DELETE CASCADE`; referenced user exists and is confirmed.
- Hosted role probe with the approved UUID: `is_administrator() = true`; own membership rows = 1; membership write privileges = false.
- Hosted rollback-only CRUD: subject/course/document create, edit, publish, archive and delete assertions succeeded; zero probe rows persisted.
- Hosted non-admin probe using a test-only UUID that does not exist in Auth: no membership visibility, no self-grant, no original-document update/delete; rollback left data unchanged.

## Verification actually executed

- `npm ci`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:unit`: 33/33.
- `npm run test:db`: 17/17 after adding membership idempotency/FK and self-grant denial regressions. One initial timestamp-format assertion failed and was corrected to compare PostgreSQL text consistently; the rerun passed.
- `npm run build`: passed; admin routes dynamic.
- Production-server Playwright/Chromium E2E: 12/12, including expanded anonymous protected-route/no-store checks and axe.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities. Full audit still reports 20 moderate development-toolchain advisories; no forced breaking downgrade.
- Anonymous production-server admin routes redirect to setup/login and return private/no-store + CDN no-store headers.
- Original document fingerprint `2b7db1a601cd43a0f6a9d88556b74033`, seed timestamp and Google/Dropbox URLs unchanged. Catalog counts 1/1/1; administrators 1; Auth users 1; probe rows 0.

These are local/source and hosted database/config checks. They are **not** interactive hosted owner login or deployed CRUD verification. Hosted Auth still has zero sessions and the owner’s `last_sign_in_at` is null.

## Blockers / next actions

1. Obtain separate approval for Vercel Supabase public environment configuration and deployment; decide preview-backend isolation before enabling writable previews.
2. After approved activation, the owner performs interactive login on the actual origin. Verify session persistence/refresh, protected pages, admin CRUD/archive/confirmed delete, public propagation, logout revocation and authenticated non-admin denial in the browser/API.
3. Fix the retained health route so it checks Supabase catalog readiness rather than only optional `DATABASE_URL` before production sign-off.
4. Review CSP/HSTS, HttpOnly/server-owned login design, MFA challenge flow, external sharing permissions, backups/monitoring and broader browser/AT coverage.
5. Keep future public-table migrations explicitly least-privilege; global Supabase default privileges remain intentionally unchanged.

## Restrictions preserved

No AK branch modification/merge, frontend redesign, new Auth account, unrelated user change, schema redesign, document-record change, Vercel env change or deployment. No passwords, publishable keys, service-role keys or other secrets were requested or printed. Original URLs and existing work are preserved.

Detailed evidence: `ARCHITECTURE_RECONCILIATION.md`, `AC_HANDOVER.md`, `SUPABASE_AUTH_AUDIT.md`, `SUPABASE_DATABASE_VERIFICATION.md`, `VERIFICATION.md`.
