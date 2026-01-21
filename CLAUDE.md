# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Startup Protocol

> **CRITICAL INSTRUCTIONS:**
> 1. Before major changes, read documentation in `docs/` (Tasks, Constitution, Plan)
> 2. **SECURITY:** NEVER commit `.json` files from `backend/` — they contain API keys and are gitignored. Only `.sql` files allowed.
> 3. Follow Spec-Driven Development (SDD) workflow

## Last Session (2026-01-21)

**i18n Language Persistence Fix — COMPLETED**

### Проблемы (решены):
1. ❌ Бот отправлял сообщения на языке Telegram, игнорируя выбор в приложении
2. ❌ При повторном входе язык сбрасывался на русский
3. ❌ `window.supabase.from is not a function` — использовалась библиотека вместо клиента

### Решения:

**Web App:**
- `I18n.init()` → `I18n.initWithCache()` (не пишет в localStorage при отсутствии кэша)
- Добавлен `I18n.initFromTelegram()` как fallback только для новых пользователей
- **ВАЖНО:** `window.supabaseClient` — это клиент, `window.supabase` — это CDN библиотека!

**n8n Workflow:**
- Добавлена нода "Supabase Get Language" (HTTP Request) между Telegram Trigger и Router
- Router condition: `$('Telegram Trigger').first().json.callback_query ? ...`
- i18n Message/Command: восстанавливают `message`, `user_id`, `chat_id` для downstream нод

### Файлы n8n (backend/):
| Файл | Описание |
|------|----------|
| `HBF Food Logger200126-fixed.json` | Исправленный workflow (импортировать в n8n) |
| `n8n-fix-Supabase-Get-Language.txt` | HTTP Request нода для языка |
| `n8n-fix-i18n-Command.txt` | /start команда |
| `n8n-fix-i18n-Message.txt` | Обработка сообщений |

### Ключевой паттерн:
После HTTP Request ноды данные Telegram теряются. Всегда использовать:
```javascript
$('Telegram Trigger').first().json.message  // или .callback_query
```

### Debug режим:
`debugEnabled = true` в app.js включает визуальный лог на экране (для отладки в Telegram mini-app без DevTools).

---

## Project Overview

**Healthy Body Formula (HBF_web)** — SPA веб-приложение для клинического нутрициолога. Разработано как **Telegram Web App (TWA)** с интеграцией Supabase для хранения данных.

**Технологии:** Vanilla JS (ES6+), HTML5, CSS3, Supabase, Chart.js, Telegram WebApp SDK

## Development Commands

```bash
# Запуск локального сервера
python -m http.server 8080
# Открыть: http://localhost:8080

# Оптимизация изображений рецептов (800px, 85% quality)
python optimize_recipes.py

# Конвертация новых изображений в формат recipe_{id}.jpg
python optimize_new_recipes.py
```

## Architecture

### Separation of Concerns

| Файл | Назначение | Строк |
|------|------------|-------|
| `index.html` | Только HTML структура (View) | ~824 |
| `css/style.css` | Все стили, анимации, CSS Variables | ~1640 |
| `js/app.js` | Бизнес-логика, state, события | ~1838 |

### State Management (app.js)

Централизованный объект состояния:
```javascript
const state = {
  user: null,           // Telegram user data
  isPremium: false,     // Premium status
  activeTab: 'main',    // Current screen
  favorites: [],        // Recipe favorites (Supabase sync)
  calorieGoal: 2000,    // Daily calorie target
  waterGoal: 2000,      // Daily water target (ml)
  language: 'ru',       // UI language (ru|en)
  currentDate: new Date(),
  analyticsDate: new Date(),
  analyticsType: 'weight|calories|water',
  analyticsPeriod: 'week|month',
  filters: {category, type, time, kcal, onlyFavorites}
}
```

### CSS Variables (Theming)

```css
--sage-green: #9CB4A3       /* Primary brand color */
--sage-green-light: #C5D6CB
--peach: #F5C9C6            /* Accent color */
--peach-light: #FBE5E3
--text-primary: #2D3436
--card-bg: #FFFFFF
```

### Database Schema (Supabase)

