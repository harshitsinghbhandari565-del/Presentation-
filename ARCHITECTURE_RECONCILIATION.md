# Architecture reconciliation — AO consolidated directive

Updated: 2026-11-02
Repository: `harshitsinghbhandari565-del/Presentation-`
Implementation branch: `arena/c9d0d599-presentation`
Inspected implementation source commit: `0077a01c35a7d0a588d2f31dc8167f935b7c8d98` (parent of this milestone’s docs/test commit)
Method: read-only `git show`, `git ls-tree`, `git diff`, `git merge-base`, remote-ref inspection, source reads and authorized hosted Supabase read-only/rollback-only probes. AK’s branch was never checked out, modified, merged or pushed.

## Conclusion

AK’s original stack audit was accurate **for the commit it names**: `4307a6884527e22af27541cd76722867e5e6bb14`, the initial upload and current `origin/main`. That tree has an empty Drizzle schema, a `DATABASE_URL`-requiring database module, no Supabase client/Auth/admin implementation, no lockfile and no CI.

It is **not** the current AC implementation tree. The active implementation branch contains the Supabase catalog, Auth/SSR, administrator authorization, admin CRUD, migrations, tests and CI. The discrepancy is a branch/commit-scope mismatch, not a missing backend on the implementation branch and not a different repository.

There is an important nuance: AK’s later Phase 2 notes already recognized AC’s Supabase branch and explicitly recommended it as the frontend base. AK’s latest handover also records the new admin surface. Therefore the stale statement to retire is the broad present-tense claim “the application has no Supabase backend,” not AK’s historical baseline measurements or every file-level observation.

## Remote comparison

| Ref / commit | Role | Database architecture in that tree | Auth/admin status | Migration / quality status | Relevant evidence |
| --- | --- | --- | --- | --- | --- |
| `origin/main` / `4307a68` | Initial upload; AK’s named audit baseline | Raw `pg` Pool + Drizzle; `src/db/schema.ts` is `export {}`; `src/db/index.ts` throws without `DATABASE_URL`; one JSON resource | No Supabase dependency, Auth, admin routes or membership | No `supabase/`, lockfile, tests or `.github/` | `git show 4307a68:src/db/{schema,index}.ts`; `git ls-tree -r 4307a68` |
| `origin/arena/9d055deb-presentation` / `2f3c352` | AK’s actual pinned research branch, per `frontend-intelligence/AK_HANDOVER.md` | Application files still on the baseline data path; research docs added | No Supabase backend in this tree; later notes inspect AC’s refs read-only | Lockfile present; no app Supabase migration directory | `frontend-intelligence/audit/stack-audit.md`; `phase2/GITHUB_RESEARCH_GAPS.md`; merge-base with AC is `4307a68` |
| `origin/arena/019fbda9-presentation` / `64abe95` | Separate frontend-polish line | No `src/lib/supabase` files | No AC Supabase Auth/admin implementation | Lockfile present; separate design line | `git ls-tree`; do not treat as AC backend |
| `origin/AC-Branch` / `cac9c7f` | Earlier AC hardening/handover line | Same Supabase implementation as current AC source | Same five Supabase client files and admin authorization hardening | Same migrations/tests/CI | Key security files are byte-identical to `0077a01`; diff is five documentation files |
| `origin/arena/c9d0d599-presentation` / `0077a01` | Active AC implementation source before this milestone | Supabase PostgreSQL catalog + RLS; optional legacy JSON compatibility mode; Drizzle retained only for optional health check | Supabase email/password Auth, SSR cookies, proxy refresh, exact UUID membership, protected admin pages/actions | Three hosted migrations verified; lockfile, unit/DB/E2E tests and CI present | Paths below; `git diff --stat 4307a68 0077a01` = 107 files, 13,478 insertions, 1,884 deletions |

`knowledge/frontend-intelligence` was not present on origin during this inspection. AK’s own handover names `arena/9d055deb-presentation` as its pinned branch. No conclusion depends on guessing an absent ref.

## Why the empty Drizzle files do not mean “no backend”

Both observations can be true at once:

1. `src/db/schema.ts` remains an empty stub on the AC branch. The hosted catalog schema is deliberately defined in reviewed SQL migrations, not Drizzle models.
2. `src/db/index.ts` no longer throws at import time. It exposes `getHealthDatabase()` and returns `null` when optional `DATABASE_URL` is absent.
3. The only current importer of `@/db` is `src/app/api/health/route.ts`.
4. Public catalog reads go through `src/lib/catalog.ts` → `src/lib/supabase/public.ts`.
5. Admin pages/actions go through `src/lib/admin/auth.ts` → `src/lib/supabase/server.ts` → Supabase PostgREST/RLS.
6. Login uses `src/components/admin/LoginForm.tsx` → `src/lib/supabase/browser.ts` → Supabase Auth.
7. `src/proxy.ts` refreshes SSR sessions and sets private/no-store headers for admin routes.

Thus AK’s file-level observation about the Drizzle stub remains true, while the inference that the runtime lacks Supabase is false for the AC branch. The retained health route is still a known pre-production mismatch: it checks optional `DATABASE_URL`, not Supabase catalog readiness.

