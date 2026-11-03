# Search v2 / test follow-up — 2026-11-03

- **Ordering:** v1 ends sort with title, not a unique key; ties can make pages unstable. Reconstructed v2 changed order and page membership and repeated a row between pages. Reject v2; agree tie policy with AO rather than silently changing established behavior.
- **Performance:** 4,016-row reconstructed local workload did not reproduce AK's reported large improvements; no hosted plans or latency verified. Original AK scratch harness/SQL absent. Ranking migration remains blocked.
- **Slow-GL:** neither option-rewriting software helper nor unconditional null stub exercises genuine strict-refusal. Current SwiftShader browser returned WebGL2 even with strict flag. Real refusal is unverified; controlled browser/driver follow-up needed.
- **Browser gate:** two-worker E2E run had one command-search timeout; isolated and one-worker full retries passed. Cause not established; monitor instead of claiming the first run passed. Details: `SEARCH_V2_VALIDATION.md`.

---

# Correction-round open issues — 2026-11-02

- **Search migration BLOCKED:** `202611020001_search_ranking.sql` is corrected locally but remains **unapplied**; AO must independently approve any future hosted application. Local scale `EXPLAIN` proves existing GIN predicate eligibility only with `enable_seqscan=off`; ordinary PGlite planning selected a sequential scan at 4,016 rows. Hosted Postgres plan/latency are **UNVERIFIED**. Broad negation-only/blank/taxonomy searches can scan. Missing-RPC fallback cannot search subject/course names and visibly discloses this; relevance falls back to title order. PostgreSQL `simple` has no stemming and differs from compatibility substring semantics; do not claim full parity. See `FRONTEND_CORRECTIONS.md`.
- **Dropbox embedding:** existing `embed_url` app/database validation permits only Google Docs viewer URLs, restricting Dropbox embedding. Do not weaken it without separate security/design review; Dropbox original/backup links remain supported.
- **Micro-typography:** existing styles contain many font-size declarations below 12px, including decorative text and some interface metadata. This is a legibility risk requiring targeted human/device/AT assessment, not permission to globally rewrite the pixel typography ladder.
- **Drizzle scaffold:** `src/db/schema.ts` remains empty and optional; Supabase SQL migrations remain the only active catalog schema. Do not add a second active database architecture.
- **Unverified:** real physical GPU/device/thermal and shader/shelf appearance, Safari/Firefox, AT/screen readers, physical forced-colors/200% zoom and Lighthouse/RUM. The screenshots/context-loss checks use headless software WebGL with a **test-only override** of major-caveat protection. Ambient/shelf simultaneous rendering remains a bounded but unverified performance risk.
- **Fixture limitations:** synthetic development-only browser dataset is isolated and not real content; fixture card detail destinations are not persisted. The blank-description browser fixture intentionally cannot be inserted under the existing SQL minimum-length constraint. Production `?fixture=1` is ignored; original JSON/production seed unchanged.

---

# Known issues and blockers

Updated: 2026-11-02. Baseline evidence remains in `REPOSITORY_AUDIT.md`; exact local test results are in `VERIFICATION.md`.

## External blockers (not resolved by code)

