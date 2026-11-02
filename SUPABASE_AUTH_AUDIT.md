# Supabase Auth and administrator setup audit

Date: 2026-11-01
Phase: 3 — Supabase Auth and secure administrator setup
Target Supabase project: `nypojddjzzycicfinxbv` (`eu-north-1`)
Target deployed website: `https://harshit-presentation-hub-preview.vercel.app`

Scope: read-only audit of the existing Auth implementation, hosted Supabase Auth configuration, and deployed Vercel origin. No Supabase Auth setting, administrator account, administrator membership, database schema, document record, Vercel environment variable, or deployment was changed during this audit.

## Executive status

The application already has a real administrator authentication and authorization boundary:

- Email/password administrator login through Supabase Auth.
- Server-side `auth.getUser()` validation.
- Explicit administrator membership in `public.administrators`.
- Server-side `requireAdministrator()` checks on admin pages and server actions.
- Database RLS and least-privilege grants as a second enforcement layer.
- No service-role key is required by the application.

Current status (2026-11-02, AO consolidated directive):

- Hosted Site URL and redirect allow list are verified correct; public signup is disabled; Email provider and email confirmation are enabled.
- One owner-created Auth user exists and is email-confirmed: `978a7ac3-7385-4d3d-8b83-51855c8eb25a`.
- AO’s directive records explicit Product Owner confirmation/approval. AC re-read the account and inserted exactly that UUID into `public.administrators` idempotently; hosted administrator count is 1.
- Approved browser-config, cookie, logout and authorization hardening is implemented and locally verified.
- The deployed Vercel site still lacks Supabase environment variables and remains in compatibility mode; env/deploy approval is separate.

Do not create another Auth account or grant. Interactive hosted owner login/session/CRUD/logout remains unverified until approved activation.

## Initial hosted Supabase Auth configuration observed (2026-11-01; superseded by final verification below)

Read-only connector inspection returned:

| Setting | Current value | Assessment |
| --- | --- | --- |
| Project reference | `nypojddjzzycicfinxbv` | Confirmed target |
| Region | `eu-north-1` | Confirmed target |
| Project status | `ACTIVE_HEALTHY` | Healthy |
| Site URL | `http://localhost:3000` | Must change to deployed HTTPS origin |
| Redirect allow list | empty | Must add deployed origin redirect pattern |
| Email provider | enabled | Keep enabled for administrator password login |
| Public signup | enabled (`disable_signup: false`) | Disable for admin-only product |
| Phone provider | disabled | Keep disabled |
| External OAuth providers | disabled | Keep disabled |
| Anonymous users | disabled | Keep disabled |
| Email auto-confirm | false | Keep confirmation required unless owner-created user is explicitly auto-confirmed in dashboard |
| Secure email change | enabled | Keep enabled |
| Refresh token rotation | enabled | Keep enabled |
| Refresh token reuse interval | 10 seconds | Keep |
| JWT expiry | 3600 seconds | Acceptable default |
| Password minimum length | 6 | Owner should use a long unique passphrase; consider raising later |
| Leaked-password protection | disabled | Consider enabling later |
| CAPTCHA | disabled | Less urgent while public signup is disabled; consider later |
| TOTP MFA | project-level enroll/verify enabled | Do not enroll the admin yet unless the app implements MFA challenge handling |
| Session timebox | 0 | No absolute session limit configured |
| Session inactivity timeout | 0 | No inactivity timeout configured |
| Custom SMTP | not configured | Supabase default email sending is rate-limited; configure custom SMTP before relying on invites/recovery at production volume |
| Auth users | 0 | No administrator exists |
| Administrator memberships | 0 | No administrator exists |

No secret values were requested or exposed.

## Deployed Vercel origin observed

Read-only Vercel inspection confirmed:

- Project: `harshit-presentation-hub-preview`
- Project ID: `prj_r1xElM95Mvip4jILWhgX3yWlympi`
- Production deployment: `dpl_3GwDkTvZR7DbkGGUg5hjSEJMnK52`
- Production deployment commit: `94728bf`
- Public production alias: `https://harshit-presentation-hub-preview.vercel.app`
- The alias is verified and assigned to the production deployment.
- The only project environment variable currently present is `NEXT_PUBLIC_SITE_URL`.
- Supabase environment variables are absent.
- Git automatic deployments are disabled.

The deployed `/admin/login` page was opened externally and currently shows the honest compatibility/setup state. It does not offer fake persistence.

