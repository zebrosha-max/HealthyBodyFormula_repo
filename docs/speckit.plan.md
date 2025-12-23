# SDD PHASE 2: TECHNICAL SPEC & STACK

### 2.1 Технический Стек
*   **Frontend:** HTML5, CSS3, Vanilla JS (ES6+).
*   **Backend / BaaS:** **Supabase** (PostgreSQL + Auth).
*   **AI & Automation:** **n8n** (Self-hosted) + **Gemini 1.5/3.0 Flash** + **Telegram Bot API**.
*   **Integration:** Telegram Web App SDK.

### 2.2 Схема Архитектуры (Data Model)

**Таблица `users`:**
*   `telegram_id` (PK), `first_name`, `username`, `is_premium`.

**Таблица `food_logs` (New):**
*   `id` (UUID, PK).
*   `user_id` (FK -> users.telegram_id).
*   `dish_name` (Text).
*   `calories`, `protein`, `fat`, `carbs` (Int).
*   `log_text` (Text) — исходный запрос пользователя.
*   `created_at` (Timestamp).

### 2.3 Спецификация Интерфейса (UI Spec)

1.  **Bottom Navigation:**
    *   Items: Рецепты, Услуги, Гайды, Профиль.
2.  **Smart Logger Entry:**
    *   Floating Action Button (FAB) или заметная кнопка на Главной: "Записать прием пищи".
    *   Action: `Telegram.WebApp.close()` (или switchInlineQuery) -> Переход в чат с ботом.
3.  **Food Diary (in Profile):**
    *   **Header:** Сводка за сегодня (Progress Bar калорий).
    *   **List:** Карточки приемов пищи (Время, Название, КБЖУ).
    *   **Empty State:** "Вы еще ничего не съели. Нажмите кнопку, чтобы записать".

### 2.4 User Flow: Logging**
1.  **WebApp:** User clicks "Записать". -> Redirect to Bot.
2.  **Bot:** "Привет! Отправь фото, голос или текст".
3.  **User:** Sends content.
4.  **AI (n8n):** Analyzes -> Returns Draft Stats.
5.  **Bot:** Shows Stats. Buttons: [✅ В Дневник] [❌ Отмена].
6.  **User:** Clicks [✅ В Дневник].
7.  **Bot:** Saves to Supabase. "Сохранено! Посмотри в профиле: [Ссылка на WebApp]".