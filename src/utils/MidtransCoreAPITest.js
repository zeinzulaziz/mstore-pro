/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';

/**
 * Test Midtrans Core API Integration
 * This utility helps test the correct format for Core API Token
 */

export const MidtransCoreAPITest = {
  /**
   * Test Core API Token with different request formats
   */
  testCoreAPIToken: async () => {
    const config = getMidtransConfig();
    
    console.log('Testing Midtrans Snap API...');
    console.log('Base URL:', config.BASE_URL);
    console.log('Snap Endpoint:', config.SNAP_ENDPOINT);
    console.log('Auth Header:', getAuthHeader());
    
    // Test different request formats for Snap API
    const requestFormats = [
      {
        name: 'Minimal Snap API',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          }
        }
      },
      {
        name: 'With Customer Details',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          customer_details: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '08123456789'
          }
        }
      },
      {
        name: 'With Item Details',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          item_details: [{
            id: 'ITEM_001',
            price: 10000,
            quantity: 1,
            name: 'Test Item'
          }]
        }
      },
      {
        name: 'Complete Snap Request',
        data: {
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
        }
      }
    ];
    
    for (const request of requestFormats) {
      try {
        console.log(`\n--- Testing ${request.name} ---`);
        console.log('Request data:', request.data);
        
        const response = await fetch(`${config.BASE_URL}${config.SNAP_ENDPOINT}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify(request.data)
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${request.name}! Response:`, data);
          
          if (data.status_code === '200' && data.token) {
            return { success: true, request: request.name, data };
          } else if (data.status_code === '400') {
            console.log(`❌ ${request.name} validation error:`, data.validation_messages);
          } else {
            console.log(`❌ ${request.name} error:`, data.status_message);
          }
        } else {
          const errorText = await response.text();
          console.log(`❌ ${request.name} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${request.name} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working Core API request format found' };
  },

  /**
   * Test with different payment methods
   */
  testPaymentMethods: async () => {
    const config = getMidtransConfig();
    
    console.log('\n--- Testing Snap API (no payment methods needed) ---');
    
    // Snap API tidak perlu payment_methods, semua payment method tersedia di UI
    try {
      console.log('Testing Snap API without payment_methods...');
      
      const response = await fetch(`${config.BASE_URL}${config.SNAP_ENDPOINT}`, {
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
          }
        })
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Response:`, data);
        
        if (data.token) {
          console.log(`✅ SUCCESS! Snap Token:`, data.token);
          return { success: true, data };
        } else {
          console.log(`❌ No token received:`, data);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    return { success: false, error: 'Snap API test failed' };
  }
};

export default MidtransCoreAPITest;
