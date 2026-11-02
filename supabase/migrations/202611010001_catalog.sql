-- Review before applying. Additive migration; does not delete existing data.
-- Run through Supabase migrations, not by importing this file into browser code.
begin;

create table public.administrators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.administrators enable row level security;
revoke all on public.administrators from anon, authenticated;
grant select on public.administrators to authenticated;
create policy "Administrators can read their own membership" on public.administrators
  for select to authenticated using (user_id = (select auth.uid()));

create function public.is_administrator() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.administrators where user_id = (select auth.uid())); $$;
revoke all on function public.is_administrator() from public;
grant execute on function public.is_administrator() to anon, authenticated;

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  created_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  created_at timestamptz not null default now()
);

-- text[] has a stable textual representation; this wrapper makes that explicit
-- so the generated search column is valid on PostgreSQL 15+.
create function public.document_terms(terms text[]) returns text
language sql immutable parallel safe set search_path = ''
as $$ select array_to_string(terms, ' '); $$;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 100),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  description text not null check (char_length(btrim(description)) between 10 and 3000),
  original_url text not null check (char_length(original_url) <= 4096 and original_url ~ '^https?://[^[:space:]]+$' and original_url !~ '^https?://[^/]*@'),
  platform text not null check (platform in ('Google Drive','Google Docs','Google Sheets','Google Slides','Dropbox','Other')),
  subject_id uuid not null references public.subjects(id) on delete restrict,
  course_id uuid references public.courses(id) on delete restrict,
  semester text check (semester is null or char_length(semester) between 1 and 60),
  topic text not null check (char_length(btrim(topic)) between 2 and 160),
  document_type text not null check (document_type in ('Presentation','Notes','Worksheet','Practice questions','Reference','Other')),
  thumbnail_url text check (thumbnail_url is null or (thumbnail_url ~ '^https?://[^[:space:]]+$' and char_length(thumbnail_url) <= 4096)),
  keywords text[] not null default '{}' check (cardinality(keywords) <= 20),
  tags text[] not null default '{}' check (cardinality(tags) <= 20),
  is_featured boolean not null default false,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','archived')),
  presentation_url text check (presentation_url is null or (presentation_url ~ '^https?://[^[:space:]]+$' and char_length(presentation_url) <= 4096)),
  embed_url text check (embed_url is null or (embed_url like 'https://docs.google.com/%' and char_length(embed_url) <= 4096)),
  backup_links jsonb not null default '[]' check (jsonb_typeof(backup_links) = 'array' and jsonb_array_length(backup_links) <= 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple', title || ' ' || description || ' ' || topic || ' ' || coalesce(semester,'') || ' ' || document_type || ' ' || platform || ' ' || public.document_terms(keywords) || ' ' || public.document_terms(tags))
  ) stored
);

create index documents_public_recent_idx on public.documents (created_at desc) where publication_status = 'published';
create index documents_public_subject_idx on public.documents (subject_id, created_at desc) where publication_status = 'published';
create index documents_public_course_idx on public.documents (course_id, created_at desc) where publication_status = 'published';
create index documents_featured_idx on public.documents (is_featured, title) where publication_status = 'published';
create index documents_search_idx on public.documents using gin (search_vector);
create index documents_tags_idx on public.documents using gin (tags);
create index documents_status_idx on public.documents (publication_status, updated_at desc);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

alter table public.subjects enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;

create policy "Public subjects are readable" on public.subjects for select to anon, authenticated using (true);
create policy "Public courses are readable" on public.courses for select to anon, authenticated using (true);
create policy "Published documents are readable" on public.documents for select to anon, authenticated
  using (publication_status = 'published' or (select public.is_administrator()));
create policy "Administrators manage subjects" on public.subjects for all to authenticated
  using ((select public.is_administrator())) with check ((select public.is_administrator()));
create policy "Administrators manage courses" on public.courses for all to authenticated
  using ((select public.is_administrator())) with check ((select public.is_administrator()));
create policy "Administrators manage documents" on public.documents for all to authenticated
  using ((select public.is_administrator())) with check ((select public.is_administrator()));

grant select on public.subjects, public.courses, public.documents to anon, authenticated;
grant insert, update, delete on public.subjects, public.courses, public.documents to authenticated;

create function public.get_catalog_facets() returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'subjects', coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'slug',s.slug,'count',(select count(*) from public.documents d where d.subject_id=s.id and d.publication_status='published'),'topics',coalesce((select jsonb_agg(distinct d.topic order by d.topic) from public.documents d where d.subject_id=s.id and d.publication_status='published'),'[]'::jsonb)) order by s.name)
      from public.subjects s where exists(select 1 from public.documents d where d.subject_id=s.id and d.publication_status='published')), '[]'::jsonb),
    'courses', coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slug',c.slug) order by c.name)
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
