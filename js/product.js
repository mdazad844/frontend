// PRODUCT PAGE FUNCTIONALITY - SIMPLIFIED WORKING VERSION

// Check if database is loaded
if (typeof productDatabase === 'undefined') {
    console.error('productDatabase not found! Make sure products-database.js is loaded first.');
}

// Global variables for slideshow
let currentSlide = 0;
let slides = [];
let thumbnails = [];

// Initialize the page
function initProductPage() {
    console.log('🛍️ Product page initialized');
    
    loadProductFromURL();
    setupEventListeners();
    checkWishlistState();
}

// Load product based on URL parameter
function loadProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || '1';
    
    // Get product from database
    const product = productDatabase[productId];
    
    if (!product) {
        console.warn(`Product with ID ${productId} not found, showing first product`);
        product = productDatabase['1'];
    }
    
    window.currentProduct = product;
    updateProductDisplay(product);
}

// Update all product information on the page
function updateProductDisplay(product) {
    if (!product) return;
    
    // Update basic info
    updateElement('#product-title', product.name);
    updateElement('#product-price', `₹${product.price}`);
    updateElement('#product-desc', product.description);
    document.title = `${product.name} - MyBrand`;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.content = `${product.name} - ${product.description.substring(0, 150)}...`;
    }
    
    // Update stock status
    updateStockStatus(product.inStock);
    
    // Update rating
    updateRating(product.rating, product.reviewCount);
    
    // Update size options
    updateSizeOptions(product.sizes);
    
    // Update color options
    updateColorOptions(product.colors);
    
    // Update product details
    updateProductDetails(product.details);
    
    // Update images in slideshow
    updateProductImages(product.images, product.name);
    
    // Load related products
    loadRelatedProducts(product);
}

// Update individual element
function updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) element.textContent = content;
}

// Update stock status display
function updateStockStatus(inStock) {
    const stockStatus = document.querySelector('.stock-status');
    if (!stockStatus) return;
    
    if (inStock) {
        stockStatus.innerHTML = '<span>✓</span> In Stock';
        stockStatus.classList.remove('out-of-stock');
    } else {
        stockStatus.innerHTML = '<span>✗</span> Out of Stock';
        stockStatus.classList.add('out-of-stock');
    }
}

// Update rating display
function updateRating(rating, reviewCount) {
    const ratingElem = document.querySelector('.rating-stars');
    const ratingCountElem = document.querySelector('.rating-count');
    
    if (ratingElem && ratingCountElem) {
        ratingCountElem.textContent = `(${rating} • ${reviewCount} reviews)`;
    }
}

// Update size dropdown
function updateSizeOptions(sizes) {
    const sizeSelect = document.getElementById('size');
    if (!sizeSelect || !sizes) return;
    
    sizeSelect.innerHTML = sizes.map(size => 
        `<option value="${size}">${size}</option>`
    ).join('');
    
    // Select first size by default
    if (sizes.length > 0) {
        sizeSelect.value = sizes[0];
    }
}

// Update color dropdown
function updateColorOptions(colors) {
    const colorSelect = document.getElementById('color');
    if (!colorSelect || !colors) return;
    
    colorSelect.innerHTML = colors.map(color => 
        `<option value="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</option>`
    ).join('');
    
    // Select first color by default
    if (colors.length > 0) {
        colorSelect.value = colors[0];
    }
}

// Update product details list
function updateProductDetails(details) {
    const detailsList = document.querySelector('.product-details ul');
    if (!detailsList || !details) return;
    
    detailsList.innerHTML = Object.entries(details).map(([key, value]) => 
        `<li><strong>${formatKey(key)}:</strong> ${value}</li>`
    ).join('');
}

