// In script.js - At the VERY TOP - SINGLE SOURCE OF TRUTH
const API_BASE_URL = 'https://myshop-production-63f9.up.railway.app/api';

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Set authentication token
function setAuthToken(token) {
    localStorage.setItem('token', token);
}

// In script.js - At the VERY TOP - SINGLE SOURCE OF TRUTH
const AppState = {
    cart: [],
    wishlist: [],
    user: null,
    orders: [],
    
    // Cart methods
    updateCart(newCart) {
        this.cart = newCart;
        this.saveCart();
    },
    
    getCart() {
        return [...this.cart];
    },
    
    // Wishlist methods
    updateWishlist(newWishlist) {
        this.wishlist = newWishlist;
        this.saveWishlist();
    },
    
    getWishlist() {
        return [...this.wishlist];
    },
    
    // User methods
    setUser(userData) {
        this.user = userData;
        this.saveUser();
    },
    
    updateUserProfile(updates) {
        if (this.user) {
            this.user = { ...this.user, ...updates };
            this.saveUser();
        }
    },
    
    // Order methods
    addOrder(newOrder) {
        this.orders.unshift(newOrder);
        this.saveOrders();
    },
    
    getOrders() {
        return [...this.orders];
    },
    
    // Save methods with cross-page sync
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    },
    
    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    },
    
    saveUser() {
        localStorage.setItem('currentUser', JSON.stringify(this.user));
    },
    
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
        window.dispatchEvent(new Event('storage'));
    },
    
    // Load methods
    loadCart() {
        try {
            const savedCart = localStorage.getItem('cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
            // Ensure data consistency
            this.cart = this.cart.map(item => ({
                ...item,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1
            }));
        } catch (error) {
            console.error('Error loading cart:', error);
            this.cart = [];
        }
    },
    
    loadWishlist() {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            this.wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error('Error loading wishlist:', error);
            this.wishlist = [];
        }
    },
    
    loadUser() {
        try {
            const savedUser = localStorage.getItem('currentUser');
            this.user = savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error loading user:', error);
            this.user = null;
        }
    },
    
    loadOrders() {
        try {
            const savedOrders = localStorage.getItem('orders');
            this.orders = savedOrders ? JSON.parse(savedOrders) : [];
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
        }
    }
};

/* MOBILE MENU TOGGLE */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') && 
        !e.target.closest('.nav-links') && 
        !e.target.closest('#menuToggle')) {
        navLinks.classList.remove('active');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) {
            navLinks.classList.remove('active');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

//Products array
const products = [
    {
      id: 1,
        name: "Classic White Hoodie",
       price: 999,
        image: "images/product1.jpg",
        category: "men"
   },
    {
        id: 2,
       name: "Black Oversized T-Shirt",
       price: 699,
        image: "images/product2.jpg",
        category: "men"
   }
    // Add other products as needed
];

/* PRODUCTS API INTEGRATION */
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (response.ok) {
            return data.products;
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
        return [];
    }
}

