# Current status addendum — 2026-11-03

Completed local-only search v2 evaluation; **rejected candidate**, left migration and product code unchanged. Added reproducible in-memory comparator and `SEARCH_V2_VALIDATION.md`; 28 reconstructed exact ID-set oracle cases passed but 14 page comparisons failed, plus 12/20 extra comparisons, and broad speedups were small/noisy. Current checks passed except an initial E2E timeout (isolated and serial reruns passed). Real slow-GL refusal unverified. No hosted changes; AO review pending.

---

# Development progress

Updated: 2026-11-02

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
- PGlite tests verify migration/seed, role policies and least-privilege grants locally. The exact migration/seed and approved grant remediation are applied to the confirmed hosted Supabase project; see `SUPABASE_DATABASE_VERIFICATION.md`. Hosted Auth configuration and the owner account are verified; administrator membership remains pending the AO–Product Owner UUID gate.

### Phase 6 — quality
- `npm run lint`, `npm run typecheck`: passed.
- Unit tests: 33 passed. PostgreSQL/RLS/grant tests: 15 passed.
- Playwright E2E: 12 passed against the final local production server, including logout recovery and admin redirect checks.
- Axe: zero automated WCAG A/AA violations on landing/library/detail in both themes.
- Production build: passed. Production dependency audit: zero vulnerabilities.
- Production-server Chromium screenshots inspected at desktop/mobile in both themes; zero uncaught page errors in smoke check.
- Added GitHub Actions quality workflow (not yet run on GitHub).

## Remaining external setup / verification

1. AO confirms Auth UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` with the Product Owner; AC then re-reads state and inserts/verifies only that membership.
2. Address remaining pre-production findings: honest Supabase health check and preview-backend isolation. Approved Auth config/cookie/logout/authorization hardening is complete locally.
3. Obtain separate approval, then configure the existing Vercel production environment and decide isolated preview backend configuration before enabling preview writes.
4. Deploy and verify hosted login/logout, CRUD/archive/delete, public propagation and API RLS.
5. Owner verifies original Google/Dropbox sharing permissions; review backup/monitoring procedures.
6. Run GitHub CI and broaden Safari/Firefox/physical-device/assistive-technology coverage; review moderate dev-only advisories without forced breaking downgrades.
7. Future public table migrations must include explicit least-privilege grants; global Supabase default privileges were intentionally not changed.

## Current runtime

Local production server (`next start`) is running on port 3000, bound to 0.0.0.0, at implementation commit `b1e73b0`. The durable Vercel preview at `https://harshit-presentation-hub-preview.vercel.app` still serves `94728bf`. Both use compatibility mode because Supabase env values are absent. The old E2B sandbox URL expired; the current raw E2B URL requires a traffic token. The Vercel URL was opened and verified externally.


## Production Supabase audit — 2026-11-01

- Completed a read-only source/service audit, recorded in `SUPABASE_AUDIT.md`; no hosted writes or application source changes.
- Found one healthy Supabase project (`nypojddjzzycicfinxbv`, PostgreSQL 17, eu-north-1), with empty public schema/policies/migration history and zero Auth users.
- Confirmed the existing Vercel deployment has only `NEXT_PUBLIC_SITE_URL`; Supabase URL/key are missing.
- Re-ran unit tests (14/14) and exact migration/seed PGlite policy tests (8/8).
- Verified the original resource remains byte-identical to baseline.
- Identified pre-production fixes: shared browser config validation, explicit secure/HttpOnly session handling, logout error handling, honest Supabase health reporting and preview backend isolation.
- Awaiting owner confirmation of the target project before any migration, seed or Auth configuration change.


## Hosted database application — 2026-11-01

- Owner confirmed Supabase project `nypojddjzzycicfinxbv` in `eu-north-1` and approved only the exact reviewed migration and non-overwriting seed.
- Applied exact SQL through the connector transactional migration workflow: hosted `20261101134604` (`catalog_schema`) and `20261101135344` (`original_resource_seed`). Stored SQL MD5 values matched the repository files.
- Verified 4 RLS-enabled tables, 7 policies, 29 constraints, 14 indexes, 4 functions and 1 trigger. Documents has 9 indexes including primary-key and unique-slug indexes.
- Verified final counts: 1 subject, 1 course, 1 document, 0 administrators, 0 Auth users, 0 probe rows. Original Google Slides/presentation/embed/Dropbox backup URLs matched exactly; source JSON remained unchanged.
- Rollback-only RLS probes: anonymous/non-admin reads limited to published data; unauthorized update/delete affected zero rows; unauthorized inserts were denied by RLS.
- **Blocker found:** Supabase default privileges granted `anon`/`authenticated` excessive table privileges, including `TRUNCATE`, on `subjects`, `courses` and `documents`. No grant remediation was applied without approval.
- No Auth settings, administrator accounts, Vercel environment variables or deployment configuration were changed.


