-- Fix DELETE policy for food_logs
-- Run this in Supabase SQL Editor

-- 1. Drop existing delete policy if it exists (to avoid conflicts or stale definitions)
drop policy if exists "Allow delete access for all" on public.food_logs;
drop policy if exists "Enable delete for users based on user_id" on public.food_logs;

-- 2. Create a permissive DELETE policy (for MVP, allows anyone with the Anon key to delete rows)
-- In a real production app with Auth, this should be: using (auth.uid() = user_id)
create policy "Allow delete access for all"
on public.food_logs
for delete
using (true);

-- 3. Ensure RLS is enabled
alter table public.food_logs enable row level security;
