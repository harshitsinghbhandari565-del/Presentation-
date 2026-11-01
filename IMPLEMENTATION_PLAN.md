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

## Phase 5 — Private admin ⚠️ source complete, hosted verification pending
Server-authorized dashboard, setup/login/access-denied states, resource CRUD/archive/confirmed delete, category add/edit, metadata preview, admin search/filter/pagination and revalidation. Additive migration/seed and RLS written; PGlite policy tests pass. **Remaining:** apply to owner-approved Supabase project, create administrator, configure Auth redirects and verify hosted end-to-end behavior.

## Phase 6 — Quality ✅ local gates; external checks pending
Lint/typecheck/unit/PGlite/build/production Playwright/axe pass; production dependency audit clean; CI workflow added. **Remaining:** GitHub CI run, hosted Supabase integration tests, external link permission check, Safari/Firefox/physical-device/assistive-technology review, external Arena proxy check.

## Phase 7 — Deployment ⛔ not started
No Vercel project/deployment or production origin exists. After owner approval: configure Supabase and site origin, deploy, verify production routes/Auth/RLS/SEO/headers and run smoke tests. Do not claim deployment before verification.

## Next actions (in order)
1. Owner approves/provides Supabase project and region; apply reviewed migration/seed.
2. Configure owner-controlled administrator and Auth settings; set public env values.
3. Verify hosted admin/auth/CRUD/revalidation and non-admin denial.
4. Verify original sharing permissions and set production origin.
5. Approve/configure Vercel deployment and run production smoke tests.
6. Review remaining dev-only advisories and broaden browser/AT coverage.