async function displayProducts() {
    try {
        console.log('🔄 Loading products from API...');
        const products = await loadProducts();
        const productGrid = document.querySelector('.product-grid');
        
        if (!productGrid) {
            console.log('❌ No product grid found on this page');
            return;
        }
        
        console.log(`📦 Loaded ${products.length} products`);
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='images/placeholder.png'">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                ${product.originalPrice ? `<p class="original-price" style="text-decoration: line-through; color: #666; font-size: 0.9em;">₹${product.originalPrice}</p>` : ''}
				
				
				
                <button class="btn" onclick="addToCart('${product.name}', ${product.price}, '${product.images[0]}')" data-product-id="${product.id}">
                    Add to Cart
                </button>
				
				




				
				
				
                <button class="wishlist-btn" 
                        onclick="addToWishlist(${product.id}, '${product.name}', ${product.price}, '${product.images[0]}')"
                        data-product-id="${product.id}">
                    🤍
                </button>
            </div>
        `).join('');
        
        // Update wishlist heart colors
        updateWishlistHearts();
        
        console.log('✅ Products displayed successfully');
        
    } catch (error) {
        console.error('❌ Error displaying products:', error);
    }
}

/* CORE CART FUNCTIONALITY */
function loadCart() {
    AppState.loadCart();
    updateCartCount();
}

function updateCartCount() {
    try {
        const cart = AppState.getCart();
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        const cartCountSelectors = [
            '.cart-count',
            '#cartCount',
            '[class*="cart"] [class*="count"]',
            '.nav-links .cart-count',
            'header .cart-count',
            'nav .cart-count'
        ];
        
        let cartCountElements = [];
        
        cartCountSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!cartCountElements.includes(element)) {
                    cartCountElements.push(element);
                }
            });
        });
        
        cartCountElements.forEach(element => {
            if (element && typeof element.textContent !== 'undefined') {
                element.textContent = totalItems;
                
                if (totalItems > 0) {
                    element.style.display = 'inline-block';
                    element.style.visibility = 'visible';
                    element.classList.add('has-items');
                } else {
                    element.style.display = 'none';
                    element.classList.remove('has-items');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating cart count:', error);
    }
}

function addToCart(productName, productPrice, productImage, productSize = '', productColor = '', productId = null) {
    console.log('🛒 addToCart called from page:', window.location.pathname);
    console.log('Product ID passed:', productId);
    
    try {
        const price = parseFloat(productPrice);
        if (isNaN(price) || price <= 0) {
            console.error('❌ Invalid product price:', productPrice);
            showNotification('Error: Invalid product price', 'error');
            return false;
        }

        if (!productName || !productName.trim()) {
            console.error('❌ Invalid product name');
            showNotification('Error: Invalid product name', 'error');
            return false;
        }

        const cart = AppState.getCart();
        const itemIdentifier = `${productName}-${productSize}-${productColor}`.toLowerCase();

        const existingItemIndex = cart.findIndex(item => {
            const existingIdentifier = `${item.name}-${item.size || ''}-${item.color || ''}`.toLowerCase();
            return existingIdentifier === itemIdentifier;
        });

        if (existingItemIndex !== -1) {
            // Item exists, increase quantity
            cart[existingItemIndex].quantity += 1;
            
            // Update bulk price if needed
            if (productId) {
                cart[existingItemIndex].productId = productId;
                updatePriceForQuantity(cart[existingItemIndex]);
            }
            
            console.log('📦 Increased quantity for existing item');
        } else {
            // Add new item
            const newItem = {
                id: Date.now() + Math.random(),
                productId: productId, // Store productId for bulk pricing
                name: productName.toString().trim(),
                price: price,
                image: productImage || 'images/placeholder.png',
                quantity: 1,
                size: productSize,
                color: productColor,
                addedAt: new Date().toISOString()
            };
            cart.push(newItem);
            console.log('📦 Added new item to cart:', newItem);
        }
        
        AppState.updateCart(cart);
        showNotification(`✅ "${productName}" added to cart!`, 'success');
        animateCartIcon();
        return true;
        
    } catch (error) {
        console.error('❌ Error in addToCart:', error);
        showNotification('Error adding item to cart', 'error');
        return false;
    }
}


function updatePriceForQuantity(item) {
    console.log('🔍 Checking bulk pricing for:', item.name, 'Qty:', item.quantity);
    
    // Check if we have productId to look up bulk pricing
    if (item.productId && typeof productDatabase !== 'undefined' && productDatabase[item.productId]) {
        const product = productDatabase[item.productId];
        
        // Check if product has bulk pricing tiers
        if (product.pricingTiers && Array.isArray(product.pricingTiers)) {
            const totalQuantity = item.quantity;
            
            console.log('📊 Product has pricing tiers:', product.pricingTiers);
            
            // Find the correct price for this quantity
            for (const tier of product.pricingTiers) {
                if (totalQuantity >= tier.min && totalQuantity <= tier.max) {
                    const oldPrice = item.price;
                    const newPrice = tier.price;
                    
                    // Only update if price has changed
                    if (oldPrice !== newPrice) {
                        item.price = newPrice;
                        console.log(`💰 Updated price: ${totalQuantity} pieces = ₹${newPrice} each (was ₹${oldPrice})`);
                        return true;
                    }
                    return false;
                }
            }
        } else {
            console.log('ℹ️ Product does not have pricing tiers');
        }
    } else {
        console.log('ℹ️ No productId or product database not available');
    }
    return false;
}




/* CORE WISHLIST FUNCTIONALITY */
function loadWishlist() {
    AppState.loadWishlist();
    updateWishlistCount();
}

function updateWishlistCount() {
    try {
        const wishlist = AppState.getWishlist();
        const wishlistCount = wishlist.length;
        
        const wishlistCountSelectors = [
            '.wishlist-count',
            '#wishlistCount',
            '[class*="wishlist"] [class*="count"]',
            '.nav-links .wishlist-count',
            'header .wishlist-count',
            'nav .wishlist-count'
        ];
        
        let wishlistCountElements = [];
        
        wishlistCountSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!wishlistCountElements.includes(element)) {
                    wishlistCountElements.push(element);
                }
            });
        });
        
        wishlistCountElements.forEach(element => {
            if (element && typeof element.textContent !== 'undefined') {
                element.textContent = wishlistCount;
                
                if (wishlistCount > 0) {
                    element.style.display = 'inline-block';
                    element.style.visibility = 'visible';
                    element.classList.add('has-items');
                } else {
                    element.style.display = 'none';
                    element.classList.remove('has-items');
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating wishlist count:', error);
    }
}

function addToWishlist(productId, productName, productPrice, productImage) {
    console.log('❤️ addToWishlist called from page:', window.location.pathname);
    
    try {
        const wishlist = AppState.getWishlist();
        const existingItemIndex = wishlist.findIndex(item => item.id === productId);
        
        if (existingItemIndex === -1) {
            // Add to wishlist
            wishlist.push({
                id: productId,
                name: productName,
                price: Number(productPrice) || 0,
                image: productImage || 'images/placeholder.png',
                addedAt: new Date().toISOString()
            });
            AppState.updateWishlist(wishlist);
            showNotification(`❤️ "${productName}" added to wishlist!`, 'success');
            animateWishlistIcon();
			
				
			if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
    updateWishlistCount();
			
            return true;
		

			
        } else {
            // Remove from wishlist
            wishlist.splice(existingItemIndex, 1);
            AppState.updateWishlist(wishlist);
            showNotification(`💔 "${productName}" removed from wishlist!`, 'info');
			
			if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
    updateWishlistCount();
			
            return false;
			
			
        }
        
    } catch (error) {
        console.error('❌ Error in addToWishlist:', error);
        showNotification('Error updating wishlist', 'error');
        return false;
    }
}



/* CROSS-PAGE SYNCHRONIZATION SYSTEM */
window.addEventListener('storage', function(e) {
    if (e.key === 'cart') {
        console.log('🔄 Cart storage event detected');
        loadCart();
    }
    if (e.key === 'wishlist') {
        console.log('❤️ Wishlist storage event detected');
        loadWishlist();
    }
});

window.addEventListener('cartUpdated', function(e) {
    console.log('🔄 Cart custom event received');
    updateCartCount();
});

window.addEventListener('wishlistUpdated', function(e) {
    console.log('❤️ Wishlist custom event received');
    updateWishlistCount();
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('📄 Page became visible, syncing...');
        loadCart();
        loadWishlist();
    }
});

window.addEventListener('focus', function() {
    console.log('🎯 Page focused, syncing...');
    loadCart();
    loadWishlist();
});

/* NOTIFICATION SYSTEM */
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

function animateCartIcon() {
    const cartIcons = document.querySelectorAll('.cart-count, #cartCount');
    cartIcons.forEach(icon => {
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 300);
    });
}

function animateWishlistIcon() {
    const wishlistIcons = document.querySelectorAll('.wishlist-count, #wishlistCount');
    wishlistIcons.forEach(icon => {
        icon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            icon.style.transform = 'scale(1)';
        }, 300);
    });
}

/* CART PAGE SPECIFIC FUNCTIONS */
function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    
    try {
        const cart = AppState.getCart();
        cartContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="btn">Continue Shopping</a>
                </div>
            `;
            updateCartTotal();
            return;
        }
        
        cart.forEach((item, index) => {
            // ============================================
            // ADD THIS LINE: Ensure price is correct for current quantity
            // ============================================
            updatePriceForQuantity(item);
            
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            const itemTotal = price * quantity;
            
            const sizeInfo = item.size ? `<p class="item-size">Size: ${item.size}</p>` : '';
            const colorInfo = item.color ? `<p class="item-color">Color: ${item.color}</p>` : '';
            
            // Add bulk pricing indicator if available
            const bulkInfo = (item.productId && productDatabase && productDatabase[item.productId] && 
                             productDatabase[item.productId].pricingTiers) ? 
                             '<span style="color: #28a745; font-size: 12px; margin-left: 5px;">(Bulk Pricing)</span>' : '';
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
                <div class="cart-info">
                    <h3>${item.name} ${bulkInfo}</h3>
                    ${sizeInfo}
                    ${colorInfo}
                    <p class="item-price">Price: ₹${price} ${quantity > 1 ? `× ${quantity} = ₹${itemTotal}` : ''}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
                    </div>
                    <p class="item-total">Item Total: ₹${itemTotal}</p>
                </div>
                <div class="cart-actions">
                    <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
                </div>
            `;
            cartContainer.appendChild(div);
        });
        
        updateCartTotal();
    } catch (error) {
        console.error('Error displaying cart items:', error);
        cartContainer.innerHTML = '<p>Error loading cart items</p>';
    }
}

// ====================================================
// ADD this test function for debugging
// ====================================================
window.testBulkPricing = function() {
    console.log('🧪 TESTING BULK PRICING SYSTEM');
    
    const cart = AppState.getCart();
    if (cart.length === 0) {
        console.log('Cart is empty. Add a product first.');
        return;
    }
    
    console.log('=== CART ITEMS ===');
    cart.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name}`);
        console.log(`   Quantity: ${item.quantity}`);
        console.log(`   Price: ₹${item.price}`);
        console.log(`   Product ID: ${item.productId || 'Not set'}`);
        
        if (item.productId && productDatabase && productDatabase[item.productId]) {
            const product = productDatabase[item.productId];
            console.log(`   Product in DB: ${product.name}`);
            
            if (product.pricingTiers) {
                console.log('   Pricing Tiers:', product.pricingTiers);
                
                // Find correct price for this quantity
                for (const tier of product.pricingTiers) {
                    if (item.quantity >= tier.min && item.quantity <= tier.max) {
                        console.log(`   ✅ CORRECT price for ${item.quantity} pieces: ₹${tier.price}`);
                        console.log(`   ${item.price === tier.price ? '✅ Price is correct!' : '❌ Price is WRONG!'}`);
                        break;
                    }
                }
            }
        }
        console.log('---');
    });
};
		
		
		
