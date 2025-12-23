# SDD PHASE 0: PROJECT CONSTITUTION

### 1. Основные Принципы
*   **Mobile-First TWA:** Интерфейс проектируется строго под мобильные устройства в контексте Telegram Web App. Учитываем безопасные зоны (safe areas), нативные цвета темы и тактильный отклик (Haptic Feedback).
*   **Security First:** Логика проверки прав доступа ("платный/бесплатный") должна выполняться на стороне сервера (или BaaS). Клиентская защита (CSS blur) — только декорация.
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

### 4. AI & Bot Protocol (Smart Logger)
*   **Workflow:** WebApp (Trigger) -> Bot (Input) -> n8n (AI Processing) -> Supabase (Storage) -> WebApp (Display).
*   **Privacy:** Храним только результаты анализа (БЖУК + название), исходные фото/голос не сохраняем в БД для экономии места и приватности.
*   **Consistency:** ИИ должен возвращать JSON строгого формата. Любой не-пищевой контент отклоняется.