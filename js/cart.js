// =============================================
// MIZAARA - Cart Functions
// =============================================

let cart = [];
let welcomeDiscountApplied = false;

// Load cart from sessionStorage
function loadCart() {
    try {
        cart = JSON.parse(sessionStorage.getItem('mizaara_cart')) || [];
    } catch {
        cart = [];
    }
    checkFirstOrderDiscount();
    updateCartUI();
}

// Save cart to sessionStorage
function saveCart() {
    sessionStorage.setItem('mizaara_cart', JSON.stringify(cart));
    updateCartUI();
}

// Check if customer is eligible for welcome discount
async function checkFirstOrderDiscount() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        welcomeDiscountApplied = false;
        return;
    }
    
    const { data: existingOrders, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);
    
    if (!error && (!existingOrders || existingOrders.length === 0)) {
        welcomeDiscountApplied = true;
    } else {
        welcomeDiscountApplied = false;
    }
}

// Get total with welcome discount
function getCartTotalWithDiscount() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (welcomeDiscountApplied && total > 0) {
        return total - (total * 20 / 100);
    }
    return total;
}

// Get discount amount
function getDiscountAmount() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (welcomeDiscountApplied && total > 0) {
        return total * 20 / 100;
    }
    return 0;
}

// Estimate delivery time
function estimateDeliveryTime() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const baseTime = 30;
    const perItem = 3;
    return baseTime + (totalItems * perItem);
}

// Check if restaurant is open
function isRestaurantOpenNow() {
    // Use the global variable set by menu.js if available
    if (window.isRestaurantOpen !== undefined) {
        return window.isRestaurantOpen;
    }
    
    // Fallback: calculate directly
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();
    
    let openHour = 12;
    let closeHour = 24;
    
    if (day === 6 || day === 0) {
        openHour = 13;
        closeHour = 25;
    }
    
    return hours >= openHour && hours < closeHour;
}

// Update cart UI
function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = getCartTotalWithDiscount();
    
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-bag-x" style="font-size:3rem;color:#8a7a6e;"></i>
                    <p class="mt-3">Your cart is empty</p>
                    <button class="btn btn-outline-custom btn-sm" data-bs-dismiss="offcanvas">Browse Menu</button>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (cartFooter) cartFooter.style.display = 'block';
            
            cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                         onerror="this.src='assets/images/food/placeholder.jpg'">
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-price">₨${(item.price * item.qty).toLocaleString()}</p>
                        <div class="cart-item-actions">
                            <button class="qty-btn" onclick="updateCartQty(${index}, -1)">−</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                            <button class="remove-btn ms-2" onclick="removeFromCart(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            if (cartFooter) {
                const deliveryTime = estimateDeliveryTime();
                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const discountAmount = getDiscountAmount();
                const isOpen = isRestaurantOpenNow();
                
                cartFooter.innerHTML = `
                    <div style="font-size:0.8rem;color:#C49A5A;margin-bottom:10px;">
                        <i class="bi bi-clock"></i> Estimated delivery: ${deliveryTime}-${deliveryTime + 15} minutes
                    </div>
                    
                    ${!isOpen ? `
                    <div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:10px 14px;margin-bottom:12px;">
                        <div style="color:#ef4444;font-weight:700;font-size:0.85rem;">
                            🔴 Restaurant is Closed
                        </div>
                        <div style="color:#8a7a6e;font-size:0.75rem;">
                            You can add items but ordering is disabled
                        </div>
                    </div>` : ''}
                    
                    ${welcomeDiscountApplied ? `
                    <div style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 14px;margin-bottom:12px;">
                        <div style="color:#10b981;font-weight:700;font-size:0.85rem;">
                            🎉 Welcome Discount Applied!
                        </div>
                        <div style="color:#8a7a6e;font-size:0.75rem;">
                            First order — 20% OFF automatically applied
                        </div>
                    </div>` : ''}
                    
                    <div class="cart-total-row">
                        <span>Subtotal</span>
                        <span>₨${subtotal.toLocaleString()}</span>
                    </div>
                    ${welcomeDiscountApplied ? `
                    <div class="cart-total-row" style="color:#10b981;">
                        <span>Welcome Discount (20%)</span>
                        <span>-₨${discountAmount.toLocaleString()}</span>
                    </div>` : ''}
                    <div class="cart-total-row">
                        <span>Total</span>
                        <span>₨${getCartTotalWithDiscount().toLocaleString()}</span>
                    </div>
                    <button class="btn btn-primary-custom w-100" onclick="placeOrder()" ${!isOpen ? 'disabled style="background:#8a7a6e;cursor:not-allowed;"' : ''}>
                        ${!isOpen ? '🔴 Closed — Order Disabled' : 'Place Order'}
                    </button>
                `;
            }
        }
    }
}

// Add to cart
window.addToCart = async function(itemId) {
    const { data: item, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .single();
    
    if (error || !item) {
        showToast('Could not add item to cart.', 'error');
        return;
    }
    
    if (cart.length === 0) {
        await checkFirstOrderDiscount();
    }
    
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            image: item.image_url,
            qty: 1
        });
    }
    
    saveCart();
    
    if (welcomeDiscountApplied) {
        showToast(`${item.name} added! Welcome 20% discount applied! 🎉`, 'success');
    } else {
        showToast(`${item.name} added to cart!`, 'success');
    }
};

// Update quantity
window.updateCartQty = function(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
    }
};

// Remove from cart
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
    showToast('Item removed from cart.', 'warning');
};

// Place order
window.placeOrder = async function() {
    // Check if restaurant is open
    const isOpen = isRestaurantOpenNow();
    
    if (!isOpen) {
        showToast('🔴 Restaurant is closed! Orders can only be placed during opening hours.', 'error');
        return;
    }
    
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        showToast('Please login to place an order.', 'warning');
        window.location.href = 'login.html';
        return;
    }
    
    const total = getCartTotalWithDiscount();
    
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            user_id: session.user.id,
            items: cart,
            total: total,
            status: 'Pending'
        }])
        .select();
    
    if (error) {
        showToast('Could not place order. Please try again.', 'error');
        return;
    }
    
    cart = [];
    welcomeDiscountApplied = false;
    saveCart();
    
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
    if (offcanvas) offcanvas.hide();
    
    showToast(`Order placed successfully! Order #${data[0].id}`, 'success');
    
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 1500);
};

// Initialize cart
loadCart();

console.log('🛒 Mizaara Cart Ready');