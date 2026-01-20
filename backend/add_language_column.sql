-- =====================================================
-- HBF: Add language preference column to users table
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Add language column with default 'ru'
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'ru';

-- 2. Add constraint for valid values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_language_check'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_language_check
        CHECK (language IN ('ru', 'en'));
    END IF;
END
$$;

-- 3. Create index for potential queries by language
CREATE INDEX IF NOT EXISTS idx_users_language ON public.users(language);

-- 4. Update existing users to have 'ru' as default
UPDATE public.users
SET language = 'ru'
WHERE language IS NULL;

-- 5. Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
AND column_name = 'language';
