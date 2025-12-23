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
        }
    } catch (e) {
        console.error("Supabase init error:", e);
    }

    // State Management
    const state = {
        user: null,
        isPremium: false,
        activeTab: 'main',
        favorites: [],
        calorieGoal: parseInt(localStorage.getItem('hbf_calorie_goal')) || 2000,
        filters: {
            category: 'all',
            type: 'all',
            time: 'all',
            kcal: 'all',
            onlyFavorites: false
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

            // Refresh Diary when entering profile
            if (screenId === 'profile') {
                renderFoodDiary();
            }
        }
    }

    // ===== SMART LOGGER (FAB) =====
    const fabLogFood = document.getElementById('fab-log-food');
    if (fabLogFood) {
        fabLogFood.addEventListener('click', () => {
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
            // Redirect to Bot with a specific parameter to start logging
            // Replace 'YourFoodLogBot' with your actual bot username
            tg.openTelegramLink('https://t.me/YourFoodLogBot?start=log_food');
        });
    }

    // ===== FOOD DIARY LOGIC =====
    
    // Settings Modal Logic
    const settingsBtn = document.getElementById('diary-settings-btn');
    const modal = document.getElementById('modal-diary-settings');
    const modalInput = document.getElementById('diary-goal-input');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');

    if (settingsBtn && modal) {
        settingsBtn.addEventListener('click', () => {
            modalInput.value = state.calorieGoal;
            modal.classList.add('active');
            if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });

        modalCancel.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modalSave.addEventListener('click', async () => {
            const newGoal = parseInt(modalInput.value);
            if (newGoal && newGoal > 500 && newGoal < 10000) {
                state.calorieGoal = newGoal;
                // localStorage.setItem('hbf_calorie_goal', newGoal); // No longer primary source

                // Sync with Supabase
                if (state.user && supabase) {
                    try {
                        await supabase
                            .from('users')
                            .update({ calorie_goal: newGoal })
                            .eq('telegram_id', state.user.telegram_id);
                    } catch (e) {
                        console.error("Failed to update goal:", e);
                    }
                }

                modal.classList.remove('active');
                renderFoodDiary(); // Refresh UI
                if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            } else {
                if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
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

        try {
            // Get today's start and end timestamps
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            
            const { data, error } = await supabase
                .from('food_logs')
                .select('*')
                .eq('user_id', state.user.telegram_id)
                .gte('created_at', startOfDay.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

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
            data.forEach(log => {
                totalKcal += log.calories;
                const time = new Date(log.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                
                const item = document.createElement('div');
                item.className = 'food-log-item';
                item.innerHTML = `
                    <div class="food-log-info">
                        <h4>${log.dish_name || 'Прием пищи'}</h4>
                        <p>${time} • Б:${log.protein} Ж:${log.fat} У:${log.carbs}</p>
                    </div>
                    <div class="food-log-kcal">${log.calories} ккал</div>
                `;
                diaryList.appendChild(item);
            });

            kcalTotalEl.textContent = totalKcal;
            const progress = Math.min((totalKcal / state.calorieGoal) * 100, 100);
            progressBar.style.width = `${progress}%`;

        } catch (e) {
            console.error("Diary load error:", e);
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
            if (userNameEl) userNameEl.textContent = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
            if (userStatusEl) userStatusEl.textContent = 'Пользователь HBF';
            
            // Set User Photo if available
            if (userPhotoEl) {
                if (userData.photo_url) {
                    userPhotoEl.innerHTML = `<img src="${userData.photo_url}" alt="${userData.first_name}" class="profile-photo" style="margin-bottom: 0;">`;
                    userPhotoEl.className = ''; // Remove placeholder styling wrapper
                    userPhotoEl.style.background = 'none';
                    userPhotoEl.style.boxShadow = 'none';
                    userPhotoEl.style.border = 'none';
                } else {
                    // Fallback to placeholder
                    userPhotoEl.className = 'profile-photo-placeholder';
                    userPhotoEl.innerHTML = '<i class="fa-solid fa-user"></i>';
                    userPhotoEl.style = ''; // Reset inline styles
                }
            }
            
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
                        state.user = user;
                        state.isPremium = user.is_premium;
                        state.calorieGoal = user.calorie_goal || 2000; // Load from DB
                        renderUserStatus();
                        await loadFavorites();
                        
                        // If we are in profile, render diary immediately to reflect goal
                        if (state.activeTab === 'profile') {
                            renderFoodDiary();
                        }
                    }
                } catch (e) {
                    console.error("Supabase sync error:", e);
                }
            }
        } else {
            if (userNameEl) userNameEl.textContent = 'Гость';
            if (userStatusEl) userStatusEl.textContent = 'Web Preview';
            if (subInfoEl) subInfoEl.textContent = 'Войдите через Telegram для сохранения данных.';
            
            // Guest photo placeholder
            if (userPhotoEl) {
                userPhotoEl.className = 'profile-photo-placeholder';
                userPhotoEl.innerHTML = '<i class="fa-solid fa-user"></i>';
            }
            
            const localFavs = localStorage.getItem('hbf_favorites');
            if (localFavs) state.favorites = JSON.parse(localFavs);
            renderRecipes();
            renderProfileFavorites();
        }
    }

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

        const typeNames = {
            meat: 'Мясо',
            poultry: 'Птица',
            fish: 'Рыба',
            vegetarian: 'Вегетарианское'
        };

        container.innerHTML = '';
        
        Object.keys(recipesDB).forEach(id => {
            const r = recipesDB[id];
            
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
                    <img src="${r.image}" alt="${r.title}">
                </div>
                <div class="recipe-info">
                    <h3 class="recipe-title">${r.title}</h3>
                    <div class="recipe-badges">
                        <span class="badge badge-time"><i class="fa-regular fa-clock"></i> ${r.time} м</span>
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

            const card = document.createElement('div');
            card.className = 'recipe-card';
            // Compact style for profile
            card.style.marginBottom = '0';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.padding = '10px';
            card.style.gap = '15px';

            card.innerHTML = `
                <img src="${r.image}" alt="${r.title}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 16px;">${r.title}</h4>
                    <span style="font-size: 12px; color: var(--text-secondary);"><i class="fa-solid fa-fire"></i> ${r.kcal} ккал</span>
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

        document.getElementById('detail-title').textContent = data.title;
        document.getElementById('detail-category').textContent = data.category;
        document.getElementById('detail-kcal').textContent = data.kcal + ' ккал';
        document.getElementById('detail-time').textContent = data.time + ' мин';
        document.getElementById('detail-bju').textContent = data.bju;
        
        document.getElementById('detail-ingredients').innerHTML = data.ingredients.map(i => `<li>${i}</li>`).join('');
        document.getElementById('detail-steps').innerHTML = data.steps.map(s => `<li>${s}</li>`).join('');
        
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

});