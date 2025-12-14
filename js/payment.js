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
        this.orderData.grandTotal = grandTotal; // Store this for Razorpay
        
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
      // 1. Create Razorpay order - FIXED: Send subtotal and delivery separately
      const orderResponse = await this.createRazorpayOrder();
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || 'Failed to create payment order');
      }

      console.log('✅ Razorpay order created:', orderResponse);
      
      // 2. Open Razorpay checkout - FIXED: Use amount from backend response
      const options = {
        key: this.razorpayKey,
        amount: orderResponse.amount, // Use amount from backend (includes GST)
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
        // Add notes to show in Razorpay dashboard
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
// Frontend JavaScript - UPDATED
async function createRazorpayOrder() {
    const orderData = JSON.parse(localStorage.getItem('pendingOrder'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Prepare complete order data
    const completeOrderData = {
        userId: currentUser?.userId,
        customer: {
            name: currentUser?.name,
            email: currentUser?.email,
            phone: currentUser?.phone
        },
        shippingAddress: currentUser?.address || {},
        items: orderData?.items || [],
        notes: document.getElementById('orderNotes')?.value || ''
    };
    
    const requestBody = {
        subtotal: orderData.subtotal || 0,
        deliveryCharge: orderData.deliveryCharge || 0,
        currency: "INR",
        receipt: orderData.orderId || `order_${Date.now()}`,
        orderData: completeOrderData  // Send complete order data
    };
    
    console.log('📤 Sending order data:', requestBody);
    
    const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });
    
    return await response.json();
}

async function handlePaymentSuccess(paymentResponse) {
    const orderData = JSON.parse(localStorage.getItem('pendingOrder'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Prepare complete order data for verification
    const completeOrderData = {
        userId: currentUser?.userId,
        customer: {
            name: currentUser?.name,
            email: currentUser?.email,
            phone: currentUser?.phone
        },
        shippingAddress: currentUser?.address || {},
        items: orderData?.items || [],
        financials: {
            subtotal: orderData.subtotal || 0,
            deliveryCharge: orderData.deliveryCharge || 0,
            taxAmount: orderData.taxAmount || 0,
            grandTotal: orderData.grandTotal || 0
        }
    };
    
    const verificationData = {
        ...paymentResponse,
        orderData: completeOrderData
    };
    
    const verificationResponse = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
    });
    
    const data = await verificationResponse.json();
    
    if (data.success) {
        // Save order ID to local storage for profile page
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        userOrders.unshift({
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            orderDate: new Date().toISOString(),
            ...data.orderDetails
        });
        localStorage.setItem('userOrders', JSON.stringify(userOrders));
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('pendingOrder');
        
        // Redirect to success page with order ID
        window.location.href = `order-success.html?order=${data.orderId}`;
    }
}

  saveOrderToHistory(paymentResponse) {
    try {
      // Update order data with payment info
      this.orderData.paymentId = paymentResponse.razorpay_payment_id;
      this.orderData.paymentStatus = 'paid';
      this.orderData.status = 'confirmed';
      this.orderData.paymentDate = new Date().toISOString();
      this.orderData.razorpayOrderId = paymentResponse.razorpay_order_id;

      // Save to order history
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orders.unshift(this.orderData);
      localStorage.setItem('orderHistory', JSON.stringify(orders));

      // Clear pending order and cart
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('cart');

      console.log('✅ Order saved to history:', this.orderData);

    } catch (error) {
      console.error('❌ Failed to save order:', error);
    }
  }

  showError(message) {
    const messageElement = document.getElementById('paymentMessage');
    if (messageElement) {
      messageElement.innerHTML = `<div class="alert alert-danger">${message}</div>`;
      messageElement.style.display = 'block';
    }
    // Fallback alert
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

