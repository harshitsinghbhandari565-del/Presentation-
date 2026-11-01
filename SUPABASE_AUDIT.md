# Supabase production-readiness audit

Audit date: 2026-11-01

Scope: read-only inspection of the existing implementation, connected Supabase project, and existing Vercel project. No hosted schema/data/Auth/deployment configuration was changed during this audit. No application source was changed.

## Executive status

The existing application already contains a real Supabase-backed catalog and administrator CRUD implementation. It is not a mock admin. However, the connected database has not been initialized, no administrator exists, and the deployed application has not received Supabase environment variables. The public site therefore remains in its explicitly labeled read-only compatibility mode.

**Production readiness is not yet established.** Hosted authentication, authorization, CRUD, public propagation, API-level RLS, and external document permissions still require configuration and real verification.

## Connected services observed

### Supabase

- One accessible project was returned by the connector.
- Project reference: `nypojddjzzycicfinxbv`.
- Region: `eu-north-1`.
- PostgreSQL: 17, reported version `17.11.0.011`.
- Project status: `ACTIVE_HEALTHY`.
- Auth, database, REST, pooler, Realtime, Storage and pgBouncer health checks reported healthy. Realtime is not used by this application.
- Supabase migration history: empty.
- Read-only database inspection: **zero tables and zero policies in `public`**, none of the four expected application functions, and **zero Auth users**.
- The project's display name is not a reliable product identifier. Confirm the project reference before making changes.

### Vercel

- Existing project: `harshit-presentation-hub-preview`.
- Project ID: `prj_r1xElM95Mvip4jILWhgX3yWlympi`.
- Current production deployment: `dpl_3GwDkTvZR7DbkGGUg5hjSEJMnK52`, built from implementation commit `94728bf`.
- Public origin previously opened and verified: `https://harshit-presentation-hub-preview.vercel.app`.
- Only `NEXT_PUBLIC_SITE_URL` is configured, for production and preview. Neither Supabase variable is present.
- Framework Next.js; install `npm ci`; build `npm run build`; output `.next`; configured Node version `26.x`.
- Automatic Git deployments are disabled. A new deployment must be explicitly created after configuration/code changes.
- Deployment Protection still reports `all_except_custom_domains`; the public apex alias previously served content anonymously. Recheck public and admin access after the next deployment rather than assuming the setting's effect.

## 1. Supabase client configuration

Existing files:

- `src/lib/supabase/config.ts`: reads the public URL/key, requires HTTPS, rejects `sb_secret_` keys and legacy JWTs whose role is not `anon`.
- `src/lib/supabase/public.ts`: stateless public catalog client; session persistence, refresh and URL detection disabled.
- `src/lib/supabase/server.ts`: `@supabase/ssr` server client using Next cookie `getAll`/`setAll` adapters.
- `src/lib/supabase/browser.ts`: browser SSR client used only by the administrator login form.
- `src/proxy.ts`: refreshes Auth cookies on `/admin` routes and sets `Cache-Control: private, no-store`. It deliberately does not replace page/action authorization.

The architecture is compatible with Supabase publishable keys and RLS. No application path requires a service-role key.

### Findings to address before production sign-off

1. **Browser configuration guard is inconsistent.** `browser.ts` reads environment variables directly instead of using the shared key-validation helper. No secret is currently configured or exposed, but a misconfigured `NEXT_PUBLIC_*` secret could reach browser code. Use the shared configuration boundary and enforce a deployment-time rule that only a publishable/anon key is assigned. A runtime guard is not a substitute for never putting a secret in a public variable.
2. **Cookie hardening is incomplete.** The installed SSR package defaults to `SameSite=Lax`, `HttpOnly=false`, and does not set `Secure` by default. The application does not override these defaults. Prefer server-managed login/session cookies with explicit `HttpOnly`, `Secure` in production and `SameSite=Lax`, while retaining the existing SSR architecture. Verify refresh and logout against hosted Auth.
3. **Logout result is ignored.** The server action calls `auth.signOut()` but redirects without checking its error result. CRUD actions do check database results; logout still needs failure handling and hosted verification.