function decreaseQuantity(index) {
    const cart = AppState.getCart();
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            // Decrease quantity
            cart[index].quantity -= 1;
            
            console.log(`➖ Decreased quantity to ${cart[index].quantity} for:`, cart[index].name);
            
            // Update price based on new quantity (for bulk products)
            const priceUpdated = updatePriceForQuantity(cart[index]);
            
            if (priceUpdated) {
                console.log('✅ Price updated due to quantity change');
            }
            
            AppState.updateCart(cart);
            
            // Update UI if on cart page
            if (window.location.pathname.includes('cart.html')) {
                displayCartItems();
            }
        } else {
            removeItem(index);
        }
    }
}

function removeItem(index) {
    const cart = AppState.getCart();
    if (cart[index]) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        AppState.updateCart(cart);
        
        console.log('🛒 ONLINE: removeItem called for index:', index);
        console.log('📍 On cart page?', window.location.pathname.includes('cart.html'));
        
        // UPDATE UI IMMEDIATELY
        if (window.location.pathname.includes('/cart')) {
            console.log('🔄 Calling displayCartItems...');
            displayCartItems();
        } else {
            console.log('ℹ️ Not on cart page, skipping displayCartItems');
        }
        
        console.log('🔄 Calling updateCartCount...');
        updateCartCount();
        
        console.log('✅ Cart UI refresh completed');
        
        showNotification(`"${itemName}" removed from cart`, 'info');
    }
}

