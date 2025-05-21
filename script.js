// Dữ liệu mẫu - Danh sách game
let games = [
    { 
        id: 1, 
        name: "The Witcher 3", 
        price: 599000, 
        discountPercent: 30, 
        genre: ["RPG", "Open World"], 
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg", 
        addedAt: "2025-05-10" 
    },
    { 
        id: 2, 
        name: "FIFA 25", 
        price: 1200000, 
        discountPercent: 15, 
        genre: ["Sports", "Simulation"], 
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg", 
        addedAt: "2025-05-12" 
    },
    { 
        id: 3, 
        name: "Cyberpunk 2077", 
        price: 990000, 
        discountPercent: 25, 
        genre: ["RPG", "Action", "Open World"], 
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", 
        addedAt: "2025-05-14" 
    },
    { 
        id: 4, 
        name: "Minecraft", 
        price: 450000, 
        discountPercent: 0, 
        genre: ["Sandbox", "Adventure"], 
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg", 
        addedAt: "2025-05-15" 
    },
    { 
        id: 5, 
        name: "Call of Duty: Modern Warfare", 
        price: 1100000, 
        discountPercent: 10, 
        genre: ["FPS", "Action"], 
        imageUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg", 
        addedAt: "2025-05-18" 
    }
];

// Danh sách thể loại game
const allGenres = ["RPG", "Open World", "Sports", "Simulation", "Action", "Sandbox", "Adventure", "FPS", "Strategy", "Racing"];

// State của ứng dụng
let state = {
    isAdmin: false,
    isAdminLoginModalOpen: false,
    isGameEditModalOpen: false,
    isAddingNewGame: false,
    editingGameId: null,
    searchTerm: '',
    selectedGenres: [],
    priceRange: [0, 2000000],
    discountRange: [0, 100],
    sortBy: 'name',
    sortDirection: 'asc',
    showFilters: window.innerWidth >= 769
};

// Hàm chức năng cơ bản
function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function calculateDiscountedPrice(price, discountPercent) {
    return price - (price * discountPercent / 100);
}

function getNextId() {
    return Math.max(...games.map(game => game.id), 0) + 1;
}

// DOM References
const domElements = {
    // Containers
    gamesContainer: document.getElementById('games-container'),
    filtersSection: document.getElementById('filters-section'),
    batchInputSection: document.getElementById('batch-input-section'),
    genresContainer: document.getElementById('game-genres-container'),
    noGamesMessage: document.getElementById('no-games-message'),
    
    // Modals
    adminLoginModal: document.getElementById('admin-login-modal'),
    gameEditModal: document.getElementById('game-edit-modal'),
    
    // Inputs & Selects
    searchInput: document.getElementById('search-input'),
    genreSelect: document.getElementById('genre-select'),
    minPriceInput: document.getElementById('min-price'),
    maxPriceInput: document.getElementById('max-price'),
    minDiscountInput: document.getElementById('min-discount'),
    maxDiscountInput: document.getElementById('max-discount'),
    sortBySelect: document.getElementById('sort-by'),
    sortDirectionBtn: document.getElementById('sort-direction-btn'),
    adminUsernameInput: document.getElementById('admin-username'),
    adminPasswordInput: document.getElementById('admin-password'),
    batchInput: document.getElementById('batch-input'),
    
    // Game Edit Form
    gameEditTitle: document.getElementById('game-edit-title'),
    gameNameInput: document.getElementById('game-name-input'),
    gamePriceInput: document.getElementById('game-price-input'),
    gameDiscountInput: document.getElementById('game-discount-input'),
    gameImageInput: document.getElementById('game-image-input'),
    
    // Buttons
    toggleFiltersBtn: document.getElementById('toggle-filters-btn'),
    adminLoginBtn: document.getElementById('admin-login-btn'),
    adminCancelBtn: document.getElementById('admin-cancel-btn'),
    adminLoginSubmitBtn: document.getElementById('admin-login-submit-btn'),
    batchAddBtn: document.getElementById('batch-add-btn'),
    gameEditCloseBtn: document.getElementById('game-edit-close-btn'),
    gameEditCancelBtn: document.getElementById('game-edit-cancel-btn'),
    gameEditSaveBtn: document.getElementById('game-edit-save-btn'),
    
    // Text Elements
    gamesCount: document.getElementById('games-count')
};

