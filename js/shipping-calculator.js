// shipping-calculator.js - Updated for Backend API
class ShippingCalculator {
    constructor() {
        this.api = new ShippingAPI(); // Use the backend API class
        this.cache = new Map();
        console.log('🚚 ShippingCalculator initialized - Using Backend API');
    }

    // ✅ SIMPLIFIED WEIGHT CALCULATION - 0.3kg PER T-SHIRT
    calculateBulkWeight(itemCount) {
        const chargeableWeight = 0.3 * itemCount;
        console.log(`👕 Fixed weight pricing: ${itemCount} t-shirts × 0.3kg = ${chargeableWeight}kg`);
        return Math.max(chargeableWeight, 0.3); // Minimum 0.3kg
    }

    // ✅ MAIN METHOD FOR BULK ORDERS
    async getAllShippingOptions(pincode, weight, orderValue, itemCount = 1) {
        console.log(`🚀 Bulk shipping: ${itemCount} items, ${weight}kg to ${pincode}`);
        
        const cacheKey = `${pincode}_${weight}_${orderValue}_${itemCount}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < 300000)) {
            console.log('📦 Using cached shipping rates');
            return cached.data;
        }

        try {
            // Try to get rates from backend API
            const apiRates = await this.api.getShippingRates(pincode, weight, orderValue);
            
            if (apiRates && apiRates.length > 0) {
                console.log('✅ Using backend API rates');
                this.cache.set(cacheKey, {
                    data: apiRates,
                    timestamp: Date.now()
                });
                return apiRates;
            }
            throw new Error('No rates from backend API');
        } catch (error) {
            console.log('🔄 Using calculated bulk rates (backend unavailable)');
            const fallbackRates = this.getManualShippingRates(pincode, orderValue, weight, itemCount);
            this.cache.set(cacheKey, {
                data: fallbackRates,
                timestamp: Date.now()
            });
            return fallbackRates;
        }
    }

    // ✅ FALLBACK MANUAL RATES
    getManualShippingRates(pincode, orderValue, weight, itemCount = 1) {
        console.log(`📦 Manual rates: ${weight}kg (${itemCount} t-shirts) to ${pincode}`);
        
        const zoneRates = this.calculateBulkZoneRates(pincode, weight, itemCount);
        
        const rates = [
            {
                name: `Standard Delivery (${zoneRates.standard.days})`,
                charge: zoneRates.standard.price,
                estimatedDays: zoneRates.standard.days,
                provider: "manual",
                serviceType: "standard"
            },
            {
                name: `Express Delivery (${zoneRates.express.days})`,
                charge: zoneRates.express.price,
                estimatedDays: zoneRates.express.days,
                provider: "manual",
                serviceType: "express"
            }
        ];

        // Free shipping for orders above 999
        if (orderValue > 999) {
            rates.unshift({
                name: `Free Shipping (${zoneRates.standard.days})`,
                charge: 0,
                estimatedDays: zoneRates.standard.days,
                provider: "manual",
                serviceType: "free"
            });
        }
        
        return rates;
    }

    // ✅ ZONE RATES CALCULATION (same as before)
    calculateBulkZoneRates(pincode, weight, itemCount) {
        const pincodePrefix = pincode.substring(0, 3);
        
        const zoneConfig = {
            '110': { basePerKg: 30, zone: 'metro' },  // Delhi
            '400': { basePerKg: 32, zone: 'metro' },  // Mumbai  
            '560': { basePerKg: 30, zone: 'metro' },  // Bangalore
            '700': { basePerKg: 32, zone: 'metro' },  // Kolkata
            '500': { basePerKg: 38, zone: 'tier2' },  // Hyderabad
            '600': { basePerKg: 40, zone: 'tier2' },  // Chennai
            '300': { basePerKg: 42, zone: 'tier2' },  // Ahmedabad
            'default': { basePerKg: 45, zone: 'other' }
        };

        const zone = zoneConfig[pincodePrefix] || zoneConfig['default'];
        const basePrice = zone.basePerKg * weight;
        const bulkDiscount = Math.min(itemCount * 0.7, 25);
        
        const standardPrice = Math.round(basePrice * (1 - bulkDiscount/100));
        const expressPrice = Math.round(standardPrice * 1.8);

        const deliveryDays = {
            'metro': { standard: '4-5', express: '2-3' },
            'tier2': { standard: '5-7', express: '3-4' },
            'other': { standard: '6-8', express: '4-5' }
        };

        const days = deliveryDays[zone.zone];

        return {
            standard: { price: standardPrice, days: days.standard + ' days' },
            express: { price: expressPrice, days: days.express + ' days' }
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Shipping cache cleared');
    }

    // Utility method for delivery date calculation
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