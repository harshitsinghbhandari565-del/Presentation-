# AK — Independent Milestone 1 security and technical review

**Project:** Harshit Presentation Hub · **Reviewer:** AK · **Date:** 2026-11-04 (Asia/Kolkata)
**Authority:** independent review only. No implementation, patch application, reconciliation, migration, deploy or
branch operation performed or authorised by AK.
**Advisory only:** only AO may make a technical acceptance recommendation to the Product Owner, and only the PO may
authorise integration.

> ## ⚠ Status: the review target is not available in this workspace — no findings are made about unseen code
>
> `MILESTONE1_FORWARD.patch` **does not exist in the sandbox, in any Git ref of this repository, or on the remote**, as
> verified in §2. I therefore cannot inspect its 14 operations, its Drizzle configuration module, its
> facet-ordering migration, or its 28 + 4 tests. Writing findings about content I have not read would be fabrication,
> and the brief forbids it ("never report an unexecuted prototype as working"; every checklist row must carry an
> honest label).
>
> What this document does instead — and what is genuinely useful when the artefact arrives:
> 1. records the absence rigorously, so AO can act on the delivery gap rather than wait on a phantom review (§2);
> 2. establishes the **verified baseline** the patch modifies — the repository's actual Drizzle setup, the actual
>    Drizzle Kit 0.31.10 behaviour, and the actual `get_catalog_facets()` function — with reproducible commands (§4);
> 3. lists the **specific failure modes** the Milestone 1 design must be tested against, including two SQL shapes that
>    are provably illegal in this database and one aggregate that does not exist — i.e. the concrete ways a
>    "name, id" facet migration and a loopback-only URL gate most often go wrong (§5–§7);
> 4. states what I will run the moment the patch is available, so the review can execute in one pass (§8, §9).
>
> **Privacy compliance (absolute prohibition honoured):** I did not inspect, print, hash, copy, test, visit or
> request the four private link values, and I ran no command that could load them. Concretely: no `.env*` file was
> opened (`.gitignore` allow-listing was checked by name only: `.env`, `.env.*`, `!.env.example`); `find` was used to
> establish that **no `.env*` file exists in this checkout at all**; I deliberately did **not** run `drizzle-kit`,
> `next dev/build/start`, or `npm run check`, because Drizzle Kit 0.31.10 bundles `dotenv@16.5.0` (verified from
> `package/bin.cjs`) and auto-loads `.env`, so in a developer environment those commands are exactly the
> "scripts that might load or expose" values the brief prohibits. This constraint is not a hypothetical: it applies to
> AC's own Milestone 1 tests, and I would have checked that they never dotenv-load (§6.5).

---

## 1. Executive assessment

* **Deliverability:** as submitted, Milestone 1 **cannot be reviewed, and therefore cannot proceed to AO's acceptance
  step**, because the artefact is absent from the review environment. This is a process defect, not an engineering one.
* **Fit of the stated scope to the repository:** the described scope is precisely what the repo needs. `main` and AC's
  tip both commit a **credential-bearing `drizzle.config.json`** (`postgresql://postgres:postgres@127.0.0.1:5432/app_db`)
  `[VERIFIED-AK]`, and AC's own `CATALOG_ORDERING_REVIEW.md:30` / `KNOWN_ISSUES.md:4` document that
  `get_catalog_facets()` sorts facet options by name only, with ties, and that changing it requires "a separately
  reviewed migration" `[VERIFIED-AK]`. So an isolated patch containing a Drizzle-config security gate plus a facet
  migration is the right *shape* of work.
* **Two facts already tell me the patch cannot be judged on its tests alone:** the local database is
  `datcollate = C` with only the deterministic `C` collation available `[VERIFIED-AK]`, and Drizzle Kit cannot read an
  environment variable from a JSON config `[VERIFIED-AK]`. If the patch keeps `drizzle.config.json`, a
  `DRIZZLE_DATABASE_URL` requirement is unenforceable by Kit; and if the facet-ordering tests rely on collation-equal
  names, they prove nothing locally. Both are §5/§6 details.
