# Verification record

Updated: 2026-11-01. Environment: Node 22.22.3, npm 10.9.8, Next.js 16.4.3, Chromium (Playwright 1.64.1).

## Passed locally

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run test:unit` — 14 tests passed (URL safety, source preservation, search/filter/sort, URL state, validation, form conversion).
- `npm run test:db` — 15 tests passed against PGlite's real PostgreSQL/WASM engine: migration, seed, public reads, anonymous/non-admin denial, administrator membership, draft invisibility, publication/archive/delete, constraints, FK protection, full-text search, idempotent seeding, and least-privilege grant regression tests.
- `npm run test:e2e` — 11 tests passed against both the local development server and the final local production server (`next start`). Covers landing, search/filter/empty states, debounced focus, mobile filter disclosure, subject/detail/legacy routes, exact original URL, 404, opt-in preview, command dialog keyboard/focus, theme/projector persistence, 320/390/768px overflow, mobile navigation, reduced motion and honest unconfigured admin/health states.
- Axe WCAG A/AA automated checks — zero violations on `/`, `/library` and the real resource detail in both dark and light themes. This is not a full accessibility certification.
- `npm run build` — passed; local fonts, no build-time Google Fonts request.
- `npm audit --omit=dev --audit-level=high` — zero production vulnerabilities.
- Production-server Chromium smoke check captured desktop dark/light and mobile landing/detail screenshots with zero uncaught page errors. Screenshots: `/home/user/audit/final-*.png` (outside the repository).
- Original `src/data/presentations.json` unchanged; original, presentation and backup URLs preserved exactly in compatibility mode and seed.

## Important limits

- PGlite tests emulate Supabase's `auth.uid()` and roles. They do **not** verify hosted Supabase Auth, network/API integration, cookies, redirect configuration or a deployed administrator account. The hosted schema/seed are now applied and database-role probes were run, but hosted Auth/deployed CRUD remain unverified; historical local results are not hosted verification.
- Admin editor/action source is implemented, but end-to-end persistence/auth remains unverified until the owner configures a project. Do not describe admin CRUD as production-complete.
- Full dependency audit still reports moderate development-only advisories through the retained Drizzle Kit and ESLint toolchains. No forced breaking downgrade was applied. Production audit is clean.
- External Google/Dropbox destinations were not fetched from this restricted sandbox. Their current sharing permissions/availability require owner verification.
- Historical pre-restoration limitation, superseded below: initially no Vercel project/deployment existed and `NEXT_PUBLIC_SITE_URL` was unset. The existing Vercel project now serves the public preview with that origin configured; Supabase variables remain absent.
- Browser checks used Chromium, not Safari/Firefox or physical mobile devices. Automated contrast/keyboard checks do not replace assistive-technology testing.
- Final `npm run lint && npm run typecheck && npm test && npm run build` passed after the scalability changes (bounded landing/related queries, database facet counts, paginated subject pages, batched sitemap reads).
- Arena proxy-host browser verification could not be completed from inside the sandbox (`ERR_CONNECTION_CLOSED` to the public preview URL). The server binds to 0.0.0.0 and allows the preview dev origin; the user-facing proxy still needs an external browser check.


## Preview restoration — 2026-11-01

- Root cause: the previously supplied E2B sandbox URL belonged to sandbox `iv26ch7a04bldhw2h6vod`, which no longer exists in this session. The current sandbox is `iocv5wz1sehn0g774my6m`; its raw public URL requires an E2B traffic access token, so it is not a durable anonymous preview link.
- Preservation: all implementation changes were committed and pushed to `arena/c9d0d599-presentation` at `94728bf` before restoration. `src/data/presentations.json` hash remained `b57c75a73ba5f82a67a691acfaf986c272a3f207`, identical to baseline.
- Local restore: `npm ci`, `npm run build`, and `npm run start -- --hostname 0.0.0.0 --port 3000` succeeded. Local production E2E suite passed 11/11.
- Durable preview: deployed the same branch to Vercel project `harshit-presentation-hub-preview`. Public URL opened and verified: `https://harshit-presentation-hub-preview.vercel.app`.
- Public URL verification: landing, library, search (`q=mcqs`), empty search (`q=nonexistent`), subject page, document detail, admin setup redirect and sitemap were opened successfully through the external page-fetch tool. Interactive browser/E2E verification ran against the identical local production build because the sandbox's outbound network blocks direct browser TLS to Vercel.
- No application source code was changed to fix the infrastructure issue.


## Production Supabase audit — 2026-11-01