function removeFromWishlist(productId) {
    try {
        console.log('🔄 ONLINE: removeFromWishlist called for product:', productId);
        
        const wishlist = AppState.getWishlist();
        console.log('📦 Before removal - Wishlist items:', wishlist.length);
        
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        AppState.updateWishlist(updatedWishlist);
        
        console.log('📦 After removal - Wishlist items:', updatedWishlist.length);
        console.log('📍 Current page:', window.location.pathname);
        console.log('📍 On wishlist page?', window.location.pathname.includes('wishlist.html'));
        
        // UPDATE UI IMMEDIATELY
        if (window.location.pathname.includes('/wishlist')) {
            console.log('🔄 Calling displayWishlistItems...');
            displayWishlistItems();
        } else {
            console.log('ℹ️ Not on wishlist page, skipping displayWishlistItems');
        }
        
        console.log('🔄 Calling updateWishlistCount...');
        updateWishlistCount();
        
        console.log('🔄 Calling updateWishlistHearts...');
        updateWishlistHearts();
        
        console.log('✅ ALL UI refresh functions called successfully');
        
        showNotification('Item removed from wishlist', 'info');
    } catch (error) {
        console.error('❌ Error in removeFromWishlist:', error);
        showNotification('Error removing item from wishlist', 'error');
    }
}