* **Verdict field:** see §10 — issued on delivery grounds, explicitly carrying no judgement of the implementation.

## 2. Complete inventory of what I actually examined

**Searched for the artefact (all negative, every command reproducible):**

| Where | Command | Result |
|---|---|---|
| Whole filesystem | `find / -xdev \( -iname "*MILESTONE1*" -o -iname "*.patch" \)` | no match |
| Home/tmp/root/workspace/mnt, depth 5 | `find … \( -iname "*milestone*" -o -iname "*.patch" -o -iname "*.diff" \)` | no match |
| Files newer than 2026-11-03 outside the repo | `find /home/user -maxdepth 3 -type f -newermt "2026-11-03 00:00"` | no match |
| All remote refs | `git ls-remote origin` | 5 branches + 1 tag; none named for a milestone; AC's branch tip `742c34a` |
| Tree of every fetched ref | `git grep -l "DRIZZLE_DATABASE_URL"` on `742c34a`, `64abe95`, `ae2d6a3`, `cac9c7f` | **0 hits in any tree** |
| GitHub | `gh pr list --state all`, `gh release list`, `gh issue list --state all` | no PRs, no issues; one release `Project` with no patch asset |
| `main` root contents | `api.github.com/…/contents/` | `README.md`, `drizzle.config.json`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `postcss.config.mjs`, `public`, `src`, `tsconfig.json` — no `supabase/`, no `tests/`, no `docs/`, no `.env.example` |

**Repo/workspace state (verified before and after this review):** branch `arena/9d055deb-presentation` @
`2944e0a7c27106e25b6982ec9c87ce1c0e9e5615` (AK's pack tip, restored after a sandbox re-provision that had reset the
worktree to `4307a68` with `frontend-intelligence/` untracked); `main` `4307a6884527e22af27541cd76722867e5e6bb14`;
AC's review branch tip `742c34aafef7ac4e899a55e5c828d3fa3bbb666e`; `AC-Branch` `cac9c7f…`; tag `Project` `ae2d6a3…`.
No checkout modification, no branch switch, no destructive Git operation; only `git fetch` + `git reset --hard` onto
**AK's own already-pushed commit** and read-only `git show`/`git grep`/`git ls-tree`.

**Baseline files actually read (the substrate the patch targets):**

| File (at `742c34a` unless noted) | Why it matters |
|---|---|
| `drizzle.config.json` (also at `main`) | the object of item A: `{dialect: postgresql, schema: ./src/db/schema.ts, dbCredentials.url: "postgresql://postgres:postgres@127.0.0.1:5432/app_db"}` |
| `package.json` | `drizzle-kit@0.31.10`, `@electric-sql/pglite@0.5.14`, `tsx@4.23.15`, `@types/pg@8.18.0`; scripts `test:unit`/`test:db` = `tsx --test tests/{unit,database}/*.test.ts`; **no `db:*`/drizzle scripts at all** |
| `supabase/migrations/202611010001_catalog.sql:99–116` | the **applied** `public.get_catalog_facets()` definition + its `revoke all … from public` / `grant execute … to anon, authenticated` pair, inside `commit` |
| `src/lib/catalog.ts` (`getFacets`, `deriveFacets`) | the RPC payload is returned **unresorted**, so DB order = UI order; `deriveFacets` already sorts `name → id ?? slug → slug` |
| `CATALOG_ORDERING_REVIEW.md:30`, `KNOWN_ISSUES.md:4`, `DECISIONS.md:3`, `FRONTEND_ACCEPTANCE_CHECKLIST.md:7` | AC's own statement that the facet tie ordering needs a separately reviewed migration — the milestone's purpose |
| `drizzle-kit-0.31.10` `package/bin.cjs` (from `registry.npmjs.org`, in `/home/user/m1`, outside the repo) | the real config/env/TLS behaviour of the pinned tool (§5.1–§5.4) |
| `.gitignore` env lines | names only, to establish what could have contained the prohibited values |

