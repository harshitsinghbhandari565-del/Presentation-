# SQL Workbench audit and Phase 1 follow-up

**Historical baseline:** At the owner’s subsequent request, the fictional sample databases were removed and the workbench now starts empty. See `SQL_WORKBENCH_EMPTY_DATABASE.md` for current database behavior.

## Evidence and scope

Source reviewed against branch `arena/725e6c88-presentation` at baseline `021eab68c9299baf13943fbb8f87061cb8a27762`; `git ls-remote` matched this checkout. The deployed `/sql-workbench` was fetched successfully and reported its browser-local SQLite sandbox ready. This fetch is not a complete interactive audit of the hosted deployment. Baseline: 6 local engine tests and 5 Playwright tests against the pre-change local production build passed. Independently reviewed `engine.ts`, worker, UI, tests, Supabase authorization and migration patterns. PGlite tests use local PostgreSQL semantics, not hosted Supabase.

### Baseline audit matrix

| Area | Baseline finding |
| --- | --- |
| SQLite execution | Implemented: sql.js WASM executes statements locally; real sample, DDL and mutation tests pass. |
| Seven samples | Implemented: seven sample SQL scripts load and starter queries return rows in unit tests. Previously only two were exercised in the browser. |
| Isolation | Partial: separate pages tested and SQL does not go to the server in baseline browser test. Browser execution is not a hard memory or OS-process isolation guarantee. |
| Editor | Implemented: CodeMirror, SQLite syntax highlighting, selected text and keyboard execution. Multi-tab, formatter and history absent. |
| Completion | Implemented using actual introspected table/column metadata. Prior browser test did not verify updated custom schema suggestions. |
| Cancellation | Partial: worker termination and 10-second watchdog work, but discard all data and transactions. CPU/memory quotas are not enforced. |
| Reset, session storage | Implemented: reset reloads sample; database is volatile; draft uses sessionStorage, subject to browser policies. |
| Result limit | **Broken/unsafe semantic assumption:** execution stopped stepping after the first 501 rows. SQLite 1.16.0's INSERT RETURNING experiment still inserted all 1,000 rows, but completion and statistics must not depend on that behavior. Now the engine steps the statement to completion under the watchdog and limits retained output separately. |
| CSV/SQL downloads | Implemented; baseline tests checked CSV filename and unit-tested encoding, not browser file contents or SQL downloads. Formula prefixes alter some values. |
| Transactions/errors/stats | Partial: multi-statement errors can leave earlier statements or a transaction open; errors lacked statement number; `total_changes` includes rolled-back changes. |
| Database import/export | Missing at baseline. |
| Shared queries | Missing at baseline. No anonymous publish or storage protection could be claimed. |
| Secrets | Source review: browser configuration accepts only publishable or legacy anon Supabase keys, never a service role. `DATABASE_URL` is read in server-only `src/db/index.ts`; no service role secret reference found in `src`. This is not proof of absence of all leaked credentials in all history, deployments or third parties. |
| Other engines/AI | Not implemented. |

## Implemented in this iteration

