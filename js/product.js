// PRODUCT PAGE FUNCTIONALITY WITH DATABASE INTEGRATION

// Import product database (make sure it's loaded before this script)
if (typeof productDatabase === 'undefined') {
    console.error('productDatabase not found! Make sure product-database.js is loaded first.');
}

// Product Page Controller
const ProductPage = {
    // Current product data
    currentProduct: null,
    
    // Initialize the page
    init: function() {
        console.log('🛍️ Product page initialized');
        
        this.loadProductFromURL();
        this.initSlideshow();
        this.initEventListeners();
        this.loadRelatedProducts();
        this.checkWishlistState();
    },
    
    // Load product based on URL parameter
    loadProductFromURL: function() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id') || '1';
        
        // Get product from database
        this.currentProduct = productDatabase[productId];
        
        if (!this.currentProduct) {
            console.warn(`Product with ID ${productId} not found, showing first product`);
            this.currentProduct = productDatabase['1'];
        }
        
        this.updateProductDisplay();
    },
    
    // Update all product information on the page
    updateProductDisplay: function() {
        if (!this.currentProduct) return;
        
        const product = this.currentProduct;
        
        // Update basic info
        this.updateElement('#product-title', product.name);
        this.updateElement('#product-price', `₹${product.price}`);
        this.updateElement('#product-desc', product.description);
        document.title = `${product.name} - MyBrand`;
        
        // Update stock status
        this.updateStockStatus(product.inStock);
        
        // Update rating
        this.updateRating(product.rating, product.reviewCount);
        
        // Update size options
        this.updateSizeOptions(product.sizes);
        
        // Update color options
        this.updateColorOptions(product.colors);
        
        // Update product details
        this.updateProductDetails(product.details);
        
        // Update images in slideshow
        this.updateProductImages(product.images);
    },
    
    // Update individual element
    updateElement: function(selector, content) {
        const element = document.querySelector(selector);
        if (element) element.textContent = content;
    },
    
    // Update stock status display
    updateStockStatus: function(inStock) {
        const stockStatus = document.querySelector('.stock-status');
        if (!stockStatus) return;
        
        if (inStock) {
            stockStatus.innerHTML = '<span>✓</span> In Stock';
            stockStatus.classList.remove('out-of-stock');
        } else {
            stockStatus.innerHTML = '<span>✗</span> Out of Stock';
            stockStatus.classList.add('out-of-stock');
        }
    },
    
    // Update rating display
    updateRating: function(rating, reviewCount) {
        const ratingElem = document.querySelector('.rating-stars');
        const ratingCountElem = document.querySelector('.rating-count');
        
        if (ratingElem && ratingCountElem) {
            // Create star rating (simplified - you could make this more dynamic)
            const stars = '★★★★★'.slice(0, Math.floor(rating)) + '☆☆☆☆☆'.slice(Math.floor(rating));
            ratingElem.textContent = stars;
            ratingCountElem.textContent = `(${rating} • ${reviewCount} reviews)`;
        }
    },
    
    // Update size dropdown
    updateSizeOptions: function(sizes) {
        const sizeSelect = document.getElementById('size');
        if (!sizeSelect || !sizes) return;
        
        sizeSelect.innerHTML = sizes.map(size => 
            `<option value="${size}">${size}</option>`
        ).join('');
        
        // Select first size by default
        if (sizes.length > 0) {
            sizeSelect.value = sizes[0];
        }
    },
    
    // Update color dropdown
    updateColorOptions: function(colors) {
        const colorSelect = document.getElementById('color');
        if (!colorSelect || !colors) return;
        
        colorSelect.innerHTML = colors.map(color => 
            `<option value="${color}">${color.charAt(0).toUpperCase() + color.slice(1)}</option>`
        ).join('');
        
        // Select first color by default
        if (colors.length > 0) {
            colorSelect.value = colors[0];
        }
    },
    
    // Update product details list
    updateProductDetails: function(details) {
        const detailsList = document.querySelector('.product-details ul');
        if (!detailsList || !details) return;
        
        detailsList.innerHTML = Object.entries(details).map(([key, value]) => 
            `<li><strong>${this.formatKey(key)}:</strong> ${value}</li>`
        ).join('');
    },
    
    // Format object keys for display
    formatKey: function(key) {
        return key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },
    
    // Update slideshow images
    updateProductImages: function(images) {
        console.log('Updating product images...');
        
        const slideshowContainer = document.querySelector('.slideshow-container');
        const thumbnailsContainer = document.querySelector('.product-thumbnails');
        
        if (!slideshowContainer || !thumbnailsContainer || !images) {
            console.error('Missing containers or images');
            return;
        }
        
        console.log('Product images:', images);
        
        // Clear existing
        slideshowContainer.innerHTML = '';
        thumbnailsContainer.innerHTML = '';
        
        // Create new slides
        images.forEach((image, index) => {
            const imgSrc = `images/${image}`;
            
            console.log(`Creating slide ${index}: ${imgSrc}`);
            
            // Create slide
            const slide = document.createElement('div');
            slide.className = `product-slide ${index === 0 ? 'active' : ''}`;
            
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${this.currentProduct.name} - View ${index + 1}`;
            img.loading = 'lazy';
            img.onerror = function() {
                console.warn(`Image failed to load: ${imgSrc}`);
                this.style.display = 'none';
            };
            
            slide.appendChild(img);
            slideshowContainer.appendChild(slide);
            
            // Create thumbnail
            const thumbnail = document.createElement('div');
            thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.setAttribute('data-slide', index);
            
            const thumbImg = document.createElement('img');
            thumbImg.src = imgSrc;
            thumbImg.alt = `Thumbnail ${index + 1}`;
            thumbImg.onerror = function() {
                console.warn(`Thumbnail failed to load: ${imgSrc}`);
                this.style.display = 'none';
            };
            
            thumbnail.appendChild(thumbImg);
            thumbnailsContainer.appendChild(thumbnail);
        });
        
        // Add navigation arrows if they don't exist
        if (!document.querySelector('.slideshow-prev')) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slideshow-prev';
            prevBtn.innerHTML = '❮';
            prevBtn.setAttribute('aria-label', 'Previous image');
            slideshowContainer.appendChild(prevBtn);
        }
        
        if (!document.querySelector('.slideshow-next')) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'slideshow-next';
            nextBtn.innerHTML = '❯';
            nextBtn.setAttribute('aria-label', 'Next image');
            slideshowContainer.appendChild(nextBtn);
        }
        
        // Wait a bit for DOM to update, then initialize slideshow
        setTimeout(() => {
            this.initSlideshow();
        }, 100);
    },
    
    // Initialize slideshow functionality
    initSlideshow: function() {
        console.log('Initializing slideshow...');
        
        const slides = document.querySelectorAll('.product-slide');
        const thumbnails = document.querySelectorAll('.thumbnail');
        const nextBtn = document.querySelector('.slideshow-next');
        const prevBtn = document.querySelector('.slideshow-prev');
        
        console.log('Found slides:', slides.length);
        console.log('Found thumbnails:', thumbnails.length);
        
        if (!slides.length) {
            console.warn('No slides found for slideshow');
            return;
        }
        
        let currentSlide = 0;
        
        const showSlide = (n) => {
            console.log('Showing slide:', n);
            
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all thumbnails
            thumbnails.forEach(thumb => {
                thumb.classList.remove('active');
            });
            
            // Show current slide
            if (slides[n]) {
                slides[n].classList.add('active');
            }
            
            // Highlight current thumbnail
            if (thumbnails[n]) {
                thumbnails[n].classList.add('active');
            }
            
            currentSlide = n;
        };
        
        const nextSlide = () => {
            console.log('Next slide clicked');
            let next = currentSlide + 1;
            if (next >= slides.length) next = 0;
            showSlide(next);
        };
        
        const prevSlide = () => {
            console.log('Prev slide clicked');
            let prev = currentSlide - 1;
            if (prev < 0) prev = slides.length - 1;
            showSlide(prev);
        };
        
        // Remove existing event listeners first by cloning
        if (nextBtn) {
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        }
        
        if (prevBtn) {
            const newPrevBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        }
        
        // Get fresh references after cloning
        const freshNextBtn = document.querySelector('.slideshow-next');
        const freshPrevBtn = document.querySelector('.slideshow-prev');
        
        // Add new event listeners
        if (freshNextBtn) {
            freshNextBtn.addEventListener('click', nextSlide);
            console.log('Next button listener added');
        }
        
        if (freshPrevBtn) {
            freshPrevBtn.addEventListener('click', prevSlide);
            console.log('Prev button listener added');
        }
        
        // Thumbnail click events - remove and re-add
        thumbnails.forEach((thumbnail, index) => {
            const newThumb = thumbnail.cloneNode(true);
            thumbnail.parentNode.replaceChild(newThumb, thumbnail);
        });
        
        // Get fresh thumbnails references
        const freshThumbnails = document.querySelectorAll('.thumbnail');
        freshThumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => {
                console.log('Thumbnail clicked:', index);
                showSlide(index);
            });
        });
        
        console.log('Thumbnail listeners added:', freshThumbnails.length);
        
        // Initialize first slide
        showSlide(0);
    },
    
    // Initialize event listeners
    initEventListeners: function() {
        // Add to Cart button
        const addToCartBtn = document.getElementById('addtocart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addToCart());
        }
        
        // Buy Now button
        const buyNowBtn = document.getElementById('buy-btn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => this.buyNow());
        }
        
        // Wishlist button
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => this.toggleWishlist());
        }
        
        // Quantity input validation
        const qtyInput = document.getElementById('qty');
        if (qtyInput) {
            qtyInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) e.target.value = 1;
                if (value > 10) e.target.value = 10;
            });
        }
    },
    
    // Quantity control functions
    increaseQuantity: function() {
        const qtyInput = document.getElementById('qty');
        if (qtyInput) {
            let currentQty = parseInt(qtyInput.value) || 1;
            if (currentQty < 10) {
                qtyInput.value = currentQty + 1;
            }
        }
    },
    
    decreaseQuantity: function() {
        const qtyInput = document.getElementById('qty');
        if (qtyInput) {
            let currentQty = parseInt(qtyInput.value) || 1;
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
            }
        }
    },
    
    // Add to cart functionality
    addToCart: function() {
        if (!this.currentProduct) return;
        
        const qty = parseInt(document.getElementById('qty').value) || 1;
        const size = document.getElementById('size').value;
        const color = document.getElementById('color').value;
        
        // Call global addToCart function (from script.js)
        if (typeof addToCart === 'function') {
            for (let i = 0; i < qty; i++) {
                addToCart(
                    this.currentProduct.name,
                    this.currentProduct.price,
                    `images/${this.currentProduct.images[0]}`,
                    size,
                    color
                );
            }
            
            // Show notification
            this.showNotification(`✅ ${qty} ${this.currentProduct.name} added to cart!`, 'success');
        } else {
            console.error('addToCart function not found!');
        }
    },
    
    // Buy now functionality
    buyNow: function() {
        this.addToCart();
        window.location.href = 'cart.html';
    },
    
    // Toggle wishlist
    toggleWishlist: function() {
        if (!this.currentProduct) return;
        
        const wishlistBtn = document.getElementById('wishlist-btn');
        const wasAdded = this.addToWishlist();
        
        if (wasAdded) {
            wishlistBtn.innerHTML = '<span class="wishlist-icon">❤️</span> In Wishlist';
            wishlistBtn.style.background = '#ff6b6b';
            wishlistBtn.style.color = 'white';
            wishlistBtn.style.border = 'none';
            this.showNotification(`❤️ ${this.currentProduct.name} added to wishlist!`, 'success');
        } else {
            wishlistBtn.innerHTML = '<span class="wishlist-icon">🤍</span> Add to Wishlist';
            wishlistBtn.style.background = 'transparent';
            wishlistBtn.style.color = '#111';
            wishlistBtn.style.border = '2px solid #111';
            this.showNotification(`💔 ${this.currentProduct.name} removed from wishlist!`, 'info');
        }
    },
    
    // Add to wishlist helper
    addToWishlist: function() {
        if (!this.currentProduct) return false;
        
        if (typeof addToWishlist === 'function') {
            return addToWishlist(
                this.currentProduct.id,
                this.currentProduct.name,
                this.currentProduct.price,
                `images/${this.currentProduct.images[0]}`
            );
        }
        return false;
    },
    
    // Check if current product is in wishlist
    checkWishlistState: function() {
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (!wishlistBtn || !this.currentProduct) return;
        
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id == this.currentProduct.id);
        
        if (isInWishlist) {
            wishlistBtn.innerHTML = '<span class="wishlist-icon">❤️</span> In Wishlist';
            wishlistBtn.style.background = '#ff6b6b';
            wishlistBtn.style.color = 'white';
            wishlistBtn.style.border = 'none';
        }
    },
    
    // Load related products from database
    loadRelatedProducts: function() {
        const relatedGrid = document.querySelector('.related-products .product-grid');
        if (!relatedGrid || !this.currentProduct) return;
        
        // Get products from same category (excluding current product)
        const relatedProducts = Object.values(productDatabase)
            .filter(product => 
                product.id !== this.currentProduct.id && 
                product.category === this.currentProduct.category
            )
            .slice(0, 4); // Limit to 4 products
        
        // If not enough same-category products, get random ones
        if (relatedProducts.length < 2) {
            const allProducts = Object.values(productDatabase)
                .filter(product => product.id !== this.currentProduct.id);
            relatedProducts.push(...allProducts.slice(0, 4 - relatedProducts.length));
        }
        
        // Generate HTML for related products
        relatedGrid.innerHTML = relatedProducts.map(product => `
            <div class="product-card" data-category="${product.category}">
                <button class="wishlist-btn" onclick="ProductPage.addToWishlistById(${product.id})" aria-label="Add to wishlist">
                    🤍
                </button>
                <img src="images/${product.images[0]}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p class="price">₹${product.price}</p>
                <button class="btn" onclick="ProductPage.addRelatedToCart(${product.id})">Add to Cart</button>
                <a class="small-link" href="product.html?id=${product.id}">View Details</a>
            </div>
        `).join('');
    },
    
    // Helper function for related products wishlist
    addToWishlistById: function(productId) {
        const product = productDatabase[productId];
        if (product && typeof addToWishlist === 'function') {
            addToWishlist(product.id, product.name, product.price, `images/${product.images[0]}`);
            this.showNotification(`❤️ ${product.name} added to wishlist!`, 'success');
        }
    },
    
    // Helper function for adding related products to cart
    addRelatedToCart: function(productId) {
        const product = productDatabase[productId];
        if (product && typeof addToCart === 'function') {
            addToCart(product.name, product.price, `images/${product.images[0]}`);
            this.showNotification(`✅ ${product.name} added to cart!`, 'success');
        }
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Check if global notification function exists
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            // Fallback notification
            alert(message);
        }
    }
};

// Make functions globally available for inline onclick handlers
window.increaseQuantity = () => ProductPage.increaseQuantity();
window.decreaseQuantity = () => ProductPage.decreaseQuantity();
window.addToWishlistProduct = () => ProductPage.toggleWishlist();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ProductPage.init();
});
