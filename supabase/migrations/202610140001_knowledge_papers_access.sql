-- Optional secure preview registry. This migration is not run by the application.
-- Public requests receive only the first five PDF pages through the server function.
create table if not exists public.knowledge_papers_private (
  paper_id text primary key check (paper_id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  storage_path text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.knowledge_papers_private enable row level security;
revoke all on public.knowledge_papers_private from anon, authenticated;
grant select, insert, update, delete on public.knowledge_papers_private to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('knowledge-papers-private', 'knowledge-papers-private', false, 52428800, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins may manage private knowledge papers" on storage.objects
  for all to authenticated using (bucket_id = 'knowledge-papers-private' and public.is_admin())
  with check (bucket_id = 'knowledge-papers-private' and public.is_admin());