**Not examined: any line of the patch itself** — including its 14 operations, its new config module, its migration SQL
and its 32 tests. Rows A–E of AO's brief are therefore **NOT REVIEWED**, listed in §9 with the checks that will run.

## 3. Findings (severity = consequence for the eventual integration, not severity of unseen code)

### Critical
* **C-1 — Review target absent.** `MILESTONE1_FORWARD.patch` is not in the workspace, any branch, any ref, any GitHub
  object. A milestone review cannot be produced. `[VERIFIED-AK]` (search matrix in §2). Owner: AO/AC (delivery).

### High
* **H-1 — Credential-bearing Drizzle config is committed in both `main` and AC's tip.** `drizzle.config.json` embeds
  `postgres:postgres` in a tracked file. Even though it is loopback and the obvious local-dev default, it (a) puts a
  credential in Git history where any future non-loopback copy of that value becomes a live secret, and (b) is
  silently consumed by `npx drizzle-kit push` against whatever DB listens on `127.0.0.1:5432` — a *real* destructive
  path in a developer environment that also happens to run Postgres for another project. Any Milestone 1 design must
  make the *absence* of a URL a hard error, not fall back to the committed value. **This is the single most important
  property to verify in the unseen patch** — a "DRIZZLE_DATABASE_URL required" gate that merely *prefers* the env var
  and falls back to `dbCredentials.url` provides none of the intended protection. `[VERIFIED-AK baseline]`
* **H-2 — A JSON config cannot read `DRIZZLE_DATABASE_URL`.** Verified from the pinned tool: `bin.cjs` resolves the
  default config as `drizzle.config.ts` → else `drizzle.config.js` → else the literal `"drizzle.config.json"`, then
  `drizzleConfigFromFile` → `preparePushConfig` → `flattenDatabaseCredentials`; there is **no `process.env.DATABASE_URL`
  handling anywhere in `bin.cjs`** (grep returned 0 matches) and no interpolation for JSON. So unless the patch
  introduces a `drizzle.config.ts`/`.js` (or a wrapper that materialises a config), "explicit `DRIZZLE_DATABASE_URL`
  requirement" is unimplementable and any test asserting it can only be testing the patch's *own* module, not the
  workflow Drizzle Kit performs. `[VERIFIED-AK]` → see §6.1 for the false-assurance risk this creates.
* **H-3 — `get_catalog_facets()` cannot simply gain an `id` key in four of its aggregates.** Measured on this very
  schema in PGlite: `jsonb_agg(distinct d.topic order by d.topic, d.id)` →
  **`42P10 in an aggregate with DISTINCT, ORDER BY expressions must appear in argument list`**, likewise for
  `order by d.id` alone. The `semesters`, `topics`, `types`, `platforms` aggregates in `202611010001_catalog.sql:105–109`
  are all `jsonb_agg(distinct …)`; only `subjects`/`courses` can take `order by s.name, s.id` directly (verified OK).
  The legal shapes are a `distinct on (col) … order by col, id` subselect (verified OK) or `group by` + a min/max
  **on a sortable projection** — and note `min(uuid)` **does not exist** in this server
  (`42883 function min(uuid) does not exist`, verified), so a `min(id)` "fix" is itself a build-breaker. `[VERIFIED-AK]`