## Actual hosted architecture

Project: `nypojddjzzycicfinxbv`, region `eu-north-1`.

- Tables: `public.subjects`, `public.courses`, `public.documents`, `public.administrators`.
- RLS enabled on all four; seven policies; four functions; one trigger; 29 constraints; 14 indexes.
- `administrators.user_id` is the primary key and references `auth.users(id) ON DELETE CASCADE`.
- `public.is_administrator()` is a locked-search-path SECURITY DEFINER membership check used by catalog RLS.
- Catalog grants: `anon` SELECT only; `authenticated` SELECT/INSERT/UPDATE/DELETE; no TRUNCATE/REFERENCES/TRIGGER/MAINTAIN. RLS restricts writes to administrators.
- Membership grants: authenticated users may SELECT only their own row; no INSERT/UPDATE/DELETE. Membership is provisioned through the authorized administrator workflow, not self-service.
- Public signup is disabled; email confirmation is required; the owner account is email-confirmed.
- The app uses publishable/anon client credentials only. No service-role key is required or exposed.

### Applied migrations

| Hosted version | Name | Repository source | Verified MD5 |
| --- | --- | --- | --- |
| `20261101134604` | `catalog_schema` | `supabase/migrations/202611010001_catalog.sql` | `908c5e4af52cf30435b69f0d70449282` |
| `20261101135344` | `original_resource_seed` | `supabase/seed.sql` | `77838cac486d667af90e82a5e2af86dd` |
| `20261101153928` | `least_privilege_catalog_grants` | `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` | `5ab711b9f3fc25303f84e5490224a848` |

No new migration was applied for this milestone. Administrator membership is a data row in the existing table.

## Source map

| Concern | Paths |
| --- | --- |
| Schema / seed / grants | `supabase/migrations/202611010001_catalog.sql`, `supabase/seed.sql`, `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` |
| Public Supabase config/client | `src/lib/supabase/config.ts`, `public.ts`, `src/lib/catalog.ts` |
| Auth SSR / cookies / proxy | `src/lib/supabase/{browser,server,cookies}.ts`, `src/proxy.ts` |
| Administrator boundary | `src/lib/admin/{auth,authorization,logout,repository}.ts` |
| Admin UI / actions | `src/app/admin/*`, `src/components/admin/*` |
| Optional legacy health scaffold | `src/db/{index,schema}.ts`, `src/app/api/health/route.ts` |
| Regression tests / CI | `tests/unit/*`, `tests/database/*`, `tests/e2e/public.spec.ts`, `.github/workflows/ci.yml`, `package-lock.json` |
| Hosted evidence | `SUPABASE_DATABASE_VERIFICATION.md`, `SUPABASE_AUTH_AUDIT.md`, `VERIFICATION.md` |

## Approved membership result

AO’s consolidated directive records explicit Product Owner confirmation and approval for UUID `978a7ac3-7385-4d3d-8b83-51855c8eb25a`. Immediately before the write, hosted Auth contained exactly one user, that UUID was email-confirmed, not deleted/banned, and membership was absent.

Executed through the authorized Supabase connector:

```sql
insert into public.administrators (user_id)
values ('978a7ac3-7385-4d3d-8b83-51855c8eb25a')
on conflict (user_id) do nothing;
```

Result: one membership row created at `2026-11-02T11:55:09.431269+00:00`. A repeated idempotent insert left total/target counts at 1/1 and the timestamp unchanged. The foreign key resolves to the same confirmed Auth UUID. No other Auth user or membership was created.

## Verification boundary

- Hosted database-role probes verified the approved UUID as administrator, own-row membership visibility, rollback-only subject/course/document create/update/publish/archive/delete, and non-admin denial/self-grant denial. No probe rows persisted.
- Local unit/DB tests cover authorization, cookies, logout, membership idempotency/FK/self-grant denial and catalog CRUD/RLS.
- Production-server E2E covers anonymous protected-route redirects, no-store headers, honest setup state and logout-error recovery.
- **Not executed:** interactive owner-password login, hosted browser session persistence, deployed admin CRUD or deployed logout. Hosted Auth still reports zero sessions and `last_sign_in_at = null`. Vercel Supabase environment configuration and deployment remain separately approval-gated.
- Local/SQL role probes are not represented as hosted browser/Auth verification.

## Preservation and fingerprint note

Catalog counts remain 1 subject / 1 course / 1 document; administrators are now 1; Auth users remain 1. The original document’s canonical `md5(row_to_json(d)::text)` remains `2b7db1a601cd43a0f6a9d88556b74033`, its seed timestamp is unchanged, and original Google/Dropbox URLs match. A one-off `md5(row(d.*)::text)` produced a different value because composite-row serialization differs; it is not evidence of a data change.

Policy definitions were re-read and match the reviewed migration. A new canonical policy fingerprint is `bfe6b31c16f42aabeadb4b4ea6a1ca74`; it uses explicit `polcmd::text`, role names and `pg_get_expr`. It is not directly comparable to the older serialization hash `7ad85d0414c5da1c1f0420ed3d62af2c`. The seven policy definitions, RLS enablement and effective grants were verified directly rather than claiming equality between different hash formulas.
