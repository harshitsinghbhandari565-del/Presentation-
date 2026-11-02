# Supabase database verification

Date: 2026-11-01
Target: Supabase project `nypojddjzzycicfinxbv`, region `eu-north-1`
Scope: owner-approved exact catalog migration, original-resource seed, and separate least-privilege grant remediation. No Auth settings, administrator accounts, Vercel environment variables, or deployment configuration were changed.

## Applied SQL

The connector applied the exact reviewed file contents through its transactional migration workflow.

| Repository file | Hosted migration name | Hosted version | File MD5 | Hosted stored SQL MD5 | Match |
| --- | --- | --- | --- | --- | --- |
| `supabase/migrations/202611010001_catalog.sql` | `catalog_schema` | `20261101134604` | `908c5e4af52cf30435b69f0d70449282` | `908c5e4af52cf30435b69f0d70449282` | Yes |
| `supabase/seed.sql` | `original_resource_seed` | `20261101135344` | `77838cac486d667af90e82a5e2af86dd` | `77838cac486d667af90e82a5e2af86dd` | Yes |
| `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` | `least_privilege_catalog_grants` | `20261101153928` | `5ab711b9f3fc25303f84e5490224a848` | `5ab711b9f3fc25303f84e5490224a848` | Yes |

Unexpected metadata difference: the connector generated hosted version timestamps instead of preserving the repository filename timestamps. The SQL content itself matched exactly. The seed was also recorded as a hosted migration because the connector's transactional migration workflow was used for the approved SQL files.

Repository SHA-256 fingerprints:

- Catalog migration: `9ea984eed7532d6cf44b986f50151717f4858ab0b57d04bf89b08f5a02e45495`
- Seed: `53e2de2c4377a156ec0f880449384a62376e72552a8dab2c172ba8c90d8cde5c`
- Least-privilege grant remediation: `4ffab48b539b4b247641f5d6a1b74f6417304f23997f7ebe3a659610d1b7be3a`
- Original resource JSON: `1a021afd9c49a2bc81d09076cee934b653282b45072b1bc483335ba3ffa0a059`

## Schema verification

Read-only hosted checks confirmed, before and after the grant remediation:

- 4 application tables: `administrators`, `subjects`, `courses`, `documents`.
- RLS enabled on all 4 tables.
- 7 RLS policies.
- 29 constraints across the application tables.
- 14 indexes across the application tables.
- 9 indexes on `documents`: 7 explicit indexes plus primary-key and unique-slug indexes.
- 4 expected functions: `is_administrator`, `document_terms`, `set_updated_at`, `get_catalog_facets`.
- 1 expected trigger: `documents_updated_at`.
- `is_administrator()` is `SECURITY DEFINER` with empty `search_path`.
- `get_catalog_facets()` is security-invoker with empty `search_path`.
- Document subject/course foreign keys use `ON DELETE RESTRICT`.
- Administrator membership foreign key uses `ON DELETE CASCADE` to Auth users.

The grant remediation did not create, alter or drop tables, functions, triggers, constraints, indexes or RLS policies.

## Catalog data verification

Final read-only counts:

- `subjects`: 1
- `courses`: 1
- `documents`: 1
- `administrators`: 0
- `auth.users`: 0
- temporary RLS/grant probe rows: 0

The seeded record is `english-lost-spring-mcqs`, published and featured, under English / Class 12. Hosted equality checks returned true for:

- original Google Slides URL
- presentation URL
- Google embed URL
- Dropbox backup link JSON, including the exact backup URL

The original repository JSON remained byte-identical to baseline. The hosted document row fingerprint remained `2b7db1a601cd43a0f6a9d88556b74033` before and after the grant remediation. Its `created_at` and `updated_at` remained equal to the original seed timestamp `2026-11-01T13:53:44.028945+00:00`. Full-text search for `lost spring` returned the seeded record. The facets RPC returned the expected English subject, Class 12 course, Presentation type, Google Slides platform and topic.

## Least-privilege grant remediation

### Finding

Hosted inspection after the initial migration found Supabase default privileges had granted `anon` and `authenticated` full table privileges on `public.subjects`, `public.courses` and `public.documents`, including:

- SELECT, INSERT, UPDATE, DELETE
- TRUNCATE
- REFERENCES
- TRIGGER
- MAINTAIN

The `administrators` table was correctly restricted to authenticated SELECT only.

The expected RLS policies blocked unauthorized INSERT/UPDATE/DELETE in the probes. However, `TRUNCATE` is not controlled by RLS, and the broad default grants violated the reviewed least-privilege design. No destructive workaround was attempted. The owner approved a separate grant-only remediation.

### Applied remediation

The approved migration `supabase/migrations/202611010002_least_privilege_catalog_grants.sql` was applied as hosted migration `20261101153928` (`least_privilege_catalog_grants`). It:

- revoked all privileges on `public.subjects`, `public.courses` and `public.documents` from `anon` and `authenticated`;
- granted SELECT on those tables to `anon` and `authenticated`;
- granted INSERT, UPDATE and DELETE on those tables to `authenticated` only;
- left existing RLS policies as the authorization boundary;
- did not change `postgres` or `service_role` privileges;
- did not change `public.administrators` privileges;
- did not change global Supabase default privileges.

