/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';

/**
 * Test different Midtrans endpoints to find the correct one
 */

export const MidtransEndpointTest = {
  /**
   * Test all possible Snap endpoints
   */
  testSnapEndpoints: async () => {
    const config = getMidtransConfig();
    const testData = {
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
    };

    const endpoints = [
      '/v2/snap',
      '/v1/snap',
      '/snap/v2',
      '/snap/v1',
      '/snap',
      '/v2/transactions',
      '/v1/transactions',
      '/transactions'
    ];

    console.log('Testing Midtrans Snap endpoints...');
    console.log('Base URL:', config.BASE_URL);
    console.log('Auth Header:', getAuthHeader());

    for (const endpoint of endpoints) {
      try {
        console.log(`\n--- Testing endpoint: ${endpoint} ---`);
        const response = await fetch(`${config.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify(testData)
        });

        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS! Response:`, data);
          return { success: true, endpoint, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ Failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    return { success: false, error: 'No working endpoint found' };
  },

  /**
   * Test with different HTTP methods
   */
  testHttpMethods: async (endpoint = '/v2/snap') => {
    const config = getMidtransConfig();
    const testData = {
      transaction_details: {
        order_id: 'TEST_ORDER_' + Date.now(),
        gross_amount: 10000
      }
    };

    const methods = ['GET', 'POST', 'PUT', 'PATCH'];
    
    console.log(`\n--- Testing HTTP methods for ${endpoint} ---`);
    
    for (const method of methods) {
      try {
        console.log(`\nTesting ${method} ${endpoint}`);
        const response = await fetch(`${config.BASE_URL}${endpoint}`, {
          method: method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: method !== 'GET' ? JSON.stringify(testData) : undefined
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${method}! Response:`, data);
          return { success: true, method, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${method} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${method} error: ${error.message}`);
      }
    }

    return { success: false, error: 'No working method found' };
  },

  /**
   * Test with different request formats
   */
  testRequestFormats: async (endpoint = '/v2/snap') => {
    const config = getMidtransConfig();
    
    const formats = [
      {
        name: 'Minimal',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          }
        }
      },
      {
        name: 'With Customer',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          customer_details: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com'
          }
        }
      },
      {
        name: 'With Items',
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
      }
    ];

    console.log(`\n--- Testing request formats for ${endpoint} ---`);
    
    for (const format of formats) {
      try {
        console.log(`\nTesting ${format.name} format`);
        const response = await fetch(`${config.BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify(format.data)
        });

        console.log(`Status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${format.name}! Response:`, data);
          return { success: true, format: format.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${format.name} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${format.name} error: ${error.message}`);
      }
    }

    return { success: false, error: 'No working format found' };
  }
};

export default MidtransEndpointTest;
