-- Applied to the existing hosted project after owner approval; review before applying elsewhere.
-- Requires public.is_administrator() from the catalog migration. No anonymous
-- submissions: drafts stay browser-local; publication is administrator-only.
begin;
create table public.shared_sql_queries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  sql_text text not null check (char_length(trim(sql_text)) between 1 and 100000),
  dialect text not null check (dialect in ('sqlite', 'postgresql', 'mysql')),
  publication_status text not null default 'draft' check (publication_status in ('draft', 'published', 'archived')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index shared_sql_queries_public_idx on public.shared_sql_queries (dialect, updated_at desc) where publication_status = 'published';
create table public.shared_sql_query_versions (
  id bigint generated always as identity primary key,
  query_id uuid not null references public.shared_sql_queries(id) on delete restrict,
  title text not null, description text not null, sql_text text not null,
  dialect text not null, publication_status text not null,
  changed_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index shared_sql_query_versions_query_idx on public.shared_sql_query_versions (query_id, id desc);
alter table public.shared_sql_queries enable row level security;
alter table public.shared_sql_query_versions enable row level security;
revoke all on public.shared_sql_queries, public.shared_sql_query_versions from public, anon, authenticated;
grant select (id, title, description, sql_text, dialect, publication_status, updated_at) on public.shared_sql_queries to anon, authenticated;
grant insert, update on public.shared_sql_queries to authenticated;
grant select on public.shared_sql_query_versions to authenticated;
create policy "published queries are readable" on public.shared_sql_queries for select to anon, authenticated using (publication_status = 'published' or (select public.is_administrator()));
create policy "only administrators insert queries" on public.shared_sql_queries for insert to authenticated with check ((select public.is_administrator()) and created_by = (select auth.uid()));
create policy "only administrators update queries" on public.shared_sql_queries for update to authenticated using ((select public.is_administrator())) with check ((select public.is_administrator()));
create policy "only administrators read query history" on public.shared_sql_query_versions for select to authenticated using ((select public.is_administrator()));
-- All writes to history are made only by this fixed-search-path trigger. Public
-- versions are intentionally not exposed, so a private revision cannot leak.
create function public.record_shared_sql_query_version() returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.shared_sql_query_versions(query_id, title, description, sql_text, dialect, publication_status, changed_by)
    values (new.id, new.title, new.description, new.sql_text, new.dialect, new.publication_status, auth.uid());
  return new;
end $$;
-- An AFTER trigger writes the FK-linked initial record; timestamps are handled
-- in a separate BEFORE trigger so snapshots always match the stored row.
create function public.stamp_shared_sql_query() returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  new.created_by := old.created_by;
  new.created_at := old.created_at;
  new.updated_at := now();
  return new;
end $$;
revoke all on function public.record_shared_sql_query_version(), public.stamp_shared_sql_query() from public, anon, authenticated;
create trigger stamp_shared_sql_query before update on public.shared_sql_queries for each row execute function public.stamp_shared_sql_query();
create trigger record_shared_sql_query_version after insert or update on public.shared_sql_queries for each row execute function public.record_shared_sql_query_version();
commit;
