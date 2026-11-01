# Project context

Updated: 2026-11-01

## Product

Harshit Presentation Hub is an educational resource discovery hub for students. It catalogs metadata and original external sharing URLs; it does not upload, copy, sync or proxy documents. Students need no account. Administrators curate the collection through a private, server-authorized dashboard.

## Repository and stack

- Repository: `harshitsinghbhandari565-del/Presentation-`
- Working branch: `arena/c9d0d599-presentation` (baseline `4307a68`)
- Next.js 16.4.3 App Router, React 19.2.6, TypeScript 5.9.3
- Tailwind CSS 4 plus semantic CSS design tokens; Framer Motion; Lucide icons
- Local Geist and Newsreader fonts (no build-time font CDN dependency)
- Supabase JS/SSR for the optional hosted catalog and administrator Auth
- PostgreSQL migration with RLS, constraints, indexes, generated full-text search and facet RPC
- Existing Drizzle/PostgreSQL health-check scaffold retained as optional infrastructure
- Node 22+, npm lockfile, Playwright + axe, Node test runner + tsx, PGlite policy tests

## Architecture

- `src/data/presentations.json` is the untouched original source and read-only compatibility catalog. Its sole real resource is `english-lost-spring-mcqs`.
- `src/lib/catalog.ts` is the centralized public catalog boundary. Without Supabase configuration it serves the original JSON record; with configuration it reads published Supabase rows. It never fabricates resources.
- `src/lib/urls.ts`, `search.ts`, `document-validation.ts` own URL safety, discovery semantics and shared validation.
- Public routes: `/`, `/library`, `/resources/[slug]`, `/subjects`, `/subjects/[slug]`, `/about`. Legacy `/presentation/[id]` redirects to canonical resource pages.
- Admin routes live under `/admin`; server pages and server actions recheck authenticated administrator membership. No service-role key is used by the app.
- `supabase/migrations/202611010001_catalog.sql`, `supabase/seed.sql`, and `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` were applied to the confirmed hosted database through the connector transactional migration workflow. Hosted versions are `20261101134604` (`catalog_schema`), `20261101135344` (`original_resource_seed`), and `20261101153928` (`least_privilege_catalog_grants`). See `SUPABASE_AUDIT.md` and `SUPABASE_DATABASE_VERIFICATION.md`.
- Phase 3 Auth audit is recorded in `SUPABASE_AUTH_AUDIT.md`. Hosted Auth still points at localhost, has an empty redirect allow list, and still allows public signup; no Auth setting or administrator membership has been changed yet.
- Theme/projector preferences persist locally. Motion respects reduced-motion preferences.

## Current status

Public experience, discovery, document detail, compatibility mode, responsive themes, SEO/error surfaces and admin source are implemented. Local lint, typecheck, unit tests, PostgreSQL policy/grant tests, production build and production-server browser/E2E checks pass. See `VERIFICATION.md` for exact scope.

**Not production-complete:** Supabase project `nypojddjzzycicfinxbv` (eu-north-1) now has the reviewed schema, original resource, and verified least-privilege catalog grants. The original resource URLs were verified unchanged. The earlier excessive-default-privilege blocker is resolved for `subjects`, `courses` and `documents`; global Supabase default privileges were intentionally left unchanged, so future table migrations must set explicit grants. Phase 3 Auth setup is audited but waiting for owner dashboard configuration and owner-created Auth account confirmation. Auth users/administrators remain zero. The existing Vercel project still serves compatibility mode because Supabase variables are absent. Auth settings, administrator creation, Vercel environment variables and deployment configuration were intentionally not changed. See `SUPABASE_DATABASE_VERIFICATION.md` and `SUPABASE_AUTH_AUDIT.md`; do not claim production readiness.

## Continuity

Read `REPOSITORY_AUDIT.md` for the original findings, `IMPLEMENTATION_PLAN.md` for phases, `PROGRESS.md` for status, `DECISIONS.md` for rationale, `KNOWN_ISSUES.md` for blockers, `DEVELOPMENT_GUIDE.md` for setup and `VERIFICATION.md` for evidence.
