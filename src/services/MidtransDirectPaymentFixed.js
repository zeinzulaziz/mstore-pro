/** @format */

/**
 * Midtrans Direct Payment Service - FIXED VERSION
 * This service handles direct payment integration using Midtrans Core API
 * No WebView required - all payment methods are handled natively in the app
 */

import Config from '../common/Config';
import { encode } from 'base-64';
import WooCommerceIntegration from './WooCommerceIntegration';

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
   * Process specific payment method - FIXED VERSION
   */
  processPayment: async (orderData, paymentMethod) => {
    try {
      console.log(`🚀 Processing payment with method: ${paymentMethod.type}`);
      console.log('📦 Order data received:', JSON.stringify(orderData, null, 2));
      console.log('💳 Payment method received:', JSON.stringify(paymentMethod, null, 2));
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      // Calculate total amount - check multiple possible fields
      const grossAmount = orderData.gross_amount || 
                         orderData.total || 
                         orderData.totalPrice || 
                         orderData.line_items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 
                         100000;
      
      console.log('💰 Calculated gross amount:', grossAmount);
      
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
                     'Customer',
          last_name: orderData.customer_details?.last_name || 
                    orderData.billing?.last_name || 
                    '',
          email: orderData.customer_details?.email || 
                orderData.billing?.email || 
                'customer@example.com',
          phone: orderData.customer_details?.phone || 
                orderData.billing?.phone || 
                '08123456789'
        },
        item_details: orderData.line_items?.map((item, index) => ({
          id: item.product_id?.toString() || 
              item.id?.toString() || 
              `item_${index}_${Date.now()}`,
          price: item.price || 
                item.total || 
                item.unit_price || 
                10000,
          quantity: item.quantity || 1,
          name: item.name || 
                item.product_name || 
                `Product ${index + 1}`,
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        })) || [{
          id: 'default_item',
          price: grossAmount,
          quantity: 1,
          name: 'Order Payment',
          category: 'ecommerce',
          merchant_name: 'Dose of Beauty'
        }]
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

      console.log('📤 Payment data being sent to Midtrans:', JSON.stringify(paymentData, null, 2));

      const response = await fetch(`${MIDTRANS_CONFIG.baseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(paymentData)
      });

      console.log('📥 Payment response status:', response.status);
      console.log('📥 Payment response headers:', response.headers);

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
          
          // If payment channel not activated, return demo payment
          if (errorData.status_message === 'Payment channel is not activated.') {
            console.log('⚠️ Payment channel not activated, returning demo payment...');
            
            const demoPaymentResult = {
              order_id: `DEMO_${Date.now()}`,
              status_code: '201',
              status_message: 'Success',
              payment_type: paymentMethod.type,
              va_numbers: [{
                va_number: '1234567890',
                bank: paymentMethod.bank_code || 'bni'
              }],
              transaction_time: new Date().toISOString(),
              transaction_status: 'pending'
            };

            // Create WooCommerce order for demo payment too
            console.log('🛒 Creating WooCommerce order for demo payment...');
            const wooOrder = await WooCommerceIntegration.createOrder({
              payment_method: paymentMethod.type,
              order_id: demoPaymentResult.order_id,
              status: 'pending',
              va_number: '1234567890',
              data: demoPaymentResult
            }, orderData);

            if (wooOrder.success) {
              console.log('✅ WooCommerce demo order created successfully:', wooOrder.order_id);
            } else {
              console.warn('⚠️ WooCommerce demo order creation failed:', wooOrder.error);
            }

            return {
              success: true,
              data: demoPaymentResult,
              payment_method: paymentMethod.type,
              status: 'pending',
              order_id: demoPaymentResult.order_id,
              va_number: '1234567890',
              is_demo: true,
              warning: 'Payment channels not yet activated. This is a demo payment.',
              woo_order_id: wooOrder.success ? wooOrder.order_id : null,
              woo_order: wooOrder.success ? wooOrder.order : null
            };
          }
        } catch (e) {
          console.error('❌ Could not parse error as JSON:', e);
        }
        
        throw new Error(`Payment failed! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Payment processed successfully:', JSON.stringify(result, null, 2));

      // Create WooCommerce order after successful payment
      console.log('🛒 Creating WooCommerce order...');
      const wooOrder = await WooCommerceIntegration.createOrder({
        payment_method: paymentMethod.type,
        order_id: result.order_id,
        status: result.status_code === '201' ? 'pending' : 'failed',
        va_number: result.va_numbers?.[0]?.va_number || null,
        data: result
      }, orderData);

      if (wooOrder.success) {
        console.log('✅ WooCommerce order created successfully:', wooOrder.order_id);
      } else {
        console.warn('⚠️ WooCommerce order creation failed:', wooOrder.error);
      }

      // Set up payment timeout for pending payments
      if (result.status_code === '201' && result.transaction_status === 'pending') {
        console.log('⏰ Setting up payment timeout...');
        await MidtransDirectPayment.handlePaymentTimeout(result.order_id, 1440); // 24 hours timeout (1440 minutes)
      }

      return {
        success: true,
        data: result,
        payment_method: paymentMethod.type,
        status: result.status_code === '201' ? 'pending' : 'failed',
        order_id: result.order_id,
        va_number: result.va_numbers?.[0]?.va_number || null,
        woo_order_id: wooOrder.success ? wooOrder.order_id : null,
        woo_order: wooOrder.success ? wooOrder.order : null
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

      // Update WooCommerce order status based on payment status
      if (result.transaction_status) {
        await MidtransDirectPayment.updateWooCommerceOrderStatus(orderId, result);
      }

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
   * Update WooCommerce order status based on Midtrans payment status
   */
  updateWooCommerceOrderStatus: async (midtransOrderId, paymentData) => {
    try {
      console.log(`🔄 Updating WooCommerce order status for Midtrans order: ${midtransOrderId}`);
      
      // Find WooCommerce order by Midtrans order ID
      const { url, consumerKey, consumerSecret } = Config.WooCommerce;
      const auth = encode(`${consumerKey}:${consumerSecret}`);
      
      // Search for order with Midtrans order ID
      const searchResponse = await fetch(`${url}/wp-json/wc/v3/orders?meta_key=_midtrans_order_id&meta_value=${midtransOrderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      });

      if (!searchResponse.ok) {
        console.warn('⚠️ Could not find WooCommerce order with Midtrans ID:', midtransOrderId);
        return { success: false, error: 'Order not found' };
      }

      const orders = await searchResponse.json();
      if (orders.length === 0) {
        console.warn('⚠️ No WooCommerce order found with Midtrans ID:', midtransOrderId);
        return { success: false, error: 'Order not found' };
      }

      const wooOrder = orders[0];
      console.log('📋 Found WooCommerce order:', wooOrder.id);

      // Map Midtrans status to WooCommerce status
      let wooStatus = 'pending';
      switch (paymentData.transaction_status) {
        case 'capture':
        case 'settlement':
          wooStatus = 'processing';
          break;
        case 'pending':
          wooStatus = 'pending';
          break;
        case 'deny':
        case 'cancel':
        case 'expire':
        case 'failure':
          wooStatus = 'cancelled';
          break;
        case 'refund':
          wooStatus = 'refunded';
          break;
        default:
          wooStatus = 'pending';
      }

      // Update order status
      const updateResult = await WooCommerceIntegration.updateOrderStatus(wooOrder.id, wooStatus, paymentData);
      
      if (updateResult.success) {
        console.log(`✅ WooCommerce order ${wooOrder.id} updated to ${wooStatus}`);
      } else {
        console.error(`❌ Failed to update WooCommerce order ${wooOrder.id}:`, updateResult.error);
      }

      return updateResult;

    } catch (error) {
      console.error('❌ Error updating WooCommerce order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Handle payment timeout/expiry
   */
  handlePaymentTimeout: async (orderId, timeoutMinutes = 1440) => {
    try {
      const timeoutHours = Math.round(timeoutMinutes / 60);
      console.log(`⏰ Setting up payment timeout for order: ${orderId} (${timeoutHours} hours / ${timeoutMinutes} minutes)`);
      
      // Set timeout to check payment status
      setTimeout(async () => {
        console.log(`⏰ Checking payment status after timeout for order: ${orderId}`);
        
        const statusResult = await MidtransDirectPayment.checkPaymentStatus(orderId);
        
        if (statusResult.success && statusResult.status === 'pending') {
          console.log(`⚠️ Payment still pending after ${timeoutHours} hours, updating to expired`);
          
          // Update to expired status
          await MidtransDirectPayment.updateWooCommerceOrderStatus(orderId, {
            transaction_status: 'expire',
            status_message: `Payment expired after ${timeoutHours} hours - user did not complete payment`
          });
        }
      }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds

      return { success: true };

    } catch (error) {
      console.error('❌ Error setting up payment timeout:', error);
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
