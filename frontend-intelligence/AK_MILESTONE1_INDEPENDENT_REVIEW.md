# AK — Independent Milestone 1 security and technical review

**Project:** Harshit Presentation Hub · **Reviewer:** AK · **Date:** 2026-11-04 (Asia/Kolkata)
**Target:** `AK_MILESTONE1_REVIEW_20261104.zip` → `AK_MILESTONE1_REVIEW/01-essential/MILESTONE1_FORWARD.patch` (54,162 B) + Drizzle/facet artefacts + verification package.
**Authority:** independent review only. Nothing here implements, applies, reconciles, migrates or deploys anything.
**Advisory only:** AO owns technical review/acceptance; the Product Owner alone authorises integration.
**Supersedes** the "artefact absent" version of this file (preserved in Git at `db2010b`, `2026-11-04`); §1.1 records what changed.
Kept inside `frontend-intelligence/` because the brief forbids modifying the original checkout; requested basename preserved.

> ## Verdict: **APPROVE WITH CONDITIONS FOR AO REVIEW**
>
> The Milestone 1 implementation is **technically sound and, in the important parts, provably sound**: I reproduced
> every headline number except one (81 vs the reported 82 unit tests), and I independently confirmed that the
> security gate is real *inside the actual Drizzle Kit load path* — including a result AC did not obtain: **`npx
> drizzle-kit generate` with this config exits 0** (§4.3), which demonstrates the config produces a usable Kit
> configuration rather than merely throwing correctly. The validator rejected **37 of 38** hostile inputs I threw at
> it, with constant, non-interpolated error strings — the strongest available redaction design.
>
> The conditions are **not about code quality**; they are about **reconcilability and evidence closure**:
> **C1** the patch is in Codex `apply_patch` format and cannot be applied or validated by `git apply`/`patch`, and 8 of
> its 9 update hunks match a working-tree state that exists in **no Git object** → it cannot be reconciled as-is (§3.1, §3.2).
> **C2** the reported `82 unit tests` is not reproducible from the patch: I get 81, and the missing test exists in no
> Git ref (§6.2). **C3** three properties the milestone claims to lock down are unpinned by its tests — the exact
> loopback host set, the database-name shape, and course-side tie behaviour (§5.2, §5.3, §4.4). **C4** hosted
> preflight (definition/ACL/owner/collation) must precede any future authorisation, as AC's own text requires (§4.5).
> **C5** the two audit logs are byte-identical and must not be counted twice (§6.4). **C6** browser verification
> remains **blocked and unverified** — recorded as such, never as passed (§6.5).

---

## 1. Executive assessment

### 1.1 What changed since my "artefact absent" report
The package was delivered out-of-band (Dropbox `/Educational-Platform-Backups/AK_MILESTONE1_REVIEW_20261104.zip`,
297,900 B). Retrieval: the sandbox egress allowlist blocks every Dropbox host (`curl: (35) SSL_ERROR_SYSCALL` on
`dl.dropboxusercontent.com`, `api.dropboxapi.com`, `www.dropbox.com`, and on `example.com` as a control; allowlisted
hosts returned 200), so bytes could not be fetched by shell. The **connector** staged the file at
`Presentation-/dropbox/AK_MILESTONE1_REVIEW_20261104.zip` — i.e. *inside the original checkout*. I immediately moved it
to `/home/user/m1/pkg/` and removed the now-empty `dropbox/` directory; `git status --porcelain` is empty before and
after, and the checkout is otherwise untouched. **All findings below are from the extracted payload.**
Integrity: the container's own SHA-256 (`84ca118b7f43ff17…`) does **not** equal Dropbox's `content_hash`
(`6766485f5b926eb1…`), but **all 39 member hashes match `MANIFEST.md` exactly**, including
`MILESTONE1_FORWARD.patch = a9bfe509f969f420423d59df0daefca3afcc187199dd52592be5c5cbc934c97e`, which the report also
quotes at `MILESTONE1_REPORT.md` §3 → **payload authenticity verified; container-level difference only, no
substitution.** `[VERIFIED-AK]`

