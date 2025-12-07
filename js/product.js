// PRODUCT PAGE FUNCTIONALITY - MINIMAL WORKING VERSION
console.log('Product page script loaded');

// Check if database is loaded
if (typeof productDatabase === 'undefined') {
    console.error('Product database not found!');
}

// Global variables
let currentSlide = 0;
let slides = [];
let thumbnails = [];

// Initialize everything
function initProductPage() {
    console.log('Initializing product page...');
    
    // Load product from URL
    loadProductFromURL();
    
    // Initialize the hardcoded slideshow (from HTML)
    initHardcodedSlideshow();
    
    // Setup other event listeners
    setupEventListeners();
}

// Load product from URL
function loadProductFromURL() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id') || '1';
    
    console.log('Loading product ID:', productId);
    
    if (!productDatabase) {
        console.error('Database not available');
        return;
    }
    
    const product = productDatabase[productId];
    
    if (!product) {
        console.error(`Product ${productId} not found`);
        return;
    }
    
    console.log('Found product:', product.name);
    
    // Update product info
    updateProductInfo(product);
    
    // Store globally
    window.currentProduct = product;
}

// Update product information
function updateProductInfo(product) {
    // Update basic info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = `₹${product.price}`;
    document.getElementById('product-desc').textContent = product.description;
    document.title = `${product.name} - MyBrand`;
    
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
    const ratingCountElem = document.querySelector('.rating-count');
    if (ratingCountElem) {
        ratingCountElem.textContent = `(${product.rating} • ${product.reviewCount} reviews)`;
    }
    
    // Update size options
    const sizeSelect = document.getElementById('size');
    if (sizeSelect && product.sizes) {
        sizeSelect.innerHTML = product.sizes.map(size => 
            `<option value="${size}">${size}</option>`
        ).join('');
    }
    
    // Update color options
    const colorSelect = document.getElementById('color');
    if (colorSelect && product.colors) {
        colorSelect.innerHTML = product.colors.map(color => 
            `<option value="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</option>`
        ).join('');
    }
    
    // Update product details
    const detailsList = document.querySelector('.product-details ul');
    if (detailsList && product.details) {
        detailsList.innerHTML = Object.entries(product.details).map(([key, value]) => 
            `<li><strong>${formatKey(key)}:</strong> ${value}</li>`
        ).join('');
    }
    
    // Update images (but keep slideshow functionality)
    updateProductImages(product);
}

// Format key for display
function formatKey(key) {
    return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update product images (only update src, not structure)
function updateProductImages(product) {
    console.log('Updating images for:', product.name);
    
    // Get existing slides
    const slideImages = document.querySelectorAll('.product-slide img');
    const thumbnailImages = document.querySelectorAll('.thumbnail img');
    
    // Update main slides
    if (product.images && product.images.length > 0) {
        product.images.forEach((image, index) => {
            if (slideImages[index]) {
                slideImages[index].src = `images/${image}`;
                slideImages[index].alt = `${product.name} - View ${index + 1}`;
            }
            if (thumbnailImages[index]) {
                thumbnailImages[index].src = `images/${image}`;
                thumbnailImages[index].alt = `Thumbnail ${index + 1}`;
            }
        });
    }
}

// Initialize the hardcoded slideshow
function initHardcodedSlideshow() {
    console.log('Initializing hardcoded slideshow...');
    
    // Get all slides and thumbnails
    slides = document.querySelectorAll('.product-slide');
    thumbnails = document.querySelectorAll('.thumbnail');
    
    console.log(`Found ${slides.length} slides and ${thumbnails.length} thumbnails`);
    
    if (slides.length === 0) {
        console.error('No slides found!');
        return;
    }
    
    // Setup navigation buttons
    const nextBtn = document.querySelector('.slideshow-next');
    const prevBtn = document.querySelector('.slideshow-prev');
    
    // Remove any existing event listeners by cloning
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    }
    
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    }
    
    // Get fresh references
    const freshNextBtn = document.querySelector('.slideshow-next');
    const freshPrevBtn = document.querySelector('.slideshow-prev');
    
    // Add click handlers
    if (freshNextBtn) {
        freshNextBtn.addEventListener('click', nextSlide);
        console.log('Next button handler added');
    }
    
    if (freshPrevBtn) {
        freshPrevBtn.addEventListener('click', prevSlide);
        console.log('Prev button handler added');
    }
    
    // Setup thumbnail click events
    thumbnails.forEach((thumbnail, index) => {
        // Clone to remove old listeners
        const newThumb = thumbnail.cloneNode(true);
        thumbnail.parentNode.replaceChild(newThumb, thumbnail);
    });
    
    // Get fresh thumbnails
    const freshThumbnails = document.querySelectorAll('.thumbnail');
    freshThumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            console.log('Thumbnail clicked:', index);
            goToSlide(index);
        });
    });
    
    console.log('Slideshow initialized');
    showSlide(0);
}

// Show specific slide
function goToSlide(index) {
    console.log('Going to slide:', index);
    if (index >= 0 && index < slides.length) {
        currentSlide = index;
        showSlide(currentSlide);
    }
}

// Go to next slide
function nextSlide() {
    console.log('Next slide clicked');
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Go to previous slide
function prevSlide() {
    console.log('Previous slide clicked');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Show the current slide
function showSlide(index) {
    console.log(`Showing slide ${index + 1}/${slides.length}`);
    
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
        slide.style.zIndex = '1';
    });
    
    // Remove active from all thumbnails
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
        slides[index].style.opacity = '1';
        slides[index].style.zIndex = '2';
    }
    
    // Highlight current thumbnail
    if (thumbnails[index]) {
        thumbnails[index].classList.add('active');
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
}

// Add to cart
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
        
        alert(`✅ ${qty} ${window.currentProduct.name} added to cart!`);
    }
}

// Buy now
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
        alert(`❤️ ${window.currentProduct.name} added to wishlist!`);
    } else {
        wishlistBtn.innerHTML = '<span class="wishlist-icon">🤍</span> Add to Wishlist';
        wishlistBtn.style.background = 'transparent';
        wishlistBtn.style.color = '#111';
        wishlistBtn.style.border = '2px solid #111';
        alert(`💔 ${window.currentProduct.name} removed from wishlist!`);
    }
}

// Global function for onclick
window.addToWishlistProduct = toggleWishlist;

// Initialize on load
document.addEventListener('DOMContentLoaded', initProductPage);
