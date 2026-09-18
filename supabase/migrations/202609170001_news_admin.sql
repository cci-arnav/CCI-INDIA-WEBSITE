-- Run in the Supabase SQL editor (or with the Supabase CLI) once per project.
create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = check_user); $$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

create policy "Admins can read their authorization"
on public.admins for select to authenticated
using (user_id = auth.uid());

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 240),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 800),
  content text,
  featured_image_url text,
  featured_image_path text,
  category text not null default 'News',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  constraint published_news_has_date check (status <> 'published' or published_at is not null)
);

alter table public.news enable row level security;
create index if not exists news_public_feed_idx on public.news (status, published_at desc);

create policy "Public can read currently published news"
on public.news for select to anon, authenticated
using (status = 'published' and published_at <= now() or public.is_admin());

create policy "Admins can create news"
on public.news for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

create policy "Admins can update news"
on public.news for update to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete news"
on public.news for delete to authenticated
using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at before update on public.news
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-images', 'news-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read news images" on storage.objects for select to public
using (bucket_id = 'news-images');
create policy "Admins can upload news images" on storage.objects for insert to authenticated
with check (bucket_id = 'news-images' and public.is_admin());
create policy "Admins can update news images" on storage.objects for update to authenticated
using (bucket_id = 'news-images' and public.is_admin());
create policy "Admins can delete news images" on storage.objects for delete to authenticated
using (bucket_id = 'news-images' and public.is_admin());

-- Optional seed: after creating the first admin, sign in through the app and
-- recreate/edit the preserved legacy items shown by the no-credentials fallback.
