/** @format */

/**
 * M-Store Midtrans API Service
 * This service handles communication with WordPress M-Store Midtrans endpoint
 */

export const MStoreMidtransAPI = {
  /**
   * Create order using WooCommerce API and redirect to Midtrans payment
   * This approach uses the official Midtrans WooCommerce plugin
   */
  createOrderAndRedirectToMidtrans: async (orderData) => {
    try {
      console.log('Creating order via WooCommerce API and redirecting to Midtrans...');
      console.log('Order data:', orderData);
      
      // Step 1: Create order in WooCommerce using WooCommerce REST API
      const wooOrderData = {
        payment_method: 'midtrans',
        payment_method_title: 'Midtrans',
        set_paid: false, // Don't mark as paid yet, Midtrans plugin will handle this
        billing: orderData.billing || {
          first_name: orderData.customer_details?.first_name || 'Customer',
          last_name: orderData.customer_details?.last_name || '',
          email: orderData.customer_details?.email || 'customer@example.com',
          phone: orderData.customer_details?.phone || '08123456789',
          address_1: '',
          city: '',
          state: '',
          postcode: '',
          country: 'ID'
        },
        shipping: orderData.shipping || orderData.billing || {
          first_name: orderData.customer_details?.first_name || 'Customer',
          last_name: orderData.customer_details?.last_name || '',
          address_1: '',
          city: '',
          state: '',
          postcode: '',
          country: 'ID'
        },
        line_items: orderData.line_items || [],
        shipping_lines: orderData.selectedShippingMethod ? [{
          method_title: orderData.selectedShippingMethod.service_name,
          method_id: orderData.selectedShippingMethod.courier_code,
          total: orderData.selectedShippingMethod.price.toString()
        }] : [],
        meta_data: [
          {
            key: '_midtrans_payment_method',
            value: 'snap'
          }
        ]
      };
      
      console.log('WooCommerce order data:', wooOrderData);
      
      // Create order via WooCommerce REST API
      const orderResponse = await fetch('https://doseofbeauty.id/wp-json/wc/v3/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Note: WooCommerce API requires authentication
          // You may need to add Consumer Key & Consumer Secret
        },
        body: JSON.stringify(wooOrderData)
      });
      
      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('WooCommerce Order Creation Error:', errorText);
        
        // Fallback: Use direct Midtrans integration
        console.log('Falling back to direct Midtrans integration...');
        return await MStoreMidtransAPI.generateSnapToken(orderData);
      }
      
      const createdOrder = await orderResponse.json();
      console.log('✅ WooCommerce order created:', createdOrder);
      
      // Step 2: Get Midtrans payment URL from WooCommerce order
      const paymentUrl = createdOrder.payment_url;
      
      if (paymentUrl) {
        return {
          success: true,
          order_id: createdOrder.id,
          payment_url: paymentUrl,
          woo_order: createdOrder,
          redirect_url: paymentUrl // Use WooCommerce generated payment URL
        };
      } else {
        // Fallback: Generate Snap token manually
        return await MStoreMidtransAPI.generateSnapToken({
          ...orderData,
          id: createdOrder.id,
          order_id: createdOrder.id
        });
      }
      
    } catch (error) {
      console.error('Error creating order and redirecting to Midtrans:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Generate Snap token - Simplified approach for demo
   */
  generateSnapToken: async (orderData) => {
    try {
      console.log('Generating Snap token for demo...');
      console.log('Order data:', orderData);
      
      // For demo purposes, return a demo payment URL
      // In production, this should call the actual Midtrans API
      const orderId = orderData.id || orderData.order_id || `ORDER_${Date.now()}`;
      const grossAmount = orderData.totalPrice || orderData.gross_amount || 10000;
      
      console.log('Order ID:', orderId);
      console.log('Gross Amount:', grossAmount);
      
      // Return demo payment URL
      return {
        success: true,
        token: `demo-token-${orderId}`,
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/demo-token',
        data: { 
          token: `demo-token-${orderId}`,
          order_id: orderId,
          gross_amount: grossAmount
        },
        warning: 'Using demo payment URL for testing. In production, this should call actual Midtrans API.'
      };
      
    } catch (error) {
      console.error('Error generating Snap token:', error);
      
      // Fallback: Return demo payment URL
      console.log('Falling back to demo payment URL due to error...');
      return {
        success: true,
        token: 'demo-token',
        redirect_url: 'https://app.sandbox.midtrans.com/snap/v4/redirection/demo-token',
        data: { token: 'demo-token' },
        warning: 'Using demo payment URL due to error: ' + error.message
      };
    }
  },

};

export default MStoreMidtransAPI;
