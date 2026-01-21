/**
 * English UI Translations for HBF
 */
window.HBF_TRANSLATIONS = window.HBF_TRANSLATIONS || {};
window.HBF_TRANSLATIONS.en = {
    // === COMMON ===
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        back: 'Back',
        loading: 'Loading...',
        updating: 'Updating data...',
        error: 'Error',
        today: 'Today',
        goal: 'Goal',
        free: 'Free',
        read: 'Read',
        download: 'Download',
        book: 'Book',
        min: 'min',
        kcal: 'kcal',
        kg: 'kg',
        ml: 'ml',
        bju: 'P: {{p}} | F: {{f}} | C: {{c}}'
    },

    // === APP TITLE ===
    app: {
        title: 'Julia • Nutritionist'
    },

    // === MAIN SCREEN ===
    main: {
        greeting: 'Welcome',
        title: 'INFO',
        subtitle: 'Your health journey starts here ✨',
        aboutMe: 'About Me',
        diplomas: 'Diplomas',
        recipes: 'Recipes',
        guides: 'Guides',
        services: 'Services',
        recordings: 'Recordings',
        footerHint: 'With care for your health',
        logFood: 'Log Food'
    },

    // === BOTTOM NAVIGATION ===
    nav: {
        home: 'Home',
        services: 'Services',
        recipes: 'Recipes',
        profile: 'Profile'
    },

    // === ABOUT SCREEN ===
    about: {
        title: 'About Me',
        role: 'Clinical Nutritionist',
        bioTitle: 'About',
        bioText: 'Hi! I\'m Julia — a clinical nutritionist with over 5 years of experience. I help women find harmony with their body and food without strict diets or restrictions.\n\nMy approach is gentle work with eating behavior, understanding your true needs, and creating sustainable habits for health and well-being.',
        certificatesTitle: 'Diplomas & Certificates'
    },

    // === GUIDES SCREEN ===
    guides: {
        title: 'Guides',
        // Guide 0: Starter
        starter: {
            title: 'How to Start Your Health Journey?',
            desc: 'Basic checklist of habits and simple steps for a gentle, stress-free start.'
        },
        // Guide 1: Plate
        plate: {
            title: 'Plate Constructor',
            desc: 'The 50/25/25 method: how to build the perfect diet without scales or calorie counting.'
        },
        // Guide 2: Deficiencies
        deficiencies: {
            title: 'Deficiency Checklist',
            desc: 'Why no energy? Check yourself for the main deficiencies of city life.'
        },
        // Guide 3: Shopping
        shopping: {
            title: 'Smart Shopping',
            desc: 'Healthy cart: how to read labels and avoid buying unnecessary items at the supermarket.'
        },
        // Guide 4: Anti-Sugar
        antiSugar: {
            title: 'Anti-Sugar',
            desc: 'Scientific 21-day body reset protocol. Quit sugar without cravings or breakdowns.'
        },
        // Guide 5: Clean Gut
        cleanGut: {
            title: 'Clean Gut',
            desc: 'Foundation of immunity: restoring the mucosa and microbiome balance.'
        },
        // Guide 6: Hormonal
        hormonal: {
            title: 'Hormonal Glow',
            desc: 'Syncing nutrition with cycle phases for hormonal balance and mood.'
        },
        // Guide 7: Metabolic
        metabolic: {
            title: 'Metabolic Flexibility',
            desc: 'Smart weight management: how to teach your body to burn fat instead of sugar.'
        },
        // Guide 8: Cortisol
        cortisol: {
            title: 'Cortisol Control',
            desc: 'Anti-stress nutrition: supporting adrenals and nervous system.'
        },
        // Guide 9: Sleep
        sleep: {
            title: 'Sleep Biochemistry',
            desc: 'Deep recovery protocol: adjusting melatonin through food.'
        }
    },

    // === RECIPES SCREEN ===
    recipes: {
        title: 'Recipes',
        recipeDetail: 'Recipe',
        reset: 'Reset filters',
        ingredients: 'Ingredients',
        steps: 'Instructions',

        // Filter labels
        filters: {
            meal: 'Meal',
            product: 'Product',
            time: 'Time',
            calories: 'Calories'
        },

        // Categories
        categories: {
            all: 'Meal',
            breakfast: 'Breakfast',
            lunch: 'Lunch',
            dinner: 'Dinner',
            dessert: 'Dessert'
        },

        // Types
        types: {
            all: 'Product',
            meat: 'Meat',
            poultry: 'Poultry',
            fish: 'Fish',
            vegetarian: 'Vegetarian'
        },

        // Time options
        timeOptions: {
            all: 'Time',
            short: 'Under 20 min',
            medium: '20-40 min',
            long: '40+ min'
        },

        // Kcal options
        kcalOptions: {
            all: 'Calories',
            light: 'Light (<250)',
            medium: 'Medium (250-400)',
            heavy: 'Hearty (>400)'
        }
    },

    // === SERVICES SCREEN ===
    services: {
        title: 'Services',
        consultation: {
            title: 'Consultation',
            desc: 'Analysis of your diet, identifying deficiencies, and creating a 2-week nutrition plan.',
            price: '$45'
        },
        support: {
            title: 'Full Support',
            desc: 'One month of intensive work: daily reports, chat support, and menu adjustments.',
            price: '$150'
        }
    },

    // === RECORDINGS SCREEN ===
    recordings: {
        title: 'Recordings',
        recording1: {
            title: 'Webinar: Women\'s Hormonal Health',
            date: 'Oct 12',
            duration: '45 min'
        },
        recording2: {
            title: 'Live: How to Stop Overeating at Night?',
            date: 'Sep 25',
            duration: '20 min'
        },
        recording3: {
            title: 'Podcast: Vitamins in Fall. What to Take?',
            date: 'Sep 10',
            duration: '30 min'
        }
    },

    // === PROFILE SCREEN ===
    profile: {
        title: 'My Profile',
        guest: 'Guest',
        guestStatus: 'Web Preview',
        userStatus: 'HBF User',
        loginHint: 'Sign in via Telegram to save your data.',

        // Weight section
        weight: {
            title: 'My Weight',
            log: 'Log',
            current: '--',
            goalLabel: 'Goal: {{value}} kg',
            noGoal: 'No goal set',
            prompt: 'Enter your current weight (kg):',
            invalidNumber: 'Please enter a valid number.'
        },

        // Water section
        water: {
            title: 'Water Tracker',
            stats: '{{current}} / {{goal}} ml'
        },

        // Diary section
        diary: {
            title: 'Food Diary',
            todayLabel: 'Today: {{value}} kcal',
            goalLabel: 'Goal: {{value}} kcal',
            empty: 'You haven\'t logged anything today.',
            mealDefault: 'Meal',
            deleteConfirm: 'Delete this entry?',
            deleteError: 'Failed to delete: {{error}}'
        },

        // Favorites section
        favorites: {
            title: 'Favorites',
            empty: 'You have no favorite recipes yet.'
        }
    },

    // === SETTINGS MODAL ===
    settings: {
        title: 'My Goals',
        calorieLabel: 'Daily calorie goal:',
        waterLabel: 'Daily water goal (ml):',
        weightStartLabel: 'Starting weight (kg):',
        weightGoalLabel: 'Goal weight (kg):',
        languageLabel: 'Interface language:',
        languageRu: 'Russian',
        languageEn: 'English'
    },

    // === ANALYTICS SCREEN ===
    analytics: {
        title: 'Analytics',
        week: 'Week',
        month: 'Month',
        weight: 'Weight',
        calories: 'Kcal',
        water: 'Water',

        chartTitles: {
            weight: 'Weight Dynamics',
            calories: 'Calorie Intake',
            water: 'Water Balance'
        },

        avg: 'Average: {{value}}',
        total: 'Total: {{value}}',
        noData: 'No data'
    },

    // === LIGHTBOX ===
    lightbox: {
        hint: 'Scroll down • Use +/- to zoom'
    },

    // === DATE FORMATTING ===
    dates: {
        today: 'Today',
        yesterday: 'Yesterday',
        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekdaysFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthsFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
};
