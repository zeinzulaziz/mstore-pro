/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';

/**
 * Test Midtrans Server Key Validity
 * This utility helps verify if the server key is valid
 */

export const MidtransServerKeyTest = {
  /**
   * Test server key with different authentication methods
   */
  testServerKey: async () => {
    const config = getMidtransConfig();
    const serverKey = config.SERVER_KEY;
    
    console.log('Testing Midtrans Server Key...');
    console.log('Server Key:', serverKey);
    console.log('Length:', serverKey.length);
    console.log('Starts with Mid-server:', serverKey.startsWith('Mid-server'));
    
    // Test different authentication methods
    const authMethods = [
      {
        name: 'Basic Auth (current)',
        header: getAuthHeader()
      },
      {
        name: 'Bearer Token',
        header: `Bearer ${serverKey}`
      },
      {
        name: 'X-API-Key',
        header: serverKey
      }
    ];
    
    const testData = {
      transaction_details: {
        order_id: 'TEST_ORDER_' + Date.now(),
        gross_amount: 10000
      }
    };
    
    for (const authMethod of authMethods) {
      try {
        console.log(`\n--- Testing ${authMethod.name} ---`);
        console.log('Header:', authMethod.header);
        
        const response = await fetch(`${config.BASE_URL}/v2/snap`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authMethod.header,
          },
          body: JSON.stringify(testData)
        });
        
        console.log(`Status: ${response.status}`);
        console.log(`Headers:`, response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${authMethod.name}! Response:`, data);
          return { success: true, authMethod: authMethod.name, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${authMethod.name} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${authMethod.name} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working authentication method found' };
  },

  /**
   * Test with different base URLs
   */
  testBaseUrls: async () => {
    const serverKey = getMidtransConfig().SERVER_KEY;
    const authHeader = getAuthHeader();
    
    const baseUrls = [
      'https://api.sandbox.midtrans.com',
      'https://api.midtrans.com',
      'https://app.sandbox.midtrans.com',
      'https://app.midtrans.com',
      'https://sandbox.midtrans.com',
      'https://midtrans.com'
    ];
    
    const testData = {
      transaction_details: {
        order_id: 'TEST_ORDER_' + Date.now(),
        gross_amount: 10000
      }
    };
    
    console.log('\n--- Testing different base URLs ---');
    
    for (const baseUrl of baseUrls) {
      try {
        console.log(`\nTesting base URL: ${baseUrl}`);
        
        const response = await fetch(`${baseUrl}/v2/snap`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify(testData)
        });
        
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ SUCCESS with ${baseUrl}! Response:`, data);
          return { success: true, baseUrl, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${baseUrl} failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ ${baseUrl} error: ${error.message}`);
      }
    }
    
    return { success: false, error: 'No working base URL found' };
  },

  /**
   * Test server key format validation
   */
  validateServerKeyFormat: () => {
    const serverKey = getMidtransConfig().SERVER_KEY;
    
    console.log('\n--- Validating Server Key Format ---');
    console.log('Server Key:', serverKey);
    console.log('Length:', serverKey.length);
    
    // Check if it's a valid Midtrans server key format
    const validFormats = [
      /^Mid-server-[A-Za-z0-9]+$/,  // Mid-server-xxxxx
      /^VT-server-[A-Za-z0-9]+$/,   // VT-server-xxxxx (old format)
      /^[A-Za-z0-9]{32,}$/          // 32+ character alphanumeric
    ];
    
    for (let i = 0; i < validFormats.length; i++) {
      const format = validFormats[i];
      if (format.test(serverKey)) {
        console.log(`✅ Server key matches format ${i + 1}`);
        return true;
      }
    }
    
    console.log('❌ Server key does not match any known format');
    return false;
  },

  /**
   * Test with minimal request
   */
  testMinimalRequest: async () => {
    const config = getMidtransConfig();
    
    const minimalData = {
      transaction_details: {
        order_id: 'TEST_ORDER_' + Date.now(),
        gross_amount: 10000
      }
    };
    
    console.log('\n--- Testing minimal request ---');
    console.log('Data:', minimalData);
    
    try {
      const response = await fetch(`${config.BASE_URL}/v2/snap`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(minimalData)
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Headers:`, response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS! Response:`, data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed: ${errorText}`);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
};

export default MidtransServerKeyTest;
