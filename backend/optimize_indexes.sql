-- Оптимизация производительности: Создание индексов для ускорения выборок
-- Эти индексы критически важны для мобильных устройств, так как они минимизируют время поиска данных в БД.

-- Индексы для Дневника питания (выборка по юзеру и дате)
CREATE INDEX IF NOT EXISTS idx_food_logs_user_id_created_at 
ON public.food_logs (user_id, created_at DESC);

-- Индексы для Трекера воды (выборка по юзеру и дате)
CREATE INDEX IF NOT EXISTS idx_water_logs_user_id_created_at 
ON public.water_logs (user_id, created_at DESC);

-- Индексы для Контроля веса (выборка по юзеру и дате)
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id_created_at 
ON public.weight_logs (user_id, created_at DESC);

-- Индекс для Избранного (выборка по юзеру)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id 
ON public.favorites (user_id);

-- Анализ таблиц для обновления статистики планировщика
ANALYZE public.food_logs;
ANALYZE public.water_logs;
ANALYZE public.weight_logs;
ANALYZE public.favorites;