- **Supabase partially activated:** project `nypojddjzzycicfinxbv` has the reviewed schema, original resource, approved least-privilege catalog grants and the AO-approved owner membership applied and verified. Hosted Auth URL/signup/email settings and one email-confirmed owner account are verified. Interactive hosted login, cookies, deployed admin CRUD and deployed browser/API integration remain unverified because Vercel Supabase variables/deployment are approval-gated. Hosted database-role probes passed with rollback. Global Supabase default privileges remain unchanged, so future public table migrations must set explicit grants. See `SUPABASE_DATABASE_VERIFICATION.md`.
- **Administrator membership complete:** owner Auth UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a` was re-verified and inserted idempotently under AO’s consolidated directive; hosted administrator count is 1. Do not create another account or grant from an email string. The app intentionally has no default password, public signup shortcut or service-role key. See `SUPABASE_AUTH_AUDIT.md`, `ARCHITECTURE_RECONCILIATION.md` and `AO_HANDOVER.md`.
- **Vercel preview deployment:** project `harshit-presentation-hub-preview` now exists and serves the branch. It is a preview/staging URL on the hobby plan, not a custom production domain. Supabase/admin remain unconfigured.
- **Production origin:** `NEXT_PUBLIC_SITE_URL` is configured in the existing Vercel project for the public preview origin. A custom domain is optional and not configured. Preview metadata currently shares the production origin; review during activation.
- **External permissions unverified:** sandbox network restrictions prevented fetching the original Google/Dropbox destinations. Owner must confirm intentional public sharing; the app cannot guarantee ongoing availability.
- **Preview hosting:** the old E2B sandbox URL expired. The current raw E2B sandbox URL requires a traffic access token and is not a durable anonymous link. A Vercel deployment at `https://harshit-presentation-hub-preview.vercel.app` was opened and verified as the stable preview. Local production browser checks passed; direct browser TLS from the sandbox to Vercel is blocked by sandbox egress rules.

## Production audit findings

See `SUPABASE_AUDIT.md`, `SUPABASE_DATABASE_VERIFICATION.md` and `SUPABASE_AUTH_AUDIT.md`. Public signup is disabled and Auth URL/redirect settings are verified. Browser config, cookie policy, logout failure handling and administrator authorization hardening are implemented and locally verified at `b1e73b0`. Before production sign-off: make health check the actual Supabase catalog rather than only optional `DATABASE_URL`, decide preview database isolation, configure/deploy under approval, and verify hosted behavior. Keep future public table migrations least-privilege. HttpOnly/server-owned login, MFA challenge flow and CSP/HSTS remain future work. No secret is configured in a public variable.

## Product limitations kept visible

- Compatibility mode serves the single original JSON resource; it is not live persistence. The UI says the live library is being connected.
- Generated covers are decorative illustrations, not document previews. Real thumbnails are optional.
- Optional embeds are limited to Google Docs viewer URLs and load only after user action. External permissions still apply.
- Category deletion is intentionally not exposed: referenced categories are protected by foreign keys; rename/edit preserves associations.
- Related resources use a bounded candidate window, not an expensive full-catalog ranking.
- Sitemap/export reads use bounded batches; discovery pages use counts/facets/limited queries rather than loading the whole catalog.
- Automated axe checks are not full WCAG certification. Chromium only; no Safari/Firefox/physical-device or screen-reader sign-off yet.
- Full dependency audit reports moderate development-only advisories through retained Drizzle Kit/ESLint dependencies. Production audit is clean; no forced breaking downgrade was applied.
- Sandbox clones may present the baseline commit with implementation files as working-tree changes; verify remote refs and preserve work before resyncing. `ARCHITECTURE_RECONCILIATION.md` records the current branch/commit evidence.

## Baseline defects addressed and verified locally

- Build-time Google Fonts failure → local font packages; production build passes.
- Search count/result mismatch and missing description search → shared search/filter logic and real result grid; E2E passes.
- Unsafe/inconsistent external links → shared HTTP(S)-only validation, credential/internal-host rejection, `noopener noreferrer`; unit/E2E passes.
- Weak light theme/contrast and mobile badge overlap → tokenized themes and responsive layout; axe and overflow checks pass.
- Dialog focus/keyboard defects → native dialog flow with restoration; E2E passes.
- Unconfigured health import crash → optional lazy health route returns honest 503; E2E passes.
- Missing real 404/SEO → canonical routes, metadata, robots/sitemap and streaming-safe detail 404; build/E2E passes.

Do not mark an external blocker resolved without real configuration and verification evidence.


## Frontend milestone follow-ups — 2026-11-02

- Search-ranking RPC migration `202611020001_search_ranking.sql` is unapplied; hosted search uses fallback until approved.
- Optional 3D and GLSL ambient verified headlessly/fallback-only; real-device/GPU appearance and performance unverified.
- Full dependency audit still reports 20 moderate development-toolchain advisories; production audit clean.