### Medium
* **M-1 — Local tests cannot demonstrate the tie the migration exists to fix, if they rely on collation.** PGlite
  0.5.14 here is `PostgreSQL 18.6`, `datcollate = C`, `datlocprovider = c`, and `pg_collation` offers only `C` with
  `collisdeterministic = true` `[VERIFIED-AK]`. Under `C`, `order by name` ties only on **byte-identical** names;
  hosted Supabase databases commonly use a non-deterministic libc/ICU collation where *distinct* names compare equal —
  the case the added `id` key also resolves. Consequence: a facet-ordering test is meaningful only if the fixture has
  literally duplicate names (e.g. two `subjects` named `Mathematics`); anything subtler silently passes for the wrong
  reason, and the hosted-side benefit stays `[UNVERIFIABLE-LOCAL]`.
* **M-2 — `create or replace function` preserves ACL and owner; `drop` + `create` does not.** If the migration's
  "complete SQL replacement" uses `create or replace`, the `revoke all` / `grant execute to anon, authenticated` lines
  at `:113–114` remain in force but must still be *re-asserted* for idempotency and to survive a future signature
  change; if it uses `drop function` + `create function`, the function identity changes and **grants are lost**,
  silently returning `42883`/permission errors for `anon` in production until someone notices. The exact ACL wording is
  a primary item-B check. `[INFERRED from the applied file's shape; must be confirmed against the patch]`
* **M-3 — The patch cannot land on `main` as-is.** `main` contains **no `supabase/`, no `tests/`, no `src/lib/`**
  (only 9 root entries, §2). A migration that ALTERs a function created by
  `supabase/migrations/202611010001_catalog.sql`, plus tests that import `src/lib/catalog.ts`, are only coherent on top
  of AC's branch line. "Suitability for eventual reconciliation" therefore depends entirely on the base commit the
  patch declares; a patch built against `742c34a` will not apply to `main`, and reconciliation must be a branch merge,
  not a raw `git apply`. `[VERIFIED-AK]`
* **M-4 — Drizzle Kit honours `TEST_CONFIG_PATH_PREFIX`.** `drizzleConfigFromFile` reads
  `process.env.TEST_CONFIG_PATH_PREFIX` and joins it to the config path `bin.cjs` `[VERIFIED-AK]`. An env-var-controlled
  config directory is an extra attack/poisoning surface in CI, and it also means "reject ambient `PG*`" is not
  sufficient as an environment hygiene rule: `NODE_OPTIONS`, `DOTENV_KEY` (dotenv is bundled and reads it — visible in
  `bin.cjs`) and this prefix are all in scope for a genuine hardening story. `[VERIFIED-AK baseline]`

### Low
* **L-1 — No `db:*` npm scripts exist**, so every Drizzle workflow is a hand-run `npx drizzle-kit …`. A gate that
  lives only in a TS/JS config is bypassed by anyone who passes `--config` or sets a different path; the gate must be
  in code the wrapper *and* the tests share. `[VERIFIED-AK]`
* **L-2 — Facet order is UI order.** `getFacets` returns `data as CatalogFacets` with no client-side sort
  `[VERIFIED-AK]`, so the migration changes visible select-box ordering; conversely `deriveFacets` (compat/fixture
  mode) sorts `name → id ?? slug → slug` in JS with `localeCompare` `[VERIFIED-AK]` — after the migration, SQL order
  (deterministic collation on hosted) and JS order (ICU) can still disagree for accented/punctuation names. That
  parity gap is a *design* consequence of the milestone and should be documented by it, not fixed by a silent
  re-sort (AC already reasoned this way in `CATALOG_ORDERING_REVIEW.md:30`).
* **L-3 — `@types/pg` is present while `src/db/schema.ts` is `export {}`** (per the pack's earlier audit of `main`), so
  the "explicit driver connection properties" item has no application-side driver to govern yet; a config-only gate
  protects `drizzle-kit` but not a future `node-postgres` path. `[VERIFIED-AK baseline; AC-branch state]`

### Informational
* **I-1 — AC's documentation is consistent with the intended milestone.** The tip's handovers state the facet tie
  problem as gated, state `V1` as "byte-identical and unapplied", and record AO's decisions (accept V1, reject v2,
  approve ID tie-breaks, defer narrow-fetch) — nothing in AC's docs claims a Drizzle config change, so the patch is
  genuinely *new* work rather than something already reviewed. `[VERIFIED-SHARED]`
