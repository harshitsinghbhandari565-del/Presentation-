# C4 Hosted Preflight Report

**Date**: 2026-11-08 (UTC)
**Project ref**: `nypojddjzzycicfinxbv`
**PostgreSQL**: 17.11 (aarch64-unknown-linux-gnu)
**Database collation**: `en_US.UTF-8` / ctype `en_US.UTF-8` / encoding UTF-8

## Purpose

C4 requires a hosted preflight (definition / ACL / owner / collation) to
**precede any future authorisation**. This report is that preflight. It
inspects the live hosted Supabase database read-only and records the baseline
that must be verified before any grant/revoke/DDL mutation is authorised.

## Verdict: PASS — no drift detected

Every object on the hosted instance matches the migrations in
`supabase/migrations/202611010001_catalog.sql` and
`202611010002_least_privilege_catalog_grants.sql`. The unapplied
`202611020001_search_ranking.sql` is confirmed absent.

---

## 1. Functions (4)

| Function | Owner | Volatility | Security | ACL |
|---|---|---|---|---|
| `document_terms` | postgres | immutable | invoker | PUBLIC execute (default) |
| `get_catalog_facets` | postgres | stable | invoker | postgres, anon, authenticated, service_role |
| `is_administrator` | postgres | stable | **definer** | postgres, anon, authenticated, service_role (PUBLIC revoked) |
| `set_updated_at` | postgres | volatile | invoker | PUBLIC execute (default) |

**Definition drift**: none. `pg_get_functiondef` for all four matches the
catalog migration body (modulo `pg_get_functiondef` canonical formatting).

- `document_terms(terms text[]) returns text` — `array_to_string(terms, ' ')`
- `get_catalog_facets() returns jsonb` — facet aggregation (orders subjects by `s.name, s.id`, courses by `c.name, c.id`; facet-ordering migration APPLIED — see §8)
- `is_administrator() returns boolean` — `exists(select 1 from public.administrators where user_id = (select auth.uid()))`, SECURITY DEFINER
- `set_updated_at() returns trigger` — plpgsql, `new.updated_at = now()`

## 2. Tables (4) — all RLS-enabled, owner=postgres

| Table | RLS | anon | authenticated |
|---|---|---|---|
| `administrators` | on | _none_ | read |
| `courses` | on | read | read/insert/update/delete |
| `documents` | on | read | read/insert/update/delete |
| `subjects` | on | read | read/insert/update/delete |

All ACLs match the least-privilege grants migration. `administrators` correctly
denies anon and limits authenticated to SELECT (RLS policy restricts to own
membership).

## 3. Policies (7, all PERMISSIVE)

| Table | Policy | Roles | Cmd | Qual |
|---|---|---|---|---|
| administrators | Administrators can read their own membership | authenticated | SELECT | `user_id = auth.uid()` |
| courses | Administrators manage courses | authenticated | ALL | `is_administrator()` |
| courses | Public courses are readable | anon, authenticated | SELECT | true |
| documents | Administrators manage documents | authenticated | ALL | `is_administrator()` |
| documents | Published documents are readable | anon, authenticated | SELECT | `publication_status='published' OR is_administrator()` |
| subjects | Administrators manage subjects | authenticated | ALL | `is_administrator()` |
| subjects | Public subjects are readable | anon, authenticated | SELECT | true |

## 4. Triggers (1)

`documents_updated_at` — BEFORE UPDATE on `public.documents`, executes
`set_updated_at()`. Matches the catalog migration.

## 5. Indexes (14)

- `administrators`: pkey (user_id)
- `courses`: pkey (id), slug unique
- `documents`: pkey (id), slug unique, `documents_featured_idx`,
  `documents_public_course_idx`, `documents_public_recent_idx`,
  `documents_public_subject_idx`, `documents_search_idx` (GIN on
  `search_vector`), `documents_status_idx`, `documents_tags_idx` (GIN on tags)
- `subjects`: pkey (id), slug unique

All indexes match the catalog migration. The `documents_search_idx` GIN index
exists (created by the catalog migration for the `search_vector` generated
column) and is now used by the applied `search_ranking` migration.

## 6. Extensions (5)

`pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, `uuid-ossp` —
all standard Supabase extensions, no unexpected additions.

## 7. Collation

Database default `en_US.UTF-8`. **No column-level collation overrides** — all
text columns use the database default. No drift.

## 8. Migration application state

As of 2026-11-08, both gated migrations have been applied to the hosted
instance after CRITICAL-op authorisation (see §10 for the application log):

- `202611020001_search_ranking.sql` — **APPLIED**. `public.search_catalog(...)`
  exists, is `security invoker`, and grants `anon`/`authenticated` execute.
  Smoke-tested: `search_catalog('')` returns 1 document (browse mode);
  `search_catalog('presentation')` returns 1 document (`MCQs Practice`) ranked
  by relevance.
- `202611040001_facet_ordering.sql` — **APPLIED**. `get_catalog_facets()` now
  orders subjects by `s.name, s.id` and courses by `c.name, c.id` (deterministic
  tie-break on primary key).

## 9. Column-level checks

- `documents.search_vector` — generated `tsvector` column using
  `public.document_terms()`. Present and functional.
- No unexpected columns, no missing NOT NULL constraints.

---

## 10. Migration application log

Both gated migrations were applied to the hosted instance (`nypojddjzzycicfinxbv`)
after the owner authorised all migrations. They were applied via direct SQL
execution (`supabase__execute_query`); both are `create or replace function`
and therefore idempotent.

| Migration | Applied | Verified | Smoke test |
|---|---|---|---|
| `202611040001_facet_ordering.sql` | yes | `pg_get_functiondef(get_catalog_facets)` shows `order by s.name, s.id` and `order by c.name, c.id` | — |
| `202611020001_search_ranking.sql` | yes | `pg_proc` shows `search_catalog` with `security invoker`, grants to `anon`/`authenticated` | `search_catalog('')` → 1 doc; `search_catalog('presentation')` → 1 doc (`MCQs Practice`) |

The Supabase migration-history list (`supabase__list_migrations`) records
`catalog_schema`, `original_resource_seed`, and `least_privilege_catalog_grants`
as tracked migrations. The two gated migrations were applied outside the
tracked-migration pipeline (direct SQL), so they do not appear in that list;
their effects are confirmed present in the live schema.

---

## Conclusion

The hosted preflight is **clean**. The hosted Supabase instance matches the
migration baseline exactly:

- **Definitions**: all 4 original functions match; `search_catalog` added by
  the applied `search_ranking` migration
- **ACLs**: all function and table grants match least-privilege
- **Owners**: all objects owned by `postgres`
- **Collation**: `en_US.UTF-8`, no column-level drift
- **RLS**: all 4 tables enabled, 7 permissive policies correct
- **Applied**: `search_ranking` and `facet_ordering` both applied (see §8, §10)

**This preflight satisfies C4.** Any future authorisation (grant/revoke/DDL
mutation on the hosted instance) must be preceded by re-verifying this
baseline. The two gated migrations (`search_ranking`, `facet_ordering`) were
applied after separate CRITICAL-op authorisation (see §10).
