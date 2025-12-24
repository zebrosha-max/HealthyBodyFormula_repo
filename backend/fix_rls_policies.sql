-- UNIVERSAL FIX SCRIPT (Run this in Supabase SQL Editor)

-- 1. Create tables if they don't exist (Fixes "relation does not exist" error)
create table if not exists public.water_logs (
  id uuid not null default gen_random_uuid (),
  user_id bigint not null,
  amount_ml int not null,
  created_at timestamptz default now(),
  constraint water_logs_pkey primary key (id)
);

create table if not exists public.weight_logs (
  id uuid not null default gen_random_uuid (),
  user_id bigint not null,
  weight_kg float not null,
  created_at timestamptz default now(),
  constraint weight_logs_pkey primary key (id)
);

-- 2. Drop existing policies to avoid conflicts (Cleanup)
drop policy if exists "Enable read access for all users" on public.water_logs;
drop policy if exists "Enable insert access for all users" on public.water_logs;
drop policy if exists "Enable delete access for all users" on public.water_logs;
drop policy if exists "Allow read access for all" on public.water_logs;
drop policy if exists "Allow insert access for all" on public.water_logs;

drop policy if exists "Enable read access for all users" on public.weight_logs;
drop policy if exists "Enable insert access for all users" on public.weight_logs;
drop policy if exists "Enable delete access for all users" on public.weight_logs;
drop policy if exists "Allow read access for all" on public.weight_logs;
drop policy if exists "Allow insert access for all" on public.weight_logs;

-- 3. Enable RLS (Security)
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;

-- 4. Create permissive policies (Public access for MVP)
-- Water Logs
create policy "Enable read access for all users" on public.water_logs for select using (true);
create policy "Enable insert access for all users" on public.water_logs for insert with check (true);
create policy "Enable delete access for all users" on public.water_logs for delete using (true);

-- Weight Logs
create policy "Enable read access for all users" on public.weight_logs for select using (true);
create policy "Enable insert access for all users" on public.weight_logs for insert with check (true);
create policy "Enable delete access for all users" on public.weight_logs for delete using (true);

-- 5. Fix Users table columns (Just in case)
alter table public.users add column if not exists weight_start float default 0;
alter table public.users add column if not exists weight_goal float default 0;
alter table public.users add column if not exists calorie_goal int default 2000;
alter table public.users add column if not exists water_goal int default 2000;