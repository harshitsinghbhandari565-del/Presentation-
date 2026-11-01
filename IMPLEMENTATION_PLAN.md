# Implementation plan and status

Updated: 2026-11-01

## Phase 0 — Repository audit ✅
Inspect stack/source/config/history, run baseline gates and rendered browser checks, document root causes and safe fixes before implementation. Evidence: `REPOSITORY_AUDIT.md`.

## Phase 1 — Foundation ✅ locally verified
Lockfile/ignores/env example, local fonts, safe headers, centralized types/catalog, URL validation, shared search/validation, optional Supabase clients and lazy health. Original JSON/URLs preserved.

## Phase 2 — Visual system ✅ locally verified
Editorial landing, responsive navigation/footer, dark/light/system themes, persistent projector mode, reduced-motion-aware animation, mobile filter disclosure, loading/error/404 surfaces. Desktop/mobile screenshots and axe checks recorded.

## Phase 3 — Discovery ✅ locally verified
URL-driven library search/filter/sort/pagination, featured/recent/related, subject/course pages, command palette, genuine empty states and bounded database queries/facets.

## Phase 4 — Document experience ✅ locally verified
Canonical detail route, legacy redirect, full metadata, decorative/optional thumbnail, exact original/presentation/backup links, copy link, opt-in permission-dependent preview, related resources and structured data.

## Phase 5 — Private admin ⚠️ database applied and grant-hardened; hosted auth/CRUD pending
Server-authorized dashboard, setup/login/access-denied states, resource CRUD/archive/confirmed delete, category add/edit, metadata preview, admin search/filter/pagination and revalidation. The exact migration/seed were applied to the owner-confirmed Supabase project and schema/data/RLS probes were verified. The approved least-privilege grant remediation was applied as hosted migration `20261101153928`; anonymous users are SELECT-only and authenticated users have SELECT/INSERT/UPDATE/DELETE without TRUNCATE/REFERENCES/TRIGGER/MAINTAIN, with RLS still controlling writes. Phase 3 Auth audit is complete (`SUPABASE_AUTH_AUDIT.md`); hosted Auth still needs owner dashboard URL/signup configuration and an owner-created administrator account. **Remaining:** configure Auth, create/authorize administrator, harden Auth cookie/logout/config findings, and verify hosted end-to-end behavior.

## Phase 6 — Quality ✅ local gates; external checks pending
Lint/typecheck/unit/PGlite/build/production Playwright/axe pass; production dependency audit clean; CI workflow added. **Remaining:** GitHub CI run, hosted Supabase integration tests, external link permission check, Safari/Firefox/physical-device/assistive-technology review, external Arena proxy check.

## Phase 7 — Deployment ⚠️ public preview live; production activation pending
The existing Vercel project serves commit `94728bf` at `https://harshit-presentation-hub-preview.vercel.app` with `NEXT_PUBLIC_SITE_URL` configured. Supabase variables are absent. The confirmed Supabase project now has the reviewed schema, original resource and verified least-privilege catalog grants. Complete the remaining security/health findings in `SUPABASE_AUDIT.md`, configure the existing project, deploy and verify the full hosted workflow before claiming production readiness.

## Next actions (in order)
1. Owner completes Supabase Auth URL configuration, disables public signup, creates their own Auth account, and confirms completion; then verify the actual Auth UUID and grant only that UUID membership.
2. Address audit findings (browser config boundary, cookie/logout hardening, honest Supabase health) within the existing architecture; add regression tests.
3. Configure production public Supabase values in the existing Vercel project; decide preview backend isolation before enabling preview writes.
4. Deploy and verify hosted login/logout, CRUD/archive/confirmed delete, public propagation and direct API RLS.
5. Owner verifies original sharing permissions; review backups/monitoring, CI and broader browser/AT coverage.
6. For any future public table migration, include explicit least-privilege grants and verify effective privileges; global Supabase default privileges remain unchanged.
