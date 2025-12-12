// js/product.js - SIMPLIFIED PRODUCT PAGE FUNCTIONALITY

// Quantity functions (global for onclick handlers)
// IMPROVED Quantity functions
window.increaseQuantity = function() {
    console.log('increaseQuantity() called');
    const qtyInput = document.getElementById('qty');
    if (!qtyInput) {
        console.error('Quantity input not found!');
        return;
    }
    
    let currentQty = parseInt(qtyInput.value);
    console.log('Current quantity:', currentQty);
    
    if (isNaN(currentQty)) {
        currentQty = 1;
    }
    
    if (currentQty < 10) {
        qtyInput.value = currentQty + 1;
        console.log('Increased to:', qtyInput.value);
        
        // Trigger input event to ensure UI updates
        qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.log('Already at maximum quantity (10)');
    }
};

window.decreaseQuantity = function() {
    console.log('decreaseQuantity() called');
    const qtyInput = document.getElementById('qty');
    if (!qtyInput) {
        console.error('Quantity input not found!');
        return;
    }
    
    let currentQty = parseInt(qtyInput.value);
    console.log('Current quantity:', currentQty);
    
    if (isNaN(currentQty)) {
        currentQty = 1;
    }
    
    if (currentQty > 1) {
        qtyInput.value = currentQty - 1;
        console.log('Decreased to:', qtyInput.value);
        
        // Trigger input event to ensure UI updates
        qtyInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        console.log('Already at minimum quantity (1)');
    }
};

// Get product ID from URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '1';
    console.log('Loading product ID:', id);
    return id;
}

// Load and display product
function loadAndDisplayProduct() {
    const productId = getProductIdFromURL();
    
    // Check if database exists
    if (typeof productDatabase === 'undefined') {
        console.error('Product database not loaded!');
        return;
    }
    
    // Get product from database
    const product = productDatabase[productId];
    
    if (!product) {
        console.error(`Product with ID ${productId} not found`);
        // Fallback to first product
        if (productDatabase['1']) {
            displayProduct(productDatabase['1']);
        }
        return;
    }
    
    displayProduct(product);
}

// Display product on page
function displayProduct(product) {
    console.log('Displaying product:', product.name);
    
    // Store globally for cart/wishlist
    window.currentProduct = product;
    
    // Update basic info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = `₹${product.price}`;
    document.getElementById('product-desc').textContent = product.description;
    document.title = `${product.name} - MyBrand`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `${product.name} - ${product.description.substring(0, 150)}...`;
    }
    
    // Update stock status
    const stockStatus = document.querySelector('.stock-status');
    if (product.inStock) {
        stockStatus.innerHTML = '<span>✓</span> In Stock';
        stockStatus.classList.remove('out-of-stock');
    } else {
        stockStatus.innerHTML = '<span>✗</span> Out of Stock';
        stockStatus.classList.add('out-of-stock');
    }
    
    // Update rating
    const ratingElem = document.querySelector('.rating-stars');
    const ratingCountElem = document.querySelector('.rating-count');
    if (ratingElem && ratingCountElem) {
        // Simple star display
        ratingCountElem.textContent = `(${product.rating} • ${product.reviewCount} reviews)`;
    }
    
    // Update size options
    const sizeSelect = document.getElementById('size');
    if (sizeSelect && product.sizes && product.sizes.length > 0) {
        sizeSelect.innerHTML = product.sizes.map(size => 
            `<option value="${size}">${size}</option>`
        ).join('');
        sizeSelect.value = product.sizes[0];
    }
    
    // Update color options
    const colorSelect = document.getElementById('color');
    if (colorSelect && product.colors && product.colors.length > 0) {
        colorSelect.innerHTML = product.colors.map(color => 
            `<option value="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</option>`
        ).join('');
        colorSelect.value = product.colors[0];
    }
    
    // Update product details
    const detailsList = document.querySelector('.product-details ul');
    if (detailsList && product.details) {
        detailsList.innerHTML = Object.entries(product.details).map(([key, value]) => 
            `<li><strong>${formatKey(key)}:</strong> ${value}</li>`
        ).join('');
    }
    
    // Update images in slideshow
    updateProductImages(product);
    
    // Load related products
    loadRelatedProducts();
    
    // Check wishlist state
    checkWishlistState();
}

