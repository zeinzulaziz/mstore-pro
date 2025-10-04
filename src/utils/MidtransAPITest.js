/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';
import { validateKeys } from '../config/MidtransKeys';

/**
 * Test Midtrans API Connection
 * This utility helps debug Midtrans API issues
 */

export const MidtransAPITest = {
  /**
   * Test basic API connection
   */
  testConnection: async () => {
    try {
      // Validate keys first
      if (!validateKeys()) {
        return { success: false, error: 'Invalid Midtrans keys configuration' };
      }
      
      const config = getMidtransConfig();
      console.log('Testing Midtrans API Connection...');
      console.log('Base URL:', config.BASE_URL);
      console.log('Server Key:', config.SERVER_KEY);
      console.log('Auth Header:', getAuthHeader());
      
      // Test with a simple request
      const response = await fetch(`${config.BASE_URL}/v2/snap`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          customer_details: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '08123456789'
          },
          item_details: [{
            id: 'ITEM_001',
            price: 10000,
            quantity: 1,
            name: 'Test Item'
          }]
        })
      });
      
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Midtrans API Connection Successful!');
        console.log('Response Data:', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error('❌ Midtrans API Connection Failed!');
        console.error('Error Response:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('❌ Midtrans API Connection Error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Test with different endpoints
   */
  testEndpoints: async () => {
    const config = getMidtransConfig();
    const endpoints = [
      '/v2/snap',
      '/v2/transactions',
      '/v2/transactions/status'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${config.BASE_URL}${endpoint}`);
        const response = await fetch(`${config.BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': getAuthHeader(),
          }
        });
        
        console.log(`Status for ${endpoint}:`, response.status);
      } catch (error) {
        console.error(`Error for ${endpoint}:`, error.message);
      }
    }
  },

  /**
   * Validate server key format
   */
  validateServerKey: () => {
    const config = getMidtransConfig();
    const serverKey = config.SERVER_KEY;
    
    console.log('Validating Server Key...');
    console.log('Server Key:', serverKey);
    console.log('Length:', serverKey.length);
    console.log('Starts with Mid-server:', serverKey.startsWith('Mid-server'));
    console.log('Contains sandbox:', serverKey.includes('sandbox'));
    
    if (serverKey === 'VT-server-sandbox-key') {
      console.warn('⚠️  Using default server key! Please replace with your actual Midtrans server key.');
      return false;
    }
    
    if (!serverKey.startsWith('Mid-server')) {
      console.error('❌ Invalid server key format! Should start with "Mid-server"');
      return false;
    }
    
    console.log('✅ Server key format looks valid');
    return true;
  }
};

export default MidtransAPITest;
