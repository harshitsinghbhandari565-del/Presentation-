-- REVIEW REQUIRED: NOT APPLIED TO HOSTED SUPABASE.
-- Additive search-ranking RPC. Does not alter existing tables, records or RLS.
-- Requires explicit owner approval before application. Local PGlite tests apply it.
begin;

create or replace function public.search_catalog(
  query_text text default '',
  subject_id_filter uuid default null,
  course_id_filter uuid default null,
  semester_filter text default null,
  topic_filter text default null,
  document_type_filter text default null,
  platform_filter text default null,
  featured_filter boolean default false,
  sort_option text default 'relevance',
  page_size integer default 12,
  page_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with weighted as (
    select d.*,
      setweight(to_tsvector('simple', coalesce(d.title, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(d.topic, '') || ' ' || coalesce(array_to_string(d.keywords, ' '), '') || ' ' || coalesce(array_to_string(d.tags, ' '), '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(d.description, '')), 'D') as ranked_vector
    from public.documents d
    where d.publication_status = 'published'
      and (subject_id_filter is null or d.subject_id = subject_id_filter)
      and (course_id_filter is null or d.course_id = course_id_filter)
      and (semester_filter is null or d.semester = semester_filter)
      and (topic_filter is null or d.topic = topic_filter)
      and (document_type_filter is null or d.document_type = document_type_filter)
      and (platform_filter is null or d.platform = platform_filter)
      and (not featured_filter or d.is_featured)
  ), query as (
    select websearch_to_tsquery('simple', left(btrim(coalesce(query_text, '')), 200)) as tsq
  ), filtered as (
    select w.*, ts_rank(w.ranked_vector, q.tsq) as rank
    from weighted w cross join query q
    where btrim(coalesce(query_text, '')) = '' or w.ranked_vector @@ q.tsq
  ), ordered as (
    select f.*, row_number() over (
      order by
        case when sort_option = 'title' then f.title end asc,
        case when sort_option = 'newest' then f.created_at end desc nulls last,
        case when sort_option = 'relevance' and btrim(coalesce(query_text, '')) <> '' then f.rank end desc,
        case when sort_option = 'relevance' and btrim(coalesce(query_text, '')) = '' then f.is_featured end desc,
        f.title asc
    ) as rn
    from filtered f
    order by rn
    limit greatest(1, least(page_size, 48))
    offset greatest(0, page_offset)
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'documents', coalesce((select jsonb_agg(jsonb_build_object(
      'id', o.id, 'slug', o.slug, 'title', o.title, 'description', o.description,
      'original_url', o.original_url, 'platform', o.platform,
      'subject_id', o.subject_id, 'course_id', o.course_id, 'semester', o.semester,
      'topic', o.topic, 'document_type', o.document_type, 'thumbnail_url', o.thumbnail_url,
      'keywords', o.keywords, 'tags', o.tags, 'is_featured', o.is_featured,
      'publication_status', o.publication_status, 'created_at', o.created_at, 'updated_at', o.updated_at,
      'presentation_url', o.presentation_url, 'embed_url', o.embed_url, 'backup_links', o.backup_links,
      'subjects', (select jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug) from public.subjects s where s.id = o.subject_id),
      'courses', (select jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug) from public.courses c where c.id = o.course_id)
    ) order by o.rn) from ordered o), '[]'::jsonb)
  );
$$;

revoke all on function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer) from public;
grant execute on function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer) to anon, authenticated;

commit;
