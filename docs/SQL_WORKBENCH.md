# SQL Workbench: architecture, progress and limits

**Historical first-milestone record:** see `SQL_WORKBENCH_AUDIT.md` for the current implementation and limitations.

## Purpose and current milestone

The workbench is a section of the existing site at `/sql-workbench`, not a replacement for the resource library. This first milestone executes **real SQLite** through sql.js 1.16.0 (SQLite compiled to WebAssembly). Seven fictional sample databases, a CodeMirror SQLite editor, schema explorer, result tables, CSV export and SQL export are implemented. It has no student accounts and does not execute visitor SQL on Supabase or any server. No production database migrations or new services are required.

## Safety boundary and data lifecycle

- A dedicated Web Worker owns a fresh in-memory database per open workbench page. The SQL engine is compiled to WASM; this is not a general-purpose server sandbox. It cannot access the website's server, Supabase database or secrets. Browser storage is governed by the browser's origin and session policies.
- The current query draft is held in `sessionStorage` for that tab where available. It normally survives refresh in the same tab but not a closed session, other device or user. It is **not** centrally stored or published. Do not enter sensitive information on a shared device. Clearing browser data or private browsing restrictions may prevent recovery.
- The database, including changes and open transactions, is temporary and lost on refresh, navigation away, reset, timeout, or worker stop. Reset and sample loading ask for confirmation. SQL can be downloaded, but a modified database itself cannot yet be exported or restored.
- Work executes off the UI thread. A 10-second watchdog terminates a stuck worker; **the database is discarded** if stopped or timed out. Results are capped to the first 500 rows per result set; 50 rows per results page; at most 100 statements and 100,000 SQL characters per run. These are responsiveness measures, not hard browser CPU/memory quotas: a large SQLite operation or single huge value can exhaust device memory before the watchdog runs.
- A best-effort warning for common modifying/deleting keywords is a usability feature, **not** a SQL parser or security boundary. Earlier statements in a batch may have completed before an error. SQLite's total change counter includes changes later rolled back and trigger activity. No per-statement line/column diagnostic is claimed.
- CSV output quotes fields and prefixes spreadsheet-formula-like text with an apostrophe to reduce formula injection. This intentionally changes those exported values (including leading minus signs). Result export contains only displayed rows and represents blobs by their size.
- Only the main database's tables/views and columns are shown. SQLite syntax and features vary by the compiled SQLite version; MySQL/PostgreSQL syntax is not promised.

The copied `public/sql/sql-wasm.wasm` must match the pinned `sql.js` version. When updating sql.js, replace the WASM with `node_modules/sql.js/dist/sql-wasm.wasm`, update the bundled MIT license, and rerun browser tests. The URL is same-origin and no runtime CDN is required.

## Engineering plan

1. **Foundation / SQLite:** current milestone. Continue hardening resource limits, accessibility, editor keyboard behavior, persistent database import/export, and browser coverage. Add durable private tab workspaces only with an explicit privacy/data-loss design.
2. **Query experience:** multiple tabs, richer schema inspection, query formatting, search, safe exports and meaningful diagnostics. No fake capabilities.
3. **Shared query library:** reviewed Supabase migrations, RLS, anonymous abuse/rate-limiting strategy, moderation and explicit publish consent. Distinguish private drafts from public content. Approval before production migrations.
4. **PostgreSQL sandbox:** verify actual engine/feature coverage and test isolation, supported extensions, reset and quotas; choose browser-local or separately isolated infrastructure based on evidence. Clearly state unsupported capabilities.
5. **MySQL sandbox:** select and validate actual MySQL technology and isolation. Vercel serverless is not a persistent database host. Provisioning any independent service or paid capacity requires owner approval. Never use the site's Supabase application database for public SQL.
6. **Admin and real connections:** separate authenticated backend, network egress restrictions, least-privilege credentials, server-side secret storage, audit, read-only mode, confirmation and abuse tests. No public visitor access to administrator connections. This phase requires a dedicated security review and approval before sensitive production operations.
7. **Optional AI:** configure only with an approved provider, cost/privacy boundaries, schema disclosure consent, and explicit user action before running generated SQL. Otherwise the feature is unavailable, not simulated.
8. **Final QA and release:** browser/device, isolation, engine-specific, accessibility, abuse and deployment tests with a published report. Free public access is the goal; free-tier availability and capacity are not guaranteed.

## Reproducible tests

- `npm run check`: lint, typecheck, unit/DB tests, build.
- `npx playwright test tests/e2e/sql-workbench.spec.ts`: browser execution, sample reset, separate page isolation, errors, CSV, mobile layout, destructive warning and worker stop. A Chromium installation is required; setting `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an existing browser.
- Actual cross-browser/device testing and hard memory isolation remain open. Do not describe the entire master prompt as completed.

## Milestone verification record

For the initial SQLite milestone, `npm run check` passed (lint, typecheck, unit tests, database tests, production build). Five Playwright tests ran against a local production build with headless Chromium on desktop and a 390px viewport: real query execution and mutation, separate-page database isolation, reset and draft refresh, sample loading, errors, CSV download, mobile width, destructive warning, stop and watchdog timeout. These are targeted checks, not a comprehensive security audit or cross-browser certification. No live infrastructure or Supabase data was changed for this milestone.

An automated axe pass on the workbench's default desktop view found two remaining shared-header label/name mismatches (the brand link and search shortcut). The editor input has a label and its initial syntax colors pass that automated contrast check. This is not a complete accessibility audit; address the shared-header findings and test additional states and assistive technologies in a future pass.