Do not add a wildcard `*.vercel.app` redirect pattern. That would trust unrelated Vercel deployments. Use the exact deployed origin.

## Required Supabase dashboard configuration

Perform these actions in the Supabase dashboard for project `nypojddjzzycicfinxbv`:

### 1. URL configuration

Open **Authentication → URL Configuration**.

Set:

```text
Site URL:
https://harshit-presentation-hub-preview.vercel.app
```

Add this redirect URL:

```text
https://harshit-presentation-hub-preview.vercel.app/**
```

Save.

This is the current deployed production origin. If a custom domain is added later, update Site URL and add the exact custom-domain redirect pattern before using that domain for Auth.

For local development only, a later optional addition would be:

```text
http://localhost:3000/**
```

Do not add localhost to the production allow list unless local administrator testing against this hosted project is intentionally required.

### 2. Disable public signup

Open **Authentication → Providers → Email**.

Keep the Email provider enabled, but disable public signup. Depending on the dashboard version, the control may appear as:

- turn off **Allow new users to sign up**, or
- turn on **Disable signup**, or
- disable **User Signups** under Authentication settings.

The target hosted Auth state is:

```text
external_email_enabled: true
disable_signup: true
```

This retains secure administrator email/password login while preventing arbitrary public account creation.

Keep phone, external OAuth providers, and anonymous users disabled.

### 3. Create the owner-controlled Auth account

After URL configuration and signup disabling are saved:

1. Open **Authentication → Users**.
2. Choose **Add user** → **Create new user**.
3. Enter your own administrator email address.
4. Enter a strong, unique password or passphrase directly in the Supabase dashboard.
5. If the dashboard offers **Auto Confirm User**, enable it for this owner-created account. Otherwise, complete the email confirmation flow.
6. Do not paste the password into chat, logs, commits, or environment variables.
7. Do not create additional users.

The safest account-creation path is direct owner creation in the Supabase dashboard because public signup will be disabled and the password is never handled by the application or chat.

If the dashboard only offers **Invite user**, the invite flow can be used, but custom SMTP should be configured first if reliable invite delivery is required. The current project has no custom SMTP and Supabase default email sending is rate-limited.

## Existing implementation audit

### Login

File: `src/components/admin/LoginForm.tsx`

Current behavior:

- Client component calls `client.auth.signInWithPassword()`.
- Generic error message avoids leaking whether an email exists.
- No signup call exists.
- Successful login routes to `/admin` and refreshes the router.

Assessment:

- Correct basic password login flow.
- At audit time, the browser client read environment variables directly instead of using the shared Supabase configuration guard. Fixed in `b1e73b0`: the browser client now uses `getSupabaseConfig()` and an explicit public-key allowlist.
- Login is client-side, so Supabase SSR browser cookies are JavaScript-readable by default. A stronger future hardening step would move login/session writes fully server-side if HttpOnly session cookies are required.

Applied fix (commit `b1e73b0`):

- Route `src/lib/supabase/browser.ts` through `getSupabaseConfig()` so a misconfigured secret key cannot reach browser code.
- Consider a server-action login flow only after explicit approval, because it changes the Auth flow.

### Logout

File: `src/app/admin/actions.ts`

Behavior at audit time (superseded by the applied fix below):

```ts
export async function signOut() {
  const client = await getServerClient();
  if (client) await client.auth.signOut();
  redirect("/admin/login");
}
```

Assessment:

- Logout errors are ignored.
- If Supabase sign-out fails, the user is still redirected as if logout succeeded.

Applied fix (commit `b1e73b0`):

- Inspect the `signOut()` error.
- On failure, redirect to a login/error state that honestly reports logout failure.
- Avoid claiming the session was revoked when the provider returned an error.

### SSR session handling

File: `src/lib/supabase/server.ts`

Current behavior:

- Uses `@supabase/ssr` `createServerClient()`.
- Reads cookies through Next `cookies()`.
- Writes refreshed cookies through `cookieStore.set()` when allowed.
- Catches cookie-write errors during Server Component render because refresh is handled by `src/proxy.ts`.

Assessment:

- This matches the Supabase SSR pattern.
- At audit time, cookie options were inherited from Supabase SSR defaults (`sameSite: "lax"`, `httpOnly: false`, long max-age, no explicit `secure`). Fixed in `b1e73b0` with a shared explicit cookie policy.

Applied fix (commit `b1e73b0`):

- Explicitly set production cookie options consistently across browser/server/proxy clients, especially `secure: true` on the HTTPS production origin.
- Do not blindly set `httpOnly: true` while the browser client still manages login cookies; that can break the current client-side login flow. HttpOnly requires a deliberate server-side session-writing design.

