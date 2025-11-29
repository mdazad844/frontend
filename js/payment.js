class PaymentManager {
    constructor() {
        try {
            console.log('🚀 Initializing PaymentManager...');
            
            // Check if we're in a browser environment
            if (typeof window === 'undefined') {
                throw new Error('Not in browser environment');
            }

            // Check for localStorage
            if (!window.localStorage) {
                throw new Error('localStorage is not available');
            }

            // Get user and order data
            const currentUserStr = localStorage.getItem('currentUser');
            const orderDataStr = localStorage.getItem('pendingOrder');
            
            console.log('📋 Raw localStorage data:', {
                currentUser: currentUserStr,
                orderData: orderDataStr
            });

            this.currentUser = null;
            this.orderData = null;

            if (currentUserStr) {
                try {
                    this.currentUser = JSON.parse(currentUserStr);
                } catch (e) {
                    console.error('❌ Failed to parse currentUser:', e);
                }
            }

            if (orderDataStr) {
                try {
                    this.orderData = JSON.parse(orderDataStr);
                } catch (e) {
                    console.error('❌ Failed to parse orderData:', e);
                }
            }

            // Get Razorpay key - simplified approach
            this.razorpayKey = this.getRazorpayKey();
            this.backendUrl = this.getBackendUrl();
            
            this.selectedPaymentMethod = 'razorpay';
            
            console.log('✅ PaymentManager initialized successfully');
            console.log('👤 Current user:', this.currentUser);
            console.log('📦 Order data:', this.orderData);
            console.log('🔑 Razorpay key available:', !!this.razorpayKey);
            console.log('🌐 Backend URL:', this.backendUrl);
            
            this.init();
            
        } catch (error) {
            console.error('❌ PaymentManager constructor failed:', error);
            this.showCriticalError('Failed to initialize payment system: ' + error.message);
        }
    }

    getRazorpayKey() {
        // Try multiple ways to get the Razorpay key
        const possibleKeys = [
            window.env?.RAZORPAY_KEY_ID,
            process?.env?.RAZORPAY_KEY_ID,
            'rzp_test_xxxxxxxxxxxx' // Fallback for development
        ];
        
        const key = possibleKeys.find(k => k && k !== 'rzp_test_xxxxxxxxxxxx');
        console.log('🔑 Razorpay key search result:', key ? 'Found' : 'Using fallback');
        return key || 'rzp_test_xxxxxxxxxxxx';
    }

    getBackendUrl() {
        const possibleUrls = [
            window.env?.REACT_APP_API_URL,
            process?.env?.REACT_APP_API_URL,
            'https://backend-production-c281a.up.railway.app'
        ];
        
        return possibleUrls.find(url => url) || 'https://backend-production-c281a.up.railway.app';
    }

    showCriticalError(message) {
        const messageElement = document.getElementById('paymentMessage');
        if (messageElement) {
            messageElement.innerHTML = `
                <div class="error-message">
                    <strong>System Error</strong>
                    <p>${message}</p>
                    <p>Please refresh the page or contact support.</p>
                    <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
            messageElement.style.display = 'block';
        }
        alert('Payment Error: ' + message);
    }

    init() {
        try {
            this.checkAuthentication();
            this.loadOrderSummary();
            this.setupEventListeners();
            console.log('✅ PaymentManager init completed');
        } catch (error) {
            console.error('❌ PaymentManager init failed:', error);
            this.showCriticalError('Initialization failed: ' + error.message);
        }
    }

    checkAuthentication() {
        console.log('🔐 Checking authentication...');
        
        if (!this.currentUser) {
            console.warn('⚠️ No user found, redirecting to login');
            alert('Please login to proceed with payment.');
            window.location.href = 'login.html';
            return;
        }

        if (!this.orderData) {
            console.warn('⚠️ No order data found, redirecting to checkout');
            alert('No order data found. Please complete checkout first.');
            window.location.href = 'checkout.html';
            return;
        }

        console.log('✅ Authentication check passed');
    }

    loadOrderSummary() {
        console.log('🎯 Loading order summary...');
        
        if (!this.orderData) {
            console.error('❌ No order data available for summary');
            this.showMessage('error', 'No order data found. Please complete checkout first.');
            return;
        }

        try {
            // Display order items
            const orderItemsContainer = document.getElementById('paymentOrderItems');
            if (orderItemsContainer) {
                if (this.orderData.items && this.orderData.items.length > 0) {
                    orderItemsContainer.innerHTML = this.orderData.items.map(item => `
                        <div class="order-item">
                            <span>${this.escapeHtml(item.name)} x${item.quantity}</span>
                            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('');
                } else {
                    orderItemsContainer.innerHTML = '<div class="order-item">No items in order</div>';
                }
            } else {
                console.error('❌ Order items container not found');
            }

            // Display shipping address if available
            this.displayShippingAddress();

            // Display totals
            this.updateElement('paymentSubtotal', this.orderData.subtotal || 0);
            this.updateElement('paymentTax', this.orderData.taxAmount || 0);
            this.updateElement('paymentDelivery', this.orderData.deliveryCharge || 0);
            this.updateElement('paymentTotal', this.orderData.total || 0);

            console.log('✅ Order summary loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load order summary:', error);
            this.showMessage('error', 'Failed to load order details. Please refresh the page.');
        }
    }

    displayShippingAddress() {
        const addressElement = document.getElementById('shippingAddress');
        const shippingInfo = document.getElementById('shippingInfo');
        
        if (addressElement && shippingInfo && this.orderData.address) {
            try {
                const addr = this.orderData.address;
                addressElement.innerHTML = `
                    <strong>Shipping to:</strong>
                    <div>${this.escapeHtml(addr.line1)}</div>
                    ${addr.line2 ? `<div>${this.escapeHtml(addr.line2)}</div>` : ''}
                    <div>${this.escapeHtml(addr.city)}, ${this.escapeHtml(addr.state)} - ${this.escapeHtml(addr.pincode)}</div>
                    <div>${this.escapeHtml(addr.country)}</div>
                `;
                shippingInfo.style.display = 'block';
            } catch (error) {
                console.error('❌ Failed to display shipping address:', error);
            }
        } else {
            console.warn('⚠️ Shipping address elements not found or no address data');
        }
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `₹${Number(value).toFixed(2)}`;
        } else {
            console.warn(`⚠️ Element not found: ${elementId}`);
        }
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        try {
            // Payment method selection
            const paymentRadios = document.querySelectorAll('input[name="payment"]');
            if (paymentRadios.length > 0) {
                paymentRadios.forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        this.selectPaymentMethod(e.target.value);
                    });
                });
            } else {
                console.warn('⚠️ No payment radio buttons found');
            }

            // Manual button event listeners
            const razorpayBtn = document.getElementById('razorpayButton');
            const codBtn = document.getElementById('codButton');
            
            if (razorpayBtn) {
                razorpayBtn.addEventListener('click', () => this.initiateRazorpayPayment());
            } else {
                console.error('❌ Razorpay button not found');
            }
            
            if (codBtn) {
                codBtn.addEventListener('click', () => this.confirmCODOrder());
            } else {
                console.error('❌ COD button not found');
            }

            console.log('✅ Event listeners setup completed');
            
        } catch (error) {
            console.error('❌ Failed to setup event listeners:', error);
        }
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        try {
            // Update UI
            document.querySelectorAll('.payment-method').forEach(el => {
                el.classList.remove('selected');
            });
            
            const selectedElement = document.querySelector(`input[value="${method}"]`);
            if (selectedElement) {
                selectedElement.closest('.payment-method').classList.add('selected');
            }
            
            // Show/hide buttons
            const razorpayBtn = document.getElementById('razorpayButton');
            const codBtn = document.getElementById('codButton');
            
            if (razorpayBtn && codBtn) {
                if (method === 'razorpay') {
                    razorpayBtn.style.display = 'block';
                    codBtn.style.display = 'none';
                } else {
                    razorpayBtn.style.display = 'none';
                    codBtn.style.display = 'block';
                }
            }
            
            console.log('💳 Payment method selected:', method);
            
        } catch (error) {
            console.error('❌ Failed to select payment method:', error);
        }
    }

    async initiateRazorpayPayment() {
        console.log('💳 Initiating Razorpay payment...');
        
        const paymentButton = document.getElementById('razorpayButton');
        const loadingElement = document.getElementById('paymentLoading');
        const messageElement = document.getElementById('paymentMessage');
        
        if (!this.orderData || !this.orderData.total) {
            this.showMessage('error', 'Invalid order data. Please try again.');
            return;
        }

        // Check if Razorpay is available
        if (typeof Razorpay === 'undefined') {
            this.showMessage('error', 'Payment service is currently unavailable. Please try again later.');
            return;
        }

        // Show loading
        if (paymentButton) paymentButton.disabled = true;
        if (loadingElement) loadingElement.style.display = 'block';
        if (messageElement) messageElement.style.display = 'none';

        try {
            // Create Razorpay order via backend
            const orderResponse = await this.createRazorpayOrder();
            
            if (!orderResponse.success) {
                throw new Error(orderResponse.error || 'Failed to create payment order');
            }

            const options = {
                key: this.razorpayKey,
                amount: Math.round(this.orderData.total * 100),
                currency: "INR",
                name: "MyBrand",
                description: `Order #${this.orderData.orderId}`,
                order_id: orderResponse.razorpayOrderId,
                handler: (response) => {
                    console.log('✅ Payment successful:', response);
                    this.handlePaymentSuccess(response);
                },
                prefill: {
                    name: this.currentUser?.name || '',
                    email: this.currentUser?.email || '',
                    contact: this.currentUser?.phone || ""
                },
                notes: {
                    order_id: this.orderData.orderId,
                    customer_email: this.currentUser?.email
                },
                theme: {
                    color: "#007bff"
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal closed');
                        if (paymentButton) paymentButton.disabled = false;
                        if (loadingElement) loadingElement.style.display = 'none';
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
            
        } catch (error) {
            console.error('❌ Payment initiation failed:', error);
            this.showMessage('error', `Payment failed: ${error.message}`);
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
            if (paymentButton) paymentButton.disabled = false;
        }
    }

    async createRazorpayOrder() {
        try {
            if (!this.orderData || !this.orderData.total) {
                throw new Error('Invalid order data');
            }

            const orderPayload = {
                amount: Math.round(this.orderData.total * 100),
                currency: "INR",
                receipt: this.orderData.orderId,
                notes: {
                    customer_email: this.currentUser?.email,
                    order_id: this.orderData.orderId,
                    items: this.orderData.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            };

            console.log('🔄 Creating Razorpay order via backend:', orderPayload);

            const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Backend error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Razorpay order created via backend:', data);
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create order');
            }
            
            return data;
            
        } catch (error) {
            console.error('❌ Order creation failed:', error);
            this.showMessage('error', `Order creation failed: ${error.message}`);
            throw error;
        }
    }

    async handlePaymentSuccess(paymentResponse) {
        const loadingElement = document.getElementById('paymentLoading');
        if (loadingElement) loadingElement.style.display = 'block';
        
        try {
            console.log('🔍 Verifying payment with backend:', paymentResponse);

            const verificationResponse = await this.verifyPayment(paymentResponse);
            
            if (verificationResponse.success) {
                await this.finalizeOrder(paymentResponse, 'razorpay');
                this.showMessage('success', 'Payment successful! Your order has been confirmed.');
                
                setTimeout(() => {
                    window.location.href = `order-success.html?order=${this.orderData.orderId}`;
                }, 2000);
                
            } else {
                throw new Error(verificationResponse.error || 'Payment verification failed');
            }
            
        } catch (error) {
            console.error('❌ Payment verification failed:', error);
            this.showMessage('error', 'Payment verification failed. Please contact support.');
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    async verifyPayment(paymentResponse) {
        try {
            console.log('🔍 Verifying payment with backend:', paymentResponse);

            const response = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    order_id: this.orderData.orderId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Payment verification result:', data);
            
            return data;
            
        } catch (error) {
            console.error('❌ Payment verification failed:', error);
            throw error;
        }
    }

    async finalizeOrder(paymentResponse, method) {
        try {
            this.orderData.paymentId = paymentResponse.razorpay_payment_id;
            this.orderData.razorpayOrderId = paymentResponse.razorpay_order_id;
            this.orderData.paymentMethod = method;
            this.orderData.paymentStatus = method === 'razorpay' ? 'paid' : 'pending';
            this.orderData.status = 'confirmed';
            this.orderData.paymentDate = new Date().toISOString();
            
            await this.saveOrderToBackend();
            this.saveOrderToHistory();
            
            console.log('✅ Order finalized:', this.orderData);
            
        } catch (error) {
            console.error('❌ Failed to finalize order:', error);
            throw error;
        }
    }

    async saveOrderToBackend() {
        try {
            const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.orderData)
            });

            if (!response.ok) {
                console.warn('⚠️ Failed to save order to backend, but continuing locally');
                return;
            }

            console.log('✅ Order saved to backend');
        } catch (error) {
            console.warn('⚠️ Backend order save failed, but continuing locally:', error);
        }
    }

    async confirmCODOrder() {
        if (confirm('Confirm Cash on Delivery order?\n\nYou will pay when you receive your order.')) {
            const loadingElement = document.getElementById('paymentLoading');
            if (loadingElement) loadingElement.style.display = 'block';
            
            try {
                await this.finalizeOrder({
                    razorpay_payment_id: null,
                    razorpay_order_id: null,
                    razorpay_signature: null
                }, 'cod');
                
                this.showMessage('success', `Order confirmed! You will pay ₹${this.orderData.total} when you receive your order.`);
                
                setTimeout(() => {
                    window.location.href = `order-success.html?order=${this.orderData.orderId}`;
                }, 2000);
                
            } catch (error) {
                console.error('❌ COD order failed:', error);
                this.showMessage('error', 'Failed to confirm COD order. Please try again.');
            } finally {
                if (loadingElement) loadingElement.style.display = 'none';
            }
        }
    }

    saveOrderToHistory() {
        try {
            const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            orders.unshift(this.orderData);
            localStorage.setItem('orderHistory', JSON.stringify(orders));
            
            localStorage.removeItem('pendingOrder');
            localStorage.removeItem('cart');
            
            console.log('✅ Order saved to local history:', this.orderData);
            
        } catch (error) {
            console.error('❌ Failed to save order locally:', error);
            throw error;
        }
    }

    showMessage(type, message) {
        const messageElement = document.getElementById('paymentMessage');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = type === 'error' ? 'error-message' : 'success-message';
            messageElement.style.display = 'block';
            
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        if (type === 'error') {
            alert(message);
        }
    }
}