- Up to 10 local SQL tabs, SQLite formatter, clipboard buttons, Ctrl/Command-Enter and Ctrl/Command-Shift-F, 20 recent queries with total retention cap and explicit history clearing. Browser session storage may be unavailable, full, copied into a newly opened tab by browser opener behavior, or readable by other code on the same origin; it is not a secured secret vault.
- Schema-driven autocomplete remains tied to live explorer metadata; added a browser test for a newly created table.
- Sortable retained results, page size choices and CSV/copy of the sorted retained data. Sorting is **not** a database-wide sort when output is truncated. NULL is empty in CSV; formula-like text is prefixed with an apostrophe, including negative values. CSV and SQL download contents are browser-tested.
- Better per-statement error context, explicit rollback action, row/character/cell retention caps, full stepping of statements, warning about transaction state, and the existing total-change counter described correctly. SQLite may retain an open transaction after failure; rollback is explicit, never automatic. SQLite total changes are operations, not committed rows.
- Database import and export for SQLite files up to 5 MiB. Import validates signature and `quick_check` before replacing the current database; invalid files leave it intact. Export uses SQLite backup and reports locked/open-write-transaction failures; it does not commit transactions. File validation is not a guarantee against malicious, pathological or resource-exhausting input. Do not import untrusted files or sensitive data on shared devices.
- Public library and authenticated administrator editing/publishing/history UI implemented to **fail closed if shared storage is absent**. The additive schema/RLS is in `supabase/migrations/20261112131627_sql_workbench_shared_queries.sql`, applied to the existing hosted project after owner authorization. Admin users can save drafts or explicitly publish; anonymous visitors are read-only and cannot submit, in order not to introduce unauthenticated writes without robust abuse controls; manual saving and publication are limited to administrators. Version history is admin-only and append-only, and restore creates a new draft, removing public visibility until republished. The application never automatically sends local drafts or runs shared SQL. Metadata for other dialects does not imply engine support.
- Local PostgreSQL policy tests cover anon, signed-in non-admin and admin access, private drafts and history, append-only versions and archive. Hosted metadata verifies RLS, policy definitions, no anonymous write/history access, and column-restricted access; the new tables are initially empty and the 22 existing published resources are unchanged. A real hosted end-to-end administrator moderation flow remains unverified until an administrator signs in and tests it.

## Security and limits

Statements are processed in a browser worker, with a 10-second watchdog and limits of 100 statements, 100,000 SQL characters, 500 retained rows per result, 1 million retained characters per result, 2 million characters and 100,000 cells per run. These are safeguards, **not hard CPU or memory isolation**. SQLite can allocate large intermediate values, schemas, results or imports before JavaScript can inspect them. The watchdog cannot guarantee an out-of-memory event will not crash the page or browser. Very large or infinite SELECTs now continue stepping after output is capped until complete or terminated. This preserves mutation/RETURNING semantics but can cause an otherwise capped SELECT to time out.

Public shared-query tables must never be used as SQL execution targets. Only SQL manually marked public is exposed. Private local workspaces are not uploaded. The best-effort destructive-query prompt is a usability warning, not a security control. No server-side arbitrary SQL runner, external DB credentials, new service or paid resource has been deployed.

## Verification and outstanding work

See current test commands and actual run results in the task report. Remaining work includes hosted behavioral policy tests and a moderation flow with a real administrator, rate limiting and privacy design before accepting anonymous submissions, full accessibility/cross-browser review, hard resource isolation, richer diagnostics, and any PostgreSQL/MySQL execution. The existing shared header has two previously observed accessible-name mismatches. A single browser test once failed on mobile navigation and passed on retry; it must be watched for flakiness.

### Regression and hosted schema verification

- Clean `npm run check`: 107 unit tests and 36 database tests passed, along with lint, typecheck and production build. Browser tests for the updated workbench: 13 passed against a local production build (Chromium), plus a separate shared-query transfer test passed. These include the seven sample datasets, format/tabs/history, schema completion, clipboard, sorting/CSV contents, SQL/SQLite round trip, failed transactions, concurrent sessions, cancellation, timeout and 390px layout.
- Existing public/frontend browser suites: 14 passed, one skipped, seven failed. The exact same seven `frontend.spec.ts` failures reproduced against a separately built baseline checkout (`021eab6`) with the same browser: two expect an old one-resource catalog despite the empty local compatibility catalog; others involve prior 3D chunk/projector assumptions and software-WebGL startup timing. With a 12-second wait and the same software-WebGL configuration the optional 3D shelf reached `ready` with one canvas on both baseline and updated builds. This comparison does not establish complete absence of regressions or certify hardware/device behavior.
- Hosted migration `20261112131627` added the two new tables and policies after owner authorization. Inspection found RLS enabled on both tables, four expected policies, anonymous SELECT of public SQL columns but not `created_by`, no anonymous INSERT, no anonymous version read and no authenticated direct history INSERT. New tables were empty and existing published resources remained at 22. These metadata checks and local RLS tests do not replace hosted JWT-based behavioral tests. No real admin session, visitor-submitted query, or hosted publication was exercised.
- Production dependency audit showed zero vulnerabilities; the full development dependency audit reported 12 moderate vulnerabilities (including transitive development tooling). No forced upgrades were performed.
