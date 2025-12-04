// ENHANCED MOBILE MENU - WORKS WITH MULTIPLE NAVIGATION SYSTEMS
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing enhanced mobile menu...');
    
    // Try multiple possible element IDs (compatibility mode)
    let menuToggle = document.getElementById('menuToggle');
    let navLinks = document.getElementById('navLinks');
    
    // If new IDs exist, use them instead
    if (!menuToggle) {
        menuToggle = document.getElementById('mobileMenuBtn');
        console.log('⚠️ Using mobileMenuBtn instead of menuToggle');
    }
    
    if (!navLinks) {
        navLinks = document.getElementById('mobileNav');
        console.log('⚠️ Using mobileNav instead of navLinks');
    }
    
    // If still not found, try to find by class
    if (!menuToggle) {
        menuToggle = document.querySelector('.menu-icon, .mobile-menu-btn');
        console.log('⚠️ Found menu by class:', menuToggle?.className);
    }
    
    if (!navLinks) {
        navLinks = document.querySelector('.nav-links, .mobile-nav-links');
        console.log('⚠️ Found nav by class:', navLinks?.className);
    }
    
    // Final check - if no menu elements found
    if (!menuToggle) {
        console.error('❌ No menu toggle element found! Checked: menuToggle, mobileMenuBtn, .menu-icon, .mobile-menu-btn');
        console.log('Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        return;
    }
    
    if (!navLinks) {
        console.error('❌ No navigation element found! Checked: navLinks, mobileNav, .nav-links, .mobile-nav-links');
        return;
    }
    
    console.log('✅ Menu elements found:');
    console.log('- Toggle:', menuToggle.id || menuToggle.className);
    console.log('- Nav:', navLinks.id || navLinks.className);
    
    // Ensure proper classes for CSS compatibility
    if (!menuToggle.classList.contains('menu-icon')) {
        menuToggle.classList.add('menu-icon');
    }
    
    if (!navLinks.classList.contains('nav-links')) {
        navLinks.classList.add('nav-links');
    }
    
    // Show/hide based on screen size
    function updateMenuVisibility() {
        if (window.innerWidth <= 768) {
            // Mobile: show menu button, hide navigation
            menuToggle.style.display = 'block';
            menuToggle.style.visibility = 'visible';
            navLinks.style.display = 'none';
            navLinks.classList.remove('active');
        } else {
            // Desktop: hide menu button, show navigation
            menuToggle.style.display = 'none';
            navLinks.style.display = 'flex';
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Toggle mobile menu with robust click handling
    function setupMenuToggle() {
        // Remove any existing click handlers to prevent conflicts
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);
        menuToggle = newToggle;
        
        // Add fresh click handler
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Prevent other handlers
            
            console.log('📱 Menu clicked - toggling...');
            
            const isActive = navLinks.classList.contains('active');
            
            if (!isActive) {
                // Open menu
                navLinks.classList.add('active');
                navLinks.style.display = 'flex';
                menuToggle.textContent = '✕';
                document.body.style.overflow = 'hidden';
                
                // Add close handler to document
                document.addEventListener('click', closeMenuOnClickOutside, true);
                document.addEventListener('keydown', closeMenuOnEscape);
            } else {
                // Close menu
                closeMobileMenu();
            }
        }, true); // Use capture phase to get first
        
        console.log('✅ Menu toggle event listener added');
    }
    
    // Close menu function
    function closeMobileMenu() {
        navLinks.classList.remove('active');
        navLinks.style.display = 'none';
        menuToggle.textContent = '☰';
        document.body.style.overflow = '';
        
        // Remove event listeners
        document.removeEventListener('click', closeMenuOnClickOutside, true);
        document.removeEventListener('keydown', closeMenuOnEscape);
    }
    
    // Close menu when clicking outside
    function closeMenuOnClickOutside(e) {
        if (!e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-nav-links') &&
            !e.target.closest('#menuToggle') && 
            !e.target.closest('#mobileMenuBtn') &&
            !e.target.closest('.menu-icon') &&
            !e.target.closest('.mobile-menu-btn')) {
            closeMobileMenu();
        }
    }
    
    // Close on escape key
    function closeMenuOnEscape(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    }
    
    // Close menu when clicking a link (for all navigation types)
    function setupLinkClickHandlers() {
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    setTimeout(closeMobileMenu, 100); // Small delay for smooth transition
                }
            });
        });
        console.log(`✅ Added click handlers to ${links.length} navigation links`);
    }
    
    // Initialize everything
    function initMobileMenu() {
        updateMenuVisibility();
        setupMenuToggle();
        setupLinkClickHandlers();
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateMenuVisibility, 250);
        });
        
        console.log('✅ Enhanced mobile menu fully initialized');
    }
    
    // Start initialization
    initMobileMenu();
    
    // Make init function available globally for re-initialization
    window.reinitMobileMenu = initMobileMenu;
});

// Mobile touch improvements (separate module to avoid conflicts)
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        // Check if mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('📱 Mobile device detected - applying touch improvements');
            
            // Add touch feedback to buttons (with debouncing)
            const buttons = document.querySelectorAll('button, .btn, .menu-icon, .mobile-menu-btn');
            buttons.forEach(btn => {
                let touchTimer;
                
                btn.addEventListener('touchstart', function() {
                    clearTimeout(touchTimer);
                    this.style.opacity = '0.7';
                }, { passive: true });
                
                btn.addEventListener('touchend', function() {
                    clearTimeout(touchTimer);
                    touchTimer = setTimeout(() => {
                        this.style.opacity = '1';
                    }, 100);
                }, { passive: true });
                
                btn.addEventListener('touchcancel', function() {
                    clearTimeout(touchTimer);
                    this.style.opacity = '1';
                }, { passive: true });
            });
            
            // Fix for iOS Safari 100vh issue
            function fixViewportHeight() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                
                // Also fix any hero/slider heights
                document.querySelectorAll('.hero, .slider-container').forEach(el => {
                    el.style.height = `calc(var(--vh, 1vh) * 100)`;
                });
            }
            
            fixViewportHeight();
            window.addEventListener('resize', fixViewportHeight);
            window.addEventListener('orientationchange', function() {
                setTimeout(fixViewportHeight, 100);
            });
            
            // Prevent zoom on double-tap
            document.addEventListener('dblclick', function(e) {
                if (e.target.tagName === 'BUTTON' || 
                    e.target.tagName === 'A' || 
                    e.target.classList.contains('btn')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    });
})();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initMobileMenu: window.reinitMobileMenu };
}
