// =============================================
// MIZAARA - Authentication Functions
// =============================================

// Check current session on page load
async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        updateAuthUI(session.user);
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        
        if (profile && profile.role === 'admin') {
            window.location.href = 'admin.html';
            return;
        }
    }
    
    setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader) loader.classList.add('hidden');
    }, 500);
}

// Update UI based on auth state
function updateAuthUI(user) {
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (authBtn && user) {
        authBtn.innerHTML = `<i class="bi bi-person-check"></i> ${user.email.split('@')[0]}`;
        authBtn.href = 'orders.html';
    }
    
    if (logoutBtn) {
        logoutBtn.classList.remove('d-none');
    }
}

// Login handler
async function handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) {
        showAuthError('login', error.message);
        return false;
    }
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
    
    if (profile && profile.role === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'index.html';
    }
    
    return true;
}

// Register handler
async function handleRegister(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: name }
        }
    });
    
    if (error) {
        showAuthError('register', error.message);
        return false;
    }
    
    const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
            id: data.user.id, 
            full_name: name, 
            role: 'customer' 
        }]);
    
    if (profileError) {
        console.error('Profile creation failed:', profileError.message);
    }
    
    showToast('Registration successful! Please login.', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
    
    return true;
}

// Logout handler
async function handleLogout() {
    await supabase.auth.signOut();
    sessionStorage.removeItem('mizaara_cart');
    window.location.href = 'login.html';
}

// Show auth error
function showAuthError(type, message) {
    const errorDiv = document.getElementById(type === 'login' ? 'authError' : 'registerError');
    const errorSpan = document.getElementById(type === 'login' ? 'authErrorMessage' : 'registerErrorMessage');
    
    if (errorDiv && errorSpan) {
        errorDiv.classList.remove('d-none');
        errorSpan.textContent = message;
    }
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
    
    toast.innerHTML = `<span style="color:#10b981;font-weight:700;">✓</span> ${message}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Add animation
const toastStyle = document.createElement('style');
toastStyle.textContent = '@keyframes slideInToast { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
document.head.appendChild(toastStyle);

// =============================================
// PAGE-SPECIFIC EVENT LISTENERS
// =============================================

// Login page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        const btn = document.getElementById('loginBtn');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Logging in...';
        btn.disabled = true;
        
        await handleLogin(email, password);
        
        btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i> Login';
        btn.disabled = false;
    });
    
    document.getElementById('togglePassword')?.addEventListener('click', function() {
        const input = document.getElementById('loginPassword');
        const icon = this.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'bi bi-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'bi bi-eye';
        }
    });
}

// Register page
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (password !== confirm) {
            showAuthError('register', 'Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            showAuthError('register', 'Password must be at least 6 characters.');
            return;
        }
        
        const btn = document.getElementById('registerBtn');
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Registering...';
        btn.disabled = true;
        
        await handleRegister(name, email, password);
        
        btn.innerHTML = '<i class="bi bi-person-plus me-2"></i> Register';
        btn.disabled = false;
    });
}

// Logout buttons - FIXED
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', handleLogout);
    }
});

// Check session on load
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    checkSession();
}

console.log('🔐 Mizaara Auth Ready');