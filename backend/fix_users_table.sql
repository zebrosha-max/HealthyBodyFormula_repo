-- Run this in Supabase SQL Editor to fix the missing columns issue

-- Add missing columns for Weight Tracking if they don't exist
alter table public.users add column if not exists weight_start float default 0;
alter table public.users add column if not exists weight_goal float default 0;
alter table public.users add column if not exists calorie_goal int default 2000;
alter table public.users add column if not exists water_goal int default 2000;

-- Verify the table structure
select * from public.users limit 1;