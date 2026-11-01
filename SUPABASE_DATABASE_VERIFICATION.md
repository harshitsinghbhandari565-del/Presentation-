# Supabase database verification

Date: 2026-11-01
Target: Supabase project `nypojddjzzycicfinxbv`, region `eu-north-1`
Scope: owner-approved exact catalog migration and original-resource seed only. No Auth settings, administrator accounts, Vercel environment variables, or deployment configuration were changed.

## Applied SQL

The connector applied the exact reviewed file contents through its transactional migration workflow.

| Repository file | Hosted migration name | Hosted version | File MD5 | Hosted stored SQL MD5 | Match |
| --- | --- | --- | --- | --- | --- |
| `supabase/migrations/202611010001_catalog.sql` | `catalog_schema` | `20261101134604` | `908c5e4af52cf30435b69f0d70449282` | `908c5e4af52cf30435b69f0d70449282` | Yes |
| `supabase/seed.sql` | `original_resource_seed` | `20261101135344` | `77838cac486d667af90e82a5e2af86dd` | `77838cac486d667af90e82a5e2af86dd` | Yes |

Unexpected metadata difference: the connector generated hosted version timestamps instead of preserving the repository filename timestamp `202611010001`. The SQL content itself matched exactly. The seed was also recorded as a hosted migration because the connector's transactional migration workflow was used for both approved SQL files.

Repository SHA-256 fingerprints remained:

- Migration: `9ea984eed7532d6cf44b986f50151717f4858ab0b57d04bf89b08f5a02e45495`
- Seed: `53e2de2c4377a156ec0f880449384a62376e72552a8dab2c172ba8c90d8cde5c`
- Original resource JSON: `1a021afd9c49a2bc81d09076cee934b653282b45072b1bc483335ba3ffa0a059`

## Schema verification

Read-only hosted checks confirmed:

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

## Catalog data verification

Final read-only counts:

- `subjects`: 1
- `courses`: 1
- `documents`: 1
- `administrators`: 0
- `auth.users`: 0
- temporary RLS probe rows: 0

The seeded record is `english-lost-spring-mcqs`, published and featured, under English / Class 12. Hosted equality checks returned true for:

- original Google Slides URL
- presentation URL
- Google embed URL
- Dropbox backup link JSON, including the exact backup URL

The original repository JSON remained byte-identical to baseline. The hosted record's `created_at` and `updated_at` were equal after seeding, and no probe rows persisted. Full-text search for `lost spring` returned the seeded record. The facets RPC returned the expected English subject, Class 12 course, Presentation type, Google Slides platform and topic.

## RLS behavior verified

Using rollback-only hosted SQL probes:

- Anonymous role could read the published document, subject and course, and received the expected facets.
- Anonymous role could not select administrator membership.
- Anonymous update/delete attempts against the original document returned zero affected rows.
- Authenticated non-administrator update/delete attempts returned zero affected rows.
- Anonymous insert attempt was denied with `42501: new row violates row-level security policy for table "documents"`.
- Authenticated non-administrator insert attempt was denied with the same RLS error.
- `is_administrator()` returned false for anonymous and authenticated non-administrator probes.
- No administrator or Auth user was created.

These are database-role probes, not a completed hosted browser/Auth/PostgREST end-to-end verification.

## Unexpected security finding: excessive default table privileges

Hosted inspection found Supabase default privileges had granted `anon` and `authenticated` full table privileges on `public.subjects`, `public.courses` and `public.documents`, including:

- SELECT, INSERT, UPDATE, DELETE
- TRUNCATE
- REFERENCES
- TRIGGER

The `administrators` table was correctly restricted to authenticated SELECT only.

The expected RLS policies blocked unauthorized INSERT/UPDATE/DELETE in the probes. However, `TRUNCATE` is not controlled by RLS, and the broad default grants violate the reviewed least-privilege design. This is a production blocker. No destructive workaround was attempted and no grant changes were applied without owner approval.

### Proposed non-destructive remediation

Apply a separate reviewed transactional migration that revokes excess privileges from the three catalog tables and re-grants only the intended privileges:

```sql
begin;

revoke all on public.subjects, public.courses, public.documents from anon, authenticated;

grant select on public.subjects, public.courses, public.documents to anon, authenticated;
grant insert, update, delete on public.subjects, public.courses, public.documents to authenticated;

commit;
```

This preserves existing rows and the existing RLS policies. It does not change `postgres` or `service_role` privileges. It does not alter global default privileges; future migrations should explicitly set least-privilege grants.

## Errors encountered during verification

- Two initial insert-probe calls and one final-state call returned transient Supabase API 502 responses. Subsequent read-only checks confirmed the database was healthy, no probe rows persisted, and the original resource remained intact.
- A privilege introspection query initially used an invalid OID comparison and was corrected to join `pg_roles`.
- A migration-history query initially assumed `statements` was JSONB; it is `text[]`, and the corrected query used `cardinality`/`md5`.
- Initial DML probes used nested data-modifying CTEs, which PostgreSQL rejects; corrected top-level rollback-only probes were used.

None of these verification-query errors changed catalog data.

## Status

Database schema and original resource are applied and verified. Production activation is **blocked** by the excessive default table privileges until the owner approves the least-privilege remediation. Auth, administrator creation, Vercel environment configuration and deployment remain intentionally untouched.
