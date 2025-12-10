// js/admin.js - Admin Panel Functionality
class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        console.log('🛠️ Admin Panel Initializing...');
        
        // Check if user is admin (basic check)
        this.checkAdminAccess();
        
        // Load all data
        this.loadDashboardData();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load initial section
        this.loadSection('dashboard');
        
        console.log('✅ Admin Panel Ready');
    }

    checkAdminAccess() {
        // Simple admin check - in production, use proper authentication
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isAdmin = currentUser && currentUser.role === 'admin';
        
        if (!isAdmin && !window.location.hash.includes('debug')) {
            console.warn('⚠️ Non-admin access attempt');
            // Redirect to login or show access denied
            // window.location.href = 'login.html';
        }
    }

    loadDashboardData() {
        console.log('📊 Loading dashboard data...');
        
        // Load orders from localStorage
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Calculate totals
        const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const totalCustomers = this.getUniqueCustomers(orders);
        
        // Update dashboard stats
        this.updateElement('totalSales', `₹${totalSales.toFixed(2)}`);
        this.updateElement('totalOrders', totalOrders);
        this.updateElement('totalCustomers', totalCustomers);
        this.updateElement('totalProducts', products.length || 'Loading...');
        
        // Store data for other sections
        this.orders = orders;
        this.contactMessages = contactMessages;
        this.products = products;
        this.cartData = cart;
        this.wishlistData = wishlist;
        
        console.log('📈 Dashboard data loaded:', {
            sales: totalSales,
            orders: totalOrders,
            customers: totalCustomers,
            messages: contactMessages.length,
            products: products.length
        });
    }

    getUniqueCustomers(orders) {
        const emails = orders
            .filter(order => order.email || order.userEmail)
            .map(order => order.email || order.userEmail);
        return new Set(emails).size;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    setupNavigation() {
        // Handle sidebar clicks
        document.querySelectorAll('.admin-sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').replace('#', '');
                this.loadSection(section);
                
                // Update active state
                document.querySelectorAll('.admin-sidebar a').forEach(a => {
                    a.classList.remove('active');
                });
                link.classList.add('active');
            });
        });
    }

    loadSection(section) {
        console.log(`📂 Loading section: ${section}`);
        
        const contentArea = document.querySelector('.admin-content');
        if (!contentArea) return;
        
        switch(section) {
            case 'dashboard':
                this.loadDashboardSection(contentArea);
                break;
            case 'products':
                this.loadProductsSection(contentArea);
                break;
            case 'orders':
                this.loadOrdersSection(contentArea);
                break;
            case 'customers':
                this.loadCustomersSection(contentArea);
                break;
            case 'messages':
                this.loadMessagesSection(contentArea);
                break;
            default:
                this.loadDashboardSection(contentArea);
        }
    }

    loadDashboardSection(container) {
        container.innerHTML = `
            <h1>Dashboard Overview</h1>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>Total Sales</h3>
                    <p id="totalSales">₹0</p>
                </div>
                <div class="stat-card">
                    <h3>Total Orders</h3>
                    <p id="totalOrders">0</p>
                </div>
                <div class="stat-card">
                    <h3>Total Customers</h3>
                    <p id="totalCustomers">0</p>
                </div>
                <div class="stat-card">
                    <h3>Products</h3>
                    <p id="totalProducts">0</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                <!-- Recent Orders -->
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Recent Orders</h3>
                    <div id="recentOrders" style="max-height: 300px; overflow-y: auto;">
                        ${this.getRecentOrdersHTML()}
                    </div>
                </div>
                
                <!-- Recent Messages -->
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Recent Contact Messages</h3>
                    <div id="recentMessages" style="max-height: 300px; overflow-y: auto;">
                        ${this.getRecentMessagesHTML()}
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div style="margin-top: 30px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>Quick Actions</h3>
                <div style="display: flex; gap: 15px; margin-top: 15px;">
                    <button class="btn" onclick="adminPanel.loadSection('products')">➕ Add New Product</button>
                    <button class="btn" onclick="adminPanel.viewAllOrders()">📋 View All Orders</button>
                    <button class="btn" onclick="adminPanel.exportData()">📊 Export Data</button>
                    <button class="btn" onclick="adminPanel.clearTestData()" style="background: #dc3545;">🗑️ Clear Test Data</button>
                </div>
            </div>
        `;
        
        // Refresh stats
        this.loadDashboardData();
    }

    getRecentOrdersHTML() {
        if (!this.orders || this.orders.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 20px;">No orders yet</p>';
        }
        
        const recentOrders = this.orders.slice(0, 5);
        return recentOrders.map(order => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${order.orderId || 'N/A'}</strong>
                    <span>₹${order.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div style="font-size: 12px; color: #666;">
                    ${new Date(order.paymentDate || order.createdAt || Date.now()).toLocaleDateString()}
                    • ${order.items?.length || 0} items
                    ${order.status ? `• <span style="color: ${order.status === 'paid' ? '#28a745' : '#ffc107'}">${order.status}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    getRecentMessagesHTML() {
        if (!this.contactMessages || this.contactMessages.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 20px;">No messages yet</p>';
        }
        
        const recentMessages = this.contactMessages.slice(0, 5);
        return recentMessages.map(msg => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${msg.name || 'Anonymous'}</strong>
                    <small>${new Date(msg.timestamp || Date.now()).toLocaleDateString()}</small>
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    ${msg.email || 'No email'}
                    • ${this.formatSubject(msg.subject)}
                </div>
                <div style="font-size: 13px; margin-top: 5px;">
                    ${(msg.message || '').substring(0, 80)}...
                </div>
            </div>
        `).join('');
    }

    formatSubject(subject) {
        const subjects = {
            'bulk-order': 'Bulk Order',
            'custom-printing': 'Custom Printing',
            'product-info': 'Product Info',
            'shipping': 'Shipping',
            'returns': 'Returns',
            'other': 'Other'
        };
        return subjects[subject] || subject || 'General Inquiry';
    }

    loadProductsSection(container) {
        container.innerHTML = `
            <h1>Product Management</h1>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div>
                    <input type="text" id="productSearch" placeholder="Search products..." 
                           style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button class="btn" onclick="adminPanel.showAddProductForm()">➕ Add New Product</button>
            </div>
            
            <div id="productsList" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ${this.getProductsListHTML()}
            </div>
            
            <!-- Add Product Form (hidden by default) -->
            <div id="addProductForm" style="display: none; background: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>Add New Product</h3>
                <form id="newProductForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <label>Product Name</label>
                            <input type="text" name="name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label>Price (₹)</label>
                            <input type="number" name="price" required min="0" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Description</label>
                        <textarea name="description" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn">Save Product</button>
                        <button type="button" class="btn" onclick="adminPanel.hideAddProductForm()" style="background: #6c757d;">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        // Setup form submission
        const form = document.getElementById('newProductForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewProduct(new FormData(form));
            });
        }
        
        // Setup search
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    getProductsListHTML() {
        if (!this.products || this.products.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #666;">No products found. Add your first product!</div>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">ID</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Name</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Price</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Category</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.products.map(product => `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 15px;">${product.id || 'N/A'}</td>
                            <td style="padding: 15px;">
                                <strong>${product.name || 'Unnamed'}</strong>
                                ${product.description ? `<br><small style="color: #666;">${product.description.substring(0, 50)}...</small>` : ''}
                            </td>
                            <td style="padding: 15px;">₹${product.price || '0.00'}</td>
                            <td style="padding: 15px;">${product.category || 'General'}</td>
                            <td style="padding: 15px;">
                                <button onclick="adminPanel.editProduct(${product.id})" class="btn" style="padding: 5px 10px; font-size: 12px;">✏️ Edit</button>
                                <button onclick="adminPanel.deleteProduct(${product.id})" class="btn" style="padding: 5px 10px; font-size: 12px; background: #dc3545;">🗑️ Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    loadOrdersSection(container) {
        container.innerHTML = `
            <h1>Order Management</h1>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="orderSearch" placeholder="Search orders by ID or customer..." 
                       style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div id="ordersList" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ${this.getOrdersListHTML()}
            </div>
        `;
    }

    getOrdersListHTML() {
        if (!this.orders || this.orders.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #666;">No orders found.</div>';
        }
        
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Order ID</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Date</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Customer</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Items</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Total</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Status</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #dee2e6;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr style="border-bottom: 1px solid #dee2e6;">
                            <td style="padding: 15px;">
                                <strong>${order.orderId || 'N/A'}</strong>
                                ${order.paymentMethod ? `<br><small>${order.paymentMethod.toUpperCase()}</small>` : ''}
                            </td>
                            <td style="padding: 15px;">
                                ${new Date(order.paymentDate || order.createdAt || Date.now()).toLocaleDateString()}
                            </td>
                            <td style="padding: 15px;">
                                ${order.email || order.userEmail || 'No email'}<br>
                                <small style="color: #666;">${order.address?.city || ''}</small>
                            </td>
                            <td style="padding: 15px;">
                                ${order.items?.length || 0} items<br>
                                <small style="color: #666;">${order.items?.map(i => i.name).join(', ').substring(0, 30)}...</small>
                            </td>
                            <td style="padding: 15px;">
                                <strong>₹${order.total?.toFixed(2) || '0.00'}</strong>
                            </td>
                            <td style="padding: 15px;">
                                <span style="padding: 5px 10px; border-radius: 20px; background: ${this.getStatusColor(order.status)}; color: white; font-size: 12px;">
                                    ${order.status || 'pending'}
                                </span>
                            </td>
                            <td style="padding: 15px;">
                                <button onclick="adminPanel.viewOrderDetails('${order.orderId}')" class="btn" style="padding: 5px 10px; font-size: 12px;">👁️ View</button>
                                <button onclick="adminPanel.updateOrderStatus('${order.orderId}')" class="btn" style="padding: 5px 10px; font-size: 12px;">🔄 Update</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getStatusColor(status) {
        const colors = {
            'paid': '#28a745',
            'pending': '#ffc107',
            'processing': '#17a2b8',
            'shipped': '#007bff',
            'delivered': '#6f42c1',
            'cancelled': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }

    loadCustomersSection(container) {
        container.innerHTML = `
            <h1>Customer Management</h1>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
                <!-- Customers List -->
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Customers (${this.getUniqueCustomers(this.orders)})</h3>
                    <div style="max-height: 400px; overflow-y: auto;">
                        ${this.getCustomersListHTML()}
                    </div>
                </div>
                
                <!-- Current Cart/Wishlist Data -->
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Current Activity</h3>
                    <div style="margin-top: 15px;">
                        <div style="margin-bottom: 15px;">
                            <h4>🛒 Active Carts: ${this.cartData?.length || 0}</h4>
                            <small>Items currently in carts</small>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <h4>❤️ Wishlist Items: ${this.wishlistData?.length || 0}</h4>
                            <small>Items saved in wishlists</small>
                        </div>
                        <div>
                            <h4>📨 Contact Messages: ${this.contactMessages?.length || 0}</h4>
                            <small>Pending inquiries</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCustomersListHTML() {
        if (!this.orders || this.orders.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 20px;">No customers found.</p>';
        }
        
        // Get unique customers
        const customers = {};
        this.orders.forEach(order => {
            const email = order.email || order.userEmail;
            if (email && !customers[email]) {
                customers[email] = {
                    email: email,
                    name: order.address?.name || 'Unknown',
                    orders: 1,
                    totalSpent: order.total || 0,
                    city: order.address?.city || 'Unknown'
                };
            } else if (email) {
                customers[email].orders += 1;
                customers[email].totalSpent += (order.total || 0);
            }
        });
        
        const customerList = Object.values(customers);
        
        return customerList.map(customer => `
            <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong>${customer.name}</strong><br>
                        <small style="color: #666;">${customer.email}</small>
                    </div>
                    <div style="text-align: right;">
                        <strong>₹${customer.totalSpent.toFixed(2)}</strong><br>
                        <small style="color: #666;">${customer.orders} order(s)</small>
                    </div>
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    📍 ${customer.city}
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    showAddProductForm() {
        const form = document.getElementById('addProductForm');
        if (form) form.style.display = 'block';
    }

    hideAddProductForm() {
        const form = document.getElementById('addProductForm');
        if (form) form.style.display = 'none';
    }

    addNewProduct(formData) {
        const newProduct = {
            id: Date.now(),
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description'),
            category: 'General',
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        
        alert('✅ Product added successfully!');
        this.hideAddProductForm();
        this.loadSection('products');
    }

    editProduct(productId) {
        alert(`Edit product ${productId} - To be implemented`);
        // Implementation for editing products
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            const updatedProducts = products.filter(p => p.id !== productId);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            alert('✅ Product deleted!');
            this.loadSection('products');
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (order) {
            alert(`Order Details:\n\nID: ${order.orderId}\nTotal: ₹${order.total}\nItems: ${order.items?.length || 0}\nStatus: ${order.status}`);
        }
    }

    updateOrderStatus(orderId) {
        const newStatus = prompt('Enter new status (paid, processing, shipped, delivered, cancelled):', 'processing');
        if (newStatus) {
            const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            const orderIndex = orders.findIndex(o => o.orderId === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
                localStorage.setItem('orderHistory', JSON.stringify(orders));
                alert('✅ Order status updated!');
                this.loadSection('orders');
            }
        }
    }

    viewAllOrders() {
        this.loadSection('orders');
    }

    exportData() {
        const data = {
            orders: this.orders,
            customers: this.getCustomersListHTML(),
            products: this.products,
            messages: this.contactMessages,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `mybrand-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('📥 Data exported successfully!');
    }

    clearTestData() {
        if (confirm('WARNING: This will clear ALL test data including orders, messages, and products. Continue?')) {
            localStorage.removeItem('orderHistory');
            localStorage.removeItem('contactMessages');
            localStorage.removeItem('products');
            localStorage.removeItem('cart');
            localStorage.removeItem('wishlist');
            alert('✅ All test data cleared!');
            location.reload();
        }
    }

    searchProducts(query) {
        // Implement product search
        console.log('Searching products:', query);
    }
}



// Add to AdminPanel constructor
constructor() {
    this.ADMIN_PASSWORD = "mybrand123"; // Change this!
    this.showLoginIfNeeded();
    this.init();
}

showLoginIfNeeded() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const isDebugMode = window.location.hash.includes('debug');
    
    if (!isLoggedIn && !isDebugMode) {
        const loginDiv = document.createElement('div');
        loginDiv.id = 'adminLoginOverlay';
        loginDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    text-align: center;
                ">
                    <h2 style="color: #2c3e50;">🔒 Admin Access</h2>
                    <form id="adminLoginForm" style="margin: 20px 0;">
                        <input type="password" 
                               id="adminPasswordInput" 
                               placeholder="Enter admin password"
                               style="
                                   padding: 12px;
                                   width: 250px;
                                   border: 1px solid #ddd;
                                   border-radius: 4px;
                                   margin-bottom: 15px;
                               ">
                        <br>
                        <button type="submit" 
                                style="
                                    padding: 10px 30px;
                                    background: #2c3e50;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                    cursor: pointer;
                                ">
                            Login
                        </button>
                    </form>
                    <p style="color: #666; font-size: 12px;">
                        Default password: mybrand123<br>
                        <small>(Change this in admin.js!)</small>
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(loginDiv);
        
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('adminPasswordInput').value;
            if (password === this.ADMIN_PASSWORD) {
                localStorage.setItem('adminLoggedIn', 'true');
                document.getElementById('adminLoginOverlay').remove();
                this.init();
            } else {
                alert('❌ Incorrect password!');
            }
        });
    } else {
        this.init();
    }
}




// Initialize admin panel when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});
