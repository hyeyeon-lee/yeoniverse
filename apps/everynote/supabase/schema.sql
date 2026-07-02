-- everynote 스키마
-- Supabase 대시보드 SQL Editor에서 실행하세요.

create table if not exists public.notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  notebook_id uuid not null references public.notebooks (id) on delete cascade,
  title text not null default '',
  content jsonb, -- TipTap JSON 문서
  content_text text not null default '', -- 미리보기/검색용 플레인 텍스트
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_notebook_id_idx on public.notes (notebook_id);
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);

alter table public.notebooks enable row level security;
alter table public.notes enable row level security;

create policy "notebooks_select_own" on public.notebooks
  for select using (auth.uid() = user_id);
create policy "notebooks_insert_own" on public.notebooks
  for insert with check (auth.uid() = user_id);
create policy "notebooks_update_own" on public.notebooks
  for update using (auth.uid() = user_id);
create policy "notebooks_delete_own" on public.notebooks
  for delete using (auth.uid() = user_id);

create policy "notes_select_own" on public.notes
  for select using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes
  for insert with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes
  for update using (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes
  for delete using (auth.uid() = user_id);
