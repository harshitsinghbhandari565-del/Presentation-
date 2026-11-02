-- REVIEW REQUIRED: NOT APPLIED TO HOSTED SUPABASE.
-- Additive search-ranking RPC. Does not alter tables, records, indexes or RLS.
-- Requires separate AO approval before application; local PGlite tests apply it.
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
  with parsed as (
    select websearch_to_tsquery('simple', left(btrim(coalesce(query_text, '')), 200)) as tsq
  ), query as (
    -- A query's AND terms may span taxonomy and document fields. OR together
    -- its actual normalized lexemes for an indexable candidate superset; the
    -- complete original tsquery (including phrases/NOT/OR) is enforced below.
    -- querytree = T means no positive restriction is safe (e.g. NOT-only).
    select p.tsq, querytree(p.tsq) = 'T' as unrestricted,
      coalesce((select string_agg(quote_literal(matches[1]), ' | ')::tsquery
        from regexp_matches(p.tsq::text, $rx$'((?:[^']|'')*)'$rx$, 'g') as matches), ''::tsquery) as candidate_tsq
    from parsed p
  ), matching_ids as (
    -- Positive document-field terms use the EXISTING documents_search_idx GIN.
    -- Do not build/rank a weighted vector for every published row before matching.
    select d.id
    from public.documents d cross join query q
    where d.publication_status = 'published'
      and (btrim(coalesce(query_text, '')) = '' or q.unrestricted or d.search_vector @@ q.candidate_tsq)
      and (subject_id_filter is null or d.subject_id = subject_id_filter)
      and (course_id_filter is null or d.course_id = course_id_filter)
      and (semester_filter is null or d.semester = semester_filter)
      and (topic_filter is null or d.topic = topic_filter)
      and (document_type_filter is null or d.document_type = document_type_filter)
      and (platform_filter is null or d.platform = platform_filter)
      and (not coalesce(featured_filter, false) or d.is_featured)
    union
    -- The existing generated document vector cannot contain joined taxonomy
    -- names. Search those actual names through their existing FK joins instead
    -- of inventing columns or changing the hosted table/generated column.
    select d.id
    from public.documents d cross join query q
    where d.publication_status = 'published'
      and not q.unrestricted
      and (
        d.subject_id in (select s.id from public.subjects s where to_tsvector('simple', s.name) @@ q.candidate_tsq)
        or d.course_id in (select c.id from public.courses c where to_tsvector('simple', c.name) @@ q.candidate_tsq)
      )
      and (subject_id_filter is null or d.subject_id = subject_id_filter)
      and (course_id_filter is null or d.course_id = course_id_filter)
      and (semester_filter is null or d.semester = semester_filter)
      and (topic_filter is null or d.topic = topic_filter)
      and (document_type_filter is null or d.document_type = document_type_filter)
      and (platform_filter is null or d.platform = platform_filter)
      and (not coalesce(featured_filter, false) or d.is_featured)
  ), weighted as (
    select d.*,
      setweight(to_tsvector('simple', d.title), 'A') ||
      setweight(to_tsvector('simple', d.topic || ' ' || public.document_terms(d.keywords) || ' ' || public.document_terms(d.tags)), 'B') ||
      setweight(to_tsvector('simple', s.name || ' ' || coalesce(c.name, '') || ' ' || coalesce(d.semester, '') || ' ' || d.document_type || ' ' || d.platform), 'C') ||
      setweight(to_tsvector('simple', d.description), 'D') as ranked_vector
    from matching_ids m
    join public.documents d on d.id = m.id
    join public.subjects s on s.id = d.subject_id
    left join public.courses c on c.id = d.course_id
  ), filtered as (
    -- A query may combine a taxonomy term with a document term. Check the
    -- combined vector only on the candidate union so cross-field AND semantics
    -- agree with compatibility search. No candidates means no row tokenization.
    select w.*, ts_rank(w.ranked_vector, q.tsq) as rank
    from weighted w cross join query q
    where btrim(coalesce(query_text, '')) = '' or w.ranked_vector @@ q.tsq
  ), ordered as (
    select f.*, row_number() over (
      order by
        case when sort_option = 'title' then f.title end asc,
        case when sort_option = 'newest' then f.created_at end desc nulls last,
        case when coalesce(sort_option, 'relevance') not in ('title', 'newest') and btrim(coalesce(query_text, '')) <> '' then f.rank end desc,
        case when coalesce(sort_option, 'relevance') not in ('title', 'newest') and btrim(coalesce(query_text, '')) = '' then f.is_featured end desc,
        f.title asc
    ) as rn
    from filtered f
    order by rn
    limit greatest(1, least(coalesce(page_size, 12), 48))
    offset greatest(0, coalesce(page_offset, 0))
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
      -- Scalar objects, not arrays: preserve normalizeRow's PostgREST shape.
      'subjects', (select jsonb_build_object('id', s.id, 'name', s.name, 'slug', s.slug) from public.subjects s where s.id = o.subject_id),
      'courses', (select jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug) from public.courses c where c.id = o.course_id)
    ) order by o.rn) from ordered o), '[]'::jsonb)
  );
$$;

comment on function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer) is
  'Unapplied review candidate. Defaults: query_text empty (browse), all nullable filters off, featured_filter false, sort_option relevance, page_size 12 (explicit NULL also 12; clamp 1..48), page_offset 0 (explicit NULL also 0; minimum 0). Query is trimmed and limited to 200 characters. Uses simple websearch matching, A/B/C/D ranking, security invoker/RLS. Positive document terms filter through documents_search_idx using an OR candidate superset; joined subject/course names supply additional candidates. Blank browsing and intrinsically broad negation-only/taxonomy-only queries may scan. No stemming or zero-result expansion.';

revoke all on function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer) from public;
grant execute on function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer) to anon, authenticated;

commit;
