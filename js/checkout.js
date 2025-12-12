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

// CHECKOUT.JS - CLEANED VERSION (NO SHIPROCKET IN FRONTEND)
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
    }

    // ✅ REMOVED: Shiprocket methods (handled by backend)

    getFixedDeliveryOptions() {
        const orderValue = this.calculateSubtotal();
        return this.shippingCalculator.getManualShippingRates(orderValue);
    }

    getDeliveryPincode() {
        return this.selectedAddress?.pincode;
    }

    // ✅ SIMPLIFIED loadDeliveryOptions - Only calls backend
 // Replace your current loadDeliveryOptions method with this:
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
            <p>🔄 Calculating real-time shipping rates...</p>
        </div>
    `;

    try {
        const deliveryPincode = this.getDeliveryPincode();
        
        if (deliveryPincode) {
            console.log('🚀 Fetching REAL-TIME shipping rates for:', deliveryPincode);
            
            const orderValue = this.calculateSubtotal();
            const orderWeight = this.calculateOrderWeight();
            
            const response = await fetch(`${this.backendUrl}/api/shipping/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryPincode: deliveryPincode,
                    orderWeight: orderWeight,
                    orderValue: orderValue
                })
            });

            console.log('📊 Backend response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend response data:', data);
                
                if (data.success && data.shippingOptions && data.shippingOptions.length > 0) {
                    console.log('🎉 Using REAL Shiprocket rates!');
                    this.displayShippingOptions(data.shippingOptions, false);
                    return;
                } else {
                    console.log('⚠️ Backend success but no shipping options');
                }
            } else {
                console.log('❌ Backend error status:', response.status);
            }
        }
        
        // Fallback to manual rates only if backend fails
        console.log('📦 Using standard shipping options as fallback');
        const orderValue = this.calculateSubtotal();
        const manualRates = this.getFixedDeliveryOptions();
        this.displayShippingOptions(manualRates, true);
        
    } catch (error) {
        console.error('❌ Shipping calculation failed:', error);
        // Final fallback to manual rates
        const orderValue = this.calculateSubtotal();
        const manualRates = this.getFixedDeliveryOptions();
        this.displayShippingOptions(manualRates, true);
    }
}

    // KEEP ALL YOUR EXISTING METHODS BELOW - they remain the same
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
        this.updateElement('taxAmount', Math.round(subtotal * 0.05));
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

displayShippingOptions(options, isFallback = false) {
    console.log(`📦 Displaying ${options.length} shipping options`);
    
    const deliveryOptions = document.getElementById('deliveryOptions');
    if (!deliveryOptions) return;
    
    // 🚨 NEW CODE: Sort options by charge (DESCENDING - costliest first) and take top 5
    const sortedOptions = [...options]  // Create a copy to avoid mutating original
        .sort((a, b) => b.charge - a.charge)  // Sort DESCENDING (b - a)
        .slice(0, 5);  // Take only first 5
    
    console.log(`🎯 Displaying top ${sortedOptions.length} costliest options`);
    
    deliveryOptions.innerHTML = `
        ${isFallback ? `
            <div style="text-align: center; margin-bottom: 15px; padding: 10px; background: #fff3cd; border-radius: 6px;">
                <strong>📦 Standard Shipping Options (Top 5 Costliest)</strong>
            </div>
        ` : `
            <div style="text-align: center; margin-bottom: 15px; padding: 10px; background: #d4edda; border-radius: 6px;">
                <strong>🚀 Real-time Shipping Rates (Top 5 Costliest)</strong>
            </div>
        `}
        ${sortedOptions.map(option => `
            <div class="delivery-option" onclick="window.checkoutManager.selectShippingOption(this, ${option.charge})">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 5px 0;">${option.name}</h4>
                        <p style="margin: 0; font-size: 13px; color: #666;">
                            📅 ${option.estimatedDays} • 
                            ${option.provider || 'Shiprocket'}
                        </p>
                    </div>
                    <p class="delivery-price" style="font-size: 18px; font-weight: bold;">
                        ${option.charge === 0 ? 'FREE' : `₹${option.charge}`}
                    </p>
                </div>
            </div>
        `).join('')}
    `;

    // Auto-select first (now the MOST EXPENSIVE) option
    if (sortedOptions.length > 0) {
        const firstOption = deliveryOptions.querySelector('.delivery-option');
        if (firstOption) {
            this.selectShippingOption(firstOption, sortedOptions[0].charge);
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
    const deliveryCharge = this.selectedDelivery || 0;
    
    // ✅ CORRECTED: Calculate 5% tax on (subtotal + deliveryCharge)
    const taxableAmount = subtotal + deliveryCharge;
    const tax = Math.round(taxableAmount * 0.05);
    
    const grandTotal = subtotal + tax + deliveryCharge;
    
    // Log for debugging
    console.log(`💰 Tax Calculation:`);
    console.log(`   - Subtotal: ₹${subtotal}`);
    console.log(`   - Delivery: ₹${deliveryCharge}`);
    console.log(`   - Taxable Amount (Subtotal + Delivery): ₹${taxableAmount}`);
    console.log(`   - 5% GST on Taxable Amount: ₹${tax}`);
    console.log(`   - Grand Total: ₹${grandTotal}`);

    // Update all display elements
    this.updateElement('subtotal', subtotal);
    this.updateElement('taxAmount', tax);
    
    // Update delivery charge display (special handling for FREE)
    const deliveryChargeElement = document.getElementById('deliveryCharge');
    if (deliveryChargeElement) {
        deliveryChargeElement.textContent = deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`;
    }
    
    this.updateElement('grandTotal', grandTotal);
    
    console.log('✅ Totals updated (5% GST on products + delivery)');
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
        const tax = Math.round(subtotal * 0.05);
        
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
}

// ✅ GLOBAL FUNCTIONS
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