* **I-2 — The repository's own Drizzle config predates this milestone**, so H-1 should not be attributed to AC's
  Milestone 1; it is inherited from `main`. `[VERIFIED-AK]`

## 4. Reproducible commands (all read-only; nothing in the checkout was modified)

```bash
# artefact absence
find / -xdev \( -iname "*MILESTONE1*" -o -iname "*.patch" \) 2>/dev/null
git ls-remote origin
for r in 742c34a 64abe95 ae2d6a3 cac9c7f; do git grep -l "DRIZZLE_DATABASE_URL" $r; done   # → no output

# baseline Drizzle config + scripts
git show 742c34a:drizzle.config.json
git show 742c34a:package.json | python3 -m json.tool

# Drizzle Kit behaviour (downloaded outside the repo, into /home/user/m1)
npm pack drizzle-kit@0.31.10 && tar -xzf drizzle-kit-0.31.10.tgz
grep -c "process.env.DATABASE_URL" package/bin.cjs                      # 0
grep -o "drizzle.config.\(ts\|js\|json\)" package/bin.cjs | sort -u      # ts, js, json
grep -o "TEST_CONFIG_PATH_PREFIX" package/bin.cjs | head -1
grep -o "dotenv@16.5.0" package/bin.cjs | head -1

# facet SQL facts (in-memory PGlite over the applied migrations; no .env, no network, nothing applied anywhere)
psql-equivalent: select jsonb_agg(distinct d.topic order by d.topic, d.id) …        # 42P10
                 select min(id) from public.subjects                                 # 42883 no min(uuid)
                 select distinct on (topic) topic, id … order by topic, id           # OK
                 select datcollate, datlocprovider from pg_database …                # C, c
```

## 5. Security attack scenarios for the *described* design (the matrix I will run)

For a loopback-only, env-gated Drizzle URL loader, these are the cases that actually break such code. Each is
checkable in one test; I list them as **required evidence**, not as claims about the unseen patch.

1. **Host-shape bypasses of "loopback only":** `0.0.0.0` (as a *destination* on Linux means localhost and must be
   rejected, not accepted), `::` likewise; `2130706433`, `0x7f000001`, `0177.0.0.1`, `127.1`, `127.0.1` (shorthand/octal/hex
   IPv4 forms that `new URL()` will happily keep as a non-`localhost` hostname); `[::1]` vs `::1` (bracket handling);
   `127.0.0.1.evil.example` DNS-suffix tricks; `localhost.localdomain`; trailing dot; `LOCALHOST`/`LocalHost` case;
   `;`, `,`, `?`, `#`, `%2f`, backslash and userinfo tricks that make the parsed `hostname` differ from the driver's
   (`@` in the user part is the classic); a URL with two `@`s where `URL.hostname` is the last one.
2. **Unix sockets:** `postgresql:///db?host=/tmp` or `postgres://?host=%2Fvar%2Frun%2Fpostgresql` — no host at all,
   yet a *filesystem path* the driver treats as the socket directory. A loopback check keyed on hostname must not
   accept "empty host" by default, and must decide explicitly whether sockets are permitted.
3. **Env-hygiene bypasses:** rejecting `PG*` case-insensitively is right but incomplete — `PGHOST`/`PGPASSWORD` are the
   obvious ones; a `libpq`-driven path also reads `PGPASSFILE`, `PGSERVICEFILE`, `PGDATA`, `PGSSLMODE`, and `postgres`
   accepts `options=`. Also: is rejection done on the *snapshot* taken at import time (so a test mutating
   `process.env` afterwards bypasses it), and does the check run for **every** entry point (Kit config, wrapper script,
   tests) rather than only one module?