// Format object keys for display
function formatKey(key) {
    return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update product images in slideshow
function updateProductImages(imageFiles, productName) {
    console.log('Updating product images:', imageFiles);
    
    const slideshowContainer = document.querySelector('.slideshow-container');
    const thumbnailsContainer = document.querySelector('.product-thumbnails');
    
    if (!slideshowContainer || !thumbnailsContainer) {
        console.error('Slideshow containers not found');
        return;
    }
    
    // Clear existing
    slideshowContainer.innerHTML = '';
    thumbnailsContainer.innerHTML = '';
    
    // Create slides and thumbnails
    imageFiles.forEach((imageFile, index) => {
        const imagePath = `images/${imageFile}`;
        
        // Create slide
        const slide = document.createElement('div');
        slide.className = 'product-slide';
        if (index === 0) slide.classList.add('active');
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `${productName} - View ${index + 1}`;
        img.loading = 'lazy';
        img.onerror = function() {
            console.warn(`Image failed to load: ${imagePath}`);
            this.style.display = 'none';
        };
        
        slide.appendChild(img);
        slideshowContainer.appendChild(slide);
        
        // Create thumbnail
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        thumbnail.dataset.index = index;
        
        const thumbImg = document.createElement('img');
        thumbImg.src = imagePath;
        thumbImg.alt = `Thumbnail ${index + 1}`;
        thumbImg.onerror = function() {
            console.warn(`Thumbnail failed to load: ${imagePath}`);
            this.style.display = 'none';
        };
        
        thumbnail.appendChild(thumbImg);
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    // Add navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slideshow-prev';
    prevBtn.innerHTML = '❮';
    prevBtn.setAttribute('aria-label', 'Previous image');
    slideshowContainer.appendChild(prevBtn);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'slideshow-next';
    nextBtn.innerHTML = '❯';
    nextBtn.setAttribute('aria-label', 'Next image');
    slideshowContainer.appendChild(nextBtn);
    
    // Initialize slideshow
    initSlideshow();
}

// Initialize slideshow functionality - SIMPLE WORKING VERSION
function initSlideshow() {
    console.log('Initializing slideshow...');
    
    // Get all slides and thumbnails
    slides = document.querySelectorAll('.product-slide');
    thumbnails = document.querySelectorAll('.thumbnail');
    
    console.log(`Found ${slides.length} slides and ${thumbnails.length} thumbnails`);
    
    if (slides.length === 0) {
        console.warn('No slides found');
        return;
    }
    
    // Reset to first slide
    currentSlide = 0;
    updateSlideDisplay();
    
    // Setup navigation buttons
    const nextBtn = document.querySelector('.slideshow-next');
    const prevBtn = document.querySelector('.slideshow-prev');
    
    if (nextBtn) {
        // Remove old event listener and add new one
        nextBtn.onclick = nextSlide;
        console.log('Next button setup complete');
    }
    
    if (prevBtn) {
        prevBtn.onclick = prevSlide;
        console.log('Prev button setup complete');
    }
    
    // Setup thumbnail click events
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.onclick = () => goToSlide(index);
    });
    
    console.log('Slideshow initialized successfully');
}

// Show specific slide
function goToSlide(index) {
    console.log('Going to slide:', index);
    if (index >= 0 && index < slides.length) {
        currentSlide = index;
        updateSlideDisplay();
    }
}

// Go to next slide
function nextSlide() {
    console.log('Next slide clicked');
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlideDisplay();
}

// Go to previous slide
function prevSlide() {
    console.log('Prev slide clicked');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlideDisplay();
}

// Update the display to show current slide
function updateSlideDisplay() {
    console.log(`Updating to slide ${currentSlide + 1}/${slides.length}`);
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
        slide.style.zIndex = '1';
    });
    
    // Remove active class from all thumbnails
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        thumb.style.borderColor = 'transparent';
        thumb.style.opacity = '0.7';
    });
    
    // Show current slide
    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
        slides[currentSlide].style.opacity = '1';
        slides[currentSlide].style.zIndex = '2';
    }
    
    // Highlight current thumbnail
    if (thumbnails[currentSlide]) {
        thumbnails[currentSlide].classList.add('active');
        thumbnails[currentSlide].style.borderColor = '#111';
        thumbnails[currentSlide].style.opacity = '1';
    }
}

// Quantity functions
window.increaseQuantity = function() {
    const qtyInput = document.getElementById('qty');
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value) || 1;
        if (currentQty < 10) {
            qtyInput.value = currentQty + 1;
        }
    }
};

window.decreaseQuantity = function() {
    const qtyInput = document.getElementById('qty');
    if (qtyInput) {
        let currentQty = parseInt(qtyInput.value) || 1;
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    }
};

// Setup event listeners
function setupEventListeners() {
    // Add to Cart button
    const addToCartBtn = document.getElementById('addtocart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addToCartFromProductPage);
    }
    
    // Buy Now button
    const buyNowBtn = document.getElementById('buy-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', buyNow);
    }
    
    // Wishlist button
    const wishlistBtn = document.getElementById('wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', toggleWishlist);
    }
    
    // Quantity input validation
    const qtyInput = document.getElementById('qty');
    if (qtyInput) {
        qtyInput.addEventListener('input', function(e) {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) e.target.value = 1;
            if (value > 10) e.target.value = 10;
        });
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
    
    if (typeof addToCart === 'function') {
        for (let i = 0; i < qty; i++) {
            addToCart(
                window.currentProduct.name,
                window.currentProduct.price,
                `images/${window.currentProduct.images[0]}`,
                size,
                color
            );
        }
        
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
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 500);
}

// Toggle wishlist
function toggleWishlist() {
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

// Global wishlist function for onclick handlers
window.addToWishlistProduct = toggleWishlist;

// Load related products
function loadRelatedProducts(currentProduct) {
    const relatedGrid = document.querySelector('.related-products .product-grid');
    if (!relatedGrid || !currentProduct) return;
    
    // Get all products except current one
    const allProducts = Object.values(productDatabase);
    const otherProducts = allProducts.filter(p => p.id !== currentProduct.id);
    
    // Take up to 4 products
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProductPage);