// Format key for display (e.g., "material" becomes "Material")
function formatKey(key) {
    return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update product images in slideshow
function updateProductImages(product) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    const thumbnailsContainer = document.querySelector('.product-thumbnails');
    
    if (!slideshowContainer || !thumbnailsContainer || !product.images) return;
    
    // Clear existing
    slideshowContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    
    // Create new slides
    product.images.forEach((image, index) => {
        // Check if image exists (fallback to first image if not)
        const imgSrc = `images/${image}`;
        
        // Create slide
        const slide = document.createElement('div');
        slide.className = `product-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `<img src="${imgSrc}" alt="${product.name} - View ${index + 1}" loading="lazy" onerror="this.style.display='none'">`;
        slideshowContainer.appendChild(slide);
        
        // Create thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.setAttribute('data-slide', index);
        thumbnail.innerHTML = `<img src="${imgSrc}" alt="Thumbnail ${index + 1}" loading="lazy" onerror="this.style.display='none'">`;
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Reinitialize slideshow
    initSlideshow();
}

// Slideshow functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.product-slide');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const nextBtn = document.querySelector('.slideshow-next');
    const prevBtn = document.querySelector('.slideshow-prev');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    
    function showSlide(n) {
        slides.forEach(slide => slide.classList.remove('active'));
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        if (slides[n]) slides[n].classList.add('active');
        if (thumbnails[n]) thumbnails[n].classList.add('active');
        
        currentSlide = n;
    }
    
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) next = 0;
        showSlide(next);
    }
    
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) prev = slides.length - 1;
        showSlide(prev);
    }
    
    // Add event listeners
    if (nextBtn) nextBtn.onclick = nextSlide;
    if (prevBtn) prevBtn.onclick = prevSlide;
    
    // Thumbnail clicks
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.onclick = () => showSlide(index);
    });
    
    showSlide(0);
}

// Load related products
function loadRelatedProducts() {
    const relatedGrid = document.querySelector('.related-products .product-grid');
    if (!relatedGrid) return;
    
    const currentProduct = window.currentProduct;
    if (!currentProduct || typeof productDatabase === 'undefined') return;
    
    // Get all products except current one
    const allProducts = Object.values(productDatabase);
    const otherProducts = allProducts.filter(p => p.id !== currentProduct.id);
    
    // Take up to 4 random products
    const relatedProducts = [];
    for (let i = 0; i < Math.min(4, otherProducts.length); i++) {
        relatedProducts.push(otherProducts[i]);
    }
    
    // Generate HTML
    relatedGrid.innerHTML = relatedProducts.map(product => `
        <div class="product-card">
            <button class="wishlist-btn" onclick="addToWishlist(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, 'images/${product.images[0]}')" aria-label="Add to wishlist">
                🤍
            </button>
            <img src="images/${product.images[0]}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <button class="btn" onclick="addToCart('${product.name.replace(/'/g, "\\'")}', ${product.price}, 'images/${product.images[0]}')">Add to Cart</button>
            <a class="small-link" href="product.html?id=${product.id}">View Details</a>
        </div>
    `).join('');
}

// Check if current product is in wishlist
function checkWishlistState() {
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (!wishlistBtn || !window.currentProduct) return;
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isInWishlist = wishlist.some(item => item.id == window.currentProduct.id);
    
    if (isInWishlist) {
        wishlistBtn.innerHTML = '<span class="wishlist-icon">❤️</span> In Wishlist';
        wishlistBtn.style.background = '#ff6b6b';
        wishlistBtn.style.color = 'white';
        wishlistBtn.style.border = 'none';
    }
}

// Add to cart from product page
function addToCartFromProductPage() {
    if (!window.currentProduct) {
        alert('Product not loaded!');
        return;
    }
    
    const qty = parseInt(document.getElementById('qty').value) || 1;
    const size = document.getElementById('size').value;
    const color = document.getElementById('color').value;
    
    // Check if addToCart function exists
    if (typeof addToCart === 'function') {
        // Add multiple items based on quantity
        for (let i = 0; i < qty; i++) {
            addToCart(
                window.currentProduct.name,
                window.currentProduct.price,
                `images/${window.currentProduct.images[0]}`,
                size,
                color
            );
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`✅ ${qty} ${window.currentProduct.name} added to cart!`, 'success');
        } else {
            alert(`✅ ${qty} ${window.currentProduct.name} added to cart!`);
        }
    } else {
        console.error('addToCart function not found!');
        alert('Unable to add to cart. Please refresh the page.');
    }
}

// Buy now function
function buyNow() {
    addToCartFromProductPage();
    // Redirect to cart page
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Toggle wishlist for current product
window.addToWishlistProduct = function() {
    if (!window.currentProduct) return;
    
    const added = (typeof addToWishlist === 'function') ? 
        addToWishlist(
            window.currentProduct.id, 
            window.currentProduct.name, 
            window.currentProduct.price, 
            `images/${window.currentProduct.images[0]}`
        ) : false;
    
    const wishlistBtn = document.getElementById('wishlist-btn');
    
    if (added) {
        wishlistBtn.innerHTML = '<span class="wishlist-icon">❤️</span> In Wishlist';
        wishlistBtn.style.background = '#ff6b6b';
        wishlistBtn.style.color = 'white';
        wishlistBtn.style.border = 'none';
        
        if (typeof showNotification === 'function') {
            showNotification(`❤️ ${window.currentProduct.name} added to wishlist!`, 'success');
        }
    } else {
        wishlistBtn.innerHTML = '<span class="wishlist-icon">🤍</span> Add to Wishlist';
        wishlistBtn.style.background = 'transparent';
        wishlistBtn.style.color = '#111';
        wishlistBtn.style.border = '2px solid #111';
        
        if (typeof showNotification === 'function') {
            showNotification(`💔 ${window.currentProduct.name} removed from wishlist!`, 'info');
        }
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page initialized');
    
    // Load product data
    loadAndDisplayProduct();
    
    // Setup event listeners for buttons
    const addToCartBtn = document.getElementById('addtocart-btn');
    const buyNowBtn = document.getElementById('buy-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCartFromProductPage);
    }
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', buyNow);
    }
    
    // Setup quantity input validation
   // In testQuantityButtons function, change:
 const qtyInput = document.getElementById('qty');
    if (qtyInput) {
        qtyInput.addEventListener('input', function(e) {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) e.target.value = 1;
            if (value > 99999) e.target.value = 99999;
        });
    }
});


// DIRECT TEST - Add this code
function testQuantityButtons() {
    console.log('=== Testing Quantity Buttons ===');
    
    // Check if elements exist
    const qtyInput = document.getElementById('qty');
    const plusBtn = document.querySelector('.quantity-btn:nth-child(3)'); // The + button
    const minusBtn = document.querySelector('.quantity-btn:nth-child(1)'); // The - button
    
    console.log('Quantity input found:', qtyInput);
    console.log('Plus button found:', plusBtn);
    console.log('Minus button found:', minusBtn);
    
    if (qtyInput) {
        console.log('Current qty value:', qtyInput.value);
        console.log('qty input type:', qtyInput.type);
        console.log('qty input readonly:', qtyInput.readOnly);
        console.log('qty input disabled:', qtyInput.disabled);
    }
    
    // Add direct event listeners
    if (plusBtn && qtyInput) {
        plusBtn.addEventListener('click', function() {
            console.log('PLUS button clicked via addEventListener');
            let currentQty = parseInt(qtyInput.value) || 1;
            if (currentQty < 99999) {  // CHANGE THIS TO 99999
                qtyInput.value = currentQty + 1;
                console.log('New quantity:', qtyInput.value);
            } else {
                console.log('Maximum quantity reached (99999)');
            }
        });
    }
    
    if (minusBtn && qtyInput) {
        minusBtn.addEventListener('click', function() {
            console.log('MINUS button clicked via addEventListener');
            let currentQty = parseInt(qtyInput.value) || 1;
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
                console.log('New quantity:', qtyInput.value);
            }
        });
    }
}


// Call test after page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testQuantityButtons, 500);
});