### 1.2 Assessment in one paragraph per scope item
| AO item | Assessment |
|---|---|
| **A. Drizzle config security** | **Strong, with three unpinned properties.** Fails closed on missing/empty/whitespace value; `DATABASE_URL` is *never read* (0 occurrences — verified by source scan and by a hostile-env Kit run); `PG*` rejected case-insensitively before parsing; anchored regex admits only `localhost`/`127.0.0.1`/`[::1]` with explicit port and one path segment; percent-encoding must be canonical-uppercase, NFC-normalised, control-char-free; explicit `dbCredentials` fields (no `url`) defeat driver-side ambient fallbacks; `ssl:false` is only reachable for numeric loopback. Gaps: host *set* not test-pinned, database-name guard weaker than its comment, and the gate is bypassable by `--config`/`TEST_CONFIG_PATH_PREFIX`. §4–§5. |
| **B. Facet migration** | **Correct and minimal.** The new function body differs from the applied original by **exactly 12 characters** — `, s.id` and `, c.id` inserted inside the existing `jsonb_agg(... order by …)` — plus `create or replace`; header (`language sql stable security invoker set search_path = ''`) and zero-argument signature preserved; `to_regprocedure` existence guard aborts rather than creates; `begin`/`commit` wrapped; the four `jsonb_agg(distinct …)` aggregates are correctly left alone (adding an id key there is illegal — `42P10` — and unnecessary, since `DISTINCT` already merges collation-equal values). Verified in PGlite, plus ACL/owner/overload/RLS invariance. §4.4–§4.6. |
| **C. Tests (28 + 4)** | **Unusually rigorous; three specific weaknesses.** Sanitised per-case child env, network/driver denial with attempt counters, SQL pinned by SHA-256, before/after definition regex, metadata/ACL/policy snapshots, reverse-inserted byte-identical duplicate names (exactly the fixture shape the `C` collation requires). My mutation battery: 11 of 14 deliberate weakenings detected (facet suite: 5 of 5). Weaknesses: host-set and db-name cases absent; `rejected()` accepts a generic error pattern; course-side tie assertion passes on unpatched SQL. §5. |
| **D. Patch integrity** | **Content matches its inventory; form is not reconcilable.** 14 operations at `MILESTONE1_FORWARD.patch:2,3,53,227,255,492,498,508,518,528,538,548,558,586` = 1 delete + 4 adds + 9 updates, exactly as §3 of the report claims; `package.json`/`package-lock.json` byte-identical to AC's branch tip (no dependency drift); no app-source changes; no `.env`, no old JSON, no credentials included. But: not consumable by `git apply`/`patch`, and its 8 documentation hunks key off untracked mirror content. §3. |
| **E. Evidence** | **Reproduced: 28/28, 4/4, 32/32, lint 0, typecheck 0, `next build` 0, prod audit 0 (dev: 20 moderate — exactly AC's disclosed figure), dependency counts identical (prod 61 / dev 473 / total 572).** Not reproduced: 82 → **81** unit tests. Not independent: the 4/4 and 28/28 logs are subsets of the 32/82. Overstated attribution: the Kit `check` failure is explained as "missing `out`"; my runs show it precedes any `out` handling and that `generate` succeeds. §6. |

## 2. Files reviewed (complete inventory)

**Package:** 39 files, all listed in `MANIFEST.md`; every member hashed and matched. I read in full:
`01-essential/MILESTONE1_FORWARD.patch` (614 lines, all 14 ops), `02-drizzle/drizzle.config.ts` (49),
`02-drizzle/tests/unit/drizzle-config.test.ts` (173), `03-facets/supabase/migrations/202611040001_facet_ordering.sql`
(27), `03-facets/tests/database/facet-ordering.test.ts` (236), `03-facets/excerpts/get_catalog_facets.original.sql`,
`02-drizzle/{package.json,.env.example,installed-drizzle-kit-package.json}`,
`04-verification/control/{no-network.cjs,kit-final-config-check.cjs}` (read, **not executed** — see §7),
`04-verification/logs/*` (12 logs), `MANIFEST.md`, `README_AK.md`, and the targeted sections of
`01-essential/MILESTONE1_REPORT.md` (2,171 lines: §1 status, §3 inventory, §4 commands, §5 facet reasoning) plus both
patched handover bodies. **Deliberately not opened:** `01-essential/candidate-project/*.md` beyond hashing, and
Dropbox's sibling `AO_NEW_CHAT_HANDOVER.md` (331 KB) — reading it could surface the prohibited link values, and AO
did not request it.
**Substrate re-read from Git:** `742c34a:{drizzle.config.json, package.json, package-lock.json, .gitignore,
supabase/migrations/2026110{1,2}*.sql, supabase/seed.sql, src/db/index.ts, src/lib/catalog.ts, tests/unit/*}`.
**Tool source read:** the installed `drizzle-kit@0.31.10` `bin.cjs` (config resolution, `flattenDatabaseCredentials`,
the postgres connection schema, dotenv bundling, `TEST_CONFIG_PATH_PREFIX`).

**Isolation of my experiments:** everything ran in `/home/user/m1/`. My patched tree was built as
`git archive 742c34a` + the patch's five code operations (files copied byte-identically from the package, hashes
verified), then `npm ci` (429 packages, registry only). **The original checkout was never used as a working
directory, and no `.env` file exists in the sandbox** (checked by name only; never opened), so no command I ran could
load a prohibited value.

## 3. Patch inventory and integrity observations

### 3.1 Format — the blocking issue
`MILESTONE1_FORWARD.patch` is a **Codex `apply_patch` script** (`*** Begin Patch` / `*** Add File:` /
`*** Update File:` / `@@` context), not a unified diff: no index hashes, no hunk line numbers, no base commit, no
author/date, no `diff --git` headers. Measured on an isolated copy of AC's branch tip:

```
$ git apply --check MILESTONE1_FORWARD.patch   → error: No valid patches in input (allow with "--allow-empty")
$ patch -p1 --dry-run < MILESTONE1_FORWARD.patch → patch: **** Only garbage was found in the patch input.
```
`[VERIFIED-AK]` → **There is no mechanical way to verify, review or apply this patch outside the tool that wrote it.**
No three-way merge, no `--3way`, no `git apply -R` reversal, no `git am`, and no context-length guarantees for the
`+`-only bodies (my awk over the file shows `+` lines only: `580` added, `0` removed lines recorded).

### 3.2 Base state — 8 of 14 operations cannot land on any commit
The report and every patched doc state the base is "branch `arena/c9d0d599-presentation`, HEAD `4307a68…`", the *same*
commit as `main`, with "26 tracked modifications, 130 untracked" — and `README_AK.md` adds: "relative to the captured
original working tree, **not HEAD**". I tested the `@@` context line of each update against the Git trees:

