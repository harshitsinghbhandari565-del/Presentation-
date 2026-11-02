# AC handover — Backend Finalization

Updated: 2026-11-02
Branch: `arena/c9d0d599-presentation` (active)
Verified preservation commit: `5a61d6d5b551bf685f565f689fcfd5590c78a26c`
Prior referenced commits (`b1e73b0`, `380afc8`) are absent from this re-cloned sandbox; see reconciliation below.
Handover refresh: committed immediately after the preservation commit.

## Repository reconciliation (2026-11-02 resume)

The sandbox was re-cloned at baseline `4307a68`. Prior session commits (`b1e73b0`, `380afc8`, `a0097c7`, `4f9495a`) were not in this clone, and origin no longer had `arena/c9d0d599-presentation` (remote refs: `AC-Branch`, `arena/019fbda9-presentation`, `arena/9d055deb-presentation`, `main`). The working tree preserved the full hardened implementation. AC stayed on the active local branch, re-verified all gates, and preserved the working tree as commit `5a61d6d`. No work was discarded; `5a61d6d` is the authoritative verified commit for this clone. AK's `knowledge/frontend-intelligence` was not present and was not touched.

## Current status

Approved Auth hardening and regression tests are complete and locally verified. **Do not insert administrator membership until AO confirms the UUID with the Product Owner.** Vercel environment configuration, preview-backend isolation, and deployment remain separately approval-gated. The deployed Vercel site still serves compatibility-mode commit `94728bf`; the new hardening is not deployed.

AK's `knowledge/frontend-intelligence` branch was not touched. No frontend redesign was performed.

## Hosted Supabase state — verified read-only

Project: `nypojddjzzycicfinxbv`, region `eu-north-1`, status `ACTIVE_HEALTHY`, PostgreSQL `17.11.0.011`.

### Applied migrations (do not reapply)

| Hosted version | Name | Source |
| --- | --- | --- |
| `20261101134604` | `catalog_schema` | `supabase/migrations/202611010001_catalog.sql` |
| `20261101135344` | `original_resource_seed` | `supabase/seed.sql` |
| `20261101153928` | `least_privilege_catalog_grants` | `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` |

Database evidence: `SUPABASE_DATABASE_VERIFICATION.md`. Catalog tables: `anon` SELECT only; `authenticated` SELECT/INSERT/UPDATE/DELETE; no TRUNCATE/REFERENCES/TRIGGER/MAINTAIN. `administrators`: authenticated own-row SELECT via RLS; anon none. Counts remain 1 subject / 1 course / 1 document / 0 administrators. Original Google/Dropbox URLs unchanged. Global Supabase default privileges were intentionally not changed; future public-table migrations must include explicit least-privilege grants.

### Auth configuration

- Site URL: `https://harshit-presentation-hub-preview.vercel.app` — exact, trailing-period defect resolved.
- Redirect allow list: `https://harshit-presentation-hub-preview.vercel.app/**`.
- `disable_signup: true`; `external_email_enabled: true`.
- `mailer_autoconfirm: false`; `mailer_allow_unverified_email_sign_ins: false`.
- Refresh token rotation enabled; reuse interval 10 seconds; JWT expiry 3600 seconds.
- Phone/OAuth/SAML/anonymous providers disabled. TOTP MFA project-level enroll/verify enabled, but the app has no MFA challenge flow; do not enroll the administrator yet.

### Owner account and membership gate

- Auth users: **1**; administrator memberships: **0**.
- UUID: `978a7ac3-7385-4d3d-8b83-51855c8eb25a`.
- Provider: email; `email_confirmed_at: 2026-11-01T23:51:46.943756+00:00`.
- `deleted_at: null`; `banned_until: null`; `last_sign_in_at: null`.
- Target UUID has no administrator membership.

The Product Owner confirmed the UUID in chat, but the latest instruction requires AO to confirm it with the Product Owner before insertion. **That gate is still open.**

After AO confirmation, re-read the account and membership state, then run only:

```sql
insert into public.administrators (user_id)
values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a')
on conflict (user_id) do nothing;
```

Verify the exact row and count afterward. Never grant from an email string. Do not add wildcard `*.vercel.app` redirects.

## Implemented Auth hardening — preserved in commit 5a61d6d

### Public configuration boundary

Files: `src/lib/supabase/config.ts`, `browser.ts`.

- Browser client uses `getSupabaseConfig()` instead of reading env directly.
- Requires a clean HTTPS origin and a public key.
- Allowlist accepts `sb_publishable_…` and legacy anon JWTs; rejects secret/service-role/authenticated/role-less/malformed keys.
- JWT check is a role/format guard, not signature verification; Supabase validates tokens server-side.
- No key or provider error payload is logged.

### Cookie policy

Files: `src/lib/supabase/cookies.ts`, `browser.ts`, `server.ts`, `src/proxy.ts`.