// Render Functions
function renderGames() {
    // Lọc và sắp xếp game
    const filteredGames = filterAndSortGames();
    
    // Cập nhật số lượng game
    domElements.gamesCount.textContent = `Danh sách game (${filteredGames.length})`;
    
    // Hiển thị thông báo nếu không có game nào
    if (filteredGames.length === 0) {
        domElements.gamesContainer.innerHTML = '';
        domElements.noGamesMessage.style.display = 'block';
        return;
    }
    
    domElements.noGamesMessage.style.display = 'none';
    
    // Render các game card
    domElements.gamesContainer.innerHTML = '';
    filteredGames.forEach(game => {
        const discountedPrice = calculateDiscountedPrice(game.price, game.discountPercent);
        
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        
        let genreHtml = '';
        game.genre.slice(0, 3).forEach(genre => {
            genreHtml += `<span class="genre-tag">${genre}</span>`;
        });
        
        gameCard.innerHTML = `
            <div class="game-image-container">
                <img src="${game.imageUrl}" alt="${game.name}" class="game-image">
                ${game.discountPercent > 0 ? `<div class="discount-badge">-${game.discountPercent}%</div>` : ''}
            </div>
            <div class="game-details">
                <h3 class="game-title">${game.name}</h3>
                <div class="game-genres">
                    ${genreHtml}
                </div>
                <div class="game-price">
                    ${game.discountPercent > 0 ? 
                        `<span class="discounted-price">${formatCurrency(discountedPrice)}</span>
                         <span class="original-price">${formatCurrency(game.price)}</span>` : 
                        `<span class="original-price">${formatCurrency(game.price)}</span>`
                    }
                </div>
                ${state.isAdmin ? `
                    <div class="game-actions">
                        <button class="btn btn-icon btn-outline edit-game-btn" data-id="${game.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-outline delete-game-btn" data-id="${game.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Thêm event listeners nếu là admin
        if (state.isAdmin) {
            const editBtn = gameCard.querySelector('.edit-game-btn');
            const deleteBtn = gameCard.querySelector('.delete-game-btn');
            
            editBtn.addEventListener('click', () => openGameEditModal(game.id));
            deleteBtn.addEventListener('click', () => deleteGame(game.id));
        }
        
        domElements.gamesContainer.appendChild(gameCard);
    });
}