| Update target | file at `main`? | file at AC tip `742c34a`? | context line present at tip |
|---|---|---|---|
| `.env.example` | no | yes | **yes (1/1)** |
| `PROJECT_CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, `DEVELOPMENT_GUIDE.md`, `AC_HANDOVER.md`, `AO_HANDOVER.md` | **no** | yes | **no (0/1 each)** |

`[VERIFIED-AK]` So the 9 updates are anchored to uncommitted mirror content, and `main` lacks all 9 files plus
`supabase/` and `tests/` entirely (9 root entries). **Consequence, stated precisely:** the four *code* operations
(1 delete + 3 adds + the new migration) are base-independent and *do* apply cleanly to AC's committed tip — that is
how I built my tree, and it passed everything — whereas the eight documentation operations are append-only content
whose duplication of a single identical paragraph across 8 files also makes them low-value in a source patch. The
right reconciliation shape is therefore: **`git format-patch`/`git diff` limited to the 5 code paths against a declared
commit**, with handover/doc updates carried separately as review artefacts (they are not part of the program).

### 3.3 What is *not* in the patch (checked, and correct)
`package.json` and `package-lock.json` are byte-identical to `742c34a` (`cmp` clean) → no dependency, script or lockfile
change — which also means **no `db:*` npm script is introduced** (see M-1). No `src/**` file is touched, no other
migration, no config, no test infrastructure. `.gitignore` untouched (so `drizzle.config.ts` is tracked: it *contains*
no secret, but a populated `.env` stays ignored ✓). The credential-bearing `drizzle.config.json` is deleted
**by path only**: its contents appear nowhere in the patch (`grep -c 'postgres:' → 0`), consistent with
`MILESTONE1_REPORT.md` §3 "old contents are not included or used" — a deliberate, verifiable privacy choice that also
removes the H-1 exposure I flagged last round. `[VERIFIED-AK]`
Package hygiene claims I spot-checked and confirmed: no `.env`, no `.pgp`, no key/token material, no private link
literals in any of the 39 files (0 matches for `supabase.co`, `eyJ`, `service_role`, `ANON_KEY`, `PRIVATE`); the
`.env.example` copy has 5 assignments, **all blank** (`DRIZZLE_DATABASE_URL=` present ✓); the SQL excerpt is a true
byte slice — `catalog.sql[6595:8254] == get_catalog_facets.original.sql` ✓ — so it is a labelled extraction, not a
reconstructed stand-in. `[VERIFIED-AK]`

## 4. Drizzle and facet-migration assessment

### 4.1 Requirement and separation (`drizzle.config.ts:4-10`)
`process.env.DRIZZLE_DATABASE_URL` is mandatory (`:5-7`); the module **never** references `DATABASE_URL` (verified:
the only occurrences of that name in the shipped files are inside tests asserting it is *not* used). Under real Kit, with
only a hostile `DATABASE_URL=postgresql://x:y@db.example.invalid:5432/z` present, Kit printed
`DRIZZLE_DATABASE_URL is required for the local Drizzle workflow.` → **no fallback, verified at the tool boundary, not
just in unit tests.** The `PG*` rejection at `:8-10` fires over `Object.keys(process.env)` case-insensitively; I
confirmed it trips on `PGPASSWORD`, `pgpassword`, `PgData`, `PGXID`, `PGOPTIO`, `PGSQL_URI`, `PGR`, `PG` and — matching
AC's own test — on an **empty** `PGHOST=""`; `DSN` (not libpq-relevant) is correctly left alone. The over-strict
consequence is honest and small: any variable *named* `PG…` blocks the workflow, including third-party tools that
export, e.g., `PGXID`. `[VERIFIED-AK]`

### 4.2 Parsing, canonical encoding, loopback (`:15-43`)
The anchored regex requires `postgres|postgresql` + non-empty user **and** password + host in a 3-value allowlist +
numeric port + exactly one path segment + no query/fragment; `decodePart` (`:19-35`) then forces canonical-uppercase
percent-encoding, NFC-normalised decoded text, and no C0/C1 control characters; `:43` maps `localhost → 127.0.0.1` and
`[::1] → ::1` so the driver never re-parses a bracketed literal. This design is why the classic attacks all fail — and
I verified 37/38:

| Input (all against the shipped file, via `tsx`) | Result |
|---|---|
| `0.0.0.0` · `::` · `127.0.0.2` · `127.1` · `0x7f000001` · `0177.0.0.1` · `2130706433` | rejected |
| `localhost.` · `LOCALHOST` · `localhost.localdomain` · `POSTGRESQL://` · `::1` unbracketed · `[0:0:0:0:0:0:0:1]` · `[::ffff:127.0.0.1]` | rejected |
| `127.0.0.1.evil.example` · `evil.example/127.0.0.1` · `u:p@evil@127.0.0.1` · `u@127.0.0.1` · `:p@127.0.0.1` | rejected |
| `postgresql:///d?host=/var/run/postgresql` · `…/d?host=/tmp` · `…/d#frag` · `…/d?sslmode=require` · `…/d?sslmode=disable` | rejected |
| trailing/leading space · trailing newline · `../etc` db · two path segments · `:5432/d:extra` · port `0`/`055432`/`65536` | rejected |
| `%ZZ` `%A` `%ff` `%C3%28` `%00` `%0A` `%41` `%65%CC%81` (decomposed é) | rejected |
| **`…/d%2F..%2F..%2Fetc`** | **ACCEPTED → `database: "d/../../etc"`** (see M-3) |
| valid: `postgres://` and `postgresql://`, `127.0.0.1`, `localhost`, `[::1]`, `u%40x` in user, `p%40s` in password | accepted, decoded exactly once, `ssl:false` |

### 4.3 TLS, driver fields, and real Kit workflow — including a result AC did not have
`ssl:false` is hard-coded, and because the host is numeric-loopback the "local plaintext" assumption holds; Kit's own
credential handling (`const ssl = "ssl" in credentials ? credentials.ssl === "prefer"|"require"|"allow" ? …`) shows the
string-mode semantics don't turn `false` into TLS. `dbCredentials` carries **no `url` key**, so nothing downstream can
re-parse a looser connection string. Kit's postgres schema explicitly allows that shape —
`Either "url" or "host", "database" are required for database connection` — and I confirmed the workflow works:

```
$ DRIZZLE_DATABASE_URL='postgresql://u:p@127.0.0.1:5432/d' npx drizzle-kit generate
  Reading config file '/home/user/m1/tree/drizzle.config.ts' → 0 tables → No schema changes, nothing to migrate   (exit 0)
```
`[VERIFIED-AK]` **This is new evidence**: AC's Kit harness (`kit-final-config-check.cjs`) ran only
`drizzle-kit check`, whose success criterion is `exitedNonzero && reachedCheckValidation` — i.e. it asserts the gate
*ran*, never that the resulting config is *usable*, and its README attributes the nonzero exit to "missing `out`". My
`check` reproductions show the Data-API params error occurs for **every** postgres config shape I tried — including a
plain `{url}` config and an unrelated `--config` file — so it is a property of `check` in a repo without an
`out`/migrations directory, **not** a defect of the new config; and `generate` (which is the command the milestone's
"manual local development" comment targets) succeeds. `push`/`migrate`/`introspect` still require a real database and
remain **UNVERIFIED by design**. `[VERIFIED-AK + REPORTED-AC]`

### 4.4 Facet migration SQL (`202611040001_facet_ordering.sql`)
`begin;` (1) → `to_regprocedure('public.get_catalog_facets()') is null → raise exception 'Expected
public.get_catalog_facets() to exist; aborting'` (6-7) → `create or replace function … returns jsonb` (12) with the
header `language sql stable security invoker set search_path = ''` (13) **byte-identical** to the applied definition →
`order by s.name, s.id` (16) and `order by c.name, c.id` (18) → `commit;` (27). A character-level diff of the two
bodies gives `1600 → 1612` chars, i.e. **two 6-character insertions and nothing else**: no filter, `coalesce`,
`exists()`, `count` or `topics` sub-aggregate changed. `create or replace` (rather than drop+create) preserves
function identity, owner and ACLs; the guard is the *right* polarity (abort, don't create) because creating it here
would bypass `202611010002_least_privilege_catalog_grants.sql`'s grant policy. `[VERIFIED-AK]`
Two operational nuances: (i) the four `jsonb_agg(distinct …)` aggregates (20-23) are left name-ordered only — correct,
because `agg(DISTINCT x ORDER BY x, id)` is illegal (`42P10`, verified) and `DISTINCT` already merges
collation-equal inputs so no tie can survive; (ii) when the guard fires, the raised exception leaves the file's
`begin;` transaction aborted, so a runner that continues issuing statements fails until rollback — AC's own
missing-function test must and does issue `rollback;` explicitly.

### 4.5 Hosted-drift exposure
`create or replace` requires the existing function to have the *same* argument list; on a hosted database whose
definition drifted (e.g. an owner-added `security definer`, a `grant` to a service role, or Supabase-managed
`alter default privileges`), the replacement inherits that state silently. **AC documents this accurately**
("The reviewed migration existence guard does not detect hosted definition/ACL drift; verify separately before any
future authorization" — patched `AC_HANDOVER.md`). My local check shows the *default* posture is right —
`proacl = {postgres=X/postgres,anon=X/postgres,authenticated=X/postgres}`, `proowner = postgres`,
`prosecdef = false`, `provolatile = 's'`, `overloads = 1` — but PGlite's role model is not Supabase's, so **C4**
(read-only `pg_get_functiondef` + `pg_proc` + `pg_policies` preflight, and the target's `datcollate`/`collisdeterministic`)
remains mandatory before any authorisation. `[VERIFIED-AK local / REPORTED-AC wording]`

### 4.6 Where the tie-break actually matters (my own measurement)
On AC's fixture: old function → `subject-high, subject-low` (descending ids = insertion order); new → `subject-low,
subject-high` (ascending) ✓. With **32 name-sharing subjects**, the old output was `tie-025, tie-017, tie-016,
tie-011, tie-002, tie-004, …` — neither sorted nor insertion-ordered, i.e. **whatever the plan happened to produce**,
while the new output is fully ascending under all four planner settings I forced. `[VERIFIED-AK]` Consistent with my
standing caveat, I do **not** claim local plan-insensitivity proves hosted stability; the point is that pre-change the
order was *unspecified*, and post-change it is a total order (`id` is `uuid primary key`, non-null and unique).

## 5. Test-quality assessment

### 5.1 Harness engineering (credit where due)
Per case, `check()` (`tests/unit/drizzle-config.test.ts:74-96`) spawns a **fresh child process** with a
seven-name env allowlist (`:76-77`, and explicitly not `NODE_OPTIONS`), so there is no cross-test `process.env`
mutation at all — the failure mode I predicted in §6.4 of my earlier protocol does not apply. The child patches
`net.Socket.prototype.connect`/`net.connect`/`net.createConnection`/`tls.connect`/`dns.lookup` and
`pg.Pool|Client.prototype.connect`, counts attempts, and only permits tsx's IPC socket (`:30-44`) guarded against
`..`; every result asserts `pgCalls === 0` **and** `attempts === 0`, so "the config never touches the network or a
driver" is *measured*, not asserted rhetorically. Redaction is tested against stdout **and** stderr over seven
marker strings. `accepted()` additionally constructs `pg/lib/connection-parameters.js` **after** injecting six
conflicting `PG*` variables and asserts the explicit fields win — a genuinely sophisticated property to test, and the
reason "we reject `PG*`" is not the only line of defence. `[VERIFIED-AK]`

### 5.2 Mutation battery — what the 28 tests do and do not detect
I weakened the shipped implementation 9 ways (each revert-verified) and re-ran the suite:

| Mutation to `drizzle.config.ts` | Suite result | Verdict |
|---|---|---|
| M1 delete the `PG*` guard (`:8`) | 27/28 | detected |
| M2 delete `parts[0] !== value` (`:17`) | **28/28** | survives — **but the clause is dead code**: the regex is fully anchored, so `parts[0]` is always the whole string. Report as a code-comment overstatement, not a coverage hole. |
| M3 host set → `127\.[0-9.]+` (accepts `127.0.0.2`) | **28/28** + `127.0.0.2` accepted | **undetected (M-4)** |
| M4 host set += `0.0.0.0` | **28/28** + `0.0.0.0` accepted | **undetected (M-4)** |
| M5 skip the canonical-encoding check (`:27`) | 27/28 | detected |
| M6 drop the `> 65535` bound (`:17`) | 27/28 | detected |
| M7 hand Kit `dbCredentials:{url:value}` instead of fields | 23/28 | detected (5 tests) |
| M8 interpolate the offending value into the error (`:13`) | **11/28** | strongly detected |
| M9 omit `ssl:false` (`:48`) | 23/28 | detected (5 tests) |

| Mutation to the facet migration | Suite result | Verdict |
|---|---|---|
| F1 revert `order by s.name, s.id` → `s.name` | 0/4 | detected |
| F2 neutralise the `to_regprocedure` guard | 0/4 | detected |
| F3 reverse the tie-break (`s.id desc`) | 0/4 | detected |
| F4 delete a `publication_status` filter from the count subquery | 0/4 | detected |
| F5 change the signature (`x int default 1`) | 0/4 | detected |

So the facet suite is a **total detector** for the five properties it claims, and the Drizzle suite detects 7 of 9
realistic weakenings, with the two survivors being either dead code (M2) or a genuine gap (M3/M4).

### 5.3 Weak tests, precisely identified
1. **`rejected()` accepts a generic reason** — `assert.match(result.error, /DRIZZLE_DATABASE_URL|PG\*/)`
   (`:101`) is satisfied by *three different* messages, so a case that fails for the wrong reason still "passes". With
   28 cases this is mostly harmless (each has a distinct intended message), but pinning `:required`/`:Unset PG\*`/
   `:valid explicit` per case would make the suite explain *why* it rejected. **Low**, 1-line-per-case fix.
2. **The loopback boundary is not pinned** (M3/M4 survive). Add `127.0.0.2` and `0.0.0.0` to the rejected list.
   **Low.**
3. **`database` shape is untested beyond exact `"."`/`".."`** — hence M-3 below. **Low, fix with a pattern test.**
4. **Course-side tie assertion is behaviourally vacuous.** I measured the **old** function returning
   `course-low, course-high` — i.e. *equal to the new expected order* — so only the subjects half of test 1 fails on
   unpatched SQL. The courses assertions still pin the definition regex, but a future change that breaks course
   tie-ordering while leaving `order by c.name, c.id` in the text would not be caught behaviourally. AC's own
   diagnostic says the same thing (`course IDs ascending=true`, "neither old result is treated as a guaranteed
   ordering"), so this is a *known* limit, correctly disclosed. **Low.** Fix: add a second course pair whose insertion
   order also defeats a naive `Merge Append`/index path, or assert `= expected` for the definition **and** for a
   reverse-inserted duplicate.

### 5.4 Coverage gaps that matter (item C)
No test executes the real CLI beyond the shipped harness's `check` (so M-2's `generate` evidence is absent), and none
covers: `--config`/`TEST_CONFIG_PATH_PREFIX` bypass (M-1), a `PG*` variable *added after* the config evaluates
("late environment mutation" — AC lists it as UNVERIFIED ✓), `PGPASSFILE` pointing at a hostile file *in addition* to
being rejected (defence-in-depth), a URL whose password contains only characters where `encodeURIComponent` and the
canonical rule differ in *both* directions, or the interaction with the app's own `dotenv@17.3.1` runtime loading.
**Missing integration coverage:** the milestone never runs a *real* `pg` client against a *real* server with these
fields (`push`-equivalent), which is out of bounds here — recorded, not criticised.

## 6. Verification-evidence assessment

| Claim (AC) | My independent status | Evidence |
|---|---|---|
| targeted Drizzle tests **28/28** | **REPRODUCED** | `# tests 28 / # pass 28 / # fail 0` in my tree |
| facet regression **4/4** | **REPRODUCED** | `# tests 4 / # pass 4` |
| **32/32** PGlite database | **REPRODUCED exactly** | `81`-unit run: `# tests 32 # pass 32 # fail 0`; per file `facet-ordering 4, hosted-plan-review 1, least-privilege-grants 7, policies 10, search-ranking 10` |
| **82/82** unit | **NOT REPRODUCED — 81** | per file `admin-authorization 8, ambient-color 2, auth-cookies 3, catalog-ordering 6, catalog-search-fallback 5, drizzle-config 28, loading-boundaries 1, logout 4, review-catalog 2, search-ranking 4, search 5, supabase-config 4, urls 5, validation 4 = 81`, 0 failures. Name-level diff of AC's `ao-unit-recheck.log` (82 names) vs my run: the sole extra is **`admin editor associates select and description errors with their controls`**, which I then searched for in `742c34a`, `c5c6ce3`, `3ffd555`, `cac9c7f` and `main` — **present in none** ⇒ an implementation-adjacent test lived only in AC's mirror. Either the patch omits a change or the count is stale. **Medium (C2).** |
| lint, typecheck exit 0 | **REPRODUCED** | `npx eslint .` silent exit 0; `npx tsc --noEmit` exit 0 |
| production build passes (synthetic mirror) | **REPRODUCED** | `npx next build` exit 0 in a tree with **no `.env` at all** — so the milestone neither requires nor breaks env at build time |
| registry-only prod audit = 0 | **REPRODUCED, and environment-matched** | mine: `info 0 low 0 moderate 0 high 0 critical 0`; deps `prod 61 / dev 473 / total 572` — **identical to the counts in their log**, so same lockfile/resolution. Full audit (dev): **20 moderate**, matching AC's disclosed `~20`. |
| "first typecheck failed on facet metadata typing, corrected" / "build first failed on symlink layout, bind retry passed" | **REPORTED-AC, plausible, not re-derivable** | retained failure logs are included (`milestone1-typecheck-first.log`, `milestone1-build-synthetic.log`) — retaining failures rather than only the pass is good practice |
| Kit check harness exit 0 with 5 sub-checks | **PARTIALLY CORRECT-AS-LABELLED** | `kit-final-config-check.cjs` requires `valid.exitedNonzero && reachedCheckValidation` ⇒ by construction it *cannot* demonstrate a usable config; and its README attribution "exited nonzero due to missing `out`" is **inaccurate** (my §4.3 shows the driver-params error precedes `out` handling, for every config shape). The substantive result AC wanted is nevertheless true — I proved it with `generate` |
| Browser blocked | **AGREES WITH MY ENVIRONMENT** | `~/.cache/ms-playwright` absent; `npx playwright --version` had to fetch the `playwright` npm package itself (registry is allowlisted; the browser CDN is not, so no browser could ever be installed here). No browser was downloaded by me. **UNAVAILABLE — never reported as passed** |

