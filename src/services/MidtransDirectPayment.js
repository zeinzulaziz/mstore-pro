/** @format */

/**
 * Midtrans Direct Payment Service
 * This service handles direct payment integration using Midtrans Core API
 * No WebView required - all payment methods are handled natively in the app
 */

import Config from '../common/Config';
import { encode } from 'base-64';

// Midtrans Production Configuration
const MIDTRANS_CONFIG = {
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY_HERE',
  merchantId: process.env.MIDTRANS_MERCHANT_ID || 'YOUR_MERCHANT_ID_HERE',
  isProduction: true,
  baseUrl: 'https://api.midtrans.com/v2'
};

export const MidtransDirectPayment = {

  /**
   * Get available payment methods for the order
   */
  getAvailablePaymentMethods: async (orderData) => {
    try {
      console.log('Getting available payment methods...');
      
      // Create transaction first to get available payment methods
      const transaction = await MidtransDirectPayment.createTransaction(orderData);
      
      if (transaction.success) {
        return {
          success: true,
          paymentMethods: transaction.payment_methods,
          transaction: transaction.data
        };
      } else {
        throw new Error(transaction.error);
      }
      
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return {
        success: false,
        error: error.message,
        paymentMethods: []
      };
    }
  },

  /**
   * Create transaction and get available payment methods
   */
  createTransaction: async (orderData) => {
    try {
      console.log('Creating Midtrans transaction...');
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      // Prepare transaction data
      const transactionData = {
        payment_type: 'bank_transfer', // Default, will be updated based on selected method
        transaction_details: {
          order_id: orderData.id || `ORDER_${Date.now()}`,
          gross_amount: orderData.gross_amount || orderData.total
        },
        customer_details: {
          first_name: orderData.customer_details?.first_name || orderData.billing?.first_name || 'Customer',
          last_name: orderData.customer_details?.last_name || orderData.billing?.last_name || '',
          email: orderData.customer_details?.email || orderData.billing?.email || 'customer@example.com',
          phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
          billing_address: {
            first_name: orderData.billing?.first_name || orderData.customer_details?.first_name || 'Customer',
            last_name: orderData.billing?.last_name || orderData.customer_details?.last_name || '',
            address: orderData.billing?.address_1 || '',
            city: orderData.billing?.city || '',
            postal_code: orderData.billing?.postcode || '',
            phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
            country_code: orderData.billing?.country || 'ID'
          },
          shipping_address: {
            first_name: orderData.shipping?.first_name || orderData.customer_details?.first_name || 'Customer',
            last_name: orderData.shipping?.last_name || orderData.customer_details?.last_name || '',
            address: orderData.shipping?.address_1 || '',
            city: orderData.shipping?.city || '',
            postal_code: orderData.shipping?.postcode || '',
            phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
            country_code: orderData.shipping?.country || 'ID'
          }
        },
        item_details: orderData.line_items?.map(item => ({
          id: item.product_id?.toString() || item.id?.toString() || 'item_' + Date.now(),
          price: item.price || item.total,
          quantity: item.quantity || 1,
          name: item.name || 'Product',
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        })) || []
      };

      console.log('Transaction data:', transactionData);

      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(transactionData)
      });

      console.log('Midtrans response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Midtrans API Error:', errorText);
        throw new Error(`Midtrans API error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Midtrans transaction created:', result);

      return {
        success: true,
        data: result,
        payment_methods: MidtransDirectPayment.getPaymentMethodOptions()
      };

    } catch (error) {
      console.error('Error creating Midtrans transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Process specific payment method
   */
  processPayment: async (orderData, paymentMethod) => {
    try {
      console.log(`Processing payment with method: ${paymentMethod.type}`);
      console.log('Order data received:', JSON.stringify(orderData, null, 2));
      console.log('Payment method received:', JSON.stringify(paymentMethod, null, 2));
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      // Calculate total amount - check multiple possible fields
      const grossAmount = orderData.gross_amount || 
                         orderData.total || 
                         orderData.totalPrice || 
                         orderData.line_items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 
                         100000;
      
      console.log('Calculated gross amount:', grossAmount);
      
      // Prepare payment-specific data
      let paymentData = {
        payment_type: paymentMethod.type,
        transaction_details: {
          order_id: orderData.id || `ORDER_${Date.now()}`,
          gross_amount: grossAmount
        },
        customer_details: {
          first_name: orderData.customer_details?.first_name || 
                     orderData.billing?.first_name || 
                     orderData.billing?.first_name || 
                     'Customer',
          last_name: orderData.customer_details?.last_name || 
                    orderData.billing?.last_name || 
                    orderData.billing?.last_name || 
                    '',
          email: orderData.customer_details?.email || 
                orderData.billing?.email || 
                orderData.billing?.email || 
                'customer@example.com',
          phone: orderData.customer_details?.phone || 
                orderData.billing?.phone || 
                orderData.billing?.phone || 
                '08123456789'
        },
        item_details: orderData.line_items?.map(item => ({
          id: item.product_id?.toString() || item.id?.toString() || 'item_' + Date.now(),
          price: item.price || item.total,
          quantity: item.quantity || 1,
          name: item.name || 'Product',
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        })) || []
      };

      // Add payment method specific parameters
      switch (paymentMethod.type) {
        case 'credit_card':
          paymentData.credit_card = {
            token_id: paymentMethod.token_id,
            authentication: true
          };
          break;
          
        case 'bank_transfer':
          paymentData.bank_transfer = {
            bank: paymentMethod.bank_code // 'bca', 'bni', 'bri', 'mandiri'
          };
          break;
          
        case 'echannel':
          paymentData.echannel = {
            bill_info1: 'Payment for Order #' + (orderData.id || Date.now()),
            bill_info2: 'Dose of Beauty'
          };
          break;
          
        case 'gopay':
          paymentData.gopay = {
            enable_callback: true,
            callback_url: 'https://doseofbeauty.id/midtrans/callback'
          };
          break;
          
        case 'shopeepay':
          paymentData.shopeepay = {
            callback_url: 'https://doseofbeauty.id/midtrans/callback'
          };
          break;
          
        case 'qris':
          paymentData.qris = {
            acquirer: 'gopay'
          };
          break;
      }

      console.log('Payment data being sent to Midtrans:', JSON.stringify(paymentData, null, 2));

      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(paymentData)
      });

      console.log('Payment response status:', response.status);
      console.log('Payment response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment processing error:', errorText);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', response.headers);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ Parsed error data:', errorData);
        } catch (e) {
          console.error('❌ Could not parse error as JSON:', e);
        }
        
        throw new Error(`Payment failed! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Payment processed successfully:', JSON.stringify(result, null, 2));

      return {
        success: true,
        data: result,
        payment_method: paymentMethod.type,
        status: result.status_code === '201' ? 'pending' : 'failed',
        order_id: result.order_id,
        va_number: result.va_numbers?.[0]?.va_number || null
      };

    } catch (error) {
      console.error('❌ Error processing payment:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error name:', error.name);
      
      return {
        success: false,
        error: error.message,
        error_type: error.name,
        error_details: error.toString()
      };
    }
  },

  /**
   * Check payment status
   */
  checkPaymentStatus: async (orderId) => {
    try {
      console.log(`Checking payment status for order: ${orderId}`);
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Status check failed! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Payment status:', result);

      return {
        success: true,
        data: result,
        status: result.transaction_status,
        fraud_status: result.fraud_status
      };

    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get available payment method options
   * Based on active payment methods in Midtrans dashboard
   */
  getPaymentMethodOptions: () => {
    return [
      // ACTIVE PAYMENT METHODS (from Midtrans dashboard)
      {
        id: 'bank_transfer_bni',
        type: 'bank_transfer',
        name: 'Bank Transfer - BNI',
        description: 'Transfer via BNI',
        bank_code: 'bni',
        icon: 'bank',
        enabled: true,
        status: 'active'
      },
      {
        id: 'bank_transfer_bri',
        type: 'bank_transfer',
        name: 'Bank Transfer - BRI',
        description: 'Transfer via BRI',
        bank_code: 'bri',
        icon: 'bank',
        enabled: true,
        status: 'active'
      },
      {
        id: 'bank_transfer_mandiri',
        type: 'bank_transfer',
        name: 'Bank Transfer - Mandiri',
        description: 'Transfer via Mandiri',
        bank_code: 'mandiri',
        icon: 'bank',
        enabled: true,
        status: 'active'
      },
      {
        id: 'bank_transfer_cimb',
        type: 'bank_transfer',
        name: 'Bank Transfer - CIMB Niaga',
        description: 'Transfer via CIMB Niaga',
        bank_code: 'cimb',
        icon: 'bank',
        enabled: true,
        status: 'active'
      },
      {
        id: 'bank_transfer_permata',
        type: 'bank_transfer',
        name: 'Bank Transfer - PermataBank',
        description: 'Transfer via PermataBank',
        bank_code: 'permata',
        icon: 'bank',
        enabled: true,
        status: 'active'
      },
      {
        id: 'gopay',
        type: 'gopay',
        name: 'GoPay',
        description: 'Pay with GoPay',
        icon: 'mobile-payment',
        enabled: true,
        status: 'active'
      },
      
      // PENDING PAYMENT METHODS (not yet active)
      {
        id: 'credit_card',
        type: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, Mastercard, JCB (Activation Pending)',
        icon: 'credit-card',
        enabled: false,
        status: 'pending',
        note: 'Currently being processed by Midtrans'
      },
      {
        id: 'bank_transfer_bca',
        type: 'bank_transfer',
        name: 'Bank Transfer - BCA',
        description: 'Transfer via BCA (Activation Pending)',
        bank_code: 'bca',
        icon: 'bank',
        enabled: false,
        status: 'pending',
        note: 'Currently being processed by Midtrans'
      },
      {
        id: 'shopeepay',
        type: 'shopeepay',
        name: 'ShopeePay',
        description: 'Pay with ShopeePay (Activation Pending)',
        icon: 'mobile-payment',
        enabled: false,
        status: 'pending',
        note: 'Currently being processed by Midtrans'
      },
      {
        id: 'dana',
        type: 'dana',
        name: 'DANA',
        description: 'Pay with DANA (Activation Pending)',
        icon: 'mobile-payment',
        enabled: false,
        status: 'pending',
        note: 'Currently being processed by Midtrans'
      }
    ];
  }

};

export default MidtransDirectPayment;
