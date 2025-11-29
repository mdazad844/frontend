// Checkout Page JavaScript

// ✅ Add missing ShippingAPI class if not imported from another file
class ShippingAPI {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'https://backend-production-c281a.up.railway.app';
    }

    async getShippingRates(deliveryPincode, orderWeight, orderValue) {
        try {
            console.log('🔄 Fetching shipping rates from backend...');

            const response = await fetch(`${this.baseURL}/api/shipping/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deliveryPincode,
                    orderWeight,
                    orderValue,
                    dimensions: { length: 10, width: 10, height: 10 }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Shipping rates received from backend:', data);
            
            return data.shippingOptions || [];
        } catch (error) {
            console.error('❌ Failed to fetch shipping rates:', error);
            return [];
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/api/health`);
            const data = await response.json();
            return { 
                working: response.ok, 
                status: data.status,
                message: data.message 
            };
        } catch (error) {
            return { 
                working: false, 
                error: error.message 
            };
        }
    }
}

// ✅ Add missing ShippingCalculator class
class ShippingCalculator {
    constructor() {
        this.api = new ShippingAPI();
        this.cache = new Map();
    }

    async getAllShippingOptions(deliveryPincode, orderWeight, orderValue) {
        const cacheKey = `${deliveryPincode}_${orderWeight}_${orderValue}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < 300000)) {
            console.log('📦 Using cached shipping rates');
            return cached.data;
        }

        let allOptions = [];

        try {
            console.log('🔄 Fetching real-time shipping rates...');
            const apiRates = await this.api.getShippingRates(deliveryPincode, orderWeight, orderValue);
            
            if (apiRates && apiRates.length > 0) {
                allOptions.push(...apiRates);
                console.log('✅ API rates found:', apiRates.length, 'options');
            } else {
                console.log('ℹ️ No API rates available, using manual rates');
            }
        } catch (error) {
            console.log('⚠️ API rates unavailable, using manual rates');
        }

        if (allOptions.length === 0) {
            allOptions.push(...this.getManualShippingRates(orderValue));
        }

        const sortedOptions = this.cleanAndSortOptions(allOptions);
        this.cache.set(cacheKey, {
            data: sortedOptions,
            timestamp: Date.now()
        });
        
        return sortedOptions;
    }

    getManualShippingRates(orderValue) {
        const rates = [];
        
        if (orderValue > 999) {
            rates.push({
                id: 'free_manual',
                name: 'Free Shipping',
                charge: 0,
                estimatedDays: '4-7 days',
                provider: 'manual',
                serviceType: 'free'
            });
        }
        
        rates.push(
            {
                id: 'standard_manual',
                name: 'Standard Delivery',
                charge: 50,
                estimatedDays: '5-8 days',
                provider: 'manual',
                serviceType: 'standard'
            },
            {
                id: 'express_manual',
                name: 'Express Delivery',
                charge: 100,
                estimatedDays: '2-3 days',
                provider: 'manual',
                serviceType: 'express'
            }
        );
        
        return rates;
    }

    cleanAndSortOptions(options) {
        if (!options || !Array.isArray(options)) {
            return this.getManualShippingRates(0);
        }
        
        const uniqueOptions = options.filter((option, index, self) =>
            index === self.findIndex(o => o.id === option.id && o.charge === option.charge)
        );
        
        return uniqueOptions.sort((a, b) => a.charge - b.charge);
    }

    clearCache() {
        this.cache.clear();
        console.log('🗑️ Shipping cache cleared');
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



   

// ✅ Global functions for HTML - FIXED
window.showAddAddressForm = function() {
    checkoutManager.showAddAddressForm();
};

window.hideAddAddressForm = function() {
    checkoutManager.hideAddAddressForm();
};

window.proceedToPayment = function(event) {
    event.preventDefault();
    checkoutManager.proceedToPayment();
};

window.retryShippingCalculation = function() {
    checkoutManager.shippingCalculator.clearCache();
    checkoutManager.resetAndReloadShipping();
};



// ✅ Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkoutManager.init();
});