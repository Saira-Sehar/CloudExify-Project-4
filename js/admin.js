// =============================================
// MIZAARA - Admin Dashboard Functions
// =============================================

// Admin guard - check if user is admin
async function requireAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
    
    if (!profile || profile.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Toast notification
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position:fixed;top:100px;right:24px;z-index:99999;';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #2a1f1a;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: #FFF9F0;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 10px;
        animation: slideInToast 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
    `;
    
    toast.innerHTML = `<span style="color:${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};font-weight:700;">${type === 'success' ? '✓' : type === 'error' ? '✗' : '!'}</span> ${message}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add toast animation
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
document.head.appendChild(toastStyle);

// =============================================
// DASHBOARD FUNCTIONS
// =============================================

// Load dashboard stats
async function loadDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's orders
    const { data: todayOrders, error: todayError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today);
    
    if (!todayError) {
        document.getElementById('todayOrders').textContent = todayOrders.length;
        
        const revenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        document.getElementById('todayRevenue').textContent = '₨' + revenue.toLocaleString();
    }
    
    // Pending orders
    const { data: pendingOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Pending');
    
    document.getElementById('pendingOrders').textContent = pendingOrders?.length || 0;
    
    // Total menu items
    const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true);
    
    document.getElementById('totalItems').textContent = menuItems?.length || 0;
    
    // Load revenue chart
    loadRevenueChart();
}

// Load 7-day revenue chart with tooltip
async function loadRevenueChart() {
    const chartContainer = document.getElementById('revenueChart');
    
    if (!chartContainer) return;
    
    const days = [];
    const revenues = [];
    const orderCounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const { data: dayOrders } = await supabase
            .from('orders')
            .select('total')
            .gte('created_at', dateStr)
            .lt('created_at', dateStr + 'T23:59:59');
        
        const dayRevenue = dayOrders?.reduce((sum, o) => sum + parseFloat(o.total), 0) || 0;
        revenues.push(dayRevenue);
        orderCounts.push(dayOrders?.length || 0);
    }
    
    const maxRevenue = Math.max(...revenues, 1);
    
    chartContainer.innerHTML = days.map((day, i) => {
        const height = (revenues[i] / maxRevenue) * 150;
        const fullDate = new Date();
        fullDate.setDate(fullDate.getDate() - (6 - i));
        const dateLabel = fullDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        return `
            <div class="chart-bar-wrapper" style="position:relative;cursor:pointer;">
                <div class="chart-bar" 
                     style="height:${Math.max(height, 4)}px;position:relative;"
                     onmouseenter="showChartTooltip(this, '${dateLabel}', ${revenues[i]}, ${orderCounts[i]})"
                     onmouseleave="hideChartTooltip()">
                </div>
                <span class="chart-label">${day}</span>
            </div>
        `;
    }).join('');
}