function filterAndSortGames() {
    let result = [...games];
    
    // Lọc theo tên
    if (state.searchTerm) {
        result = result.filter(game => 
            game.name.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
    }
    
    // Lọc theo thể loại
    if (state.selectedGenres.length > 0) {
        result = result.filter(game => 
            state.selectedGenres.some(genre => game.genre.includes(genre))
        );
    }
    
    // Lọc theo khoảng giá
    result = result.filter(game => 
        game.price >= state.priceRange[0] && game.price <= state.priceRange[1]
    );
    
    // Lọc theo % giảm giá
    result = result.filter(game => 
        game.discountPercent >= state.discountRange[0] && game.discountPercent <= state.discountRange[1]
    );
    
    // Sắp xếp
    result.sort((a, b) => {
        let comparison = 0;
        switch (state.sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'discount':
                comparison = a.discountPercent - b.discountPercent;
                break;
            case 'date':
                comparison = new Date(a.addedAt) - new Date(b.addedAt);
                break;
            default:
                comparison = 0;
        }
        return state.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
}

function renderGenreCheckboxes() {
    domElements.genresContainer.innerHTML = '';
    
    allGenres.forEach(genre => {
        const genreDiv = document.createElement('div');
        genreDiv.className = 'genre-checkbox';
        
        genreDiv.innerHTML = `
            <input type="checkbox" id="genre-${genre}" value="${genre}" class="genre-checkbox-input">
            <label for="genre-${genre}">${genre}</label>
        `;
        
        domElements.genresContainer.appendChild(genreDiv);
    });
}

function updateAdminUI() {
    // Hiển thị/ẩn nút admin và chức năng admin
    if (state.isAdmin) {
        domElements.adminLoginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng xuất';
        domElements.batchInputSection.style.display = 'block';
    } else {
        domElements.adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
        domElements.batchInputSection.style.display = 'none';
    }
    
    // Render lại danh sách game để hiển thị/ẩn nút chỉnh sửa
    renderGames();
}

// Modal Functions
function openAdminLoginModal() {
    state.isAdminLoginModalOpen = true;
    domElements.adminLoginModal.style.display = 'flex';
    domElements.adminUsernameInput.focus();
}

function closeAdminLoginModal() {
    state.isAdminLoginModalOpen = false;
    domElements.adminLoginModal.style.display = 'none';
    domElements.adminUsernameInput.value = '';
    domElements.adminPasswordInput.value = '';
}

function openGameEditModal(gameId = null) {
    state.isGameEditModalOpen = true;
    
    if (gameId) {
        state.isAddingNewGame = false;
        state.editingGameId = gameId;
        const game = games.find(g => g.id === gameId);
        
        domElements.gameEditTitle.textContent = 'Chỉnh Sửa Game';
        domElements.gameNameInput.value = game.name;
        domElements.gamePriceInput.value = game.price;
        domElements.gameDiscountInput.value = game.discountPercent;
        domElements.gameImageInput.value = game.imageUrl;
        
        // Chọn các thể loại
        const checkboxes = domElements.genresContainer.querySelectorAll('.genre-checkbox-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = game.genre.includes(checkbox.value);
        });
        
    } else {
        state.isAddingNewGame = true;
        state.editingGameId = null;
        
        domElements.gameEditTitle.textContent = 'Thêm Game Mới';
        domElements.gameNameInput.value = '';
        domElements.gamePriceInput.value = '';
        domElements.gameDiscountInput.value = '0';
        domElements.gameImageInput.value = 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg';
        
        // Bỏ chọn tất cả thể loại
        const checkboxes = domElements.genresContainer.querySelectorAll('.genre-checkbox-input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    domElements.gameEditModal.style.display = 'flex';
    domElements.gameNameInput.focus();
}

function closeGameEditModal() {
    state.isGameEditModalOpen = false;
    domElements.gameEditModal.style.display = 'none';
}

// Game CRUD Functions
function saveGame() {
    // Lấy thông tin từ form
    const name = domElements.gameNameInput.value.trim();
    const price = parseFloat(domElements.gamePriceInput.value) || 0;
    const discountPercent = parseFloat(domElements.gameDiscountInput.value) || 0;
    const imageUrl = domElements.gameImageInput.value.trim() || 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg';
    
    // Lấy thể loại được chọn
    const selectedGenres = [];
    const checkboxes = domElements.genresContainer.querySelectorAll('.genre-checkbox-input:checked');
    checkboxes.forEach(checkbox => {
        selectedGenres.push(checkbox.value);
    });
    
    // Validate
    if (!name) {
        alert('Vui lòng nhập tên game!');
        return;
    }
    
    if (state.isAddingNewGame) {
        // Kiểm tra trùng lặp
        const isDuplicate = games.some(game => 
            game.name.toLowerCase() === name.toLowerCase()
        );
        
        if (isDuplicate) {
            if (!confirm('Game này đã tồn tại! Bạn vẫn muốn thêm?')) {
                return;
            }
        }
        
        // Thêm game mới
        const newGame = {
            id: getNextId(),
            name,
            price,
            discountPercent,
            genre: selectedGenres,
            imageUrl,
            addedAt: new Date().toISOString().split('T')[0]
        };
        
        games.push(newGame);
        
    } else {
        // Cập nhật game hiện có
        const gameIndex = games.findIndex(g => g.id === state.editingGameId);
        if (gameIndex !== -1) {
            games[gameIndex] = {
                ...games[gameIndex],
                name,
                price,
                discountPercent,
                genre: selectedGenres,
                imageUrl
            };
        }
    }
    
    // Lưu vào localStorage
    saveGamesToStorage();
    
    // Đóng modal và render lại
    closeGameEditModal();
    renderGames();
}

function deleteGame(gameId) {
    if (confirm('Bạn có chắc muốn xóa game này?')) {
        games = games.filter(game => game.id !== gameId);
        saveGamesToStorage();
        renderGames();
    }
}

function addBatchGames() {
    const batchText = domElements.batchInput.value.trim();
    if (!batchText) return;
    
    const lines = batchText.split('\n');
    let newGames = [];
    let duplicates = [];
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        const [name, price, genreStr, imageUrl] = line.split('|').map(item => item.trim());
        
        if (!name || !price) return;
        
        const genres = genreStr ? genreStr.split(',').map(g => g.trim()) : [];
        
        // Kiểm tra trùng lặp
        if (games.some(game => game.name.toLowerCase() === name.toLowerCase())) {
            duplicates.push(name);
            return;
        }
        
        newGames.push({
            id: getNextId() + newGames.length,
            name,
            price: parseFloat(price) || 0,
            discountPercent: 0,
            genre: genres,
            imageUrl: imageUrl || 'https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg',
            addedAt: new Date().toISOString().split('T')[0]
        });
    });
    
    if (duplicates.length > 0) {
        alert(`Các game sau đã tồn tại: ${duplicates.join(', ')}`);
    }
    
    if (newGames.length > 0) {
        games = [...games, ...newGames];
        saveGamesToStorage();
        domElements.batchInput.value = '';
        renderGames();
    }
}

// Filter Functions
function updateFilters() {
    state.searchTerm = domElements.searchInput.value.trim();
    
    // Cập nhật thể loại được chọn
    state.selectedGenres = Array.from(domElements.genreSelect.selectedOptions).map(option => option.value);
    
    // Cập nhật khoảng giá
    state.priceRange = [
        parseFloat(domElements.minPriceInput.value) || 0,
        parseFloat(domElements.maxPriceInput.value) || 2000000
    ];
    
    // Cập nhật khoảng giảm giá
    state.discountRange = [
        parseFloat(domElements.minDiscountInput.value) || 0,
        parseFloat(domElements.maxDiscountInput.value) || 100
    ];
    
    renderGames();
}

// Auth Functions
function handleAdminLogin() {
    const username = domElements.adminUsernameInput.value.trim();
    const password = domElements.adminPasswordInput.value;
    
    // Demo login với username='admin' password='password'
    if (username === 'admin' && password === 'password') {
        state.isAdmin = true;
        closeAdminLoginModal();
        updateAdminUI();
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
}

function handleAdminLogout() {
    state.isAdmin = false;
    updateAdminUI();
}

// Toggle Functions
function toggleFilters() {
    state.showFilters = !state.showFilters;
    
    if (state.showFilters) {
        domElements.filtersSection.style.display = 'block';
    } else {
        domElements.filtersSection.style.display = 'none';
    }
}

function toggleSortDirection() {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    domElements.sortDirectionBtn.textContent = state.sortDirection === 'asc' ? '↑' : '↓';
    renderGames();
}

// Storage Functions
function saveGamesToStorage() {
    localStorage.setItem('games', JSON.stringify(games));
}

function loadGamesFromStorage() {
    const storedGames = localStorage.getItem('games');
    if (storedGames) {
        games = JSON.parse(storedGames);
    }
}

// Event Listeners
function setupEventListeners() {
    // Filter Events
    domElements.searchInput.addEventListener('input', updateFilters);
    domElements.genreSelect.addEventListener('change', updateFilters);
    domElements.minPriceInput.addEventListener('input', updateFilters);
    domElements.maxPriceInput.addEventListener('input', updateFilters);
    domElements.minDiscountInput.addEventListener('input', updateFilters);
    domElements.maxDiscountInput.addEventListener('input', updateFilters);
    
    // Sort Events
    domElements.sortBySelect.addEventListener('change', () => {
        state.sortBy = domElements.sortBySelect.value;
        renderGames();
    });
    domElements.sortDirectionBtn.addEventListener('click', toggleSortDirection);
    
    // Button Events
    domElements.toggleFiltersBtn.addEventListener('click', toggleFilters);
    
    // Admin Login Events
    domElements.adminLoginBtn.addEventListener('click', () => {
        if (state.isAdmin) {
            handleAdminLogout();
        } else {
            openAdminLoginModal();
        }
    });
    domElements.adminCancelBtn.addEventListener('click', closeAdminLoginModal);
    domElements.adminLoginSubmitBtn.addEventListener('click', handleAdminLogin);
    
    // Game Edit Events
    domElements.gameEditCloseBtn.addEventListener('click', closeGameEditModal);
    domElements.gameEditCancelBtn.addEventListener('click', closeGameEditModal);
    domElements.gameEditSaveBtn.addEventListener('click', saveGame);
    
    // Batch Add Events
    domElements.batchAddBtn.addEventListener('click', addBatchGames);
    
    // Responsive Events
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 769) {
            domElements.filtersSection.style.display = 'block';
        } else if (!state.showFilters) {
            domElements.filtersSection.style.display = 'none';
        }
    });
}

// Initialization
function init() {
    // Tải games từ localStorage nếu có
    loadGamesFromStorage();
    
    // Khởi tạo giá trị cho các input
    domElements.minPriceInput.value = state.priceRange[0];
    domElements.maxPriceInput.value = state.priceRange[1];
    domElements.minDiscountInput.value = state.discountRange[0];
    domElements.maxDiscountInput.value = state.discountRange[1];
    
    // Render ban đầu
    renderGenreCheckboxes();
    renderGames();
    
    // Setup event listeners
    setupEventListeners();
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', init);
