class PaymentManager {
  constructor() {
    this.razorpayKey = 'rzp_live_RjHl3rUztQ050N';
    this.backendUrl = 'https://backend-production-c281a.up.railway.app';
    this.init();
  }

  init() {
    this.loadOrderSummary();
    this.setupEventListeners();
    console.log('✅ PaymentManager ready');
  }

  loadOrderSummary() {
    try {
        const orderData = JSON.parse(localStorage.getItem('pendingOrder'));
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!orderData || !currentUser) {
            this.showError('No order data found. Please complete checkout.');
            return;
        }

        this.orderData = orderData;
        this.currentUser = currentUser;

        // Display order items
        const itemsContainer = document.getElementById('paymentOrderItems');
        if (itemsContainer && orderData.items) {
            itemsContainer.innerHTML = orderData.items.map(item => `
                <div class="order-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');
        }

        // ✅✅✅ FIXED: Calculate tax correctly for display
        const subtotal = orderData.subtotal || 0;
        const deliveryCharge = orderData.deliveryCharge || 0;
        
        // Recalculate tax to ensure it's 5% on (subtotal + delivery)
        const taxableAmount = subtotal + deliveryCharge;
        const correctTax = Math.round(taxableAmount * 0.05);
        
        // Update the orderData with correct tax
        this.orderData.taxAmount = correctTax;
        
        // Update ALL total fields with correct calculations
        this.updateElement('paymentSubtotal', subtotal);
        this.updateElement('paymentTax', correctTax);
        this.updateElement('paymentDelivery', deliveryCharge);
        this.updateElement('paymentTotal', subtotal + correctTax + deliveryCharge);
        
        console.log('📊 Payment Summary:');
        console.log(`   - Subtotal: ₹${subtotal}`);
        console.log(`   - Delivery: ₹${deliveryCharge}`);
        console.log(`   - Taxable Amount: ₹${taxableAmount}`);
        console.log(`   - 5% GST: ₹${correctTax}`);
        console.log(`   - Grand Total: ₹${subtotal + correctTax + deliveryCharge}`);
        
    } catch (error) {
        console.error('❌ Failed to load order:', error);
        this.showError('Failed to load order details.');
    }
}
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = `₹${Number(value).toFixed(2)}`;
  }

  setupEventListeners() {
    const razorpayBtn = document.getElementById('razorpayButton');
    if (razorpayBtn) {
      razorpayBtn.addEventListener('click', () => this.initiatePayment());
    }
  }

  async initiatePayment() {
    const button = document.getElementById('razorpayButton');
    button.disabled = true;

    try {
      // 1. Create Razorpay order
      const orderResponse = await this.createRazorpayOrder();
      
      if (!orderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      // 2. Open Razorpay checkout
      const options = {
        key: this.razorpayKey,
        amount: this.orderData.total * 100,
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
        theme: {
          color: "#007bff"
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response);
        this.showError('Payment failed. Please try again.');
        button.disabled = false;
      });

    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      this.showError(error.message);
      button.disabled = false;
    }
  }

  async createRazorpayOrder() {
    const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(this.orderData.total * 100),
        currency: "INR",
        receipt: this.orderData.orderId
      })
    });

    return await response.json();
  }

  async handlePaymentSuccess(paymentResponse) {
    const loadingElement = document.getElementById('paymentLoading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        console.log('🔍 Verifying payment...');

        const verificationResponse = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentResponse)
        });

        const data = await verificationResponse.json();
        
        if (data.success) {
            console.log('🎉 Payment verified successfully!');
            this.showSuccess('Payment successful! Redirecting...');
            
            // ✅ Add user email to order before saving
            this.orderData.userEmail = this.currentUser?.email || 'guest';
            this.orderData.userName = this.currentUser?.name || 'Guest';
            
            // Save order to history
            this.saveOrderToHistory(paymentResponse);
            
            // Redirect to success page
            setTimeout(() => {
                window.location.href = `order-success.html?order=${this.orderData.orderId}`;
            }, 2000);
            
        } else {
            throw new Error(data.error || 'Payment verification failed');
        }

    } catch (error) {
        console.error('❌ Payment verification failed:', error);
        this.showError(`Payment verification failed: ${error.message}`);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

  saveOrderToHistory(paymentResponse) {
    try {
      // Update order data with payment info
      this.orderData.paymentId = paymentResponse.razorpay_payment_id;
      this.orderData.paymentStatus = 'paid';
      this.orderData.status = 'confirmed';
      this.orderData.paymentDate = new Date().toISOString();

      // Save to order history
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orders.unshift(this.orderData);
      localStorage.setItem('orderHistory', JSON.stringify(orders));

      // Clear pending order and cart
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('cart');

      console.log('✅ Order saved to history');

    } catch (error) {
      console.error('❌ Failed to save order:', error);
    }
  }

  showError(message) {
    const messageElement = document.getElementById('paymentMessage');
    if (messageElement) {
      messageElement.innerHTML = `<div class="error-message">${message}</div>`;
      messageElement.style.display = 'block';
    }
    alert(message); // Fallback
  }

  showSuccess(message) {
    const messageElement = document.getElementById('paymentMessage');
    if (messageElement) {
      messageElement.innerHTML = `<div class="success-message">${message}</div>`;
      messageElement.style.display = 'block';
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Razorpay !== 'undefined') {
    window.paymentManager = new PaymentManager();
  } else {
    console.error('❌ Razorpay not loaded');
    alert('Payment system not available. Please refresh the page.');
  }
});