// Global functions for HTML integration
function selectPaymentMethod(method) {
    if (window.paymentManager) {
        window.paymentManager.selectPaymentMethod(method);
    } else {
        console.log('Payment manager not loaded');
        alert('Payment system is loading. Please try again in a moment.');
    }
}

function initiateRazorpayPayment() {
    if (window.paymentManager) {
        window.paymentManager.initiateRazorpayPayment();
    } else {
        console.log('Payment manager not loaded');
        alert('Payment system is loading. Please try again in a moment.');
    }
}

function confirmCODOrder() {
    if (window.paymentManager) {
        window.paymentManager.confirmCODOrder();
    } else {
        console.log('Payment manager not loaded');
        alert('Payment system is loading. Please try again in a moment.');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Payment page loaded, initializing PaymentManager...');
    try {
        window.paymentManager = new PaymentManager();
        console.log('✅ PaymentManager assigned to window');
    } catch (error) {
        console.log('Failed to create PaymentManager:', error);
        const messageElement = document.getElementById('paymentMessage');
        if (messageElement) {
            messageElement.innerHTML = `
                <div class="error-message">
                    <strong>Critical Error</strong>
                    <p>Failed to initialize payment system: ${error.message}</p>
                    <p>Please refresh the page or contact support.</p>
                </div>
            `;
            messageElement.style.display = 'block';
        }
    }
});