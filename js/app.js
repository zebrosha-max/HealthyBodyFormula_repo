document.addEventListener('DOMContentLoaded', () => {
    // Initialize Telegram Web App with safety check
    let tg = { 
        ready: () => {}, expand: () => {}, setHeaderColor: () => {}, 
        setBackgroundColor: () => {}, HapticFeedback: { impactOccurred: () => {}, selectionChanged: () => {} } 
    };
    
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#F0F7F4');
            tg.setBackgroundColor('#F8F9FA');
        }
    } catch (e) {
        console.error("Telegram SDK init error:", e);
    }

    // Supabase Configuration with safety check
    const SUPABASE_URL = 'https://jaxiqphuvwspwanydlez.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_dx1fnlKqP5w9e26_qLuFxA_DYLd392O';
    let supabase = null;
    
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            // Export client globally for i18n.js
            window.supabaseClient = supabase;
        }
    } catch (e) {
        console.error("Supabase init error:", e);
    }

    // ===== I18N INITIALIZATION =====
    // Initialize from localStorage cache ONLY (no Telegram fallback)
    // This ensures Supabase user.language takes priority when loaded later
    // Telegram fallback is applied in applyUserState() if no Supabase language
    if (typeof I18n !== 'undefined') {
        I18n.initWithCache();
        // Apply translations immediately after init (DOM is ready)
        // This ensures cached language is applied even without languageChanged event
        setTimeout(() => {
            updateStaticTexts();
            updateFilterOptions();
        }, 0);
    }

    // Helper function for translations (shorthand)
    function t(key, replacements) {
        if (typeof I18n !== 'undefined') {
            return I18n.t(key, replacements);
        }
        return key;
    }

    // ===== I18N UI REFRESH =====
    // Called when language changes to update all visible UI
    function refreshAllUI() {
        // Update static text elements
        updateStaticTexts();

        // Re-render dynamic content
        renderRecipes();
        renderProfileFavorites();
        renderFoodDiary();
        updateWaterUI();
        renderBodyStats();
        updateDateLabel();

        // Update filter dropdowns
        updateFilterOptions();

        // Update settings modal labels
        updateSettingsModal();

        // Update guides screen
        updateGuidesScreen();

        console.log('[I18n] UI refreshed for language:', I18n?.currentLang);
    }

    // Update static text elements in HTML
    function updateStaticTexts() {
        // Main screen
        const greeting = document.querySelector('.header-greeting');
        if (greeting) greeting.textContent = t('main.greeting');

        const subtitle = document.querySelector('.header-subtitle');
        if (subtitle) subtitle.textContent = t('main.subtitle');

        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) headerTitle.textContent = t('main.title');

        const footerHint = document.querySelector('.footer-hint p');
        if (footerHint) footerHint.innerHTML = `<i class="fa-solid fa-heart"></i> ${t('main.footerHint')} <span style="opacity: 0.3; font-size: 9px; margin-left: 5px;">v1.2</span>`;

        // FAB button
        const fabText = document.querySelector('#fab-log-food span');
        if (fabText) fabText.textContent = t('main.logFood');

        // Navigation cards
        const navCards = document.querySelectorAll('.nav-card');
        const navLabels = ['aboutMe', 'recipes', 'guides', 'services'];
        navCards.forEach((card, i) => {
            const titleEl = card.querySelector('.card-title');
            if (titleEl && navLabels[i]) {
                titleEl.textContent = t(`main.${navLabels[i]}`);
            }
        });

        // Card subtitle (Diplomas)
        const diplomasSubtitle = document.getElementById('card-subtitle-diplomas');
        if (diplomasSubtitle) diplomasSubtitle.textContent = t('main.diplomas');

        // Bottom navigation
        const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item span');
        const navKeys = ['home', 'services', 'recipes', 'profile'];
        bottomNavItems.forEach((span, i) => {
            if (navKeys[i]) span.textContent = t(`nav.${navKeys[i]}`);
        });

        // Page titles
        const pageTitles = {
            'screen-about': 'about.title',
            'screen-guides': 'guides.title',
            'screen-recipes': 'recipes.title',
            'screen-services': 'services.title',
            'screen-profile': 'profile.title',
            'screen-analytics': 'analytics.title',
            'screen-recipe-detail': 'recipes.recipeDetail'
        };

        Object.entries(pageTitles).forEach(([screenId, key]) => {
            const screen = document.getElementById(screenId);
            if (screen) {
                const title = screen.querySelector('.page-title');
                if (title) title.textContent = t(key);
            }
        });

        // Profile section labels
        const weightTitle = document.querySelector('#weight-section h3');
        if (weightTitle) weightTitle.innerHTML = `<i class="fa-solid fa-scale-balanced"></i> ${t('profile.weight.title')}`;

        const waterTitle = document.querySelector('#water-section h3');
        if (waterTitle) waterTitle.innerHTML = `<i class="fa-solid fa-droplet"></i> ${t('profile.water.title')}`;

        const diaryTitle = document.querySelector('#diary-section h3');
        if (diaryTitle) diaryTitle.innerHTML = `<i class="fa-solid fa-utensils"></i> ${t('profile.diary.title')}`;

        const favoritesTitle = document.querySelector('#screen-profile .bio-card:last-child h3');
        if (favoritesTitle) favoritesTitle.innerHTML = `<i class="fa-solid fa-heart"></i> ${t('profile.favorites.title')}`;

        // Weight log button
        const weightLogBtn = document.querySelector('#btn-log-weight');
        if (weightLogBtn) weightLogBtn.innerHTML = `<i class="fa-solid fa-pen"></i> ${t('profile.weight.log')}`;

        // Weight unit (kg)
        const weightUnit = document.getElementById('weight-unit');
        if (weightUnit) weightUnit.textContent = t('common.kg');

        // Diary empty state
        const diaryEmpty = document.getElementById('diary-empty');
        if (diaryEmpty) diaryEmpty.textContent = t('profile.diary.empty');

        // Diary stats labels
        const diaryTodaySpan = document.querySelector('.diary-stats span:first-child');
        if (diaryTodaySpan) {
            const totalEl = document.getElementById('diary-kcal-total');
            const val = totalEl ? totalEl.textContent : '0';
            diaryTodaySpan.innerHTML = t('profile.diary.todayLabel').replace('{{value}}', `<strong id="diary-kcal-total">${val}</strong>`);
        }

        const diaryGoalSpan = document.querySelector('.diary-stats span:last-child');
        if (diaryGoalSpan) {
            const goalEl = document.getElementById('diary-goal-display');
            const val = goalEl ? goalEl.textContent : state.calorieGoal;
            diaryGoalSpan.innerHTML = t('profile.diary.goalLabel').replace('{{value}}', `<strong id="diary-goal-display">${val}</strong>`);
        }

        // Favorites empty state
        const favEmpty = document.getElementById('profile-favorites-empty');
        if (favEmpty) favEmpty.textContent = t('profile.favorites.empty');

        // Recipe detail labels
        const ingredientsTitle = document.querySelector('#screen-recipe-detail .recipe-block:first-of-type h3');
        if (ingredientsTitle) ingredientsTitle.innerHTML = `<i class="fa-solid fa-basket-shopping"></i> ${t('recipes.ingredients')}`;

        const stepsTitle = document.querySelector('#screen-recipe-detail .recipe-block:last-of-type h3');
        if (stepsTitle) stepsTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> ${t('recipes.steps')}`;

        // Reset filters button
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) resetBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> ${t('recipes.reset')}`;

        // Analytics period buttons
        const weekBtn = document.getElementById('analytics-week-btn');
        if (weekBtn) weekBtn.textContent = t('analytics.week');

        const monthBtn = document.getElementById('analytics-month-btn');
        if (monthBtn) monthBtn.textContent = t('analytics.month');

        // Analytics tabs
        const analyticsTabs = document.querySelectorAll('.tab-btn');
        const tabLabels = { weight: 'analytics.weight', calories: 'analytics.calories', water: 'analytics.water' };
        analyticsTabs.forEach(tab => {
            const type = tab.dataset.type;
            if (type && tabLabels[type]) {
                const icon = tab.querySelector('i');
                const iconClass = icon ? icon.className : '';
                tab.innerHTML = `<i class="${iconClass}"></i> ${t(tabLabels[type])}`;
            }
        });

        // Lightbox hint
        const lightboxHint = document.getElementById('hintText');
        if (lightboxHint) lightboxHint.textContent = t('lightbox.hint');

        // About screen
        const profileRole = document.querySelector('#screen-about .profile-title');
        if (profileRole) profileRole.textContent = t('about.role');

        const bioTitle = document.querySelector('#screen-about .bio-card h3');
        if (bioTitle) bioTitle.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${t('about.bioTitle')}`;

        const bioText = document.querySelector('#screen-about .bio-text');
        if (bioText) bioText.textContent = t('about.bioText');

        const certsTitle = document.querySelector('.certificates-section .section-title');
        if (certsTitle) certsTitle.innerHTML = `<i class="fa-solid fa-award"></i> ${t('about.certificatesTitle')}`;

        // Services screen
        updateServicesScreen();
    }

    // Update filter dropdown options
    function updateFilterOptions() {
        const categorySelect = document.getElementById('filter-category');
        if (categorySelect) {
            const opts = categorySelect.options;
            if (opts[0]) opts[0].text = t('recipes.categories.all');
            if (opts[1]) opts[1].text = t('recipes.categories.breakfast');
            if (opts[2]) opts[2].text = t('recipes.categories.lunch');
            if (opts[3]) opts[3].text = t('recipes.categories.dinner');
            if (opts[4]) opts[4].text = t('recipes.categories.dessert');
        }

        const typeSelect = document.getElementById('filter-type');
        if (typeSelect) {
            const opts = typeSelect.options;
            if (opts[0]) opts[0].text = t('recipes.types.all');
            if (opts[1]) opts[1].text = t('recipes.types.meat');
            if (opts[2]) opts[2].text = t('recipes.types.poultry');
            if (opts[3]) opts[3].text = t('recipes.types.fish');
            if (opts[4]) opts[4].text = t('recipes.types.vegetarian');
        }

        const timeSelect = document.getElementById('filter-time');
        if (timeSelect) {
            const opts = timeSelect.options;
            if (opts[0]) opts[0].text = t('recipes.timeOptions.all');
            if (opts[1]) opts[1].text = t('recipes.timeOptions.short');
            if (opts[2]) opts[2].text = t('recipes.timeOptions.medium');
            if (opts[3]) opts[3].text = t('recipes.timeOptions.long');
        }

        const kcalSelect = document.getElementById('filter-kcal');
        if (kcalSelect) {
            const opts = kcalSelect.options;
            if (opts[0]) opts[0].text = t('recipes.kcalOptions.all');
            if (opts[1]) opts[1].text = t('recipes.kcalOptions.light');
            if (opts[2]) opts[2].text = t('recipes.kcalOptions.medium');
            if (opts[3]) opts[3].text = t('recipes.kcalOptions.heavy');
        }
    }

    // Update guides screen
    function updateGuidesScreen() {
        // Page title
        const pageTitle = document.getElementById('guides-page-title');
        if (pageTitle) pageTitle.textContent = t('guides.title');

        // Guide card keys matching i18n structure
        const guideKeys = ['starter', 'plate', 'deficiencies', 'shopping', 'antiSugar', 'cleanGut', 'hormonal', 'metabolic', 'cortisol', 'sleep'];

        guideKeys.forEach(key => {
            const titleEl = document.getElementById(`guide-title-${key}`);
            if (titleEl) titleEl.textContent = t(`guides.${key}.title`);

            const descEl = document.getElementById(`guide-desc-${key}`);
            if (descEl) descEl.textContent = t(`guides.${key}.desc`);

            const priceEl = document.getElementById(`guide-price-${key}`);
            if (priceEl) priceEl.textContent = t('common.free');

            const btnEl = document.getElementById(`guide-btn-${key}`);
            if (btnEl) {
                // Starter has download icon, others have read icon
                if (key === 'starter') {
                    btnEl.innerHTML = `${t('common.download')} <i class="fa-solid fa-download"></i>`;
                } else {
                    btnEl.innerHTML = `${t('common.read')} <i class="fa-solid fa-chevron-right"></i>`;
                }
            }
        });
    }

    // Update settings modal labels
    function updateSettingsModal() {
        const title = document.getElementById('settings-title');
        if (title) title.textContent = t('settings.title');

        const calorieLabel = document.getElementById('settings-calorie-label');
        if (calorieLabel) calorieLabel.textContent = t('settings.calorieLabel');

        const waterLabel = document.getElementById('settings-water-label');
        if (waterLabel) waterLabel.textContent = t('settings.waterLabel');

        const weightStartLabel = document.getElementById('settings-weight-start-label');
        if (weightStartLabel) weightStartLabel.textContent = t('settings.weightStartLabel');

        const weightGoalLabel = document.getElementById('settings-weight-goal-label');
        if (weightGoalLabel) weightGoalLabel.textContent = t('settings.weightGoalLabel');

        const langLabel = document.getElementById('settings-language-label');
        if (langLabel) langLabel.textContent = t('settings.languageLabel');

        const cancelBtn = document.getElementById('modal-cancel');
        if (cancelBtn) cancelBtn.textContent = t('common.cancel');

        const saveBtn = document.getElementById('modal-save');
        if (saveBtn) saveBtn.textContent = t('common.save');
    }

    // Update services screen
    function updateServicesScreen() {
        const servicesCards = document.querySelectorAll('#screen-services .bio-card');
        if (servicesCards.length >= 2) {
            // Consultation
            const consultTitle = servicesCards[0].querySelector('h3');
            if (consultTitle) consultTitle.innerHTML = `<i class="fa-solid fa-comments"></i> ${t('services.consultation.title')}`;
            const consultDesc = servicesCards[0].querySelector('.bio-text');
            if (consultDesc) consultDesc.textContent = t('services.consultation.desc');
            const consultPrice = servicesCards[0].querySelector('.guide-price');
            if (consultPrice) consultPrice.textContent = t('services.consultation.price');
            const consultBtn = servicesCards[0].querySelector('.guide-btn');
            if (consultBtn) consultBtn.innerHTML = `${t('common.book')} <i class="fa-solid fa-chevron-right"></i>`;

            // Support
            const supportTitle = servicesCards[1].querySelector('h3');
            if (supportTitle) supportTitle.innerHTML = `<i class="fa-solid fa-calendar-check"></i> ${t('services.support.title')}`;
            const supportDesc = servicesCards[1].querySelector('.bio-text');
            if (supportDesc) supportDesc.textContent = t('services.support.desc');
            const supportPrice = servicesCards[1].querySelector('.guide-price');
            if (supportPrice) supportPrice.textContent = t('services.support.price');
            const supportBtn = servicesCards[1].querySelector('.guide-btn');
            if (supportBtn) supportBtn.innerHTML = `${t('common.book')} <i class="fa-solid fa-chevron-right"></i>`;
        }
    }

    // Listen for language change event
    document.addEventListener('languageChanged', (e) => {
        state.language = e.detail.lang;
        refreshAllUI();
    });

    // ===== LANGUAGE SWITCHER HANDLER =====
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const lang = btn.dataset.lang;
            if (!lang || lang === I18n?.currentLang) return;

            // Update button states
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.style.borderColor = 'var(--sage-green-light)';
                b.style.background = 'var(--card-bg)';
            });
            btn.style.borderColor = 'var(--sage-green)';
            btn.style.background = 'var(--sage-green-light)';

            // Switch language
            if (typeof I18n !== 'undefined') {
                debugLog(`LangSwitch: → ${lang}`);
                debugLog(`user.telegram_id: ${state.user?.telegram_id || 'undefined'}`, state.user?.telegram_id ? 'info' : 'warn');
                await I18n.setLanguage(lang, state.user?.telegram_id);
                debugLog(`localStorage: ${localStorage.getItem('hbf_language')}`, 'success');
            }
        });
    });

    // ===== DEBUG LOG (временный, для отладки) =====
    const debugLogEl = document.getElementById('debug-log');
    let debugEnabled = false; // true = показать визуальный лог для отладки

    function debugLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = { info: 'ℹ️', error: '❌', success: '✅', warn: '⚠️' }[type] || '';
        const logMessage = `${timestamp} ${prefix} ${message}`;

        console.log(`[DEBUG] ${logMessage}`);

        if (debugEnabled && debugLogEl) {
            debugLogEl.style.display = 'block';
            const line = document.createElement('div');
            line.style.color = { info: '#0f0', error: '#f55', success: '#5f5', warn: '#ff5' }[type] || '#0f0';
            line.textContent = logMessage;
            debugLogEl.appendChild(line);
            debugLogEl.scrollTop = debugLogEl.scrollHeight;

            // Ограничить до 50 строк
            while (debugLogEl.children.length > 50) {
                debugLogEl.removeChild(debugLogEl.firstChild);
            }
        }
    }
    // Make debugLog globally accessible for i18n.js
    window.debugLog = debugLog;

    // ===== FETCH WITH TIMEOUT & RETRY =====
    async function fetchWithTimeout(promiseFn, timeoutMs = 10000, retries = 2) {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const result = await Promise.race([
                    promiseFn(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
                    )
                ]);
                return result;
            } catch (e) {
                debugLog(`Fetch attempt ${attempt + 1}/${retries + 1} failed: ${e.message}`, 'warn');
                if (attempt === retries) throw e;
                // Exponential backoff: 1s, 2s
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
    }

    // ===== ANALYTICS CACHE (Cache-First Strategy) =====
    const AnalyticsCache = {
        KEY: 'hbf_analytics_v1',
        MAX_ENTRIES: 20,

        getKey(type, period, date) {
            const dateStr = date.toISOString().split('T')[0];
            return `${type}_${period}_${dateStr}`;
        },

        save(type, period, date, processedData) {
            try {
                const cache = JSON.parse(localStorage.getItem(this.KEY) || '{}');
                cache[this.getKey(type, period, date)] = {
                    data: processedData,
                    timestamp: Date.now()
                };
                // Лимит записей - удаляем старые
                const keys = Object.keys(cache);
                while (keys.length > this.MAX_ENTRIES) {
                    const oldestKey = keys.shift();
                    delete cache[oldestKey];
                }
                localStorage.setItem(this.KEY, JSON.stringify(cache));
                debugLog(`AnalyticsCache: saved ${type}/${period}`, 'success');
            } catch (e) {
                console.warn('AnalyticsCache save error:', e);
            }
        },

        load(type, period, date) {
            try {
                const cache = JSON.parse(localStorage.getItem(this.KEY) || '{}');
                const entry = cache[this.getKey(type, period, date)];
                if (entry?.data) {
                    debugLog(`AnalyticsCache: HIT ${type}/${period}`, 'success');
                    return entry.data;
                }
                debugLog(`AnalyticsCache: MISS ${type}/${period}`, 'info');
                return null;
            } catch (e) {
                return null;
            }
        }
    };

    // State Management
    const state = {
        user: null,
        isPremium: false,
        activeTab: 'main',
        favorites: [],
        language: (typeof I18n !== 'undefined') ? I18n.currentLang : 'ru',
        calorieGoal: parseInt(localStorage.getItem('hbf_calorie_goal')) || 2000,
        waterGoal: parseInt(localStorage.getItem('hbf_water_goal')) || 2000,
        waterToday: 0,
        weightStart: parseFloat(localStorage.getItem('hbf_weight_start')) || 0,
        weightGoal: parseFloat(localStorage.getItem('hbf_weight_goal')) || 0,
        weightCurrent: 0,
        currentDate: new Date(), // Current selected date
        analyticsDate: new Date(), // Date for analytics navigation
        analyticsType: 'weight', // 'weight' | 'calories' | 'water'
        analyticsPeriod: 'week', // 'week' | 'month'
        filters: {
            category: 'all',
            type: 'all',
            time: 'all',
            kcal: 'all',
            onlyFavorites: false
        }
    };

    // Helper to get date boundaries
    function getDateBoundaries(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        
        return { start: start.toISOString(), end: end.toISOString() };
    }

    // ===== CACHE MANAGER =====
    const CACHE_TTL = 1000 * 60 * 60; // 1 hour validity for read-heavy data (optional, currently unused but good practice)
    
    function getCacheKey(type, date) {
        const dateStr = date.toISOString().split('T')[0];
        return `hbf_cache_${type}_${state.user?.telegram_id}_${dateStr}`;
    }

    function loadCache(type, date) {
        if (!state.user) return null;
        const key = getCacheKey(type, date);
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    }

    function saveCache(type, date, data) {
        if (!state.user) return;
        const key = getCacheKey(type, date);
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ===== REALTIME MANAGER =====
    const RealtimeManager = {
        channel: null,
        isConnected: false,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        pollingInterval: null,

        // Инициализация Realtime подписок
        init() {
            debugLog('RealtimeManager.init called');
            if (!supabase || !state.user) {
                debugLog('Realtime skipped: no supabase/user', 'warn');
                console.log('[Realtime] Skipped: no supabase or user');
                return;
            }

            // Graceful degradation: проверка WebSocket
            if (typeof WebSocket === 'undefined') {
                console.warn('[Realtime] WebSocket not supported, falling back to polling');
                this.startPolling();
                return;
            }

            this.cleanup(); // Очистить старые подписки

            const userId = state.user.telegram_id;

            this.channel = supabase
                .channel(`user-${userId}-changes`)
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'food_logs',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => this.handleFoodChange(payload)
                )
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'water_logs',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => this.handleWaterChange(payload)
                )
                .on('postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'weight_logs',
                        filter: `user_id=eq.${userId}`
                    },
                    (payload) => this.handleWeightChange(payload)
                )
                .on('postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'users',
                        filter: `telegram_id=eq.${userId}`
                    },
                    (payload) => this.handleUserChange(payload)
                )
                .subscribe((status, err) => {
                    console.log('[Realtime] Status:', status);
                    debugLog(`Realtime: ${status}`, status === 'SUBSCRIBED' ? 'success' : (status === 'CHANNEL_ERROR' ? 'error' : 'info'));

                    if (status === 'SUBSCRIBED') {
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                        console.log('[Realtime] Connected successfully');
                    }

                    if (status === 'CHANNEL_ERROR') {
                        debugLog(`Realtime error: ${err?.message || err}`, 'error');
                        console.error('[Realtime] Channel error:', err);
                        this.isConnected = false;
                        this.scheduleReconnect();
                    }

                    if (status === 'TIMED_OUT') {
                        console.warn('[Realtime] Connection timed out');
                        this.isConnected = false;
                        this.scheduleReconnect();
                    }

                    if (status === 'CLOSED') {
                        console.warn('[Realtime] Channel closed');
                        this.isConnected = false;
                    }
                });
        },

        // Обработчик изменений food_logs
        handleFoodChange(payload) {
            console.log('[Realtime] Food change:', payload.eventType);

            const { eventType, new: newRecord, old: oldRecord } = payload;
            const currentDateStr = state.currentDate.toISOString().split('T')[0];

            // Проверяем, относится ли изменение к текущей дате
            const recordDate = newRecord?.created_at || oldRecord?.created_at;
            if (recordDate) {
                const recordDateStr = new Date(recordDate).toISOString().split('T')[0];
                if (recordDateStr !== currentDateStr) {
                    console.log('[Realtime] Food change for different date, skipping UI update');
                    return;
                }
            }

            // Обновляем кэш и UI
            const cachedData = loadCache('food', state.currentDate) || [];
            let updatedData;

            switch (eventType) {
                case 'INSERT':
                    // Проверяем, нет ли уже этой записи (optimistic update)
                    if (!cachedData.find(item => item.id === newRecord.id)) {
                        updatedData = [newRecord, ...cachedData];
                    } else {
                        return; // Уже есть, пропускаем
                    }
                    break;

                case 'UPDATE':
                    updatedData = cachedData.map(item =>
                        item.id === newRecord.id ? newRecord : item
                    );
                    break;

                case 'DELETE':
                    updatedData = cachedData.filter(item => item.id !== oldRecord.id);
                    break;

                default:
                    return;
            }

            saveCache('food', state.currentDate, updatedData);
            renderDiaryItems(updatedData);

            // Haptic feedback для внешних изменений
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        },

        // Обработчик изменений water_logs
        handleWaterChange(payload) {
            console.log('[Realtime] Water change:', payload.eventType);

            const { eventType, new: newRecord, old: oldRecord } = payload;
            const currentDateStr = state.currentDate.toISOString().split('T')[0];

            // Проверяем дату
            const recordDate = newRecord?.created_at || oldRecord?.created_at;
            if (recordDate) {
                const recordDateStr = new Date(recordDate).toISOString().split('T')[0];
                if (recordDateStr !== currentDateStr) return;
            }

            // Пересчитываем сумму воды за день
            renderWaterTracker(true);
        },

        // Обработчик изменений weight_logs
        handleWeightChange(payload) {
            console.log('[Realtime] Weight change:', payload.eventType);

            const { eventType, new: newRecord } = payload;

            if (eventType === 'INSERT' || eventType === 'UPDATE') {
                state.weightCurrent = newRecord.weight_kg;
                saveCache('weight', state.currentDate, newRecord.weight_kg);
                updateWeightUI();

                if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            }
        },

        // Обработчик изменений users (настройки)
        handleUserChange(payload) {
            console.log('[Realtime] User settings change');

            const { new: newUser } = payload;
            if (newUser) {
                state.calorieGoal = newUser.calorie_goal || 2000;
                state.waterGoal = newUser.water_goal || 2000;
                state.weightStart = newUser.weight_start || 0;
                state.weightGoal = newUser.weight_goal || 0;

                // Сохраняем в localStorage
                localStorage.setItem('hbf_calorie_goal', state.calorieGoal);
                localStorage.setItem('hbf_water_goal', state.waterGoal);
                localStorage.setItem('hbf_weight_start', state.weightStart);
                localStorage.setItem('hbf_weight_goal', state.weightGoal);

                // Обновляем UI
                renderFoodDiary();
                renderWaterTracker();
                renderBodyStats();
            }
        },

        // Переподключение с exponential backoff
        scheduleReconnect() {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('[Realtime] Max reconnect attempts reached, falling back to polling');
                this.startPolling();
                return;
            }

            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            this.reconnectAttempts++;

            console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                if (!this.isConnected) {
                    this.init();
                }
            }, delay);
        },

        // Fallback polling для устройств без стабильного WebSocket
        startPolling() {
            if (this.pollingInterval) return;

            console.log('[Realtime] Starting polling fallback (30s interval)');
            this.pollingInterval = setInterval(() => {
                if (state.user && document.visibilityState === 'visible') {
                    loadProfileData();
                }
            }, 30000);
        },

        // Очистка подписок
        cleanup() {
            debugLog('RealtimeManager.cleanup called');
            try {
                if (this.channel && supabase) {
                    this.channel.unsubscribe();
                    supabase.removeChannel(this.channel);
                    this.channel = null;
                }

                if (this.pollingInterval) {
                    clearInterval(this.pollingInterval);
                    this.pollingInterval = null;
                }

                this.isConnected = false;
                debugLog('RealtimeManager.cleanup done', 'success');
            } catch (e) {
                debugLog(`RealtimeManager.cleanup error: ${e.message}`, 'error');
                console.warn('[Realtime] Cleanup error:', e);
            }
        }
    };

    // ===== LIFECYCLE MANAGER =====
    const LifecycleManager = {
        lastVisibleTime: Date.now(),
        STALE_THRESHOLD: 30000, // 30 секунд
        initialized: false,

        init() {
            if (this.initialized) return;
            this.initialized = true;

            // Обработка возврата из фона
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    this.handleResume();
                } else {
                    this.handlePause();
                }
            });

            // Обработка фокуса окна (для iOS Safari)
            window.addEventListener('focus', () => this.handleResume());
            window.addEventListener('blur', () => this.handlePause());

            // Обработка online/offline
            window.addEventListener('online', () => {
                console.log('[Lifecycle] Back online');
                this.handleResume();
            });

            window.addEventListener('offline', () => {
                console.log('[Lifecycle] Went offline');
                RealtimeManager.isConnected = false;
            });

            console.log('[Lifecycle] Initialized');
        },

        handlePause() {
            this.lastVisibleTime = Date.now();
            console.log('[Lifecycle] App paused');
        },

        handleResume() {
            const elapsed = Date.now() - this.lastVisibleTime;
            console.log(`[Lifecycle] App resumed after ${elapsed}ms`);

            // Если прошло больше порога - данные могут быть устаревшими
            if (elapsed > this.STALE_THRESHOLD) {
                console.log('[Lifecycle] Data may be stale, refreshing...');

                // Переподключаем Realtime если нужно
                if (!RealtimeManager.isConnected && state.user) {
                    RealtimeManager.init();
                }

                // Принудительно обновляем данные
                if (state.user) {
                    loadProfileData();
                }
            }
        }
    };

    // ===== SCREEN NAVIGATION =====
    const screens = document.querySelectorAll('.screen');
    const navCards = document.querySelectorAll('.nav-card[data-screen]');
    const backButtons = document.querySelectorAll('[data-back]');
    const tabItems = document.querySelectorAll('.nav-item[data-tab]');

    // Navigation Tabs Logic
    function showScreen(screenId, isBack = false) {
        screens.forEach(screen => {
            screen.classList.remove('active', 'back-animation');
        });
        
        const targetScreen = document.getElementById(`screen-${screenId}`);
        if (targetScreen) {
            if (isBack) {
                targetScreen.classList.add('back-animation');
            }
            targetScreen.classList.add('active');
            window.scrollTo(0, 0);
            
            updateActiveTab(screenId);
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

            // Refresh Diary and Water when entering profile (Parallel)
            if (screenId === 'profile') {
                loadProfileData();
            }

            // Update filter options when entering recipes screen
            if (screenId === 'recipes') {
                updateFilterOptions();
            }

            // Update guides when entering guides screen
            if (screenId === 'guides') {
                updateGuidesScreen();
            }
        }
    }

    async function loadProfileData() {
        if (!state.user) return;
        // Parallel data fetching for speed
        await Promise.all([
            renderFoodDiary(),
            renderWaterTracker(),
            renderBodyStats()
        ]);
    }

    // Open guide with language-aware path
    window.openGuide = function(filename) {
        const lang = I18n.currentLang || 'ru';
        window.location.href = `guides/${lang}/${filename}`;
    };

    // ===== DATE NAVIGATION LOGIC =====
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const dateLabel = document.getElementById('current-date-label');
    const dateInput = document.getElementById('date-picker-input');
    const dateTrigger = document.getElementById('date-picker-trigger');

    if (prevDayBtn && nextDayBtn && dateLabel && dateInput) {
        
        // Open native date picker when clicking the label area
        if (dateTrigger) {
            dateTrigger.addEventListener('click', () => {
                try {
                    if (typeof dateInput.showPicker === 'function') {
                        dateInput.showPicker();
                    } else {
                        dateInput.click();
                    }
                } catch (e) {
                    dateInput.focus();
                }
            });
        }
        
        function updateDateUI() {
            const now = new Date();
            const isToday = state.currentDate.toDateString() === now.toDateString();
            
            // Format Label
            if (isToday) {
                dateLabel.textContent = t('common.today');
            } else {
                const locale = I18n?.currentLang === 'en' ? 'en-US' : 'ru-RU';
                dateLabel.textContent = state.currentDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', weekday: 'short' });
            }

            // Sync Input (YYYY-MM-DD)
            // Adjust for timezone offset to show correct local date in input
            const localDate = new Date(state.currentDate.getTime() - (state.currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            dateInput.value = localDate;
            dateInput.max = new Date().toISOString().split('T')[0]; // Block future

            // Disable Next button if today
            nextDayBtn.disabled = isToday;
            nextDayBtn.style.opacity = isToday ? '0.3' : '1';
        }

        function changeDate(delta) {
            const newDate = new Date(state.currentDate);
            newDate.setDate(newDate.getDate() + delta);
            
            // Block future
            if (newDate > new Date()) return;

            state.currentDate = newDate;
            updateDateUI();
            
            if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
            
            // Reload Data
            loadProfileData(); 
        }

        prevDayBtn.addEventListener('click', () => changeDate(-1));
        nextDayBtn.addEventListener('click', () => changeDate(1));

        dateInput.addEventListener('change', (e) => {
            if (e.target.value) {
                state.currentDate = new Date(e.target.value);
                updateDateUI();
                loadProfileData();
            }
        });

        // Init UI
        updateDateUI();
    }

    // ===== SMART LOGGER (FAB) =====
    const fabLogFood = document.getElementById('fab-log-food');
    const btnLogFoodProfile = document.getElementById('btn-log-food-profile');

    function openLogFood() {
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        tg.openTelegramLink('https://t.me/HealthyBodyFormula_bot?start=log_food');
        tg.close();
    }

    if (fabLogFood) fabLogFood.addEventListener('click', openLogFood);
    if (btnLogFoodProfile) btnLogFoodProfile.addEventListener('click', openLogFood);

    // ===== FOOD DIARY LOGIC =====
    
    // Settings Modal Logic
    const settingsBtn = document.getElementById('diary-settings-btn');
    const modal = document.getElementById('modal-diary-settings');
    const modalInput = document.getElementById('diary-goal-input');
    const waterGoalInput = document.getElementById('water-goal-input');
    const weightStartInput = document.getElementById('weight-start-input');
    const weightGoalInput = document.getElementById('weight-goal-input');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');

    if (settingsBtn && modal) {
        settingsBtn.addEventListener('click', () => {
            modalInput.value = state.calorieGoal;
            if (waterGoalInput) waterGoalInput.value = state.waterGoal;
            if (weightStartInput) weightStartInput.value = state.weightStart || '';
            if (weightGoalInput) weightGoalInput.value = state.weightGoal || '';
            
            modal.classList.add('active');
            if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });

        modalCancel.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modalSave.addEventListener('click', async () => {
            const btn = modalSave;
            const originalText = btn.textContent;
            const newGoal = parseInt(modalInput.value);
            const newWaterGoal = parseInt(waterGoalInput.value);
            const newWeightStart = parseFloat(weightStartInput.value);
            const newWeightGoal = parseFloat(weightGoalInput.value);
            
            // Validation visual feedback
            if (!newGoal || newGoal < 500 || newGoal > 10000) {
                if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
                modalInput.style.borderColor = '#ff6b6b';
                setTimeout(() => modalInput.style.borderColor = '', 1000);
                return;
            }

            // OPTIMISTIC UPDATE (Instant UI feedback)
            state.calorieGoal = newGoal;
            state.waterGoal = newWaterGoal;
            if (!isNaN(newWeightStart)) state.weightStart = newWeightStart;
            if (!isNaN(newWeightGoal)) state.weightGoal = newWeightGoal;

            localStorage.setItem('hbf_calorie_goal', newGoal);
            localStorage.setItem('hbf_water_goal', newWaterGoal);
            localStorage.setItem('hbf_weight_start', state.weightStart);
            localStorage.setItem('hbf_weight_goal', state.weightGoal);

            // Close modal immediately
            modal.classList.remove('active');
            
            // Update UI widgets
            renderFoodDiary(); 
            renderWaterTracker();
            renderBodyStats();
            
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

            // Background Sync
            if (state.user && supabase) {
                try {
                    await supabase
                        .from('users')
                        .update({ 
                            calorie_goal: newGoal,
                            water_goal: newWaterGoal,
                            weight_start: state.weightStart,
                            weight_goal: state.weightGoal
                        })
                        .eq('telegram_id', state.user.telegram_id);
                } catch (e) {
                    console.error("Failed to update goal (Background):", e);
                }
            }
        });
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    async function renderFoodDiary() {
        const diaryList = document.getElementById('diary-list');
        const diaryEmpty = document.getElementById('diary-empty');
        const kcalTotalEl = document.getElementById('diary-kcal-total');
        const goalDisplayEl = document.getElementById('diary-goal-display');
        const progressBar = document.getElementById('diary-progress');
        
        if (!diaryList || !state.user || !supabase) return;
        
        // Update Goal Display
        if(goalDisplayEl) goalDisplayEl.textContent = state.calorieGoal;

        // 1. Render from Cache FIRST (Instant UI)
        const cachedData = loadCache('food', state.currentDate);
        if (cachedData) {
            renderDiaryItems(cachedData);
            console.log("Food Diary rendered from cache");
        }

        try {
            const { start, end } = getDateBoundaries(state.currentDate);
            
            const { data, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('user_id', state.user.telegram_id)
                .eq('status', 'confirmed')
                .gte('created_at', start)
                .lte('created_at', end) // Added LTE
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 2. Update UI with fresh data & Save to Cache
            if (data) {
                // Only re-render if data is different from cache to avoid flickering?
                // For simplicity/robustness, we re-render always for now, or check length.
                saveCache('food', state.currentDate, data);
                renderDiaryItems(data);
            }

        } catch (e) {
            console.error("Diary load error:", e);
        }
    }

    function renderDiaryItems(data) {
        const diaryList = document.getElementById('diary-list');
        const diaryEmpty = document.getElementById('diary-empty');
        const kcalTotalEl = document.getElementById('diary-kcal-total');
        const progressBar = document.getElementById('diary-progress');

        if (!data || data.length === 0) {
            diaryList.innerHTML = '';
            diaryEmpty.style.display = 'block';
            kcalTotalEl.textContent = '0';
            progressBar.style.width = '0%';
            return;
        }

        diaryEmpty.style.display = 'none';
        diaryList.innerHTML = '';
        
        let totalKcal = 0;
        const locale = I18n?.currentLang === 'en' ? 'en-US' : 'ru-RU';
        data.forEach(log => {
            totalKcal += log.calories;
            const time = new Date(log.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('div');
            item.className = 'food-log-item';
            item.innerHTML = `
                <div class="food-log-info">
                    <h4>${log.dish_name || t('profile.diary.mealDefault')}</h4>
                    <p>${time} • ${t('common.bju').replace('{{p}}', log.protein).replace('{{f}}', log.fat).replace('{{c}}', log.carbs)}</p>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="food-log-kcal">${log.calories} ${t('common.kcal')}</div>
                    <button class="delete-log-btn" data-id="${log.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
            diaryList.appendChild(item);
        });

        kcalTotalEl.textContent = totalKcal;
        const progress = Math.min((totalKcal / state.calorieGoal) * 100, 100);
        progressBar.style.width = `${progress}%`;
    }

    // Delete Log Event Delegation
    const diaryListEl = document.getElementById('diary-list');
    if (diaryListEl) {
        diaryListEl.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-log-btn');
            if (deleteBtn) {
                const logId = deleteBtn.dataset.id;
                deleteFoodLog(logId);
            }
        });
    }

    async function deleteFoodLog(logId) {
        debugLog(`deleteFoodLog: id=${logId}`);
        if (!confirm(t('profile.diary.deleteConfirm'))) return;

        // Snapshot for rollback
        const previousData = loadCache('food', state.currentDate) || [];
        debugLog(`deleteFoodLog: previousData.length=${previousData.length}`);

        // 1. Optimistic UI Update
        const newData = previousData.filter(item => item.id != logId);

        saveCache('food', state.currentDate, newData);
        renderDiaryItems(newData);
        debugLog('deleteFoodLog: optimistic UI done');

        // 2. Background Sync with timeout & retry
        if (state.user && supabase) {
            debugLog(`deleteFoodLog: syncing to supabase...`);
            try {
                // Request count to verify actual deletion (10s timeout, 2 retries)
                const { error, count } = await fetchWithTimeout(
                    () => supabase.from('food_logs').delete({ count: 'exact' }).eq('id', logId),
                    10000, 2
                );

                debugLog(`deleteFoodLog: response count=${count}, error=${error?.message || 'none'}`, error ? 'error' : 'success');

                if (error) {
                    throw error;
                }

                if (count === 0) {
                    throw new Error("Сервер не подтвердил удаление (возможно, нет прав).");
                }

                debugLog('deleteFoodLog: success', 'success');
                if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

            } catch (e) {
                debugLog(`deleteFoodLog: FAILED - ${e.message}`, 'error');
                console.error("Delete failed:", e);
                alert(t('profile.diary.deleteError').replace('{{error}}', e.message || t('common.error')));

                // Rollback UI
                saveCache('food', state.currentDate, previousData);
                renderDiaryItems(previousData);
            }
        } else {
            debugLog('deleteFoodLog: no user or supabase', 'warn');
        }
    }

    function updateActiveTab(tabId) {
        const matchingTab = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (matchingTab) {
            tabItems.forEach(item => {
                item.classList.toggle('active', item.dataset.tab === tabId);
            });
            state.activeTab = tabId;
        }
    }

    // NAVIGATION LISTENERS
    tabItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabId = this.dataset.tab;
            showScreen(tabId);
        });
    });

    navCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const target = this.dataset.screen;
            showScreen(target);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('main', true);
        });
    });

    // Custom Back for Recipe Detail
    const closeRecipeBtn = document.getElementById('close-recipe-detail');
    if (closeRecipeBtn) {
        closeRecipeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('recipes', true);
        });
    }

    // ===== USER AUTH & SYNC =====
    async function initUser() {
        const userData = tg.initDataUnsafe?.user;
        const userNameEl = document.getElementById('user-name');
        const userStatusEl = document.getElementById('user-status');
        const subInfoEl = document.getElementById('subscription-info');
        const userPhotoEl = document.getElementById('user-photo');

        if (userData) {
            // 1. FAST RENDER from LocalStorage (Cache)
            const cachedUser = localStorage.getItem(`hbf_user_${userData.id}`);
            if (cachedUser) {
                const user = JSON.parse(cachedUser);
                applyUserState(user);
                console.log("Loaded from cache");
            }

            // UI Basic Setup
            if (userNameEl) userNameEl.textContent = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
            if (userStatusEl) userStatusEl.textContent = t('profile.userStatus');
            
            // Set User Photo
            if (userPhotoEl) {
                if (userData.photo_url) {
                    userPhotoEl.innerHTML = `<img src="${userData.photo_url}" alt="${userData.first_name}" class="profile-photo" style="margin-bottom: 0;">`;
                    userPhotoEl.className = ''; 
                    userPhotoEl.style.background = 'none';
                    userPhotoEl.style.boxShadow = 'none';
                    userPhotoEl.style.border = 'none';
                } else {
                    userPhotoEl.className = 'profile-photo-placeholder';
                    userPhotoEl.innerHTML = '<i class="fa-solid fa-user"></i>';
                    userPhotoEl.style = ''; 
                }
            }
            
            // 2. NETWORK REQUEST (Sync)
            if (supabase) {
                try {
                    const { data: user, error } = await supabase
                        .from('users')
                        .upsert({ 
                            telegram_id: userData.id, 
                            first_name: userData.first_name,
                            username: userData.username
                        }, { onConflict: 'telegram_id' })
                        .select()
                        .single();

                    if (user) {
                        // Save to cache for next time
                        localStorage.setItem(`hbf_user_${userData.id}`, JSON.stringify(user));
                        applyUserState(user);
                    }
                } catch (e) {
                    console.error("Supabase sync error:", e);
                }
            }
        } else {
            // Guest Mode
            if (userNameEl) userNameEl.textContent = t('profile.guest');
            if (userStatusEl) userStatusEl.textContent = t('profile.guestStatus');
            if (subInfoEl) subInfoEl.textContent = t('profile.loginHint');
            
            if (userPhotoEl) {
                userPhotoEl.className = 'profile-photo-placeholder';
                userPhotoEl.innerHTML = '<i class="fa-solid fa-user"></i>';
            }
            
            const localFavs = localStorage.getItem('hbf_favorites');
            if (localFavs) state.favorites = JSON.parse(localFavs);
            renderRecipes();
            renderProfileFavorites();
            renderWaterTracker();
            renderBodyStats();
        }
    }

    function applyUserState(user) {
        state.user = user;
        state.isPremium = user.is_premium;
        state.calorieGoal = user.calorie_goal || 2000;
        state.waterGoal = user.water_goal || 2000;
        state.weightStart = user.weight_start || 0;
        state.weightGoal = user.weight_goal || 0;

        // Apply language with proper priority:
        // 1. Supabase user.language (highest priority - user's explicit choice)
        // 2. localStorage (already applied in initWithCache)
        // 3. Telegram language_code (fallback for new users)
        if (typeof I18n !== 'undefined') {
            if (user.language) {
                // Priority 1: Supabase has user's language preference
                I18n.applyFromUser(user);
            } else if (!localStorage.getItem('hbf_language')) {
                // Priority 3: No Supabase, no localStorage - use Telegram as fallback
                I18n.initFromTelegram();
            }
            // else: Priority 2: localStorage already applied in initWithCache()
            state.language = I18n.currentLang;
        }

        renderUserStatus();
        loadFavorites();

        // PREFETCH: Always load profile data to warm up the cache
        // regardless of which tab we are on.
        loadProfileData();

        // Initialize Realtime subscriptions for instant updates
        RealtimeManager.init();

        // Initialize Lifecycle management for background/foreground handling
        LifecycleManager.init();

        // Preload analytics cache in background (after 3s delay to not block UI)
        setTimeout(() => preloadAnalyticsCache(), 3000);
    }

    // ===== BODY PROGRESS LOGIC =====
    async function renderBodyStats() {
        const weightEl = document.getElementById('weight-current');
        if (!weightEl) return;

        // 1. Try Cache First
        const cachedWeight = loadCache('weight', state.currentDate);
        if (cachedWeight) {
            state.weightCurrent = cachedWeight;
            updateWeightUI();
        }

        // Fetch latest weight up to end of selected day
        if (state.user && supabase) {
             try {
                const { end } = getDateBoundaries(state.currentDate);
                
                const { data, error } = await supabase
                    .from('weight_logs')
                    .select('weight_kg')
                    .eq('user_id', state.user.telegram_id)
                    .lte('created_at', end) // Get latest weight relative to that date
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (data && data.length > 0) {
                    state.weightCurrent = data[0].weight_kg;
                    saveCache('weight', state.currentDate, state.weightCurrent);
                    updateWeightUI();
                } else {
                    // Fallback to start if no logs
                    // state.weightCurrent = state.weightStart || 0;
                    // updateWeightUI();
                }
            } catch (e) {
                console.error("Weight load error:", e);
            }
        }
        
        // Ensure UI is drawn at least once if no cache and waiting for network
        updateWeightUI();
    }

    function updateWeightUI() {
        const weightEl = document.getElementById('weight-current');
        const diffEl = document.getElementById('weight-diff');
        const progressBar = document.getElementById('weight-progress-bar');
        
        const displayWeight = state.weightCurrent > 0 ? state.weightCurrent : (state.weightStart > 0 ? state.weightStart : '--');
        weightEl.textContent = displayWeight;
        
        if (state.weightGoal > 0) {
            diffEl.textContent = t('profile.weight.goalLabel').replace('{{value}}', state.weightGoal);
            const currentVal = (displayWeight === '--') ? 0 : parseFloat(displayWeight);

            if (state.weightStart > 0 && currentVal > 0) {
                const totalDiff = Math.abs(state.weightStart - state.weightGoal);
                let progress = 0;
                if (totalDiff > 0) {
                    if (state.weightStart > state.weightGoal) {
                        progress = ((state.weightStart - currentVal) / totalDiff) * 100;
                    } else {
                        progress = ((currentVal - state.weightStart) / totalDiff) * 100;
                    }
                } else {
                    progress = 100;
                }
                progress = Math.max(0, Math.min(100, progress));
                progressBar.style.width = `${progress}%`;
            } else {
                progressBar.style.width = '0%';
            }
        } else {
            diffEl.textContent = t('profile.weight.noGoal');
            progressBar.style.width = '0%';
        }
    }

    const btnLogWeight = document.getElementById('btn-log-weight');
    if (btnLogWeight) {
        btnLogWeight.addEventListener('click', async () => {
            const current = state.weightCurrent || state.weightStart || 65.0;
            // Simple prompt for MVP
            const input = prompt(t('profile.weight.prompt'), current);
            
            if (input) {
                const newWeight = parseFloat(input.replace(',', '.'));
                if (!isNaN(newWeight) && newWeight > 20 && newWeight < 300) {
                    // 1. OPTIMISTIC UPDATE (Instant)
                    state.weightCurrent = newWeight;
                    saveCache('weight', state.currentDate, newWeight); // Save to cache immediately
                    updateWeightUI(); 
                    
                    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

                    // 2. BACKGROUND SYNC (Fire and forget)
                    if (state.user && supabase) {
                        // Create log date (selected date + current time)
                        const logDate = new Date(state.currentDate);
                        const now = new Date();
                        logDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                        supabase.from('weight_logs').insert({
                            user_id: state.user.telegram_id,
                            weight_kg: newWeight,
                            created_at: logDate.toISOString()
                        }).then(({ error }) => {
                             if (error) console.error("Weight bg sync error:", error);
                        });
                    }
                } else {
                    alert(t('profile.weight.invalidNumber'));
                }
            }
        });
    }

    // ===== WATER TRACKER LOGIC =====
    let waterOperationId = 0; // Token to prevent race conditions

    async function renderWaterTracker(shouldFetch = true) {
        const statsEl = document.getElementById('water-stats');
        const progressBar = document.getElementById('water-progress-bar');
        if (!statsEl || !progressBar) return;

        // 1. Load from Cache if state is zero (fresh load) and we are allowed to fetch
        // Or simply always verify cache first? 
        // Better: If we haven't loaded yet, try cache.
        if (shouldFetch) {
            const cachedWater = loadCache('water', state.currentDate);
            if (cachedWater !== null) {
                state.waterToday = cachedWater;
                updateWaterUI();
            }
        }

        updateWaterUI(); // Render immediately (optimistic or cached)

        // Fetch selected date's water
        if (shouldFetch && state.user && supabase) {
            try {
                const currentOpId = ++waterOperationId; // Start new operation
                const { start, end } = getDateBoundaries(state.currentDate);

                const { data, error } = await supabase
                    .from('water_logs')
                    .select('amount_ml')
                    .eq('user_id', state.user.telegram_id)
                    .gte('created_at', start)
                    .lte('created_at', end);

                // If another operation started, discard this result
                if (currentOpId !== waterOperationId) return;

                if (data) {
                    const total = data.reduce((sum, log) => sum + log.amount_ml, 0);
                    state.waterToday = total;
                    saveCache('water', state.currentDate, total);
                    updateWaterUI();
                } 
            } catch (e) {
                console.error("Water load error:", e);
            }
        }
    }

    function updateWaterUI() {
        const statsEl = document.getElementById('water-stats');
        const progressBar = document.getElementById('water-progress-bar');
        if (statsEl && progressBar) {
            statsEl.textContent = `${state.waterToday} / ${state.waterGoal} мл`;
            const progress = Math.min((state.waterToday / state.waterGoal) * 100, 100);
            progressBar.style.width = `${progress}%`;
        }
    }

    async function addWater(amount) {
        // Block updates for future dates? No, because we already block nav.
        
        const now = new Date();
        const isToday = state.currentDate.toDateString() === now.toDateString();
        
        // Optimistic update
        waterOperationId++; // Invalidate any pending fetches
        state.waterToday = Math.max(0, state.waterToday + amount);
        renderWaterTracker(false); // Do not re-fetch, trust the state

        if (tg.HapticFeedback) {
            if (amount > 0) tg.HapticFeedback.impactOccurred('medium');
            else tg.HapticFeedback.impactOccurred('light');
        }

        // Sync with Supabase
        if (state.user && supabase) {
            try {
                if (amount > 0) {
                    // Create date for the log based on currently selected day + current time
                    // Or just use the selected date at noon?
                    // Better: Use selected date + current HH:MM to keep order
                    const logDate = new Date(state.currentDate);
                    const currentTime = new Date();
                    logDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());

                    await supabase.from('water_logs').insert({
                        user_id: state.user.telegram_id,
                        amount_ml: amount,
                        created_at: logDate.toISOString()
                    });
                } else {
                    // Remove latest log for THAT day
                    const { start, end } = getDateBoundaries(state.currentDate);

                    const { data } = await supabase
                        .from('water_logs')
                        .select('id')
                        .eq('user_id', state.user.telegram_id)
                        .gte('created_at', start)
                        .lte('created_at', end)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (data && data.length > 0) {
                        await supabase.from('water_logs').delete().eq('id', data[0].id);
                    }
                }
            } catch (e) {
                console.error("Water sync error:", e);
            }
        }
    }

    // Event Listeners for Water Buttons
    document.querySelectorAll('.water-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            addWater(amount);
        });
    });

    function renderUserStatus() {
        const subInfoEl = document.getElementById('subscription-info');
        const subscribeActions = document.getElementById('subscribe-actions');
        if (!subInfoEl) return;

        if (state.isPremium) {
            subInfoEl.innerHTML = '<span style="color: var(--sage-green-dark)">У вас активна PRO подписка! ✨</span>';
            if(subscribeActions) subscribeActions.style.display = 'none';
        } else {
            subInfoEl.textContent = 'У вас базовый уровень доступа.';
            if(subscribeActions) subscribeActions.style.display = 'block';
        }
    }

    async function loadFavorites() {
        if (!state.user || !supabase) return;
        const { data, error } = await supabase.from('favorites').select('recipe_id').eq('user_id', state.user.telegram_id);
        if (data) {
            state.favorites = data.map(f => f.recipe_id);
            renderRecipes(); 
            renderProfileFavorites();
        }
    }

    // ===== RECIPES DATA & LOGIC =====
    const recipesDB = {
        1: {
            title: "Овсяноблин с авокадо и лососем",
            category: "breakfast",
            type: "fish",
            kcal: 350,
            time: 15,
            bju: "18/20/25",
            image: "Recipes/images/recipe_1.jpg",
            ingredients: ["Яйцо куриное - 2 шт", "Овсяные хлопья - 3 ст.л.", "Лосось - 30 г", "Авокадо - 1/2 шт"],
            steps: [
                "В глубокой миске смешайте 2 яйца и 3 ст.л. овсяных хлопьев. Добавьте щепотку соли.",
                "Дайте смеси постоять 5 минут, чтобы хлопья немного набухли.",
                "Вылейте массу на разогретую антипригарную сковороду. Распределите ровным слоем.",
                "Жарьте на среднем огне под крышкой 3-4 минуты до золотистого цвета, затем переверните.",
                "На одну половину готового блина выложите слайсы лосося и авокадо. Сложите пополам."
            ]
        },
        2: {
            title: "Боул с киноа и креветками",
            category: "lunch",
            type: "fish",
            kcal: 450,
            time: 25,
            bju: "25/12/45",
            image: "Recipes/images/recipe_2.jpg",
            ingredients: ["Киноа - 60 г", "Креветки - 100 г", "Огурец - 1 шт", "Авокадо - 1/2 шт"],
            steps: [
                "Киноа тщательно промойте. Залейте водой (1:2) и варите на медленном огне 15 минут до готовности.",
                "Креветки очистите и обжарьте на капле оливкового масла с чесноком по 2 минуты с каждой стороны.",
                "Огурец нарежьте кубиками, авокадо — тонкими дольками.",
                "Выложите в глубокую миску готовую киноа, а сверху распределите овощи и креветки секторами.",
                "Сбрызните лимонным соком и посыпьте кунжутом перед подачей."
            ]
        },
        3: {
            title: "Куриные маффины с брокколи",
            category: "dinner",
            type: "poultry",
            kcal: 220,
            time: 40,
            bju: "28/10/5",
            image: "Recipes/images/recipe_3.jpg",
            ingredients: ["Филе куриное - 300 г", "Брокколи - 150 г", "Яйцо - 2 шт", "Сыр - 30 г"],
            steps: [
                "Куриное филе мелко нарежьте ножом или измельчите в блендере.",
                "Брокколи разберите на мелкие соцветия и обдайте кипятком.",
                "Смешайте в миске курицу, брокколи, яйца и тертый сыр. Добавьте соль и специи по вкусу.",
                "Распределите массу по формочкам для маффинов (лучше использовать силиконовые).",
                "Запекайте в духовке при 180°C около 25-30 минут до румяной корочки."
            ]
        },
        4: {
            title: "Чиа-пудинг на кокосовом молоке",
            category: "dessert",
            type: "vegetarian",
            kcal: 180,
            time: 5,
            bju: "6/15/18",
            image: "Recipes/images/recipe_4.jpg",
            ingredients: ["Семена чиа - 3 ст.л.", "Кокосовое молоко - 150 мл", "Манго - 50 г"],
            steps: [
                "В стеклянную банку всыпьте семена чиа и залейте кокосовым молоком.",
                "Тщательно перемешайте вилкой, чтобы не было комочков, и оставьте на 10 минут.",
                "Перемешайте еще раз и уберите в холодильник минимум на 3-4 часа (идеально — на ночь).",
                "Манго измельчите в пюре или нарежьте мелкими кубиками.",
                "Выложите фруктовый слой поверх застывшего пудинга перед подачей."
            ]
        },
        5: {
            title: "Зеленые вафли из гречки",
            category: "breakfast",
            type: "vegetarian",
            kcal: 280,
            time: 20,
            bju: "8/5/50",
            image: "Recipes/images/recipe_5.jpg",
            ingredients: ["Зеленая гречка (замоченная) - 100 г", "Шпинат - 30 г", "Вода - 50 мл", "Специи - по вкусу"],
            steps: [
                "Замоченную на ночь зеленую гречку тщательно промойте от слизи.",
                "Смешайте в блендере гречку, шпинат, воду и щепотку соли до однородного теста.",
                "Разогрейте вафельницу и слегка смажьте панели маслом.",
                "Выпекайте вафли 5-7 минут до хрустящей корочки.",
                "Подавайте с авокадо или слабосоленой рыбой."
            ]
        },
        6: {
            title: "Котлеты из индейки с кабачком",
            category: "lunch",
            type: "poultry",
            kcal: 180,
            time: 35,
            bju: "20/8/5",
            image: "Recipes/images/recipe_6.jpg",
            ingredients: ["Фарш индейки - 300 г", "Кабачок - 150 г", "Лук - 1/2 шт", "Зелень - пучок"],
            steps: [
                "Кабачок натрите на мелкой терке и хорошо отожмите лишнюю жидкость.",
                "Смешайте фарш, отжатый кабачок, мелко нарезанный лук и зелень.",
                "Сформируйте небольшие котлеты влажными руками.",
                "Выложите на противень, застеленный пергаментом.",
                "Запекайте при 180°C около 25-30 минут."
            ]
        },
        7: {
            title: "Треска с овощами в фольге",
            category: "dinner",
            type: "fish",
            kcal: 140,
            time: 25,
            bju: "22/3/5",
            image: "Recipes/images/recipe_7.jpg",
            ingredients: ["Филе трески - 200 г", "Перец болгарский - 1/2 шт", "Томаты черри - 5 шт", "Лимон - 2 дольки"],
            steps: [
                "На лист фольги выложите нарезанный полосками перец и половинки черри.",
                "Сверху положите филе трески, посолите и поперчите.",
                "Добавьте дольки лимона и плотно заверните фольгу конвертом.",
                "Запекайте в духовке 20 минут при 190°C.",
                "При подаче посыпьте свежей зеленью."
            ]
        },
        8: {
            title: "Печеное яблоко с орехами",
            category: "dessert",
            type: "vegetarian",
            kcal: 160,
            time: 20,
            bju: "1/8/22",
            image: "Recipes/images/recipe_8.jpg",
            ingredients: ["Яблоко зеленое - 1 шт", "Грецкие орехи - 15 г", "Корица - щепотка", "Мед - 1 ч.л."],
            steps: [
                "У яблока аккуратно удалите сердцевину, не прорезая дно.",
                "Орехи порубите ножом и смешайте с корицей.",
                "Наполните яблоко ореховой смесью.",
                "Запекайте в микроволновке (5 мин) или духовке (20 мин при 180°C).",
                "Полейте медом перед подачей."
            ]
        },
        9: {
            title: "Скрэмбл со шпинатом и фетой",
            category: "breakfast",
            type: "vegetarian",
            kcal: 260,
            time: 10,
            bju: "18/18/3",
            image: "Recipes/images/recipe_9.jpg",
            ingredients: ["Яйцо - 2 шт", "Шпинат свежий - 50 г", "Сыр фета - 30 г", "Масло гхи - 5 г"],
            steps: [
                "На сковороде растопите масло и припустите шпинат 1-2 минуты.",
                "Влейте яйца, сразу начиная перемешивать их лопаткой для получения хлопьев.",
                "Когда яйца почти схватились, добавьте раскрошенную фету.",
                "Готовьте еще 30 секунд и снимите с огня (яйца должны остаться нежными).",
                "Подавайте на тосте или с овощами."
            ]
        },
        10: {
            title: "Чечевичный крем-суп",
            category: "lunch",
            type: "vegetarian",
            kcal: 210,
            time: 30,
            bju: "12/4/32",
            image: "Recipes/images/recipe_10.jpg",
            ingredients: ["Чечевица красная - 70 г", "Морковь - 1 шт", "Лук - 1/2 шт", "Кокосовое молоко - 30 мл"],
            steps: [
                "В кастрюле обжарьте нарезанные лук и морковь до мягкости.",
                "Добавьте промытую чечевицу и залейте водой (300 мл). Варите 15-20 минут.",
                "Когда чечевица разварится, слейте лишнюю воду (если есть) и пробейте блендером.",
                "Влейте кокосовое молоко, прогрейте еще минуту.",
                "Подавайте с тыквенными семечками."
            ]
        },
        11: {
            title: "Бефстроганов лайт",
            category: "dinner",
            type: "meat",
            kcal: 290,
            time: 40,
            bju: "30/15/8",
            image: "Recipes/images/recipe_11.jpg",
            ingredients: ["Говядина постная - 150 г", "Шампиньоны - 100 г", "Йогурт греческий - 2 ст.л.", "Горчица - 1/2 ч.л."],
            steps: [
                "Говядину нарежьте тонкими полосками поперек волокон.",
                "Быстро обжарьте мясо на сильном огне до корочки (3-4 мин), уберите со сковороды.",
                "В той же сковороде потушите нарезанные грибы до испарения влаги.",
                "Верните мясо, убавьте огонь. Добавьте йогурт, смешанный с горчицей.",
                "Томите под крышкой 5-10 минут, не давая кипеть."
            ]
        },
        12: {
            title: "Raw-трюфели",
            category: "dessert",
            type: "vegetarian",
            kcal: 90,
            time: 15,
            bju: "2/4/12",
            image: "Recipes/images/recipe_12.jpg",
            ingredients: ["Финики - 50 г", "Какао-порошок - 2 ст.л.", "Миндаль - 20 г", "Цедра апельсина - щепотка"],
            steps: [
                "Финики замочите в кипятке на 10 минут, удалите косточки.",
                "В блендере измельчите орехи в крошку.",
                "Добавьте финики и какао (оставьте немного для обсыпки), пробейте до липкой массы.",
                "Вмешайте цедру. Влажными руками скатайте шарики.",
                "Обваляйте в какао и охладите в холодильнике."
            ]
        },
        13: {
            title: "Салат с тунцом и яйцом",
            category: "lunch",
            type: "fish",
            kcal: 240,
            time: 10,
            bju: "25/12/5",
            image: "Recipes/images/recipe_13.jpg",
            ingredients: ["Тунец в с/с - 1 банка", "Яйцо вареное - 1 шт", "Огурец - 1 шт", "Листья салата - пучок"],
            steps: [
                "Листья салата порвите руками и выложите в тарелку.",
                "Огурец и яйцо нарежьте кубиками.",
                "С тунца слейте жидкость и слегка разомните вилкой.",
                "Смешайте все ингредиенты.",
                "Заправьте каплей оливкового масла или лимонным соком."
            ]
        },
        14: {
            title: "Тушеная курица с травами",
            category: "dinner",
            type: "poultry",
            kcal: 200,
            time: 45,
            bju: "26/9/3",
            image: "Recipes/images/recipe_14.jpg",
            ingredients: ["Куриные бедра (без кожи) - 2 шт", "Лук порей - 50 г", "Морковь - 1 шт", "Прованские травы - 1 ч.л."],
            steps: [
                "Курицу натрите солью и травами.",
                "В глубокой сковороде спассеруйте нарезанный лук и кружочки моркови.",
                "Выложите курицу к овощам, добавьте немного воды (50 мл).",
                "Накройте крышкой и тушите на медленном огне 35-40 минут.",
                "Мясо должно легко отходить от кости."
            ]
        },
        15: {
            title: "Ленивая овсянка в банке",
            category: "breakfast",
            type: "vegetarian",
            kcal: 250,
            time: 5,
            bju: "10/6/40",
            image: "Recipes/images/recipe_15.jpg",
            ingredients: ["Овсяные хлопья (долгого варки) - 4 ст.л.", "Йогурт или вода - 150 мл", "Ягоды или яблоко - 50 г"],
            steps: [
                "В обычную стеклянную банку или контейнер всыпьте овсянку.",
                "Залейте йогуртом, молоком или водой. Перемешайте.",
                "Добавьте нарезанные фрукты или замороженные ягоды.",
                "Закройте крышкой и уберите в холодильник на ночь.",
                "Утром завтрак готов — его удобно брать с собой."
            ]
        },
        16: {
            title: "Салат с нутом и овощами",
            category: "lunch",
            type: "vegetarian",
            kcal: 220,
            time: 10,
            bju: "9/8/28",
            image: "Recipes/images/recipe_16.jpg",
            ingredients: ["Нут консервированный - 100 г", "Огурец - 1 шт", "Помидор - 1 шт", "Оливковое масло - 1 ч.л."],
            steps: [
                "Слейте жидкость с консервированного нута и промойте его.",
                "Нарежьте огурец и помидор крупными кубиками.",
                "Смешайте в миске нут и овощи.",
                "Посолите, добавьте специи (хорошо идет паприка или кумин).",
                "Заправьте маслом и перемешайте."
            ]
        },
        17: {
            title: "Куриная грудка в паприке",
            category: "dinner",
            type: "poultry",
            kcal: 190,
            time: 30,
            bju: "30/7/2",
            image: "Recipes/images/recipe_17.jpg",
            ingredients: ["Куриное филе - 200 г", "Паприка копченая - 1 ч.л.", "Чеснок сушеный - 1/2 ч.л.", "Соль - щепотка"],
            steps: [
                "Куриное филе промойте и обсушите бумажным полотенцем.",
                "Сделайте на филе несколько неглубоких надрезов.",
                "Натрите мясо смесью соли, паприки и чеснока.",
                "Заверните каждое филе в пергамент для выпечки (как конфету).",
                "Жарьте на сухой сковороде по 10-12 минут с каждой стороны."
            ]
        },
        18: {
            title: "Овощной омлет",
            category: "dinner",
            type: "vegetarian",
            kcal: 210,
            time: 10,
            bju: "14/15/5",
            image: "Recipes/images/recipe_18.jpg",
            ingredients: ["Яйцо - 2 шт", "Смесь замороженных овощей - 100 г", "Молоко или вода - 2 ст.л."],
            steps: [
                "Выложите замороженные овощи на сковороду, добавьте каплю воды и потушите 3-4 минуты до мягкости.",
                "В миске взболтайте яйца с молоком и солью.",
                "Залейте овощи яичной смесью.",
                "Накройте крышкой и готовьте на медленном огне 5-6 минут.",
                "Подавайте с цельнозерновым хлебом."
            ]
        },
        19: {
            title: "Банановое мороженое",
            category: "dessert",
            type: "vegetarian",
            kcal: 110,
            time: 5,
            bju: "1/0/25",
            image: "Recipes/images/recipe_19.jpg",
            ingredients: ["Банан (очень спелый) - 1 шт", "Корица - по желанию"],
            steps: [
                "Банан очистите, нарежьте кружочками и заморозьте (минимум 2 часа).",
                "Положите замороженные кусочки в блендер.",
                "Взбейте на высокой скорости до состояния мягкого крема.",
                "Если блендер не справляется, добавьте 1 ст.л. воды или растительного молока.",
                "Подавайте немедленно, пока не растаяло."
            ]
        },
        20: {
            title: "Творожный паштет",
            category: "lunch",
            type: "vegetarian",
            kcal: 140,
            time: 5,
            bju: "18/5/4",
            image: "Recipes/images/recipe_20.jpg",
            ingredients: ["Творог 5% - 150 г", "Зелень (укроп, петрушка) - пучок", "Сметана 10% - 1 ст.л."],
            steps: [
                "Зелень очень мелко порубите ножом.",
                "В миске соедините творог, зелень и сметану.",
                "Разотрите вилкой до более-менее однородной массы (или пробейте блендером для гладкости).",
                "Посолите по вкусу, можно добавить капельку чеснока.",
                "Намазывайте на хлебцы или используйте как дип для моркови."
            ]
        },
        21: {
            title: "Птитим с домашним песто",
            category: "lunch",
            type: "vegetarian",
            kcal: 420,
            time: 15,
            bju: "12/18/55",
            image: "Recipes/images/recipe_21.jpg",
            ingredients: ["Паста птитим - 80 г", "Базилик свежий - пучок", "Кедровые орехи - 15 г", "Пармезан - 20 г", "Оливковое масло - 2 ст.л.", "Чеснок - 1 зубчик"],
            steps: [
                "Отварите птитим в подсоленной воде согласно инструкции (обычно 10-12 минут) до состояния al dente.",
                "Для песто: в блендере соедините листья базилика, кедровые орехи, тертый пармезан, чеснок и оливковое масло. Пробейте до состояния густого соуса.",
                "С готового птитима слейте воду, сохранив 1-2 столовые ложки отвара.",
                "Смешайте пасту с соусом песто, добавив немного отвара для более кремовой консистенции.",
                "При подаче посыпьте кедровыми орешками и свежим базиликом."
            ]
        }
    };

    function renderRecipes() {
        const container = document.querySelector('.recipes-grid');
        if (!container) return;

        // Localized type names
        const typeNames = {
            meat: t('recipes.types.meat'),
            poultry: t('recipes.types.poultry'),
            fish: t('recipes.types.fish'),
            vegetarian: t('recipes.types.vegetarian')
        };

        container.innerHTML = '';

        Object.keys(recipesDB).forEach(id => {
            const r = recipesDB[id];

            // Get localized recipe data (title, ingredients, steps)
            const localized = typeof I18n !== 'undefined' ? I18n.getRecipe(id) : null;
            const recipeTitle = localized?.title || r.title;

            // Filters Logic
            if (state.filters.onlyFavorites && !state.favorites.includes(id)) return;
            if (state.filters.category !== 'all' && r.category !== state.filters.category) return;
            if (state.filters.type !== 'all' && r.type !== state.filters.type) return;

            if (state.filters.time !== 'all') {
                if (state.filters.time === 'short' && r.time > 20) return;
                if (state.filters.time === 'medium' && (r.time <= 20 || r.time > 40)) return;
                if (state.filters.time === 'long' && r.time <= 40) return;
            }

            if (state.filters.kcal !== 'all') {
                if (state.filters.kcal === 'light' && r.kcal >= 250) return;
                if (state.filters.kcal === 'medium' && (r.kcal < 250 || r.kcal > 400)) return;
                if (state.filters.kcal === 'heavy' && r.kcal <= 400) return;
            }

            const isFav = state.favorites.includes(id);
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <div class="recipe-img-placeholder">
                    <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${id}">
                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                    <img src="${r.image}" alt="${recipeTitle}">
                </div>
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipeTitle}</h3>
                    <div class="recipe-badges">
                        <span class="badge badge-time"><i class="fa-regular fa-clock"></i> ${r.time} ${t('common.min')}</span>
                        <span class="badge badge-kcal"><i class="fa-solid fa-fire"></i> ${r.kcal}</span>
                        <span class="badge badge-type">${typeNames[r.type] || r.type}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.favorite-btn')) {
                   // Handled by btn
                } else {
                    openRecipeDetail(id);
                }
            });
            
            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                     e.stopPropagation();
                     toggleFavorite(id);
                });
            }

            container.appendChild(card);
        });
    }

    function renderProfileFavorites() {
        const container = document.getElementById('profile-favorites-container');
        const emptyMsg = document.getElementById('profile-favorites-empty');
        
        if (!container || !emptyMsg) return;

        if (state.favorites.length === 0) {
            container.style.display = 'none';
            emptyMsg.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyMsg.style.display = 'none';
        container.innerHTML = '';

        state.favorites.forEach(id => {
            const r = recipesDB[id];
            if (!r) return;

            // Get localized recipe title
            const localized = typeof I18n !== 'undefined' ? I18n.getRecipe(id) : null;
            const recipeTitle = localized?.title || r.title;

            const card = document.createElement('div');
            card.className = 'recipe-card';
            // Compact style for profile
            card.style.marginBottom = '0';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.padding = '10px';
            card.style.gap = '15px';

            card.innerHTML = `
                <img src="${r.image}" alt="${recipeTitle}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 16px;">${recipeTitle}</h4>
                    <span style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-fire"></i> ${r.kcal} ${t('common.kcal')}</span>
                </div>
                <button class="favorite-btn active" data-id="${id}" style="position: static; background: none; box-shadow: none; color: var(--peach-dark);">
                    <i class="fa-solid fa-heart"></i>
                </button>
            `;

            // Click on card opens detail
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.favorite-btn')) {
                    openRecipeDetail(id);
                }
            });

            // Click on heart removes from favorites
            const favBtn = card.querySelector('.favorite-btn');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(id);
            });

            container.appendChild(card);
        });
    }

    async function toggleFavorite(id) {
        const index = state.favorites.indexOf(id);
        const isAdding = index === -1;
        
        if (isAdding) {
            state.favorites.push(id);
        } else {
            state.favorites.splice(index, 1);
        }
        
        renderRecipes(); 
        renderProfileFavorites(); // Sync Profile UI
        if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();

        if (state.user && supabase) {
            try {
                if (isAdding) {
                    await supabase.from('favorites').insert({ user_id: state.user.telegram_id, recipe_id: id });
                } else {
                    await supabase.from('favorites').delete().eq('user_id', state.user.telegram_id).eq('recipe_id', id);
                }
            } catch (e) {
                console.error("Fav sync error", e);
            }
        } else {
            localStorage.setItem('hbf_favorites', JSON.stringify(state.favorites));
        }
    }

    function openRecipeDetail(id) {
        const data = recipesDB[id];
        if (!data) return;

        // Get localized recipe data
        const localized = typeof I18n !== 'undefined' ? I18n.getRecipe(id) : null;
        const recipeTitle = localized?.title || data.title;
        const recipeIngredients = localized?.ingredients || data.ingredients;
        const recipeSteps = localized?.steps || data.steps;

        // Localized category names
        const categoryNames = {
            breakfast: t('recipes.categories.breakfast'),
            lunch: t('recipes.categories.lunch'),
            dinner: t('recipes.categories.dinner'),
            dessert: t('recipes.categories.dessert')
        };

        document.getElementById('detail-title').textContent = recipeTitle;
        document.getElementById('detail-category').textContent = categoryNames[data.category] || data.category;
        document.getElementById('detail-kcal').textContent = data.kcal + ' ' + t('common.kcal');
        document.getElementById('detail-time').textContent = data.time + ' ' + t('common.min');
        document.getElementById('detail-bju').textContent = data.bju;

        // Update section titles
        const ingredientsTitle = document.getElementById('detail-ingredients-title');
        if (ingredientsTitle) ingredientsTitle.innerHTML = `<i class="fa-solid fa-basket-shopping"></i> ${t('recipes.ingredients')}`;

        const stepsTitle = document.getElementById('detail-steps-title');
        if (stepsTitle) stepsTitle.innerHTML = `<i class="fa-solid fa-list-check"></i> ${t('recipes.steps')}`;

        document.getElementById('detail-ingredients').innerHTML = recipeIngredients.map(i => `<li>${i}</li>`).join('');
        document.getElementById('detail-steps').innerHTML = recipeSteps.map(s => `<li>${s}</li>`).join('');

        document.getElementById('detail-header-color').style.backgroundImage = `url('${data.image}')`;
        showScreen('recipe-detail');
    }

    // ===== FILTER LISTENERS =====
    const filterCat = document.getElementById('filter-category');
    const filterType = document.getElementById('filter-type');
    const filterTime = document.getElementById('filter-time');
    const filterKcal = document.getElementById('filter-kcal');
    const resetBtn = document.getElementById('reset-filters');
    const filterFavBtn = document.getElementById('filter-favorites-btn');

    if (filterFavBtn) {
        filterFavBtn.addEventListener('click', () => {
            state.filters.onlyFavorites = !state.filters.onlyFavorites;
            
            // Visual update
            const icon = filterFavBtn.querySelector('i');
            if (state.filters.onlyFavorites) {
                icon.classList.replace('fa-regular', 'fa-solid');
                filterFavBtn.style.background = 'var(--sage-green-light)';
                filterFavBtn.style.borderColor = 'var(--sage-green)';
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
                filterFavBtn.style.background = 'var(--card-bg)';
                filterFavBtn.style.borderColor = 'var(--sage-green-light)';
            }
            
            if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
            updateFilters(); // Reuse update logic to show/hide reset btn
        });
    }

    function updateFilters() {
        if(filterCat) state.filters.category = filterCat.value;
        if(filterType) state.filters.type = filterType.value;
        if(filterTime) state.filters.time = filterTime.value;
        if(filterKcal) state.filters.kcal = filterKcal.value;
        
        // Show/Hide Reset Button
        const isFiltered = Object.values(state.filters).some(v => v !== 'all' && v !== false);
        if(resetBtn) resetBtn.classList.toggle('visible', isFiltered);

        renderRecipes();
    }

    [filterCat, filterType, filterTime, filterKcal].forEach(el => {
        if(el) el.addEventListener('change', updateFilters);
    });

    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            state.filters = { category: 'all', type: 'all', time: 'all', kcal: 'all', onlyFavorites: false };
            
            if(filterCat) filterCat.value = 'all';
            if(filterType) filterType.value = 'all';
            if(filterTime) filterTime.value = 'all';
            if(filterKcal) filterKcal.value = 'all';
            
            // Reset Fav Button visual
            if (filterFavBtn) {
                const icon = filterFavBtn.querySelector('i');
                icon.classList.replace('fa-solid', 'fa-regular');
                filterFavBtn.style.background = 'var(--card-bg)';
                filterFavBtn.style.borderColor = 'var(--sage-green-light)';
            }

            resetBtn.classList.remove('visible');
            renderRecipes();
        });
    }

    // Init
    initUser();

    // Deep Linking Support
    const urlParams = new URLSearchParams(window.location.search);
    const screenParam = urlParams.get('screen');
    if (screenParam) {
        showScreen(screenParam);
        // Clean up URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
    }


    // ===== ANALYTICS LOGIC =====
    const openAnalyticsBtn = document.getElementById('open-analytics-btn');
    const closeAnalyticsBtn = document.getElementById('close-analytics');
    const weekBtn = document.getElementById('analytics-week-btn');
    const monthBtn = document.getElementById('analytics-month-btn');
    const prevPeriodBtn = document.getElementById('analytics-prev-period');
    const nextPeriodBtn = document.getElementById('analytics-next-period');
    const typeTabs = document.querySelectorAll('.tab-btn'); // Updated selector
    
    let mainChart = null;

    if (openAnalyticsBtn) {
        openAnalyticsBtn.addEventListener('click', () => {
            state.analyticsDate = new Date(); // Reset to today on open
            showScreen('analytics');
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
            renderAnalytics();
        });

        if (closeAnalyticsBtn) {
            closeAnalyticsBtn.addEventListener('click', () => {
                showScreen('profile', true);
            });
        }
    }

    if (weekBtn && monthBtn) {
        weekBtn.addEventListener('click', () => switchAnalyticsPeriod('week'));
        monthBtn.addEventListener('click', () => switchAnalyticsPeriod('month'));
    }

    function switchAnalyticsPeriod(period) {
        state.analyticsPeriod = period;
        // Visual Toggle
        [weekBtn, monthBtn].forEach(btn => {
            const isActive = (btn.id === `analytics-${period}-btn`);
            btn.classList.toggle('active', isActive);
            btn.style.background = isActive ? '#fff' : 'transparent';
            btn.style.color = isActive ? 'var(--text-primary)' : 'var(--sage-green-dark)';
            btn.style.boxShadow = isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none';
        });

        if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
        renderAnalytics();
    }

    // Period Navigation
    if (prevPeriodBtn && nextPeriodBtn) {
        prevPeriodBtn.addEventListener('click', () => navigatePeriod(-1));
        nextPeriodBtn.addEventListener('click', () => navigatePeriod(1));
    }

    function navigatePeriod(direction) {
        const d = new Date(state.analyticsDate);
        if (state.analyticsPeriod === 'week') {
            d.setDate(d.getDate() + (direction * 7));
        } else {
            d.setMonth(d.getMonth() + direction);
        }
        
        // Prevent going into future
        if (d > new Date() && direction > 0) return;

        state.analyticsDate = d;
        if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
        renderAnalytics();
    }

    // Data Type Switching
    typeTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            
            // Visual Reset & Set
            typeTabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.color = 'var(--sage-green-dark)';
                t.style.boxShadow = 'none';
            });
            
            // Use currentTarget to ensure we target the button, not the icon
            const currentBtn = e.currentTarget;
            currentBtn.classList.add('active');
            currentBtn.style.background = '#fff';
            currentBtn.style.color = 'var(--text-primary)';
            currentBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

            if (currentBtn.dataset.type) {
                state.analyticsType = currentBtn.dataset.type;
                
                if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
                
                // Render analytics safely
                setTimeout(() => {
                    renderAnalytics();
                }, 10);
            }
        });
    });

    function getCalendarRange(type, referenceDate) {
        const days = [];
        const labels = [];
        const baseDate = new Date(referenceDate);
        baseDate.setHours(0,0,0,0);

        const periodInfo = document.getElementById('analytics-period-info');
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const locale = I18n?.currentLang === 'en' ? 'en-US' : 'ru-RU';

        if (type === 'week') {
            const dayOfWeek = baseDate.getDay() || 7;
            const monday = new Date(baseDate);
            monday.setDate(baseDate.getDate() - dayOfWeek + 1);

            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                days.push(d);
                // "25 Mon" or "25 Пн" style
                labels.push(`${d.getDate()} ${d.toLocaleDateString(locale, { weekday: 'short' })}`);
            }
            if (periodInfo) {
                const m = days[6].toLocaleDateString(locale, { month: 'long' });
                periodInfo.textContent = `${days[0].getDate()} - ${days[6].getDate()} ${capitalize(m)}`;
            }
        } else {
            const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
            const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                days.push(new Date(d));
                labels.push(d.getDate());
            }
            if (periodInfo) {
                const m = baseDate.toLocaleDateString(locale, { month: 'long' });
                periodInfo.textContent = `${capitalize(m)} ${baseDate.getFullYear()}`;
            }
        }
        return { days, labels };
    }

    // Helper: Render chart from processed data (no fetch)
    function renderAnalyticsFromData(processedData) {
        const chartAvgEl = document.getElementById('chart-average');
        const chartTitleEl = document.getElementById('chart-title');

        if (chartTitleEl) chartTitleEl.textContent = processedData.title;
        if (chartAvgEl) chartAvgEl.textContent = processedData.avgText;

        initMainChart(processedData.labels, processedData.values, processedData.type);
    }

    // Helper: Process raw Supabase data into chart format
    function processAnalyticsData(rawData, days, labels, type) {
        const values = new Array(days.length).fill(type === 'weight' ? null : 0);

        if (rawData) {
            rawData.forEach(log => {
                const logDate = new Date(log.created_at).toDateString();
                const targetIdx = days.findIndex(d => d.toDateString() === logDate);
                if (targetIdx !== -1) {
                    if (type === 'weight') {
                        const val = parseFloat(log.weight_kg);
                        if (!isNaN(val)) values[targetIdx] = val;
                    } else if (type === 'calories') {
                        const val = parseInt(log.calories) || 0;
                        values[targetIdx] += val;
                    } else {
                        const val = parseInt(log.amount_ml) || 0;
                        values[targetIdx] += val;
                    }
                }
            });
        }

        // Calculate average/total
        let avgText = '';
        const filtered = values.filter(v => v !== null && v !== 0 && !isNaN(v));
        if (filtered.length > 0) {
            const sum = filtered.reduce((a, b) => a + b, 0);
            const avg = Math.round(sum / filtered.length);
            if (isNaN(sum) || isNaN(avg)) {
                avgText = t('analytics.noData');
            } else if (type === 'weight') {
                avgText = t('analytics.avg').replace('{{value}}', `${avg} ${t('common.kg')}`);
            } else if (type === 'calories') {
                avgText = t('analytics.avg').replace('{{value}}', `${avg} ${t('common.kcal')}`);
            } else {
                avgText = t('analytics.total').replace('{{value}}', `${sum} ${t('common.ml')}`);
            }
        } else {
            avgText = t('analytics.noData');
        }

        const title = t(`analytics.chartTitles.${type}`);

        return { labels, values, avgText, title, type };
    }

    // Main function: Cache-First Strategy
    async function renderAnalytics() {
        debugLog(`renderAnalytics: type=${state.analyticsType}, period=${state.analyticsPeriod}`);

        if (!state.user) {
            debugLog('renderAnalytics: no user', 'warn');
            return;
        }

        const type = state.analyticsType;
        const period = state.analyticsPeriod;
        const date = state.analyticsDate;

        const { days, labels } = getCalendarRange(period, date);

        // Update navigation buttons
        const todayStr = new Date().toDateString();
        const containsToday = days.some(d => d.toDateString() === todayStr);
        if(nextPeriodBtn) {
            nextPeriodBtn.disabled = containsToday;
            nextPeriodBtn.style.opacity = containsToday ? '0.3' : '1';
        }

        const chartAvgEl = document.getElementById('chart-average');
        const chartTitleEl = document.getElementById('chart-title');

        // ========== STEP 1: Show cached data INSTANTLY ==========
        const cached = AnalyticsCache.load(type, period, date);
        if (cached) {
            renderAnalyticsFromData(cached);
            // Show subtle "updating" indicator
            if (chartAvgEl && supabase) {
                chartAvgEl.textContent = cached.avgText + ' ⟳';
            }
        } else {
            // No cache - show loading
            if (chartTitleEl) chartTitleEl.textContent = t(`analytics.chartTitles.${type}`);
            if (chartAvgEl) chartAvgEl.textContent = t('common.loading');
        }

        // ========== STEP 2: Fetch fresh data in BACKGROUND ==========
        if (!supabase) {
            debugLog('renderAnalytics: no supabase, using cache only', 'warn');
            return;
        }

        // Non-blocking background fetch
        (async () => {
            try {
                const start = days[0].toISOString();
                const endDay = new Date(days[days.length - 1]);
                endDay.setHours(23, 59, 59, 999);
                const end = endDay.toISOString();
                const userId = state.user.telegram_id;

                let dataRes;
                if (type === 'weight') {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('weight_logs').select('*').eq('user_id', userId).gte('created_at', start).lte('created_at', end).order('created_at', { ascending: true }),
                        10000, 2
                    );
                } else if (type === 'calories') {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('food_logs').select('*').eq('user_id', userId).eq('status', 'confirmed').gte('created_at', start).lte('created_at', end),
                        10000, 2
                    );
                } else {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('water_logs').select('*').eq('user_id', userId).gte('created_at', start).lte('created_at', end),
                        10000, 2
                    );
                }

                debugLog(`Analytics fetch: ${dataRes.data?.length || 0} records, error: ${dataRes.error?.message || 'none'}`, dataRes.error ? 'error' : 'success');

                if (dataRes.error) throw dataRes.error;

                // Process and cache
                const processed = processAnalyticsData(dataRes.data, days, labels, type);
                AnalyticsCache.save(type, period, date, processed);

                // Update UI only if user is still viewing this type/period
                if (state.analyticsType === type && state.analyticsPeriod === period) {
                    renderAnalyticsFromData(processed);
                }

            } catch (e) {
                debugLog(`Analytics fetch failed: ${e.message}`, 'error');
                // If we had cache - user already sees data, don't show error
                // If no cache - show error
                if (!cached && chartAvgEl) {
                    chartAvgEl.textContent = t('common.error');
                }
            }
        })();
    }

    // ===== PRELOAD ANALYTICS CACHE =====
    // Preloads weight, calories, water for current week in background
    // So when user opens Analytics tab, data is already cached
    async function preloadAnalyticsCache() {
        if (!supabase || !state.user) {
            debugLog('preloadAnalyticsCache: skipped (no supabase/user)', 'warn');
            return;
        }

        debugLog('preloadAnalyticsCache: starting background preload...', 'info');
        const types = ['weight', 'calories', 'water'];
        const period = 'week';
        const date = new Date();
        const { days, labels } = getCalendarRange(period, date);

        const start = days[0].toISOString();
        const endDay = new Date(days[days.length - 1]);
        endDay.setHours(23, 59, 59, 999);
        const end = endDay.toISOString();
        const userId = state.user.telegram_id;

        for (const type of types) {
            // Skip if already cached
            if (AnalyticsCache.load(type, period, date)) {
                debugLog(`preloadAnalyticsCache: ${type} already cached`, 'info');
                continue;
            }

            try {
                let dataRes;
                if (type === 'weight') {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('weight_logs').select('*').eq('user_id', userId).gte('created_at', start).lte('created_at', end).order('created_at', { ascending: true }),
                        8000, 1
                    );
                } else if (type === 'calories') {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('food_logs').select('*').eq('user_id', userId).eq('status', 'confirmed').gte('created_at', start).lte('created_at', end),
                        8000, 1
                    );
                } else {
                    dataRes = await fetchWithTimeout(
                        () => supabase.from('water_logs').select('*').eq('user_id', userId).gte('created_at', start).lte('created_at', end),
                        8000, 1
                    );
                }

                if (!dataRes.error) {
                    const processed = processAnalyticsData(dataRes.data, days, labels, type);
                    AnalyticsCache.save(type, period, date, processed);
                    debugLog(`preloadAnalyticsCache: ${type} preloaded (${dataRes.data?.length || 0} records)`, 'success');
                }
            } catch (e) {
                debugLog(`preloadAnalyticsCache: ${type} failed - ${e.message}`, 'warn');
                // Silently fail - this is just a preload
            }
        }
        debugLog('preloadAnalyticsCache: completed', 'success');
    }

    function initMainChart(labels, values, type) {
        const ctx = document.getElementById('mainChart')?.getContext('2d');
        if (!ctx) return;

        if (mainChart) mainChart.destroy();

        const config = {
            weight: {
                type: 'line',
                color: '#FDBA74',
                bg: 'rgba(253, 186, 116, 0.1)',
                spanGaps: false
            },
            calories: {
                type: 'bar',
                color: '#7DA691',
                bg: '#7DA691',
                spanGaps: true
            },
            water: {
                type: 'bar',
                color: '#60A5FA',
                bg: '#60A5FA',
                spanGaps: true
            }
        }[type];

        mainChart = new Chart(ctx, {
            type: config.type,
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    borderColor: config.color,
                    backgroundColor: config.bg,
                    borderWidth: type === 'weight' ? 3 : 0,
                    borderRadius: 4,
                    tension: 0,
                    fill: type === 'weight',
                    pointBackgroundColor: config.color,
                    pointRadius: 4,
                    spanGaps: config.spanGaps
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: type !== 'weight', 
                        grid: { color: '#F0F0F0' } 
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // ===== LIGHTBOX (GALLERY SUPPORT) =====
    const lightbox = document.getElementById('lightbox');
    const galleryWrapper = document.getElementById('galleryWrapper');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomLevelSpan = document.getElementById('zoomLevel');
    const certificateCards = document.querySelectorAll('.certificate-card');

    let currentZoom = 1;

    certificateCards.forEach(card => {
        card.addEventListener('click', function() {
            const pages = this.dataset.pages.split(',');
            openGallery(pages);
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        });
    });

    function openGallery(images) {
        galleryWrapper.innerHTML = '';
        currentZoom = 1;
        updateZoomDisplay();
        galleryWrapper.style.transform = 'scale(1)';

        images.forEach(src => {
            const img = document.createElement('img');
            img.src = src.trim();
            img.className = 'lightbox-image';
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
            img.style.display = 'block'; 
            galleryWrapper.appendChild(img);
        });

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if(zoomIn) zoomIn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom < 3) {
            currentZoom += 0.25;
            applyZoom();
        }
    });

    if(zoomOut) zoomOut.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom > 0.5) {
            currentZoom -= 0.25;
            applyZoom();
        }
    });

    function applyZoom() {
        updateZoomDisplay();
        galleryWrapper.style.transform = `scale(${currentZoom})`;
        galleryWrapper.style.transformOrigin = 'top center';
    }

    function updateZoomDisplay() {
        if(zoomLevelSpan) zoomLevelSpan.textContent = Math.round(currentZoom * 100) + '%';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            galleryWrapper.innerHTML = ''; 
        }, 300);
    }

    if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    if(lightbox) lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.id === 'lightboxContainer') {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Initial Render (Independent of User Auth)
    // This ensures recipes are visible immediately, hearts will update later.
    renderRecipes();

    // Cleanup Realtime subscriptions on page unload
    window.addEventListener('beforeunload', () => RealtimeManager.cleanup());
    window.addEventListener('pagehide', () => RealtimeManager.cleanup());

});