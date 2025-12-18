// Authentication functionality with MongoDB backend
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.backendUrl = 'https://backend-production-c281a.up.railway.app'; // Your Railway URL
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        this.updateNavbar();
        
        // Setup form event listeners if on login/signup pages
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        // Reset password form
        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener('submit', (e) => this.handleResetPassword(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        
        if (!email || !password) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        const originalText = loginBtn.textContent;
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                // Save user data
                this.currentUser = {
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    address: data.user.address,
                    createdAt: data.user.createdAt,
                    token: data.token // JWT token for future requests
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('authToken', data.token); // Store token separately
                
                this.updateNavbar();
                this.showAlert(`Welcome back, ${data.user.name}!`, 'success');
                
                // Check for redirect URL
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                
                // Delay redirect slightly for better UX
                setTimeout(() => {
                    window.location.href = redirectUrl || 'index.html';
                }, 1000);
                
            } else {
                this.showAlert(data.message || 'Invalid email or password', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Network error. Please try again.', 'error');
            
            // Fallback to localStorage if backend is down
            this.fallbackToLocalLogin(email, password);
            
        } finally {
            // Restore button state
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
        }
    }

    // Fallback method if backend is down
    fallbackToLocalLogin(email, password) {
        console.log('Trying local storage fallback...');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateNavbar();
            this.showAlert('Logged in (offline mode)', 'warning');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim().toLowerCase();
        const phone = document.getElementById('signupPhone').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Address fields
        const addressLine1 = document.getElementById('addressLine1').value.trim();
        const addressLine2 = document.getElementById('addressLine2').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        const country = document.getElementById('country').value.trim() || 'India';
        const landmark = document.getElementById('landmark').value.trim();

        // Validation
        const errors = [];
        if (!name) errors.push('Name is required');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
        if (!phone || !/^\d{10}$/.test(phone)) errors.push('Valid 10-digit phone number is required');
        if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
        if (password !== confirmPassword) errors.push('Passwords do not match');
        if (!addressLine1) errors.push('Address line 1 is required');
        if (!city) errors.push('City is required');
        if (!state) errors.push('State is required');
        if (!pincode || !/^\d{6}$/.test(pincode)) errors.push('Valid 6-digit PIN code is required');

        if (errors.length > 0) {
            this.showAlert(errors.join('<br>'), 'error');
            return;
        }

        const signupBtn = document.querySelector('#signupForm button[type="submit"]');
        const originalText = signupBtn.textContent;
        signupBtn.disabled = true;
        signupBtn.textContent = 'Creating account...';
        
        try {
            // Create address object
            const address = {
                line1: addressLine1,
                line2: addressLine2,
                city: city,
                state: state,
                pincode: pincode,
                country: country,
                landmark: landmark,
                type: 'home',
                isDefault: true
            };

            const response = await fetch(`${this.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    address
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Auto login after successful signup
                this.currentUser = {
                    _id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone,
                    address: data.user.address,
                    createdAt: data.user.createdAt,
                    token: data.token
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('authToken', data.token);
                
                this.updateNavbar();
                this.showAlert(`Welcome to MyBrand, ${name}! Your account has been created successfully.`, 'success');
                
                // Send welcome email via backend
                this.sendWelcomeEmail(email, name);
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } else {
                this.showAlert(data.message || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showAlert('Network error. Please try again.', 'error');
            
            // Fallback to localStorage signup
            this.fallbackToLocalSignup(name, email, phone, password, address);
            
        } finally {
            signupBtn.disabled = false;
            signupBtn.textContent = originalText;
        }
    }

    // Fallback to localStorage if backend is down
    fallbackToLocalSignup(name, email, phone, password, address) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            this.showAlert('User with this email already exists', 'error');
            return;
        }

        const newUser = {
            name,
            email,
            phone,
            password, // Note: In production, never store plain passwords
            address,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = {
            name,
            email,
            phone,
            address,
            createdAt: newUser.createdAt
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateNavbar();
        
        this.showAlert(`Account created (offline mode). Data will sync when online.`, 'warning');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Send welcome email via backend
    async sendWelcomeEmail(email, name) {
        try {
            await fetch(`${this.backendUrl}/api/emails/send-welcome`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }

    // Forgot password functionality
    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
        const forgotBtn = document.querySelector('#forgotPasswordForm button[type="submit"]');
        
        if (!email) {
            this.showAlert('Please enter your email address', 'error');
            return;
        }

        const originalText = forgotBtn.textContent;
        forgotBtn.disabled = true;
        forgotBtn.textContent = 'Sending reset link...';
        
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Password reset link sent to your email!', 'success');
                // Clear form
                document.getElementById('forgotEmail').value = '';
                
                // Show check email message
                const form = document.getElementById('forgotPasswordForm');
                form.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h3>✅ Check Your Email</h3>
                        <p>We've sent a password reset link to <strong>${email}</strong></p>
                        <p>Click the link in the email to reset your password.</p>
                        <button type="button" class="btn" onclick="window.location.reload()">Back to Login</button>
                    </div>
                `;
                
            } else {
                this.showAlert(data.message || 'Failed to send reset link', 'error');
            }
            
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showAlert('Network error. Please try again.', 'error');
        } finally {
            forgotBtn.disabled = false;
            forgotBtn.textContent = originalText;
        }
    }

    // Reset password (when user clicks email link)
    async handleResetPassword(e) {
        e.preventDefault();
        
        const password = document.getElementById('resetPassword').value;
        const confirmPassword = document.getElementById('confirmResetPassword').value;
        const token = new URLSearchParams(window.location.search).get('token');
        const resetBtn = document.querySelector('#resetPasswordForm button[type="submit"]');
        
        if (!token) {
            this.showAlert('Invalid reset link', 'error');
            return;
        }

        if (!password || password.length < 6) {
            this.showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match', 'error');
            return;
        }

        const originalText = resetBtn.textContent;
        resetBtn.disabled = true;
        resetBtn.textContent = 'Resetting password...';
        
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert('Password reset successful! You can now login with your new password.', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } else {
                this.showAlert(data.message || 'Failed to reset password', 'error');
            }
            
        } catch (error) {
            console.error('Reset password error:', error);
            this.showAlert('Network error. Please try again.', 'error');
        } finally {
            resetBtn.disabled = false;
            resetBtn.textContent = originalText;
        }
    }

    logout() {
        // Clear all auth data
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('pendingOrders'); // Optional: clear pending orders
        
        this.updateNavbar();
        this.showAlert('Logged out successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    updateNavbar() {
        const authLink = document.getElementById('authLink');
        const profileNavItem = document.getElementById('profileNavItem');
        const profileLink = document.querySelector('a[href="profile.html"]');
        
        if (!authLink) return;

        if (this.currentUser) {
            // User is logged in
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
            
            // Show profile link
            if (profileNavItem) {
                profileNavItem.style.display = 'list-item';
            }
            
            if (profileLink && window.location.pathname.includes('profile.html')) {
                profileLink.classList.add('active');
            }
        } else {
            // User is not logged in
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
            authLink.onclick = null;
            
            // Hide profile link
            if (profileNavItem) {
                profileNavItem.style.display = 'none';
            }
            
            if (profileLink) {
                profileLink.classList.remove('active');
            }
        }
    }

    // Check if user is logged in (for protected pages)
    requireAuth(redirectTo = 'login.html') {
        if (!this.currentUser) {
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = `${redirectTo}?redirect=${currentPage}`;
            return false;
        }
        return true;
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    // Show notification alerts
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.auth-alert');
        if (existingAlert) existingAlert.remove();
        
        const alert = document.createElement('div');
        alert.className = `auth-alert auth-alert-${type}`;
        alert.innerHTML = message;
        
        // Add styles if not already present
        if (!document.querySelector('#auth-alert-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-alert-styles';
            style.textContent = `
                .auth-alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .auth-alert-success { background: #28a745; }
                .auth-alert-error { background: #dc3545; }
                .auth-alert-warning { background: #ffc107; color: #333; }
                .auth-alert-info { background: #17a2b8; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getUser() {
        return this.currentUser;
    }

    getUserAddress() {
        return this.currentUser ? this.currentUser.address : null;
    }
}

// Initialize auth system when page loads
// Initialize auth system when page loads
let authSystem;
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
    window.authSystem = authSystem; // ← ADD THIS LINE INSIDE
    
    // Check for password reset token
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token') && window.location.pathname.includes('reset-password.html')) {
        // Pre-fill token in hidden field if exists
        const tokenField = document.getElementById('resetToken');
        if (tokenField) {
            tokenField.value = urlParams.get('token');
        }
    }
});

// ALSO make the class globally available
window.AuthSystem = AuthSystem;