**Таблицы:**
- `users` — telegram_id, first_name, calorie_goal, water_goal, weight_start, weight_goal
- `food_logs` — dish_name, calories, protein, fat, carbs, log_text, status (pending/confirmed)
- `water_logs` — amount_ml, created_at
- `weight_logs` — weight_kg, created_at

**RLS:** Row Level Security включен. SQL миграции в `backend/`.

### Key Modules (app.js)

- **Screen Navigation:** `showScreen()`, `updateActiveTab()` — SPA routing через CSS classes
- **Date Navigation:** `getDateBoundaries()`, `changeDate()` — навигация день/неделя/месяц
- **Cache Manager:** `getCacheKey()`, `loadCache()`, `saveCache()` — localStorage для offline-first
- **Food Diary:** `renderFoodDiary()`, `deleteFoodLog()` — CRUD для food_logs
- **Water Tracker:** `addWater()`, `updateWaterUI()` — +250ml increments
- **Body Progress:** `renderBodyStats()`, `updateWeightUI()` — weight tracking
- **Recipes:** `renderRecipes()`, `toggleFavorite()` — 21 рецептов с фильтрацией
- **Analytics:** `initMainChart()`, `renderAnalytics()` — Chart.js графики с cache-first
- **i18n:** `I18n.t()`, `refreshAllUI()` — мультиязычность RU/EN

### i18n System (Мультиязычность)

**Статус:** ✅ Реализовано (2026-01-20)

Полная поддержка русского и английского языков без внешних зависимостей.

#### Архитектура файлов
```
js/i18n/
├── i18n.js           # I18n Manager (init, t, setLanguage)
├── ru.js             # UI переводы RU (~150 ключей)
├── en.js             # UI переводы EN
├── recipes-ru.js     # Рецепты RU (21 шт: title, ingredients, steps)
└── recipes-en.js     # Рецепты EN

guides/
├── ru/               # 9 HTML гайдов на русском
└── en/               # 9 HTML гайдов на английском
```

#### Ключевые функции (app.js)
```javascript
// Получение перевода
t('recipes.categories.breakfast')  // → "Завтрак" или "Breakfast"

// Обновление всего UI при смене языка
refreshAllUI()

// Обновление конкретных экранов
updateStaticTexts()     // Статичные элементы HTML
updateFilterOptions()   // Фильтры рецептов
updateGuidesScreen()    // Карточки гайдов
updateSettingsModal()   // Модальное окно настроек
updateServicesScreen()  // Экран услуг
```

#### Приоритет определения языка
1. Supabase `users.language` (синхронизация между устройствами)
2. localStorage `hbf_language` (offline fallback)
3. Telegram `initDataUnsafe.user.language_code` (только для новых пользователей)
4. Default: `'ru'`

**Порядок инициализации (app.js):**
```
1. I18n.initWithCache()     // Читает ТОЛЬКО localStorage (не пишет!)
2. initUser()               // Загружает user из Supabase
3. applyUserState(user)     // Применяет язык из Supabase
   ├─ user.language есть    → I18n.applyFromUser(user)
   ├─ localStorage есть     → уже применён в initWithCache()
   └─ ничего нет            → I18n.initFromTelegram()
```

**Ключевое изменение (2026-01-20):** `I18n.init()` заменён на `I18n.initWithCache()`, который НЕ записывает в localStorage при отсутствии кэша. Это гарантирует, что выбор пользователя из Supabase всегда имеет приоритет.

#### Переключатель языка
- Расположение: Profile → Settings (⚙) → "Язык интерфейса"
- Кнопки: 🇷🇺 Русский / 🇬🇧 English
- При переключении: мгновенное обновление UI + async sync в Supabase

#### SQL миграция
```sql
-- backend/add_language_column.sql
ALTER TABLE public.users ADD COLUMN language VARCHAR(2) DEFAULT 'ru';
```

### Mobile Performance Modules (app.js)

**Проблема:** Telegram WebApp на мобильном имеет нестабильное соединение с Supabase (таймауты 10-30 сек, частые ошибки). Решение — многоуровневая оптимизация:

