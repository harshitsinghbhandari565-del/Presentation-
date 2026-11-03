# Deterministic search ordering handover (2026-11-03)

Branch `arena/c9d0d599-presentation`, starting parent `2b46c60d8945a6a10a9f05be49994b32d5939343`; current commit via `git rev-parse HEAD`. The still-unapplied V1 RPC adds UUID ASC as final key, keeping `row_number()` and explicitly ordered aggregation. New regression checks 150 tie/score rows across every page and four sort/browse modes; old SQL fails that test, new passes. Local `scripts/evaluate-search-ordering.mjs` confirms 28 reconstructed and 20 additional exact full sets/totals/ordered pages, plus 4,000-result all-page concatenation. Full measurements, commands and limitations: `SEARCH_V2_VALIDATION.md`. No v2 shipped, no hosted action; fallback disclosure preserved, native slow-GL refusal unverified. Stop for AO review.

---

# Search v2 validation handover — 2026-11-03 (current)

Starting parent `3ffd555fc8b0f41ba8ef4e62676b8941335db1aa` on `arena/c9d0d599-presentation`; this document is in the current commit (`git rev-parse HEAD`). **REJECT v2; no RPC changes.** `SEARCH_V2_VALIDATION.md` records the 28 reconstructed full-set oracle cases, 14 JSON differences, 12/20 extra differences, real tie/page duplication, local timing ranges and EXPLAINs, absent AK probes, current baseline gates, retry after E2E timeout, and unverified native slow-GL refusal. Run `node scripts/evaluate-search-v2.mjs` locally; never against hosted DB. Ask AO to review and choose tie semantics and the next performance investigation. The migration is unapplied; compatibility fallback's taxonomy limitation is still disclosed. No merge/deploy/hosted action.

---

# AC handover — consolidated frontend correction round

Updated: 2026-11-02 · Branch `arena/c9d0d599-presentation` · Starting commit `681800f894b2cf17021bb540e177a68c05e8f72e` · Its parent `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`.

**Completed locally; awaiting AK independent re-review, not accepted.** See `FRONTEND_CORRECTIONS.md` for D-1–D-13, file/test evidence, screenshot paths, index-plan limitation and exact commands; `FRONTEND_ACCEPTANCE_CHECKLIST.md` is the updated correction scorecard. This section belongs to the correction commit; use `git log -1` for its SHA. Do not merge/deploy/apply hosted SQL as part of review.

**Gates MEASURED-AC:** lint/typecheck/build pass; unit 47/47; DB 26/26; production Chromium 23 passed with one dev-only skipped; fixture dev Chromium 1/1; production audit 0. Landing/about/dynamic-library JS 187.5/180.2/187.6 KB gzip; shader 1.8 and Three 129.0 KB lazy. No Three initial request. Initial failed test runs and fixes are documented; current full rerun passed. Screenshots are headless software GL with explicit test-only caveat override, not real GPU sign-off.

**Blockers:** hosted ranking migration still unapplied; AO approval required. Vercel env/deploy and hosted interactive login remain separately gated. Real-device/GPU/AT, Safari/Firefox, Lighthouse and physical forced-colors remain unverified. Do not modify administrator membership. Retain the pre-existing Dropbox embed restriction, microtype and empty optional Drizzle scaffold as tracked issues.

---

# AC handover — approved frontend implementation

Updated: 2026-11-02
Branch: `arena/c9d0d599-presentation`
Reconciliation reference / starting HEAD: `71d6fb912f97693f9dded837fdbaeafb5b90e9b0`
Full evidence: `FRONTEND_IMPLEMENTATION.md`.

## What changed

Implemented PO typography (Geist + Newsreader), CSS pinned storytelling, one optional lazy Three.js shelf, raw-GLSL ambient with CSS fallback, weighted search relevance, atomic search announcements, skeleton loading and editorial card hierarchy. Removed `framer-motion`; added exact `three@0.187.0` + dev types. Added unapplied ranking RPC migration and test-fixture-only seed. Original data/Auth/admin/applied migrations preserved.

## Gates

Do not apply `supabase/migrations/202611020001_search_ranking.sql` or `supabase/seed.test-fixtures.sql` to hosted Supabase without explicit approval. Do not deploy/change Vercel, merge AK, change Auth/membership or production documents. Hosted login/env remain gated from backend milestone.

## Verification

Lint/typecheck/build passed; unit 35/35; DB 21/21; E2E 17/17; production audit clean. Landing initial JS -41.7 KB gz. Headless Chromium only; no real-device/GPU/AT verification.

---

# AC handover — Backend Finalization

Updated: 2026-11-02
Branch: `arena/c9d0d599-presentation` (active)
Implementation source inspected: `0077a01c35a7d0a588d2f31dc8167f935b7c8d98`
Milestone: AO architecture reconciliation + approved administrator membership.

