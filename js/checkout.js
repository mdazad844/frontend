class ShippingCalculator {
    constructor() {
        this.backendUrl = 'https://backend-production-c281a.up.railway.app';
    }

    async getShippingRates(deliveryPincode, orderWeight, orderValue) {
        try {
            console.log('🔄 Fetching shipping rates from backend...');

            const response = await fetch(`${this.backendUrl}/api/shipping/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryPincode,
                    orderWeight,
                    orderValue
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Shipping rates received:', data);
            
            return data.shippingOptions || [];
        } catch (error) {
            console.error('❌ Failed to fetch shipping rates:', error);
            return this.getManualShippingRates(orderValue);
        }
    }

    getManualShippingRates(orderValue) {
        const rates = [];
        if (orderValue > 999) {
            rates.push({
                id: 'free_manual',
                name: 'Free Shipping',
                charge: 0,
                estimatedDays: '4-7 days',
                provider: 'manual'
            });
        }
        rates.push(
            {
                id: 'standard_manual',
                name: 'Standard Delivery',
                charge: 50,
                estimatedDays: '5-8 days',
                provider: 'manual'
            },
            {
                id: 'express_manual',
                name: 'Express Delivery',
                charge: 100,
                estimatedDays: '2-3 days',
                provider: 'manual'
            }
        );
        return rates;
    }

    calculateEstimatedDelivery(estimatedDays) {
        if (!estimatedDays) return 'Not available';
        
        const today = new Date();
        const days = estimatedDays.toString().includes('-') 
            ? parseInt(estimatedDays.split('-')[1]) 
            : parseInt(estimatedDays);
            
        if (isNaN(days)) return estimatedDays;
        
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + days);
        
        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// CHECKOUT.JS - FIXED VERSION
class CheckoutManager {
    constructor() {
        this.selectedAddress = null;
        this.selectedDelivery = null;
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        this.backendUrl = 'https://backend-production-c281a.up.railway.app';
        this.backendConnected = false;
        
        // ✅ Add shipping calculator
        this.shippingCalculator = new ShippingCalculator();
        
        console.log('🛒 CheckoutManager initialized');
    } // ✅ ADDED - closes constructor

    async init() {
        console.log('🚀 Initializing checkout...');
        
        await this.checkAuthentication();
        this.loadOrderSummary();
        this.loadAddresses();
        this.setupEventListeners();
        
        await this.testBackendConnection();
    }

    async testBackendConnection() {
        try {
            const response = await fetch(`${this.backendUrl}/api/health`);
            const data = await response.json();
            
            if (data.status === 'OK') {
                this.backendConnected = true;
                console.log('✅ Backend connected');
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
        }
    }

    checkAuthentication() {
        if (!this.currentUser) {
            // Create test user
            this.currentUser = {
                name: "Test User",
                email: "test@example.com",
                address: {
                    line1: "123 Test Street",
                    city: "Delhi", 
                    state: "DL",
                    pincode: "110001",
                    country: "India"
                }
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        if (this.cart.length === 0) {
            // Create test cart
            this.cart = [
                { id: 1, name: "Classic T-Shirt", price: 799, quantity: 2 },
                { id: 2, name: "Premium T-Shirt", price: 1299, quantity: 1 }
            ];
            localStorage.setItem('cart', JSON.stringify(this.cart));
        }
    }

    loadOrderSummary() {
        console.log('📊 Loading order summary...');
        const orderItems = document.getElementById('orderItems');
        const subtotal = this.calculateSubtotal();
        
        if (!orderItems) {
            console.error('❌ Order items element not found');
            return;
        }

        orderItems.innerHTML = this.cart.map(item => `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `).join('');

        // Update all summary elements
        this.updateElement('subtotal', subtotal);
        this.updateElement('taxAmount', Math.round(subtotal * 0.18));
        this.updateElement('deliveryCharge', 0);
        this.updateElement('grandTotal', subtotal + Math.round(subtotal * 0.18));
        
        console.log('✅ Order summary loaded');
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `₹${value}`;
        } else {
            console.error(`❌ Element #${elementId} not found`);
        }
    }

    loadAddresses() {
        console.log('🏠 Loading addresses...');
        const addressOptions = document.getElementById('addressOptions');
        
        if (!addressOptions) {
            console.error('❌ Address options element not found');
            return;
        }

        if (this.currentUser && this.currentUser.address) {
            addressOptions.innerHTML = `
                <div class="address-card selected" onclick="window.checkoutManager.selectAddress(this)">
                    <h4>📍 Delivery Address</h4>
                    <p><strong>${this.currentUser.address.line1}</strong></p>
                    <p>${this.currentUser.address.city}, ${this.currentUser.address.state} - ${this.currentUser.address.pincode}</p>
                    <p>${this.currentUser.address.country}</p>
                </div>
            `;
            this.selectedAddress = this.currentUser.address;
            
            // Show delivery section
            setTimeout(() => {
                this.showDeliverySection();
            }, 500);
            
        } else {
            addressOptions.innerHTML = `
                <div class="address-card" style="text-align: center; padding: 40px;">
                    <p>No address saved. Please add a delivery address.</p>
                    <button class="btn" onclick="window.showAddAddressForm()">Add Address</button>
                </div>
            `;
        }
    }

    selectAddress(addressElement) {
        console.log('📍 Address selected');
        
        document.querySelectorAll('.address-card').forEach(card => {
            card.classList.remove('selected');
        });
        addressElement.classList.add('selected');
        this.selectedAddress = this.currentUser.address;
        this.showDeliverySection();
    }

    showAddAddressForm() {
        console.log('📝 Showing add address form');
        document.getElementById('addressSection').style.display = 'none';
        document.getElementById('addAddressForm').style.display = 'block';
    }

    hideAddAddressForm() {
        console.log('📝 Hiding add address form');
        document.getElementById('addAddressForm').style.display = 'none';
        document.getElementById('addressSection').style.display = 'block';
    }

    async saveNewAddress(formData) {
        console.log('💾 Saving new address...');
        
        try {
            const newAddress = {
                line1: formData.get('line1'),
                line2: formData.get('line2'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode'),
                country: formData.get('country')
            };

            this.currentUser.address = newAddress;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            
            this.hideAddAddressForm();
            this.selectedAddress = newAddress;
            this.loadAddresses();
            
            console.log('✅ Address saved');
            alert('✅ Address saved successfully!');
            
        } catch (error) {
            console.error('Error saving address:', error);
            alert('❌ Error saving address. Please try again.');
        }
    }

    showDeliverySection() {
        console.log('🚚 Showing delivery section...');
        
        const deliverySection = document.getElementById('deliverySection');
        if (!deliverySection) {
            console.error('❌ Delivery section element not found');
            return;
        }

        deliverySection.style.display = 'block';
        this.loadDeliveryOptions();
    }

    async loadDeliveryOptions() {
        console.log('📦 Loading delivery options...');
        
        const deliveryOptions = document.getElementById('deliveryOptions');
        if (!deliveryOptions) {
            console.error('❌ Delivery options element not found');
            return;
        }

        // Show loading state
        deliveryOptions.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="border: 3px solid #f3f3f3; border-top: 3px solid #007bff; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p>🔄 Calculating shipping options...</p>
            </div>
        `;

        try {
            // Try backend first
            if (this.backendConnected && this.selectedAddress?.pincode) {
                const orderValue = this.calculateSubtotal();
                const orderWeight = this.calculateOrderWeight();
                
                const response = await fetch(`${this.backendUrl}/api/shipping/calculate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        deliveryPincode: this.selectedAddress.pincode,
                        orderWeight: orderWeight,
                        orderValue: orderValue
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.shippingOptions) {
                        this.displayShippingOptions(data.shippingOptions);
                        return;
                    }
                }
            }
            
            // Fallback to manual rates
            const orderValue = this.calculateSubtotal();
            const manualRates = this.getManualShippingRates(orderValue);
            this.displayShippingOptions(manualRates, true);
            
        } catch (error) {
            console.error('Shipping API failed:', error);
            const orderValue = this.calculateSubtotal();
            const manualRates = this.getManualShippingRates(orderValue);
            this.displayShippingOptions(manualRates, true);
        }
    }

    getManualShippingRates(orderValue) {
        const rates = [];
        if (orderValue > 999) {
            rates.push({
                id: 'free_manual',
                name: 'Free Shipping',
                charge: 0,
                estimatedDays: '4-7 days',
                provider: 'manual'
            });
        }
        rates.push(
            {
                id: 'standard_manual',
                name: 'Standard Delivery',
                charge: 50,
                estimatedDays: '5-8 days',
                provider: 'manual'
            },
            {
                id: 'express_manual',
                name: 'Express Delivery',
                charge: 100,
                estimatedDays: '2-3 days',
                provider: 'manual'
            }
        );
        return rates;
    }

    displayShippingOptions(options, isFallback = false) {
        console.log(`📦 Displaying ${options.length} shipping options`);
        
        const deliveryOptions = document.getElementById('deliveryOptions');
        if (!deliveryOptions) return;

        deliveryOptions.innerHTML = `
            ${isFallback ? `
                <div style="text-align: center; margin-bottom: 15px; padding: 10px; background: #fff3cd; border-radius: 6px;">
                    <strong>📦 Standard Shipping Options</strong>
                </div>
            ` : ''}
            ${options.map(option => `
                <div class="delivery-option" onclick="window.checkoutManager.selectShippingOption(this, ${option.charge})">
                    <h4>${option.name}</h4>
                    <p>📅 Estimated delivery: ${option.estimatedDays}</p>
                    <p class="delivery-price">${option.charge === 0 ? 'FREE' : `₹${option.charge}`}</p>
                </div>
            `).join('')}
        `;

        // Auto-select first option
        if (options.length > 0) {
            const firstOption = deliveryOptions.querySelector('.delivery-option');
            if (firstOption) {
                this.selectShippingOption(firstOption, options[0].charge);
            }
        }
    }

    selectShippingOption(optionElement, charge) {
        console.log(`🚚 Shipping option selected: ₹${charge}`);
        
        document.querySelectorAll('.delivery-option').forEach(option => {
            option.classList.remove('selected');
        });
        optionElement.classList.add('selected');
        
        this.selectedDelivery = charge;
        this.updateTotals();
        this.showPaymentSection();
    }

    showPaymentSection() {
        console.log('💳 Showing payment section');
        
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) {
            paymentSection.style.display = 'block';
        }
    }

    calculateOrderWeight() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        return Math.max(totalItems * 0.3, 0.1);
    }

    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateTotals() {
        const subtotal = this.calculateSubtotal();
        const tax = Math.round(subtotal * 0.18);
        const deliveryCharge = this.selectedDelivery || 0;
        const grandTotal = subtotal + tax + deliveryCharge;

        this.updateElement('subtotal', subtotal);
        this.updateElement('taxAmount', tax);
        document.getElementById('deliveryCharge').textContent = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`;
        this.updateElement('grandTotal', grandTotal);
        
        console.log('💰 Totals updated');
    }

    proceedToPayment(event) {
        if (event) event.preventDefault();
        console.log('🔄 Proceeding to payment...');

        if (!this.selectedAddress) {
            alert('❌ Please select a delivery address.');
            return;
        }

        if (this.selectedDelivery === null) {
            alert('❌ Please select a delivery option.');
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        if (!paymentMethod) {
            alert('❌ Please select a payment method.');
            return;
        }

        // Create order
        const subtotal = this.calculateSubtotal();
        const tax = Math.round(subtotal * 0.18);
        
        const pendingOrder = {
            orderId: 'MB' + Date.now(),
            items: [...this.cart],
            subtotal: subtotal,
            taxAmount: tax,
            deliveryCharge: this.selectedDelivery,
            total: subtotal + tax + this.selectedDelivery,
            address: this.selectedAddress,
            paymentMethod: paymentMethod,
            status: 'pending'
        };

        localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
        console.log('✅ Order saved, redirecting...');
        
        window.location.href = 'payment.html';
    }

    setupEventListeners() {
        const newAddressForm = document.getElementById('newAddressForm');
        if (newAddressForm) {
            newAddressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                this.saveNewAddress(formData);
            });
        }
    }
} // ✅ ADDED - closes CheckoutManager class

// ✅ GLOBAL FUNCTIONS - MUST BE DEFINED BEFORE DOM LOADS
window.showAddAddressForm = function() {
    if (window.checkoutManager) {
        window.checkoutManager.showAddAddressForm();
    } else {
        console.error('CheckoutManager not initialized');
    }
};

window.hideAddAddressForm = function() {
    if (window.checkoutManager) {
        window.checkoutManager.hideAddAddressForm();
    } else {
        console.error('CheckoutManager not initialized');
    }
};

window.proceedToPayment = function(event) {
    if (window.checkoutManager) {
        window.checkoutManager.proceedToPayment(event);
    } else {
        console.error('CheckoutManager not initialized');
        alert('System is loading. Please try again.');
    }
};

// ✅ Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing checkout...');
    window.checkoutManager = new CheckoutManager();
    window.checkoutManager.init();
});









async calculateShiprocketCharges(deliveryPincode) {
    try {
        console.log('🚀 Calculating Shiprocket delivery charges for:', deliveryPincode);
        
        // First, get authentication token
        const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'your_shiprocket_email',
                password: 'your_shiprocket_password'
            })
        });

        if (!authResponse.ok) {
            throw new Error('Shiprocket authentication failed');
        }

        const authData = await authResponse.json();
        const token = authData.token;

        // Calculate shipping rates
        const rateResponse = await fetch('https://apiv2.shiprocket.in/v1/external/courier/serviceability/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pickup_postcode: 'YOUR_PICKUP_PINCODE', // Your warehouse pincode
                delivery_postcode: deliveryPincode,
                weight: this.calculateTotalWeight(), // Calculate from cart items
                length: 10,
                breadth: 10,
                height: 10,
                cod: 0 // 0 for prepaid, 1 for COD
            })
        });

        if (!rateResponse.ok) {
            throw new Error('Shiprocket rate calculation failed');
        }

        const rateData = await rateResponse.json();
        console.log('📦 Shiprocket API Response:', rateData);
        
        return this.formatShiprocketOptions(rateData);
        
    } catch (error) {
        console.error('❌ Shiprocket API Error:', error);
        // Fallback to fixed charges
        return this.getFixedDeliveryOptions();
    }
}

formatShiprocketOptions(rateData) {
    if (!rateData.data || !rateData.data.available_courier_companies) {
        console.warn('⚠️ No courier companies available, using fallback');
        return this.getFixedDeliveryOptions();
    }

    const shippingOptions = rateData.data.available_courier_companies.map(courier => ({
        id: courier.courier_company_id,
        name: courier.courier_name,
        charge: courier.rate,
        estimated_days: courier.estimated_delivery_days,
        serviceable: courier.is_surface === 1 ? 'Surface' : 'Air'
    }));

    console.log('🚚 Shiprocket Shipping Options:', shippingOptions);
    return shippingOptions;
}

calculateTotalWeight() {
    // Calculate total weight from cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.weight || 0.5) * item.quantity, 0);
}


// In your loadDeliveryOptions method, replace the fixed options with:
async loadDeliveryOptions() {
    console.log('🚚 Loading REAL shipping options from Shiprocket...');
    
    const deliveryPincode = this.getDeliveryPincode(); // Get from address form
    
    if (deliveryPincode) {
        const shiprocketOptions = await this.calculateShiprocketCharges(deliveryPincode);
        this.displayShippingOptions(shiprocketOptions);
    } else {
        // Show fixed options as fallback
        const fixedOptions = this.getFixedDeliveryOptions();
        this.displayShippingOptions(fixedOptions);
    }
}






