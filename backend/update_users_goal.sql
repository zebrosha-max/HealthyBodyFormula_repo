-- Add calorie_goal column to users table
ALTER TABLE public.users 
ADD COLUMN calorie_goal INT DEFAULT 2000;
