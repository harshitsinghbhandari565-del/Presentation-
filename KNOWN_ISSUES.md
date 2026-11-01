# Known issues and blockers

Updated: 2026-11-01. Baseline evidence remains in `REPOSITORY_AUDIT.md`; exact local test results are in `VERIFICATION.md`.

## External blockers (not resolved by code)

- **Supabase partially configured:** project `nypojddjzzycicfinxbv` has the reviewed schema and original resource applied and verified. Auth users/administrators are still zero. Hosted Auth, cookies, admin CRUD and deployed API/RLS integration remain unverified. **Blocker:** Supabase default table privileges are broader than the reviewed design, including `TRUNCATE` on `subjects`, `courses` and `documents`; an approved least-privilege remediation is required. See `SUPABASE_DATABASE_VERIFICATION.md`.
- **No administrator identity:** owner must create the Auth user and explicitly grant membership. The app intentionally has no default password, public signup shortcut or service-role key.
- **Vercel preview deployment:** project `harshit-presentation-hub-preview` now exists and serves the branch. It is a preview/staging URL on the hobby plan, not a custom production domain. Supabase/admin remain unconfigured.
- **Production origin:** `NEXT_PUBLIC_SITE_URL` is configured in the existing Vercel project for the public preview origin. A custom domain is optional and not configured. Preview metadata currently shares the production origin; review during activation.
- **External permissions unverified:** sandbox network restrictions prevented fetching the original Google/Dropbox destinations. Owner must confirm intentional public sharing; the app cannot guarantee ongoing availability.
- **Preview hosting:** the old E2B sandbox URL expired. The current raw E2B sandbox URL requires a traffic access token and is not a durable anonymous link. A Vercel deployment at `https://harshit-presentation-hub-preview.vercel.app` was opened and verified as the stable preview. Local production browser checks passed; direct browser TLS from the sandbox to Vercel is blocked by sandbox egress rules.

## Production audit findings

See `SUPABASE_AUDIT.md` and `SUPABASE_DATABASE_VERIFICATION.md`. Before production sign-off: remediate excessive default table grants, disable unnecessary public Auth signup (it does not grant admin access), set the real Auth Site URL, harden browser config/session cookies and logout errors, and make health check the actual Supabase catalog rather than only optional `DATABASE_URL`. Decide preview database isolation before enabling writable previews. No secret is currently configured in a public variable.

## Product limitations kept visible

- Compatibility mode serves the single original JSON resource; it is not live persistence. The UI says the live library is being connected.
- Generated covers are decorative illustrations, not document previews. Real thumbnails are optional.
- Optional embeds are limited to Google Docs viewer URLs and load only after user action. External permissions still apply.
- Category deletion is intentionally not exposed: referenced categories are protected by foreign keys; rename/edit preserves associations.
- Related resources use a bounded candidate window, not an expensive full-catalog ranking.
- Sitemap/export reads use bounded batches; discovery pages use counts/facets/limited queries rather than loading the whole catalog.
- Automated axe checks are not full WCAG certification. Chromium only; no Safari/Firefox/physical-device or screen-reader sign-off yet.
- Full dependency audit reports moderate development-only advisories through retained Drizzle Kit/ESLint dependencies. Production audit is clean; no forced breaking downgrade was applied.
- Git history is grafted to one baseline commit; earlier decisions are unavailable.

## Baseline defects addressed and verified locally

- Build-time Google Fonts failure → local font packages; production build passes.
- Search count/result mismatch and missing description search → shared search/filter logic and real result grid; E2E passes.
- Unsafe/inconsistent external links → shared HTTP(S)-only validation, credential/internal-host rejection, `noopener noreferrer`; unit/E2E passes.
- Weak light theme/contrast and mobile badge overlap → tokenized themes and responsive layout; axe and overflow checks pass.
- Dialog focus/keyboard defects → native dialog flow with restoration; E2E passes.
- Unconfigured health import crash → optional lazy health route returns honest 503; E2E passes.
- Missing real 404/SEO → canonical routes, metadata, robots/sitemap and streaming-safe detail 404; build/E2E passes.

Do not mark an external blocker resolved without real configuration and verification evidence.
