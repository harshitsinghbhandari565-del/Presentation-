# Development progress

Updated: 2026-11-01

## Completed and locally verified

### Phase 0 — audit
- Inspected source, configuration, docs, available history and rendered baseline before implementation.
- Reproduced build/font failure, search result mismatch, mobile hierarchy, dialog focus and accessibility issues.
- Recorded findings in `REPOSITORY_AUDIT.md` and created continuity docs before app edits.

### Phases 1–4 — foundation, visual, discovery, document experience
- Added lockfile, ignore rules, optional env example, safe headers and local fonts.
- Preserved Harshit identity, projector mode, legacy route and the untouched original JSON resource/URLs.
- Built animated editorial landing page, real featured/subject sections, compatibility/how-it-works/CTA/footer.
- Built URL-driven library with search, subject/course/semester/topic/type/platform filters, featured filter, sorting, pagination and genuine empty states.
- Built canonical detail pages with metadata, safe original/presentation/backup links, copy link, opt-in Google preview and bounded related resources.
- Added dark/light/system themes, persistent projector mode, mobile navigation/filter disclosure, reduced-motion handling and recovery/404 surfaces.
- Added metadata/canonical/OG/robots/sitemap and LearningResource structured data.

### Phase 5 — admin source and database policies
- Added setup/login/access-denied states, server-side administrator membership checks and protected server actions.
- Added resource create/edit/archive/slug-confirmed permanent delete, category add/edit, metadata preview, admin search/filter/pagination and public-cache revalidation.
- Added additive Supabase migration/seed with RLS, constraints, indexes, full-text search and facets.
- PGlite tests verify migration/seed and role policies locally. A healthy Supabase project is connected, but migration/seed and Auth remain unconfigured; see `SUPABASE_AUDIT.md`.

### Phase 6 — quality
- `npm run lint`, `npm run typecheck`: passed.
- Unit tests: 14 passed. PostgreSQL/RLS tests: 8 passed.
- Playwright E2E: 11 passed against development and final local production server.
- Axe: zero automated WCAG A/AA violations on landing/library/detail in both themes.
- Production build: passed. Production dependency audit: zero vulnerabilities.
- Production-server Chromium screenshots inspected at desktop/mobile in both themes; zero uncaught page errors in smoke check.
- Added GitHub Actions quality workflow (not yet run on GitHub).

## Remaining external setup / verification

1. Owner confirms the connected Supabase target `nypojddjzzycicfinxbv` and reviewed migration/seed application.
2. Apply and verify the additive migration and idempotent seed without overwriting data.
3. Disable public signup, configure Auth origin, create the owner-controlled user and grant its actual UUID membership.
4. Address the production audit security/health findings and verify regression tests.
5. Configure the existing Vercel production environment; decide isolated preview backend configuration before enabling preview writes.
6. Deploy and verify hosted login/logout, CRUD/archive/delete, public propagation and API RLS.
7. Owner verifies original Google/Dropbox sharing permissions; review backup/monitoring procedures.
8. Run GitHub CI and broaden Safari/Firefox/physical-device/assistive-technology coverage; review moderate dev-only advisories without forced breaking downgrades.

## Current runtime

Local production server (`next start`) is running on port 3000, bound to 0.0.0.0. A durable Vercel preview is available at `https://harshit-presentation-hub-preview.vercel.app`. Both use compatibility mode because Supabase env values are absent. The old E2B sandbox URL expired; the current raw E2B URL requires a traffic token. The Vercel URL was opened and verified externally.


## Production Supabase audit — 2026-11-01

- Completed a read-only source/service audit, recorded in `SUPABASE_AUDIT.md`; no hosted writes or application source changes.
- Found one healthy Supabase project (`nypojddjzzycicfinxbv`, PostgreSQL 17, eu-north-1), with empty public schema/policies/migration history and zero Auth users.
- Confirmed the existing Vercel deployment has only `NEXT_PUBLIC_SITE_URL`; Supabase URL/key are missing.
- Re-ran unit tests (14/14) and exact migration/seed PGlite policy tests (8/8).
- Verified the original resource remains byte-identical to baseline.
- Identified pre-production fixes: shared browser config validation, explicit secure/HttpOnly session handling, logout error handling, honest Supabase health reporting and preview backend isolation.
- Awaiting owner confirmation of the target project before any migration, seed or Auth configuration change.
