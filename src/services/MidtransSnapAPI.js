/** @format */

/**
 * Midtrans Snap API Service
 * This service handles Snap API integration for WebView payment
 * Uses Snap API to get redirect_url for WebView display
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
  snapApiUrl: 'https://app.midtrans.com/snap/v1/transactions'
};

export const MidtransSnapAPI = {

  /**
   * Create Snap transaction and get redirect URL
   */
  createSnapTransaction: async (orderData) => {
    try {
      console.log('🚀 Creating Snap transaction...');
      
      const auth = encode(`${MIDTRANS_CONFIG.serverKey}:`);
      
      // Calculate total amount from existing data
      const grossAmount = orderData.gross_amount || 
                         orderData.total || 
                         orderData.totalPrice || 
                         100000;
      
      console.log('💰 Calculated gross amount:', grossAmount);
      console.log('🌍 Billing country:', orderData.billing?.country);
      console.log('🌍 Shipping country:', orderData.shipping?.country);
      
      // Prepare Snap API request data
      const snapData = {
        transaction_details: {
          order_id: orderData.id || `ORDER_${Date.now()}`,
          gross_amount: grossAmount
        },
        customer_id: orderData.customer_id || 0, // Add customer_id for WooCommerce
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
                '08123456789',
          billing_address: {
            first_name: orderData.billing?.first_name || orderData.customer_details?.first_name || 'Customer',
            last_name: orderData.billing?.last_name || orderData.customer_details?.last_name || '',
            address: orderData.billing?.address_1 || '',
            city: orderData.billing?.city || '',
            postal_code: orderData.billing?.postcode || '',
            phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
            country_code: (orderData.billing?.country === 'ID' ? 'IDN' : orderData.billing?.country) || 'IDN'
          },
          shipping_address: {
            first_name: orderData.shipping?.first_name || orderData.customer_details?.first_name || 'Customer',
            last_name: orderData.shipping?.last_name || orderData.customer_details?.last_name || '',
            address: orderData.shipping?.address_1 || '',
            city: orderData.shipping?.city || '',
            postal_code: orderData.shipping?.postcode || '',
            phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
            country_code: (orderData.shipping?.country === 'ID' ? 'IDN' : orderData.shipping?.country) || 'IDN'
          }
        },
        item_details: (() => {
          const items = orderData.line_items?.map((item, index) => ({
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
          })) || [];

          // Add shipping cost as separate item if exists
          const shippingPrice = orderData.shippingPrice || orderData.selectedShippingMethod?.price || 0;
          console.log('🚚 Shipping price:', shippingPrice);
          
          if (shippingPrice > 0) {
            items.push({
              id: 'shipping',
              price: shippingPrice,
              quantity: 1,
              name: 'Shipping Cost',
              category: 'shipping',
              merchant_name: 'Dose of Beauty'
            });
          }

          // Calculate total from items to match gross_amount
          const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          console.log('📊 Items total:', itemsTotal);
          console.log('📊 Gross amount:', grossAmount);
          console.log('📊 Difference:', grossAmount - itemsTotal);

          // If no items, add default item
          if (items.length === 0) {
            items.push({
              id: 'default_item',
              price: grossAmount,
              quantity: 1,
              name: 'Order Payment',
              category: 'ecommerce',
              merchant_name: 'Dose of Beauty'
            });
          }

          return items;
        })(),
        callbacks: {
          finish: 'https://doseofbeauty.id/midtrans/callback/finish',
          pending: 'https://doseofbeauty.id/midtrans/callback/pending',
          error: 'https://doseofbeauty.id/midtrans/callback/error'
        }
      };

      console.log('📤 Snap API request data:', JSON.stringify(snapData, null, 2));
      console.log('🌍 Final billing country_code:', snapData.customer_details.billing_address.country_code);
      console.log('🌍 Final shipping country_code:', snapData.customer_details.shipping_address.country_code);

      const response = await fetch(MIDTRANS_CONFIG.snapApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(snapData)
      });

      console.log('📥 Snap API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Snap API Error:', errorText);
        
        // Try to parse error as JSON
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error('❌ Parsed error data:', errorData);
          
          // If payment channel not activated, return demo payment
          if (errorData.status_message === 'Payment channel is not activated.') {
            console.log('⚠️ Payment channel not activated, returning demo Snap URL...');
            
            const demoSnapResult = {
              token: `demo-token-${Date.now()}`,
              redirect_url: `https://app.midtrans.com/snap/v2/vtweb/demo-token-${Date.now()}`
            };

            // Create WooCommerce order for demo payment too
            console.log('🛒 Creating WooCommerce order for demo Snap payment...');
            const wooOrder = await WooCommerceIntegration.createOrder({
              payment_method: 'snap',
              order_id: snapData.transaction_details.order_id,
              status: 'pending',
              va_number: '1234567890',
              data: { token: demoSnapResult.token }
            }, orderData);

            if (wooOrder.success) {
              console.log('✅ WooCommerce demo order created successfully:', wooOrder.order_id);
            } else {
              console.warn('⚠️ WooCommerce demo order creation failed:', wooOrder.error);
            }

            return {
              success: true,
              token: demoSnapResult.token,
              redirect_url: demoSnapResult.redirect_url,
              order_id: snapData.transaction_details.order_id,
              is_demo: true,
              warning: 'Payment channels not yet activated. This is a demo Snap payment.',
              woo_order_id: wooOrder.success ? wooOrder.order_id : null,
              woo_order: wooOrder.success ? wooOrder.order : null
            };
          }
        } catch (e) {
          console.error('❌ Could not parse error as JSON:', e);
        }
        
        throw new Error(`Snap API error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Snap transaction created successfully:', result);

      // Create WooCommerce order after successful Snap transaction
      console.log('🛒 Creating WooCommerce order...');
      const wooOrder = await WooCommerceIntegration.createOrder({
        payment_method: 'snap',
        order_id: snapData.transaction_details.order_id,
        status: 'pending',
        va_number: null, // Will be provided by Snap UI
        data: { token: result.token }
      }, orderData);

      if (wooOrder.success) {
        console.log('✅ WooCommerce order created successfully:', wooOrder.order_id);
      } else {
        console.warn('⚠️ WooCommerce order creation failed:', wooOrder.error);
      }

      return {
        success: true,
        token: result.token,
        redirect_url: result.redirect_url,
        order_id: snapData.transaction_details.order_id,
        is_demo: false,
        woo_order_id: wooOrder.success ? wooOrder.order_id : null,
        woo_order: wooOrder.success ? wooOrder.order : null
      };

    } catch (error) {
      console.error('❌ Error creating Snap transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get available payment method options for Snap
   */
  getPaymentMethodOptions: () => {
    return [
      {
        id: 'snap_all',
        type: 'snap',
        name: 'Midtrans Snap',
        description: 'All available payment methods',
        icon: 'credit-card',
        enabled: true,
        status: 'active'
      }
    ];
  }

};

export default MidtransSnapAPI;
