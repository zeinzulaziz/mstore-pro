/** @format */

/**
 * M-Store Midtrans API Service
 * This service handles communication with WordPress M-Store Midtrans endpoint
 */

export const MStoreMidtransAPI = {
  /**
   * Generate Snap token from M-Store WordPress endpoint
   */
  generateSnapToken: async (orderData) => {
    try {
      console.log('Generating Snap token from M-Store endpoint...');
      console.log('Order data:', orderData);
      
      // Prepare request data
      const requestData = {
        gross_amount: orderData.totalPrice || orderData.gross_amount,
        first_name: orderData.customer_details?.first_name || orderData.billing?.first_name || 'Customer',
        last_name: orderData.customer_details?.last_name || orderData.billing?.last_name || '',
        email: orderData.customer_details?.email || orderData.billing?.email || 'customer@example.com',
        phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
        order_id: orderData.id || orderData.order_id || `ORDER_${Date.now()}`,
        // Add additional fields if needed
        ...(orderData.customer_details && { customer_details: orderData.customer_details }),
        ...(orderData.item_details && { item_details: orderData.item_details }),
        ...(orderData.shipping_details && { shipping_details: orderData.shipping_details })
      };
      
      console.log('Request data:', requestData);
      
      // Call M-Store WordPress endpoint
      const response = await fetch('https://doseofbeauty.id/wp-json/mstore/v1/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('M-Store API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('M-Store API Response:', data);
      
      if (data.token && data.redirect_url) {
        return {
          success: true,
          token: data.token,
          redirect_url: data.redirect_url,
          data: data
        };
      } else {
        throw new Error('Invalid response format from M-Store API');
      }
      
    } catch (error) {
      console.error('Error generating Snap token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test M-Store endpoint connection
   */
  testConnection: async () => {
    try {
      console.log('Testing M-Store Midtrans endpoint...');
      
      const testData = {
        gross_amount: 10000,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '08123456789',
        order_id: `TEST_ORDER_${Date.now()}`
      };
      
      const response = await fetch('https://doseofbeauty.id/wp-json/mstore/v1/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      console.log('Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ M-Store endpoint test successful!');
        console.log('Response:', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log('❌ M-Store endpoint test failed:', errorText);
        return { success: false, error: errorText };
      }
      
    } catch (error) {
      console.error('❌ M-Store endpoint test error:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default MStoreMidtransAPI;
