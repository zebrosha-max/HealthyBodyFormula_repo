# SDD PHASE 0: PROJECT CONSTITUTION

### 1. Основные Принципы
*   **Mobile-First TWA:** Интерфейс проектируется строго под мобильные устройства в контексте Telegram Web App. Учитываем безопасные зоны (safe areas), нативные цвета темы и тактильный отклик (Haptic Feedback).
*   **Security First:** Логика проверки прав доступа ("платный/бесплатный") должна выполняться на стороне сервера (или BaaS). Клиентская защита (CSS blur) — только декорация.
*   **Offline-First (Caching):** Для мгновенной загрузки на мобильных устройствах состояние пользователя кэшируется в `localStorage`. При старте сначала отрисовывается кэш, затем данные синхронизируются с Supabase в фоне.
*   **Optimistic UI:** Все действия пользователя (ввод веса, изменение целей, добавление воды) отражаются в интерфейсе мгновенно. Запрос к БД выполняется асинхронно в фоне.
*   **Zero-Dependency (Frontend):** Продолжаем придерживаться Vanilla JS (ES6+) там, где это возможно.
*   **Hybrid AI Architecture:** Сложная логика (анализ фото/голоса) выносится в n8n + Gemini Flash, чтобы не нагружать клиент.

### 2. Стандарты Кода
*   **HTML:** Семантическая верстка. `data-attributes` для роутинга.
*   **CSS:** Использование CSS Variables. BEM-нейминг.
*   **JS:**
    *   **Separation of Concerns:** Логика в `js/app.js`, структура в `index.html`.
    *   **Async/Await:** Для Supabase и API вызовов.

### 3. Taxonomy Rules
*   **Food Types:** `meat`, `poultry`, `fish`, `vegetarian`.
*   **Macros:** Всегда храним и отображаем в последовательности: Kcal, Protein, Fat, Carbs.
*   **Water Units:** Храним в миллилитрах (ml). Шаг интерфейса: 250ml (стакан).
*   **Timezones:** Клиент (WebApp) всегда отправляет и запрашивает даты в ISO формате. Считаем "днем" интервал 00:00-23:59 по локальному времени пользователя (передаем offset или считаем на клиенте).

### 4. AI & Bot Protocol (Smart Logger)
*   **Workflow Implementation (`backend/HBF Food Logger.json`):**
    1.  **Trigger:** Telegram Message (Text/Photo) or Callback Query.
    2.  **Routing:**
        *   `/start` -> Welcome Message.
        *   **Photo:** `Gemini 1.5 Flash` Vision Analysis -> JSON Extraction -> DB Insert (Pending).
        *   **Text:** `Gemini 1.5 Flash` Text Analysis -> JSON Extraction -> DB Insert (Pending).
        *   **Callback:** User confirms/deletes entry -> Update Supabase Status (`confirmed`/`deleted`).
    3.  **Data Structure (AI Output):**
        ```json
        { "dish": "string", "calories": int, "protein": int, "fat": int, "carbs": int }
        ```
    4.  **Privacy:** Source photos are processed in-memory (base64) and not stored. Only the analysis result is saved to Supabase.
    5.  **Consistency:** AI is strictly instructed to return JSON. Non-food content is handled by the AI prompt logic.