function updateCartTotal() {
    try {
        const cart = AppState.getCart();
        const total = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);
        
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `Total: ₹${total}`;
        }
    } catch (error) {
        console.error('Error updating cart total:', error);
    }
}

/* WISHLIST PAGE SPECIFIC FUNCTIONS */
function displayWishlistItems() {
    const wishlistContainer = document.getElementById('wishlist-items');
    if (!wishlistContainer) return;
    
    try {
        const wishlist = AppState.getWishlist();
        wishlistContainer.innerHTML = '';
        
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding items you love to your wishlist!</p>
                    <a href="shop.html" class="btn">Continue Shopping</a>
                </div>
            `;
            return;
        }
        
        wishlist.forEach(item => {
            const div = document.createElement('div');
            div.className = 'wishlist-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.png'">
                <div class="wishlist-info">
                    <h3>${item.name}</h3>
                    <p class="wishlist-price">₹${item.price}</p>
                    <div class="wishlist-actions">
                        <button class="btn-move-cart" onclick="moveToCartFromWishlist(${item.id})">
                            Add to Cart
                        </button>
                        <button class="btn-remove-wishlist" onclick="removeFromWishlist(${item.id})">
                            Remove
                        </button>
                    </div>
                </div>
            `;
            wishlistContainer.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error displaying wishlist items:', error);
        wishlistContainer.innerHTML = '<p>Error loading wishlist items</p>';
    }
}

function moveToCartFromWishlist(productId) {
    try {
        const wishlist = AppState.getWishlist();
        const item = wishlist.find(item => item.id === productId);
        
        if (item) {
            // Add to cart with CORRECT parameters
            addToCart(item.name, item.price, item.image);
            // Remove from wishlist
            removeFromWishlist(productId);
            
            // UPDATE BOTH UIs IMMEDIATELY
            if (window.location.pathname.includes('/wishlist')) {
                displayWishlistItems();
            }
            updateWishlistCount();
        }
    } catch (error) {
        console.error('Error moving item to cart:', error);
        showNotification('Error moving item to cart', 'error');
    }
}

