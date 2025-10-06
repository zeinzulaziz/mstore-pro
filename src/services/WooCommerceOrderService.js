/**
 * WooCommerce Order Service
 * Handles order creation and payment URL retrieval through WooCommerce REST API
 * This is the SECURE way - no API keys in mobile app
 */

import Config from '../common/Config';
import { encode } from 'base-64';

export const WooCommerceOrderService = {

  /**
   * Create order and get payment URL from WooCommerce
   * WooCommerce Midtrans plugin will handle the rest
   */
  createOrderWithPayment: async (orderData) => {
    try {
      console.log('🛒 Creating order via WooCommerce REST API...');
      console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
      
      const { url, consumerKey, consumerSecret } = Config.WooCommerce;
      const auth = encode(`${consumerKey}:${consumerSecret}`);
      
      // Prepare WooCommerce order data
      const wooOrderData = {
        customer_id: orderData.customer_id || 0,
        payment_method: 'midtrans',
        payment_method_title: 'Midtrans',
        set_paid: false,
        status: 'pending',
        billing: {
          first_name: orderData.customer_details?.first_name || orderData.billing?.first_name || 'Customer',
          last_name: orderData.customer_details?.last_name || orderData.billing?.last_name || '',
          email: orderData.customer_details?.email || orderData.billing?.email || 'customer@example.com',
          phone: orderData.customer_details?.phone || orderData.billing?.phone || '08123456789',
          address_1: orderData.billing?.address_1 || '',
          city: orderData.billing?.city || '',
          state: orderData.billing?.state || '',
          postcode: orderData.billing?.postcode || '',
          country: orderData.billing?.country || 'ID'
        },
        shipping: {
          first_name: orderData.shipping?.first_name || orderData.customer_details?.first_name || 'Customer',
          last_name: orderData.shipping?.last_name || orderData.customer_details?.last_name || '',
          address_1: orderData.shipping?.address_1 || '',
          city: orderData.shipping?.city || '',
          state: orderData.shipping?.state || '',
          postcode: orderData.shipping?.postcode || '',
          country: orderData.shipping?.country || 'ID'
        },
        line_items: orderData.line_items?.map(item => ({
          product_id: item.product_id || 0,
          quantity: item.quantity || 1,
          price: item.price || 0
        })) || [],
        shipping_lines: orderData.selectedShippingMethod ? [{
          method_title: orderData.selectedShippingMethod.service_name || 'Shipping',
          method_id: orderData.selectedShippingMethod.courier_code || 'shipping',
          total: orderData.selectedShippingMethod.price?.toString() || '0'
        }] : [],
        meta_data: [
          { key: '_midtrans_mobile_order', value: 'true' },
          { key: '_midtrans_order_source', value: 'mobile_app' }
        ]
      };

      console.log('📤 WooCommerce order data:', JSON.stringify(wooOrderData, null, 2));

      // Create order via WooCommerce REST API
      const response = await fetch(`${url}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(wooOrderData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ WooCommerce Order Creation Error:', errorText);
        throw new Error(`WooCommerce API error! status: ${response.status}, message: ${errorText}`);
      }

      const createdOrder = await response.json();
      console.log('✅ WooCommerce order created successfully!');
      console.log('📋 Order ID:', createdOrder.id);
      console.log('📊 Status:', createdOrder.status);
      console.log('💰 Total:', createdOrder.total);

      // Get payment URL from order meta data or payment_url field
      const paymentUrl = WooCommerceOrderService.extractPaymentUrl(createdOrder);
      
      if (!paymentUrl) {
        console.warn('⚠️ No payment URL found in order. Midtrans plugin might not be active.');
        return {
          success: false,
          error: 'Payment URL not found. Please ensure Midtrans plugin is active.',
          order: createdOrder
        };
      }

      console.log('🔗 Payment URL:', paymentUrl);

      return {
        success: true,
        order_id: createdOrder.id,
        order: createdOrder,
        payment_url: paymentUrl,
        redirect_url: paymentUrl, // For compatibility with existing code
        token: WooCommerceOrderService.extractTokenFromUrl(paymentUrl)
      };

    } catch (error) {
      console.error('❌ Error creating WooCommerce order:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Extract payment URL from WooCommerce order
   * This could be in meta_data or payment_url field
   */
  extractPaymentUrl: (order) => {
    // Check if order has payment_url field
    if (order.payment_url) {
      return order.payment_url;
    }

    // Check meta_data for Midtrans payment URL
    if (order.meta_data) {
      const paymentUrlMeta = order.meta_data.find(meta => 
        meta.key === '_midtrans_payment_url' || 
        meta.key === 'payment_url' ||
        meta.key === '_midtrans_redirect_url'
      );
      
      if (paymentUrlMeta) {
        return paymentUrlMeta.value;
      }
    }

    // Check if order has payment_details
    if (order.payment_details && order.payment_details.payment_url) {
      return order.payment_details.payment_url;
    }

    return null;
  },

  /**
   * Extract token from payment URL
   */
  extractTokenFromUrl: (paymentUrl) => {
    if (!paymentUrl) return null;
    
    // Extract token from Midtrans Snap URL
    const tokenMatch = paymentUrl.match(/\/snap\/v[0-9]\/redirection\/(.+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }

    // Extract token from other Midtrans URL patterns
    const tokenMatch2 = paymentUrl.match(/token=([^&]+)/);
    if (tokenMatch2) {
      return tokenMatch2[1];
    }

    return null;
  },

  /**
   * Get order status from WooCommerce
   */
  getOrderStatus: async (orderId) => {
    try {
      const { url, consumerKey, consumerSecret } = Config.WooCommerce;
      const auth = encode(`${consumerKey}:${consumerSecret}`);

      const response = await fetch(`${url}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get order status: ${response.status}`);
      }

      const order = await response.json();
      return {
        success: true,
        order: order,
        status: order.status,
        payment_status: WooCommerceOrderService.getPaymentStatusFromOrder(order)
      };

    } catch (error) {
      console.error('❌ Error getting order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get payment status from order meta data
   */
  getPaymentStatusFromOrder: (order) => {
    if (!order.meta_data) return 'unknown';

    const paymentStatusMeta = order.meta_data.find(meta => 
      meta.key === '_midtrans_payment_status' || 
      meta.key === 'payment_status'
    );

    return paymentStatusMeta ? paymentStatusMeta.value : 'unknown';
  }
};

export default WooCommerceOrderService;
