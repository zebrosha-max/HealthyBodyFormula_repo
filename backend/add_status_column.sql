-- Add status column for moderation flow
ALTER TABLE public.food_logs 
ADD COLUMN status text DEFAULT 'confirmed';

-- Optional: Update existing logs to confirmed
UPDATE public.food_logs SET status = 'confirmed' WHERE status IS NULL;