- Shared options: `Path=/`, `SameSite=Lax`, host-only (no `Domain`).
- Production: `Secure=true`. Development: `Secure=false` so local HTTP login remains usable.
- `HttpOnly=false` intentionally: the current browser client writes login cookies. HttpOnly requires a deliberate server-owned login/refresh flow and separate approval.
- Provider expiry/refresh semantics are preserved; no fixed `maxAge` override.
- Proxy applies SSR cache headers and admin responses are `private, no-cache, no-store, must-revalidate, max-age=0` with CDN no-store.

### Logout

Files: `src/lib/admin/logout.ts`, `src/app/admin/actions.ts`, `src/app/admin/logout-error/page.tsx`.

- `revokeSession()` returns true only when the provider confirms revocation.
- Provider errors, thrown failures, or missing configuration redirect to `/admin/logout-error`.
- Recovery page states the session may still be active and offers retry; it exposes no private data and is noindex/no-store.

### Administrator authorization

Files: `src/lib/admin/authorization.ts`, `auth.ts`, admin login/access-denied pages.

- `resolveAdministratorAccess()` requires Auth-verified user plus exact UUID membership match.
- Auth/membership errors fail closed; mismatched membership cannot authorize.
- Login redirects verified administrators to `/admin`, verified non-admins to `/admin/access-denied`.
- Access-denied is dynamic, rechecks session, and no longer statically claims an anonymous visitor is signed in. Copy says access is not currently confirmed, covering lookup failures honestly.
- Server pages/actions still call `requireAdministrator()`; database RLS remains the second enforcement layer.

## Local verification — 2026-11-02 (re-run on commit 5a61d6d)

Environment: Node 22.22.3, npm 10.9.8, Next.js 16.4.3, Playwright 1.64.1, Chromium 153.0.8010.0 from the npm-hosted `@sparticuz/chromium` package (installed no-save) with AL2023 NSPR/NSS libraries extracted to `/tmp`. This is a sandbox browser provision, not an application change or a dependency addition; `package.json`/`package-lock.json` do not include it.

| Gate | Result |
| --- | --- |
| `npm ci` | passed |
| `npm run lint` | passed |
| `npm run typecheck` | passed |
| `npm run test:unit` | **33/33** |
| `npm run test:db` | **15/15** |
| `npm run build` | passed |
| `npm run check` | passed |
| Production-server E2E | **12/12** |
| Axe | zero automated WCAG A/AA violations on public pages in both themes and logout recovery at 320px |

New unit tests: `supabase-config.test.ts`, `auth-cookies.test.ts`, `admin-authorization.test.ts`, `logout.test.ts`. E2E adds unconfigured access-denied redirect and logout recovery/cache/noindex/mobile/axe checks.

Failures encountered and resolved during the re-run:

1. Fresh sandbox had no browser and Chromium could not launch: missing `libnspr4.so`. Provisioned `@sparticuz/chromium` (no-save) and extracted its bundled AL2023 NSPR/NSS libraries to `/tmp`; no app change. The earlier logout-selector fix is already in the source and did not recur.

Local production server: port 3000, bound to `0.0.0.0`, compatibility mode. This is not hosted verification.

Data preservation re-checked read-only: 1 subject / 1 course / 1 document / 0 administrators; original document fingerprint `2b7db1a601cd43a0f6a9d88556b74033`; original Google/Dropbox URLs unchanged.

## Verified vs unverified

Verified:

- Hosted Auth URL/signup/email-confirmation settings and owner account confirmation.
- Hosted schema/seed/least-privilege grants and local RLS/policy regression tests.
- Local Auth hardening behavior, unit tests, production build, and local production browser checks.

Not verified / not done:

- Administrator membership insertion (AO gate open).
- Vercel Supabase environment variables, deployment, hosted login/logout, hosted cookie flags, session persistence, deployed CRUD/archive/delete, public propagation, direct hosted API RLS.
- Preview-backend isolation decision.
- Health route still checks only optional `DATABASE_URL`, not Supabase catalog readiness.
- GitHub CI run, Safari/Firefox/physical-device/assistive-technology sign-off, external document sharing permissions, backups/monitoring.
- HttpOnly/server-owned login, MFA challenge flow, CSP/HSTS, password-policy/CAPTCHA enhancements.

## Next actions

1. AO confirms UUID with Product Owner; AC then inserts/verifies the single membership row.
2. Obtain separate approval for Vercel env values and preview isolation; use only public/publishable Supabase values, never service-role.
3. Deploy approved commit and verify the full hosted workflow on the exact Vercel origin.
4. Address health-check boundary and remaining pre-production findings before production sign-off.
5. Keep both handovers, `SUPABASE_AUTH_AUDIT.md`, `PROGRESS.md`, `VERIFICATION.md`, `KNOWN_ISSUES.md`, and related continuity docs current after each milestone.

## Restrictions

No secrets in chat/logs/commits. No administrator creation or membership without the required owner/AO workflow. No Vercel env/deploy, schema, or document-record changes without approval. No AK branch changes or frontend redesign. Preserve existing architecture, original URLs, and all prior work.
