-- Включить Supabase Realtime для таблиц
-- ВАЖНО: Выполнить в Supabase SQL Editor (Dashboard → SQL Editor)
-- Без этого postgres_changes подписки НЕ будут работать!

-- 1. Добавить таблицы в publication для Realtime
alter publication supabase_realtime add table food_logs;
alter publication supabase_realtime add table water_logs;
alter publication supabase_realtime add table weight_logs;
alter publication supabase_realtime add table users;

-- 2. Проверить что таблицы добавлены (опционально)
-- select * from pg_publication_tables where pubname = 'supabase_realtime';
