<?php
/**
 * Headless Password Reset Flow
 * This snippet changes the password reset links sent by WordPress and WooCommerce
 * to point to the Next.js frontend instead of the WordPress backend.
 * It also registers a REST API endpoint to actually reset the password.
 */

// 1. Change WooCommerce 'New Account' password link
add_filter( 'woocommerce_get_reset_password_url', 'headless_reset_password_url', 10, 2 );
function headless_reset_password_url( $url, $user_login = '' ) {
    $frontend_url = get_option('neon_stack_cors_origin', 'http://localhost:3000'); // Or define a constant
    if ( empty( $user_login ) && isset( $_GET['login'] ) ) {
        $user_login = sanitize_text_field( $_GET['login'] );
    }

    // In WC context, it usually generates a key. Let's pull from global if needed or rely on WP's default retrieve_password_key
    // Better to filter the WP core retrieve_password_message as well
    return $url;
}

// 2. Change WP core retrieve password link (used by standard WP emails and some WC emails depending on settings)
add_filter( 'retrieve_password_message', 'headless_retrieve_password_message', 10, 4 );
function headless_retrieve_password_message( $message, $key, $user_login, $user_data ) {
    $frontend_url = get_option('neon_stack_cors_origin', 'http://localhost:3000'); // Fallback to localhost if not set

    $reset_link = trailingslashit( $frontend_url ) . 'reset-password?key=' . $key . '&login=' . rawurlencode( $user_login );

    $message = __( 'Someone has requested a password reset for the following account:' ) . "\r\n\r\n";
    $message .= network_home_url( '/' ) . "\r\n\r\n";
    $message .= sprintf( __( 'Username: %s' ), $user_login ) . "\r\n\r\n";
    $message .= __( 'If this was a mistake, just ignore this email and nothing will happen.' ) . "\r\n\r\n";
    $message .= __( 'To reset your password, visit the following address:' ) . "\r\n\r\n";
    $message .= '<' . $reset_link . ">\r\n";

    return $message;
}

// 3. Register custom REST endpoint for headless password reset
add_action( 'rest_api_init', 'headless_register_reset_password_endpoint' );
function headless_register_reset_password_endpoint() {
    register_rest_route( 'headless/v1', '/reset-password', array(
        'methods' => 'POST',
        'callback' => 'headless_reset_password_callback',
        'permission_callback' => '__return_true', // Public endpoint
    ) );
}

function headless_reset_password_callback( $request ) {
    $params = $request->get_json_params();
    $key = isset( $params['key'] ) ? sanitize_text_field( $params['key'] ) : '';
    $login = isset( $params['login'] ) ? sanitize_text_field( $params['login'] ) : '';
    $password = isset( $params['password'] ) ? $params['password'] : '';

    if ( empty( $key ) || empty( $login ) || empty( $password ) ) {
        return new WP_Error( 'missing_fields', 'Missing key, login, or password.', array( 'status' => 400 ) );
    }

    $user = check_password_reset_key( $key, $login );

    if ( is_wp_error( $user ) ) {
        return new WP_Error( 'invalid_key', 'Invalid or expired password reset key.', array( 'status' => 400 ) );
    }

    reset_password( $user, $password );

    return rest_ensure_response( array( 'success' => true, 'message' => 'Password reset successfully.' ) );
}
