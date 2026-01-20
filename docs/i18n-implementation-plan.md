# План: Мультиязычность HBF_web (RU/EN)

**Статус:** ✅ Реализация завершена — готово к тестированию
**Начало:** 2026-01-20
**Завершено:** 2026-01-20

---

## Общий прогресс

| Фаза | Статус | Время |
|------|--------|-------|
| Phase 1: Инфраструктура i18n | ✅ Completed | 2-3ч |
| Phase 2: Интеграция app.js | ✅ Completed | 3-4ч |
| Phase 3: Settings switcher | ✅ Completed | 1ч |
| Phase 4: Рецепты | ✅ Completed | 2-3ч |
| Phase 5: Гайды | ✅ Completed | 4-5ч |
| Phase 6: Chatbot | ✅ Completed | 1-2ч |
| Phase 7: Тестирование | 🧪 Manual Testing Required | 2ч |

---

## Phase 1: Инфраструктура i18n

**Статус:** ✅ Completed

### Tasks
- [x] 1.1 Создать I18n Manager (`js/i18n/i18n.js`)
- [x] 1.2 Создать словари UI-переводов (`ru.js`, `en.js`)
- [x] 1.3 SQL миграция Supabase (`add_language_column.sql`)

### Notes
- Создан `js/i18n/i18n.js` — полноценный I18n Manager с поддержкой вложенных ключей, плейсхолдеров, и дат
- Создан `js/i18n/ru.js` — ~150 ключей для русского интерфейса
- Создан `js/i18n/en.js` — полный перевод на английский
- Создан `backend/add_language_column.sql` — миграция для users.language

---

## Phase 2: Интеграция app.js

**Статус:** ✅ Completed

### Tasks
- [x] 2.1 Подключить i18n в index.html
- [x] 2.2 Инициализация i18n (init, applyFromUser)
- [x] 2.3 Обновить UI rendering функции
- [x] 2.4 Event listener для смены языка

### Notes
- Скрипты i18n подключены в правильном порядке: ru.js → en.js → i18n.js → app.js
- Добавлен `refreshAllUI()` для обновления всего интерфейса при смене языка
- Добавлены функции: `updateStaticTexts()`, `updateFilterOptions()`, `updateSettingsModal()`
- Event listener `languageChanged` вызывает полное обновление UI

---

## Phase 3: Settings switcher

**Статус:** ✅ Completed

### Tasks
- [x] 3.1 Добавить UI переключателя в modal
- [x] 3.2 JavaScript обработчик + CSS стили

### Notes
- Добавлен `.language-switcher` с двумя кнопками в modal settings
- Кнопки 🇷🇺 Русский / 🇬🇧 English с визуальным состоянием active
- При клике вызывается `I18n.setLanguage(lang, userId)` с async sync в Supabase

---

## Phase 4: Рецепты

**Статус:** ✅ Completed

### Tasks
- [x] 4.1 Вынести текст рецептов в `recipes-ru.js`
- [x] 4.2 Перевести рецепты (`recipes-en.js`)
- [x] 4.3 Обновить renderRecipes() и openRecipeDetail()

### Notes
- Создан `js/i18n/recipes-ru.js` — 21 рецепт (title, ingredients[], steps[])
- Создан `js/i18n/recipes-en.js` — полный перевод всех рецептов
- `renderRecipes()` использует `I18n.getRecipe(id)` для локализованных данных
- `openRecipeDetail()` показывает локализованные ингредиенты и шаги
- `renderProfileFavorites()` показывает локализованные названия

---

## Phase 5: Гайды

**Статус:** ✅ Completed

### Tasks
- [x] 5.1 Реструктуризация директории guides
- [x] 5.2 Перевести 9 гайдов на английский
- [x] 5.3 Обновить ссылки на гайды

### Notes
- Созданы директории `guides/ru/` и `guides/en/`
- Перемещены 9 русских гайдов в `guides/ru/`
- Созданы 9 английских версий в `guides/en/`:
  - plate-constructor.html — Plate Constructor
  - deficiencies-checklist.html — Deficiencies Checklist
  - smart-shopping.html — Smart Shopping
  - anti-sugar.html — Anti-Sugar Protocol (21-day)
  - clean-gut.html — Clean Gut (28-day GI health)
  - hormonal-glow.html — Hormonal Glow (cycle-synced nutrition)
  - metabolic-flexibility.html — Metabolic Flexibility (smart weight)
  - cortisol-control.html — Cortisol Control (anti-stress)
  - sleep-fix.html — Sleep Biochemistry (deep recovery)
- Добавлена функция `openGuide(filename)` в app.js
- Обновлены 9 onclick обработчиков в index.html для динамического пути `guides/${lang}/`

---

## Phase 6: Chatbot

**Статус:** ✅ Completed

### Tasks
- [x] 6.1 Добавить Code node в n8n workflow
- [x] 6.2 Параметризовать текстовые ноды
- [x] 6.3 Обновить Gemini prompts