### 6.1 Additional integrity notes
- **`[VERIFIED-AK]` the SQL hash pin is honest**: `expectedHash` (`facet-ordering.test.ts:19`) equals the SHA-256 of the
  migration **both** as packaged and as embedded in the patch (`c24de37060a89e1f…`), so the test cannot silently drift
  from the shipped SQL — an anti-substitution measure I would have recommended had AC not already built it.
- **`[VERIFIED-AK]` two audit logs are byte-identical** (`milestone1-audit-offline.json.log` ==
  `milestone1-audit-registry.json.log`, same SHA-256, 380 B). An offline audit *can* legitimately produce the same JSON
  from a warm cache, but the two labels are then indistinguishable, so they must count as **one** observation (C5). The
  registry one is the meaningful label, since the report notes an `npm` debug `HTTP 200` for it.
- **`[VERIFIED-AK]` `README_AK.md`'s provenance discipline is accurate**, and I checked its strongest claims:
  0 hidden members, `.env.example` blank, excerpt = exact slice, no credential material, "28/28 and 4/4 are subsets
  of the full suites" (true — they are not additive totals).

## 7. Security and operational risks (findings)

**Critical: none.** I found no way to make this configuration connect to a non-loopback database, no credential or
input echo, no privilege escalation in the migration, and no RLS/ACL regression. The severities below are, in every
case, either reconciliation-shape or hardening-of-an-already-defensible-design issues.

