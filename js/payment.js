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

  async createRazorpayOrder() {
    try {
      // FIXED: Send subtotal and deliveryCharge separately so backend can calculate GST
      const requestBody = {
        subtotal: this.orderData.subtotal || 0,
        deliveryCharge: this.orderData.deliveryCharge || 0,
        currency: "INR",
        receipt: this.orderData.orderId || `receipt_${Date.now()}`
      };

      console.log('📤 Creating Razorpay order with:', requestBody);

      const response = await fetch(`${this.backendUrl}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      console.log('✅ Backend response:', data);
      return data;

    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw error;
    }
  }

 async handlePaymentSuccess(paymentResponse) {
    const loadingElement = document.getElementById('paymentLoading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        console.log('🔍 Verifying payment...');

        // ✅ PREPARE COMPLETE ORDER DATA
        const completeOrderData = {
            orderId: this.orderData.orderId,
            customer: {
                name: this.currentUser?.name || '',
                email: this.currentUser?.email || '',
                phone: this.currentUser?.phone || ''
            },
            shippingAddress: this.currentUser?.address || {
                line1: 'Not provided',
                city: 'Not provided',
                state: 'Not provided',
                pincode: '000000',
                country: 'India'
            },
            items: this.orderData.items?.map(item => ({
                productId: item.id || item.productId || '',
                name: item.name || 'Product',
                price: item.price || 0,
                quantity: item.quantity || 1,
                size: item.size || '',
                color: item.color || '',
                image: item.image || item.img || ''
            })) || [],
            pricing: {
                subtotal: this.orderData.subtotal || 0,
                deliveryCharge: this.orderData.deliveryCharge || 0,
                taxAmount: this.orderData.taxAmount || 0,
                total: this.orderData.grandTotal || 0
            }
        };

        console.log('📦 Complete order data:', completeOrderData);

        // ✅ SEND PAYMENT DATA + ORDER DATA TO BACKEND
        const verificationData = {
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            orderData: completeOrderData  // THIS IS CRITICAL!
        };

        console.log('📤 Sending to backend:', verificationData);

        const verificationResponse = await fetch(`${this.backendUrl}/api/payments/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationData)
        });

        const data = await verificationResponse.json();
        
        if (data.success) {
            console.log('🎉 Payment verified and order saved to database!');
            this.showSuccess('Payment successful! Order saved.');
            
            // Save to localStorage as backup
            this.saveOrderToHistory(paymentResponse);
            
            // Redirect to success page
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

  saveOrderToHistory(paymentResponse) {
    try {
        // Update order data with payment info and correct amount fields
        this.orderData.paymentId = paymentResponse.razorpay_payment_id;
        this.orderData.paymentStatus = 'paid';
        this.orderData.status = 'confirmed';
        this.orderData.paymentDate = new Date().toISOString();
        this.orderData.razorpayOrderId = paymentResponse.razorpay_order_id;
        
        // ✅ Ensure the correct amount fields are saved
        // Use grandTotal (which includes GST) as the main amount
        this.orderData.grandTotal = this.orderData.grandTotal || this.orderData.total;
        this.orderData.total = this.orderData.grandTotal; // For backward compatibility
        
        // Save GST breakdown for display
        this.orderData.amountBreakdown = {
            subtotal: this.orderData.subtotal || 0,
            deliveryCharge: this.orderData.deliveryCharge || 0,
            taxAmount: this.orderData.taxAmount || 0,
            grandTotal: this.orderData.grandTotal || 0
        };

        console.log('💾 Saving order to history:', this.orderData);

        // Save to order history
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orders.unshift(this.orderData);
        localStorage.setItem('orderHistory', JSON.stringify(orders));

        // Clear pending order and cart
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('cart');

        console.log('✅ Order saved to history with amount:', this.orderData.grandTotal);

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

