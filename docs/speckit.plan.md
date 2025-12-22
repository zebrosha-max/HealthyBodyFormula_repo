# SDD PHASE 2: TECHNICAL SPEC & STACK

### 2.1 Технический Стек
*   **Frontend:** HTML5, CSS3, Vanilla JS (ES6+).
*   **Backend / BaaS:** **Supabase** (PostgreSQL + Auth).
    *   Хранение профилей пользователей.
    *   Хранение статуса подписки (`is_premium`).
    *   (В будущем) Хранение избранного.
*   **Integration:** Telegram Web App SDK.

### 2.2 Схема Архитектуры (Data Model)

**Таблица `users` (Supabase):**
*   `telegram_id` (BigInt, Primary Key) — ID из Telegram.
*   `first_name` (Text).
*   `username` (Text).
*   `is_premium` (Boolean) — Флаг платной подписки.
*   `created_at` (Timestamp).

**(В планах) Таблица `favorites`:**
*   `id` (UUID).
*   `user_id` (FK -> users.telegram_id).
*   `recipe_id` (Text) — ID рецепта.

### 2.3 Спецификация Интерфейса (UI Spec)

1.  **Bottom Navigation:**
    *   Fixed position bottom.
    *   Items: Главная (Рецепты), Услуги, Гайды, Профиль.
2.  **Recipe Card Upgrade:**
    *   Chips: `⏱ 15 мин`, `🔥 300 ккал`, `Тип`.
    *   Action: Favorite toggle (Heart icon).
3.  **Content Locker:**
    *   Logic: `if (!user.is_premium && content.paid) -> Show Blur`.