### Notes
- Добавлены 2 Code nodes: `i18n Command` и `i18n Message`
- Определение языка через `message.from.language_code` (Telegram)
- Локализованные строки:
  - Welcome: "Привет! Отправь фото..." / "Hi! Send a food photo..."
  - Labels: ккал/kcal, Б/P, Ж/F, У/C
  - Buttons: "Записать"/"Save", "Отмена"/"Cancel"
  - Saved: "Сохранено в дневник!" / "Saved to diary!"
- AI Prompts локализованы: RU/EN версии для текста и фото
- Язык передаётся через callback_data для сохранения контекста

---

## Phase 7: Тестирование

**Статус:** 🧪 Manual Testing Required

### Pre-requisites
- [ ] Выполнить SQL миграцию `backend/add_language_column.sql` в Supabase Dashboard
- [ ] Импортировать обновлённый n8n workflow `backend/HBF Food Logger.json`
- [ ] Обновить Telegram webhook URL (если изменился ngrok)

### 7.1 Функциональное тестирование (RU↔EN)

**UI Elements Checklist:**
- [ ] Главная: заголовки приёмов пищи (Завтрак/Breakfast)
- [ ] Главная: кнопка "Добавить"/"Add" и пустое состояние
- [ ] Вода: ml метка, кнопка "+250ml"
- [ ] Рецепты: фильтры (категория, тип, время, ккал)
- [ ] Рецепты: названия рецептов в списке
- [ ] Рецепты: ингредиенты и шаги в детальном просмотре
- [ ] Рецепты: "В избранное"/"Add to favorites"
- [ ] Аналитика: заголовки периодов, подписи графиков
- [ ] Профиль: избранные рецепты с локализованными названиями
- [ ] Профиль: настройки (цели, вес)
- [ ] Settings Modal: переключатель языка работает

**Language Switching:**
- [ ] RU → EN: мгновенное обновление всего UI
- [ ] EN → RU: мгновенное обновление всего UI
- [ ] Язык сохраняется в localStorage
- [ ] Язык синхронизируется в Supabase (users.language)

### 7.2 Edge Cases

**First Launch (новый пользователь):**
- [ ] Telegram EN user → приложение на английском
- [ ] Telegram RU user → приложение на русском
- [ ] Язык сохраняется после выбора в Settings

**Offline Mode:**
- [ ] Приложение работает без сети (из localStorage)
- [ ] При восстановлении сети — sync с Supabase

**Guest Mode (без авторизации Telegram):**
- [ ] Язык определяется из localStorage или default 'ru'
- [ ] Переключение работает без Supabase sync

### 7.3 Guides Testing

- [ ] Все 9 гайдов открываются на русском (`guides/ru/`)
- [ ] Все 9 гайдов открываются на английском (`guides/en/`)
- [ ] Кнопка "Назад" возвращает на экран гайдов (`?screen=guides`)
- [ ] Стили и аккордеоны работают корректно

**Список гайдов:**
1. plate-constructor.html
2. deficiencies-checklist.html
3. smart-shopping.html
4. anti-sugar.html
5. clean-gut.html
6. hormonal-glow.html
7. metabolic-flexibility.html
8. cortisol-control.html
9. sleep-fix.html

### 7.4 Chatbot Testing

**Подготовка:**
- [ ] Импортировать `backend/HBF Food Logger.json` в n8n
- [ ] Проверить Telegram webhook

**Тесты с RU Telegram клиентом (language_code='ru'):**
- [ ] /start → "Привет! Отправь фото еды..."
- [ ] Отправить фото → "ккал, Б, Ж, У", кнопки "Записать"/"Отмена"
- [ ] Нажать "Записать" → "Сохранено в дневник!"

**Тесты с EN Telegram клиентом (language_code='en'):**
- [ ] /start → "Hi! Send a food photo..."
- [ ] Отправить фото → "kcal, P, F, C", кнопки "Save"/"Cancel"
- [ ] Нажать "Save" → "Saved to diary!"

### Notes
- Реализация завершена 2026-01-20
- Все 6 фаз разработки выполнены
- Требуется ручное тестирование пользователем

---

## Архитектура

### Структура файлов
```
js/i18n/
├── i18n.js           # I18n Manager
├── ru.js             # UI переводы RU
├── en.js             # UI переводы EN
├── recipes-ru.js     # Рецепты RU
└── recipes-en.js     # Рецепты EN

guides/
├── ru/               # Гайды RU
└── en/               # Гайды EN

backend/
└── add_language_column.sql
```

### Приоритет определения языка
1. Supabase `users.language`
2. localStorage `hbf_language`
3. Telegram `initDataUnsafe.user.language_code`
4. Default: `'ru'`

---

## Критические файлы

| Файл | Модификации |
|------|-------------|
| `js/app.js` | Интеграция I18n, render функции |
| `index.html` | Подключение скриптов, switcher |
| `css/style.css` | Стили language-switcher |
| `backend/HBF Food Logger.json` | n8n мультиязычность |