### Proxy / middleware

File: `src/proxy.ts`

Current behavior:

- Matcher: `/admin/:path*`.
- Creates a Supabase SSR server client.
- Calls `supabase.auth.getUser()` to refresh expired Auth cookies.
- Sets `Cache-Control: private, no-store` on admin responses.
- Does not make authorization decisions itself.

Assessment:

- Correct separation: proxy refreshes session; pages/actions authorize.
- The proxy should not be treated as the authorization boundary.
- The static `/admin/access-denied` page was observed with Next prerender cache headers in local compatibility mode. Fixed in `b1e73b0`: access-denied/login/logout-error are dynamic and admin responses are no-store; hosted cache behavior still requires deployed verification.

### Administrator authorization

File: `src/lib/admin/auth.ts`

Current behavior:

- `getAdminSession()` calls `client.auth.getUser()`.
- If a user exists, it queries `public.administrators` for that exact `user.id`.
- `requireAdministrator()` redirects unauthenticated users to `/admin/login`.
- Authenticated non-admin users are redirected to `/admin/access-denied`.
- Admin pages and server actions call `requireAdministrator()`.

Assessment:

- Correct fail-closed authorization design, now centralized in `src/lib/admin/authorization.ts` with exact UUID membership matching and synthetic unit tests for anonymous/non-admin/admin/error paths.
- Administrator access is not granted by email string.
- Membership is based on the authenticated Auth UUID.
- Database RLS independently restricts administrator membership reads and catalog writes.

Required rule going forward:

- Never insert an administrator membership based only on an email supplied in chat.
- Obtain the actual UUID from the authorized Supabase Auth user record.
- Confirm the UUID with the owner.
- Insert only that UUID into `public.administrators`.

### Database boundary

Current database state:

- `public.administrators` exists and is RLS-enabled.
- `authenticated` has SELECT only on `public.administrators`, restricted by RLS to the caller's own membership row.
- `anon` has no access to `public.administrators`.
- Catalog tables have least-privilege grants and RLS.
- No schema change is required for Phase 3 administrator setup.

The only expected Phase 3 data write is a single membership row:

```sql
insert into public.administrators (user_id)
values ('<confirmed-auth-user-uuid>')
on conflict (user_id) do nothing;
```

Do not run this until the owner has created the account and the UUID has been verified.

## Verification plan after owner confirmation

After the owner confirms dashboard configuration and account creation:

1. Re-read hosted Auth configuration and verify:
   - Site URL is the deployed HTTPS origin.
   - Redirect allow list contains the exact deployed origin pattern.
   - Public signup is disabled.
   - Email provider remains enabled.
2. Read `auth.users` through the authorized Supabase connector.
3. Identify the owner-created account and confirm its actual UUID with the owner. The latest instruction additionally requires AO to confirm the UUID with the Product Owner before insertion.
4. After the AO gate, re-read the account/membership state and insert only that UUID into `public.administrators`.
5. Verify membership count and exact UUID.
6. Verify unauthenticated admin access is denied.
7. Verify authenticated non-admin access is denied.
8. Verify administrator login, logout, session persistence, and server-side authorization.
9. Inspect cookie flags and logout error handling.
10. Document results and commit approved changes.

Full deployed browser/Auth verification will still require Supabase environment variables and a deployment, which are explicitly deferred. Until then, hosted Auth configuration and database authorization can be verified, but the deployed website will remain in compatibility mode.

## Post-owner-confirmation verification — 2026-11-02

The owner confirmed that URL configuration, public signup disabling, and administrator Auth account creation were completed. AC then verified hosted Auth through authorized Supabase access.

Verified:

- Public signup is disabled: `disable_signup: true`.
- Email provider remains enabled: `external_email_enabled: true`.
- Redirect allow list contains `https://harshit-presentation-hub-preview.vercel.app/**`.
- Email confirmation is required: `mailer_autoconfirm: false`.
- Unverified email sign-ins are disabled: `mailer_allow_unverified_email_sign_ins: false`.
- One Auth user exists.
- The Auth user's email is confirmed.
- Administrator memberships remain 0.
- Owner-created Auth UUID: `978a7ac3-7385-4d3d-8b83-51855c8eb25a`.

Unexpected difference:

- Hosted Site URL is `https://harshit-presentation-hub-preview.vercel.app.` with a trailing period.
- It must be corrected to `https://harshit-presentation-hub-preview.vercel.app` without the trailing period.