## Least-privilege grant remediation — 2026-11-01

- Owner approved a separate grant-only remediation for `public.subjects`, `public.courses` and `public.documents` on Supabase `nypojddjzzycicfinxbv`.
- Added and applied `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` as hosted migration `20261101153928` (`least_privilege_catalog_grants`). Hosted stored SQL MD5 matched the repository file: `5ab711b9f3fc25303f84e5490224a848`.
- Verified effective privileges: `anon` has SELECT only; `authenticated` has SELECT/INSERT/UPDATE/DELETE; neither role has TRUNCATE, REFERENCES, TRIGGER or MAINTAIN on the three catalog tables. `postgres`/`service_role` and `administrators` privileges were unchanged.
- Verified global default ACL and RLS policy fingerprints unchanged, object counts unchanged, row counts unchanged, original document row fingerprint unchanged, and all original Google/Dropbox URLs unchanged.
- Re-ran rollback-only hosted RLS probes: anonymous catalog reads/facets/search work; anonymous writes are denied at the grant layer; authenticated non-admin writes are denied by RLS or affect zero rows; no probe rows persisted.
- Added `tests/database/least-privilege-grants.test.ts`; `npm run test:db` passed 15/15. Lint, typecheck and unit tests passed. ESLint now ignores generated Playwright/test-result artifacts.
- No administrator, Auth setting, Vercel environment variable or deployment change was made. Stopped after successful verification as requested.


## Phase 3 Auth configuration audit — 2026-11-01

- Completed a read-only Auth implementation/configuration audit in `SUPABASE_AUTH_AUDIT.md`; no application code, Auth setting, administrator account, membership, Vercel environment variable or deployment was changed.
- Confirmed hosted Auth still uses `http://localhost:3000`, has an empty redirect allow list, and allows public email/password signup. Auth users and administrator memberships remain zero.
- Confirmed the deployed production origin is `https://harshit-presentation-hub-preview.vercel.app`; the deployed admin login page still shows compatibility/setup mode because Supabase environment variables are absent.
- Documented exact dashboard actions: set Site URL and redirect allow list to the deployed origin, disable public signup while keeping Email provider enabled, then owner-create a confirmed Auth user.
- Documented safe membership rule: obtain the actual Auth UUID through the authorized Supabase workflow, confirm it with the owner, and insert only that UUID into `public.administrators`; never grant access from an email supplied in chat.
- Documented Auth hardening findings for later approved fixes: browser client config guard, explicit production cookie security, logout error handling, and deployed admin cache/session verification.
- Waiting for owner confirmation before account creation or administrator authorization.


## Phase 3 owner confirmation and Auth verification — 2026-11-02

- Owner confirmed Supabase URL configuration, public signup disabling, and administrator Auth account creation.
- AC resynchronized the local checkout to `origin/arena/c9d0d599-presentation` at `4f9495a` after finding the sandbox checkout at baseline; no work was discarded.
- Verified hosted Auth: public signup disabled, Email provider enabled, exact redirect allow pattern present, one confirmed Auth user, and zero administrator memberships.
- Found Site URL mismatch: hosted value has a trailing period (`https://harshit-presentation-hub-preview.vercel.app.`); owner must remove it.
- Identified owner-created Auth UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`; membership is pending explicit owner UUID confirmation.
- Advised owner to keep Confirm email enabled; the owner account is already confirmed.
- No membership, Auth setting, Vercel environment variable, deployment, schema, or document record was changed.


## Phase 3 Auth hardening and AO gate — 2026-11-02

- Re-verified hosted Auth: exact Site URL (trailing-period defect resolved), exact redirect pattern, signup disabled, email confirmation required, one email-confirmed owner Auth user, zero administrator memberships.
- Reported UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` and confirmation evidence to AO. Membership remains blocked until AO confirms the UUID with the Product Owner.
- Implemented approved hardening in commit `b1e73b0`: shared public-key config guard, explicit secure/same-site/host-only cookie policy, honest logout failure recovery, centralized fail-closed administrator authorization, dynamic/no-store admin states.
- Local verification: `npm ci`, `npm run check`, unit 33/33, database 15/15, production build, production-server E2E 12/12, axe clean on public pages and logout recovery.
- No membership insert, Auth setting, schema, document record, Vercel env or deployment change. AK branch/frontend redesign untouched.

## Phase 3 resume, re-verification and preservation — 2026-11-02

