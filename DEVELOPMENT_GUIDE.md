# Development guide

Updated: 2026-11-01

## Prerequisites

- Node.js 22+ and npm 10+
- Git
- Optional: Supabase project for hosted catalog/admin
- Optional: PostgreSQL `DATABASE_URL` only for the legacy health check

## Local setup

```bash
npm ci
cp .env.example .env.local   # fill only values you actually have; never commit this file
npm run dev -- --hostname 0.0.0.0 --port 3000
```

Without Supabase values the app runs in compatibility mode using the untouched original JSON resource. This is intentional and labeled in the UI. Admin shows setup instructions rather than pretending to save.

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run test:db              # PGlite PostgreSQL/WASM migration + RLS tests
npm run build
npm run start -- --hostname 0.0.0.0 --port 3000
npx playwright install chromium
npm run test:e2e             # starts/reuses local dev server by default
# To test an already-running production server instead:
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
npm run check                # lint + typecheck + unit/db tests + build
npm audit --omit=dev --audit-level=high
```

In a headless Linux environment without a bundled browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an available Chromium binary. The sandbox used `/tmp/chromium` with `LD_LIBRARY_PATH=/home/user/audit/browser-libs/lib:/tmp`; those paths are environment-specific, not project requirements.

## Supabase setup (owner approval required)

Hosted status on 2026-11-01: target `nypojddjzzycicfinxbv` (eu-north-1) was owner-confirmed. The exact catalog migration, original-resource seed and least-privilege grant remediation were applied as hosted versions `20261101134604`, `20261101135344` and `20261101153928`; do not reapply them. See `SUPABASE_DATABASE_VERIFICATION.md`.

1. Confirm the intended project and region in Supabase before any further changes. Do not recreate the project or reapply the initial migration/seed/grant remediation.
2. The initial migration `supabase/migrations/202611010001_catalog.sql` and grant remediation `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` are already applied. Any future public table migration must include explicit least-privilege `REVOKE`/`GRANT` statements and verify effective privileges afterward; global Supabase default privileges were intentionally left unchanged.
3. The seed `supabase/seed.sql` is already applied. It is idempotent and must not overwrite owner-edited metadata; do not use it to reset data.
4. In Authentication, create the owner-controlled administrator user. For this product, disable public signup unless you intentionally need it. Configure the real Site URL and allowed redirect URLs.
5. Grant membership explicitly using the user's UUID from Authentication → Users:

```sql
insert into public.administrators (user_id)
values ('<the-auth-user-uuid>')
on conflict (user_id) do nothing;
```

6. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and later in the deployment environment. Use only the public/publishable key. **Never** put a service-role/secret key in `NEXT_PUBLIC_*` or browser code.
7. Restart the app. Verify: anonymous library reads; admin login; non-admin access denial; create draft; draft invisible publicly; publish; edit; archive; restore; slug-confirmed delete; category add/edit; public revalidation.
8. Verify RLS through the real API as anonymous, authenticated non-admin and administrator. Local PGlite tests are useful but do not replace this.

## Production origin and deployment

- Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin before production build/deploy. Without it, sitemap is empty and canonical metadata falls back to localhost.
- Reuse Vercel project `harshit-presentation-hub-preview` (`prj_r1xElM95Mvip4jILWhgX3yWlympi`), already serving `https://harshit-presentation-hub-preview.vercel.app`. Preserve its install/build/output settings. Add the public Supabase variables, redeploy explicitly (Git auto-deploy is disabled), then verify routes, Auth redirects, headers, canonical/OG/sitemap and admin behavior on the actual origin. Do not enable writable previews against production data without an approved isolation decision.
- The app needs no Drive/Dropbox API credentials. It only links to original sharing URLs.

## Content and safety rules

- Do not hardcode cards in components. Use the catalog/admin workflow.
- Keep original URLs exact. Validate public HTTP(S), no credentials/internal hosts/dangerous schemes.
- Do not invent semester, dates, thumbnails or availability. Optional embeds must be Google Docs viewer URLs and remain permission-dependent.
- Archive before deleting. Permanent deletion removes metadata only and requires the exact slug.
- Do not delete referenced categories; rename them to preserve associations.

## Troubleshooting

- **Admin shows setup:** Supabase env values are absent/invalid, or a secret key was rejected. This is fail-closed behavior.
- **Anonymous write attempts fail with permission denied:** this is expected after the least-privilege grant remediation. Anonymous clients have SELECT only; authenticated non-admin writes are still blocked by RLS.
- **Access denied after login:** the Auth user lacks a row in `public.administrators`.
- **Health 503 `not_configured`:** the retained health route currently checks only optional `DATABASE_URL`, not Supabase. This is expected in compatibility mode but is a pre-production mismatch after Supabase activation; fix the health boundary rather than adding a direct database secret unnecessarily.
- **Empty sitemap:** set `NEXT_PUBLIC_SITE_URL` and rebuild.
- **External document won’t open:** check the owner’s sharing permissions in a signed-out browser; the hub cannot bypass them.
- **Hydration/HMR issues in a proxy:** use the configured preview origin; Next dev origins allow `*.e2b.app`. Local checks should use `localhost`, not an origin blocked by dev protection.

## Continuity

Update `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, this guide and `VERIFICATION.md` whenever meaningful behavior or verification status changes.
