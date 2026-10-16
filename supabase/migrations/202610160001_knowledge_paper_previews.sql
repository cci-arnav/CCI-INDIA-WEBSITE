-- Store mappings for generated private previews independently of original PDFs.
-- This migration does not create Storage buckets or modify existing policies.
create table if not exists public.knowledge_paper_previews_private (
  paper_id text primary key check (paper_id ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  preview_storage_path text not null unique,
  source_sha256 text not null check (source_sha256 ~ '^[a-f0-9]{64}$'),
  source_page_count integer not null check (source_page_count > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.knowledge_paper_previews_private enable row level security;
revoke all on public.knowledge_paper_previews_private from anon, authenticated;
grant select, insert, update on public.knowledge_paper_previews_private to service_role;
