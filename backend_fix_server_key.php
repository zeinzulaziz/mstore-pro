<?php
/**
 * Backend Fix untuk Server Key Midtrans
 * Update server key di functions.php
 */

// Function untuk generate Midtrans Snap token dengan server key yang benar
function generate_midtrans_snap_token($order) {
    // Pastikan server key sudah benar
    $server_key = 'SB-Mid-server-2MQ1aJSUt06it3tg3Y9Kwfvsy'; // Sandbox server key
    $is_production = false; // Set to true for production
    
    // Debug: Log server key
    error_log('Using server key: ' . $server_key);
    
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
    
    // Debug: Log request body
    error_log('Midtrans request body: ' . json_encode($request_body));
    
    // Call Midtrans Snap API
    $midtrans_url = $is_production ? 
        'https://api.midtrans.com/v2/snap' : 
        'https://app.sandbox.midtrans.com/snap/v1/transactions';
    
    // Debug: Log URL
    error_log('Midtrans URL: ' . $midtrans_url);
    
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
    
    // Debug: Log authorization header
    error_log('Authorization header: Basic ' . base64_encode($server_key . ':'));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    // Debug: Log response
    error_log('Midtrans response code: ' . $http_code);
    error_log('Midtrans response: ' . $response);
    error_log('Curl error: ' . $curl_error);
    
    if ($http_code === 200) {
        $response_data = json_decode($response, true);
        if (isset($response_data['token'])) {
            return $response_data['token'];
        } else {
            error_log('No token in response: ' . $response);
            return false;
        }
    } else {
        error_log('Midtrans Snap API Error: ' . $response);
        return false;
    }
}

// Test function untuk debug
function test_midtrans_connection() {
    $server_key = 'SB-Mid-server-2MQ1aJSUt06it3tg3Y9Kwfvsy';
    
    $test_data = array(
        'transaction_details' => array(
            'order_id' => 'TEST_' . time(),
            'gross_amount' => 10000
        ),
        'customer_details' => array(
            'first_name' => 'Test',
            'email' => 'test@example.com'
        )
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://app.sandbox.midtrans.com/snap/v1/transactions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($server_key . ':')
    ));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log('Test Midtrans connection - Code: ' . $http_code . ', Response: ' . $response);
    
    return array(
        'code' => $http_code,
        'response' => $response
    );
}

// Register test endpoint
add_action('rest_api_init', function () {
    register_rest_route('mstore/v1', '/test-midtrans', array(
        'methods' => 'GET',
        'callback' => 'test_midtrans_connection',
        'permission_callback' => '__return_true'
    ));
});
?>
