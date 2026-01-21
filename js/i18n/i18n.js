/**
 * HBF I18n Manager
 * Lightweight internationalization for Telegram Web App
 * Supports: ru, en
 */

const I18n = {
    currentLang: 'ru',
    supportedLangs: ['ru', 'en'],
    translations: {},
    recipes: {},

    /**
     * Initialize i18n system (FULL - legacy method)
     * Priority: localStorage → Telegram language_code → 'ru'
     * WARNING: This writes to localStorage, which can override Supabase preference
     * Use initWithCache() instead for proper Supabase priority
     */
    init() {
        // 1. Check localStorage first (fastest)
        const cached = localStorage.getItem('hbf_language');
        if (cached && this.supportedLangs.includes(cached)) {
            this.currentLang = cached;
        } else {
            // 2. Try Telegram language_code
            const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
            if (tgLang && tgLang.startsWith('en')) {
                this.currentLang = 'en';
            } else {
                this.currentLang = 'ru'; // Default
            }
            localStorage.setItem('hbf_language', this.currentLang);
        }

        // Load translations for current language
        this.loadTranslations(this.currentLang);
        this.loadRecipes(this.currentLang);

        // Set HTML lang attribute
        document.documentElement.lang = this.currentLang;

        console.log(`[I18n] Initialized with language: ${this.currentLang}`);
        return this.currentLang;
    },

    /**
     * Initialize i18n from localStorage ONLY (no Telegram fallback)
     * This is the preferred initialization method to ensure Supabase language takes priority
     * Called early in app startup - does NOT write to localStorage
     * Supabase/Telegram fallback is handled later in applyUserState()
     */
    initWithCache() {
        const cached = localStorage.getItem('hbf_language');
        const log = window.debugLog || console.log;
        log(`i18n.initWithCache: cache='${cached}'`);
        if (cached && this.supportedLangs.includes(cached)) {
            this.currentLang = cached;
            log(`i18n: from cache → ${cached}`, 'success');
        } else {
            // No cache - stay with default 'ru'
            // Telegram fallback will be applied in applyUserState() if needed
            log(`i18n: no cache, default → ${this.currentLang}`, 'warn');
        }

        // Load translations for current language
        this.loadTranslations(this.currentLang);
        this.loadRecipes(this.currentLang);

        // Set HTML lang attribute
        document.documentElement.lang = this.currentLang;

        return this.currentLang;
    },

    /**
     * Apply Telegram language_code as fallback
     * Called ONLY when:
     * 1. No language in Supabase user profile
     * 2. No language in localStorage
     * This ensures Supabase user preference always takes priority
     */
    initFromTelegram() {
        const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
        const lang = (tgLang && tgLang.startsWith('en')) ? 'en' : 'ru';

        if (lang !== this.currentLang) {
            this.currentLang = lang;
            localStorage.setItem('hbf_language', lang);
            this.loadTranslations(lang);
            this.loadRecipes(lang);
            document.documentElement.lang = lang;

            // Trigger UI refresh
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { lang }
            }));

            console.log(`[I18n] Applied from Telegram: ${lang}`);
        }

        return lang;
    },

    /**
     * Load UI translations for specified language
     */
    loadTranslations(lang) {
        const translations = window.HBF_TRANSLATIONS?.[lang];
        if (translations) {
            this.translations = translations;
        } else {
            console.warn(`[I18n] Translations not found for '${lang}', falling back to 'ru'`);
            this.translations = window.HBF_TRANSLATIONS?.ru || {};
        }
    },

    /**
     * Load recipes for specified language
     */
    loadRecipes(lang) {
        const recipes = window.HBF_RECIPES?.[lang];
        if (recipes) {
            this.recipes = recipes;
        } else {
            console.warn(`[I18n] Recipes not found for '${lang}', falling back to 'ru'`);
            this.recipes = window.HBF_RECIPES?.ru || {};
        }
    },

    /**
     * Get translation by key (supports nested keys like 'profile.weight.title')
     * @param {string} key - Translation key
     * @param {Object} replacements - Variables to replace {{variable}}
     * @returns {string} Translated text or key if not found
     */
    t(key, replacements = {}) {
        let text = this.getNestedValue(this.translations, key);

        if (text === undefined) {
            console.warn(`[I18n] Missing translation: ${key}`);
            return key;
        }

        // Replace {{variable}} placeholders
        if (typeof text === 'string' && Object.keys(replacements).length > 0) {
            Object.keys(replacements).forEach(k => {
                text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), replacements[k]);
            });
        }

        return text;
    },

    /**
     * Get nested object value by dot-notation path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    },

    /**
     * Get localized recipe data
     * @param {number} id - Recipe ID
     * @returns {Object} Localized recipe (title, ingredients, steps)
     */
    getRecipe(id) {
        return this.recipes[id] || window.HBF_RECIPES?.ru?.[id] || null;
    },

    /**
     * Switch language
     * @param {string} lang - Target language ('ru' or 'en')
     * @param {number|null} userId - Telegram user ID for Supabase sync
     */
    async setLanguage(lang, userId = null) {
        if (!this.supportedLangs.includes(lang)) {
            console.error(`[I18n] Unsupported language: ${lang}`);
            return;
        }

        if (lang === this.currentLang) {
            return; // Already set
        }

        this.currentLang = lang;
        localStorage.setItem('hbf_language', lang);

        // Reload translations and recipes
        this.loadTranslations(lang);
        this.loadRecipes(lang);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Sync to Supabase if user logged in
        const log = window.debugLog || console.log;
        if (userId && window.supabase) {
            try {
                log(`i18n: saving to Supabase...`);
                const { data, error } = await window.supabase
                    .from('users')
                    .update({ language: lang })
                    .eq('telegram_id', userId)
                    .select();

                if (error) {
                    log(`i18n: Supabase ERROR: ${error.message}`, 'error');
                } else {
                    log(`i18n: Supabase OK → ${lang}`, 'success');
                }
            } catch (e) {
                log(`i18n: Supabase EXCEPTION: ${e.message}`, 'error');
            }
        } else {
            log(`i18n: SKIP Supabase (userId=${userId})`, 'warn');
        }

        // Dispatch event for UI refresh
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang }
        }));

        console.log(`[I18n] Language switched to: ${lang}`);
    },

    /**
     * Apply language from Supabase user object
     * Called in applyUserState() after loading user data
     * @param {Object} user - User object from Supabase
     */
    applyFromUser(user) {
        const log = window.debugLog || console.log;
        log(`i18n.applyFromUser: supabase='${user?.language}' current='${this.currentLang}'`);
        if (user?.language && this.supportedLangs.includes(user.language)) {
            if (user.language !== this.currentLang) {
                log(`i18n: supabase → ${user.language}`, 'success');
                this.currentLang = user.language;
                localStorage.setItem('hbf_language', user.language);
                this.loadTranslations(user.language);
                this.loadRecipes(user.language);
                document.documentElement.lang = user.language;

                // Trigger UI refresh
                document.dispatchEvent(new CustomEvent('languageChanged', {
                    detail: { lang: user.language }
                }));

                console.log(`[I18n] Applied language from user: ${user.language}`);
            }
        }
    },

    /**
     * Get current language
     */
    getLang() {
        return this.currentLang;
    },

    /**
     * Check if current language is English
     */
    isEnglish() {
        return this.currentLang === 'en';
    },

    /**
     * Format date according to current locale
     * @param {Date} date - Date object
     * @param {Object} options - Intl.DateTimeFormat options
     */
    formatDate(date, options = {}) {
        const locale = this.currentLang === 'en' ? 'en-US' : 'ru-RU';
        return new Intl.DateTimeFormat(locale, options).format(date);
    },

    /**
     * Get weekday names for current language
     */
    getWeekdays(short = false) {
        if (this.currentLang === 'en') {
            return short
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        }
        return short
            ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
            : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    },

    /**
     * Get month names for current language
     */
    getMonths(short = false) {
        if (this.currentLang === 'en') {
            return short
                ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        return short
            ? ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
            : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    }
};

// Shorthand function for translations
function t(key, replacements) {
    return I18n.t(key, replacements);
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, t };
}