| # | Sev | Finding (evidence in §) |
|---|---|---|
| M-1 | **Medium** | **The gate is advisory, not structural.** `drizzle-kit check --config=/tmp/evil2.ts` read my remote-URL config with *no* gate output, and `TEST_CONFIG_PATH_PREFIX=/tmp/pfx npx drizzle-kit check` printed `No config path provided, using default 'drizzle.config.ts'` then `Reading config file '/tmp/pfx/drizzle.config.ts'` ⇒ both routes bypass the validator entirely (§4.3, verified on the pinned Kit 0.31.10). With no `db:*` script (patch leaves `package.json` untouched), the documented workflow is a hand-typed `npx drizzle-kit …`, so the protection is "the default file is safe", not "the workflow is safe". Impact is developer-mistake and CI-poisoning class, not remote. Fix: add a pinned script (e.g. `"db:generate": "drizzle-kit generate --config=drizzle.config.ts"`), and state the caveat next to the "Manual local development only" comment. |
| M-2 | **Medium** | **Reported unit total not reproducible from the artefact** (82 vs 81; the extra test exists in no Git ref). Blocks "trust the evidence" and hints at an omitted change (§6). |
| M-3 | **Medium** | **`database` validation is weaker than its comment claims.** `…%2F..` is accepted and reaches `pg` as `dbname="d/../../etc"` (I traced it through `pg/lib/connection-parameters.js`). `:42` only rejects the literal strings `.`/`..`, while `:15` advertises "one database path". No traversal consequence in the pure-JS driver — Postgres will treat it as an identifier — but the *stated* property is false, and any future code path that formats these fields into a `psql`/libpq URI would inherit a raw `../`. Fix: `if (!/^[A-Za-z0-9_][A-Za-z0-9_.\-]*$/.test(database)) invalid();` + a test with `%2F`. |
| M-4 | **Medium** | **The loopback set is not a tested invariant.** Broadening the alternation to `127\.[0-9.]+` or adding `0.0.0.0` leaves 28/28 green and those hosts accepted (§5.2 M3/M4). Benign today, but the test suite gives false confidence that "loopback-only" is enforced by CI. Fix: 2 added cases + `127.0.0.2` documented as deliberately rejected (it is a legitimate second-instance loopback; rejecting it is a compatibility cost worth a doc line). |
| M-5 | **Low** | **Course-side behavioural vacuity** in the tie test (§5.3.4) — disclosed by AC's own diagnostic. |
| M-6 | **Low** | **`rejected()` matches a disjunctive message pattern**, so reason-of-rejection is under-specified across ~20 cases (§5.3.1). |
| M-7 | **Low** | **Kit `check` used as the compatibility probe; `generate` not probed.** AC's log attributes the nonzero exit to a missing `out`, which my runs contradict; the useful, safe probe is `generate` (no connection), which passes. Evidence-quality issue, now corrected by me (§4.3). |
| M-8 | **Low** | **Trust boundary of `.env` is unstated.** The app depends on `dotenv@17.3.1` and Kit bundles `dotenv@16.5.0`; AC verified (in `kit-final-config-check.cjs`, `dotenvValid`/`dotenvAmbient`) that a `.env`-supplied `DRIZZLE_DATABASE_URL` loads and that the `PG*` guard still fires *after* dotenv injection ✓. What is not stated is that a *repo-local `.env`* is therefore inside the trusted computing base — i.e. the gate defends against ambient shell state, not against committed-project state. One sentence in `DEVELOPMENT_GUIDE.md` closes it. |
| M-9 | **Informational** | **App runtime asymmetry (by design):** `src/db/index.ts` still builds its health pool from `process.env.DATABASE_URL` with no loopback rule and TLS left to the connection string — correct for a hosted DB, but reviewers should not read the new gate as app-wide URL policy. |
| M-10 | **Informational** | **Dead clause** `parts[0] !== value` (`:17`); harmless, but M2-survival is not evidence of a gap (§5.2). |
| M-11 | **Informational** | **Guard failure leaves an aborted transaction** (`begin;` + `raise`, §4.4(ii)); AC's test handles it, a naive runner may not. Consider `on_sql_error` documentation or relying on the runner's transaction wrapper. |
| M-12 | **Informational** | **PGlite ≠ hosted:** my local server is `PostgreSQL 18.6` with `datcollate = C` and only the deterministic `C` collation, `proowner = postgres`, roles simulated by `set role`; target version/collation/ownership are unverified (AC says so ✓). Note also that the *fixture* is correctly shaped for that environment (byte-identical duplicate names). |
| M-13 | **Informational** | Audit-log duplication (§6.1); `npm audit --omit=dev` zero is a production-snapshot statement, and the dev tree carries 20 moderate advisories (unchanged by this patch, which adds no dependency). |
| M-14 | **Informational** | Package transport: container SHA-256 ≠ Dropbox `content_hash` while every member hash matched (`§1.1`) — worth a `MANIFEST.sha256` *inside* future archives, since a manifest that cannot self-describe its own container is a small gap in an otherwise careful integrity story. |

