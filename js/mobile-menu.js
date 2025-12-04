// MOBILE MENU FIX - MUST HAVE THIS FILE
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing mobile menu...');
    
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!menuToggle) {
        console.error('❌ menuToggle element not found!');
        return;
    }
    
    if (!navLinks) {
        console.error('❌ navLinks element not found!');
        return;
    }
    
    // Show mobile menu icon on mobile
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'block';
        menuToggle.style.visibility = 'visible';
        navLinks.style.display = 'none';
    }
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📱 Menu toggle clicked');
        
        navLinks.classList.toggle('active');
        menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        
        // Prevent body scroll when menu is open
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
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
        document.body.style.overflow = '';
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // On desktop, show nav links
            navLinks.style.display = 'flex';
            menuToggle.style.display = 'none';
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // On mobile, hide nav links (show only when menu is toggled)
            menuToggle.style.display = 'block';
            if (!navLinks.classList.contains('active')) {
                navLinks.style.display = 'none';
            }
        }
    });
    
    console.log('✅ Mobile menu initialized');
});

// Mobile touch improvements
document.addEventListener('DOMContentLoaded', function() {
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Mobile device detected');
        
        // Add touch feedback to buttons
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
        
        // Fix for iOS Safari 100vh issue
        function fixVH() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        
        fixVH();
        window.addEventListener('resize', fixVH);
        window.addEventListener('orientationchange', fixVH);
    }
});
