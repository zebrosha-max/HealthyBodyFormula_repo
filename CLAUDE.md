# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Startup Protocol

> **CRITICAL INSTRUCTIONS:**
> 1. Before major changes, read documentation in `docs/` (Tasks, Constitution, Plan)
> 2. **SECURITY:** NEVER commit `.json` files from `backend/` — they contain API keys and are gitignored. Only `.sql` files allowed.
> 3. Follow Spec-Driven Development (SDD) workflow

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
