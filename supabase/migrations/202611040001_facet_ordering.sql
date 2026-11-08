-- Facet ordering: deterministic tie-break for subject and course facets.
--
-- The applied public.get_catalog_facets() orders subjects by s.name and
-- courses by c.name. When two subjects share a name (or two courses share a
-- name), jsonb_agg's ORDER BY is non-deterministic for ties. This migration
-- adds a secondary sort on the primary key (s.id / c.id) so the facet output
-- is stable across calls and pages.
--
-- Precondition: the function must already exist (created by
-- 202611010001_catalog.sql). If it does not, this migration fails closed.
--
-- Diff vs applied: two 6-char insertions only -- `, s.id` after
-- `order by s.name` and `, c.id` after `order by c.name`.
begin;

do $$
begin
  if to_regprocedure('public.get_catalog_facets()') is null then
    raise exception 'public.get_catalog_facets() must exist before applying facet ordering migration';
  end if;
end $$;

create or replace function public.get_catalog_facets() returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'subjects', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'slug',s.slug,'count',(select count(*) from public.documents d where d.subject_id=s.id and d.publication_status='published'),'topics',coalesce((select jsonb_agg(distinct d.topic order by d.topic) from public.documents d where d.subject_id=s.id and d.publication_status='published'),'[]'::jsonb)) order by s.name, s.id)
      from public.subjects s where exists(select 1 from public.documents d where d.subject_id=s.id and d.publication_status='published')), '[]'::jsonb),
    'courses', coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug) order by c.name, c.id)
      from public.courses c where exists(select 1 from public.documents d where d.course_id=c.id and d.publication_status='published')), '[]'::jsonb),
    'semesters', coalesce((select jsonb_agg(distinct d.semester order by d.semester) from public.documents d where d.publication_status='published' and d.semester is not null), '[]'::jsonb),
    'topics', coalesce((select jsonb_agg(distinct d.topic order by d.topic) from public.documents d where d.publication_status='published'), '[]'::jsonb),
    'types', coalesce((select jsonb_agg(distinct d.document_type order by d.document_type) from public.documents d where d.publication_status='published'), '[]'::jsonb),
    'platforms', coalesce((select jsonb_agg(distinct d.platform order by d.platform) from public.documents d where d.publication_status='published'), '[]'::jsonb)
  );
$$;

revoke all on function public.get_catalog_facets() from public;
grant execute on function public.get_catalog_facets() to anon, authenticated;

commit;
