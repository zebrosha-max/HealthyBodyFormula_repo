-- Supabase SQL Schema for HBF Food Logger
-- Run this in the SQL Editor at supabase.com

-- 1. Create the table for food logs
create table if not exists public.food_logs (
  id uuid not null default gen_random_uuid (),
  user_id bigint not null, -- Telegram Chat ID
  log_text text null,      -- Original user input (text or caption)
  image_url text null,     -- URL if photo was sent
  dish_name text null,     -- AI extracted dish name
  calories int default 0,
  protein int default 0,
  fat int default 0,
  carbs int default 0,
  status text default 'confirmed', -- pending, confirmed, deleted
  created_at timestamptz default now(),
  constraint food_logs_pkey primary key (id)
);

-- 2. Create the table for water logs
create table if not exists public.water_logs (
  id uuid not null default gen_random_uuid (),
  user_id bigint not null,
  amount_ml int not null,
  created_at timestamptz default now(),
  constraint water_logs_pkey primary key (id)
);

-- 3. Update users table with goals and settings
-- (Assuming table 'users' exists, we use ALTER)
-- alter table public.users add column if not exists calorie_goal int default 2000;
-- alter table public.users add column if not exists water_goal int default 2000;
-- alter table public.users add column if not exists water_reminder_active boolean default false;
-- alter table public.users add column if not exists water_reminder_interval int default 60; -- minutes

-- 4. Enable RLS (Row Level Security) - Optional but recommended
alter table public.food_logs enable row level security;
alter table public.water_logs enable row level security;

-- 5. Policies
create policy "Allow read access for all" on public.food_logs for select using (true);
create policy "Allow insert access for all" on public.food_logs for insert with check (true);
create policy "Allow update access for all" on public.food_logs for update using (true);
create policy "Allow delete access for all" on public.food_logs for delete using (true);

create policy "Allow read access for all" on public.water_logs for select using (true);
create policy "Allow insert access for all" on public.water_logs for insert with check (true);