- Read-only hosted inspection found Supabase project `nypojddjzzycicfinxbv` healthy, with no public tables/policies/functions, no migration history and zero Auth users.
- Vercel metadata inspection confirmed the existing production deployment and only `NEXT_PUBLIC_SITE_URL`; no Supabase environment variables. No secret values were requested.
- Re-ran `npm run test:unit`: 14/14 passed; `npm run test:db`: 8/8 passed using the exact migration and seed.
- `git diff --exit-code 4307a68 -- src/data/presentations.json`: unchanged. Git blob `b57c75a73ba5f82a67a691acfaf986c272a3f207`; file SHA-256 `1a021afd9c49a2bc81d09076cee934b653282b45072b1bc483335ba3ffa0a059`.
- Full findings and safe next steps: `SUPABASE_AUDIT.md`.
- No hosted migration, seed, Auth change, environment change or deployment was performed during this audit. Hosted workflow/RLS verification remains pending.


## Hosted database verification — 2026-11-01

- Owner-approved target: Supabase `nypojddjzzycicfinxbv`, `eu-north-1`.
- Exact reviewed migration/seed applied through connector transactional migrations. Hosted versions: `20261101134604` (`catalog_schema`), `20261101135344` (`original_resource_seed`). Stored SQL MD5 matched repository file MD5.
- Verified 4 RLS-enabled tables, 7 policies, 29 constraints, 14 indexes, 4 functions, 1 trigger; documents has 9 indexes.
- Verified 1 subject, 1 course, 1 published featured document, 0 administrators, 0 Auth users, 0 probe rows. Original Google/Dropbox URLs matched exactly; repository JSON unchanged.
- Rollback-only hosted RLS probes verified anonymous/non-admin published reads, zero-row unauthorized update/delete, and RLS-denied unauthorized inserts.
- **Blocker found and later resolved:** Supabase default privileges granted excessive table privileges to `anon`/`authenticated`, including `TRUNCATE`, on `subjects`, `courses`, `documents`. The approved grant-only remediation was applied and verified; see the next section.
- Transient Supabase API 502s occurred during some probes; subsequent read-only checks confirmed health and no probe persistence. Verification-query syntax/introspection errors were corrected and did not change catalog data.
- No Auth settings, administrator accounts, Vercel environment variables or deployment configuration were changed. Full details: `SUPABASE_DATABASE_VERIFICATION.md`.


## Least-privilege grant remediation — 2026-11-01

- Owner-approved grant-only migration `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` applied to Supabase `nypojddjzzycicfinxbv` as hosted version `20261101153928` (`least_privilege_catalog_grants`). Hosted stored SQL MD5 matched the repository file: `5ab711b9f3fc25303f84e5490224a848`.
- Effective privileges verified on `subjects`, `courses`, `documents`: `anon` SELECT only; `authenticated` SELECT/INSERT/UPDATE/DELETE; neither role has TRUNCATE, REFERENCES, TRIGGER or MAINTAIN. `postgres`/`service_role` and `administrators` ACLs unchanged.
- Global public default ACL fingerprint unchanged: `062965f518df0b5fa863219c657b026a`. RLS policy fingerprint unchanged: `7ad85d0414c5da1c1f0420ed3d62af2c` (7 policies). Object counts unchanged: 4 tables / 4 functions / 1 trigger / 29 constraints / 14 indexes.
- Data unchanged: 1 subject / 1 course / 1 document / 0 administrators / 0 Auth users / 0 probe rows. Original document row fingerprint unchanged: `2b7db1a601cd43a0f6a9d88556b74033`. Original Google Slides/presentation/embed/Dropbox backup URLs verified unchanged.
- Rollback-only hosted probes: anonymous reads/facets/search passed; anonymous INSERT/UPDATE/DELETE denied with `42501 permission denied`; anonymous administrator SELECT denied; authenticated non-admin INSERT denied by RLS, UPDATE/DELETE affected 0 rows; `is_administrator()` false for both roles.
- Local gates after remediation: `npm run lint`, `npm run typecheck`, `npm run test:unit` (14/14), `npm run test:db` (15/15) passed. ESLint ignore list now excludes generated `playwright-report/` and `test-results/` artifacts.
- No administrator, Auth setting, Vercel environment variable or deployment change was made. Full details: `SUPABASE_DATABASE_VERIFICATION.md`.

## Phase 3 Auth configuration audit — 2026-11-01

- Read-only audit recorded in `SUPABASE_AUTH_AUDIT.md`; no application code, Auth setting, administrator account, membership, Vercel environment variable or deployment was changed.
- Hosted Auth observed: Site URL `http://localhost:3000`, empty redirect allow list, public signup enabled, Email provider enabled, 0 Auth users, 0 administrator memberships.
- Deployed production origin observed: `https://harshit-presentation-hub-preview.vercel.app`; deployed `/admin/login` still shows compatibility/setup mode because Supabase environment variables are absent.
- Local compatibility-mode admin routes do not expose the admin dashboard; unconfigured admin access renders the setup state and protected routes redirect away from admin content.
- Exact owner dashboard actions and UUID-only membership procedure are documented. Waiting for owner confirmation before account creation or administrator authorization.
