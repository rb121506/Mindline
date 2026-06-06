-- Journal app schema for Supabase (Postgres).
-- Run this in the Supabase SQL editor. Row Level Security is enabled so each
-- user can only read/write their own rows.

-- ---------------------------------------------------------------------------
-- entries
-- ---------------------------------------------------------------------------
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text,
  body        text not null default '',          -- Tiptap JSON, stringified
  body_plain  text not null default '',          -- plain text for search / AI
  mood        int check (mood between 1 and 5),
  tags        text[] not null default '{}',
  entry_date  date not null default current_date,
  word_count  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists entries_user_date_idx
  on public.entries (user_id, entry_date desc);

create index if not exists entries_tags_idx
  on public.entries using gin (tags);

alter table public.entries enable row level security;

drop policy if exists "Users manage their own entries" on public.entries;
create policy "Users manage their own entries"
  on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- weekly_reflections
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_reflections (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  week_start   date not null,
  content      text not null,
  generated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_reflections enable row level security;

drop policy if exists "Users manage their own reflections" on public.weekly_reflections;
create policy "Users manage their own reflections"
  on public.weekly_reflections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- monthly_recaps  (AI monthly summary: themes, mood shifts, moments, questions)
-- ---------------------------------------------------------------------------
create table if not exists public.monthly_recaps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  month_start  date not null,
  content      text not null,
  generated_at timestamptz not null default now(),
  unique (user_id, month_start)
);

alter table public.monthly_recaps enable row level security;

drop policy if exists "Users manage their own recaps" on public.monthly_recaps;
create policy "Users manage their own recaps"
  on public.monthly_recaps
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for image attachments
-- Each user can only write to a folder named after their uid; reads are public.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('journal-images', 'journal-images', true)
on conflict (id) do nothing;

drop policy if exists "Users upload to their own folder" on storage.objects;
create policy "Users upload to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their own images" on storage.objects;
create policy "Users update their own images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own images" on storage.objects;
create policy "Users delete their own images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'journal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public can read journal images" on storage.objects;
create policy "Public can read journal images"
  on storage.objects for select to public
  using (bucket_id = 'journal-images');
