-- Least-privilege remediation for hosted Supabase default table grants.
-- Approved by the owner on 2026-11-01 for project nypojddjzzycicfinxbv.
--
-- Grant-only migration:
--   * does not insert, update or delete records
--   * does not create, alter or drop tables, functions, triggers or policies
--   * does not change global Supabase default privileges
--
-- Existing RLS policies remain the authorization boundary. Authenticated
-- clients receive DML privileges only so administrator RLS policies can allow
-- authorized writes; anonymous clients receive read-only access.

begin;

revoke all on public.subjects, public.courses, public.documents from anon, authenticated;

grant select on public.subjects, public.courses, public.documents to anon, authenticated;
grant insert, update, delete on public.subjects, public.courses, public.documents to authenticated;

commit;
