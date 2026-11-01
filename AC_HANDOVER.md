# AC handover — backend finalization

Updated: 2026-11-02
Workstream: AC — backend finalization
Branch: `arena/c9d0d599-presentation`
Latest commit inspected before handover creation: `af2f4997c0577975f2a346f115be42a5e50ed032`
Latest resynchronized HEAD: `4f9495a4d6bc5cbc3c7c1cbad49564e2b94cce43`
Current phase: Phase 3 — Supabase Auth and secure administrator setup
Current status: **owner confirmation received; waiting for Site URL correction and owner UUID confirmation**

## Inspection summary

AC inspected the latest available repository state on `arena/c9d0d599-presentation` and fetched remote refs. The working tree was clean before handover creation. Local HEAD was `af2f499`, which was ahead of `origin/arena/c9d0d599-presentation` by two commits at inspection time.

Required files inspected:

- `AO_HANDOVER.md`: missing before this milestone; created now.
- `AC_HANDOVER.md`: missing before this milestone; created now.
- `PROJECT_CONTEXT.md`: read.
- `PROGRESS.md`: read.
- `SUPABASE_AUTH_AUDIT.md`: read.

No AK branch was touched. No frontend redesign work was performed.

## Backend state

### Supabase

Project reference: `nypojddjzzycicfinxbv`
Region: `eu-north-1`
PostgreSQL: 17.11.0.011 at last verification

Applied hosted migrations:

| Hosted version | Name | Repository source |
| --- | --- | --- |
| `20261101134604` | `catalog_schema` | `supabase/migrations/202611010001_catalog.sql` |
| `20261101135344` | `original_resource_seed` | `supabase/seed.sql` |
| `20261101153928` | `least_privilege_catalog_grants` | `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` |

Verified database security state:

- 4 application tables: `administrators`, `subjects`, `courses`, `documents`.
- RLS enabled on all 4 tables.
- 7 RLS policies.
- Catalog table grants:
  - `anon`: SELECT only.
  - `authenticated`: SELECT/INSERT/UPDATE/DELETE.
  - Neither role has TRUNCATE, REFERENCES, TRIGGER, or MAINTAIN on catalog tables.
- `administrators` remains restricted: authenticated SELECT only, limited by RLS to the caller's own membership row.
- Global Supabase default privileges were intentionally not changed. Future public table migrations must include explicit least-privilege grants.

Verified data state at last database verification:

- 1 subject: English.
- 1 course: Class 12.
- 1 document: `english-lost-spring-mcqs`.
- 0 administrators.
- 0 Auth users.
- Original Google Slides, presentation, embed, and Dropbox backup URLs unchanged.
- Original repository JSON unchanged.

### Supabase Auth

Verified hosted Auth state on 2026-11-02 after owner confirmation:

- Public signup: disabled (`disable_signup: true`).
- Email provider: enabled (`external_email_enabled: true`).
- Redirect allow list: `https://harshit-presentation-hub-preview.vercel.app/**`.
- Email confirmation required: `mailer_autoconfirm: false`.
- Unverified email sign-ins: disabled (`mailer_allow_unverified_email_sign_ins: false`).
- Phone/OAuth/anonymous users: disabled.
- Refresh token rotation: enabled.
- Custom SMTP: not configured.
- Auth users: 1.
- Administrator memberships: 0.
- Owner-created Auth UUID: `978a7ac3-7385-4d3d-8b83-51855c8eb25a`.
- The owner-created Auth user's email is confirmed.

Unexpected difference:

- Hosted Site URL is `https://harshit-presentation-hub-preview.vercel.app.` with a trailing period.
- Required exact Site URL: `https://harshit-presentation-hub-preview.vercel.app`.

Confirm email guidance:

- Keep **Confirm email** enabled.
- The owner-created account is already confirmed, so this setting does not block the owner.
- Do not enable unverified email sign-ins.

Required owner action before membership:

