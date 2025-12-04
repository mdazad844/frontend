// MOBILE MENU TOGGLE - Complete fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Loading mobile menu...');
    
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!menuToggle || !navLinks) {
        console.log('❌ Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        navLinks.classList.toggle('active');
        menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        
        console.log('📱 Menu toggled:', navLinks.classList.contains('active') ? 'open' : 'closed');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('#menuToggle')) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu function
    function closeMobileMenu() {
        navLinks.classList.remove('active');
        menuToggle.textContent = '☰';
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 250);
    });
    
    console.log('✅ Mobile menu loaded');
});

// Fix for mobile touch events
document.addEventListener('DOMContentLoaded', function() {
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Mobile device detected, applying touch fixes...');
        
        // Add touch feedback to buttons
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
            
            btn.addEventListener('touchcancel', function() {
                this.style.opacity = '1';
            });
        });
        
        // Fix for iOS Safari 100vh issue
        function setVH() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
        
        // Fix for shop filters on mobile
        const filterToggle = document.querySelector('.filter-toggle-btn');
        const filtersPanel = document.getElementById('filtersPanel');
        const filtersOverlay = document.getElementById('filtersOverlay');
        
        if (filterToggle && filtersPanel && filtersOverlay) {
            filterToggle.addEventListener('click', function() {
                filtersPanel.classList.toggle('active');
                filtersOverlay.classList.toggle('active');
                document.body.style.overflow = filtersPanel.classList.contains('active') ? 'hidden' : '';
            });
            
            filtersOverlay.addEventListener('click', function() {
                filtersPanel.classList.remove('active');
                filtersOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            const closeFilters = document.querySelector('.close-filters');
            if (closeFilters) {
                closeFilters.addEventListener('click', function() {
                    filtersPanel.classList.remove('active');
                    filtersOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            }
        }
    }
});
