# AO handover — architecture reconciliation and administrator membership

Updated: 2026-11-02
Workstream: AC — Backend Finalization / AO consolidated directive
Branch: `arena/c9d0d599-presentation` (active)
Implementation source inspected: `0077a01c35a7d0a588d2f31dc8167f935b7c8d98`
Milestone commit: the commit containing this handover and the added regression tests (see `PROGRESS.md` / git log for the final hash).

## Decision-ready status

**Part A complete:** the architecture discrepancy is reconciled. AK’s named baseline `4307a68` is the initial `main` upload, not the current AC implementation. The active branch has the Supabase catalog/Auth/admin backend, migrations, tests and CI. AK’s later notes already recognized this; the stale broad claim is “the application has no Supabase backend.” Full evidence and comparison table: `ARCHITECTURE_RECONCILIATION.md`.

**Part B membership complete:** AO’s consolidated directive records explicit Product Owner confirmation/approval for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`. AC re-verified the hosted account and inserted exactly that membership idempotently. Hosted administrator count is 1; target count is 1; the FK references the confirmed Auth user. No further approval is needed for this already-completed membership insertion.

**Hosted application activation remains gated:** no Vercel environment variable, deployment, Auth setting, schema migration or existing document record was changed. Interactive owner login/session/CRUD/logout on the deployed origin is not verified.

## Architecture comparison

| Tree | Commit | Backend reality | Auth/admin | Migrations / quality |
| --- | --- | --- | --- | --- |
| `main` / AK named baseline | `4307a68` | Empty Drizzle stub; raw `pg` requires `DATABASE_URL`; JSON resource | None | No Supabase dir, lockfile, tests or CI |
| AK pinned research branch | `2f3c352` on `arena/9d055deb-presentation` | Baseline app data path + research docs | No Supabase backend in that tree; later notes inspect AC refs | Lockfile; no app Supabase migrations |
| Earlier AC line | `cac9c7f` on `AC-Branch` | Supabase catalog/RLS | Hardened Auth/admin | Same migrations/tests/CI; key security files identical to current source |
| Active AC source | `0077a01` on `arena/c9d0d599-presentation` | Supabase catalog/RLS; optional JSON compatibility; Drizzle only for optional health | Supabase Auth/SSR + exact UUID membership | Three hosted migrations verified; lockfile/tests/CI |

The empty `src/db/schema.ts` still exists on AC, but the catalog schema lives in SQL migrations. `src/db/index.ts` is now lazy/optional and is imported only by the health route. Catalog/admin runtime paths use `src/lib/supabase/*` and `src/lib/admin/*`. Do not replace the working architecture based on the legacy stub.

## Membership evidence

- Target: `nypojddjzzycicfinxbv` (`eu-north-1`).
- Pre-write: one Auth user; UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`; email confirmed at `2026-11-01T23:51:46.943756+00:00`; not deleted/banned; zero memberships.
- Executed: `insert into public.administrators(user_id) values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a') on conflict (user_id) do nothing;`.
- Created: `2026-11-02T11:55:09.431269+00:00`.
- Repeat insert: total/target counts remained 1/1; timestamp unchanged.
- FK: `administrators_user_id_fkey` → `auth.users(id) ON DELETE CASCADE`; referenced user exists and is confirmed.
- Hosted role probe with the approved UUID: `is_administrator() = true`; own membership rows = 1; membership write privileges = false.
- Hosted rollback-only CRUD: subject/course/document create, edit, publish, archive and delete assertions succeeded; zero probe rows persisted.
- Hosted non-admin probe using a test-only UUID that does not exist in Auth: no membership visibility, no self-grant, no original-document update/delete; rollback left data unchanged.

## Verification actually executed

- `npm ci`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test:unit`: 33/33.
- `npm run test:db`: 17/17 after adding membership idempotency/FK and self-grant denial regressions. One initial timestamp-format assertion failed and was corrected to compare PostgreSQL text consistently; the rerun passed.
- `npm run build`: passed; admin routes dynamic.
- Production-server Playwright/Chromium E2E: 12/12, including expanded anonymous protected-route/no-store checks and axe.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities. Full audit still reports 20 moderate development-toolchain advisories; no forced breaking downgrade.
- Anonymous production-server admin routes redirect to setup/login and return private/no-store + CDN no-store headers.
- Original document fingerprint `2b7db1a601cd43a0f6a9d88556b74033`, seed timestamp and Google/Dropbox URLs unchanged. Catalog counts 1/1/1; administrators 1; Auth users 1; probe rows 0.

These are local/source and hosted database/config checks. They are **not** interactive hosted owner login or deployed CRUD verification. Hosted Auth still has zero sessions and the owner’s `last_sign_in_at` is null.

## Blockers / next actions

1. Obtain separate approval for Vercel Supabase public environment configuration and deployment; decide preview-backend isolation before enabling writable previews.
2. After approved activation, the owner performs interactive login on the actual origin. Verify session persistence/refresh, protected pages, admin CRUD/archive/confirmed delete, public propagation, logout revocation and authenticated non-admin denial in the browser/API.
3. Fix the retained health route so it checks Supabase catalog readiness rather than only optional `DATABASE_URL` before production sign-off.
4. Review CSP/HSTS, HttpOnly/server-owned login design, MFA challenge flow, external sharing permissions, backups/monitoring and broader browser/AT coverage.
5. Keep future public-table migrations explicitly least-privilege; global Supabase default privileges remain intentionally unchanged.

## Restrictions preserved

No AK branch modification/merge, frontend redesign, new Auth account, unrelated user change, schema redesign, document-record change, Vercel env change or deployment. No passwords, publishable keys, service-role keys or other secrets were requested or printed. Original URLs and existing work are preserved.

Detailed evidence: `ARCHITECTURE_RECONCILIATION.md`, `AC_HANDOVER.md`, `SUPABASE_AUTH_AUDIT.md`, `SUPABASE_DATABASE_VERIFICATION.md`, `VERIFICATION.md`.
