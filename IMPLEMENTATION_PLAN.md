# Implementation plan and status

Updated: 2026-11-02

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
Server-authorized dashboard, setup/login/access-denied states, resource CRUD/archive/confirmed delete, category add/edit, metadata preview, admin search/filter/pagination and revalidation. The exact migration/seed were applied to the owner-confirmed Supabase project and schema/data/RLS probes were verified. The approved least-privilege grant remediation was applied as hosted migration `20261101153928`; anonymous users are SELECT-only and authenticated users have SELECT/INSERT/UPDATE/DELETE without TRUNCATE/REFERENCES/TRIGGER/MAINTAIN, with RLS still controlling writes. Phase 3 Auth audit and approved local hardening are complete (`SUPABASE_AUTH_AUDIT.md`, commit `b1e73b0`). Hosted URL/signup/email settings and one email-confirmed owner account are verified. **Remaining:** AO–Product Owner UUID confirmation, membership insertion, approved Vercel env/deploy, and hosted end-to-end verification.

## Phase 6 — Quality ✅ local gates; external checks pending
Lint/typecheck/unit/PGlite/build/production Playwright/axe pass; production dependency audit clean; CI workflow added. **Remaining:** GitHub CI run, hosted Supabase integration tests, external link permission check, Safari/Firefox/physical-device/assistive-technology review, external Arena proxy check.

## Phase 7 — Deployment ⚠️ public preview live; production activation pending
The existing Vercel project serves commit `94728bf` at `https://harshit-presentation-hub-preview.vercel.app` with `NEXT_PUBLIC_SITE_URL` configured. Supabase variables are absent. The confirmed Supabase project now has the reviewed schema, original resource and verified least-privilege catalog grants. Complete the remaining security/health findings in `SUPABASE_AUDIT.md`, configure the existing project, deploy and verify the full hosted workflow before claiming production readiness.

## Next actions (in order)
1. AO confirms the verified owner UUID with the Product Owner; AC re-reads state and inserts/verifies only that administrator membership.
2. Address remaining audit findings (honest Supabase health, preview-backend isolation) within the existing architecture. Approved browser config/cookie/logout/authorization hardening and regression tests are complete locally.
3. Obtain approval, then configure production public Supabase values in the existing Vercel project and decide preview backend isolation before enabling preview writes.
4. Deploy and verify hosted login/logout, CRUD/archive/confirmed delete, public propagation and direct API RLS.
5. Owner verifies original sharing permissions; review backups/monitoring, CI and broader browser/AT coverage.
6. For any future public table migration, include explicit least-privilege grants and verify effective privileges; global Supabase default privileges remain unchanged.
