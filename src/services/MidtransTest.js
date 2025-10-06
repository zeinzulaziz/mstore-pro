/** @format */

/**
 * Midtrans API Test Service
 * Test Midtrans API connectivity and authentication
 */

import { encode } from 'base-64';

const MIDTRANS_CONFIG = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY_HERE',
  merchantId: process.env.MIDTRANS_MERCHANT_ID || 'YOUR_MERCHANT_ID_HERE',
  isProduction: true,
  baseUrl: 'https://api.midtrans.com/v2'
};

export const MidtransTest = {
  
  /**
   * Test basic API connectivity
   */
  testAPIConnectivity: async () => {
    try {
      console.log('🧪 Testing Midtrans API connectivity...');
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      console.log('🔑 Auth header:', `Basic ${auth}`);
      
      // Test with minimal data
      const testData = {
        payment_type: 'bank_transfer',
        transaction_details: {
          order_id: `TEST_${Date.now()}`,
          gross_amount: 10000
        },
        customer_details: {
          first_name: 'Test',
          last_name: 'Customer',
          email: 'test@example.com',
          phone: '08123456789'
        },
        bank_transfer: {
          bank: 'bni'
        },
        item_details: [{
          id: 'test_item',
          price: 10000,
          quantity: 1,
          name: 'Test Product',
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        }]
      };
      
      console.log('📤 Test data:', JSON.stringify(testData, null, 2));
      
      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(testData)
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('📥 Response body:', responseText);
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('✅ API Test Success:', result);
        return {
          success: true,
          data: result
        };
      } else {
        console.error('❌ API Test Failed:', responseText);
        return {
          success: false,
          error: responseText,
          status: response.status
        };
      }
      
    } catch (error) {
      console.error('❌ API Test Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Test GoPay account status
   */
  testGoPayAccountStatus: async () => {
    try {
      console.log('🧪 Testing GoPay account status...');
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      // Test with a sample account ID
      const testAccountId = 'test-account-' + Date.now();
      
      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/pay/account/${testAccountId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      });
      
      const responseText = await response.text();
      console.log(`📥 GoPay Account Status Response:`, responseText);
      
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? JSON.parse(responseText) : responseText
      };
      
    } catch (error) {
      console.error(`❌ GoPay Account Status Test Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test with different payment methods
   */
  testBankTransfer: async (paymentType) => {
    try {
      console.log(`🧪 Testing payment with ${paymentType}...`);
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      let testData = {
        payment_type: paymentType,
        transaction_details: {
          order_id: `TEST_${paymentType}_${Date.now()}`,
          gross_amount: 50000
        },
        customer_details: {
          first_name: 'Test',
          last_name: 'Customer',
          email: 'test@example.com',
          phone: '08123456789'
        },
        item_details: [{
          id: 'test_item',
          price: 50000,
          quantity: 1,
          name: 'Test Product',
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        }]
      };

      // Add payment method specific data
      if (paymentType === 'bank_transfer') {
        testData.bank_transfer = { bank: 'bni' };
      } else if (paymentType === 'gopay') {
        testData.gopay = {
          enable_callback: true,
          callback_url: 'https://doseofbeauty.id/midtrans/callback'
        };
      }
      
      console.log('📤 Test data being sent:', JSON.stringify(testData, null, 2));
      
      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(testData)
      });
      
      const responseText = await response.text();
      console.log(`📥 ${paymentType} Response:`, responseText);
      
      return {
        success: response.ok,
        status: response.status,
        data: response.ok ? JSON.parse(responseText) : responseText
      };
      
    } catch (error) {
      console.error(`❌ ${paymentType} Test Error:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default MidtransTest;
