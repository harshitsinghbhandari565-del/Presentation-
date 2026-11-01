# Verification record

Updated: 2026-11-01. Environment: Node 22.22.3, npm 10.9.8, Next.js 16.4.3, Chromium (Playwright 1.64.1).

## Passed locally

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run test:unit` — 14 tests passed (URL safety, source preservation, search/filter/sort, URL state, validation, form conversion).
- `npm run test:db` — 8 tests passed against PGlite's real PostgreSQL/WASM engine: migration, seed, public reads, anonymous/non-admin denial, administrator membership, draft invisibility, publication/archive/delete, constraints, FK protection, full-text search and idempotent seeding.
- `npm run test:e2e` — 11 tests passed against both the local development server and the final local production server (`next start`). Covers landing, search/filter/empty states, debounced focus, mobile filter disclosure, subject/detail/legacy routes, exact original URL, 404, opt-in preview, command dialog keyboard/focus, theme/projector persistence, 320/390/768px overflow, mobile navigation, reduced motion and honest unconfigured admin/health states.
- Axe WCAG A/AA automated checks — zero violations on `/`, `/library` and the real resource detail in both dark and light themes. This is not a full accessibility certification.
- `npm run build` — passed; local fonts, no build-time Google Fonts request.
- `npm audit --omit=dev --audit-level=high` — zero production vulnerabilities.
- Production-server Chromium smoke check captured desktop dark/light and mobile landing/detail screenshots with zero uncaught page errors. Screenshots: `/home/user/audit/final-*.png` (outside the repository).
- Original `src/data/presentations.json` unchanged; original, presentation and backup URLs preserved exactly in compatibility mode and seed.

## Important limits

- PGlite tests emulate Supabase's `auth.uid()` and roles. They do **not** verify hosted Supabase Auth, network/API integration, cookies, redirect configuration or a deployed administrator account. No hosted Supabase project exists in the connected account.
- Admin editor/action source is implemented, but end-to-end persistence/auth remains unverified until the owner configures a project. Do not describe admin CRUD as production-complete.
- Full dependency audit still reports moderate development-only advisories through the retained Drizzle Kit and ESLint toolchains. No forced breaking downgrade was applied. Production audit is clean.
- External Google/Dropbox destinations were not fetched from this restricted sandbox. Their current sharing permissions/availability require owner verification.
- No Vercel project or deployment was created. `NEXT_PUBLIC_SITE_URL` is unset, so the sitemap is intentionally empty and production canonical origin is not configured.
- Browser checks used Chromium, not Safari/Firefox or physical mobile devices. Automated contrast/keyboard checks do not replace assistive-technology testing.
- Final `npm run lint && npm run typecheck && npm test && npm run build` passed after the scalability changes (bounded landing/related queries, database facet counts, paginated subject pages, batched sitemap reads).
- Arena proxy-host browser verification could not be completed from inside the sandbox (`ERR_CONNECTION_CLOSED` to the public preview URL). The server binds to 0.0.0.0 and allows the preview dev origin; the user-facing proxy still needs an external browser check.