## 2. Required environment variables

| Variable | Purpose | Current state |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API origin | Missing locally and in Vercel |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public client key; must be publishable or legacy anon, never secret/service-role | Missing locally and in Vercel |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/robots/sitemap origin | Configured in Vercel for production and preview; absent locally |
| `DATABASE_URL` | Optional legacy direct-PostgreSQL health check only | Absent; not needed for catalog/Auth CRUD |

For the inspected project, the API URL is `https://nypojddjzzycicfinxbv.supabase.co`. The implementation expects the exact variable name `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; setting only `NEXT_PUBLIC_SUPABASE_ANON_KEY` will not activate it.

No administrator password, service-role key, secret API key, Google API credential or Dropbox API credential belongs in the frontend. The current application does not need a server-only Supabase secret to perform authorized CRUD.

Only `.env.example` exists locally; `.env.local` is absent. Environment files are ignored except the example. No key values were read or written during this audit.

### Preview isolation decision

Do not silently point writable preview deployments at the production database. Either keep preview in compatibility mode until an isolated staging Supabase project/branch is approved, or configure preview variables against that isolated backend. The same variable names apply. A separate backend may have plan/cost implications and requires an explicit decision.

The current shared `NEXT_PUBLIC_SITE_URL` also makes preview metadata point at the production origin. Review preview-specific origin handling during Vercel configuration.

## 3. Existing migrations

Exactly one application migration exists:

`supabase/migrations/202611010001_catalog.sql`

- Version: `202611010001`.
- SHA-256: `9ea984eed7532d6cf44b986f50151717f4858ab0b57d04bf89b08f5a02e45495`.
- Explicit transaction (`begin`/`commit`).
- Creates four tables, four functions, one trigger, seven document indexes and seven RLS policies.
- Enables RLS on every application table.
- No `DROP`, `TRUNCATE`, data `DELETE`, data `UPDATE`, or replacement of existing tables/policies.
- `ON DELETE CASCADE` appears only as a future foreign-key rule from administrator membership to Auth users; it does not delete anything when the migration runs.
- Document/category foreign keys use `ON DELETE RESTRICT` to protect associations.
- Plain `CREATE` statements fail on a collision rather than overwriting an existing object. The hosted preflight found no collisions.

The safest available application method after target confirmation is the connected Supabase **transactional migration workflow**, using this exact reviewed SQL and version, followed by read-only schema verification. Do not use Drizzle push or recreate the project.

## 4. Database schema

### `public.administrators`

- `user_id uuid` primary key referencing `auth.users(id)`.
- `created_at timestamptz`.
- Membership is owner-managed. Authenticated clients receive SELECT only, restricted to their own row; no client INSERT/UPDATE/DELETE grant.

### `public.subjects` and `public.courses`

- UUID primary key, name, unique slug, creation timestamp.
- Name length and lowercase hyphenated slug constraints.
- These are the existing category model. There is no separate `categories` table.

### `public.documents`

- UUID ID and unique slug; title/description; original sharing URL and platform.
- Required subject FK; optional course FK; semester/topic/document type.
- Optional thumbnail, presentation URL and Google embed URL.
- Keyword/tag arrays, featured flag, draft/published/archived status.
- Up to five backup links in JSONB.
- Creation/update timestamps and generated `search_vector` full-text column.
- Database checks for lengths, allowed platforms/types/statuses, URL shape, array sizes and backup-array shape.
- Application validation additionally rejects credentials, IP/internal hosts and unsafe schemes, and validates individual backup entries.

Indexes cover published recent/subject/course/featured queries, full-text search, tags and admin status/update ordering. The update trigger maintains `updated_at`.

Functions:

- `is_administrator()`: restricted `SECURITY DEFINER`, fixed empty search path, returns only whether the current Auth UID has membership.
- `document_terms(text[])`: immutable helper for the generated search vector.
- `set_updated_at()`: update trigger helper.
- `get_catalog_facets()`: `SECURITY INVOKER`, aggregates published catalog facets only.

The schema matches the existing catalog adapter, admin repository, server actions and editor. The empty `src/db/schema.ts` is a retained legacy Drizzle entrypoint, not a competing application schema.

## 5. Seed file

Exactly one seed exists:

`supabase/seed.sql`

- SHA-256: `53e2de2c4377a156ec0f880449384a62376e72552a8dab2c172ba8c90d8cde5c`.
- Transactional.
- Inserts English, Class 12 and the sole existing resource, `english-lost-spring-mcqs`.
- Uses `ON CONFLICT (slug) DO NOTHING`; it never updates or replaces existing rows.
- Preserves the exact original Google Slides, presentation, embed and Dropbox backup URLs.
- Does not invent a semester, thumbnail or publication timestamp.
- Does not create an administrator, email address, password or Auth user.

The source JSON remains byte-identical to baseline:

- Git blob: `b57c75a73ba5f82a67a691acfaf986c272a3f207`.
- File SHA-256: `1a021afd9c49a2bc81d09076cee934b653282b45072b1bc483335ba3ffa0a059`.

The earlier continuity shorthand called the Git blob a hash; the values above distinguish the hash types.

## 6. Row Level Security

| Actor | Documents | Subjects/courses | Administrator membership |
| --- | --- | --- | --- |
| Anonymous | Read published only; no writes | Read; no writes | No access |
| Authenticated non-admin | Read published only; no effective writes | Read; no effective writes | Read own membership only (normally zero rows) |
| Authorized administrator | Read all statuses; insert/update/delete | Read/insert/update/delete | Read own membership only; cannot self-promote or grant membership |

There are seven policies: one membership policy, two each for subjects/courses/documents, and two document read/admin-management policies. Write grants to `authenticated` are intentionally constrained by RLS; a grant alone does not confer admin access.

The membership helper cannot enumerate other users and does not accept a target user ID. Facets are security-invoker and published-only. Draft/archived records are hidden from public queries by both application filters and RLS.

Local PGlite tests exercise these policies, but hosted PostgREST/API-role verification is still required after migration.

## 7. Administrator authentication

Already implemented:

- Email/password login through Supabase Auth.
- No student login requirement.
- No administrator registration UI or signup call.
- Server-side `auth.getUser()` validation rather than trusting a decoded client session.
- SSR cookie sessions and admin-route token refresh.
- Login, access-denied and setup states.
- Server-side logout action.

Hosted Auth currently reports:

- Email authentication enabled; phone and external OAuth providers disabled.
- Public signup **enabled** (`disable_signup: false`). This does not grant admin access, but is unnecessary for this product and should be disabled before launch.
- Site URL `http://localhost:3000`; redirect allowlist empty.
- Email confirmation required; no custom SMTP configured.
- Access-token lifetime 3,600 seconds; refresh-token rotation enabled with a 10-second reuse interval.
- Password minimum length 6; breached-password check and CAPTCHA disabled.
- TOTP MFA capability enabled, but the application has no MFA enrollment/challenge or AAL2 enforcement flow. MFA is recommended hardening, not a feature to claim as implemented.