#### 1. RealtimeManager — WebSocket подписки
```javascript
RealtimeManager.init()      // Инициализация при старте
RealtimeManager.cleanup()   // Очистка при закрытии
```
- Подписка на `postgres_changes` для food_logs, water_logs, weight_logs, users
- Автоматическое обновление UI при изменениях в БД
- Graceful degradation: если WebSocket недоступен — fallback на polling
- **SQL миграция:** `backend/enable_realtime.sql` (выполнить в Supabase Dashboard)

#### 2. LifecycleManager — App Resume Handler
```javascript
LifecycleManager.init()     // Слушает visibilitychange
```
- При возврате из фона (после 30+ сек) — refresh данных
- Reconnect Realtime каналов после длительного простоя
- Предотвращает показ устаревших данных

#### 3. AnalyticsCache — Cache-First для аналитики
```javascript
AnalyticsCache.save(type, period, date, processedData)
AnalyticsCache.load(type, period, date) // → processedData | null
```
- Кэширует **обработанные** данные (labels, values, avgText), не сырые
- Лимит 20 записей в localStorage (`hbf_analytics_v1`)
- При открытии аналитики: мгновенно из кэша → fetch в фоне → тихое обновление

#### 4. preloadAnalyticsCache() — Фоновая предзагрузка
```javascript
setTimeout(() => preloadAnalyticsCache(), 3000)  // в applyUserState()
```
- Загружает weight, calories, water за текущую неделю
- Запускается через 3 сек после старта (не блокирует UI)
- При открытии Analytics — данные уже в кэше

#### 5. fetchWithTimeout() — Retry с таймаутами
```javascript
fetchWithTimeout(queryFn, timeout=10000, retries=3)
```
- Обёртка над Supabase запросами
- Автоматический retry при таймауте
- Exponential backoff между попытками

#### 6. debugLog() — Отладка на мобильном
```javascript
debugLog(message, type='info')  // info | success | warn | error
```
- Визуальный лог в `#debug-log` div (виден без DevTools)
- Автоскролл к последнему сообщению
- Цветовая кодировка по типу

### Cache-First Strategy (Архитектура)

```
Юзер открывает Аналитику
        ↓
[1] Показать данные из localStorage МГНОВЕННО
        ↓
[2] Запустить fetch в ФОНЕ (не блокируя UI)
        ↓
[3] Если успех → тихо обновить UI + сохранить в кэш
    Если ошибка → юзер НЕ ВИДИТ ошибку (данные уже показаны)
```

**UX индикатор:** `⟳` рядом с данными показывает, что идёт фоновое обновление

## Core Principles

1. **Mobile-First TWA:** Дизайн под мобильные + safe areas Telegram
2. **Offline-First:** localStorage cache → Supabase sync в фоне
3. **Optimistic UI:** Мгновенный отклик, async запросы в фоне
4. **Zero-Dependency Frontend:** Vanilla JS, CDN для библиотек

## Project Structure

```
HBF_web/
├── index.html              # Entry point
├── css/style.css           # Styles + CSS Variables
├── js/app.js               # Application logic
├── backend/                # SQL schemas & n8n workflows
│   ├── supabase_schema.sql # Main tables
│   ├── fix_rls_policies.sql# Security policies
│   └── HBF Food Logger.json# n8n workflow (gitignored)
├── guides/                 # Premium HTML guides (9 files)
├── Recipes/images/         # Recipe images (recipe_1.jpg - recipe_21.jpg)
├── Certificates/           # Diploma images
└── docs/                   # SDD Documentation
    ├── speckit.constitution.md
    ├── speckit.plan.md
    └── speckit.tasks.md    # Task breakdown
```

## Data Conventions

- **Macros order:** Kcal → Protein → Fat → Carbs
- **Water units:** Миллилитры (ml), шаг UI: 250ml
- **Dates:** ISO format, локальное время клиента
- **AI output format:**
  ```json
  { "dish": "string", "calories": int, "protein": int, "fat": int, "carbs": int }
  ```

## Recipe Filtering

Многофакторная фильтрация по 4 параметрам:
- **Category:** Завтрак, Обед, Ужин, Десерт
- **Type:** meat, poultry, fish, vegetarian
- **Time:** До 20 мин, 20-40 мин, 40+ мин
- **Kcal:** Легкое (<250), Среднее (250-400), Плотное (>400)

