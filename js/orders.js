// =============================================
// MIZAARA - Orders Functions
// =============================================

let currentOrderFilter = 'all';

async function loadOrders() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
    
    if (currentOrderFilter !== 'all') {
        query = query.eq('status', currentOrderFilter);
    }
    
    const { data: orders, error } = await query;
    
    if (error) {
        console.error('Error loading orders:', error.message);
        return;
    }
    
    console.log('📋 Orders fetched:', orders);
    renderOrders(orders || []);
}

function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    const emptyState = document.getElementById('ordersEmpty');
    const loading = document.getElementById('ordersLoading');
    
    if (loading) loading.style.display = 'none';
    
    if (!orders || orders.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        if (container) container.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.classList.add('d-none');
    
    container.innerHTML = orders.map(order => {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `<li>${item.name} × ${item.qty} — ₨${(item.price * item.qty).toLocaleString()}</li>`
        ).join('');
        
        const statusColors = {
            'Pending': '#f59e0b',
            'Preparing': '#3b82f6',
            'Ready': '#10b981'
        };
        const statusColor = statusColors[order.status] || '#6b5a4e';
        
        return `
            <div class="order-card" id="order-${order.id}">
                <div class="order-header">
                    <div>
                        <span class="order-id">Order #${order.id}</span><br>
                        <span class="order-date">${new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <span style="
                        padding:6px 16px;
                        border-radius:20px;
                        font-weight:700;
                        font-size:0.85rem;
                        background:${statusColor}20;
                        color:${statusColor};
                        border:1px solid ${statusColor}50;
                    ">${order.status}</span>
                </div>
                <ul class="order-items-list">
                    ${itemsList}
                </ul>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="order-total">Total: ₨${parseFloat(order.total).toLocaleString()}</span>
                    <button class="btn btn-outline-custom btn-sm" onclick="printReceipt(${order.id})">
                        <i class="bi bi-printer me-1"></i> Receipt
                    </button>
                </div>
                ${generateTimeline(order.status)}
            </div>
        `;
    }).join('');
}

function generateTimeline(status) {
    const steps = ['Pending', 'Preparing', 'Ready'];
    const currentIndex = steps.indexOf(status);
    
    let timelineHTML = '<div class="order-timeline" style="display:flex;align-items:flex-start;width:100%;margin-top:25px;padding:0 5px;">';
    
    steps.forEach((step, index) => {
        let dotBg = '#e8ddd0';
        let dotColor = '#6b5a4e';
        let dotContent = index + 1;
        
        if (index < currentIndex) {
            dotBg = '#10b981';
            dotColor = '#ffffff';
            dotContent = '<i class="bi bi-check"></i>';
        } else if (index === currentIndex) {
            if (status === 'Ready') {
                dotBg = '#10b981';
                dotColor = '#ffffff';
                dotContent = '<i class="bi bi-check"></i>';
            } else {
                dotBg = '#f59e0b';
                dotColor = '#ffffff';
                dotContent = index + 1;
            }
        }
        
        let labelColor = '#6b5a4e';
        let labelWeight = '400';
        if (index < currentIndex) {
            labelColor = '#10b981';
            labelWeight = '700';
        } else if (index === currentIndex) {
            labelColor = status === 'Ready' ? '#10b981' : '#f59e0b';
            labelWeight = '700';
        }
        
        timelineHTML += `
            <div style="flex:1;text-align:center;min-width:0;">
                <div style="
                    width:32px;height:32px;border-radius:50%;
                    background:${dotBg};
                    color:${dotColor};
                    display:inline-flex;align-items:center;justify-content:center;
                    font-size:0.85rem;font-weight:700;
                    border:3px solid #ffffff;
                    box-shadow:0 0 0 2px ${dotBg};
                    position:relative;z-index:2;
                ">
                    ${dotContent}
                </div>
                <div style="
                    font-size:0.78rem;
                    color:${labelColor};
                    font-weight:${labelWeight};
                    margin-top:6px;
                    white-space:nowrap;
                ">${step}</div>
            </div>
        `;
        
        if (index < steps.length - 1) {
            let lineColor = '#e8ddd0';
            if (index < currentIndex) {
                lineColor = '#10b981';
            }
            timelineHTML += `
                <div style="
                    flex:1;height:3px;
                    background:${lineColor};
                    margin-top:15px;
                    position:relative;z-index:1;
                    border-radius:2px;
                    min-width:20px;
                "></div>
            `;
        }
    });
    
    timelineHTML += '</div>';
    return timelineHTML;
}