First administrator creation must use the owner's real email and a password entered only in Supabase's dashboard. After the user exists, read its actual UUID and insert that UUID into `public.administrators` through the owner-authorized database connection. Never invent identity values or place credentials in Git/chat/frontend variables.

## 8. Administrator authorization

- `getAdminSession()` validates the Auth user and queries the caller's administrator membership.
- `requireAdministrator()` redirects unauthenticated users to login and authenticated non-admins to access-denied.
- Every private admin page and every document/category mutation calls this server-side guard.
- Database RLS independently enforces the same membership, including direct API requests.
- The proxy refreshes sessions but is not the sole security boundary.
- Permanent deletion checks the exact slug on the server, not only in the dialog.

The authorization design is sound in source and local policy tests. Hosted cookie/session behavior and direct API denial remain unverified.

## 9. Existing CRUD and public propagation

Real database operations already exist in `src/app/admin/actions.ts` and `src/lib/admin/repository.ts`:

- Create document with validated metadata and returning ID.
- Edit document, including status, feature flag and slug.
- Archive by setting `archived` and clearing featured status.
- Restore through editing publication status.
- Permanent metadata deletion after exact slug confirmation; external files are never deleted.
- Add/edit subjects and courses.
- Admin search, status filter and pagination.
- Paste original Google/Dropbox URLs with platform detection.
- Metadata/information preview and a separate original-link test action.