Confirm email setting:

- Keep **Confirm email** enabled.
- The owner-created account is already confirmed, so this setting does not block the owner.
- Do not enable unverified email sign-ins.

## Final owner dashboard verification — 2026-11-02

Authorized read-only checks now confirm:

- Exact Site URL: `https://harshit-presentation-hub-preview.vercel.app` (trailing-period mismatch resolved).
- Redirect allow list: `https://harshit-presentation-hub-preview.vercel.app/**`.
- `disable_signup: true`; `external_email_enabled: true`.
- `mailer_autoconfirm: false`; `mailer_allow_unverified_email_sign_ins: false`.
- UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` exists, uses the email provider, and has `email_confirmed_at = 2026-11-01T23:51:46.943756+00:00`.
- The account is not deleted or banned. `last_sign_in_at` is null, so application login remains unverified.
- Auth user count is 1; administrator count is 0; the target has no membership.

No credentials or API keys were requested or retrieved. No Auth setting or membership was changed by AC.

## Membership gate resolution

AO’s consolidated directive records explicit Product Owner confirmation and approval for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`. That gate is satisfied. AC re-read hosted Auth/membership state and inserted only that UUID. Vercel environment configuration and deployment remain separately approval-gated.


## Applied hardening verification — 2026-11-02

Commit `b1e73b0d7a178995e6135b3b47683a30f85c65a8` implements the approved local hardening:

- Shared browser/server/proxy config guard and public-key allowlist.
- Shared cookie options: production `Secure`, `SameSite=Lax`, `Path=/`, host-only; `HttpOnly=false` intentionally while browser-managed login remains; provider expiry preserved.
- Honest logout failure recovery at `/admin/logout-error`.
- Centralized fail-closed administrator authorization with exact UUID membership matching.
- Dynamic/no-store admin login/access-denied/logout-error states.

Local gates: `npm ci`, `npm run check` (lint, typecheck, 33 unit tests, 15 database tests, production build), and production-server Playwright E2E 12/12 with axe checks. Initial sandbox Chromium NSPR/NSS library failure was resolved locally; one ambiguous E2E alert selector was scoped. No application workaround was used for sandbox infrastructure.

These results verify source/local behavior only. Hosted login, hosted cookies, deployed CRUD and production readiness remain unverified until membership, Vercel env/deploy and hosted checks are completed under their respective approvals.


## AO-approved membership and access verification — 2026-11-02

Authorized write performed through the Supabase connector after re-verification:

```sql
insert into public.administrators (user_id)
values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a')
on conflict (user_id) do nothing;
```

Evidence:

- Pre-write: one Auth user; target UUID email-confirmed at `2026-11-01T23:51:46.943756+00:00`; not deleted/banned; zero administrator rows.
- Insert returned the target UUID with `created_at = 2026-11-02T11:55:09.431269+00:00`.
- Post-write: administrator count 1; target count 1; FK `administrators_user_id_fkey` references `auth.users(id) ON DELETE CASCADE`; referenced user exists and is confirmed.
- Repeating the idempotent insert left counts 1/1 and the creation timestamp unchanged.
- Hosted SQL role probe with the approved UUID: `auth.uid()` matched, `public.is_administrator()` true, own membership rows 1, catalog read 1, membership SELECT allowed and INSERT/UPDATE/DELETE denied.
- Hosted rollback-only CRUD assertions with the approved UUID succeeded for subject/course/document create, edit, publish, archive and delete. Zero probe rows persisted.
- Hosted non-admin probe used test-only UUID `00000000-0000-0000-0000-000000000002`, which does not exist in hosted Auth. It saw zero membership rows, could not self-grant, and could not update/delete the original document. Rollback preserved data.
- Final hosted counts: 1 subject / 1 course / 1 document / 1 administrator / 1 Auth user / 0 Auth sessions / 0 probe rows. Original document fingerprint `2b7db1a601cd43a0f6a9d88556b74033` unchanged.

Local regression coverage now includes membership idempotency/FK integrity and authenticated self-grant denial. Anonymous production-server E2E verifies protected admin routes redirect to setup/login with private/no-store and CDN no-store headers.

**Still not executed:** interactive owner-password login, hosted browser session persistence/refresh, deployed admin CRUD, deployed logout revocation and deployed non-admin browser denial. Hosted Auth reports zero sessions and the owner’s `last_sign_in_at` is null. No password or API key was requested or printed. These checks require the separately gated Vercel env/deploy activation and an interactive owner session.