**Attack scenarios considered and closed by this design** (each with my verification): DNS-rebinding/hostname-trick
targets (`127.0.0.1.evil.example`, `localhost.localdomain`, trailing dot) — rejected; numeric-encoding bypasses
(`0x7f…`, `0177…`, `2130706433`, `127.1`) — rejected; IPv6 literal variants and v4-mapped forms — rejected;
`?host=`/`?hostaddr=`/duplicate/percent-encoded parameter names — rejected (and query strings are disallowed
outright); unix-socket redirection with empty host — rejected; authority confusion via a second `@` — rejected;
`%`-mismatch credential smuggling — rejected (canonical-uppercase requirement); ambient `PG*` takeover — rejected, and
separately neutralised because the driver receives discrete fields; secret disclosure through error text — impossible by
construction (constant messages) and tested (M8 → 17 failures); connection made "just to look" — `pgCalls/attempts`
counters make that a test failure; migration applied to a database lacking the function — guard aborts (verified);
silent privilege widening via `create or replace` — verified no change to `proacl`/`prosecdef`/`policies`/table grants.

**Attack scenarios the milestone does not close** (all pre-existing, none introduced): anyone able to write
`drizzle.config.ts` or a project `.env` controls the local migration target (M-1, M-8); the app's *runtime* pool takes
an unvalidated `DATABASE_URL` (M-9); hosted drift can silently change what `create or replace` inherits (C4); and
`ssl:false` means the local DB must never hold data you would not put in a laptop (which, for a local dev mirror, is the
intended trade-off).

