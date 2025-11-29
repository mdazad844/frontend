// Delivery Charges Calculator Page
class DeliveryCalculator {
    constructor() {
        this.shippingCalculator = new ShippingCalculator();
        this.init();
    }

    init() {
        console.log('Delivery Calculator initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('deliveryCalculatorForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateDeliveryCharges();
        });

        // Auto-calculate weight based on t-shirt count
        document.getElementById('packageWeight').addEventListener('input', (e) => {
            this.updateWeightInfo();
        });
    }

    updateWeightInfo() {
        const weight = parseFloat(document.getElementById('packageWeight').value) || 0;
        const tshirtCount = Math.round(weight / 0.3);
        const infoElement = document.querySelector('.weight-info');
        
        if (infoElement && weight > 0) {
            infoElement.innerHTML = `
                <strong>💡 Weight Reference:</strong>
                <div>• ${weight.toFixed(1)} kg ≈ ${tshirtCount} T-shirt(s)</div>
                <div>• Minimum chargeable weight: 0.1 kg</div>
            `;
        }
    }

    async calculateDeliveryCharges() {
        const pincode = document.getElementById('deliveryPincode').value.trim();
        const weight = parseFloat(document.getElementById('packageWeight').value);
        const orderValue = parseFloat(document.getElementById('orderValue').value) || 0;

        // Validation
        if (!this.validateInputs(pincode, weight)) {
            return;
        }

        // Show loading
        this.showLoading();
        this.hideError();
        this.showResultsSection();

        try {
            console.log(`📦 Calculating delivery for: ${pincode}, ${weight}kg, ₹${orderValue}`);
            
            const deliveryOptions = await this.shippingCalculator.getAllShippingOptions(
                pincode, 
                weight, 
                orderValue
            );

            this.displayResults(deliveryOptions, pincode, weight, orderValue);
            
        } catch (error) {
            console.error('❌ Delivery calculation error:', error);
            this.showError('Failed to calculate delivery charges. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    validateInputs(pincode, weight) {
        // Clear previous errors
        this.hideError();

        if (!pincode || pincode.length !== 6) {
            this.showError('Please enter a valid 6-digit pincode.');
            return false;
        }

        if (!weight || weight <= 0) {
            this.showError('Please enter a valid package weight (minimum 0.1 kg).');
            return false;
        }

        if (weight > 50) {
            this.showError('Package weight cannot exceed 50 kg. Please contact us for bulk orders.');
            return false;
        }

        return true;
    }

    displayResults(deliveryOptions, pincode, weight, orderValue) {
        const resultsElement = document.getElementById('deliveryResults');
        const infoElement = document.getElementById('calculationInfo');

        // Update calculation info
        infoElement.innerHTML = `
            <strong>📦 Package Details:</strong>
            <div>• Delivery Pincode: ${pincode}</div>
            <div>• Package Weight: ${weight.toFixed(2)} kg</div>
            <div>• Order Value: ₹${orderValue}</div>
            <div>• Found ${deliveryOptions.length} delivery options</div>
        `;

        if (!deliveryOptions || deliveryOptions.length === 0) {
            resultsElement.innerHTML = `
                <div class="error-message">
                    <strong>No delivery options available</strong>
                    <p>Sorry, we couldn't find any delivery options for this location. Please try a different pincode or contact customer support.</p>
                </div>
            `;
            return;
        }

        // Display delivery options
        resultsElement.innerHTML = deliveryOptions.map(option => `
            <div class="delivery-option ${option.provider}">
                <div class="delivery-header">
                    <div class="delivery-name">${option.name}</div>
                    <div class="delivery-price">₹${option.charge}</div>
                </div>
                <div class="delivery-details">
                    <div>
                        <strong>Estimated Delivery:</strong> ${option.estimatedDays}
                    </div>
                    <div>
                        <span class="provider-badge provider-${option.provider}">
                            ${option.provider === 'shiprocket' ? 'Live Rates' : 'Standard'}
                        </span>
                    </div>
                </div>
                ${option.serviceType ? `<div style="margin-top: 8px; font-size: 12px; color: #888;">Service: ${option.serviceType}</div>` : ''}
            </div>
        `).join('');

        console.log('✅ Displayed delivery options:', deliveryOptions);
    }

    showLoading() {
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('deliveryResults').innerHTML = '';
        document.getElementById('calculateBtn').disabled = true;
        document.getElementById('calculateBtn').textContent = 'Calculating...';
    }

    hideLoading() {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('calculateBtn').disabled = false;
        document.getElementById('calculateBtn').textContent = 'Calculate Charges';
    }

    showResultsSection() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    showError(message) {
        const errorElement = document.getElementById('errorSection');
        errorElement.innerHTML = `<strong>Error:</strong> ${message}`;
        errorElement.style.display = 'block';
        
        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    // Test method for development
    async testMultipleScenarios() {
        const testScenarios = [
            { pincode: '400001', weight: 0.5, value: 500 },   // Mumbai
            { pincode: '110001', weight: 1.0, value: 1000 },  // Delhi
            { pincode: '560001', weight: 2.0, value: 2000 },  // Bangalore
            { pincode: '380001', weight: 0.3, value: 300 }    // Ahmedabad
        ];

        console.log('🧪 Testing multiple scenarios...');
        
        for (const scenario of testScenarios) {
            console.log(`Testing: ${scenario.pincode}, ${scenario.weight}kg`);
            const options = await this.shippingCalculator.getAllShippingOptions(
                scenario.pincode, 
                scenario.weight, 
                scenario.value
            );
            console.log(`Results for ${scenario.pincode}:`, options);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.deliveryCalculator = new DeliveryCalculator();
    
    // Optional: Test multiple scenarios (uncomment to use)
    // window.deliveryCalculator.testMultipleScenarios();
});