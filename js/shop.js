/* SHOP FILTERS FUNCTIONALITY */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛍️ Initializing shop page...');
    
    let currentFilters = {
        category: [],
        price: [],
        size: [],
        color: []
    };

    let visibleProducts = 12;

    // Toggle filters panel
    window.toggleFilters = function() {
        const filtersPanel = document.getElementById('filtersPanel');
        const filtersOverlay = document.getElementById('filtersOverlay');
        const toggleBtn = document.querySelector('.filter-toggle-btn');
        
        if (filtersPanel && filtersOverlay) {
            const isActive = filtersPanel.classList.contains('active');
            
            if (isActive) {
                filtersPanel.classList.remove('active');
                filtersOverlay.style.display = 'none';
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                filtersPanel.classList.add('active');
                filtersOverlay.style.display = 'block';
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            }
        }
    };

    // Toggle filter group
    window.toggleFilterGroup = function(header) {
        const filterGroup = header.parentElement;
        filterGroup.classList.toggle('active');
        
        const isExpanded = filterGroup.classList.contains('active');
        header.setAttribute('aria-expanded', isExpanded.toString());
    };

    // Update filters
    window.updateFilters = function() {
        const newFilters = {
            category: [],
            price: [],
            size: [],
            color: []
        };
        
        const checkedBoxes = document.querySelectorAll('.filter-options input[type="checkbox"]:checked');
        
        checkedBoxes.forEach(checkbox => {
            const name = checkbox.getAttribute('name');
            const value = checkbox.value;
            
            if (name && newFilters[name] && !newFilters[name].includes(value)) {
                newFilters[name].push(value);
            }
        });
        
        currentFilters = newFilters;
        updateActiveFiltersDisplay();
        filterProducts();
    };

    // Apply filters
    window.applyFilters = function() {
        filterProducts();
        toggleFilters();
    };

    // Clear all filters
    window.clearAllFilters = function() {
        const checkboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        currentFilters = {
            category: [],
            price: [],
            size: [],
            color: []
        };
        
        updateActiveFiltersDisplay();
        filterProducts();
    };

    // Update active filters display
    function updateActiveFiltersDisplay() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        const activeFiltersCount = document.getElementById('activeFiltersCount');
        
        if (!activeFiltersContainer) return;
        
        let totalActive = 0;
        Object.values(currentFilters).forEach(filterArray => {
            totalActive += filterArray.length;
        });
        
        if (activeFiltersCount) {
            activeFiltersCount.textContent = totalActive;
        }
        
        activeFiltersContainer.innerHTML = '';
        
        Object.keys(currentFilters).forEach(filterType => {
            currentFilters[filterType].forEach(value => {
                const filterTag = document.createElement('span');
                filterTag.className = 'active-filter-tag';
                filterTag.innerHTML = `
                    ${getFilterDisplayName(filterType, value)}
                    <button class="remove-filter" onclick="removeFilter('${filterType}', '${value}')" aria-label="Remove ${getFilterDisplayName(filterType, value)} filter">×</button>
                `;
                activeFiltersContainer.appendChild(filterTag);
            });
        });
        
        if (totalActive > 0) {
            activeFiltersContainer.classList.add('has-filters');
        } else {
            activeFiltersContainer.classList.remove('has-filters');
        }
    }

    // Get filter display name
    function getFilterDisplayName(filterType, value) {
        const displayNames = {
            category: {
                'men': 'Men',
                'women': 'Women',
                'kids': 'Kids',
                'footwear': 'Footwear'
            },
            price: {
                '0-500': 'Under ₹500',
                '500-1000': '₹500-1000',
                '1000-2000': '₹1000-2000',
                '2000-5000': '₹2000-5000',
                '5000+': 'Above ₹5000'
            },
            size: {
                'S': 'Size S',
                'M': 'Size M',
                'L': 'Size L',
                'XL': 'Size XL',
                'XXL': 'Size XXL',
                '8': 'Size 8',
                '9': 'Size 9',
                '10': 'Size 10'
            },
            color: {
                'black': 'Black',
                'white': 'White',
                'blue': 'Blue',
                'red': 'Red',
                'green': 'Green',
                'gray': 'Gray',
                'marron': 'Marron',
                'beige': 'Beige',
                'lavender': 'Lavender',
                'orange': 'Orange',
                'yellow': 'Yellow',
                'pink': 'Pink',
                'brown': 'Brown'
            }
        };
        
        return displayNames[filterType]?.[value] || value;
    }

    // Remove specific filter
    window.removeFilter = function(filterType, value) {
        const checkbox = document.querySelector(`input[name="${filterType}"][value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        updateFilters();
    };

    // Filter products
    function filterProducts() {
        const productCards = document.querySelectorAll('.product-card');
        let visibleCount = 0;
        
        productCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const price = parseInt(card.getAttribute('data-price') || 0);
            const size = card.getAttribute('data-size');
            const color = card.getAttribute('data-color');
            
            let shouldShow = true;
            
            if (currentFilters.category.length > 0 && !currentFilters.category.includes(category)) {
                shouldShow = false;
            }
            
            if (currentFilters.price.length > 0) {
                let priceMatch = false;
                currentFilters.price.forEach(priceRange => {
                    if (checkPriceRange(price, priceRange)) {
                        priceMatch = true;
                    }
                });
                if (!priceMatch) shouldShow = false;
            }
            
            if (currentFilters.size.length > 0 && !currentFilters.size.includes(size)) {
                shouldShow = false;
            }
            
            if (currentFilters.color.length > 0 && !currentFilters.color.includes(color)) {
                shouldShow = false;
            }
            
            if (shouldShow && visibleCount < visibleProducts) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        updateResultsCount(visibleCount);
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = visibleCount >= productCards.length ? 'none' : 'block';
        }
    }

    // Check price range
    function checkPriceRange(price, range) {
        if (range === '5000+') return price >= 5000;
        const [min, max] = range.split('-').map(Number);
        return price >= min && price <= max;
    }

    // Update results count
    function updateResultsCount(visibleCount) {
        const resultsCount = document.getElementById('resultsCount');
        const totalProducts = document.querySelectorAll('.product-card').length;
        
        if (resultsCount) {
            if (visibleCount === 0) {
                resultsCount.innerHTML = 'No products found. Try changing your filters.';
            } else if (visibleCount === totalProducts) {
                resultsCount.innerHTML = `Showing all ${totalProducts} products`;
            } else {
                const filterCount = Object.values(currentFilters).reduce((sum, arr) => sum + arr.length, 0);
                resultsCount.innerHTML = filterCount > 0 
                    ? `Showing ${visibleCount} of ${totalProducts} products (filtered)`
                    : `Showing ${visibleCount} of ${totalProducts} products`;
            }
        }
    }

    // Load more products
    window.loadMoreProducts = function() {
        visibleProducts += 12;
        filterProducts();
    };

    // Search products
    window.searchProducts = function() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product-card');
        
        if (searchTerm === '') {
            filterProducts();
            return;
        }
        
        let foundCount = 0;
        
        productCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                foundCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.innerHTML = foundCount === 0 
                ? `No products found for "${searchTerm}"`
                : `Found ${foundCount} products for "${searchTerm}"`;
        }
    };

    // Initialize shop page
    function initializeShopPage() {
        console.log('🛍️ Shop page initialized');
        
        const filterGroups = document.querySelectorAll('.filter-group');
        filterGroups.forEach(group => {
            const header = group.querySelector('.filter-header');
            if (header) {
                header.setAttribute('aria-expanded', 'false');
            }
        });
        
        filterProducts();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchProducts();
                }
            });
        }
        
        // Ensure all buttons work on mobile
        setupMobileButtons();
    }

    // Setup mobile button functionality
    function setupMobileButtons() {
        // Fix for wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                const id = this.getAttribute('data-id') || this.getAttribute('onclick').match(/\d+/)[0];
                const name = this.getAttribute('data-name') || 'Product';
                const price = this.getAttribute('data-price') || 0;
                const image = this.getAttribute('data-image') || 'images/placeholder.png';
                
                if (window.addToWishlist) {
                    window.addToWishlist(id, name, price, image);
                }
            });
        });
        
        // Fix for add to cart buttons
        document.querySelectorAll('.product-card .btn').forEach(btn => {
            if (btn.textContent.includes('Add to Cart')) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const productCard = this.closest('.product-card');
                    const name = productCard.querySelector('h3')?.textContent || 'Product';
                    const priceText = productCard.querySelector('.price')?.textContent || '₹0';
                    const price = parseInt(priceText.replace('₹', '')) || 0;
                    const image = productCard.querySelector('img')?.src || 'images/placeholder.png';
                    
                    if (window.addToCart) {
                        window.addToCart(name, price, image);
                    }
                });
            }
        });
    }

    // Initialize when DOM is loaded
    initializeShopPage();
});
