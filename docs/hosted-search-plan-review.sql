-- HOSTED EXECUTION IS NOT AUTHORIZED. AO/PO must separately approve inspection.
-- Local preparation only: exact deterministic V1 query body, with function
-- arguments mapped to positional placeholders. No RPC needs to be installed.
-- Execute the whole file in ONE session only, after explicit approval.
-- PREPARE/DEALLOCATE and SET LOCAL are session/transaction-only; no DDL/DML.
-- EXPLAIN ANALYZE executes each SELECT and consumes real read resources.
BEGIN READ ONLY;
SET LOCAL statement_timeout = '15s';
SET LOCAL search_path = '';
SET LOCAL ROLE anon;
SET LOCAL request.jwt.claims = '{}';
PREPARE ac_search_v1_plan (text,uuid,uuid,text,text,text,text,boolean,text,integer,integer) AS
  with parsed as (
    select websearch_to_tsquery('simple', left(btrim(coalesce($1, '')), 200)) as tsq
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
      and (btrim(coalesce($1, '')) = '' or q.unrestricted or d.search_vector @@ q.candidate_tsq)
      and ($2 is null or d.subject_id = $2)
      and ($3 is null or d.course_id = $3)
      and ($4 is null or d.semester = $4)
      and ($5 is null or d.topic = $5)
      and ($6 is null or d.document_type = $6)
      and ($7 is null or d.platform = $7)
      and (not coalesce($8, false) or d.is_featured)
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
      and ($2 is null or d.subject_id = $2)
      and ($3 is null or d.course_id = $3)
      and ($4 is null or d.semester = $4)
      and ($5 is null or d.topic = $5)
      and ($6 is null or d.document_type = $6)
      and ($7 is null or d.platform = $7)
      and (not coalesce($8, false) or d.is_featured)
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
    where btrim(coalesce($1, '')) = '' or w.ranked_vector @@ q.tsq
  ), ordered as (
    select f.*, row_number() over (
      order by
        case when $9 = 'title' then f.title end asc,
        case when $9 = 'newest' then f.created_at end desc nulls last,
        case when coalesce($9, 'relevance') not in ('title', 'newest') and btrim(coalesce($1, '')) <> '' then f.rank end desc,
        case when coalesce($9, 'relevance') not in ('title', 'newest') and btrim(coalesce($1, '')) = '' then f.is_featured end desc,
        f.title asc,
        -- UUID primary keys complete the order when every visible sort key ties.
        -- Keep this inside row_number so pagination and aggregation use it too.
        f.id asc
    ) as rn
    from filtered f
    order by rn
    limit greatest(1, least(coalesce($10, 12), 48))
    offset greatest(0, coalesce($11, 0))
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
-- Known original title term; select approved representative inputs before running.
EXPLAIN (ANALYZE, BUFFERS, SETTINGS, FORMAT JSON)
EXECUTE ac_search_v1_plan('MCQs',NULL,NULL,NULL,NULL,NULL,NULL,false,'relevance',12,0);
-- Blank browse: potentially broad, but does not exercise a positive text index.
EXPLAIN (ANALYZE, BUFFERS, SETTINGS, FORMAT JSON)
EXECUTE ac_search_v1_plan('',NULL,NULL,NULL,NULL,NULL,NULL,false,'relevance',12,0);
-- Out-of-range/deep offset on current small collections still has real scan cost.
EXPLAIN (ANALYZE, BUFFERS, SETTINGS, FORMAT JSON)
EXECUTE ac_search_v1_plan('MCQs',NULL,NULL,NULL,NULL,NULL,NULL,false,'relevance',12,1980);
-- Actual simple published-document predicate; normal planner, not forced GIN.
EXPLAIN (ANALYZE, BUFFERS, SETTINGS, FORMAT JSON)
SELECT d.id FROM public.documents AS d
WHERE d.publication_status = 'published'
  AND d.search_vector @@ websearch_to_tsquery('simple','MCQs');
DEALLOCATE ac_search_v1_plan;
ROLLBACK;
