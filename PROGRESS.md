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
- PGlite tests verify migration/seed and role policies locally. Hosted Supabase is still unconfigured.

### Phase 6 — quality
- `npm run lint`, `npm run typecheck`: passed.
- Unit tests: 14 passed. PostgreSQL/RLS tests: 8 passed.
- Playwright E2E: 11 passed against development and final local production server.
- Axe: zero automated WCAG A/AA violations on landing/library/detail in both themes.
- Production build: passed. Production dependency audit: zero vulnerabilities.
- Production-server Chromium screenshots inspected at desktop/mobile in both themes; zero uncaught page errors in smoke check.
- Added GitHub Actions quality workflow (not yet run on GitHub).

## Remaining external setup / verification

1. Owner chooses/configures Supabase project and region; apply reviewed migration and idempotent seed.
2. Create owner-controlled Auth user, disable public signup as appropriate, add its UUID to `public.administrators`, configure Auth site/redirect URLs.
3. Set public Supabase env values; verify hosted login, non-admin denial, CRUD/archive/delete, revalidation and RLS through the real API.
4. Owner verifies original Google/Dropbox sharing permissions in a signed-out browser.
5. Set real `NEXT_PUBLIC_SITE_URL`; verify canonical/OG/sitemap on the production origin.
6. Configure/deploy Vercel only after approval; run production smoke tests. No deployment has been made.
7. Optional: Safari/Firefox/physical-device and assistive-technology testing; resolve moderate dev-only toolchain advisories without forced breaking downgrades.

## Current runtime

Local production server (`next start`) is running on port 3000, bound to 0.0.0.0. A durable Vercel preview is available at `https://harshit-presentation-hub-preview.vercel.app`. Both use compatibility mode because Supabase env values are absent. The old E2B sandbox URL expired; the current raw E2B URL requires a traffic token. The Vercel URL was opened and verified externally.
