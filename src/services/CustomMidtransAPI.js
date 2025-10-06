/**
 * Custom Midtrans API Service
 * Uses custom WordPress endpoint for secure Snap token generation
 * API keys are stored securely on WordPress server
 */

import Config from '../common/Config';
import { WooCommerceOrderService } from './WooCommerceOrderService';

export const CustomMidtransAPI = {

  /**
   * Create Midtrans transaction via custom WordPress endpoint
   */
  createSnapTransaction: async (orderData) => {
    try {
      console.log('🚀 Creating Snap transaction via custom endpoint...');
      console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
      
      const { url } = Config.WooCommerce;
      const endpoint = `${url}/wp-json/custom/v1/create-midtrans`;
      
      // Calculate total amount
      const grossAmount = orderData.gross_amount || 
                         orderData.total || 
                         orderData.totalPrice || 
                         orderData.line_items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) ||
                         100000;

      // Prepare request data
      const requestData = {
        amount: grossAmount,
        order_id: orderData.id || `ORDER_${Date.now()}`,
        customer_id: orderData.customer_id || 0, // Add customer_id
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
        billing_address: {
          first_name: orderData.billing?.first_name || 
                     orderData.customer_details?.first_name || 
                     'Customer',
          last_name: orderData.billing?.last_name || 
                    orderData.customer_details?.last_name || 
                    '',
          address: orderData.billing?.address_1 || '',
          city: orderData.billing?.city || '',
          state: orderData.billing?.state || '',
          postal_code: orderData.billing?.postcode || '',
          phone: orderData.customer_details?.phone || 
                orderData.billing?.phone || 
                '08123456789',
          country_code: (orderData.billing?.country === 'ID' ? 'IDN' : orderData.billing?.country) || 'IDN'
        },
        shipping_address: {
          first_name: orderData.shipping?.first_name || 
                     orderData.customer_details?.first_name || 
                     'Customer',
          last_name: orderData.shipping?.last_name || 
                    orderData.customer_details?.last_name || 
                    '',
          address: orderData.shipping?.address_1 || '',
          city: orderData.shipping?.city || '',
          state: orderData.shipping?.state || '',
          postal_code: orderData.shipping?.postcode || '',
          phone: orderData.customer_details?.phone || 
                orderData.billing?.phone || 
                '08123456789',
          country_code: (orderData.shipping?.country === 'ID' ? 'IDN' : orderData.shipping?.country) || 'IDN'
        },
        item_details: (() => {
          const items = orderData.line_items?.map((item, index) => {
            // Limit name length to 50 characters (Midtrans limit)
            let name = item.name || item.product_name || `Product ${index + 1}`;
            if (name.length > 50) {
              name = name.substring(0, 47) + '...';
            }
            
            return {
              id: item.product_id?.toString() || 
                  item.id?.toString() || 
                  `item_${index}_${Date.now()}`,
              price: Math.round(item.price || item.total || item.unit_price || 10000),
              quantity: parseInt(item.quantity || 1),
              name: name,
              category: 'ecommerce',
              merchant_name: 'Dose of Beauty'
            };
          }) || [];

          // Add shipping cost as separate item if exists
          const shippingPrice = orderData.shippingPrice || orderData.selectedShippingMethod?.price || 0;
          if (shippingPrice > 0) {
            items.push({
              id: 'shipping',
              price: Math.round(shippingPrice),
              quantity: 1,
              name: 'Shipping Cost',
              category: 'shipping',
              merchant_name: 'Dose of Beauty'
            });
          }

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
          finish: `${url}/midtrans/callback/finish`,
          pending: `${url}/midtrans/callback/pending`,
          error: `${url}/midtrans/callback/error`
        }
      };

      console.log('📤 Custom endpoint request data:', JSON.stringify(requestData, null, 2));

      // Call custom WordPress endpoint
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      console.log('📥 Custom endpoint response status:', response.status);
      console.log('📥 Custom endpoint response body:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        throw new Error(`Custom endpoint error! Status: ${response.status}, Message: ${errorData.message || errorData.status_message}`);
      }

      const result = JSON.parse(responseText);
      console.log('✅ Custom endpoint success response:', JSON.stringify(result, null, 2));

      // Check if response has error structure
      if (result.code === 'midtrans_api_error') {
        // Parse the actual Midtrans response from the error message
        try {
          const midtransResponse = JSON.parse(result.message.split('Midtrans API error: ')[1]);
          console.log('📦 Parsed Midtrans response:', midtransResponse);
          
          // Since server doesn't create WooCommerce order, create it from mobile app
          const wooOrderResult = await createWooCommerceOrderFromMobile(requestData, midtransResponse);
          
          return {
            success: true,
            token: midtransResponse.token,
            redirect_url: midtransResponse.redirect_url,
            order_id: requestData.order_id,
            woo_order_id: wooOrderResult.woo_order_id || null,
            warning: wooOrderResult.warning || null,
            is_demo: false
          };
        } catch (parseError) {
          console.error('❌ Error parsing Midtrans response:', parseError);
          throw new Error('Failed to parse Midtrans response');
        }
      }

      // Normal response structure
      // Since server doesn't create WooCommerce order, create it from mobile app
      const wooOrderResult = await createWooCommerceOrderFromMobile(requestData, result);
      
      return {
        success: true,
        token: result.token,
        redirect_url: result.redirect_url,
        order_id: requestData.order_id,
        woo_order_id: wooOrderResult.woo_order_id || null,
        warning: wooOrderResult.warning || null,
        is_demo: false
      };

    } catch (error) {
      console.error('❌ Error creating Snap transaction via custom endpoint:', error);
      console.error('❌ Error stack:', error.stack);

      // Fallback to demo payment URL
      const demoOrderId = `DEMO_CUSTOM_${Date.now()}`;
      const demoRedirectUrl = `https://app.midtrans.com/snap/v4/redirection/demo-token-${Date.now()}`;
      const warningMessage = `Custom endpoint error: ${error.message}. Using demo payment URL.`;

      return {
        success: true,
        token: 'demo-token-' + Date.now(),
        redirect_url: demoRedirectUrl,
        order_id: demoOrderId,
        warning: warningMessage,
        is_demo: true
      };
    }
  }
};

