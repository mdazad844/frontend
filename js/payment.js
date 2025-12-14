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

        // ✅ Calculate tax correctly
        const subtotal = orderData.subtotal || 0;
        const deliveryCharge = orderData.deliveryCharge || 0;
        
        // Recalculate tax to ensure it's 5% on (subtotal + delivery)
        const taxableAmount = subtotal + deliveryCharge;
        const correctTax = Math.round(taxableAmount * 0.05);
        const grandTotal = subtotal + correctTax + deliveryCharge;
        
        // Update the orderData with correct values
        this.orderData.taxAmount = correctTax;
        this.orderData.grandTotal = grandTotal;
        
        // Update ALL total fields with correct calculations
        this.updateElement('paymentSubtotal', subtotal);
        this.updateElement('paymentTax', correctTax);
        this.updateElement('paymentDelivery', deliveryCharge);
        this.updateElement('paymentTotal', grandTotal);
        
        console.log('📊 Payment Summary:');
        console.log(`   - Subtotal: ₹${subtotal}`);
        console.log(`   - Delivery: ₹${deliveryCharge}`);
        console.log(`   - Taxable Amount: ₹${taxableAmount}`);
        console.log(`   - 5% GST: ₹${correctTax}`);
        console.log(`   - Grand Total: ₹${grandTotal}`);
        
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
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      console.log('✅ Razorpay order created:', orderResponse);
      
      // 2. Open Razorpay checkout
      const options = {
        key: this.razorpayKey,
        amount: orderResponse.amount,
        currency: "INR",
        name: "MyBrand",
        description: `Order #${this.orderData.orderId} (Includes 5% GST)`,
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
        },
        notes: {
          order_id: this.orderData.orderId,
          subtotal: `₹${this.orderData.subtotal}`,
          delivery: `₹${this.orderData.deliveryCharge}`,
          gst: `₹${this.orderData.taxAmount} (5%)`,
          grand_total: `₹${this.orderData.grandTotal}`
        }
      };

      console.log('🎯 Opening Razorpay with amount:', orderResponse.amount, 'paise');
      console.log('Breakdown:', orderResponse.breakdown);
      
      const razorpay = new Razorpay(options);
      razorpay.open();
      
      razorpay.on('payment.failed', (response) => {
        console.error('❌ Payment failed:', response);
        this.showError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        button.disabled = false;
      });

    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      this.showError(error.message);
      button.disabled = false;
    }
  }

  // ✅ FIXED: This should be a method of PaymentManager class
  async createRazorpayOrder() {
    try {
      const orderData = this.orderData;
      const currentUser = this.currentUser;
      
      // Prepare complete order data
      const completeOrderData = {
        userId: currentUser?.userId,
        customer: {
          name: currentUser?.name,
          email: currentUser?.email,
          phone: currentUser?.phone
        },
        shippingAddress: currentUser?.address || {},
        items: orderData?.items?.map(item => ({
          productId: item.id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
          image: item.image || item.img || ''
        })) || [],
        subtotal: orderData.subtotal || 0,
        deliveryCharge: orderData.deliveryCharge || 0,
        notes: document.getElementById('orderNotes')?.value || ''
      };
      
      const requestBody = {
        subtotal: orderData.subtotal || 0,
        deliveryCharge: orderData.deliveryCharge || 0,
        currency: "INR",
        receipt: orderData.orderId || `order_${Date.now()}`,
        orderData: completeOrderData
      };
      
      console.log('📤 Sending order data to backend:', requestBody);
      
      const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Backend response:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ✅ FIXED: This should be a method of PaymentManager class
  async handlePaymentSuccess(paymentResponse) {
    const loadingElement = document.getElementById('paymentLoading');
    if (loadingElement) loadingElement.style.display = 'block';
    
    try {
      console.log('🔍 Verifying payment with backend...');
      
      const orderData = this.orderData;
      const currentUser = this.currentUser;
      
      // Prepare complete order data for verification
      const completeOrderData = {
        userId: currentUser?.userId,
        customer: {
          name: currentUser?.name,
          email: currentUser?.email,
          phone: currentUser?.phone
        },
        shippingAddress: currentUser?.address || {},
        items: orderData?.items?.map(item => ({
          productId: item.id || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
          image: item.image || item.img || ''
        })) || [],
        subtotal: orderData.subtotal || 0,
        deliveryCharge: orderData.deliveryCharge || 0,
        taxAmount: orderData.taxAmount || 0,
        grandTotal: orderData.grandTotal || 0
      };
      
      const verificationData = {
        ...paymentResponse,
        orderData: completeOrderData
      };
      
      console.log('📤 Sending verification data:', verificationData);
      
      const verificationResponse = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });
      
      const data = await verificationResponse.json();
      console.log('📥 Verification response:', data);
      
      if (data.success) {
        console.log('🎉 Payment verified successfully!');
        this.showSuccess('Payment successful! Redirecting...');
        
        // Save order to localStorage for profile page
        this.saveOrderToLocalStorage(data);
        
        // Clear cart and pending order
        localStorage.removeItem('cart');
        localStorage.removeItem('pendingOrder');
        
        // Redirect to success page with order ID
        setTimeout(() => {
          window.location.href = `order-success.html?order=${data.orderId}&payment=${paymentResponse.razorpay_payment_id}`;
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

  saveOrderToLocalStorage(verificationData) {
    try {
      // Create order object with complete details
      const order = {
        orderId: verificationData.orderId,
        orderNumber: verificationData.orderNumber || verificationData.orderId,
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: verificationData.paymentId,
        customer: this.currentUser,
        shippingAddress: this.currentUser?.address || {},
        items: this.orderData.items,
        total: this.orderData.grandTotal,
        financials: {
          subtotal: this.orderData.subtotal,
          deliveryCharge: this.orderData.deliveryCharge,
          taxAmount: this.orderData.taxAmount,
          grandTotal: this.orderData.grandTotal
        }
      };
      
      // Save to user's orders
      const userEmail = this.currentUser?.email;
      if (userEmail) {
        const userOrders = JSON.parse(localStorage.getItem(`userOrders_${userEmail}`) || '[]');
        userOrders.unshift(order);
        localStorage.setItem(`userOrders_${userEmail}`, JSON.stringify(userOrders));
      }
      
      // Also save to general order history
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.unshift(order);
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
      
      console.log('✅ Order saved to localStorage:', order);
      
    } catch (error) {
      console.error('❌ Failed to save order to localStorage:', error);
    }
  }

  showError(message) {
    const messageElement = document.getElementById('paymentMessage');
    if (messageElement) {
      messageElement.innerHTML = `<div class="alert alert-danger">${message}</div>`;
      messageElement.style.display = 'block';
    }
    setTimeout(() => alert(message), 100);
  }

  showSuccess(message) {
    const messageElement = document.getElementById('paymentMessage');
    if (messageElement) {
      messageElement.innerHTML = `<div class="alert alert-success">${message}</div>`;
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
    
    // Load Razorpay script if not loaded
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      window.paymentManager = new PaymentManager();
    };
    script.onerror = () => {
      alert('Payment system not available. Please refresh the page.');
    };
    document.head.appendChild(script);
  }
});