// Order Filters
window.filterOrders = function(filter) {
    currentOrderFilter = filter;
    
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) btn.classList.add('active');
    });
    
    loadOrders();
};

// Print Receipt
window.printReceipt = function(orderId) {
    const orderCard = document.getElementById('order-' + orderId);
    
    if (!orderCard) {
        alert('Order not found.');
        return;
    }
    
    const orderID = orderCard.querySelector('.order-id')?.textContent || '';
    const orderDate = orderCard.querySelector('.order-date')?.textContent || '';
    const statusBadge = orderCard.querySelector('[style*="border-radius:20px"]');
    const orderStatus = statusBadge ? statusBadge.textContent.trim() : '';
    const totalText = orderCard.querySelector('.order-total')?.textContent || '';
    
    const itemsList = orderCard.querySelectorAll('.order-items-list li');
    const items = [];
    itemsList.forEach(li => {
        items.push(li.textContent.trim());
    });
    
    const statusColors = {
        'Pending': '#f59e0b',
        'Preparing': '#3b82f6',
        'Ready': '#10b981'
    };
    const statusColor = statusColors[orderStatus] || '#6b5a4e';
    
    const itemsHTML = items.map(item => `<li>${item}</li>`).join('');
    
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mizaara Receipt</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 30px; color: #241A17; max-width: 500px; margin: 0 auto; background: #fff; }
                .header { text-align: center; border-bottom: 2px dashed #C49A5A; padding-bottom: 15px; margin-bottom: 20px; }
                .header h2 { color: #7A2E2E; margin-bottom: 5px; font-size: 1.8rem; }
                .header p { color: #C49A5A; margin: 0; font-size: 0.9rem; }
                .info { margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .label { color: #6b5a4e; font-size: 0.8rem; }
                .value { font-weight: bold; font-size: 0.9rem; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}50; }
                .items-title { color: #6b5a4e; font-size: 0.8rem; margin-bottom: 8px; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; }
                .items { list-style: none; padding: 0; margin-bottom: 20px; }
                .items li { margin: 8px 0; font-size: 0.9rem; padding: 6px 0; border-bottom: 1px solid #f0e8e0; }
                .total { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #7A2E2E; padding-top: 12px; }
                .total-label { font-weight: bold; font-size: 1rem; }
                .total-value { font-weight: bold; font-size: 1.2rem; color: #7A2E2E; }
                .footer { text-align: center; margin-top: 30px; color: #8a7a6e; font-size: 0.8rem; border-top: 1px dashed #e8ddd0; padding-top: 15px; }
                .print-btn { display: block; width: 100%; background: #7A2E2E; color: white; border: none; padding: 14px; font-size: 1rem; cursor: pointer; border-radius: 6px; margin-top: 20px; font-weight: 600; }
                .print-btn:hover { background: #8e3838; }
                @media print { .print-btn { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🍽️ Mizaara</h2>
                <p>Where Every Flavor Meets</p>
            </div>
            <div class="info">
                <div class="row"><span class="label">Order Number</span><span class="value">${orderID}</span></div>
                <div class="row"><span class="label">Date</span><span class="value">${orderDate}</span></div>
                <div class="row"><span class="label">Status</span><span class="badge">${orderStatus}</span></div>
            </div>
            <div class="items-title">ORDER ITEMS</div>
            <ul class="items">${itemsHTML}</ul>
            <div class="total">
                <span class="total-label">TOTAL</span>
                <span class="total-value">${totalText}</span>
            </div>
            <div class="footer">
                <p>Thank you for dining with Mizaara!</p>
                <p>123 Food Street, Gulberg, Lahore</p>
                <p>+92 300 1234567 | info@mizaara.pk</p>
            </div>
            <button class="print-btn" onclick="window.print()">Print Receipt</button>
        </body>
        </html>
    `);
    
    printWindow.document.close();
};

if (document.getElementById('ordersList')) {
    loadOrders();
}

console.log('📋 Mizaara Orders Ready');