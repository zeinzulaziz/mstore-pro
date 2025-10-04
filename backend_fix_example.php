<?php
/**
 * Backend Fix untuk M-Store Midtrans Integration
 * Tambahkan code ini ke functions.php atau buat file terpisah
 */

// Function untuk generate Midtrans Snap token
function generate_midtrans_snap_token($order) {
    // Midtrans configuration
    $server_key = 'SB-Mid-server-2MQ1aJSUt06it3tg3Y9Kwfvsy'; // Sandbox server key
    $is_production = false; // Set to true for production
    
    // Prepare transaction details
    $transaction_details = array(
        'order_id' => $order->get_id(),
        'gross_amount' => $order->get_total()
    );
    
    // Prepare customer details
    $customer_details = array(
        'first_name' => $order->get_billing_first_name(),
        'last_name' => $order->get_billing_last_name(),
        'email' => $order->get_billing_email(),
        'phone' => $order->get_billing_phone(),
        'billing_address' => array(
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'address' => $order->get_billing_address_1(),
            'city' => $order->get_billing_city(),
            'postal_code' => $order->get_billing_postcode(),
            'phone' => $order->get_billing_phone(),
            'country_code' => $order->get_billing_country()
        ),
        'shipping_address' => array(
            'first_name' => $order->get_shipping_first_name(),
            'last_name' => $order->get_shipping_last_name(),
            'address' => $order->get_shipping_address_1(),
            'city' => $order->get_shipping_city(),
            'postal_code' => $order->get_shipping_postcode(),
            'phone' => $order->get_shipping_phone(),
            'country_code' => $order->get_shipping_country()
        )
    );
    
    // Prepare item details
    $item_details = array();
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $item_details[] = array(
            'id' => $item->get_product_id(),
            'price' => $item->get_total(),
            'quantity' => $item->get_quantity(),
            'name' => $item->get_name(),
            'category' => 'ecommerce',
            'merchant_name' => get_bloginfo('name')
        );
    }
    
    // Prepare request body
    $request_body = array(
        'transaction_details' => $transaction_details,
        'customer_details' => $customer_details,
        'item_details' => $item_details
    );
    
    // Call Midtrans Snap API
    $midtrans_url = $is_production ? 
        'https://api.midtrans.com/v2/snap' : 
        'https://app.sandbox.midtrans.com/snap/v1/transactions';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $midtrans_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request_body));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($server_key . ':')
    ));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $response_data = json_decode($response, true);
        return $response_data['token'];
    } else {
        error_log('Midtrans Snap API Error: ' . $response);
        return false;
    }
}

// Register REST API endpoint
add_action('rest_api_init', function () {
    register_rest_route('mstore/v1', '/midtrans', array(
        'methods' => 'POST',
        'callback' => 'mstore_midtrans_create_order',
        'permission_callback' => '__return_true'
    ));
});

// Function untuk create order dan generate Snap token
function mstore_midtrans_create_order($request) {
    try {
        $data = $request->get_json_params();
        
        // Create WooCommerce Order
        $order = wc_create_order();
        
        // Set customer details
        $order->set_billing_first_name($data['first_name']);
        $order->set_billing_last_name($data['last_name']);
        $order->set_billing_email($data['email']);
        $order->set_billing_phone($data['phone']);
        
        // Set billing address
        if (isset($data['billing'])) {
            $billing = $data['billing'];
            $order->set_billing_address_1($billing['address_1'] ?? '');
            $order->set_billing_city($billing['city'] ?? '');
            $order->set_billing_state($billing['state'] ?? '');
            $order->set_billing_postcode($billing['postcode'] ?? '');
            $order->set_billing_country($billing['country'] ?? 'ID');
        }
        
        // Set shipping address
        if (isset($data['shipping'])) {
            $shipping = $data['shipping'];
            $order->set_shipping_first_name($shipping['first_name'] ?? $data['first_name']);
            $order->set_shipping_last_name($shipping['last_name'] ?? $data['last_name']);
            $order->set_shipping_address_1($shipping['address_1'] ?? '');
            $order->set_shipping_city($shipping['city'] ?? '');
            $order->set_shipping_state($shipping['state'] ?? '');
            $order->set_shipping_postcode($shipping['postcode'] ?? '');
            $order->set_shipping_country($shipping['country'] ?? 'ID');
        }
        
        // Add line items
        if (isset($data['line_items']) && is_array($data['line_items'])) {
            foreach ($data['line_items'] as $item) {
                $product_id = $item['product_id'] ?? 0;
                $quantity = $item['quantity'] ?? 1;
                $price = $item['price'] ?? 0;
                
                if ($product_id > 0) {
                    $product = wc_get_product($product_id);
                    if ($product) {
                        $order->add_product($product, $quantity);
                    }
                } else {
                    // Add custom line item
                    $line_item = new WC_Order_Item_Product();
                    $line_item->set_name($item['name'] ?? 'Custom Item');
                    $line_item->set_quantity($quantity);
                    $line_item->set_total($price * $quantity);
                    $order->add_item($line_item);
                }
            }
        }
        
        // Add shipping method
        if (isset($data['selectedShippingMethod'])) {
            $shipping_method = $data['selectedShippingMethod'];
            $shipping = new WC_Order_Item_Shipping();
            $shipping->set_method_title($shipping_method['service_name'] ?? 'Shipping');
            $shipping->set_method_id($shipping_method['courier_code'] ?? 'shipping');
            $shipping->set_total($shipping_method['price'] ?? 0);
            $order->add_item($shipping);
        }
        
        // Set payment method
        $order->set_payment_method('midtrans');
        $order->set_payment_method_title('Midtrans');
        
        // Calculate totals
        $order->calculate_totals();
        $order->set_status('pending');
        $order->save();
        
        // Generate Snap Token
        $snap_token = generate_midtrans_snap_token($order);
        
        if ($snap_token) {
            // Return success response
            return array(
                'success' => true,
                'order_id' => $order->get_id(),
                'token' => $snap_token,
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v4/redirection/' . $snap_token,
                'woo_order' => array(
                    'id' => $order->get_id(),
                    'status' => $order->get_status(),
                    'total' => $order->get_total(),
                    'currency' => $order->get_currency()
                )
            );
        } else {
            return new WP_Error('snap_token_error', 'Failed to generate Snap token', array('status' => 500));
        }
        
    } catch (Exception $e) {
        return new WP_Error('order_creation_error', $e->getMessage(), array('status' => 500));
    }
}
?>
