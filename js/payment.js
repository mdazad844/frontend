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

      // Display calculated amounts from localStorage
      this.updateElement('paymentSubtotal', orderData.subtotal || 0);
      this.updateElement('paymentTax', orderData.taxAmount || 0);
      this.updateElement('paymentDelivery', orderData.deliveryCharge || 0);
      this.updateElement('paymentTotal', orderData.total || 0);
      
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
      console.log('💰 Preparing payment data for backend...');
      
      // Prepare order data for backend
      const orderRequest = {
        orderId: this.orderData.orderId || `ORD_${Date.now()}`,
        items: this.orderData.items || [],
        subtotal: this.orderData.subtotal || 0,
        deliveryCharge: this.orderData.deliveryCharge || 0,
        customer: {
          email: this.currentUser?.email || '',
          name: this.currentUser?.name || '',
          phone: this.currentUser?.phone || ''
        }
      };

      console.log('📤 Sending to backend for calculation:', orderRequest);

      // 1. Send order data to backend for calculation and Razorpay order creation
      const orderResponse = await this.createOrderOnBackend(orderRequest);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      console.log('✅ Backend calculated:', {
        subtotal: orderResponse.subtotal,
        taxAmount: orderResponse.taxAmount,
        deliveryCharge: orderResponse.deliveryCharge,
        total: orderResponse.total,
        razorpayOrderId: orderResponse.razorpayOrderId
      });

      // Store backend-calculated values
      this.orderData.subtotal = orderResponse.subtotal;
      this.orderData.taxAmount = orderResponse.taxAmount;
      this.orderData.total = orderResponse.total;
      
      // Update display with backend values
      this.updateElement('paymentSubtotal', orderResponse.subtotal);
      this.updateElement('paymentTax', orderResponse.taxAmount);
      this.updateElement('paymentTotal', orderResponse.total);

      // 2. Open Razorpay checkout with backend-calculated amount
      const options = {
        key: this.razorpayKey,
        amount: orderResponse.amount, // Amount in paise from backend
        currency: "INR",
        name: "MyBrand",
        description: `Order #${orderResponse.orderId || this.orderData.orderId}`,
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

  async createOrderOnBackend(orderData) {
    console.log('📤 Sending order data to backend for calculation...');
    
    const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    return await response.json();
  }

  async handlePaymentSuccess(paymentResponse) {
    const loadingElement = document.getElementById('paymentLoading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
      console.log('🔍 Verifying payment...');

      // Add backend-calculated data to payment verification
      const verificationData = {
        ...paymentResponse,
        orderDetails: {
          orderId: this.orderData.orderId,
          subtotal: this.orderData.subtotal,
          taxAmount: this.orderData.taxAmount,
          deliveryCharge: this.orderData.deliveryCharge,
          total: this.orderData.total
        }
      };

      const verificationResponse = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });

      const data = await verificationResponse.json();
      
      if (data.success) {
        console.log('🎉 Payment verified successfully!');
        this.showSuccess('Payment successful! Redirecting...');
        
        // Add user email to order before saving
        this.orderData.userEmail = this.currentUser?.email || 'guest';
        this.orderData.userName = this.currentUser?.name || 'Guest';
        this.orderData.paymentId = paymentResponse.razorpay_payment_id;
        this.orderData.paymentStatus = 'paid';
        this.orderData.status = 'confirmed';
        this.orderData.paymentDate = new Date().toISOString();
        
        // Save order to history
        this.saveOrderToHistory();
        
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

  saveOrderToHistory() {
    try {
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