- Resumed on active branch `arena/c9d0d599-presentation`. Sandbox had been re-cloned at baseline `4307a68`; prior commits (`b1e73b0`, `380afc8`, `a0097c7`, `4f9495a`) were absent and the remote branch had been removed. The working tree preserved the full hardened implementation.
- Preserved the working tree as commit `5a61d6d`; no work discarded. AK's `knowledge/frontend-intelligence` was not present and was not touched. No frontend redesign.
- Re-verified hosted Auth read-only: exact Site URL `https://harshit-presentation-hub-preview.vercel.app` (trailing period resolved), redirect allow list `…/**`, `disable_signup: true`, Email provider enabled, email confirmation required, unverified sign-ins disabled.
- Verified owner account: UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`, email confirmed at `2026-11-01T23:51:46.943756+00:00`, not deleted/banned, `last_sign_in_at: null`. Auth users 1; administrators 0; target membership absent.
- Re-ran local gates on `5a61d6d`: `npm ci`, lint, typecheck, unit **33/33**, DB/RLS/grant **15/15**, production build, production-server E2E **12/12** incl. axe. Chromium provisioned no-save from `@sparticuz/chromium` with AL2023 libs; not a dependency change.
- Read-only data preservation: 1/1/1/0; original document fingerprint `2b7db1a601cd43a0f6a9d88556b74033`; original Google/Dropbox URLs unchanged.
- Reported UUID and confirmation status to AO in `AO_HANDOVER.md`. **No administrator membership inserted** — the AO–Product Owner UUID confirmation gate remains open. No Vercel env/deploy/schema/record changes.


## AO consolidated directive — architecture reconciliation and membership — 2026-11-02

- Reconciled remote refs read-only: `main`/AK baseline `4307a68`; AK pinned research `arena/9d055deb-presentation` `2f3c352`; separate frontend line `arena/019fbda9-presentation` `64abe95`; earlier AC line `AC-Branch` `cac9c7f`; active AC source `0077a01`. AK’s branch was not checked out or modified. Full table: `ARCHITECTURE_RECONCILIATION.md`.
- Confirmed the active implementation uses Supabase catalog/Auth/admin/RLS; the empty Drizzle stub remains but is not the catalog schema, and `src/db` is only the optional health scaffold.
- Re-verified hosted owner Auth and inserted only AO-approved UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` into `public.administrators` idempotently. Count 1; valid FK; repeat insert no-op; created `2026-11-02T11:55:09.431269+00:00`.
- Hosted admin/non-admin RLS and rollback-only CRUD probes passed; zero probe rows; original document fingerprint/URLs unchanged.
- Added DB membership regressions and expanded anonymous admin E2E. Local gates: lint, typecheck, unit 33/33, DB 17/17, build, production-server E2E 12/12, production dependency audit clean. Full audit retains 20 moderate dev-only advisories.
- Updated AO/AC handovers, architecture reconciliation, Auth/database audits, verification and continuity docs. No Vercel env/deploy, schema, Auth setting, document record, AK branch or unrelated user change.
- Interactive hosted owner login/session/CRUD/logout remains unverified; hosted Auth sessions 0 and owner last sign-in null. Deployment/env approval remains separate.


## Approved frontend implementation — 2026-11-02

- Verified starting HEAD `71d6fb9`, clean tree; read AO/AC handovers and AK refs read-only.
- Implemented Geist + Newsreader tokens, removed framer-motion, CSS pinned story, optional lazy Three shelf, raw-GLSL ambient + fallback, weighted search, live announcements, skeletons, editorial cards.
- Added unapplied `202611020001_search_ranking.sql` and test-fixture seed; original data/Auth/admin preserved.
- Gates: lint/typecheck/build pass; unit 35/35; DB 21/21; E2E 17/17; production audit clean. Landing initial JS 228.7 → 187.0 KB gz; shader ~1.5 KB gz lazy; Three ~128.9 KB gz lazy.

## Consolidated frontend corrections — 2026-11-02

Verified base `681800f` and parent `71d6fb9`; read the full AK independent review via `git show` without changing AK's branch. Corrected D-1–D-13, projector mode, development-only fixtures, root/admin loading and the RPC failure disclosures. Added local test and screenshot evidence; preserved original resource/production seed. MEASURED-AC: 47 unit / 26 DB, lint/typecheck/build, production Chromium 23 passed + 1 dev-only skipped, dev fixture Chromium 1 passed, production audit 0; landing 187.5 KB JS gzip. See `FRONTEND_CORRECTIONS.md` for complete commands, limitations and earlier failures. Search migration remains unapplied; no hosted/deployment changes. Pending: AK independent re-review and AO acceptance; physical GPU/device/AT checks.
