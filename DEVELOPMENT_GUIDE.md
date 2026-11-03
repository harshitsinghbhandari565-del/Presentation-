# Local-only search v2 evaluation — 2026-11-03

After `npm ci`, run `node scripts/evaluate-search-v2.mjs` from the repo root. It creates an in-memory PGlite database and a temporary reconstructed candidate; it does not connect to Supabase or apply hosted SQL. Optional `SEARCH_V2_RESULTS=/path/to/local-results.json` saves detailed plans and comparisons. It documents a rejected optimization, not a passing regression gate. See `SEARCH_V2_VALIDATION.md` for environment, limitations, and decision.

---

# Development guide

Updated: 2026-11-02

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
4. Hosted Auth URL configuration, signup disabling and owner account creation are already verified for `nypojddjzzycicfinxbv`: Site URL `https://harshit-presentation-hub-preview.vercel.app`, redirect `https://harshit-presentation-hub-preview.vercel.app/**`, Email enabled, public signup disabled, email confirmation required. Do not recreate the account or paste passwords into chat/commits. See `SUPABASE_AUTH_AUDIT.md`.
5. The AO-approved owner membership is already provisioned for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` (hosted count 1, verified Auth FK). Do not create another account or grant. The idempotent statement below is retained for authorized verification/recovery only; re-read account/membership state first and never grant from an email string supplied in chat:

```sql
insert into public.administrators (user_id)
values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a')
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
- **Access denied after login:** the Auth user lacks a confirmed row in `public.administrators`, or membership lookup failed closed. Check the verified UUID membership row and provider health; the AO-approved owner membership is already provisioned.
- **Sign-out was not confirmed:** provider revocation failed or configuration is unavailable. Use the retry action; the session may still be active. Do not treat the redirect as successful logout.
- **Health 503 `not_configured`:** the retained health route currently checks only optional `DATABASE_URL`, not Supabase. This is expected in compatibility mode but is a pre-production mismatch after Supabase activation; fix the health boundary rather than adding a direct database secret unnecessarily.
- **Empty sitemap:** set `NEXT_PUBLIC_SITE_URL` and rebuild.
- **External document won’t open:** check the owner’s sharing permissions in a signed-out browser; the hub cannot bypass them.
- **Hydration/HMR issues in a proxy:** use the configured preview origin; Next dev origins allow `*.e2b.app`. Local checks should use `localhost`, not an origin blocked by dev protection.

## Continuity

Update `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, this guide and `VERIFICATION.md` whenever meaningful behavior or verification status changes.


## Frontend measurement and optional layers

Run `npm run measure:bundle` after `npm run build` to measure initial route JS from production HTML. The ambient shader and optional Three shelf are lazy; do not import `shelf-scene` into initial bundles. `supabase/migrations/202611020001_search_ranking.sql` and `supabase/seed.test-fixtures.sql` are local/review deliverables only until explicitly approved for hosted use.

## Frontend correction review: fixtures and measurement

Development-only visual dataset (synthetic; never production resources or hosted SQL):

```bash
npm run dev -- --hostname 0.0.0.0 --port 3001
# open /library?fixture=1 (15 published of 16 synthetic records)
# open /library?fixture=one or /library?fixture=empty for state review
REVIEW_FIXTURE_E2E=1 PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e -- tests/e2e/fixtures.spec.ts
```

The literal `NODE_ENV=development` guard precedes the server-only fixture import; the JSON is outside `public/`. Production ignores every fixture flag. Synthetic card detail links are not persisted resources. The browser-only blank description tests a layout edge case forbidden by the real database's minimum-length validation. Do not seed these records into hosted Supabase.

After `npm run build`, start/restart the production server and run:

```bash
npm run start -- --hostname 0.0.0.0 --port 3000
node scripts/measure-bundle.mjs --base-url http://localhost:3000
```

The script fetches complete production responses, including dynamic `/library`, and separately totals initial JS, CSS and their sum (gzip 9), then identifies lazy shader and Three chunks. HTML/RSC, fonts and later requests are excluded. In this sandbox `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/tmp/chromium` and `LD_LIBRARY_PATH=/tmp/al2023/lib` were needed. `PLAYWRIGHT_SOFTWARE_GL=1` enables software GL for headless tests; the successful-GL tests alone override the app-requested caveat flag in browser instrumentation. This is **not** real-GPU verification. See `FRONTEND_CORRECTIONS.md` for measured data, local SQL/GIN limitations and outstanding checks. Never apply the ranking migration to hosted Supabase without separate AO approval.