/* WISHLIST HEART COLOR CONTROL */
function updateWishlistHearts() {
    try {
        const wishlist = AppState.getWishlist();
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            // Extract product info from onclick attribute
            const onclickContent = button.getAttribute('onclick');
            if (!onclickContent) return;
            
            // Parse the onclick content to get product ID
            const match = onclickContent.match(/addToWishlist\((\d+),/);
            if (!match) return;
            
            const productId = parseInt(match[1]);
            const isInWishlist = wishlist.some(item => item.id === productId);
            
            // Remove all possible active classes first
            button.classList.remove('active', 'added', 'in-wishlist', 'selected');
            
            // Add active class if product is in wishlist
            if (isInWishlist) {
                button.classList.add('active');
                button.innerHTML = '❤️'; // Red heart when in wishlist
                console.log(`❤️ Product ${productId} is in wishlist - red heart`);
            } else {
                button.innerHTML = '🤍'; // White heart when not in wishlist
                console.log(`🤍 Product ${productId} is not in wishlist - white heart`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating wishlist hearts:', error);
    }
}

/* ENHANCED ADD TO WISHLIST FUNCTION */
function addToWishlist(productId, productName, productPrice, productImage) {
    console.log('❤️ addToWishlist called for product:', productId);
    
    try {
        const wishlist = AppState.getWishlist();
        const existingItemIndex = wishlist.findIndex(item => item.id === productId);
        
        if (existingItemIndex === -1) {
            // Add to wishlist
            wishlist.push({
                id: productId,
                name: productName,
                price: Number(productPrice) || 0,
                image: productImage || 'images/placeholder.png',
                addedAt: new Date().toISOString()
            });
            AppState.updateWishlist(wishlist);
            showNotification(`❤️ "${productName}" added to wishlist!`, 'success');
            animateWishlistIcon();
            
            // Update heart color and emoji immediately
            updateWishlistButtonState(productId, true);
            return true;
        } else {
            // Remove from wishlist
            const removedItem = wishlist[existingItemIndex];
            wishlist.splice(existingItemIndex, 1);
            AppState.updateWishlist(wishlist);
            showNotification(`💔 "${productName}" removed from wishlist!`, 'info');
            
            // Update heart color and emoji immediately
            updateWishlistButtonState(productId, false);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error in addToWishlist:', error);
        showNotification('Error updating wishlist', 'error');
        return false;
    }
} 

/* UPDATE SINGLE WISHLIST BUTTON STATE */
function updateWishlistButtonState(productId, isInWishlist) {
    try {
        // Find all buttons for this product by checking their onclick attributes
        const allButtons = document.querySelectorAll('.wishlist-btn');
        const buttons = Array.from(allButtons).filter(button => {
            const onclickContent = button.getAttribute('onclick');
            if (!onclickContent) return false;
            const match = onclickContent.match(/addToWishlist\((\d+),/);
            return match && parseInt(match[1]) === productId;
        });
        
        buttons.forEach(button => {
            // Remove all possible active classes
            button.classList.remove('active', 'added', 'in-wishlist', 'selected');
            
            // Update class and emoji based on wishlist state
            if (isInWishlist) {
                button.classList.add('active');
                button.innerHTML = '❤️'; // Red heart
                console.log(`✅ Heart for product ${productId} turned red`);
            } else {
                button.innerHTML = '🤍'; // White heart
                console.log(`⚪ Heart for product ${productId} turned white`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating wishlist button state:', error);
    }
}

/* INITIALIZE WISHLIST BUTTONS */
function initializeWishlistButtons() {
    try {
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        console.log(`🔍 Found ${wishlistButtons.length} wishlist buttons to initialize`);
        
        wishlistButtons.forEach((button, index) => {
            // Extract product info from onclick attribute
            const onclickContent = button.getAttribute('onclick');
            if (!onclickContent) {
                console.warn('⚠️ Wishlist button missing onclick attribute:', button);
                return;
            }
            
            // Parse the product ID from onclick
            const match = onclickContent.match(/addToWishlist\((\d+),/);
            if (!match) {
                console.warn('⚠️ Could not parse product ID from onclick:', onclickContent);
                return;
            }
            
            const productId = parseInt(match[1]);
            console.log(`🔧 Initializing wishlist button for product ${productId}`);
            
            // We don't need to add click listeners since we're using inline onclick
            // Just make sure the heart color is correct
        });
        
        // Update all heart colors on page load
        updateWishlistHearts();
        
    } catch (error) {
        console.error('❌ Error initializing wishlist buttons:', error);
    }
}



/* UPDATE WISHLIST EVENT LISTENERS */
window.addEventListener('wishlistUpdated', function(e) {
    console.log('❤️ Wishlist custom event received');
    updateWishlistCount();
    updateWishlistHearts(); // Update heart colors when wishlist changes
});

// Update when storage changes (cross-tab sync)
window.addEventListener('storage', function(e) {
    if (e.key === 'wishlist') {
        console.log('❤️ Wishlist storage event detected');
        loadWishlist();
        updateWishlistHearts(); // Update heart colors on storage change
    }
});

// Update when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('📄 Page became visible, syncing wishlist hearts...');
        loadWishlist();
        updateWishlistHearts();
    }
});

// Update when page gains focus
window.addEventListener('focus', function() {
    console.log('🎯 Page focused, syncing wishlist hearts...');
    loadWishlist();
    updateWishlistHearts();
});



/* CHECKOUT FUNCTION - RESTORED */
function checkout() {
    try {
        const cart = AppState.getCart();
        
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Check if user is logged in
        const currentUser = AppState.user;
        if (!currentUser) {
            if (confirm('Please login to proceed with checkout. Redirect to login page?')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        // Check if user has address
        if (!currentUser.address) {
            if (confirm('Please add a delivery address in your profile before checkout. Go to profile?')) {
                window.location.href = 'profile.html';
            }
            return;
        }
        
        // Calculate total
        const total = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            return sum + (price * quantity);
        }, 0);
        
        // Show order summary
        const orderSummary = cart.map(item => {
            const sizeInfo = item.size ? `, Size: ${item.size}` : '';
            const colorInfo = item.color ? `, Color: ${item.color}` : '';
            return `• ${item.name} (Qty: ${item.quantity}${sizeInfo}${colorInfo}) - ₹${item.price * item.quantity}`;
        }).join('\n');
        
        const address = currentUser.address;
        const addressText = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} - ${address.pincode}`;
        
        // Confirm order
        const userConfirmed = confirm(`📦 ORDER SUMMARY\n\nItems:\n${orderSummary}\n\nDelivery Address:\n${addressText}\n\n💰 TOTAL: ₹${total}\n\nClick OK to proceed to checkout.`);
        
        if (userConfirmed) {
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        }
        
    } catch (error) {
        console.error('Error during checkout:', error);
        showNotification('Error during checkout process', 'error');
    }
}

/* INITIALIZE APP */
async function initializeApp() {
    console.log('🚀 Initializing MyBrand...');
    
    // Load all data
    AppState.loadCart();
    AppState.loadWishlist();
    AppState.loadUser();
    AppState.loadOrders();
    
    // Update UI
    updateCartCount();
    updateWishlistCount();
    
    // Initialize page-specific features
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
        
        // Add checkout button event listener
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', checkout);
        }
    }
    
    if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistItems();
    }
	

    console.log('✅ MyBrand initialized');
}

/* MAKE FUNCTIONS GLOBALLY AVAILABLE */
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.updateCartCount = updateCartCount;
window.updateWishlistCount = updateWishlistCount;
window.displayCartItems = displayCartItems;
window.displayWishlistItems = displayWishlistItems;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeItem = removeItem;
window.moveToCartFromWishlist = moveToCartFromWishlist;
window.checkout = checkout;


window.updateWishlistHearts = updateWishlistHearts;
window.initializeWishlistButtons = initializeWishlistButtons;
window.updateWishlistButtonState = updateWishlistButtonState;

// Debug functions
window.debugCart = function() {
    const cart = AppState.getCart();
    console.log('=== 🛒 CART DEBUG ===');
    console.log('Cart items:', cart);
    console.log('Total items:', cart.reduce((sum, item) => sum + item.quantity, 0));
    updateCartCount();
};

window.debugWishlist = function() {
    const wishlist = AppState.getWishlist();
    console.log('=== ❤️ WISHLIST DEBUG ===');
    console.log('Wishlist items:', wishlist);
    console.log('Total items:', wishlist.length);
    updateWishlistCount();
};

// INITIALIZE IMMEDIATELY
console.log('📦 MyBrand System Loading...');

initializeApp();