// Show chart tooltip on hover
window.showChartTooltip = function(element, date, revenue, orders) {
    hideChartTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'chartTooltip';
    tooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background: #2a1f1a;
        border: 1px solid #C49A5A;
        color: #ffffff;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.8rem;
        white-space: nowrap;
        z-index: 9999;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        text-align: center;
        pointer-events: none;
    `;
    
    tooltip.innerHTML = `
        <div style="font-weight:700;color:#C49A5A;margin-bottom:4px;">${date}</div>
        <div style="margin-bottom:2px;">Revenue: <strong>₨${revenue.toLocaleString()}</strong></div>
        <div>Orders: <strong>${orders}</strong></div>
    `;
    
    element.appendChild(tooltip);
};

// Hide chart tooltip
window.hideChartTooltip = function() {
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) tooltip.remove();
};

// Load all orders for admin
async function loadAllOrders() {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error loading orders:', error.message);
        return;
    }
    
    const tbody = document.getElementById('ordersTableBody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:#ffffff;">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const items = order.items || [];
        const itemsSummary = items.map(i => `${i.name} ×${i.qty}`).join(', ');
        
        let customerName = 'Unknown';
        if (order.user_id) {
            supabase
                .from('profiles')
                .select('full_name')
                .eq('id', order.user_id)
                .single()
                .then(({ data: profile }) => {
                    if (profile && profile.full_name) {
                        customerName = profile.full_name;
                    }
                });
        }
        
        return `
            <tr>
                <td style="color:#ffffff !important;">#${order.id}</td>
                <td style="color:#ffffff !important;">${customerName}</td>
                <td style="color:#ffffff !important; max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${itemsSummary}</td>
                <td style="color:#ffffff !important;">₨${parseFloat(order.total).toLocaleString()}</td>
                <td style="color:#ffffff !important;">${new Date(order.created_at).toLocaleString()}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

// Update order status
window.updateOrderStatus = async function(orderId, newStatus) {
    console.log('Updating order', orderId, 'to', newStatus);
    
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    
    if (error) {
        console.error('Status update failed:', error.message);
        showToast('Could not update status.', 'error');
        return;
    }
    
    showToast(`Order #${orderId} marked as ${newStatus}.`, 'success');
    loadAllOrders();
    loadDashboardStats();
};

// =============================================
// MENU MANAGEMENT FUNCTIONS
// =============================================

// Load menu items for management
async function loadMenuForAdmin() {
    console.log('Loading menu items...');
    
    const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Error loading menu:', error.message);
        return;
    }
    
    const tbody = document.getElementById('menuTableBody');
    
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:#ffffff;">No menu items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td style="color:#ffffff !important;">${item.id}</td>
            <td style="color:#ffffff !important; font-weight:600;">${item.name}</td>
            <td style="color:#ffffff !important;">${item.category}</td>
            <td style="color:#ffffff !important;">₨${parseFloat(item.price).toLocaleString()}</td>
            <td>
                <span style="color:#ffffff !important; font-weight:700; padding:6px 12px; border-radius:4px; display:inline-block; background:${item.available ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'} !important;">
                    ${item.available ? 'Available' : 'Unavailable'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm me-1" 
                        onclick="toggleItemAvailability(${item.id}, ${!item.available})" 
                        title="${item.available ? 'Mark Unavailable' : 'Mark Available'}"
                        style="color:#ffffff !important; border:1px solid #C49A5A !important; background:transparent !important; cursor:pointer !important; padding:6px 10px !important;">
                    <i class="bi bi-${item.available ? 'toggle-on' : 'toggle-off'}" 
                       style="color:${item.available ? '#10b981' : '#ef4444'} !important; font-size:1.2rem;"></i>
                </button>
                <button class="btn btn-sm" 
                        onclick="deleteMenuItem(${item.id})" 
                        title="Delete"
                        style="color:#ef4444 !important; border:1px solid #ef4444 !important; background:transparent !important; cursor:pointer !important; padding:6px 10px !important;">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    console.log('Menu items loaded:', items.length);
}

// Toggle item availability
window.toggleItemAvailability = async function(itemId, newStatus) {
    console.log('Toggling item', itemId, 'to available =', newStatus);
    
    const { error } = await supabase
        .from('menu_items')
        .update({ available: newStatus })
        .eq('id', itemId);
    
    if (error) {
        console.error('Toggle error:', error.message);
        showToast('Could not update availability: ' + error.message, 'error');
        return;
    }
    
    showToast('Item availability updated!', 'success');
    loadMenuForAdmin();
    loadDashboardStats();
};

// Add new menu item
window.addMenuItem = async function() {
    const name = document.getElementById('itemName').value.trim();
    const desc = document.getElementById('itemDesc').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value.trim();
    const available = document.getElementById('itemAvailable').checked;
    
    if (!name || !desc || !price || !category) {
        showToast('Please fill all required fields.', 'error');
        return;
    }
    
    const { error } = await supabase
        .from('menu_items')
        .insert([{
            name: name,
            description: desc,
            price: price,
            category: category,
            image_url: image || null,
            available: available
        }]);
    
    if (error) {
        showToast('Could not add item: ' + error.message, 'error');
        return;
    }
    
    showToast(`${name} added to menu!`, 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
    if (modal) modal.hide();
    
    document.getElementById('addItemForm').reset();
    
    loadMenuForAdmin();
    loadDashboardStats();
};

// Delete menu item
window.deleteMenuItem = async function(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
    
    if (error) {
        showToast('Could not delete item: ' + error.message, 'error');
        return;
    }
    
    showToast('Item deleted from menu.', 'warning');
    loadMenuForAdmin();
    loadDashboardStats();
};

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loading...');
    
    const isAdmin = await requireAdmin();
    
    if (!isAdmin) return;
    
    console.log('Admin verified — loading dashboard');
    
    if (document.getElementById('todayOrders')) {
        loadDashboardStats();
        loadAllOrders();
        
        setInterval(() => {
            loadDashboardStats();
            loadAllOrders();
        }, 30000);
    }
    
    if (document.getElementById('menuTableBody')) {
        loadMenuForAdmin();
    }
    
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', async function() {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }
    
    const channel = supabase
        .channel('admin-orders')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'orders' },
            () => {
                console.log('New order received');
                loadAllOrders();
                loadDashboardStats();
            }
        )
        .subscribe();
});

console.log('👨‍💼 Mizaara Admin Ready');