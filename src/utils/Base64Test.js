/** @format */

import { getMidtransConfig, getAuthHeader } from '../config/MidtransConfig';
import Base64Helper from './Base64Helper';

/**
 * Test Base64 encoding for Midtrans authorization
 */

export const Base64Test = {
  /**
   * Test Base64 encoding of server key
   */
  testServerKeyEncoding: () => {
    const config = getMidtransConfig();
    const serverKey = config.SERVER_KEY;
    
    console.log('=== Base64 Encoding Test ===');
    console.log('Server Key:', serverKey);
    console.log('Length:', serverKey.length);
    console.log('Starts with Mid-server:', serverKey.startsWith('Mid-server'));
    
    // Test different encoding methods
    const testString = `${serverKey}:`;
    console.log('String to encode:', testString);
    
    // Method 1: Using Base64Helper
    const encoded1 = Base64Helper.createMidtransAuth(serverKey);
    console.log('Base64Helper result:', encoded1);
    
    // Method 2: Manual encoding
    const encoded2 = `Basic ${Base64Helper.encode(testString)}`;
    console.log('Manual encoding result:', encoded2);
    
    // Method 3: Current getAuthHeader
    const currentAuth = getAuthHeader();
    console.log('Current getAuthHeader:', currentAuth);
    
    // Check if they match
    const match = encoded1 === encoded2 && encoded2 === currentAuth;
    console.log('All methods match:', match);
    
    return {
      serverKey,
      testString,
      encoded1,
      encoded2,
      currentAuth,
      match
    };
  },

  /**
   * Test with different server key formats
   */
  testDifferentFormats: () => {
    const config = getMidtransConfig();
    const originalServerKey = config.SERVER_KEY;
    
    console.log('\n=== Testing Different Server Key Formats ===');
    
    const formats = [
      {
        name: 'Original',
        key: originalServerKey
      },
      {
        name: 'With SB- prefix',
        key: originalServerKey.replace('Mid-server-', 'SB-Mid-server-')
      },
      {
        name: 'With VT- prefix',
        key: originalServerKey.replace('Mid-server-', 'VT-server-')
      },
      {
        name: 'Uppercase',
        key: originalServerKey.toUpperCase()
      },
      {
        name: 'Lowercase',
        key: originalServerKey.toLowerCase()
      }
    ];
    
    for (const format of formats) {
      try {
        console.log(`\n--- Testing ${format.name} ---`);
        console.log('Key:', format.key);
        
        const testString = `${format.key}:`;
        const encoded = `Basic ${Base64Helper.encode(testString)}`;
        console.log('Encoded:', encoded);
        
        // Test with Midtrans API
        this.testWithMidtransAPI(format.key, encoded);
      } catch (error) {
        console.log(`❌ ${format.name} error:`, error.message);
      }
    }
  },

  /**
   * Test with Midtrans API
   */
  testWithMidtransAPI: async (serverKey, authHeader) => {
    try {
      console.log(`Testing with server key: ${serverKey}`);
      
      const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
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
          },
          customer_details: {
            first_name: 'Test',
            email: 'test@example.com'
          }
        })
      });
      
      console.log(`Status: ${response.status}`);
      
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

export default Base64Test;