## Backend Integration

### Supabase
- Подключение через CDN (supabase-js v2)
- Ключи в `js/app.js` (publishable key)
- RLS policies для per-user data access

### n8n Workflow (Smart Food Logger)
- Telegram Bot → Gemini Flash (Vision/Text) → Supabase
- Photo/text analysis → JSON extraction → DB insert
- Callback queries для Save/Cancel

#### i18n интеграция в n8n (2026-01-20)

**Проблема 1:** AI-промпты содержат кавычки (`"dish"`, `"calories"`), которые ломают JSON при вставке.
**Решение:** Экранирование через `JSON.stringify().slice(1,-1)` в Code node.

**Проблема 2 (Fixed 2026-01-20):** Бот игнорировал выбранный в веб-приложении язык, всегда использовал Telegram language_code.
**Решение:** Добавлена нода Supabase Get Language для чтения `users.language` из БД.

**Файлы с фиксами** (папка `backend/`):

| Файл | Нода n8n | Описание |
|------|----------|----------|
| `n8n-fix-Supabase-Get-Language.txt` | HTTP Request (NEW) | Получение языка из Supabase (ставить перед Router) |
| `n8n-fix-i18n-Command.txt` | i18n Command (Code) | /start команда с локализованным приветствием |
| `n8n-fix-i18n-Message.txt` | i18n Message (Code) | Приоритет: Supabase > Telegram + экранирование |
| `n8n-fix-Code-in-JavaScript.txt` | Code in JavaScript | Сохранение i18n данных для фото |
| `n8n-fix-AI-Photo.txt` | AI Photo (HTTP Request) | JSON body с `aiPromptPhotoEscaped` |
| `n8n-fix-AI-Text.txt` | AI Text (HTTP Request) | JSON body с `aiPromptTextEscaped` |
| `n8n-fix-Ask-Confirm-Text.txt` | Ask Confirm (Telegram) | Текст сообщения с i18n |
| `n8n-fix-Ask-Confirm-Btn1.txt` | Ask Confirm (Telegram) | Кнопка "Записать" |
| `n8n-fix-Ask-Confirm-Btn2.txt` | Ask Confirm (Telegram) | Кнопка "Отмена" |

**Ключевые моменты:**

1. **Экранирование промптов** в Code node:
   ```javascript
   item.json.aiPromptTextEscaped = JSON.stringify(messages[lang].aiPromptText).slice(1, -1);
   item.json.aiPromptPhotoEscaped = JSON.stringify(messages[lang].aiPromptPhoto).slice(1, -1);
   ```

2. **DB Insert — Inputs to Ignore:** добавить `i18n, lang, aiPromptPhotoEscaped, aiPromptTextEscaped`
   - Иначе ошибка "Could not find the 'i18n' column"

3. **Ссылки на данные после DB операций:**
   - После DB Insert данные `$json.i18n` теряются
   - Использовать: `$('Edit Fields').first().json.i18n.confirm`
   - Для savedMsg: `$('Extract Fields').first().json.savedMsg`

4. **JSON body формат** — БЕЗ префикса `=`:
   ```json
   {
     "contents": [{
       "parts": [{"text": "{{ $json.aiPromptPhotoEscaped }}"}]
     }]
   }
   ```

## Cache Busting

При изменении CSS/JS обновить версию в index.html:
```html
<link rel="stylesheet" href="css/style.css?v=9">
```

## Guides Standard (Premium Protocols)

### Content Structure (Evidence-Based)
Scientific Basis → Practical Implementation → Troubleshooting → Safety

### Technical Requirements
- **Navigation:** Back button MUST use `?screen=guides`
- **UI:** Glassmorphism headers, Accordions for long text, Lora font
- **Categories:**
  - **Guideline (Руководство):** Premium/High-value protocols
  - **Free Guide (Бесплатный гайд):** Quick checklists, lead magnets

### Existing Guides
**Premium (5):** Clean Gut, Hormonal Glow, Metabolic Flexibility, Cortisol Control, Sleep Fix
**Free (3):** Plate Constructor, Deficiencies Checklist, Smart Shopping
