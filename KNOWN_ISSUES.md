# Known issues and blockers

Updated: 2026-11-01. Baseline evidence remains in `REPOSITORY_AUDIT.md`; exact local test results are in `VERIFICATION.md`.

## External blockers (not resolved by code)

- **Supabase unconfigured:** connected account has no project. Migration/seed are not applied. Hosted Auth, cookies, admin CRUD and API/RLS integration are unverified. Local PGlite tests cover SQL/policies only.
- **No administrator identity:** owner must create the Auth user and explicitly grant membership. The app intentionally has no default password, public signup shortcut or service-role key.
- **No deployment:** connected Vercel account has no project. No production deployment is claimed.
- **Production origin unset:** `NEXT_PUBLIC_SITE_URL` is empty; sitemap is intentionally empty and canonical metadata falls back to localhost until configured.
- **External permissions unverified:** sandbox network restrictions prevented fetching the original Google/Dropbox destinations. Owner must confirm intentional public sharing; the app cannot guarantee ongoing availability.
- **Arena proxy check:** server binds to 0.0.0.0 and allows preview dev origins, but the public proxy URL returned `ERR_CONNECTION_CLOSED` from inside the sandbox. Local production browser checks passed; external proxy verification remains.

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