Category deletion is intentionally not exposed. Referenced categories are protected by foreign keys; renaming preserves associations. If unused-category deletion is desired, it needs a separate safe workflow rather than removing the protection.

The editor's Preview is explicitly an **information preview**, not a claim that the external document is embeddable. Public embedded previews remain opt-in and permission-dependent.

Mutations inspect Supabase errors/returned rows and call `revalidatePath` for landing, library, subjects, resources, sitemap and affected canonical/legacy routes. Public pages use bounded revalidation; command search is dynamic. No fake persistence was found in CRUD. Actual deployed propagation, including search/filter variants and archived/deleted URLs, must be tested.

## 10. Missing production configuration and prioritized fixes

### Activation blockers

1. Owner confirmation that project `nypojddjzzycicfinxbv` is the intended target.
2. Apply and verify the reviewed migration and idempotent seed; neither is applied.
3. Disable unnecessary public Auth signup; configure the real Site URL and appropriate redirect allowlist.
4. Create the owner-controlled Auth user and explicitly grant administrator membership.
5. Configure the two public Supabase variables in the existing Vercel production environment; decide preview isolation before enabling preview writes.
6. Deploy through the existing Vercel project and verify the complete hosted workflow and API-level RLS.
7. Owner verification of intentional Google/Dropbox sharing permissions in a signed-out browser.

### Security/operational fixes before a production-ready claim

- Route browser configuration through the shared validation boundary; never assign secrets to public variables.
- Harden session-cookie handling and logout failure reporting without replacing the architecture.
- Use a strong owner-chosen password; review session lifetime, CAPTCHA/rate limits and optional MFA.
- **Health endpoint mismatch:** `/api/health` checks only optional `DATABASE_URL`, not the Supabase catalog. After activation it would still report 503 unless an unnecessary direct database secret were added. Safest fix: make health report the actual configured catalog/Auth backend honestly, retaining compatibility-mode behavior, rather than adding a secret merely to turn the check green.
- Establish backup/restore and monitoring procedures appropriate to the actual Supabase/Vercel plans. No backup/PITR entitlement is assumed.
- Run GitHub CI and broaden browser/device/assistive-technology coverage. Existing browser verification is Chromium-only.
- Review the current Vercel Node 26 setting against the locally/CI-tested Node 22 baseline. The previous Vercel build succeeded; do not change runtime settings without a verified reason.

## Verification performed during this audit

- Read-only hosted project inventory, health, Auth configuration and migration history.
- Read-only hosted schema/policy/function/Auth-user-count inspection.
- Vercel project/environment/deployment metadata inspection; no secret values requested.
- Source review of clients, proxy, Auth, authorization, actions, editor, catalog, URL handling and health.
- `npm run test:unit`: **14/14 passed**.
- `npm run test:db`: **8/8 passed** against PGlite using the exact migration and seed.
- Original resource Git diff against baseline: unchanged.

Not yet verified: hosted migration, hosted Auth login/logout/cookies, administrator membership, real API RLS, deployed CRUD/public propagation, or external file permissions.

## First action required from the owner

Confirm that Supabase project reference `nypojddjzzycicfinxbv` is the intended database and approve applying the reviewed additive migration plus the non-overwriting original-resource seed. No dashboard action or credential sharing is needed for this confirmation. If it is not the intended project, provide the correct project reference instead; do not create another project merely to bypass this check.