### Effective privileges after remediation

For each of `public.subjects`, `public.courses` and `public.documents`:

| Role | SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER | MAINTAIN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `anon` | Yes | No | No | No | No | No | No | No |
| `authenticated` | Yes | Yes | Yes | Yes | No | No | No | No |

Verified ACL for each catalog table:

```text
{postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres,anon=r/postgres,authenticated=arwd/postgres}
```

`public.administrators` remained unchanged: `authenticated` has SELECT only, and RLS restricts that SELECT to the caller's own membership row. `anon` has no access.

### Preserved security and data fingerprints

Before/after the grant remediation, these hosted fingerprints were identical:

- Global public-schema default ACL fingerprint: `062965f518df0b5fa863219c657b026a`
- RLS policy fingerprint: `7ad85d0414c5da1c1f0420ed3d62af2c`
- Policy count: 7
- Object counts: 4 tables / 4 functions / 1 trigger / 29 constraints / 14 indexes
- Row counts: 1 subject / 1 course / 1 document / 0 administrators / 0 Auth users
- Original document row fingerprint: `2b7db1a601cd43a0f6a9d88556b74033`
- Original Google/Dropbox URL equality checks: true

### Residual default-privilege note

Global Supabase default privileges were intentionally left unchanged, as required by the approval. Therefore, any future `CREATE TABLE` in `public` may again receive broad default grants for `anon`/`authenticated`. Future table migrations must include explicit least-privilege `REVOKE`/`GRANT` statements and post-migration privilege verification. Do not change global defaults without separate owner approval.

## RLS behavior verified after remediation

Using rollback-only hosted SQL probes:

- Anonymous role could read the published document, subject and course: 1 document / 1 subject / 1 course.
- Anonymous facets RPC returned 1 subject and 1 course.
- Anonymous full-text search for `lost spring` returned 1 match.
- Anonymous `is_administrator()` returned false and `row_security_active` was true for the catalog tables.
- Anonymous INSERT into `public.documents` was denied with `42501: permission denied for table documents`.
- Anonymous UPDATE and DELETE against `public.documents` were denied with `42501: permission denied for table documents`.
- Anonymous SELECT from `public.administrators` was denied with `42501: permission denied for table administrators`.
- Authenticated non-administrator role could read the published document, subject and course: 1 / 1 / 1.
- Authenticated non-administrator saw 0 administrator membership rows and `is_administrator()` returned false.
- Authenticated non-administrator INSERT into `public.documents` was denied with `42501: new row violates row-level security policy for table "documents"`.
- Authenticated non-administrator INSERT into `public.subjects` was denied with `42501: new row violates row-level security policy for table "subjects"`.
- Authenticated non-administrator UPDATE and DELETE against the original document returned 0 affected rows.
- No probe rows persisted. No administrator or Auth user was created.

These are database-role probes, not a completed hosted browser/Auth/PostgREST end-to-end verification. The deployed application still lacks Supabase environment variables and remains in compatibility mode.

## Local regression tests

`npm run test:db` passed 15/15 after the remediation:

- 7 new grant-regression tests covering the privilege matrix, idempotence, anonymous reads/facets/search, anonymous write denial, authenticated non-admin RLS denial, exact original URL preservation, and local-only authorized administrator CRUD under the new grants.
- 8 existing migration/seed/RLS policy tests.

`npm run lint`, `npm run typecheck` and `npm run test:unit` also passed. ESLint was updated to ignore generated Playwright/test-result artifacts so local quality gates do not lint bundled browser-report code.

## Errors encountered during verification

- Two initial insert-probe calls and one final-state call returned transient Supabase API 502 responses. Subsequent read-only checks confirmed the database was healthy, no probe rows persisted, and the original resource remained intact.
- A privilege introspection query initially used an invalid OID comparison and was corrected to join `pg_roles`.
- A migration-history query initially assumed `statements` was JSONB; it is `text[]`, and the corrected query used `cardinality`/`md5`.
- Initial DML probes used nested data-modifying CTEs, which PostgreSQL rejects; corrected top-level rollback-only probes were used.
- Post-remediation anonymous write probes returned expected `42501 permission denied` errors. The connector hint suggesting `GRANT INSERT/UPDATE/DELETE ... TO anon` was not followed; that would reverse the approved least-privilege remediation.
- Local `npm run lint` initially failed because generated `playwright-report/` assets were not ignored by ESLint. The ESLint ignore list was aligned with the repository's generated-artifact ignores; no application source was changed.

None of these verification-query errors changed catalog data. No `TRUNCATE` was executed.

## Status

The excessive catalog-table privilege blocker is **resolved**. The hosted database now has the reviewed schema, original resource, and verified least-privilege catalog grants. RLS remains the authorization boundary for authenticated writes.

Production activation is still **not complete**. Auth settings, administrator creation, Vercel Supabase environment variables, deployed CRUD/public propagation, hosted Auth/cookie verification, and external document permission checks remain intentionally untouched and unverified. Do not claim production readiness.