4. **`DATABASE_URL` separation:** the guarantee to verify is *directional* — `DRIZZLE_DATABASE_URL` must not be a
   fallback *from* `DATABASE_URL`, and a hostile/ambient `DATABASE_URL` (Supabase ships one in some setups) must not
   silently become the migration target. Given H-2, this must be enforced in code, not JSON.
5. **Canonical encoding:** what exactly is compared after parsing — if the code canonicalises for the *check* but
   hands the **original string** to the driver, the check is decorative (a `.invalid`/redirect-free example is
   `postgresql://x@localhost.:5432/db`). Also whether percent-encoded characters survive the round trip identically
   (`pct-encode → decode → encode` differs for `!`, `$`, `&`, `'`).
6. **Redaction:** the two real leaks are (a) a *nested* cause (`AggregateError.cause[0].message` from `node-postgres`
   embeds the connection string, and if the code redacts only the top-level message the secret escapes) and (b)
   redaction by replacing a literal password substring that differs after normalisation (e.g. a percent-encoded
   password in the URL vs the decoded one in the driver's message). A test must assert the *whole* error object tree,
   `JSON.stringify(err)`, not `err.message` — and must use a password that is distinguishable from its own encoding.
7. **TLS/local-only assumption:** `ssl`/`sslmode` appears **nowhere** in `bin.cjs` (verified: 0 matches), so Drizzle Kit
   passes the URL to the driver and the default is **plaintext**. A "loopback ⇒ TLS optional" rule is sound only if
   loopback is guaranteed *at connect time*, not merely at config-parse time — the gap between those two is a
   TOCTOU-style weakness when `hosts`/`/etc/hosts` or a port-forward is attacker-influenced. Worth a line in the
   milestone doc either way.
8. **dotenv auto-loading:** Kit bundles `dotenv@16.5.0`, so `npx drizzle-kit push` in a developer home loads `.env`
   before any gate runs. If the milestone's answer is "we reject ambient `PG*`", note that it does not cover values
   dotenv injects *from the project's own* `.env` — and, directly relevant to this project's privacy restriction, any
   review or CI step that runs Kit or `next` in a real environment **can load the four prohibited values**. Tests must
   be provable without touching `.env` at all (which is what PGlite-based tests should be doing).

## 6. False-assurance patterns to look for in the 28 Drizzle tests (item C)

1. **Testing the wrapper instead of the workflow** (highest-value check, because of H-2): a unit test that calls
   `resolveDrizzleUrl()` in isolation proves the module's logic, not that `drizzle-kit` cannot reach a non-loopback
   database. A genuine test either drives the real config file Kit loads or states the limitation. `[DERIVED FROM §5.1–§5.2]`
2. **`assert.throws(fn)` without inspecting the message** — passes when the code throws for an unrelated reason, and
   never exercises redaction. Assert on `err.message`, `String(err)`, and `JSON.stringify(err)` with a password that
   appears in the URL only in encoded form.
3. **Positive-only loopback tests** — accepting `localhost`/`127.0.0.1`/`[::1]` is trivial; the *negative* half
   (§5.1's shorthand/octal/DNS/userinfo/empty-host/socket cases) is where such a gate lives or dies. A suite with 28
   tests can still be all-positive, and AO's brief asks me to say so if it is.
4. **Shared-mutable-env false results:** `process.env` is process-global; if the 28 tests mutate it without save/restore
   in a `finally`, order dependence appears and `tsx --test` (single process per file, but files run in one command
   here) can report passes that a shuffled run wouldn't. A regression-proof suite restores env per test.
5. **Any test that spawns `drizzle-kit` or imports a dotenv-loading entry point** — in a developer environment that
   reads `.env`. Beyond the assurance question, it is precisely the class of action this review is forbidden to run.
6. **Facet tests that don't create byte-identical duplicate names** → vacuous under `C` collation (M-1). Also: if the
   test asserts "order changed" rather than "order is `(name, id)`", it can pass on a coincidental order.
7. **PGlite vs server gaps to state explicitly, not discover later:** no real Supabase roles (they are simulated with
   `set role`), no `anon`/`authenticated` PostgREST `jwt` claim plumbing, no default-privilege behaviour on
   `alter default privileges`, no `auth.uid()`-backed RLS through the API layer, **no `min(uuid)`-style aggregate
   differences to hide behind** (PGlite *is* a real server here — v18.6 — so the §3 H-3 errors are genuine, which is
   useful), and collation as in M-1. Tests that pass "RLS is preserved" via `set role` do not evidence the hosted
   policy; they evidence the local simulation.

## 7. Migration risks for the facet-ordering change (item B, from the verified baseline)

* **Target is an applied, hosted function.** `get_catalog_facets()` lives in `202611010001_catalog.sql:99` — already
  applied. A new migration must not edit the old file (it would orphan hosted state), must be a complete replacement of
  the function body, and must be additive-safe: `create or replace` + re-asserted `revoke all`/`grant execute`
  (M-2), inside `begin`/`commit` like the existing file, with the same `language sql stable security invoker
  set search_path = ''` header (a change to any of these four properties would be a silent privilege/perf semantic
  change — worth a dedicated test, since `set search_path = ''` is what makes the fully-qualified `public.` prefixes
  load-bearing).
* **Missing-function guard.** A `do $$ begin … exception … end $$` or `if exists(select 1 from pg_proc …)` guard is the
  difference between "reconcilable on a fresh database" and "fails on a database where the original migration was never
  applied". Given `main` has no `supabase/` at all (M-3), the guard is not cosmetic for this project.
* **Signature stability.** `get_catalog_facets()` takes **no arguments**, so `create or replace` can't accidentally
  leave an orphan overload — but if the patch changes the signature in any way, the old overload survives and
  PostgREST's `/rpc/` resolution can pick the wrong one; AO's "existing function signature" check should be about
  *not* changing it.
* **Behaviour must be invariant apart from tie order:** the `exists(...)` filters, the per-subject `count`, the nested
  `topics` sub-aggregate and the `'[]'::jsonb` coalesces are what the app depends on (`getFacets` returns the payload
  unvalidated, `data as CatalogFacets` `[VERIFIED-AK]`), so a rewrite that drops `coalesce` turns an empty catalog into
  `null` in the UI. Any restructure to satisfy H-3 (`distinct on`) must preserve `distinct` semantics exactly —
  e.g. verifying that two subjects with the same name still yield two entries while `topics` stays deduplicated.
* **Hosted drift.** The hosted DB may already differ (AC's own docs repeatedly refuse to claim hosted state:
  "Hosted inspection/migration are separately unauthorized"). Because the function was created by an applied
  migration and never touched since, the risk is low, but the patch must declare its base commit and AO should require
  a read-only hosted `pg_get_functiondef('public.get_catalog_facets()')` diff **before** applying — that is the single
  cheapest way to rule out drift, and it needs no write access.
* **No rollback path.** None of the repo's migrations has a `down`. An ordering-only change is idempotent enough to
  re-apply, but the review should confirm the patch does not require a rollback story it doesn't provide.

## 8. Verification evidence — how I will adjudicate AC's numbers (item E)

Nothing in this section is a result; it is the like-for-like protocol, and each row stays `[UNVERIFIED]` until the
artefact exists. I will reproduce on AK's own `npm ci` of the patch tree, never on AC's output: `npx tsc --noEmit`,
`npx eslint .`, `tsx --test tests/unit/*.test.ts` (expect 82), `tsx --test tests/database/*.test.ts` (expect 32),
`npx next build` in an **isolated copy that contains no `.env` file**, and `npm audit --omit=dev` plus the full
`npm audit` dev count reported separately (a `--omit=dev` "0 vulnerabilities" is not "clean", and AC's own prior
commits disclosed ~20 moderate dev advisories). Where a number depends on the harness's *payload* or *page size* I
will state the boundary — the mechanism behind my own retracted `−30 %` claim (C23 in
`frontend-intelligence/phase2/VERIFICATION_LOG.md`) — and I will run at least one **negative control**: the new tests
against the pre-patch tree, because a test that passes on both trees proves nothing (the value of that method is
demonstrated by AC's tie test failing on the parent SQL, §5 of my last review).

## 9. Outstanding uncertainties

1. **Everything about the patch's content** — 14 operations, the config module, the migration SQL, all 32 tests:
   **NOT REVIEWED**. AO's items A, B, C, D, E are unanswerable until the artefact is delivered (§10).
2. Which base commit the patch was generated from (`742c34a` is my inference from AC's tip, unverified).
3. Whether the 28 Drizzle tests run without a `.env`-containing environment (drives both the assurance question and
   the privacy constraint) — answerable only by reading them.
4. Hosted collation and the hosted `get_catalog_facets()` definition (drift, M-1/M-2) — deliberately not probed:
   read-only hosted inspection is also outside my authority here.
5. `pglite` vs server behaviour for `min(uuid)`/`distinct on`/ACL is *not* uncertain (verified), but how the patch
   works around H-3 is.

## 10. Final recommendation

> ### **REJECT PENDING CORRECTIONS** — on delivery grounds only.
>
> **This is not a technical judgement about AC's Milestone 1 implementation**, which I have not been able to see.
> It records that the artefact named as the review target is not present in a reviewable form, so no further
> progression to AO/PO acceptance is possible until it is. Of the three permitted verdicts, it is the only one that can
> honestly be issued without inventing findings — `APPROVE…` would assert review of unseen code.
>
> **To convert this review into a real one, AO needs one of:** the patch file placed in the workspace (e.g.
> `MILESTONE1_FORWARD.patch` at the repo root or any path, and told to me); a commit/branch containing the
> Milestone 1 work; or a message body paste. On receipt, §5–§8 become a checklist I can execute in a single pass, and
> this file is completed in place with the 12 required sections and a genuine verdict.
>
> **Recommended AC corrections (conditional, pre-submission hygiene for the artefact itself):**
> (1) ship the patch **with its base commit and a `git apply --check` transcript** against that base, given `main`
> lacks `supabase/` and `tests/` (M-3); (2) put the URL gate in code shared by the Kit path, and add a **`drizzle.config.ts`**
> or generated-config wrapper, since JSON cannot read `DRIZZLE_DATABASE_URL` (H-2); (3) implement the facet ordering as
> `create or replace` + re-asserted `revoke`/`grant` with a missing-function guard, and restructure the four `distinct`
> aggregates via `distinct on (…) … order by col, id` rather than `agg(distinct … order by …, id)` or `min(id)`
> (H-3); (4) make the loopback suite negative-case-heavy per §5.1–§5.3 and assert the whole error tree for redaction
> (§5.6); (5) include byte-identical duplicate facet names in the fixture so the migration's property is actually
> exercised under the `C` collation (M-1); (6) state in the milestone doc that `drizzle-kit` auto-loads `.env`
> (dotenv bundled) and that `TEST_CONFIG_PATH_PREFIX` exists, so reviewers know which environment hygiene the gate
> does *not* cover (M-4, §5.8); (7) confirm no test or review command needs the four prohibited private values.

---
*AK performed read-only analysis. No file in the original checkout was created, modified, moved or deleted by this
review beyond this document and the two handover notes inside `frontend-intelligence/`; no patch was applied or
reconciled; no branch was switched or merged; nothing was deployed; no hosted Supabase resource was contacted; no
credential was rotated; no private link value was read, printed, hashed, copied or visited; the final preservation
backup was intentionally not created, as instructed. Downloaded research artefacts live outside the repository, in
`/home/user/m1`.*
