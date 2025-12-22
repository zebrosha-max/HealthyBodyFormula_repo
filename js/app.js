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
        filters: {
            category: 'all',
            type: 'all'
        }
    };

    // ===== SCREEN NAVIGATION =====
    const screens = document.querySelectorAll('.screen');
    const navCards = document.querySelectorAll('.nav-card[data-screen]');
    const backButtons = document.querySelectorAll('[data-back]');
    const tabItems = document.querySelectorAll('.nav-item[data-tab]');

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

        if (userData) {
            if (userNameEl) userNameEl.textContent = userData.first_name + (userData.last_name ? ' ' + userData.last_name : '');
            if (userStatusEl) userStatusEl.textContent = 'Пользователь HBF';
            
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
                        renderUserStatus();
                        await loadFavorites();
                    }
                } catch (e) {
                    console.error("Supabase sync error:", e);
                }
            }
        } else {
            if (userNameEl) userNameEl.textContent = 'Гость';
            if (userStatusEl) userStatusEl.textContent = 'Web Preview';
            if (subInfoEl) subInfoEl.textContent = 'Войдите через Telegram для сохранения данных.';
            
            const localFavs = localStorage.getItem('hbf_favorites');
            if (localFavs) state.favorites = JSON.parse(localFavs);
            renderRecipes();
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
            image: "Recipes/images/ovsyanoblin.png",
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
            image: "Recipes/images/kinoa_shrimp_bowl.png",
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
            type: "meat",
            kcal: 220,
            time: 40,
            bju: "28/10/5",
            image: "Recipes/images/brokkoli_muffin.png",
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
            type: "vegan",
            kcal: 180,
            time: 5,
            bju: "6/15/18",
            image: "Recipes/images/chia_dessert.png",
            ingredients: ["Семена чиа - 3 ст.л.", "Кокосовое молоко - 150 мл", "Манго - 50 г"],
            steps: [
                "В стеклянную банку всыпьте семена чиа и залейте кокосовым молоком.",
                "Тщательно перемешайте вилкой, чтобы не было комочков, и оставьте на 10 минут.",
                "Перемешайте еще раз и уберите в холодильник минимум на 3-4 часа (идеально — на ночь).",
                "Манго измельчите в пюре или нарежьте мелкими кубиками.",
                "Выложите фруктовый слой поверх застывшего пудинга перед подачей."
            ]
        }
    };

    function renderRecipes() {
        const container = document.querySelector('.recipes-grid');
        if (!container) return;

        container.innerHTML = '';
        
        Object.keys(recipesDB).forEach(id => {
            const r = recipesDB[id];
            
            if (state.filters.category !== 'all' && r.category !== state.filters.category) return;
            
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
                        <span class="badge badge-type">${r.type}</span>
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

    async function toggleFavorite(id) {
        const index = state.favorites.indexOf(id);
        const isAdding = index === -1;
        
        if (isAdding) {
            state.favorites.push(id);
        } else {
            state.favorites.splice(index, 1);
        }
        
        renderRecipes(); 
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

    // Add Filters UI
    const recipesScreen = document.getElementById('screen-recipes');
    if (recipesScreen && !document.querySelector('.filter-container')) {
        const filterHtml = `
            <div class="filter-container">
                <button class="filter-chip active" data-cat="all">Все</button>
                <button class="filter-chip" data-cat="breakfast">Завтрак</button>
                <button class="filter-chip" data-cat="lunch">Обед</button>
                <button class="filter-chip" data-cat="dinner">Ужин</button>
                <button class="filter-chip" data-cat="dessert">Десерты</button>
            </div>
        `;
        const header = recipesScreen.querySelector('.page-header');
        if(header) header.insertAdjacentHTML('afterend', filterHtml);

        recipesScreen.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', function() {
                recipesScreen.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                state.filters.category = this.dataset.cat;
                renderRecipes();
            });
        });
    }

    // Init
    initUser();


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