1. Remove the trailing period from Supabase Site URL.
2. Explicitly confirm that UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` is the owner-created administrator account.

Do not proceed to membership authorization until both are complete.

### Vercel

Project: `harshit-presentation-hub-preview`
Project ID: `prj_r1xElM95Mvip4jILWhgX3yWlympi`
Current production deployment: `dpl_3GwDkTvZR7DbkGGUg5hjSEJMnK52`
Current production deployment commit: `94728bf`
Public production alias: `https://harshit-presentation-hub-preview.vercel.app`

Current environment:

- `NEXT_PUBLIC_SITE_URL` is configured.
- Supabase environment variables are absent.
- The deployed site remains in compatibility mode.
- Git automatic deployments are disabled.

Do not change Vercel environment variables or deploy without explicit approval.

## Approved backend hardening still to implement

After owner confirmation and UUID-confirmed membership setup, complete the approved Auth hardening work:

1. **Browser client key validation**
   - Route `src/lib/supabase/browser.ts` through the shared `getSupabaseConfig()` guard.
   - Prevent secret/service-role keys from reaching browser-capable code.

2. **Cookie security**
   - Make production cookie options explicit and consistent across browser/server/proxy clients.
   - Use `secure: true` for the HTTPS production origin.
   - Preserve compatibility with the existing Supabase SSR session flow.
   - Do not blindly set `httpOnly: true` while the browser client still writes login cookies; HttpOnly requires a deliberate server-side session-writing design.

3. **Logout error handling**
   - Inspect `signOut()` errors.
   - Do not redirect as if logout succeeded when the provider reports failure.
   - Surface an honest failure state.

4. **Authorization tests**
   - Unauthenticated visitors cannot access admin routes.
   - Authenticated non-admin users are denied.
   - Administrator membership is checked server-side by Auth UUID.
   - Server actions recheck administrator authorization.
   - Database RLS remains a second enforcement layer.

5. **Hosted verification after later approval**
   - Login.
   - Logout.
   - Session persistence/refresh.
   - Catalog reads.
   - Admin CRUD/archive/delete.
   - Public propagation.
   - Cookie flags and cache behavior.

## Membership procedure after owner confirmation

1. Re-read hosted Auth configuration.
2. Verify:
   - Site URL is the deployed HTTPS origin.
   - Redirect allow list contains the exact deployed origin pattern.
   - Public signup is disabled.
   - Email provider remains enabled.
3. Read `auth.users` through authorized Supabase access.
4. Identify the owner-created account.
5. Confirm the exact Auth UUID with the owner.
6. Only after confirmation, run a targeted membership insert:

```sql
insert into public.administrators (user_id)
values ('<confirmed-auth-user-uuid>')
on conflict (user_id) do nothing;
```

7. Verify the membership row and count.
8. Document the result.

Never grant administrator access based only on an email supplied in chat.

## Vercel environment procedure after separate approval

Only after explicit approval:

- Add `NEXT_PUBLIC_SUPABASE_URL=https://nypojddjzzycicfinxbv.supabase.co`.
- Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` using only the public/publishable/anon key.
- Preserve `NEXT_PUBLIC_SITE_URL`.
- Never add a service-role/secret key to `NEXT_PUBLIC_*` or browser code.
- Decide preview backend isolation before enabling writable preview deployments.
- Deploy only after separate deployment approval.

## Verified vs unverified

Verified:

- Hosted schema, seed, and least-privilege catalog grants.
- Original document/URL preservation.
- Local unit/database policy tests.
- Local production build and browser/E2E checks in compatibility mode.
- Auth implementation audit.
- Deployed Vercel compatibility-mode admin setup page.

Unverified:

- Hosted Auth login/logout/session behavior.
- Real administrator account authorization.
- Hosted admin CRUD persistence.
- Deployed Supabase-backed public catalog propagation.
- Production cookie flags under hosted Auth.
- External Google/Dropbox sharing permissions from the owner's perspective.
- Vercel Supabase environment configuration.

## Blocker

AC is blocked by two owner-controlled items: correcting the trailing period in Supabase Site URL and explicitly confirming Auth UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`. AC should stop and wait before membership insertion or production configuration.