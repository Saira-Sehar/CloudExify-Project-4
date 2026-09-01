// =============================================
// MIZAARA - Menu Functions
// =============================================

let allMenuItems = [];
let filteredItems = [];
let currentCategory = 'all';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('mizaara_favorites') || '[]');

// Load menu items from Supabase
async function loadMenu() {
    const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name');
    
    if (error) {
        console.error('Error loading menu:', error.message);
        showToast('Could not load menu. Please refresh.', 'error');
        return;
    }
    
    allMenuItems = items || [];
    filteredItems = allMenuItems;
    renderMenu();
    updateFavoritesUI();
    
    const loading = document.getElementById('menuLoading');
    if (loading) loading.style.display = 'none';
}

// Render menu cards
function renderMenu() {
    const grid = document.getElementById('menuGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (filteredItems.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }
    
    emptyState.classList.add('d-none');
    
    grid.innerHTML = filteredItems.map(item => {
        const isFav = favorites.includes(item.id);
        const isPop = isPopular(item.id);
        
        return `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="menu-card" style="position:relative;">
                ${isPop ? `<span class="popular-badge">🔥 Popular</span>` : ''}
                <button class="favorite-btn" onclick="toggleFavorite(${item.id})">
                    <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}" style="color:${isFav ? '#ef4444' : '#6b5a4e'};"></i>
                </button>
                <div class="menu-card-image">
                    <img src="${item.image_url || 'assets/images/food/placeholder.jpg'}" 
                         alt="${item.name}" 
                         onerror="this.src='assets/images/food/placeholder.jpg'">
                </div>
                <div class="menu-card-body">
                    <span class="menu-card-category">${item.category}</span>
                    <h3 class="menu-card-name">${item.name}</h3>
                    <p class="menu-card-desc">${item.description || 'Delicious dish prepared fresh.'}</p>
                    <div class="menu-card-footer">
                        <span class="menu-card-price">₨${parseFloat(item.price).toLocaleString()}</span>
                        <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                            <i class="bi bi-plus-lg"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Filter menu by category
function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
    
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
}

// Apply all filters
function applyFilters() {
    filteredItems = allMenuItems.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    renderMenu();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterByCategory(btn.dataset.category);
        });
    });
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            applyFilters();
        });
    }
    
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchQuery = '';
            currentCategory = 'all';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';
            document.querySelectorAll('.cat-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === 'all') btn.classList.add('active');
            });
            applyFilters();
        });
    }
    
    if (document.getElementById('menuGrid')) {
        loadMenu();
    }
});

// =============================================
// FAVORITES
// =============================================

window.toggleFavorite = function(itemId) {
    if (favorites.includes(itemId)) {
        favorites = favorites.filter(id => id !== itemId);
        showToast('Removed from favorites.', 'warning');
    } else {
        favorites.push(itemId);
        showToast('Added to favorites! ❤️', 'success');
    }
    localStorage.setItem('mizaara_favorites', JSON.stringify(favorites));
    renderMenu();
    updateFavoritesUI();
};

// Remove favorite from offcanvas
window.removeFavorite = function(itemId) {
    favorites = favorites.filter(id => id !== itemId);
    localStorage.setItem('mizaara_favorites', JSON.stringify(favorites));
    updateFavoritesUI();
    renderMenu();
    showToast('Removed from favorites.', 'warning');
};

// Update favorites badge and offcanvas
function updateFavoritesUI() {
    const badge = document.getElementById('favoriteBadge');
    const container = document.getElementById('favoritesItems');
    
    if (badge) {
        badge.textContent = favorites.length;
        badge.style.display = favorites.length > 0 ? 'flex' : 'none';
    }
    
    if (container) {
        if (favorites.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-heart" style="font-size:3rem;color:#8a7a6e;"></i>
                    <p class="mt-3" style="color:#FFF9F0;">No favorites yet</p>
                    <p style="color:#8a7a6e;font-size:0.8rem;">Tap the heart on any dish to save it here</p>
                    <button class="btn btn-outline-custom btn-sm" data-bs-dismiss="offcanvas">Browse Menu</button>
                </div>
            `;
        } else {
            container.innerHTML = favorites.map(itemId => {
                const item = allMenuItems.find(i => i.id === itemId);
                if (!item) return '';
                
                return `
                    <div class="favorite-item">
                        <img src="${item.image_url || 'assets/images/food/placeholder.jpg'}" 
                             alt="${item.name}" 
                             class="favorite-item-image"
                             onerror="this.src='assets/images/food/placeholder.jpg'">
                        <div class="favorite-item-info">
                            <p class="favorite-item-name">${item.name}</p>
                            <p class="favorite-item-price">₨${parseFloat(item.price).toLocaleString()}</p>
                        </div>
                        <div class="favorite-item-actions">
                            <button class="favorite-add-btn" onclick="addToCart(${item.id})">
                                <i class="bi bi-plus"></i> Add
                            </button>
                            <button class="favorite-remove-btn" onclick="removeFavorite(${item.id})" title="Remove">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// =============================================
// POPULAR ITEMS
// =============================================

const popularItemIds = [1, 5, 18, 22];

function isPopular(itemId) {
    return popularItemIds.includes(itemId);
}

// =============================================
// SEARCH SUGGESTIONS
// =============================================

window.selectSuggestion = function(name) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = name;
    searchQuery = name;
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (suggestionsDiv) suggestionsDiv.style.display = 'none';
    applyFilters();
};

// =============================================
// RESTAURANT STATUS — CORRECT HOURS
// =============================================

function updateRestaurantStatus() {
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    
    let openHour = 12; // Mon-Fri
    let closeHour = 24; // 12 AM
    
    if (day === 6 || day === 0) { // Saturday or Sunday
        openHour = 13; // 1 PM
        closeHour = 25; // 1 AM next day
    }
    
    const isOpen = hours >= openHour && hours < closeHour;
    
    // Save for cart.js to check
    window.isRestaurantOpen = isOpen;
    
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    if (!statusDot || !statusText) return;
    
    if (isOpen) {
        statusDot.style.background = '#10b981';
        statusText.textContent = 'Open Now - Closing at ' + (closeHour === 24 ? '12 AM' : '1 AM');
    } else {
        statusDot.style.background = '#ef4444';
        statusText.textContent = 'Closed - Opens at ' + (openHour === 12 ? '12 PM' : '1 PM');
    }
}

updateRestaurantStatus();
setInterval(updateRestaurantStatus, 60000);

console.log('🍽️ Mizaara Menu Ready');
