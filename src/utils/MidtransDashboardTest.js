/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';

/**
 * Test Midtrans Dashboard Integration
 * This utility helps verify if the server key works with Midtrans dashboard
 */

export const MidtransDashboardTest = {
  /**
   * Test with Midtrans dashboard API endpoints
   */
  testDashboardEndpoints: async () => {
    const config = getMidtransConfig();
    const serverKey = config.SERVER_KEY;
    
    console.log('Testing Midtrans Dashboard Integration...');
    console.log('Server Key:', serverKey);
    console.log('Merchant ID:', config.MERCHANT_ID);
    
    // Test different dashboard endpoints
    const endpoints = [
      {
        name: 'Snap Token (v2)',
        url: `${config.BASE_URL}/v2/snap`,
        method: 'POST'
      },
      {
        name: 'Snap Token (v1)',
        url: `${config.BASE_URL}/v1/snap`,
        method: 'POST'
      },
      {
        name: 'Core API Token',
        url: `${config.BASE_URL}/v2/token`,
        method: 'POST'
      },
      {
        name: 'Transaction Status',
        url: `${config.BASE_URL}/v2/transactions/status`,
        method: 'GET'
      },
      {
        name: 'Merchant Info',
        url: `${config.BASE_URL}/v2/merchant/info`,
        method: 'GET'
      }
    ];
    
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
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n--- Testing ${endpoint.name} ---`);
        console.log('URL:', endpoint.url);
        console.log('Method:', endpoint.method);
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: endpoint.method === 'POST' ? JSON.stringify(testData) : undefined
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${endpoint.name}! Response:`, data);
          return { success: true, endpoint: endpoint.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${endpoint.name} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working dashboard endpoint found' };
  },

  /**
   * Test with different server key formats
   */
  testServerKeyFormats: async () => {
    const config = getMidtransConfig();
    const originalServerKey = config.SERVER_KEY;
    
    console.log('\n--- Testing different server key formats ---');
    
    // Test different server key formats
    const serverKeyFormats = [
      originalServerKey, // Original: Mid-server-2MQ1aJSUt06it3tg3Y9Kwfvsy
      originalServerKey.replace('Mid-server-', 'VT-server-'), // VT format
      originalServerKey.replace('Mid-server-', ''), // Without prefix
      originalServerKey.toUpperCase(), // Uppercase
      originalServerKey.toLowerCase(), // Lowercase
    ];
    
    for (const serverKey of serverKeyFormats) {
      try {
        console.log(`\nTesting server key: ${serverKey}`);
        
        // Create auth header with this server key
        const authString = btoa(`${serverKey}:`);
        const authHeader = `Basic ${authString}`;
        
        const response = await fetch(`${config.BASE_URL}/v2/snap`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: 'TEST_ORDER_' + Date.now(),
              gross_amount: 10000
            }
          })
        });
        
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with server key: ${serverKey}! Response:`, data);
          return { success: true, serverKey, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ Server key ${serverKey} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Server key ${serverKey} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working server key format found' };
  },

  /**
   * Test with minimal request data
   */
  testMinimalRequests: async () => {
    const config = getMidtransConfig();
    
    console.log('\n--- Testing minimal request data ---');
    
    const minimalRequests = [
      {
        name: 'Only transaction_details',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          }
        }
      },
      {
        name: 'With customer_details',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          customer_details: {
            first_name: 'Test',
            email: 'test@example.com'
          }
        }
      },
      {
        name: 'With item_details',
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
        name: 'With payment_methods',
        data: {
          transaction_details: {
            order_id: 'TEST_ORDER_' + Date.now(),
            gross_amount: 10000
          },
          payment_methods: ['qris']
        }
      }
    ];
    
    for (const request of minimalRequests) {
      try {
        console.log(`\nTesting ${request.name}:`, request.data);
        
        const response = await fetch(`${config.BASE_URL}/v2/snap`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(),
          },
          body: JSON.stringify(request.data)
        });
        
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${request.name}! Response:`, data);
          return { success: true, request: request.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${request.name} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${request.name} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working minimal request found' };
  }
};

export default MidtransDashboardTest;
