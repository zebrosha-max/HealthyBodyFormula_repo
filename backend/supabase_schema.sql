-- Supabase SQL Schema for HBF Food Logger
-- Run this in the SQL Editor at supabase.com

-- 1. Create the table for food logs
create table public.food_logs (
  id uuid not null default gen_random_uuid (),
  user_id bigint not null, -- Telegram Chat ID
  log_text text null,      -- Original user input (text or caption)
  image_url text null,     -- URL if photo was sent
  dish_name text null,     -- AI extracted dish name
  calories int default 0,
  protein int default 0,
  fat int default 0,
  carbs int default 0,
  created_at timestamptz default now(),
  constraint food_logs_pkey primary key (id)
);

-- 2. Enable RLS (Row Level Security) - Optional but recommended
alter table public.food_logs enable row level security;

-- 3. Policy: Allow anon insert (since our n8n bot uses the service key or anon key)
-- Ideally, n8n uses the SERVICE_ROLE_KEY to bypass RLS, so policies aren't strictly needed for the bot,
-- but helpful if we fetch data from the Frontend later.
create policy "Allow read access for all" on public.food_logs
  for select using (true);

create policy "Allow insert access for all" on public.food_logs
  for insert with check (true);