## 8. Required corrections and unresolved questions

**Must be resolved before AO makes an acceptance recommendation (all cheap; none is a redesign):**
1. **C1 — Reconcilability.** Re-emit the code delta as `git diff`/`git format-patch` **against a declared commit**, and
   move the eight continuity-document hunks out of the source patch (they are review artefacts, and their contexts do
   not exist in Git). *Or* keep `apply_patch` but attach, for each `Update File`, the exact base blob hash so the
   context is verifiable. (Verified: `git apply`/`patch` both reject the current form; 8 of 9 update contexts match no
   Git tree.)
2. **C2 — Evidence closure on 82 vs 81.** Either include the `admin editor associates select and description errors
   with their controls` test (if it is real work in progress, it belongs in the patch or a stated follow-up) or amend
   the report/handovers to 81 with a one-line note on the mirror's extra file. Silent divergence between a verified
   tree and a shipped artefact is exactly what milestone gates exist to prevent.
3. **C3 — Three test additions** (≈10 lines total): reject `127.0.0.2` and `0.0.0.0`; reject `…%2F…` in the database
   position (or accept it deliberately and drop the "one database path" comment); pin at least one distinct error
   message per rejected class instead of the `/DRIZZLE_DATABASE_URL|PG\*/` disjunction.
4. **C4 — Hosted preflight, read-only, before any future authorisation:** `pg_get_functiondef`, `proacl`, `proowner`,
   `pg_policies`, table grants, and the database's `datcollate`/`datlocprovider` + `pg_collation.collisdeterministic`.
   Rationale is concrete: under a non-deterministic collation `order by name` can tie *distinct* names — the very case
   the tie-break serves — and **no local PGlite run can reproduce it** (M-12).
5. **C5 — Stop double-counting the audit**, and label the two 380-byte logs as one observation.
6. **C6 — Add the `--config` pinning** (script or doc line) so M-1 stops being a documented-by-omission risk, and
   state the `.env` trust boundary (M-8).

