# Project context

Updated: 2026-11-02

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
- Phase 3 Auth audit/hardening is recorded in `SUPABASE_AUTH_AUDIT.md`. Hosted Site URL/redirect/signup/email settings are verified; one email-confirmed owner Auth user exists. Under AO’s consolidated directive, UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` was re-verified and inserted idempotently into `public.administrators`; hosted administrator count is 1. Architecture reconciliation is recorded in `ARCHITECTURE_RECONCILIATION.md`.
- Theme/projector preferences persist locally. Motion respects reduced-motion preferences.

## Current status

Public experience, discovery, document detail, compatibility mode, responsive themes, SEO/error surfaces and admin source are implemented. Local lint, typecheck, unit tests, PostgreSQL policy/grant tests, production build and production-server browser/E2E checks pass. See `VERIFICATION.md` for exact scope.

**Not production-complete:** Supabase project `nypojddjzzycicfinxbv` (eu-north-1) has the reviewed schema, original resource, verified least-privilege catalog grants and the approved owner membership; original URLs are unchanged. Global default privileges remain unchanged, so future table migrations must set explicit grants. Hosted Auth URL/signup/email settings and one email-confirmed owner account are verified. The existing Vercel project still serves compatibility-mode `94728bf` because Supabase variables are absent. Interactive hosted login/session/CRUD/logout remain unverified; env/deploy approval is separate. See `SUPABASE_DATABASE_VERIFICATION.md`, `SUPABASE_AUTH_AUDIT.md` and `ARCHITECTURE_RECONCILIATION.md`; do not claim production readiness.

## Continuity

Read `ARCHITECTURE_RECONCILIATION.md` for the branch/commit reconciliation, `REPOSITORY_AUDIT.md` for the original findings, `IMPLEMENTATION_PLAN.md` for phases, `PROGRESS.md` for status, `DECISIONS.md` for rationale, `KNOWN_ISSUES.md` for blockers, `DEVELOPMENT_GUIDE.md` for setup and `VERIFICATION.md` for evidence.


## Approved frontend milestone — 2026-11-02

PO decisions implemented on the active AC branch: Geist + Newsreader, pinned storytelling + one optional lazy 3D scene, GLSL ambient with CSS fallback. `framer-motion` removed; `three@0.187.0` added for the lazy scene only. Search relevance is weighted; a reviewed ranking RPC migration and 16-row fixture seed are unapplied. Landing initial JS reduced 228.7 → 187.0 KB gz. See `FRONTEND_IMPLEMENTATION.md`.
