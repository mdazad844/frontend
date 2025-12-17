
// Authentication functionality - works across all pages
class AuthSystem {
    constructor() {
        this.currentUser = null;
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
    }

    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Check if user exists
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
            
            // Redirect to home page
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Address fields
        const addressLine1 = document.getElementById('addressLine1').value;
        const addressLine2 = document.getElementById('addressLine2').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value;
        const country = document.getElementById('country').value;
        const landmark = document.getElementById('landmark').value;

        // Validation
        if (!name || !email || !phone || !password || !confirmPassword || 
            !addressLine1 || !city || !state || !pincode) {
            alert('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        if (!/^\d{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit PIN code');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            alert('User with this email already exists');
            return;
        }

        // Create address object
        const address = {
            line1: addressLine1,
            line2: addressLine2,
            city: city,
            state: state,
            pincode: pincode,
            country: country,
            landmark: landmark
        };

        // Create new user
        const newUser = {
            name: name,
            email: email,
            phone: phone,
            password: password,
            address: address,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto login after signup
        this.currentUser = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            createdAt: newUser.createdAt
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.updateNavbar();
        alert(`Welcome to MyBrand, ${name}! Your account has been created successfully.`);
        window.location.href = 'index.html';
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavbar();
        window.location.href = 'index.html';
    }

    updateNavbar() {
        console.log('=== updateNavbar DEBUG ===');
        console.log('Current user:', this.currentUser);
        
        const authLink = document.getElementById('authLink');
        const profileNavItem = document.getElementById('profileNavItem');
        const profileLink = document.querySelector('a[href="profile.html"]');
        
        console.log('Auth link found:', !!authLink);
        console.log('Profile nav item found:', !!profileNavItem);
        console.log('Profile link found:', !!profileLink);
        
        if (!authLink) {
            console.log('No auth link found, returning early');
            return;
        }

        if (this.currentUser) {
            console.log('User is logged in, showing Profile and Logout');
            // User is logged in - show Logout and show Profile link
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
            
            // Show profile link
            if (profileNavItem) {
                console.log('Setting profile nav item to display: list-item');
                profileNavItem.style.display = 'list-item';
            } else {
                console.log('Profile nav item NOT found!');
            }
            
            // Show profile link as active if we're on profile page
            if (profileLink && window.location.pathname.includes('profile.html')) {
                profileLink.classList.add('active');
            }
        } else {
            console.log('User is NOT logged in, hiding Profile and showing Login');
            // User is not logged in - show Login and hide Profile link
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
            authLink.onclick = null;
            
            // Hide profile link
            if (profileNavItem) {
                console.log('Setting profile nav item to display: none');
                profileNavItem.style.display = 'none';
            }
            
            // Remove active class from profile link
            if (profileLink) {
                profileLink.classList.remove('active');
            }
        }
        
        console.log('=== END DEBUG ===');
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
let authSystem;
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
});