/**
 * Create WooCommerce order from mobile app as fallback
 */
const createWooCommerceOrderFromMobile = async (requestData, midtransResponse) => {
  try {
    console.log('🛒 Creating WooCommerce order from mobile app...');
    
    // Transform request data to WooCommerce format
    const wooOrderData = {
      customer_id: 0, // Guest order
      line_items: requestData.item_details?.map(item => {
        // For shipping items, use special handling
        if (item.id === 'shipping') {
          return {
            name: item.name || 'Shipping Cost',
            quantity: item.quantity || 1,
            total: (item.price || 0).toString(),
            // Don't set product_id for shipping
          };
        }
        
        // For regular products, try to use valid product_id or create custom line item
        const productId = parseInt(item.id);
        if (productId && productId > 0) {
          return {
            product_id: productId,
            quantity: item.quantity || 1,
          };
        } else {
          // Create custom line item for invalid product IDs
          return {
            name: item.name || 'Custom Product',
            quantity: item.quantity || 1,
            total: (item.price || 0).toString(),
            // Don't set product_id for custom items
          };
        }
      }) || [{
        name: 'Mobile App Order',
        quantity: 1,
        total: (requestData.amount || 100000).toString(),
      }],
      customer_details: {
        first_name: requestData.customer_details?.first_name || 'Customer',
        last_name: requestData.customer_details?.last_name || '',
        email: requestData.customer_details?.email || 'customer@example.com',
        phone: requestData.customer_details?.phone || '08123456789'
      },
      billing: requestData.billing_address ? {
        first_name: requestData.billing_address.first_name || requestData.customer_details?.first_name || 'Customer',
        last_name: requestData.billing_address.last_name || requestData.customer_details?.last_name || '',
        address_1: requestData.billing_address.address || '',
        city: requestData.billing_address.city || '',
        state: requestData.billing_address.state || '',
        postcode: requestData.billing_address.postal_code || '',
        country: requestData.billing_address.country_code || 'ID',
        email: requestData.customer_details?.email || 'customer@example.com',
        phone: requestData.customer_details?.phone || '08123456789'
      } : undefined,
      shipping: requestData.shipping_address ? {
        first_name: requestData.shipping_address.first_name || requestData.customer_details?.first_name || 'Customer',
        last_name: requestData.shipping_address.last_name || requestData.customer_details?.last_name || '',
        address_1: requestData.shipping_address.address || '',
        city: requestData.shipping_address.city || '',
        state: requestData.shipping_address.state || '',
        postcode: requestData.shipping_address.postal_code || '',
        country: requestData.shipping_address.country_code || 'ID'
      } : undefined,
      payment_method: 'midtrans',
      payment_method_title: 'Midtrans',
      status: 'pending',
      set_paid: false,
      meta_data: [
        {
          key: '_midtrans_order_id',
          value: requestData.order_id
        },
        {
          key: '_midtrans_token',
          value: midtransResponse.token
        },
        {
          key: '_midtrans_redirect_url',
          value: midtransResponse.redirect_url
        },
        {
          key: '_midtrans_payment_status',
          value: 'pending'
        },
        {
          key: '_midtrans_mobile_order',
          value: 'true'
        }
      ]
    };

    console.log('📤 WooCommerce order data:', JSON.stringify(wooOrderData, null, 2));

    // Create WooCommerce order
    const result = await WooCommerceOrderService.createOrderWithPayment(wooOrderData);
    
    if (result.success) {
      console.log('✅ WooCommerce order created from mobile app:', result.woo_order_id);
      return {
        woo_order_id: result.woo_order_id,
        warning: null
      };
    } else {
      console.warn('⚠️ Failed to create WooCommerce order from mobile app:', result.error);
      return {
        woo_order_id: null,
        warning: `WooCommerce order creation failed: ${result.error}`
      };
    }
    
  } catch (error) {
    console.error('❌ Error creating WooCommerce order from mobile app:', error);
    return {
      woo_order_id: null,
      warning: `WooCommerce order creation error: ${error.message}`
    };
  }
};

export default CustomMidtransAPI;