## Current state

The Supabase backend/Auth/admin implementation is present and locally verified. The approved owner membership now exists. The deployed Vercel origin remains in compatibility mode because Supabase environment configuration/deployment are still approval-gated. Do not claim hosted browser login or deployed CRUD is complete.

Read `ARCHITECTURE_RECONCILIATION.md` before touching the data layer. AK’s baseline audit (`4307a68`) and the AC implementation are different trees. The empty Drizzle schema stub is intentional; the real catalog schema is in `supabase/migrations/`. The retained `src/db` module is only an optional health-check scaffold.

## What changed in this milestone

- Read-only reconciliation of `main`, AK’s pinned research ref, the separate frontend-polish ref, `AC-Branch` and the active AC branch. AK’s branch was not checked out or modified.
- Re-verified hosted Auth/account state and inserted only UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` into `public.administrators` with `on conflict do nothing`.
- Verified membership count/FK/idempotency, hosted admin/non-admin RLS behavior and rollback-only admin CRUD.
- Added local DB regressions for approved membership idempotency/FK integrity and authenticated self-grant denial.
- Expanded anonymous admin E2E coverage to categories/new/edit protected routes and no-store headers.
- Updated architecture, Auth, database, verification and continuity docs.

No application runtime architecture was replaced. No schema migration, Auth setting, existing document record, Vercel env or deployment was changed.

## Hosted facts

- Project `nypojddjzzycicfinxbv`, `eu-north-1`.
- Migrations already applied: `20261101134604 catalog_schema`, `20261101135344 original_resource_seed`, `20261101153928 least_privilege_catalog_grants`. Do not reapply.
- Four RLS tables, seven policies, four functions, one trigger, 29 constraints, 14 indexes.
- Auth: exact Site URL/redirect, signup disabled, email confirmation required, one confirmed owner account.
- Membership: one row for `978a7ac3-7385-4d3d-8b83-51855c8eb25a`, created `2026-11-02T11:55:09.431269+00:00`; repeat insert is a no-op.
- Counts: 1 subject / 1 course / 1 document / 1 administrator / 1 Auth user / 0 Auth sessions / 0 probe rows.
- Original document fingerprint: `2b7db1a601cd43a0f6a9d88556b74033`; original URLs and seed timestamp unchanged.

## Runtime map

- Public catalog: `src/lib/catalog.ts` → `src/lib/supabase/public.ts`; compatibility fallback is the untouched original JSON.
- Admin authorization: `src/lib/admin/auth.ts` + `authorization.ts` → Supabase `auth.getUser()` + exact membership row.
- Admin writes: `src/app/admin/actions.ts` + `src/lib/admin/repository.ts` → Supabase PostgREST under RLS.
- Login: `src/components/admin/LoginForm.tsx` → `src/lib/supabase/browser.ts`.
- SSR/proxy: `src/lib/supabase/{server,cookies}.ts`, `src/proxy.ts`.
- Membership boundary: `public.administrators`, `public.is_administrator()`, catalog RLS policies.
- Optional legacy health: `src/db/index.ts` → `src/app/api/health/route.ts` (known mismatch; not the catalog path).

## Verification

`npm ci`, lint, typecheck, unit 33/33, DB 17/17, production build, production-server E2E 12/12 and production-dependency audit passed. Full dependency audit has 20 moderate dev-only advisories. Hosted SQL probes verified admin identity/CRUD and non-admin denial with rollback. Anonymous admin browser checks verify fail-closed setup redirects and no-store headers.

Not executed: owner-password hosted login, hosted cookie persistence/refresh, deployed admin CRUD/logout, deployed non-admin browser denial. Hosted Auth reports zero sessions and `last_sign_in_at = null`. Do not request or invent credentials; activation and interactive owner verification require the separate deployment/env approval path.

## Next safe steps

1. Keep membership as provisioned; do not insert again except an idempotent verification under an authorized workflow.
2. Before production sign-off, fix health readiness to reflect Supabase catalog configuration/readability.
3. Obtain approval for Vercel public Supabase env + deployment and preview isolation.
4. Run the hosted owner checklist in `SUPABASE_AUTH_AUDIT.md`: login, persistence/refresh, protected pages, CRUD/archive/confirmed delete, public propagation, logout, non-admin denial, cookie flags and direct API RLS.
5. Preserve original URLs, existing records and least-privilege grants. Future public tables need explicit grants because global defaults remain unchanged.

## Continuity

Update `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `DEVELOPMENT_GUIDE.md`, `AO_HANDOVER.md`, this file and `VERIFICATION.md` after meaningful milestones. Push only to `arena/c9d0d599-presentation`; never modify AK’s branch.
