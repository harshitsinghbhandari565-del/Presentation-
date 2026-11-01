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
- `supabase/migrations/202611010001_catalog.sql` and `supabase/seed.sql` were applied to the confirmed hosted database through the connector transactional migration workflow. Hosted versions are `20261101134604` (`catalog_schema`) and `20261101135344` (`original_resource_seed`). See `SUPABASE_AUDIT.md` and `SUPABASE_DATABASE_VERIFICATION.md`.
- Theme/projector preferences persist locally. Motion respects reduced-motion preferences.

## Current status

Public experience, discovery, document detail, compatibility mode, responsive themes, SEO/error surfaces and admin source are implemented. Local lint, typecheck, unit tests, PostgreSQL policy tests, production build and production-server browser/E2E checks pass. See `VERIFICATION.md` for exact scope.

**Not production-complete:** Supabase project `nypojddjzzycicfinxbv` (eu-north-1) now has the reviewed schema and original resource, and the resource URLs were verified unchanged. Activation is blocked by excessive Supabase default table privileges on `subjects`, `courses` and `documents`, including `TRUNCATE`; a least-privilege remediation awaits owner approval. Auth users/administrators remain zero. The existing Vercel project still serves compatibility mode because Supabase variables are absent. Auth settings, administrator creation, Vercel environment variables and deployment configuration were intentionally not changed. See `SUPABASE_DATABASE_VERIFICATION.md`; do not claim production readiness.

## Continuity

Read `REPOSITORY_AUDIT.md` for the original findings, `IMPLEMENTATION_PLAN.md` for phases, `PROGRESS.md` for status, `DECISIONS.md` for rationale, `KNOWN_ISSUES.md` for blockers, `DEVELOPMENT_GUIDE.md` for setup and `VERIFICATION.md` for evidence.