**Nice-to-have / future:** `drizzle.config.ts` currently throws at import, so any tool that *imports* the config in a
context without the variable fails hard — intended, but a `DRIZZLE_DATABASE_URL_ALLOW_REMOTE`-style escape hatch was
explicitly rejected by `DECISIONS.md` ✓ keep it that way; consider a `pre-commit`-time check that `drizzle.config.json`
never returns (it is deleted here, but `main` still carries it, and `main` also still carries the credential-bearing
URL in Git history — out of scope for this patch, in scope for a separate owner decision); optionally revisit whether
`package.json` should grow the `db:*` scripts, since the deletion of the JSON config makes the "no scripted workflow"
state more visible.

**Unresolved questions for AO/AC**
1. Which tree produced `82`, and does it contain other uncommitted implementation files (my diff can only see the one
   test)? Please state the mirror's full `tests/unit/` inventory.
2. Was the *old* `drizzle.config.json` ever used against a live database in this project? The credential in it is a
   local-dev default; if the same user/password was ever reused on a reachable host, that is an owner decision under
   the credential-rotation policy, not a patch defect. (I did not and will not read the file's contents here.)
3. Should the patch also retire `drizzle.config.json` in the *original* checkout as a distinct, explicitly authorised
   step, or is reconciliation the moment for it? (`README_AK.md`: "Retire legacy credential-bearing configuration only
   if separately reconciled".)
4. Is there an intended follow-up for the four `jsonb_agg(distinct …)` facet lists (semesters/topics/types/platforms)?
   My analysis says they cannot carry an id key and do not need one; a one-line note in `CATALOG_ORDERING_REVIEW.md`
   would stop a future reviewer re-opening it.
5. Do you want the facet test's course half strengthened (M-5), given AC already discloses the diagnostic?

## 9. Privacy and operational compliance statement

I did not inspect, print, hash, copy, test, visit or load the four private link values, and did not request them.
Mechanically: no `.env*` file was opened (none exists in this sandbox — verified by name only, with `find`); I ran no
command that could load one **in or from the original checkout**, and my experiments ran in `/home/user/m1/tree`, a
tree built from a `git archive` of a commit (which cannot contain gitignored files) plus the package's own verified
bytes; I did **not** execute AC's `04-verification/control/*.sh|cjs` helpers, because `kit-final-config-check.cjs`
spawns real `drizzle-kit` and writes temporary `.env` files, and the offline/build helpers assume their `/work` bind
layout — running them here would neither add evidence nor be provably side-effect-free; I read them instead and
assessed their design (their network guard is sound: TLS denied, `dns.lookup` denied, loopback TCP allowed only for
`/work/.next/build/chunks/pool_entry-*` with `1024 < port < 65536` and `port !== 5432`). I did not read
`AO_NEW_CHAT_HANDOVER.md` in the same Dropbox folder for the same reason, nor `candidate-project/` handover bodies
beyond hashing, and I did not touch the sibling `.pgp` backups. I did not re-run any disclosure-screening against those
values — the point AC discloses in "Privacy-boundary exception during AO packaging": local screening scripts read the
four values into process memory to check for their presence in the artefacts, printing/copying/vising/transmitting
none of them; the package README states plainly that **external exposure has not been independently ruled out**. My
review neither confirms nor excludes that; it notes that the disclosure is prompt, scoped, and that this package
contains no link-bearing file at all.

Also enforced: no patch application (only an isolated copy was modified, in `/home/user/m1`), no reconciliation, no
merge/branch switch/history change, no hosted Supabase/Vercel/production access or change, no credential rotation, no
deployment, no browser download, and — as instructed — no final preservation backup. `git status --porcelain` in the
checkout is empty; `main` remains `4307a68…` and AC's branch remains `742c34a…`; my work is committed only on
`arena/9d055deb-presentation`, and only under `frontend-intelligence/`.

## 10. Final recommendation

> ### **APPROVE WITH CONDITIONS FOR AO REVIEW**
>
> **Code:** accept as-written. The Drizzle configuration's fail-closed validator, `PG*` rejection, discrete-field
> hand-off and constant-message redaction are correct under 38 hostile inputs, work inside the real Kit `generate`
> path, and remove the credential-bearing JSON from the project's default workflow. The facet migration is a
> 12-character, tie-break-only, guard-protected, ACL-preserving `create or replace` that leaves signature, volatility,
> invoker semantics, `search_path`, counts, filters and RLS provably untouched; its regression suite detected 5 of 5
> of my mutations, and its SQL is hash-pinned to the shipped bytes.
>
> **Conditions:** C1 reconcilability (patch form + 8 unmatched doc contexts), C2 the 82-vs-81 unit discrepancy, C3 the
> three test additions, C4 the read-only hosted preflight before any future authorisation, C5 audit-log
> double-counting, C6 `--config` pinning + `.env` trust-boundary wording.
>
> **Unverified, unchanged by this review:** browser/device/AT behaviour (blocked, no binaries — not passed); real
> `push`/`migrate` against a live server; hosted schema state, collation and ownership; unsanitised real-data build;
> production CSP/HSTS/MFA/preview isolation. **AO retains technical acceptance; the PO alone authorises integration;
> I recommend no integration, migration or hosted action at this time.**

---
*AK performed an independent review. The original checkout was not modified (the connector's temporary
`dropbox/` staging directory was relocated and removed; the tree is clean). No patch was applied to the repository,
nothing was merged, no branch was created or switched, no hosted service was contacted, no credential was rotated or
read, no deployment occurred, no browser was installed, and no final preservation backup was created. All build,
lint, test, Kit and PGlite activity happened in an isolated `/home/user/m1` scratch tree using files copied byte-for-
byte from the reviewed package, verified against `MANIFEST.md`.*
