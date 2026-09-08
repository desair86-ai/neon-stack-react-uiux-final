<?php
/**
 * Plugin Name: Neon Stack Configurator Engine
 * Description: Reusable WooCommerce configurator engine for headless React frontends. Provides polished WordPress administration for configurators, option sets, fonts, languages, CORS, secure cart/order metadata and a private sign-only customer preview lifecycle.
 * Version: 2.3.5
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 * Author: designedbykrtida.in
 * License: GPL-2.0-or-later
 * Text Domain: neon-stack-configurator
 */

if ( ! defined( 'ABSPATH' ) ) exit;

final class Neon_Stack_Configurator {
    const VERSION = '2.3.5';
    const PRODUCT_CONFIG_META = '_neon_stack_configurator';
    const PRODUCT_SYNC_LOCK = 'neon_stack_product_sync_lock';
    const PRODUCT_SYNC_META = '_neon_stack_managed_configurator';
    const CONFIG_OPTION = 'neon_stack_config_v2';
    const CART_KEY = 'neon_stack_design';
    const META_KEY = '_neon_stack_design';
    const SCREENSHOT_META_KEY = '_neon_stack_screenshot_id';
    const SCREENSHOT_URL_META_KEY = '_neon_stack_screenshot_url';
    const TEMP_SCREENSHOT_TTL = 6 * HOUR_IN_SECONDS;
    const MAX_SCREENSHOT_BYTES = 1572864;
    const MAX_SCREENSHOT_PIXELS = 25000000;
    const SCREENSHOT_TOKEN_TTL_META = 'created';
    const MAX_DESIGN_JSON_BYTES = 102400;
    const MAX_NESTED_DEPTH = 6;
    const MAX_DESIGN_NODES = 1000;
    const MAX_HEADLESS_LINE_ITEMS = 50;
    const MAX_HEADLESS_META_ENTRIES = 50;
    const SCREENSHOT_RATE_LIMIT = 30;
    const SCREENSHOT_RATE_WINDOW = HOUR_IN_SECONDS;
    const API_NAMESPACE = 'neon-stack/v2';

    public static function init() {
        add_action( 'before_woocommerce_init', [ __CLASS__, 'declare_hpos_compatibility' ] );
        add_action( 'init', [ __CLASS__, 'ensure_configurator_products' ], 5 );
        add_filter( 'rest_pre_dispatch', [ __CLASS__, 'prepare_headless_order_request' ], 5, 3 );
        add_action( 'woocommerce_new_order_item', [ __CLASS__, 'process_headless_order_item' ], 20, 3 );
        add_action( 'woocommerce_new_order', [ __CLASS__, 'retry_pending_screenshots_for_order' ], 30, 2 );
        add_filter( 'woocommerce_add_to_cart_validation', [ __CLASS__, 'validate_add_to_cart_request' ], 5, 6 );
        add_filter( 'woocommerce_add_cart_item_data', [ __CLASS__, 'capture_cart_data' ], 20, 4 );
        add_filter( 'woocommerce_get_cart_item_from_session', [ __CLASS__, 'restore_cart_data' ], 20, 2 );
        add_filter( 'woocommerce_get_item_data', [ __CLASS__, 'cart_display_data' ], 20, 2 );
        add_action( 'woocommerce_before_calculate_totals', [ __CLASS__, 'validate_and_price_cart' ], 20 );
        add_action( 'woocommerce_check_cart_items', [ __CLASS__, 'validate_cart_items_for_checkout' ], 20 );
        add_action( 'woocommerce_checkout_create_order_line_item', [ __CLASS__, 'save_order_item_data' ], 20, 4 );
        add_action( 'woocommerce_after_order_itemmeta', [ __CLASS__, 'admin_screenshot' ], 20, 3 );
        add_action( 'woocommerce_cart_item_removed', [ __CLASS__, 'cart_item_removed' ], 20, 2 );
        add_action( 'woocommerce_before_cart_emptied', [ __CLASS__, 'cart_emptied' ], 20, 1 );
        add_filter( 'woocommerce_order_item_get_formatted_meta_data', [ __CLASS__, 'hide_internal_meta' ], 20, 2 );

        add_action( 'admin_menu', [ __CLASS__, 'admin_menu' ] );
        add_action( 'admin_init', [ __CLASS__, 'handle_admin_actions' ] );
        add_action( 'admin_enqueue_scripts', [ __CLASS__, 'admin_assets' ] );
        add_action( 'woocommerce_product_options_general_product_data', [ __CLASS__, 'product_configurator_field' ] );
        add_action( 'woocommerce_process_product_meta', [ __CLASS__, 'save_product_configurator_field' ], 20, 1 );
        add_action( 'admin_post_neon_stack_preview', [ __CLASS__, 'serve_private_preview' ] );

        add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
        add_filter( 'rest_pre_serve_request', [ __CLASS__, 'cors_headers' ], 10, 4 );

        add_action( 'neon_stack_cleanup_temp', [ __CLASS__, 'cleanup_temp_screenshots' ] );
        if ( ! wp_next_scheduled( 'neon_stack_cleanup_temp' ) ) {
            wp_schedule_event( time() + HOUR_IN_SECONDS, 'twicedaily', 'neon_stack_cleanup_temp' );
        }
    }

    public static function activate() {
        if ( false === get_option( self::CONFIG_OPTION, false ) ) {
            add_option( self::CONFIG_OPTION, self::default_config(), '', false );
        }
        if ( ! wp_next_scheduled( 'neon_stack_cleanup_temp' ) ) {
            wp_schedule_event( time() + HOUR_IN_SECONDS, 'twicedaily', 'neon_stack_cleanup_temp' );
        }
        self::ensure_configurator_products();
    }

    public static function deactivate() {
        wp_clear_scheduled_hook( 'neon_stack_cleanup_temp' );
    }

    public static function declare_hpos_compatibility() {
        if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
            \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
        }
    }


    /**
     * Ensure the two built-in configurators are backed by real WooCommerce
     * products. React never creates or invents product IDs; WordPress owns them.
     *
     * Existing valid product mappings are preserved. Only an unmapped/missing
     * built-in configurator is repaired/created.
     */
    /**
     * Return the WooCommerce product explicitly assigned to a configurator
     * from the product editor. Product-level assignment is the preferred
     * source of truth; the legacy configurator mapping remains as a fallback
     * for existing installations.
     */
    private static function assigned_product_id( $type ) {
        $type = sanitize_key( $type );
        if ( ! $type || ! function_exists( 'wc_get_products' ) ) return 0;

        $ids = wc_get_products([
            'status' => [ 'publish', 'private', 'draft', 'pending' ],
            'limit' => 1,
            'return' => 'ids',
            'meta_key' => self::PRODUCT_CONFIG_META,
            'meta_value' => $type,
        ]);
        return ! empty( $ids[0] ) ? absint( $ids[0] ) : 0;
    }

    /**
     * WooCommerce product editor control. Selecting Custom Neon or Mojo Mix
     * converts that existing product into the chosen Neon Stack product type.
     * No frontend/UI assets are involved; this is admin-only metadata.
     */
    public static function product_configurator_field() {
        global $post;
        if ( ! $post || 'product' !== get_post_type( $post ) || ! current_user_can( 'manage_woocommerce' ) ) return;

        $current = sanitize_key( (string) get_post_meta( $post->ID, self::PRODUCT_CONFIG_META, true ) );
        echo '<div class="options_group neon-stack-product-configurator" style="padding:12px 0;border-top:1px solid #eee;margin-top:8px;">';
        echo '<p class="form-field">';
        echo '<label for="neon_stack_configurator_type"><strong>Neon Stack Configurator</strong></label>';
        echo '<select name="neon_stack_configurator_type" id="neon_stack_configurator_type" style="min-width:260px;">';
        echo '<option value="">Standard WooCommerce Product</option>';
        echo '<option value="custom_neon" '.selected($current,'custom_neon',false).'>Custom Neon</option>';
        echo '<option value="mojo_mix" '.selected($current,'mojo_mix',false).'>Mojo Mix</option>';
        echo '</select>';
        echo '<span class="description" style="display:block;margin-left:162px;max-width:620px;">Assign this existing WooCommerce product to a Neon Stack configurator. The assignment is server-side and is used by the headless React frontend; it does not change the React UI/UX.</span>';
        echo '</p>';
        if ( $current ) {
            echo '<p style="margin:0 0 0 162px;color:#2271b1;"><strong>✓ Connected:</strong> '.esc_html( 'custom_neon' === $current ? 'Custom Neon' : 'Mojo Mix' ).'</p>';
        }
        echo '</div>';
    }

    /** Save the product-level configurator assignment and sync the existing
     * configurator mapping so current React API consumers keep working. */
    public static function save_product_configurator_field( $product_id ) {
        if ( ! current_user_can( 'manage_woocommerce' ) ) return;
        if ( ! isset( $_POST['neon_stack_configurator_type'] ) ) return;
        $new_type = sanitize_key( wp_unslash( $_POST['neon_stack_configurator_type'] ) );
        if ( ! in_array( $new_type, [ '', 'custom_neon', 'mojo_mix' ], true ) ) $new_type = '';
        $old_type = sanitize_key( (string) get_post_meta( $product_id, self::PRODUCT_CONFIG_META, true ) );

        if ( $old_type && $old_type !== $new_type ) {
            delete_post_meta( $product_id, self::PRODUCT_CONFIG_META );
            delete_post_meta( $product_id, self::PRODUCT_SYNC_META );
        }
        if ( $new_type ) {
            // Keep the assignment unique: one WooCommerce product is the
            // canonical product for a given built-in configurator.
            $others = get_posts([
                'post_type' => 'product',
                'post_status' => 'any',
                'posts_per_page' => -1,
                'fields' => 'ids',
                'meta_key' => self::PRODUCT_CONFIG_META,
                'meta_value' => $new_type,
                'exclude' => [ $product_id ],
                'no_found_rows' => true,
            ]);
            foreach ( (array) $others as $other_id ) delete_post_meta( $other_id, self::PRODUCT_CONFIG_META );
            update_post_meta( $product_id, self::PRODUCT_CONFIG_META, $new_type );
        }

        $config = self::config();
        if ( $old_type && $old_type !== $new_type && isset( $config['configurators'][ $old_type ] ) ) {
            if ( absint( $config['configurators'][ $old_type ]['product_id'] ?? 0 ) === absint( $product_id ) ) {
                $config['configurators'][ $old_type ]['product_id'] = 0;
                $config['configurators'][ $old_type ]['product_sku'] = '';
            }
        }
        if ( $new_type && isset( $config['configurators'][ $new_type ] ) ) {
            $product = wc_get_product( $product_id );
            if ( $product instanceof WC_Product ) {
                $config['configurators'][ $new_type ]['product_id'] = absint( $product_id );
                $config['configurators'][ $new_type ]['product_sku'] = sanitize_text_field( (string) $product->get_sku() );
                $config['configurators'][ $new_type ]['price_mode'] = 'size_base';
                update_post_meta( $product_id, self::PRODUCT_SYNC_META, $new_type );
            }
        }
        self::save_config( $config );
    }

    public static function ensure_configurator_products() {
        if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'wc_get_product' ) || ! class_exists( 'WC_Product_Simple' ) ) {
            return;
        }

        $lock_key = self::PRODUCT_SYNC_LOCK;
        $lock = get_option( $lock_key, false );
        if ( $lock && ( time() - absint( $lock ) ) < 60 ) {
            return;
        }
        if ( $lock ) {
            delete_option( $lock_key );
        }
        if ( ! add_option( $lock_key, time(), '', 'no' ) ) {
            return;
        }

        try {
            $config = self::config();
            $changed = false;

            $managed = [
                'custom_neon' => [
                    'name' => 'Custom Neon Sign',
                    'sku'  => 'NEON-STACK-CUSTOM',
                    'description' => 'Custom-designed neon sign created with the Neon Stack configurator.',
                ],
                'mojo_mix' => [
                    'name' => 'Mojo Mix',
                    'sku'  => 'NEON-STACK-MOJO',
                    'description' => 'Mojo Mix neon sign created with the Neon Stack configurator.',
                ],
            ];

            foreach ( $managed as $type => $defaults ) {
                if ( empty( $config['configurators'][ $type ] ) ) {
                    continue;
                }

                $assigned_id = self::assigned_product_id( $type );
                if ( $assigned_id ) {
                    $assigned = wc_get_product( $assigned_id );
                    if ( $assigned instanceof WC_Product && 'trash' !== $assigned->get_status() ) {
                        $config['configurators'][ $type ]['product_id'] = $assigned_id;
                        $config['configurators'][ $type ]['product_sku'] = sanitize_text_field( (string) $assigned->get_sku() );
                        $config['configurators'][ $type ]['price_mode'] = 'size_base';
                        update_post_meta( $assigned_id, self::PRODUCT_SYNC_META, $type );
                        $changed = true;
                        continue;
                    }
                }

                $current_id = absint( $config['configurators'][ $type ]['product_id'] ?? 0 );
                $product = $current_id ? wc_get_product( $current_id ) : false;

                // A valid mapped product is authoritative. Keep it intact.
                if ( $product instanceof WC_Product && 'trash' !== $product->get_status() ) {
                    $sku = (string) $product->get_sku();
                    if ( empty( $config['configurators'][ $type ]['product_sku'] ) ) {
                        $config['configurators'][ $type ]['product_sku'] = $sku ?: $defaults['sku'];
                        $changed = true;
                    }
                    if ( ! self::is_managed_configurator_product( $product, $type ) ) {
                        // Existing plugin-created products from older versions may
                        // lack the marker. Only adopt the exact reserved SKU + name.
                        if ( $sku === $defaults['sku'] && $product->get_name() === $defaults['name'] ) {
                            update_post_meta( $product->get_id(), self::PRODUCT_SYNC_META, $type );
                        }
                    }
                    continue;
                }

                $sku = sanitize_text_field(
                    (string) ( $config['configurators'][ $type ]['product_sku'] ?? $defaults['sku'] )
                );
                if ( '' === $sku ) {
                    $sku = $defaults['sku'];
                }

                // Recover an existing plugin product by its reserved SKU. This
                // repairs older installations where the product existed but the
                // configuration option was lost/reset.
                $existing_by_sku = function_exists( 'wc_get_product_id_by_sku' )
                    ? absint( wc_get_product_id_by_sku( $sku ) )
                    : 0;

                if ( $existing_by_sku ) {
                    $existing = wc_get_product( $existing_by_sku );
                    if ( $existing instanceof WC_Product && 'trash' !== $existing->get_status() ) {
                        $is_marked = self::is_managed_configurator_product( $existing, $type );
                        $is_exact_reserved_product =
                            $existing->get_sku() === $sku &&
                            $existing->get_name() === $defaults['name'];

                        // Never take over an unrelated product. Adoption is
                        // allowed only for the plugin marker or exact reserved
                        // product identity.
                        if ( $is_marked || $is_exact_reserved_product ) {
                            update_post_meta( $existing_by_sku, self::PRODUCT_SYNC_META, $type );
                            if ( 'trash' === $existing->get_status() ) {
                                $existing->set_status( 'publish' );
                                $existing->set_catalog_visibility( 'hidden' );
                                $existing->set_virtual( true );
                                $existing->set_downloadable( false );
                                $existing->save();
                            }
                            $config['configurators'][ $type ]['product_id'] = $existing_by_sku;
                            $config['configurators'][ $type ]['product_sku'] = $existing->get_sku();
                            $config['configurators'][ $type ]['price_mode'] = 'size_base';
                            $changed = true;
                            continue;
                        }

                        // Reserved SKU collision with an unrelated merchant
                        // product: do not take it over. Create a unique SKU.
                        $base_sku = $sku;
                        $suffix = 2;
                        while ( function_exists( 'wc_get_product_id_by_sku' ) && wc_get_product_id_by_sku( $sku ) ) {
                            $sku = $base_sku . '-' . $suffix++;
                        }
                    }
                }

                $product = new WC_Product_Simple();
                $product->set_name( $defaults['name'] );
                $product->set_description( $defaults['description'] );
                $product->set_short_description( $defaults['description'] );
                $product->set_status( 'publish' );
                $product->set_catalog_visibility( 'hidden' );
                $product->set_virtual( true );
                $product->set_downloadable( false );
                $product->set_sold_individually( false );
                $product->set_regular_price( '0' );
                $product->set_price( '0' );
                $product->set_sku( $sku );
                $product->set_tax_status( 'taxable' );
                $product->set_manage_stock( false );

                $new_id = $product->save();
                if ( ! $new_id ) {
                    continue;
                }

                update_post_meta( $new_id, self::PRODUCT_SYNC_META, $type );
                $config['configurators'][ $type ]['product_id'] = absint( $new_id );
                $config['configurators'][ $type ]['product_sku'] = $sku;
                $config['configurators'][ $type ]['price_mode'] = 'size_base';
                $changed = true;
            }

            if ( $changed ) {
                self::save_config( $config );
            }
        } finally {
            delete_option( $lock_key );
        }
    }

    private static function is_managed_configurator_product( $product, $type ) {
        return $product instanceof WC_Product
            && sanitize_key( (string) get_post_meta( $product->get_id(), self::PRODUCT_SYNC_META, true ) ) === sanitize_key( $type );
    }

    /**
     * Resolve the canonical WooCommerce product for a configurator.
     * Product-level assignment is authoritative; the legacy config mapping is
     * retained only as a migration fallback for older installations.
     */
    private static function authoritative_product_id( $type ) {
        $type = sanitize_key( $type );
        if ( ! $type ) return 0;
        $assigned = self::assigned_product_id( $type );
        if ( $assigned ) return absint( $assigned );
        $config = self::config();
        return absint( $config['configurators'][ $type ]['product_id'] ?? 0 );
    }

    /**
     * Headless REST checkout compatibility:
     * if a Neon Stack order line has no product_id/SKU, resolve the product
     * exclusively from the server-side configurator mapping.
     */
    public static function prepare_headless_order_request( $result, $server, $request ) {
        if ( $result instanceof WP_HTTP_Response || is_wp_error( $result ) ) return $result;
        if ( ! $request instanceof WP_REST_Request || 'POST' !== strtoupper( $request->get_method() ) ) return $result;

        $route = $request->get_route();
        if ( ! preg_match( '#^/wc/v[123]/orders/?$#', $route ) ) return $result;

        $params = $request->get_json_params();
        if ( ! is_array( $params ) ) $params = $request->get_params();
        if ( empty( $params['line_items'] ) || ! is_array( $params['line_items'] ) ) return $result;
        if ( count( $params['line_items'] ) > self::MAX_HEADLESS_LINE_ITEMS ) {
            return new WP_Error( 'neon_too_many_order_items', __( 'The order contains too many line items.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
        }

        $changed = false;
        // Self-heal the built-in product mappings before validating any headless order.
        // This is intentionally server-side; React never becomes the source of truth.
        self::ensure_configurator_products();
        $config = self::config();
        foreach ( $params['line_items'] as $index => $line ) {
            if ( ! is_array( $line ) ) continue;

            $design = self::extract_headless_line_design( $line );
            if ( null === $design ) continue;

            $clean = self::sanitize_design( $design );
            $type = sanitize_key( $clean['configurator'] ?? '' );
            if ( ! $type || empty( $config['configurators'][ $type ] ) ) continue;

            $expected_id = self::authoritative_product_id( $type );
            $product = $expected_id ? wc_get_product( $expected_id ) : false;
            if ( ! $expected_id || ! $product instanceof WC_Product ) {
                return new WP_Error( 'neon_unmapped_configurator', __( 'This neon configurator is not connected to a valid WooCommerce product.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
            }

            $validation = self::validate_design_for_product( $clean, $expected_id, 0 );
            if ( is_wp_error( $validation ) ) {
                return new WP_Error( 'neon_invalid_design', $validation->get_error_message(), [ 'status' => 400 ] );
            }
            if ( self::max_shape_quantity( $clean['shapes'] ?? [] ) > 100 ) {
                return new WP_Error( 'neon_invalid_shape_quantity', __( 'Too many neon shapes were selected.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
            }
            if ( ! empty( $clean['screenshot_token'] ) && ! self::temp_screenshot_exists( $clean['screenshot_token'] ) ) {
                return new WP_Error( 'neon_screenshot_expired', __( 'The neon preview has expired. Please add the design to the cart again.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
            }

            // For a recognized Neon line, the server mapping wins even if the
            // browser sends no product reference or sends a conflicting one.
            $params['line_items'][ $index ]['product_id'] = $expected_id;
            unset( $params['line_items'][ $index ]['sku'], $params['line_items'][ $index ]['variation_id'] );

            // Never accept client-supplied monetary totals for a Neon product.
            // Recalculate the unit price from the WordPress option library.
            $cfg = $config['configurators'][ $type ];
            $groups = $config['options'][ $type ];
            $breakdown = self::server_price_breakdown( $clean, $product, $cfg, $groups );
            if ( empty( $breakdown ) ) {
                return new WP_Error( 'neon_price_unavailable', __( 'The neon configuration price could not be calculated.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
            }
            $quantity = max( 1, min( 100, absint( $line['quantity'] ?? 1 ) ) );
            $unit_price = (float) $breakdown['final_unit_price'];
            $params['line_items'][ $index ]['quantity'] = $quantity;
            $params['line_items'][ $index ]['subtotal'] = wc_format_decimal( $unit_price * $quantity );
            $params['line_items'][ $index ]['total'] = wc_format_decimal( $unit_price * $quantity );
            unset(
                $params['line_items'][ $index ]['subtotal_tax'],
                $params['line_items'][ $index ]['total_tax']
            );
            $changed = true;

            // Preserve the sanitized design for the later order-item hook.
            $params['line_items'][ $index ]['meta_data'] = self::merge_headless_design_meta(
                $line['meta_data'] ?? [],
                $clean
            );
        }

        if ( ! $changed ) return $result;

        $request->set_body( wp_json_encode( $params ) );
        $request->set_body_params( $params );
        $request->set_param( 'line_items', $params['line_items'] );
        return $result;
    }

    private static function extract_headless_line_design( $line ) {
        $meta = $line['meta_data'] ?? [];
        if ( ! is_array( $meta ) ) return null;

        foreach ( $meta as $entry ) {
            if ( ! is_array( $entry ) ) continue;
            $key = sanitize_key( (string) ( $entry['key'] ?? '' ) );
            if ( ! in_array( $key, [ 'neon_stack', 'neonstack', 'neon_stack_design', '_neon_stack_design' ], true ) ) continue;

            $value = $entry['value'] ?? null;
            if ( is_array( $value ) ) return $value;
            if ( is_string( $value ) ) {
                $decoded = self::decode_json( $value );
                if ( is_array( $decoded ) ) return $decoded;
            }
        }

        return null;
    }

    private static function merge_headless_design_meta( $meta, $clean ) {
        $out = [];
        $found = false;
        foreach ( array_slice( (array) $meta, 0, self::MAX_HEADLESS_META_ENTRIES ) as $entry ) {
            if ( ! is_array( $entry ) ) continue;
            $key = sanitize_text_field( (string) ( $entry['key'] ?? '' ) );
            if ( in_array( sanitize_key( $key ), [ 'neon_stack', 'neonstack', 'neon_stack_design', '_neon_stack_design' ], true ) ) {
                if ( ! $found ) {
                    $out[] = [
                        'key' => 'neon_stack',
                        'value' => wp_json_encode( $clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ),
                    ];
                    $found = true;
                }
                continue;
            }
            $out[] = [
                'key' => $key,
                'value' => isset( $entry['value'] ) && is_scalar( $entry['value'] )
                    ? sanitize_text_field( (string) $entry['value'] )
                    : '',
            ];
        }
        if ( ! $found ) {
            $out[] = [
                'key' => 'neon_stack',
                'value' => wp_json_encode( $clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ),
            ];
        }
        return array_values( $out );
    }

    /**
     * REST-created WooCommerce orders do not use the normal checkout line-item
     * hook. Process the sanitized Neon metadata here so the screenshot is
     * promoted exactly once when the order item actually exists.
     */
    public static function process_headless_order_item( $item_id, $item, $order_id ) {
        if ( ! $item instanceof WC_Order_Item_Product ) return;

        $raw = $item->get_meta( 'neon_stack', true );
        if ( ! $raw ) $raw = $item->get_meta( self::META_KEY, true );
        $design = self::sanitize_design( $raw );
        if ( empty( $design ) ) return;

        $type = sanitize_key( $design['configurator'] ?? '' );
        $config = self::config();
        $expected_id = self::authoritative_product_id( $type );
        $actual_id = absint( $item->get_product_id() );
        if ( ! $expected_id || $actual_id !== $expected_id ) return;

        $error = self::validate_design_for_product( $design, $actual_id, 0 );
        if ( is_wp_error( $error ) ) return;

        $cfg = $config['configurators'][ $type ] ?? [];
        $groups = $config['options'][ $type ] ?? [];
        $product = wc_get_product( $actual_id );
        self::save_structured_order_snapshot( $item, $design, $product );
        $breakdown = self::server_price_breakdown( $design, $product, $cfg, $groups );
        if ( $breakdown ) {
            $item->update_meta_data(
                '_neon_stack_price_snapshot',
                wp_json_encode( $breakdown, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES )
            );
        }

        $token = ! empty( $design['screenshot_token'] ) ? sanitize_key( $design['screenshot_token'] ) : '';
        if ( ! $token ) {
            $item->update_meta_data( self::META_KEY, wp_json_encode( $design, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
            $item->delete_meta_data( 'neon_stack' );
            $item->save();
            return;
        }

        $attachment_id = self::promote_temp_screenshot( $token, wc_get_order( $order_id ) );
        if ( ! $attachment_id ) {
            $item->update_meta_data( '_neon_stack_pending_screenshot_token', $token );
            $item->update_meta_data( '_neon_stack_screenshot_status', 'pending_retry' );
            $item->save();
            return;
        }

        $item->add_meta_data( self::SCREENSHOT_META_KEY, (string) $attachment_id, true );
        $item->add_meta_data( self::SCREENSHOT_URL_META_KEY, '', true );
        $item->update_meta_data( self::META_KEY, wp_json_encode( $design, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) );
        $item->delete_meta_data( 'neon_stack' );
        $item->save();
    }


    /**
     * Retry screenshot promotion after the complete REST order exists.
     *
     * Some headless WooCommerce order flows create/save the order item before
     * all line-item metadata is fully committed. A second pass prevents a
     * valid screenshot token from being lost because of hook timing.
     */
    public static function retry_pending_screenshots_for_order( $order_id, $order = null ) {
        $order = $order instanceof WC_Order ? $order : wc_get_order( $order_id );
        if ( ! $order instanceof WC_Order ) return;

        foreach ( $order->get_items( 'line_item' ) as $item ) {
            if ( ! $item instanceof WC_Order_Item_Product ) continue;

            $attachment_id = absint( $item->get_meta( self::SCREENSHOT_META_KEY, true ) );
            if ( $attachment_id ) continue;

            $pending = sanitize_key( (string) $item->get_meta( '_neon_stack_pending_screenshot_token', true ) );

            // If the token was not retained as pending, recover it from the
            // stored sanitized design snapshot. This supports both normal
            // checkout and headless REST-created orders.
            if ( ! $pending ) {
                $raw = $item->get_meta( self::META_KEY, true );
                $design = self::sanitize_design( $raw );
                $pending = ! empty( $design['screenshot_token'] )
                    ? sanitize_key( $design['screenshot_token'] )
                    : '';
            }

            if ( ! $pending ) continue;

            $configurator = sanitize_key( (string) $item->get_meta( '_neon_stack_configurator', true ) );
            if ( ! $configurator ) {
                $raw = $item->get_meta( self::META_KEY, true );
                $design = self::sanitize_design( $raw );
                $configurator = sanitize_key( (string) ( $design['configurator'] ?? '' ) );
            }

            $expected_id = self::authoritative_product_id( $configurator );
            if ( ! $expected_id || absint( $item->get_product_id() ) !== $expected_id ) continue;

            if ( ! self::temp_screenshot_exists( $pending ) ) {
                // Keep a clear diagnostic marker, but do not repeatedly attempt
                // an expired/invalid token.
                $item->delete_meta_data( '_neon_stack_pending_screenshot_token' );
                $item->add_meta_data( '_neon_stack_screenshot_status', 'expired_or_invalid', true );
                $item->save();
                continue;
            }

            $attachment_id = self::promote_temp_screenshot( $pending, $order );
            if ( ! $attachment_id ) {
                // Leave the token for a later retry while it is still within TTL.
                $item->update_meta_data( '_neon_stack_pending_screenshot_token', $pending );
                $item->update_meta_data( '_neon_stack_screenshot_status', 'pending_retry' );
                $item->save();
                continue;
            }

            $item->add_meta_data( self::SCREENSHOT_META_KEY, (string) $attachment_id, true );
            $item->delete_meta_data( '_neon_stack_pending_screenshot_token' );
            $item->delete_meta_data( '_neon_stack_screenshot_status' );
            $item->save();
        }
    }

    private static function default_config() {
        return [
            'version' => 2,
            'settings' => [
                'currency_label' => '₹',
                'cors_origins' => '',
                'screenshot_ttl_hours' => 6,
            ],
            'configurators' => [
                'custom_neon' => [
                    'name' => 'Custom Neon',
                    'enabled' => true,
                    'product_id' => 0,
                    'product_sku' => 'NEON-STACK-CUSTOM',
                    'description' => 'Customer-designed text neon sign.',
                ],
                'mojo_mix' => [
                    'name' => 'Mojo Mix',
                    'enabled' => true,
                    'product_id' => 0,
                    'product_sku' => 'NEON-STACK-MOJO',
                    'description' => 'Colourful / pre-defined neon mix configurator.',
                ],
            ],
            'languages' => [
                [ 'id'=>'english', 'name'=>'English', 'enabled'=>true, 'typing_engine'=>'latin' ],
                [ 'id'=>'marathi', 'name'=>'Marathi', 'enabled'=>true, 'typing_engine'=>'phonetic' ],
            ],
            'fonts' => [],
            'options' => [
                'custom_neon' => [
                    'sizes' => [
                        [ 'id'=>'small', 'name'=>'Small (10" Height)', 'description'=>'39.50 × 10.00"', 'price'=>5600, 'enabled'=>true ],
                        [ 'id'=>'medium', 'name'=>'Medium (13" Height)', 'description'=>'51.50 × 13.00"', 'price'=>9100, 'enabled'=>true ],
                        [ 'id'=>'large', 'name'=>'Large (15" Height)', 'description'=>'63.50 × 15.00"', 'price'=>11400, 'enabled'=>true ],
                        [ 'id'=>'extra_large', 'name'=>'Extra Large (17" Height)', 'description'=>'87.50 × 17.00"', 'price'=>14800, 'enabled'=>true ],
                    ],
                    'colors' => [
                        [ 'id'=>'cool_white', 'name'=>'Cool White', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#EAF4FF' ],
                        [ 'id'=>'pure_white', 'name'=>'Pure White', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#FFFDF4' ],
                        [ 'id'=>'warm_white', 'name'=>'Warm White', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#F7D77A' ],
                        [ 'id'=>'blue', 'name'=>'Blue', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#2938FF' ],
                        [ 'id'=>'green', 'name'=>'Green', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#86EA4E' ],
                        [ 'id'=>'yellow', 'name'=>'Yellow', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#E88900' ],
                        [ 'id'=>'purple', 'name'=>'Purple', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#8B16F6' ],
                        [ 'id'=>'light_purple', 'name'=>'Light Purple', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#BD65EE' ],
                        [ 'id'=>'orange', 'name'=>'Orange', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#E04314' ],
                        [ 'id'=>'lemon_yellow', 'name'=>'Lemon Yellow', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#FFF01A' ],
                        [ 'id'=>'hot_pink', 'name'=>'Hot Pink', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#D936A6' ],
                        [ 'id'=>'girl_pink', 'name'=>'Girl Pink', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#C95BE9' ],
                        [ 'id'=>'deep_pink', 'name'=>'Deep Pink', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#D525F2' ],
                        [ 'id'=>'ice_blue', 'name'=>'Ice Blue', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#5D91E0' ],
                        [ 'id'=>'red', 'name'=>'Red', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#E11B0C' ],
                        [ 'id'=>'turquoise', 'name'=>'Turquoise', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#8EDFEA' ],
                        [ 'id'=>'tropical_green', 'name'=>'Tropical Green', 'description'=>'', 'price'=>0, 'enabled'=>true, 'hex'=>'#78C4A8' ],
                    ],
                    'shapes' => [
                        [ 'id'=>'heart', 'name'=>'Heart', 'description'=>'', 'price'=>300, 'enabled'=>true ],
                        [ 'id'=>'star', 'name'=>'Star', 'description'=>'', 'price'=>300, 'enabled'=>true ],
                        [ 'id'=>'lightning', 'name'=>'Lightning', 'description'=>'', 'price'=>300, 'enabled'=>true ],
                        [ 'id'=>'crown', 'name'=>'Crown', 'description'=>'', 'price'=>300, 'enabled'=>true ],
                        [ 'id'=>'moon', 'name'=>'Moon', 'description'=>'', 'price'=>300, 'enabled'=>true ],
                    ],
                    'backboards' => [
                        [ 'id'=>'cut_to_shape', 'name'=>'Cut to Shape', 'description'=>'Acrylic closely follows the letter contours (Most Popular)', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'whole_board', 'name'=>'Whole Board / Square', 'description'=>'Full rectangular or square clear acrylic backing', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'no_backing', 'name'=>'No Backing / Minimal', 'description'=>'Minimalist backing for ultra-clean look', 'price'=>1000, 'enabled'=>true ],
                    ],
                    'hardware' => [
                        [ 'id'=>'wall_screws', 'name'=>'Wall Screws & Drill Holes', 'description'=>'Pre-drilled holes with stainless steel spacers included', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'hanging_wire', 'name'=>'Hanging Wire Kit', 'description'=>'Stainless steel wire loop kit for window or ceiling hanging', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'standard_dimmer', 'name'=>'Standard Brightness Dimmer', 'description'=>'Manual inline dimmer button to adjust 10–100% brightness', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'smart_wifi', 'name'=>'Smart WiFi & Wireless Remote', 'description'=>'Remote control, party flash modes, timer & Alexa/Google Assistant', 'price'=>2000, 'enabled'=>true ],
                        [ 'id'=>'indoor', 'name'=>'Standard Indoor LED', 'description'=>'Perfect for bedroom, living room, office & indoor events', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'ip67', 'name'=>'IP67 Waterproof Outdoor', 'description'=>'Sealed weatherproof silicone housing for rain, snow & direct sun', 'price'=>3000, 'enabled'=>true ],
                    ],
                    'glow_styles' => [
                        [ 'id'=>'steady', 'name'=>'Steady', 'description'=>'Constant glow', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'pulse', 'name'=>'Pulse', 'description'=>'Soft pulsing effect', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'flash', 'name'=>'Flash', 'description'=>'Flashing effect', 'price'=>0, 'enabled'=>true ],
                        [ 'id'=>'chase', 'name'=>'Chase', 'description'=>'Chasing effect', 'price'=>0, 'enabled'=>true ],
                    ],
                ],
                'mojo_mix' => [
                    'sizes'=>[], 'colors'=>[], 'shapes'=>[], 'backboards'=>[], 'hardware'=>[], 'effects'=>[],
                ],
            ],
        ];
    }

    private static function config() {
        $stored = get_option( self::CONFIG_OPTION, [] );
        if ( ! is_array( $stored ) ) $stored = [];
        $defaults = self::default_config();
        $config = array_replace_recursive( $defaults, $stored );
        $config = self::ensure_mojo_mix_config( $config, $stored );
        $config['version'] = 2;
        if ( ! isset( $config['settings']['cors_origins'] ) ) $config['settings']['cors_origins'] = '';
        return $config;
    }

    /**
     * Give Mojo Mix its own editable option library on first upgrade.
     *
     * Mojo intentionally has no admin-managed text-colour/effect groups.
     * Backboards, hardware and shapes start as an independent copy of Custom
     * Neon so changing one configurator later never changes the other.
     */
    private static function ensure_mojo_mix_config( $config, $stored ) {
        if ( ! empty( $stored['mojo_mix_initialized'] ) ) {
            return $config;
        }

        if ( empty( $config['options']['mojo_mix'] ) || ! is_array( $config['options']['mojo_mix'] ) ) {
            $config['options']['mojo_mix'] = [];
        }

        $custom = $config['options']['custom_neon'] ?? [];
        $mojo = $config['options']['mojo_mix'];

        // Mojo Mix pricing shown in the customer reference:
        // 3.50 × 10, 4.50 × 13, 5.50 × 15, 7.50 × 17.
        $mojo['sizes'] = [
            [ 'id'=>'small', 'name'=>'Small (10" Height)', 'description'=>'3.50" × 10.00"', 'price'=>5400, 'enabled'=>true ],
            [ 'id'=>'medium', 'name'=>'Medium (13" Height)', 'description'=>'4.50" × 13.00"', 'price'=>6700, 'enabled'=>true ],
            [ 'id'=>'large', 'name'=>'Large (15" Height)', 'description'=>'5.50" × 15.00"', 'price'=>8000, 'enabled'=>true ],
            [ 'id'=>'extra_large', 'name'=>'Extra Large (17" Height)', 'description'=>'7.50" × 17.00"', 'price'=>9300, 'enabled'=>true ],
        ];

        foreach ( [ 'backboards', 'hardware', 'shapes' ] as $group ) {
            $mojo[ $group ] = [];
            foreach ( (array) ( $custom[ $group ] ?? [] ) as $item ) {
                if ( is_array( $item ) ) {
                    // Copy the values, not the reference: the two configurators
                    // remain completely independent after initialization.
                    $mojo[ $group ][] = $item;
                }
            }
        }

        // Deliberately do not create colors/glow/effects admin groups for Mojo.
        unset( $mojo['colors'], $mojo['effects'], $mojo['glow_styles'] );

        $config['options']['mojo_mix'] = $mojo;
        $config['mojo_mix_initialized'] = true;
        update_option( self::CONFIG_OPTION, $config, false );

        return $config;
    }

    private static function save_config( $config ) {
        $config['version'] = 2;
        update_option( self::CONFIG_OPTION, $config, false );
    }

    private static function groups_for( $type ) {
        $config = self::config();
        return isset( $config['options'][ $type ] ) && is_array( $config['options'][ $type ] ) ? $config['options'][ $type ] : [];
    }

    public static function validate_add_to_cart_request( $passed, $product_id, $quantity, $variation_id = 0, $variation = [], $cart_item_data = [] ) {
        if ( ! $passed ) return $passed;

        $payload = self::extract_cart_payload( $cart_item_data );
        if ( null === $payload ) return $passed;

        $clean = self::sanitize_design( $payload );
        if ( empty( $clean ) ) {
            wc_add_notice( __( 'We could not read the neon configuration. Please refresh and try again.', 'neon-stack-configurator' ), 'error' );
            return false;
        }

        $error = self::validate_design_for_product( $clean, (int) $product_id, (int) $variation_id );
        if ( is_wp_error( $error ) ) {
            wc_add_notice( $error->get_error_message(), 'error' );
            return false;
        }

        $max_shape_total = self::max_shape_quantity( $clean['shapes'] ?? [] );
        if ( $max_shape_total > 100 ) {
            wc_add_notice( __( 'Too many neon shapes were selected. Please reduce the shape quantity.', 'neon-stack-configurator' ), 'error' );
            return false;
        }

        return $passed;
    }

    public static function capture_cart_data( $cart_item_data, $product_id, $variation_id, $quantity ) {
        $payload = self::extract_cart_payload( $cart_item_data );
        if ( null === $payload ) return $cart_item_data;

        $clean = self::sanitize_design( $payload );
        if ( empty( $clean ) ) return $cart_item_data;

        $error = self::validate_design_for_product( $clean, (int) $product_id, (int) $variation_id );
        if ( is_wp_error( $error ) ) return $cart_item_data;

        $type = sanitize_key( $clean['configurator'] ?? 'custom_neon' );
        $clean['configurator'] = $type;
        // Never trust a product_id supplied by React. This is the actual WooCommerce
        // product selected by the server-side add-to-cart request.
        $clean['product_id'] = absint( $product_id );
        $clean['schema_version'] = 2;

        if ( ! empty( $clean['screenshot_token'] ) ) {
            $token = strtolower( (string) $clean['screenshot_token'] );
            if ( ! self::temp_screenshot_exists( $token ) ) {
                wc_add_notice( __( 'The neon preview has expired. Please add it to the cart again.', 'neon-stack-configurator' ), 'error' );
                return $cart_item_data;
            }
            $clean['screenshot_token'] = $token;
        } elseif ( ! empty( $clean['screenshot'] ) ) {
            // Backward compatibility for older React clients. New clients should
            // upload first and send only screenshot_token in the cart payload.
            if ( ! self::allow_screenshot_capture() ) {
                wc_add_notice( __( 'Too many preview uploads were attempted. Please wait a little and try again.', 'neon-stack-configurator' ), 'error' );
                return $cart_item_data;
            }
            $token = self::store_temp_screenshot( $clean['screenshot'] );
            unset( $clean['screenshot'] );
            if ( $token ) $clean['screenshot_token'] = $token;
        }

        $cart_item_data[ self::CART_KEY ] = $clean;
        $cart_item_data['neon_stack_unique'] = wp_generate_uuid4();
        return $cart_item_data;
    }

    private static function extract_cart_payload( $cart_item_data ) {
        if ( ! is_array( $cart_item_data ) ) return null;
        if ( isset( $cart_item_data['neon_stack'] ) ) return $cart_item_data['neon_stack'];
        if ( isset( $cart_item_data['neonStack'] ) ) return $cart_item_data['neonStack'];
        if ( isset( $cart_item_data['extraData'] ) ) {
            $extra = self::decode_json( $cart_item_data['extraData'] );
            if ( is_array( $extra ) && isset( $extra['neon_stack'] ) ) return $extra['neon_stack'];
        }
        return null;
    }

public static function restore_cart_data( $cart_item, $values ) {
        foreach ( [ self::CART_KEY, 'neon_stack_unique' ] as $key ) {
            if ( isset( $values[ $key ] ) ) $cart_item[ $key ] = $values[ $key ];
        }
        return $cart_item;
    }

    public static function cart_display_data( $item_data, $cart_item ) {
        if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) return $item_data;
        $d = $cart_item[ self::CART_KEY ];
        $map = [
            'configurator'=>'Configurator', 'text'=>'Neon Text', 'font'=>'Font', 'language'=>'Language',
            'size'=>'Size', 'textColor'=>'Text Color', 'colorMode'=>'Color Mode', 'glowStyle'=>'Glow Style',
            'alignment'=>'Alignment',
        ];
        foreach ( $map as $key=>$label ) {
            if ( isset( $d[$key] ) && is_scalar( $d[$key] ) && '' !== (string)$d[$key] ) {
                $item_data[] = [ 'key'=>esc_html( $label ), 'value'=>esc_html( (string)$d[$key] ) ];
            }
        }
        foreach ( [ 'colors'=>'Colors', 'shapes'=>'Shapes', 'letterColors'=>'Letter Colors', 'effects'=>'Effects' ] as $key=>$label ) {
            if ( isset( $d[$key] ) ) {
                $value = self::summarize_array( $d[$key] );
                if ( $value ) $item_data[] = [ 'key'=>$label, 'value'=>esc_html($value) ];
            }
        }
        if ( isset($d['backboard']) ) $item_data[] = [ 'key'=>'Backboard', 'value'=>esc_html(self::summarize_value($d['backboard'])) ];
        if ( isset($d['hardware']) ) $item_data[] = [ 'key'=>'Hardware', 'value'=>esc_html(self::summarize_value($d['hardware'])) ];
        return $item_data;
    }

    public static function validate_and_price_cart( $cart ) {
        if ( ! $cart || ! is_object( $cart ) || ( is_admin() && ! wp_doing_ajax() ) ) return;
        static $running = false;
        if ( $running ) return;
        $running = true;

        $config = self::config();
        foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
            if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) continue;

            $d = self::sanitize_design( $cart_item[ self::CART_KEY ] );
            $product_id = absint( $cart_item['product_id'] ?? 0 );
            $variation_id = absint( $cart_item['variation_id'] ?? 0 );
            $error = self::validate_design_for_product( $d, $product_id, $variation_id );

            $product = $cart_item['data'] ?? null;
            if ( ! $product || ! is_a( $product, 'WC_Product' ) ) {
                $error = new WP_Error( 'neon_invalid_product', __( 'The configured WooCommerce product is no longer available.', 'neon-stack-configurator' ) );
            }

            if ( is_wp_error( $error ) ) {
                // Never fall back to a potentially incorrect configured price.
                // The checkout validation hook will block purchase as well.
                if ( $product && is_a( $product, 'WC_Product' ) ) {
                    $product->set_price( (float) $product->get_regular_price() );
                }
                if ( function_exists( 'wc_add_notice' ) ) {
                    $message = $error->get_error_message();
                    if ( ! function_exists( 'wc_has_notice' ) || ! wc_has_notice( $message, 'error' ) ) {
                        wc_add_notice( $message, 'error' );
                    }
                }
                continue;
            }

            $type = sanitize_key( $d['configurator'] );
            $type_config = $config['configurators'][ $type ];
            $groups = $config['options'][ $type ];
            $mode = $type_config['price_mode'] ?? 'product_plus_options';

            // The base price comes only from WooCommerce or the server-side size
            // option. No client-provided price is ever used.
            $base = (float) $product->get_regular_price();
            if ( 'size_base' === $mode ) {
                $size_id = sanitize_key( (string) ( $d['size'] ?? '' ) );
                $size_price = self::lookup_option_price( $groups['sizes'] ?? [], $size_id );
                if ( null === $size_price ) {
                    $product->set_price( (float) $product->get_regular_price() );
                    continue;
                }
                $base = (float) $size_price;
            }

            $surcharge = self::calculate_option_surcharge( $d, $groups );
            $product->set_price( max( 0, $base + $surcharge ) );
        }
        $running = false;
    }

    public static function validate_cart_items_for_checkout() {
        if ( ! function_exists( 'WC' ) || ! WC()->cart ) return;
        $config = self::config();

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            if ( empty( $cart_item[ self::CART_KEY ] ) || ! is_array( $cart_item[ self::CART_KEY ] ) ) continue;

            $d = self::sanitize_design( $cart_item[ self::CART_KEY ] );
            $error = self::validate_design_for_product(
                $d,
                absint( $cart_item['product_id'] ?? 0 ),
                absint( $cart_item['variation_id'] ?? 0 )
            );

            if ( is_wp_error( $error ) ) {
                $message = $error->get_error_message();
                if ( ! function_exists( 'wc_has_notice' ) || ! wc_has_notice( $message, 'error' ) ) {
                    wc_add_notice( $message, 'error' );
                }
            }
        }
    }

private static function validate_design_for_product( $design, $product_id, $variation_id = 0 ) {
        if ( ! is_array( $design ) ) {
            return new WP_Error( 'neon_invalid_design', __( 'Invalid neon configuration.', 'neon-stack-configurator' ) );
        }

        $type = sanitize_key( $design['configurator'] ?? '' );
        $config = self::config();

        if ( '' === $type || empty( $config['configurators'][ $type ] ) || empty( $config['options'][ $type ] ) ) {
            return new WP_Error( 'neon_invalid_configurator', __( 'This neon configurator is not available.', 'neon-stack-configurator' ) );
        }

        $cfg = $config['configurators'][ $type ];
        if ( empty( $cfg['enabled'] ) ) {
            return new WP_Error( 'neon_disabled_configurator', __( 'This neon configurator is currently unavailable.', 'neon-stack-configurator' ) );
        }

        $expected_product_id = self::authoritative_product_id( $type );
        if ( ! $expected_product_id ) {
            return new WP_Error( 'neon_unmapped_configurator', __( 'This configurator has not been connected to a WooCommerce product yet.', 'neon-stack-configurator' ) );
        }

        // A configured ID may be either the simple/parent product or the exact
        // variation. Never trust the product_id embedded in the browser payload.
        $matches_product = ( $expected_product_id === absint( $product_id ) );
        $matches_variation = ( $variation_id > 0 && $expected_product_id === absint( $variation_id ) );
        if ( ! $matches_product && ! $matches_variation ) {
            return new WP_Error( 'neon_product_mismatch', __( 'The selected neon configurator does not match this WooCommerce product.', 'neon-stack-configurator' ) );
        }

        $product = wc_get_product( $variation_id ? $variation_id : $product_id );
        if ( ! $product instanceof WC_Product ) {
            return new WP_Error( 'neon_invalid_product', __( 'The selected WooCommerce product is invalid.', 'neon-stack-configurator' ) );
        }

        $groups = $config['options'][ $type ];

        // If size is the base price, a valid enabled size is mandatory.
        if ( 'size_base' === ( $cfg['price_mode'] ?? 'product_plus_options' ) && ! empty( $groups['sizes'] ) ) {
            $size_id = sanitize_key( (string) ( $design['size'] ?? '' ) );
            if ( '' === $size_id || null === self::find_enabled_option( $groups['sizes'], $size_id ) ) {
                return new WP_Error( 'neon_invalid_size', __( 'Please select a valid size for this neon sign.', 'neon-stack-configurator' ) );
            }
        } elseif ( isset( $design['size'] ) && '' !== (string) $design['size'] ) {
            $size_id = sanitize_key( (string) $design['size'] );
            if ( ! empty( $groups['sizes'] ) && null === self::find_enabled_option( $groups['sizes'], $size_id ) ) {
                return new WP_Error( 'neon_invalid_size', __( 'The selected size is no longer available.', 'neon-stack-configurator' ) );
            }
        }

        $selection_map = [
            'colors'    => 'colors',
            'backboard' => 'backboards',
            'hardware'  => 'hardware',
            'glowStyle' => 'glow_styles',
            'effects'   => 'effects',
        ];

        foreach ( $selection_map as $payload_key => $group_key ) {
            if ( ! array_key_exists( $payload_key, $design ) || empty( $groups[ $group_key ] ) ) continue;
            $ids = self::extract_selection_ids( $design[ $payload_key ] );
            foreach ( $ids as $id ) {
                if ( null === self::find_enabled_option( $groups[ $group_key ], $id ) ) {
                    return new WP_Error(
                        'neon_invalid_option',
                        sprintf(
                            /* translators: %s: option identifier */
                            __( 'The selected neon option "%s" is unavailable. Please refresh and try again.', 'neon-stack-configurator' ),
                            esc_html( $id )
                        )
                    );
                }
            }
        }

        if ( isset( $design['shapes'] ) && ! empty( $groups['shapes'] ) ) {
            if ( ! is_array( $design['shapes'] ) ) {
                return new WP_Error( 'neon_invalid_shapes', __( 'Invalid neon shape selection.', 'neon-stack-configurator' ) );
            }
            $shape_count = 0;
            foreach ( $design['shapes'] as $shape ) {
                if ( ! is_array( $shape ) ) {
                    // Also allow a simple ["heart","star"] representation.
                    $id = sanitize_key( (string) $shape );
                    if ( '' === $id || null === self::find_enabled_option( $groups['shapes'], $id ) ) {
                        return new WP_Error( 'neon_invalid_shape', __( 'One of the selected neon shapes is unavailable.', 'neon-stack-configurator' ) );
                    }
                    $shape_count++;
                    continue;
                }
                $id = sanitize_key( (string) ( $shape['id'] ?? '' ) );
                $qty_raw = $shape['quantity'] ?? 1;
                if ( '' === $id || ! preg_match( '/^\d+$/', (string) $qty_raw ) ) {
                    return new WP_Error( 'neon_invalid_shape', __( 'One of the selected neon shapes is invalid.', 'neon-stack-configurator' ) );
                }
                $qty = absint( $qty_raw );
                if ( $qty < 1 || $qty > 50 ) {
                    return new WP_Error( 'neon_shape_quantity', __( 'A neon shape quantity must be between 1 and 50.', 'neon-stack-configurator' ) );
                }
                if ( null === self::find_enabled_option( $groups['shapes'], $id ) ) {
                    return new WP_Error( 'neon_invalid_shape', __( 'One of the selected neon shapes is unavailable.', 'neon-stack-configurator' ) );
                }
                $shape_count += $qty;
            }
            if ( $shape_count > 100 ) {
                return new WP_Error( 'neon_shape_quantity_total', __( 'Too many neon shapes were selected.', 'neon-stack-configurator' ) );
            }
        }

        if ( isset( $design['language'] ) && '' !== (string) $design['language'] ) {
            $language_id = sanitize_key( (string) $design['language'] );
            if ( null === self::find_enabled_option( $config['languages'], $language_id ) ) {
                return new WP_Error( 'neon_invalid_language', __( 'The selected language is no longer available.', 'neon-stack-configurator' ) );
            }
        }

        if ( isset( $design['screenshot_token'] ) && '' !== (string) $design['screenshot_token'] ) {
            $token = strtolower( (string) $design['screenshot_token'] );
            if ( ! self::temp_screenshot_exists( $token ) ) {
                return new WP_Error( 'neon_expired_screenshot', __( 'The neon preview has expired. Please return to the configurator and add the design to the cart again.', 'neon-stack-configurator' ) );
            }
        }

        if ( isset( $design['fontId'] ) && '' !== (string) $design['fontId'] ) {
            $font_id = sanitize_key( (string) $design['fontId'] );
            $font_ok = false;
            foreach ( (array) $config['fonts'] as $font ) {
                if ( is_array( $font ) && sanitize_key( (string) ( $font['id'] ?? '' ) ) === $font_id && ! empty( $font['enabled'] ) ) {
                    $font_ok = true;
                    break;
                }
            }
            if ( ! $font_ok ) {
                return new WP_Error( 'neon_invalid_font', __( 'The selected font is no longer available.', 'neon-stack-configurator' ) );
            }
        }

        return true;
    }

    private static function find_enabled_option( $items, $id ) {
        $id = sanitize_key( (string) $id );
        if ( '' === $id ) return null;
        foreach ( (array) $items as $item ) {
            if ( ! is_array( $item ) ) continue;
            if ( sanitize_key( (string) ( $item['id'] ?? '' ) ) !== $id ) continue;
            if ( array_key_exists( 'enabled', $item ) && empty( $item['enabled'] ) ) return null;
            return $item;
        }
        return null;
    }

    private static function extract_selection_ids( $selected ) {
        $ids = [];
        if ( is_scalar( $selected ) ) {
            $id = sanitize_key( (string) $selected );
            if ( '' !== $id ) $ids[] = $id;
            return array_values( array_unique( $ids ) );
        }
        if ( ! is_array( $selected ) ) return [];

        if ( isset( $selected['id'] ) && is_scalar( $selected['id'] ) ) {
            $id = sanitize_key( (string) $selected['id'] );
            if ( '' !== $id ) $ids[] = $id;
            return array_values( array_unique( $ids ) );
        }

        foreach ( $selected as $key => $value ) {
            if ( in_array( (string) $key, [ 'quantity', 'price', 'name', 'description', 'enabled', 'hex', 'icon', 'value' ], true ) ) continue;
            if ( is_array( $value ) ) {
                foreach ( self::extract_selection_ids( $value ) as $id ) $ids[] = $id;
            } elseif ( is_scalar( $value ) ) {
                $id = sanitize_key( (string) $value );
                if ( '' !== $id ) $ids[] = $id;
            }
        }
        return array_values( array_unique( $ids ) );
    }

    private static function max_shape_quantity( $shapes ) {
        if ( ! is_array( $shapes ) ) return 0;
        $total = 0;
        foreach ( $shapes as $shape ) {
            if ( is_array( $shape ) ) $total += absint( $shape['quantity'] ?? 0 );
            else $total++;
        }
        return $total;
    }

private static function calculate_option_surcharge( $design, $groups ) {
        $total = 0.0;

        foreach ( [ 'colors'=>'colors', 'backboard'=>'backboards', 'hardware'=>'hardware', 'glowStyle'=>'glow_styles', 'effects'=>'effects' ] as $payload_key => $group_key ) {
            if ( ! array_key_exists( $payload_key, $design ) || empty( $groups[ $group_key ] ) ) continue;
            foreach ( self::extract_selection_ids( $design[ $payload_key ] ) as $id ) {
                $price = self::lookup_option_price( $groups[ $group_key ], $id );
                if ( null !== $price ) $total += (float) $price;
            }
        }

        if ( isset( $design['shapes'] ) && is_array( $design['shapes'] ) && isset( $groups['shapes'] ) ) {
            foreach ( $design['shapes'] as $shape ) {
                if ( is_array( $shape ) ) {
                    $id = sanitize_key( (string) ( $shape['id'] ?? '' ) );
                    $qty = absint( $shape['quantity'] ?? 0 );
                } else {
                    $id = sanitize_key( (string) $shape );
                    $qty = 1;
                }
                if ( ! $id || $qty < 1 ) continue;
                $price = self::lookup_option_price( $groups['shapes'], $id );
                if ( null !== $price ) $total += (float) $price * $qty;
            }
        }

        return $total;
    }

    private static function lookup_option_price( $items, $id ) {
        $item = self::find_enabled_option( $items, $id );
        if ( null === $item ) return null;
        return isset( $item['price'] ) ? max( 0, (float) $item['price'] ) : 0.0;
    }


    /**
     * Store a human-readable, server-sanitized order snapshot for production/admin use.
     * The raw design JSON remains available as the authoritative snapshot, while these
     * separate fields make the important choices visible in WooCommerce order admin.
     */
    private static function save_structured_order_snapshot( $item, $design, $product = null ) {
        if ( ! $item instanceof WC_Order_Item_Product || ! is_array( $design ) ) return;

        $fields = [
            'configurator' => [ 'label' => 'Configurator', 'key' => 'configurator' ],
            'text'        => [ 'label' => 'Text', 'key' => 'text' ],
            'font'        => [ 'label' => 'Font', 'key' => 'fontId' ],
            'language'    => [ 'label' => 'Language', 'key' => 'language' ],
            'size'        => [ 'label' => 'Size', 'key' => 'size' ],
            'text_color'  => [ 'label' => 'Text colour', 'key' => 'textColor' ],
            'color_mode'  => [ 'label' => 'Colour mode', 'key' => 'colorMode' ],
            'alignment'   => [ 'label' => 'Alignment', 'key' => 'alignment' ],
            'glow_style'  => [ 'label' => 'Glow style', 'key' => 'glowStyle' ],
            'text_mode'   => [ 'label' => 'Text mode', 'key' => 'textMode' ],
        ];

        foreach ( $fields as $meta_key => $field ) {
            $key = $field['key'];

            // Some React builds intentionally omit fields when the customer
            // leaves the UI at its default. For production, omission must not
            // mean "unknown": resolve the effective value from the current
            // server-side configurator configuration where we can do so safely.
            $value = '';
            if ( array_key_exists( $key, $design ) ) {
                $value = ( 'textColor' === $key )
                    ? self::format_color_value( $design[ $key ] )
                    : self::summarize_value( $design[ $key ] );
            }

            // Older/current frontend payloads may use "font" instead of
            // "fontId". Prefer the explicit value, then resolve the font ID/name
            // from the server-side font library.
            if ( 'font' === $meta_key && '' === trim( (string) $value ) ) {
                $font_ref = '';
                if ( isset( $design['font'] ) && is_scalar( $design['font'] ) ) {
                    $font_ref = sanitize_key( (string) $design['font'] );
                } elseif ( isset( $design['fontId'] ) && is_scalar( $design['fontId'] ) ) {
                    $font_ref = sanitize_key( (string) $design['fontId'] );
                }
                if ( '' !== $font_ref ) {
                    $value = self::resolve_font_for_production( $font_ref );
                }
            }

            // If Custom Neon omitted its text colour because the customer kept
            // the frontend default, resolve the first enabled server-side colour.
            // Mojo intentionally has no text-colour selection.
            if ( 'text_color' === $meta_key && '' === trim( (string) $value ) ) {
                $type = sanitize_key( (string) ( $design['configurator'] ?? '' ) );
                if ( 'custom_neon' === $type ) {
                    $value = self::default_color_for_production( $type );
                }
            }

            if ( '' !== trim( (string) $value ) ) {
                $item->update_meta_data(
                    '_neon_stack_' . $meta_key,
                    sanitize_text_field( (string) $value )
                );
            }
        }

        foreach ( [ 'backboard', 'hardware', 'sizeOption' ] as $design_key ) {
            if ( isset( $design[ $design_key ] ) ) {
                $value = self::summarize_value( $design[ $design_key ] );
                if ( '' !== $value ) {
                    $item->update_meta_data(
                        '_neon_stack_' . self::meta_slug( $design_key ),
                        sanitize_text_field( $value )
                    );
                }
            }
        }

        foreach ( [ 'colors', 'letterColors', 'shapeColors', 'effects', 'shapes' ] as $design_key ) {
            if ( isset( $design[ $design_key ] ) && is_array( $design[ $design_key ] ) && ! empty( $design[ $design_key ] ) ) {
                $value = ( 'shapes' === $design_key )
                    ? self::format_shapes_for_production( $design[ $design_key ] )
                    : self::format_collection_for_production( $design[ $design_key ] );

                if ( '' !== trim( (string) $value ) ) {
                    $item->update_meta_data(
                        '_neon_stack_' . self::meta_slug( $design_key ),
                        sanitize_text_field( (string) $value )
                    );
                }
            }
        }

        if ( $product instanceof WC_Product ) {
            $item->update_meta_data( '_neon_stack_product_id', (string) absint( $product->get_id() ) );
            $sku = $product->get_sku();
            if ( '' !== (string) $sku ) {
                $item->update_meta_data( '_neon_stack_product_sku', sanitize_text_field( $sku ) );
            }
        }
    }

    private static function format_color_value( $value ) {
        if ( is_scalar( $value ) ) return (string) $value;
        if ( ! is_array( $value ) ) return '';

        $name = isset( $value['name'] ) && is_scalar( $value['name'] ) ? sanitize_text_field( (string) $value['name'] ) : '';
        $hex  = isset( $value['hex'] ) && is_scalar( $value['hex'] ) ? sanitize_text_field( (string) $value['hex'] ) : '';
        $id   = isset( $value['id'] ) && is_scalar( $value['id'] ) ? sanitize_key( (string) $value['id'] ) : '';

        $parts = [];
        if ( '' !== $name ) $parts[] = $name;
        if ( '' !== $hex ) $parts[] = $hex;
        if ( empty( $parts ) && '' !== $id ) $parts[] = $id;

        return implode( ' ', $parts );
    }

    private static function format_collection_for_production( $value ) {
        if ( ! is_array( $value ) ) return self::summarize_value( $value );

        $parts = [];
        foreach ( $value as $entry ) {
            if ( is_array( $entry ) ) {
                $formatted = self::format_color_value( $entry );
                if ( '' === $formatted ) $formatted = self::summarize_value( $entry );
                if ( '' !== $formatted ) $parts[] = $formatted;
            } elseif ( is_scalar( $entry ) && '' !== trim( (string) $entry ) ) {
                $parts[] = (string) $entry;
            }
        }
        return implode( ', ', array_unique( $parts ) );
    }

    private static function format_shapes_for_production( $shapes ) {
        if ( ! is_array( $shapes ) ) return self::summarize_value( $shapes );

        $parts = [];
        foreach ( $shapes as $shape ) {
            if ( is_array( $shape ) ) {
                $name = isset( $shape['name'] ) && is_scalar( $shape['name'] )
                    ? sanitize_text_field( (string) $shape['name'] )
                    : ( isset( $shape['id'] ) ? sanitize_key( (string) $shape['id'] ) : '' );

                $qty = isset( $shape['quantity'] ) ? absint( $shape['quantity'] ) : 1;
                if ( $qty < 1 ) $qty = 1;

                $colour = '';
                if ( isset( $shape['color'] ) ) {
                    $colour = self::format_color_value( $shape['color'] );
                }
                if ( '' === $colour && isset( $shape['colour'] ) ) {
                    $colour = self::format_color_value( $shape['colour'] );
                }

                // If a shape colour was omitted because the customer kept the
                // frontend default, show the effective server-side default
                // rather than leaving production with an ambiguous shape colour.
                if ( '' === $colour ) {
                    $colour = self::default_color_for_production( 'custom_neon' );
                }

                $label = $name;
                if ( $qty > 1 ) $label .= ' × ' . $qty;
                if ( '' !== $colour ) $label .= ' — ' . $colour;
                if ( '' !== trim( $label ) ) $parts[] = $label;
            } elseif ( is_scalar( $shape ) && '' !== trim( (string) $shape ) ) {
                $parts[] = (string) $shape;
            }
        }
        return implode( ', ', $parts );
    }

    /**
     * Resolve a font reference to its production-friendly configured name.
     * Falls back to the reference itself when the library does not contain it.
     */
    private static function resolve_font_for_production( $font_ref ) {
        $font_ref = sanitize_key( (string) $font_ref );
        if ( '' === $font_ref ) return '';

        foreach ( (array) ( self::config()['fonts'] ?? [] ) as $font ) {
            if ( ! is_array( $font ) || empty( $font['enabled'] ) ) continue;
            $id = sanitize_key( (string) ( $font['id'] ?? '' ) );
            if ( $id !== $font_ref ) continue;

            $name = isset( $font['name'] ) && is_scalar( $font['name'] )
                ? sanitize_text_field( (string) $font['name'] )
                : '';
            return '' !== $name ? $name : $font_ref;
        }

        return $font_ref;
    }

    /**
     * Resolve the effective default colour from the server-side Custom Neon
     * palette. This is only used when the frontend omitted the colour because
     * the customer left it at its default.
     */
    private static function default_color_for_production( $type = 'custom_neon' ) {
        $type = sanitize_key( (string) $type );
        if ( 'mojo_mix' === $type ) return '';

        $colors = self::config()['options'][ $type ]['colors'] ?? [];
        foreach ( (array) $colors as $color ) {
            if ( ! is_array( $color ) || empty( $color['enabled'] ) ) continue;

            $formatted = self::format_color_value( $color );
            if ( '' !== $formatted ) return $formatted;
        }

        return '';
    }

    private static function meta_slug( $key ) {
        $map = [
            'sizeOption'   => 'size_option',
            'letterColors' => 'letter_colors',
            'shapeColors'  => 'shape_colors',
        ];
        return $map[ $key ] ?? sanitize_key( $key );
    }

public static function save_order_item_data( $item, $cart_item_key, $values, $order ) {
        if ( empty( $values[ self::CART_KEY ] ) || ! is_array( $values[ self::CART_KEY ] ) ) return;
        $d = $values[ self::CART_KEY ];
        $screenshot_token = ! empty( $d['screenshot_token'] ) ? sanitize_key( $d['screenshot_token'] ) : '';
        unset( $d['screenshot_token'] );

        $item->add_meta_data( self::META_KEY, wp_json_encode( $d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), true );

        // Store the human-readable server-derived snapshot used by the production team.
        $product = $values['data'] ?? null;
        self::save_structured_order_snapshot( $item, $d, $product );
        if ( $product instanceof WC_Product ) {
            $type = sanitize_key( $d['configurator'] ?? '' );
            $cfg = self::config()['configurators'][$type] ?? [];
            $groups = self::config()['options'][$type] ?? [];
            $breakdown = self::server_price_breakdown( $d, $product, $cfg, $groups );
            if ( $breakdown ) {
                $item->add_meta_data( '_neon_stack_price_snapshot', wp_json_encode( $breakdown, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ), true );
            }
        }

        if ( $screenshot_token ) {
            $attachment_id = self::promote_temp_screenshot( $screenshot_token, $order );
            if ( $attachment_id ) {
                $item->add_meta_data( self::SCREENSHOT_META_KEY, (string)$attachment_id, true );
                // Do not store a publicly usable media URL. Admin access is mediated by
                // the authenticated private-preview endpoint.
                $item->add_meta_data( self::SCREENSHOT_URL_META_KEY, '', true );
            }
        }
    }

    private static function server_price_breakdown( $design, $product, $cfg, $groups ) {
        if ( ! $product instanceof WC_Product || ! is_array( $cfg ) || ! is_array( $groups ) ) return [];
        $base = (float) $product->get_regular_price();
        $mode = $cfg['price_mode'] ?? 'product_plus_options';
        if ( 'size_base' === $mode ) {
            $size_id = sanitize_key( (string) ( $design['size'] ?? '' ) );
            $size_price = self::lookup_option_price( $groups['sizes'] ?? [], $size_id );
            if ( null === $size_price ) return [];
            $base = (float) $size_price;
        }
        $surcharge = self::calculate_option_surcharge( $design, $groups );
        return [
            'schema_version'   => 1,
            'pricing_mode'     => sanitize_key( (string) $mode ),
            'woocommerce_product_id' => absint( $product->get_id() ),
            'base_price'       => round( max( 0, $base ), wc_get_price_decimals() ),
            'option_surcharge' => round( max( 0, $surcharge ), wc_get_price_decimals() ),
            'final_unit_price' => round( max( 0, $base + $surcharge ), wc_get_price_decimals() ),
            'currency'         => sanitize_text_field( get_woocommerce_currency() ),
        ];
    }

    private static function allow_screenshot_capture() {
        $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
        $fingerprint = wp_hash( substr( $ip, 0, 100 ) . '|' . ( function_exists('wp_get_session_token') ? wp_get_session_token() : '' ) );
        $key = 'neon_stack_ss_' . substr( preg_replace('/[^a-z0-9_]/i', '', $fingerprint), 0, 40 );
        $count = absint( get_transient( $key ) );
        if ( $count >= self::SCREENSHOT_RATE_LIMIT ) return false;
        set_transient( $key, $count + 1, self::SCREENSHOT_RATE_WINDOW );
        return true;
    }

    private static function private_preview_dir() {
        $upload = wp_upload_dir();
        return trailingslashit( $upload['basedir'] ) . 'neon-stack-private';
    }

    private static function write_private_directory_rules( $dir ) {
        $htaccess = trailingslashit( $dir ) . '.htaccess';
        if ( ! file_exists( $htaccess ) ) {
            @file_put_contents( $htaccess, "Options -Indexes\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n" );
        }
        $webconfig = trailingslashit( $dir ) . 'web.config';
        if ( ! file_exists( $webconfig ) ) {
            @file_put_contents( $webconfig, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><configuration><system.webServer><security><authorization><remove users=\"*\" roles=\"\" verbs=\"\" /><add accessType=\"Deny\" users=\"*\" /></authorization></security></system.webServer></configuration>" );
        }
        $index = trailingslashit( $dir ) . 'index.php';
        if ( ! file_exists( $index ) ) @file_put_contents( $index, "<?php // Silence is golden.\n" );
    }

    public static function serve_private_preview() {
        if ( ! current_user_can( 'edit_shop_orders' ) && ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( esc_html__( 'You are not allowed to view this preview.', 'neon-stack-configurator' ), 403 );
        }
        $attachment_id = absint( $_GET['attachment_id'] ?? 0 );
        if ( ! $attachment_id || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_GET['_wpnonce'] ?? '' ) ), 'neon_stack_preview_' . $attachment_id ) ) {
            wp_die( esc_html__( 'Invalid preview request.', 'neon-stack-configurator' ), 403 );
        }
        if ( '1' !== (string) get_post_meta( $attachment_id, '_neon_stack_private_preview', true ) ) {
            wp_die( esc_html__( 'Preview not found.', 'neon-stack-configurator' ), 404 );
        }
        $order_id = absint( get_post_meta( $attachment_id, '_neon_stack_order_id', true ) );
        if ( ! $order_id || ! wc_get_order( $order_id ) ) {
            wp_die( esc_html__( 'Preview not found.', 'neon-stack-configurator' ), 404 );
        }
        $path = get_attached_file( $attachment_id );
        $real = $path ? realpath( $path ) : false;
        $private_real = realpath( self::private_preview_dir() );
        if ( ! $real || ! $private_real || 0 !== strpos( wp_normalize_path( $real ), trailingslashit( wp_normalize_path( $private_real ) ) ) || ! is_file( $real ) ) {
            wp_die( esc_html__( 'Preview file is unavailable.', 'neon-stack-configurator' ), 404 );
        }
        $mime = get_post_mime_type( $attachment_id );
        if ( ! in_array( $mime, [ 'image/png', 'image/jpeg' ], true ) ) {
            wp_die( esc_html__( 'Unsupported preview type.', 'neon-stack-configurator' ), 415 );
        }
        nocache_headers();
        header( 'Content-Type: ' . $mime );
        header( 'Content-Length: ' . (string) filesize( $real ) );
        header( 'Content-Disposition: inline; filename="' . basename( $real ) . '"' );
        header( 'X-Content-Type-Options: nosniff' );
        header( 'Content-Security-Policy: default-src \'none\'; img-src \'self\' data:; style-src \'unsafe-inline\';' );
        readfile( $real );
        exit;
    }

    private static function store_temp_screenshot( $data_url ) {
        $binary_info = self::decode_screenshot( $data_url );
        if ( ! $binary_info ) return '';
        $upload = wp_upload_dir();
        if ( ! empty($upload['error']) ) return '';
        $dir = trailingslashit($upload['basedir']) . 'neon-stack-temp';
        if ( ! wp_mkdir_p($dir) ) return '';
        $token = strtolower( bin2hex( random_bytes( 20 ) ) );
        $filename = $token . '.' . $binary_info['ext'];
        $path = trailingslashit($dir) . $filename;
        if ( false === file_put_contents($path, $binary_info['binary'], LOCK_EX) ) return '';
        file_put_contents( trailingslashit($dir) . $token . '.json', wp_json_encode([ 'file'=>$filename, 'mime'=>$binary_info['mime'], 'created'=>time() ]), LOCK_EX );
        self::write_temp_directory_rules( $dir );
        return $token;
    }

    private static function promote_temp_screenshot( $token, $order ) {
        if ( ! preg_match('/^[a-f0-9]{40}$/', $token) ) return 0;
        $upload = wp_upload_dir();
        if ( ! empty($upload['error']) ) return 0;
        $dir = trailingslashit($upload['basedir']) . 'neon-stack-temp';
        $index = trailingslashit($dir) . $token . '.json';
        if ( ! file_exists($index) ) return 0;
        $info = self::decode_json( @file_get_contents($index) );
        if ( ! is_array($info) || empty($info['file']) || empty($info['created']) || (time() - absint($info['created']) > self::temp_ttl()) ) {
            self::delete_temp($token,$info);
            return 0;
        }
        $path = trailingslashit($dir) . basename($info['file']);
        if ( ! file_exists($path) ) { self::delete_temp($token,$info); return 0; }
        $mime = in_array($info['mime'] ?? '', ['image/png','image/jpeg'], true) ? $info['mime'] : 'image/png';
        $ext = 'image/jpeg' === $mime ? 'jpg' : 'png';
        $private_dir = self::private_preview_dir();
        if ( ! wp_mkdir_p( $private_dir ) ) {
            self::delete_temp( $token, $info );
            return 0;
        }
        self::write_private_directory_rules( $private_dir );
        $filename = sanitize_file_name('neon-preview-' . ($order ? $order->get_id() : 0) . '-' . wp_generate_password(8,false) . '.' . $ext);
        $dest = trailingslashit($private_dir) . $filename;
        if ( ! @rename($path,$dest) ) {
            if ( ! @copy($path,$dest) ) { self::delete_temp($token,$info); return 0; }
            @unlink($path);
        }
        $attachment = [
            'post_mime_type'=>$mime,
            'post_title'=>'Neon Preview – Order ' . ($order ? $order->get_id() : ''),
            'post_content'=>'',
            'post_status'=>'private',
        ];
        $attachment_id = wp_insert_attachment($attachment,$dest,$order ? $order->get_id() : 0);
        if ( is_wp_error($attachment_id) || ! $attachment_id ) { @unlink($dest); self::delete_temp($token,$info); return 0; }
        require_once ABSPATH . 'wp-admin/includes/image.php';
        $metadata = wp_generate_attachment_metadata($attachment_id,$dest);
        if ( ! empty($metadata) && ! is_wp_error($metadata) ) wp_update_attachment_metadata($attachment_id,$metadata);
        update_post_meta($attachment_id,'_neon_stack_private_preview','1');
        update_post_meta($attachment_id,'_neon_stack_order_id',$order ? $order->get_id() : 0);
        @unlink($index);
        return (int)$attachment_id;
    }

    private static function temp_ttl() {
        $config = self::config();
        $hours = max(1, min(48, absint($config['settings']['screenshot_ttl_hours'] ?? 6)));
        return $hours * HOUR_IN_SECONDS;
    }

    private static function delete_temp($token,$info=[]) {
        $upload=wp_upload_dir(); $dir=trailingslashit($upload['basedir']).'neon-stack-temp';
        if ( is_array($info) && !empty($info['file']) ) @unlink(trailingslashit($dir).basename($info['file']));
        @unlink(trailingslashit($dir).$token.'.json');
    }

    public static function cleanup_temp_screenshots() {
        $upload=wp_upload_dir(); $dir=trailingslashit($upload['basedir']).'neon-stack-temp';
        if ( ! is_dir($dir) ) return;
        foreach ( glob($dir.'/*.json') ?: [] as $index ) {
            $token=basename($index,'.json'); $info=self::decode_json(@file_get_contents($index));
            if ( !is_array($info) || empty($info['created']) || time()-absint($info['created']) > self::temp_ttl() ) self::delete_temp($token,$info);
        }
    }

    private static function decode_screenshot($data_url) {
        if ( ! is_string($data_url) || strlen($data_url)<50 ) return false;
        if ( ! preg_match('#^data:image/(png|jpeg|jpg);base64,#i',$data_url) ) return false;
        $base64=preg_replace('#^data:image/(png|jpeg|jpg);base64,#i','',$data_url);
        $base64=str_replace(' ','+',$base64);
        if ( strlen($base64) > (self::MAX_SCREENSHOT_BYTES*1.38) ) return false;
        $binary=base64_decode($base64,true);
        if(false===$binary || strlen($binary)>self::MAX_SCREENSHOT_BYTES) return false;
        $image_info=@getimagesizefromstring($binary);
        if(false===$image_info || empty($image_info['mime'])) return false;
        $map=['image/png'=>['png','image/png'],'image/jpeg'=>['jpg','image/jpeg']];
        if(!isset($map[$image_info['mime']])) return false;
        return ['binary'=>$binary,'mime'=>$map[$image_info['mime']][1],'ext'=>$map[$image_info['mime']][0]];
    }

    public static function admin_screenshot( $item_id, $item, $product ) {
        if ( ! is_admin() || ! $item instanceof WC_Order_Item_Product ) return;
        if ( ! absint( $item->get_meta( self::SCREENSHOT_META_KEY, true ) ) && function_exists( 'wc_get_order' ) ) {
            self::retry_pending_screenshots_for_order( $item->get_order_id() );
            $item->read_meta_data( true );
        }

        $design = self::decode_json( $item->get_meta( self::META_KEY, true ) );
        if ( ! is_array( $design ) ) {
            $legacy = $item->get_meta( 'neon_stack', true );
            $design = self::decode_json( $legacy );
        }

        $configurator = (string) $item->get_meta( '_neon_stack_configurator', true );
        if ( '' === $configurator && is_array( $design ) ) $configurator = (string) ( $design['configurator'] ?? '' );

        // Only render the production panel for Neon Stack items.
        $is_neon = '' !== $configurator || $item->get_meta( self::SCREENSHOT_META_KEY, true ) || $item->get_meta( '_neon_stack_price_snapshot', true );
        if ( ! $is_neon ) return;

        $rows = [
            'Configurator' => $item->get_meta( '_neon_stack_configurator', true ),
            'Text'         => $item->get_meta( '_neon_stack_text', true ),
            'Font'         => $item->get_meta( '_neon_stack_font', true ),
            'Language'     => $item->get_meta( '_neon_stack_language', true ),
            'Size'         => $item->get_meta( '_neon_stack_size', true ),
            'Text colour'  => $item->get_meta( '_neon_stack_text_color', true ),
            'Colour mode'  => $item->get_meta( '_neon_stack_color_mode', true ),
            'Glow style'   => $item->get_meta( '_neon_stack_glow_style', true ),
            'Alignment'    => $item->get_meta( '_neon_stack_alignment', true ),
            'Backboard'    => $item->get_meta( '_neon_stack_backboard', true ),
            'Hardware'     => $item->get_meta( '_neon_stack_hardware', true ),
            'Shapes'       => $item->get_meta( '_neon_stack_shapes', true ),
            'Shape colours'=> $item->get_meta( '_neon_stack_shape_colors', true ),
            'Effects'      => $item->get_meta( '_neon_stack_effects', true ),
        ];

        // Backfill display values directly from the stored sanitized design when
        // an older order did not have the structured meta field.
        $fallbacks = [
            'Text colour' => isset( $design['textColor'] )
                ? self::format_color_value( $design['textColor'] )
                : self::default_color_for_production( (string) ( $design['configurator'] ?? '' ) ),
            'Font' => isset( $design['fontId'] ) && '' !== (string) $design['fontId']
                ? self::resolve_font_for_production( (string) $design['fontId'] )
                : ( isset( $design['font'] ) ? self::resolve_font_for_production( (string) $design['font'] ) : '' ),
            'Shapes' => isset( $design['shapes'] ) ? self::format_shapes_for_production( $design['shapes'] ) : '',
            'Shape colours' => isset( $design['shapeColors'] ) ? self::format_collection_for_production( $design['shapeColors'] ) : '',
        ];
        foreach ( $fallbacks as $label => $fallback ) {
            if ( '' === trim( (string) $rows[ $label ] ) && '' !== trim( (string) $fallback ) ) {
                $rows[ $label ] = $fallback;
            }
        }

        $rows = array_filter( $rows, static function( $value ) {
            return '' !== trim( (string) $value );
        } );

        echo '<div class="neon-stack-admin-order-panel" style="margin:12px 0 8px;padding:14px 16px;border:1px solid #dcdcde;border-radius:6px;background:#fff;">';
        echo '<strong style="display:block;font-size:14px;margin-bottom:10px;">Neon Stack production details</strong>';

        if ( ! empty( $rows ) ) {
            echo '<table style="width:100%;max-width:760px;border-collapse:collapse;">';
            foreach ( $rows as $label => $value ) {
                echo '<tr>';
                echo '<td style="width:150px;padding:5px 8px 5px 0;font-weight:600;vertical-align:top;">' . esc_html( $label ) . '</td>';
                echo '<td style="padding:5px 0;vertical-align:top;">' . esc_html( $value ) . '</td>';
                echo '</tr>';
            }
            echo '</table>';
        } elseif ( is_array( $design ) ) {
            echo '<p style="margin:0 0 8px;">The structured fields are unavailable, but the original sanitized design snapshot is preserved below.</p>';
        }

        $snapshot = $item->get_meta( '_neon_stack_price_snapshot', true );
        if ( $snapshot ) {
            $decoded = self::decode_json( $snapshot );
            if ( is_array( $decoded ) ) {
                echo '<details style="margin-top:10px;"><summary style="cursor:pointer;font-weight:600;">Price breakdown</summary>';
                echo '<pre style="white-space:pre-wrap;max-height:240px;overflow:auto;background:#f6f7f7;padding:10px;margin-top:8px;">' . esc_html( wp_json_encode( $decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) ) . '</pre>';
                echo '</details>';
            }
        }

        if ( is_array( $design ) ) {
            echo '<details style="margin-top:8px;"><summary style="cursor:pointer;font-weight:600;">Complete design data (sanitized)</summary>';
            echo '<pre style="white-space:pre-wrap;max-height:360px;overflow:auto;background:#f6f7f7;padding:10px;margin-top:8px;">' . esc_html( wp_json_encode( $design, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) ) . '</pre>';
            echo '</details>';
        }

        $attachment_id = (int) $item->get_meta( self::SCREENSHOT_META_KEY, true );
        if ( $attachment_id ) {
            $preview_url = wp_nonce_url(
                admin_url( 'admin-post.php?action=neon_stack_preview&attachment_id=' . $attachment_id ),
                'neon_stack_preview_' . $attachment_id
            );
            echo '<div style="margin-top:12px;">';
            echo '<strong style="display:block;margin-bottom:7px;">Customer sign preview</strong>';
            echo '<a href="' . esc_url( $preview_url ) . '" target="_blank" rel="noopener">';
            echo '<img src="' . esc_url( $preview_url ) . '" alt="Neon sign preview" style="display:block;max-width:520px;height:auto;border:1px solid #dcdcde;border-radius:4px;background:#f6f7f7;" />';
            echo '</a>';
            echo '<p style="margin:6px 0 0;"><a href="' . esc_url( $preview_url ) . '" target="_blank" rel="noopener">Open full preview ↗</a></p>';
            echo '</div>';
        } else {
            $has_token = is_array( $design ) && ! empty( $design['screenshot_token'] );
            if ( $has_token ) {
                echo '<p style="margin:12px 0 0;color:#b32d2e;">A preview token was supplied, but the preview could not be promoted. The temporary preview may have expired or been invalidated.</p>';
            } else {
                echo '<p style="margin:12px 0 0;color:#646970;">No customer preview image was attached to this order item. The frontend must upload the sign-only preview and include the returned screenshot_token in the Neon design payload.</p>';
            }
        }

        echo '</div>';
    }

    public static function hide_internal_meta($formatted_meta,$item){
        foreach($formatted_meta as $key=>$meta){
            if(in_array($meta->key,[self::META_KEY,self::SCREENSHOT_META_KEY,self::SCREENSHOT_URL_META_KEY,'_neon_stack_pending_screenshot_token','_neon_stack_screenshot_status'],true)) unset($formatted_meta[$key]);
        }
        return $formatted_meta;
    }

    public static function register_rest_routes(){
        register_rest_route( self::API_NAMESPACE, '/config', [
            'methods'  => WP_REST_Server::READABLE,
            'permission_callback' => '__return_true',
            'args' => [
                'configurator' => [
                    'required' => false,
                    'default' => 'custom_neon',
                    'sanitize_callback' => 'sanitize_key',
                    'validate_callback' => function( $value ) {
                        return is_string( $value ) && '' !== sanitize_key( $value ) && preg_match( '/^[a-z0-9_-]{1,60}$/', $value );
                    },
                ],
            ],
            'callback' => function( $request ) {
                // Ensure built-in configurators have real WooCommerce products
                // before exposing their product references to a headless client.
                self::ensure_configurator_products();
                $config = self::config();
                $type = sanitize_key( $request->get_param('configurator') ?: 'custom_neon' );
                if ( isset($config['options'][$type], $config['configurators'][$type]) ) {
                    $assigned_id = self::assigned_product_id( $type );
                    if ( $assigned_id ) {
                        $assigned_product = wc_get_product( $assigned_id );
                        if ( $assigned_product instanceof WC_Product ) {
                            $config['configurators'][$type]['product_id'] = $assigned_id;
                            $config['configurators'][$type]['product_sku'] = (string) $assigned_product->get_sku();
                        }
                    }
                    $out = [
                        'version'       => 2,
                        'configurator'  => $type,
                        'name'          => sanitize_text_field($config['configurators'][$type]['name'] ?? $type),
                        'enabled'       => !empty($config['configurators'][$type]['enabled']),
                        // Product ID is intentionally returned because a headless
                        // frontend may need it to address the mapped WooCommerce item.
                        // It is not accepted as the pricing authority.
                        'product_id'    => absint($config['configurators'][$type]['product_id'] ?? 0),
                        'product_sku'   => sanitize_text_field($config['configurators'][$type]['product_sku'] ?? ''),
                        'description'   => sanitize_textarea_field($config['configurators'][$type]['description'] ?? ''),
                        // Only frontend-safe settings are exposed. CORS allowlists,
                        // screenshot TTLs and other operational settings stay private.
                        'settings'      => [
                            'currency_label' => sanitize_text_field($config['settings']['currency_label'] ?? '₹'),
                        ],
                        'languages'     => array_values(array_filter($config['languages'], function($x){
                            return is_array($x) && (!isset($x['enabled']) || !empty($x['enabled']));
                        })),
                        'fonts'         => array_values(array_filter($config['fonts'], function($x){
                            return is_array($x) && (!isset($x['enabled']) || !empty($x['enabled']));
                        })),
                        'options'       => $config['options'][$type],
                    ];

                    // Mojo Mix has a deliberately different customer experience:
                    // no text-colour picker and no effect picker. Text uses the
                    // built-in animated Mojo spectrum in React, while shapes may
                    // optionally use one single colour selected by the customer.
                    if ( 'mojo_mix' === $type ) {
                        $shape_colors = [];
                        foreach ( (array) ( $config['options']['custom_neon']['colors'] ?? [] ) as $color ) {
                            if ( ! is_array( $color ) || empty( $color['enabled'] ) ) continue;
                            $shape_colors[] = [
                                'id'   => sanitize_key( (string) ( $color['id'] ?? '' ) ),
                                'name' => sanitize_text_field( (string) ( $color['name'] ?? '' ) ),
                                'hex'  => sanitize_text_field( (string) ( $color['hex'] ?? '' ) ),
                            ];
                        }
                        $out['presentation'] = [
                            'mode'                 => 'mojo_mix',
                            'text_color_selection' => false,
                            'effect_selection'     => false,
                            'text_animation'       => 'mojo_spectrum',
                            'shape_color_mode'     => 'single',
                            'shape_color_options' => array_values( array_filter( $shape_colors, function( $x ) {
                                return ! empty( $x['id'] ) && ! empty( $x['hex'] );
                            } ) ),
                        ];
                    } else {
                        $out['presentation'] = [
                            'mode'                 => 'custom_neon',
                            'text_color_selection' => true,
                            'effect_selection'     => true,
                            'text_animation'       => null,
                            'shape_color_mode'     => 'single',
                        ];
                    }

                    return rest_ensure_response($out);
                }
                return new WP_Error('invalid_configurator','Configurator not found',['status'=>404]);
            }
        ]);

        register_rest_route( self::API_NAMESPACE, '/screenshot', [
            'methods' => WP_REST_Server::CREATABLE,
            'permission_callback' => [ __CLASS__, 'rest_screenshot_permission' ],
            'callback' => [ __CLASS__, 'rest_upload_screenshot' ],
        ]);

        register_rest_route( self::API_NAMESPACE, '/health', [
            'methods' => WP_REST_Server::READABLE,
            'permission_callback' => '__return_true',
            'callback' => function(){
                return rest_ensure_response([
                    'ok' => true,
                    'plugin' => 'Neon Stack Configurator Engine',
                    'version' => self::VERSION,
                    'woocommerce' => class_exists('WooCommerce'),
                    'rest' => true,
                ]);
            }
        ]);
    }

    public static function rest_screenshot_permission( $request ) {
        $origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';
        if ( '' === $origin ) {
            return new WP_Error( 'neon_screenshot_origin_required', __( 'A browser origin is required for preview uploads.', 'neon-stack-configurator' ), [ 'status' => 403 ] );
        }
        $config = self::config();
        $allowed = array_filter( array_map( 'trim', preg_split( '/[\\r\\n,]+/', (string) ( $config['settings']['cors_origins'] ?? '' ) ) ) );
        // Uploads are intentionally stricter than the public config endpoint:
        // never allow wildcard CORS for an image-writing endpoint.
        if ( in_array( '*', $allowed, true ) || ! in_array( $origin, $allowed, true ) ) {
            return new WP_Error( 'neon_screenshot_origin_denied', __( 'Preview uploads are not allowed from this origin.', 'neon-stack-configurator' ), [ 'status' => 403 ] );
        }
        return true;
    }

    public static function rest_upload_screenshot( $request ) {
        if ( ! self::allow_screenshot_capture() ) {
            return new WP_Error( 'neon_screenshot_rate_limited', __( 'Too many preview uploads were attempted. Please wait a little and try again.', 'neon-stack-configurator' ), [ 'status' => 429 ] );
        }

        if ( empty( $_FILES['screenshot'] ) || ! is_array( $_FILES['screenshot'] ) ) {
            return new WP_Error( 'neon_screenshot_missing', __( 'No preview image was uploaded.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
        }

        $file = $_FILES['screenshot'];
        if ( ! empty( $file['error'] ) ) {
            return new WP_Error( 'neon_screenshot_upload_error', __( 'The preview image could not be uploaded.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
        }
        $size = isset( $file['size'] ) ? absint( $file['size'] ) : 0;
        if ( $size < 1 || $size > self::MAX_SCREENSHOT_BYTES ) {
            return new WP_Error( 'neon_screenshot_size', __( 'The preview image is too large. Please use an image under 1.5 MB.', 'neon-stack-configurator' ), [ 'status' => 413 ] );
        }
        $tmp = isset( $file['tmp_name'] ) ? (string) $file['tmp_name'] : '';
        if ( '' === $tmp || ! is_uploaded_file( $tmp ) || ! is_readable( $tmp ) ) {
            return new WP_Error( 'neon_screenshot_invalid_upload', __( 'The preview upload is invalid.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
        }

        $binary = @file_get_contents( $tmp );
        if ( false === $binary || strlen( $binary ) !== $size ) {
            return new WP_Error( 'neon_screenshot_read_failed', __( 'The preview image could not be read.', 'neon-stack-configurator' ), [ 'status' => 400 ] );
        }
        $image_info = @getimagesizefromstring( $binary );
        if ( false === $image_info || empty( $image_info['mime'] ) || empty( $image_info[0] ) || empty( $image_info[1] ) ) {
            return new WP_Error( 'neon_screenshot_not_image', __( 'Only valid PNG or JPEG preview images are accepted.', 'neon-stack-configurator' ), [ 'status' => 415 ] );
        }
        $pixels = (float) $image_info[0] * (float) $image_info[1];
        if ( $pixels > self::MAX_SCREENSHOT_PIXELS ) {
            return new WP_Error( 'neon_screenshot_dimensions', __( 'The preview image dimensions are too large.', 'neon-stack-configurator' ), [ 'status' => 413 ] );
        }
        $map = [ 'image/png' => [ 'png', 'image/png' ], 'image/jpeg' => [ 'jpg', 'image/jpeg' ] ];
        if ( ! isset( $map[ $image_info['mime'] ] ) ) {
            return new WP_Error( 'neon_screenshot_type', __( 'Only PNG or JPEG preview images are accepted.', 'neon-stack-configurator' ), [ 'status' => 415 ] );
        }

        $upload = wp_upload_dir();
        if ( ! empty( $upload['error'] ) ) {
            return new WP_Error( 'neon_screenshot_storage', __( 'Preview storage is temporarily unavailable.', 'neon-stack-configurator' ), [ 'status' => 500 ] );
        }
        $dir = trailingslashit( $upload['basedir'] ) . 'neon-stack-temp';
        if ( ! wp_mkdir_p( $dir ) ) {
            return new WP_Error( 'neon_screenshot_storage', __( 'Preview storage is temporarily unavailable.', 'neon-stack-configurator' ), [ 'status' => 500 ] );
        }
        self::write_temp_directory_rules( $dir );

        try {
            $token = strtolower( bin2hex( random_bytes( 20 ) ) );
        } catch ( Exception $e ) {
            return new WP_Error( 'neon_screenshot_token', __( 'Could not create a secure preview token.', 'neon-stack-configurator' ), [ 'status' => 500 ] );
        }
        $filename = $token . '.' . $map[ $image_info['mime'] ][0];
        $path = trailingslashit( $dir ) . $filename;
        if ( false === file_put_contents( $path, $binary, LOCK_EX ) ) {
            return new WP_Error( 'neon_screenshot_storage', __( 'The preview image could not be stored.', 'neon-stack-configurator' ), [ 'status' => 500 ] );
        }
        $info = [
            'file' => $filename,
            'mime' => $map[ $image_info['mime'] ][1],
            'created' => time(),
            'origin_hash' => wp_hash( $origin ),
        ];
        if ( false === file_put_contents( trailingslashit( $dir ) . $token . '.json', wp_json_encode( $info ), LOCK_EX ) ) {
            @unlink( $path );
            return new WP_Error( 'neon_screenshot_storage', __( 'The preview image could not be indexed.', 'neon-stack-configurator' ), [ 'status' => 500 ] );
        }

        return rest_ensure_response( [
            'success' => true,
            'token' => $token,
            'expires_in' => self::temp_ttl(),
        ] );
    }

    private static function write_temp_directory_rules( $dir ) {
        $htaccess = trailingslashit( $dir ) . '.htaccess';
        if ( ! file_exists( $htaccess ) ) {
            @file_put_contents( $htaccess, "Options -Indexes\n<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n" );
        }
        $webconfig = trailingslashit( $dir ) . 'web.config';
        if ( ! file_exists( $webconfig ) ) {
            @file_put_contents( $webconfig, "<?xml version=\"1.0\" encoding=\"UTF-8\"?><configuration><system.webServer><security><authorization><remove users=\"*\" roles=\"\" verbs=\"\" /><add accessType=\"Deny\" users=\"*\" /></authorization></security></system.webServer></configuration>" );
        }
        $index = trailingslashit( $dir ) . 'index.php';
        if ( ! file_exists( $index ) ) @file_put_contents( $index, "<?php // Silence is golden.\n" );
    }

    private static function temp_screenshot_exists( $token ) {
        if ( ! preg_match( '/^[a-f0-9]{40}$/', (string) $token ) ) return false;
        $upload = wp_upload_dir();
        if ( ! empty( $upload['error'] ) ) return false;
        $dir = trailingslashit( $upload['basedir'] ) . 'neon-stack-temp';
        $index = trailingslashit( $dir ) . $token . '.json';
        if ( ! is_file( $index ) ) return false;
        $info = self::decode_json( @file_get_contents( $index ) );
        if ( ! is_array( $info ) || empty( $info['file'] ) || empty( $info['created'] ) || time() - absint( $info['created'] ) > self::temp_ttl() ) {
            self::delete_temp( $token, is_array( $info ) ? $info : [] );
            return false;
        }
        $path = trailingslashit( $dir ) . basename( $info['file'] );
        return is_file( $path );
    }

    public static function cart_item_removed( $cart_item_key, $cart ) {
        if ( ! $cart || ! is_object( $cart ) ) return;
        $removed = method_exists( $cart, 'get_removed_cart_contents' ) ? $cart->get_removed_cart_contents() : [];
        $item = is_array( $removed ) && isset( $removed[ $cart_item_key ] ) ? $removed[ $cart_item_key ] : null;
        if ( is_array( $item ) ) self::delete_cart_item_temp_screenshot( $item );
    }

    public static function cart_emptied( $cart ) {
        if ( ! $cart || ! is_object( $cart ) || ! method_exists( $cart, 'get_cart' ) ) return;
        foreach ( $cart->get_cart() as $item ) self::delete_cart_item_temp_screenshot( $item );
    }

    private static function delete_cart_item_temp_screenshot( $item ) {
        if ( ! is_array( $item ) || empty( $item[ self::CART_KEY ] ) || ! is_array( $item[ self::CART_KEY ] ) ) return;
        $token = sanitize_key( (string) ( $item[ self::CART_KEY ]['screenshot_token'] ?? '' ) );
        if ( $token ) self::delete_temp( $token );
    }

    public static function cors_headers( $served, $result, $request, $server ) {
        if ( ! $request instanceof WP_REST_Request || 0 !== strpos( $request->get_route(), '/neon-stack/v2/' ) ) return $served;
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
        if ( ! $origin ) return $served;
        $config = self::config();
        $allowed = array_filter(array_map('trim', preg_split('/[\r\n,]+/', (string)($config['settings']['cors_origins'] ?? ''))));
        if ( in_array( '*', $allowed, true ) ) {
            // Public config endpoints do not need credentialed cross-origin access.
            header( 'Access-Control-Allow-Origin: *' );
            header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce' );
            header( 'Vary: Origin' );
            return $served;
        }

        $allow = in_array( $origin, $allowed, true ) ? $origin : '';
        if ( $allow ) {
            header( 'Access-Control-Allow-Origin: ' . $allow );
            header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce' );
            header( 'Vary: Origin' );
        }
        return $served;
    }

    public static function admin_menu(){
        add_menu_page('Neon Configurator','Neon Configurator','manage_woocommerce','neon-stack-configurator',[__CLASS__,'admin_page'],'dashicons-art',56);
    }

    /**
     * Return the MIME types WordPress expects for supported font formats.
     *
     * Font MIME detection differs between PHP versions and hosting stacks.
     * These values mirror WordPress core's font handling rather than assuming
     * that .ttf is always reported as font/ttf.
     */
    private static function font_mime_types() {
        $ttf_mime  = PHP_VERSION_ID >= 70400 ? 'font/sfnt' : ( PHP_VERSION_ID >= 70300 ? 'application/font-sfnt' : 'application/x-font-ttf' );
        $woff_mime = PHP_VERSION_ID >= 80112 ? 'font/woff' : 'application/font-woff';
        $woff2_mime = PHP_VERSION_ID >= 80112 ? 'font/woff2' : 'application/font-woff2';

        return [
            'otf'   => 'application/vnd.ms-opentype',
            'ttf'   => $ttf_mime,
            'woff'  => $woff_mime,
            'woff2' => $woff2_mime,
        ];
    }

    /**
     * Validate a font's binary signature before WordPress moves it.
     *
     * This is intentionally strict: only the formats advertised by the admin
     * UI are accepted. The browser's file extension and MIME header are never
     * treated as proof that the file is a font.
     */
    private static function is_valid_font_file( $path, $ext ) {
        if ( ! is_string( $path ) || ! is_readable( $path ) || ! is_file( $path ) ) {
            return false;
        }

        $fh = @fopen( $path, 'rb' );
        if ( ! $fh ) {
            return false;
        }

        $header = fread( $fh, 4 );
        fclose( $fh );

        if ( false === $header || 4 !== strlen( $header ) ) {
            return false;
        }

        switch ( $ext ) {
            case 'ttf':
                // TrueType outlines use 0x00010000. Collections are not accepted.
                return "\x00\x01\x00\x00" === $header;

            case 'otf':
                // OpenType/CFF fonts use the 'OTTO' sfnt version.
                return 'OTTO' === $header || "\x00\x01\x00\x00" === $header;

            case 'woff':
                return 'wOFF' === $header;

            case 'woff2':
                return 'wOF2' === $header;

            default:
                return false;
        }
    }

    public static function handle_admin_actions(){
        if(!is_admin() || !current_user_can('manage_woocommerce') || empty($_POST['neon_stack_action'])) return;
        check_admin_referer('neon_stack_admin','neon_stack_nonce');
        $action=sanitize_key(wp_unslash($_POST['neon_stack_action']));
        $config=self::config();

        if ( 'save_builder' === $action ) {
            $json = wp_unslash($_POST['config_json'] ?? '');
            $decoded = json_decode($json,true);
            if ( is_array($decoded) && isset($decoded['configurators'],$decoded['options'],$decoded['languages'],$decoded['fonts']) ) {
                self::save_config(self::sanitize_admin_config($decoded));
                self::redirect_admin('saved','Configuration saved successfully.');
            }
            self::redirect_admin('error','Could not save configuration. Please check the data.');
        }

        if ( 'save_settings' === $action ) {
            $config['settings']['currency_label'] = sanitize_text_field(wp_unslash($_POST['currency_label'] ?? '₹'));
            $config['settings']['cors_origins'] = sanitize_textarea_field(wp_unslash($_POST['cors_origins'] ?? ''));
            $config['settings']['screenshot_ttl_hours'] = max(1,min(48,absint($_POST['screenshot_ttl_hours'] ?? 6)));
            self::save_config($config);
            self::redirect_admin('saved','Settings saved.');
        }

        if ( 'upload_font' === $action || 'save_font' === $action ) {
            $original_id = sanitize_key( wp_unslash( $_POST['font_original_id'] ?? '' ) );
            $id = sanitize_key(
                wp_unslash(
                    $_POST['font_id'] ?? ( $original_id ?: '' )
                )
            );

            if ( $original_id && $id !== $original_id ) {
                self::redirect_admin( 'error', 'The Font ID cannot be changed after a font is created. Keep it stable for React configurations.' );
            }

            $existing_index = -1;
            $existing = [];
            foreach ( (array) $config['fonts'] as $i => $f ) {
                if ( is_array($f) && sanitize_key( (string)($f['id'] ?? '') ) === ( $original_id ?: $id ) ) {
                    $existing_index = $i;
                    $existing = $f;
                    break;
                }
            }

            $has_file = ! empty( $_FILES['font_file']['name'] );
            $url = ! empty( $existing['url'] ) ? esc_url_raw( $existing['url'] ) : '';
            $format = sanitize_key( $existing['format'] ?? '' );

            if ( $has_file ) {
                $file = $_FILES['font_file'];

                if ( ! is_array( $file ) || ! isset( $file['tmp_name'], $file['name'], $file['size'], $file['error'] ) ) {
                    self::redirect_admin( 'error', 'The font upload could not be validated.' );
                }
                if ( UPLOAD_ERR_OK !== (int) $file['error'] ) {
                    self::redirect_admin( 'error', 'The font upload failed. Please try again.' );
                }

                $size = (int) $file['size'];
                if ( $size < 1 || $size > 10485760 ) {
                    self::redirect_admin( 'error', 'Font files must be between 1 byte and 10 MB.' );
                }

                $safe_filename = sanitize_file_name( $file['name'] );
                $ext = strtolower( pathinfo( $safe_filename, PATHINFO_EXTENSION ) );
                $allowed = self::font_mime_types();

                if ( ! isset( $allowed[ $ext ] ) ) {
                    self::redirect_admin( 'error', 'Allowed font files: WOFF, WOFF2, TTF, OTF.' );
                }

                if ( ! self::is_valid_font_file( $file['tmp_name'], $ext ) ) {
                    self::redirect_admin( 'error', 'The uploaded file does not appear to be a valid ' . strtoupper( $ext ) . ' font.' );
                }

                require_once ABSPATH . 'wp-admin/includes/file.php';
                $font_mime_filter = static function( $mimes ) use ( $allowed ) {
                    foreach ( $allowed as $font_ext => $font_mime ) $mimes[ $font_ext ] = $font_mime;
                    return $mimes;
                };
                add_filter( 'upload_mimes', $font_mime_filter, 20 );
                $upload = wp_handle_upload( $file, [ 'test_form' => false, 'mimes' => $allowed ] );
                remove_filter( 'upload_mimes', $font_mime_filter, 20 );

                if ( isset( $upload['error'] ) ) self::redirect_admin( 'error', $upload['error'] );

                $url = esc_url_raw( $upload['url'] );
                $format = $ext;
            }

            if ( '' === $id ) {
                if ( $has_file ) {
                    $id = sanitize_key( pathinfo( sanitize_file_name( $_FILES['font_file']['name'] ), PATHINFO_FILENAME ) );
                }
            }
            if ( '' === $id ) self::redirect_admin( 'error', 'Please provide a valid Font ID.' );

            if ( $existing_index < 0 && ! $has_file ) {
                self::redirect_admin( 'error', 'Please choose a font file when adding a new font.' );
            }

            if ( $existing_index >= 0 && ! $url ) {
                self::redirect_admin( 'error', 'This font has no stored file. Please choose a replacement file.' );
            }

            $name = sanitize_text_field( wp_unslash( $_POST['font_name'] ?? ( $existing['name'] ?? $id ) ) );
            if ( '' === $name ) $name = $id;

            $langs = array_values( array_filter( array_map(
                'sanitize_key',
                preg_split( '/[\r\n,]+/', wp_unslash( $_POST['font_languages'] ?? implode(',', (array)($existing['languages'] ?? ['english'])) ) )
            ) ) );

            $font = [
                'id'        => $id,
                'name'      => $name,
                'url'       => $url,
                'format'    => $format ?: 'woff2',
                'languages' => $langs,
                'enabled'   => isset( $_POST['font_enabled'] ) ? !empty($_POST['font_enabled']) : ( $existing_index >= 0 ? !empty($existing['enabled']) : true ),
            ];

            if ( $existing_index >= 0 ) {
                $config['fonts'][ $existing_index ] = $font;
                self::save_config( $config );
                self::redirect_admin( 'saved', 'Font updated successfully.' );
            }

            foreach ( (array) $config['fonts'] as $f ) {
                if ( is_array($f) && sanitize_key((string)($f['id'] ?? '')) === $id ) {
                    self::redirect_admin( 'error', 'A font with this Font ID already exists.' );
                }
            }

            $config['fonts'][] = $font;
            self::save_config( $config );
            self::redirect_admin( 'saved', 'Font added successfully.' );
        }

        if ( 'delete_font' === $action ) {
            $id=sanitize_key(wp_unslash($_POST['font_id']??''));
            $config['fonts']=array_values(array_filter($config['fonts'],function($f)use($id){return ($f['id']??'')!==$id;}));
            self::save_config($config);
            self::redirect_admin('saved','Font removed from the configurator.');
        }

        if ( 'save_json_direct' === $action ) {
            $json=wp_unslash($_POST['config_json']??'');
            $decoded=json_decode($json,true);
            if(is_array($decoded)) { self::save_config(self::sanitize_admin_config($decoded)); self::redirect_admin('saved','Advanced configuration saved.'); }
            self::redirect_admin('error','Invalid JSON.');
        }
    }

    private static function sanitize_admin_config($config) {
        $clean=self::default_config();
        $clean['version']=2;
        $clean['settings']['currency_label']=sanitize_text_field($config['settings']['currency_label']??'₹');
        $clean['settings']['cors_origins']=sanitize_textarea_field($config['settings']['cors_origins']??'');
        $clean['settings']['screenshot_ttl_hours']=max(1,min(48,absint($config['settings']['screenshot_ttl_hours']??6)));
        $clean['mojo_mix_initialized'] = ! empty( $config['mojo_mix_initialized'] );

        $clean['configurators']=[];
        foreach((array)($config['configurators']??[]) as $id=>$c){
            $id=sanitize_key($id); if(!$id)continue;
            $incoming_product_id = absint($c['product_id']??0);
            $existing_product_id = absint($config['configurators'][$id]['product_id'] ?? 0);
            if ( in_array( $id, [ 'custom_neon', 'mojo_mix' ], true ) && $existing_product_id && ! $incoming_product_id ) {
                $incoming_product_id = $existing_product_id;
            }
            $default_sku = 'custom_neon' === $id ? 'NEON-STACK-CUSTOM' : ( 'mojo_mix' === $id ? 'NEON-STACK-MOJO' : '' );
            $incoming_sku = sanitize_text_field( $c['product_sku'] ?? ( $config['configurators'][$id]['product_sku'] ?? $default_sku ) );
            $clean['configurators'][$id]=[
                'name'=>sanitize_text_field($c['name']??$id),
                'enabled'=>!empty($c['enabled']),
                'product_id'=>$incoming_product_id,
                'product_sku'=>$incoming_sku,
                'description'=>sanitize_textarea_field($c['description']??''),
                'price_mode'=>in_array(($c['price_mode']??'product_plus_options'),['product_plus_options','size_base'],true)?$c['price_mode']:'product_plus_options',
            ];
        }
        foreach((array)($config['options']??[]) as $type=>$groups){
            $type=sanitize_key($type); if(!$type)continue;
            $clean['options'][$type]=[];
            foreach((array)$groups as $group=>$items){
                $group=sanitize_key($group); if(!$group)continue;
                // Mojo Mix intentionally has no admin-managed colour/effect groups.
                if ( 'mojo_mix' === $type && in_array( $group, [ 'colors', 'effects', 'glow_styles' ], true ) ) continue;
                $clean['options'][$type][$group]=[];
                foreach((array)$items as $item){
                    if(!is_array($item))continue;
                    $id=sanitize_key($item['id']??''); if(!$id)continue;
                    $clean_item=[
                        'id'=>$id,
                        'name'=>sanitize_text_field($item['name']??$id),
                        'description'=>sanitize_textarea_field($item['description']??''),
                        'price'=>max(0,(float)($item['price']??0)),
                        'enabled'=>!empty($item['enabled']),
                    ];
                    foreach(['hex','icon','unit','tag','value'] as $extra) if(isset($item[$extra])) $clean_item[$extra]=sanitize_text_field($item[$extra]);
                    $clean['options'][$type][$group][]=$clean_item;
                }
            }
        }
        $clean['languages']=[];
        foreach((array)($config['languages']??[]) as $l){
            if(!is_array($l))continue;$id=sanitize_key($l['id']??'');if(!$id)continue;
            $clean['languages'][]=['id'=>$id,'name'=>sanitize_text_field($l['name']??$id),'enabled'=>!empty($l['enabled']),'typing_engine'=>sanitize_key($l['typing_engine']??'latin')];
        }
        $clean['fonts']=[];
        foreach((array)($config['fonts']??[]) as $f){
            if(!is_array($f))continue;$id=sanitize_key($f['id']??'');if(!$id)continue;
            $clean['fonts'][]=['id'=>$id,'name'=>sanitize_text_field($f['name']??$id),'url'=>esc_url_raw($f['url']??''),'format'=>sanitize_key($f['format']??'woff2'),'languages'=>array_values(array_filter(array_map('sanitize_key',(array)($f['languages']??[])))),'enabled'=>!empty($f['enabled'])];
        }
        return $clean;
    }

    private static function redirect_admin($status,$message) {
        $url=add_query_arg(['page'=>'neon-stack-configurator','neon_status'=>$status,'neon_message'=>rawurlencode($message)],admin_url('admin.php'));
        wp_safe_redirect($url);exit;
    }

    public static function admin_page(){
        if(!current_user_can('manage_woocommerce'))return;
        $config=self::config();
        $active=sanitize_key($_GET['tab']??'dashboard');
        $tabs=[
            'dashboard'=>'Overview',
            'configurators'=>'Configurators',
            'options'=>'Options',
            'fonts'=>'Fonts',
            'languages'=>'Languages',
            'integration'=>'Integration',
            'advanced'=>'Advanced',
        ];
        $status=sanitize_key($_GET['neon_status']??'');$message=sanitize_text_field(wp_unslash($_GET['neon_message']??''));
        echo '<div class="wrap neon-wrap">';
        echo '<div class="neon-hero"><div><div class="neon-kicker">NEON STACK</div><h1>Configurator Engine <span>v'.esc_html(self::VERSION).'</span></h1><p>Manage every configurable option from WordPress while your React frontend stays focused on the customer experience.</p></div><div class="neon-health"><span class="neon-dot"></span> WooCommerce '.(class_exists('WooCommerce')?'Connected':'Not detected').'</div></div>';
        if($message) echo '<div class="neon-notice '.($status==='error'?'error':'success').'">'.esc_html($message).'</div>';
        echo '<nav class="neon-tabs">';
        foreach($tabs as $id=>$label){
            $url=add_query_arg(['page'=>'neon-stack-configurator','tab'=>$id],admin_url('admin.php'));
            echo '<a class="'.($active===$id?'active':'').'" href="'.esc_url($url).'">'.esc_html($label).'</a>';
        }
        echo '</nav>';
        echo '<div class="neon-content">';

        switch($active){
            case 'configurators': self::render_configurators($config); break;
            case 'options': self::render_options($config); break;
            case 'fonts': self::render_fonts($config); break;
            case 'languages': self::render_languages($config); break;
            case 'integration': self::render_integration($config); break;
            case 'advanced': self::render_advanced($config); break;
            default: self::render_dashboard($config); break;
        }
        echo '</div></div>';
    }

    private static function card($title,$subtitle,$body) {
        echo '<section class="neon-card"><div class="neon-card-head"><div><h2>'.esc_html($title).'</h2>'.($subtitle?'<p>'.esc_html($subtitle).'</p>':'').'</div></div>'.$body.'</section>';
    }

    private static function render_dashboard($config){
        $config_count=count($config['configurators']);
        $font_count=count($config['fonts']);
        $language_count=count($config['languages']);
        $option_count=0;foreach($config['options'] as $groups)foreach($groups as $items)$option_count+=count($items);
        echo '<div class="neon-stat-grid">';
        self::stat('Configurators',$config_count,'Custom Neon, Mojo Mix & more');
        self::stat('Options',$option_count,'Sizes, colours, shapes, hardware…');
        self::stat('Fonts',$font_count,'Upload your own web fonts');
        self::stat('Languages',$language_count,'Ready for phonetic typing engines');
        echo '</div>';
        self::card('How the engine works','The WordPress side of your headless setup.',
            '<div class="neon-flow"><div><b>01</b><strong>React Builder</strong><span>Customer designs the sign and sees the live preview.</span></div><i>→</i><div><b>02</b><strong>Configurator API</strong><span>React fetches your current options, prices, fonts and languages.</span></div><i>→</i><div><b>03</b><strong>WooCommerce</strong><span>Validated configuration is attached to the cart and order.</span></div><i>→</i><div><b>04</b><strong>Private Preview</strong><span>Only the final sign-only screenshot is retained with the order.</span></div></div>'
        );
        self::card('Quick actions','Common things you will do.',
            '<div class="neon-action-grid"><a href="?page=neon-stack-configurator&tab=options">Manage Options</a><a href="?page=neon-stack-configurator&tab=fonts">Upload Fonts</a><a href="?page=neon-stack-configurator&tab=languages">Manage Languages</a><a href="?page=neon-stack-configurator&tab=integration">React Integration</a></div>'
        );
    }

    private static function stat($title,$number,$desc){echo '<div class="neon-stat"><div class="neon-stat-number">'.esc_html($number).'</div><div><strong>'.esc_html($title).'</strong><span>'.esc_html($desc).'</span></div></div>'; }

    private static function render_configurators($config){
        echo '<div class="neon-section-intro"><div><h2>Configurators</h2><p>Each configurator can have its own options and WooCommerce product mapping.</p></div><button class="button neon-primary" type="button" onclick="neonOpenConfigurator()">+ Add Configurator</button></div>';
        echo '<div id="neon-configurator-list" class="neon-list">';
        foreach($config['configurators'] as $id=>$c){
            $groups=count($config['options'][$id]??[]);
            echo '<div class="neon-row-card" data-configurator-id="'.esc_attr($id).'"><div class="neon-row-icon">✦</div><div class="neon-row-main"><strong>'.esc_html($c['name']??$id).'</strong><span><code>'.esc_html($id).'</code> · '.esc_html($groups).' option groups</span><small>'.esc_html($c['description']??'').'</small></div><div class="neon-row-meta">'.(!empty($c['enabled'])?'<span class="neon-pill on">Enabled</span>':'<span class="neon-pill">Disabled</span>').'<span>Product #'.esc_html(absint($c['product_id']??0)).(!empty($c['product_sku'])?' · SKU '.esc_html($c['product_sku']):'').'</span></div><div class="neon-row-actions"><button type="button" class="button" onclick=\'neonEditConfigurator('.wp_json_encode($id).')\'>Edit</button><button type="button" class="button-link-delete" onclick=\'neonDeleteConfigurator('.wp_json_encode($id).')\'>Delete</button></div></div>';
        }
        echo '</div>';
        echo '<div class="neon-modal" id="neon-configurator-modal"><div class="neon-modal-box"><button class="neon-close" onclick="neonCloseModal()">×</button><h2 id="neon-config-modal-title">Add Configurator</h2><form id="neon-config-form" onsubmit="return neonSaveConfigurator(event)"><input type="hidden" id="cfg_original_id"><label>ID (slug)<input id="cfg_id" required pattern="[a-z0-9_-]+"></label><label>Name<input id="cfg_name" required></label><label>Description<textarea id="cfg_desc" rows="3"></textarea></label><label>WooCommerce Product ID <span style="font-weight:600;color:#667085">(auto-managed for built-in neon configurators)</span><input id="cfg_product" type="number" min="0" value="0"></label><label>Pricing mode<select id="cfg_price_mode"><option value="product_plus_options">Product price + option surcharges</option><option value="size_base">Size price as base + other surcharges</option></select></label><label class="neon-check"><input id="cfg_enabled" type="checkbox" checked> Enabled</label><div class="neon-modal-actions"><button type="button" class="button" onclick="neonCloseModal()">Cancel</button><button class="button button-primary neon-primary" type="submit">Save Configurator</button></div></form></div></div>';
        echo '<script>window.neonConfigurators='.wp_json_encode($config['configurators']).';</script>';
    }

    private static function render_options($config){
        $types=$config['configurators'];
        $first=array_key_first($types);
        $selected=sanitize_key($_GET['configurator']??$first);
        if(!isset($types[$selected]))$selected=$first;
        $option_url = admin_url('admin.php?page=neon-stack-configurator&tab=options&configurator=');
        echo '<div class="neon-section-intro"><div><h2>Option Library</h2><p>Changes here are picked up by React through the Config API. Add, edit, disable, delete and reorder options without redeploying React.</p></div><div><select id="neon-type-select" onchange="location.href=\'' . esc_js($option_url) . '\' + encodeURIComponent(this.value)">';
        foreach($types as $id=>$c)echo '<option value="'.esc_attr($id).'" '.selected($selected,$id,false).'>'.esc_html($c['name']??$id).'</option>';
        echo '</select></div></div>';
        if ( 'mojo_mix' === $selected ) {
            echo '<div class="neon-card neon-mojo-banner"><div class="neon-mojo-badge">✦</div><div><strong>Mojo Mix experience</strong><p>Sizes, shapes, backboards and hardware are managed separately for Mojo Mix. Text uses the animated Mojo spectrum in React, so there is intentionally no text-colour or effect library here. Shapes can use one single colour from the shared colour palette.</p></div></div>';
        }
        echo '<div id="neon-option-groups">';
        foreach(($config['options'][$selected]??[]) as $group=>$items){
            if ( 'mojo_mix' === $selected && in_array( $group, [ 'colors', 'effects', 'glow_styles' ], true ) ) continue;
            self::render_option_group($selected,$group,$items);
        }
        echo '</div>';
        echo '<div class="neon-card neon-add-group"><button class="button neon-primary" type="button" onclick="neonAddGroup()">+ Add Custom Option Group</button><span>Use this for future product-specific controls.</span></div>';
        echo '<div class="neon-modal" id="neon-option-modal"><div class="neon-modal-box neon-modal-wide"><button class="neon-close" onclick="neonCloseModal()">×</button><h2 id="neon-option-modal-title">Add option</h2><form id="neon-option-form" onsubmit="return neonSaveOption(event)"><input type="hidden" id="opt_original_id"><input type="hidden" id="opt_group"><label>Option ID (slug)<input id="opt_id" required pattern="[a-z0-9_-]+"></label><label>Display name<input id="opt_name" required></label><label>Description<textarea id="opt_desc" rows="3"></textarea></label><div class="neon-two"><label>Price / surcharge<input id="opt_price" type="number" min="0" step="0.01" value="0"></label><label>Hex colour (optional)<input id="opt_hex" type="text" placeholder="#FF2BB5"></label></div><label>Icon / value (optional)<input id="opt_icon" placeholder="heart, ⚡, URL, or any frontend value"></label><label class="neon-check"><input id="opt_enabled" type="checkbox" checked> Enabled</label><div class="neon-modal-actions"><button type="button" class="button" onclick="neonCloseModal()">Cancel</button><button class="button button-primary neon-primary">Save Option</button></div></form></div></div>';
        echo '<div class="neon-modal" id="neon-group-modal"><div class="neon-modal-box"><button class="neon-close" onclick="neonCloseModal()">×</button><h2>Add Option Group</h2><form onsubmit="return neonSaveGroup(event)"><label>Group ID<input id="group_id" required pattern="[a-z0-9_-]+"></label><label>Group name<input id="group_name" required></label><div class="neon-modal-actions"><button type="button" class="button" onclick="neonCloseModal()">Cancel</button><button class="button button-primary neon-primary">Create Group</button></div></form></div></div>';
        echo '<form id="neon-builder-save" method="post" style="display:none">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_builder"><textarea name="config_json" id="neon-config-json"></textarea></form>';
        echo '<script>window.neonFullConfig='.wp_json_encode($config).';window.neonSelectedConfigurator='.wp_json_encode($selected).';</script>';
    }

    private static function render_option_group($type,$group,$items){
        $label=ucwords(str_replace(['_','-'],' ',$group));
        echo '<section class="neon-card neon-option-group" data-group="'.esc_attr($group).'"><div class="neon-card-head"><div><h2>'.esc_html($label).'</h2><p>'.esc_html(count($items)).' options · drag to reorder</p></div><div class="neon-group-actions"><button type="button" class="button neon-primary" onclick=\'neonAddOption('.wp_json_encode($group).')\'>+ Add Option</button><button type="button" class="button-link-delete" onclick=\'neonDeleteGroup('.wp_json_encode($group).')\'>Delete Group</button></div></div><div class="neon-option-list">';
        if(empty($items))echo '<div class="neon-empty">No options yet. Add your first option.</div>';
        foreach($items as $item){
            $id=$item['id']??'';$hex=$item['hex']??'';
            echo '<div class="neon-option-row" draggable="true" data-option-id="'.esc_attr($id).'"><span class="neon-drag">⠿</span>'.($hex?'<span class="neon-swatch" style="background:'.esc_attr($hex).'"></span>':'<span class="neon-swatch placeholder">✦</span>').'<div class="neon-option-info"><strong>'.esc_html($item['name']??$id).'</strong><span><code>'.esc_html($id).'</code>'.($item['description']?' · '.esc_html($item['description']):'').'</span></div><div class="neon-option-price">'.($item['price']>0?'+ ':'').esc_html(number_format_i18n((float)$item['price'],2)).'</div><span class="neon-pill '.(!empty($item['enabled'])?'on':'').'">'.(!empty($item['enabled'])?'Enabled':'Disabled').'</span><button type="button" class="button" onclick=\'neonEditOption('.wp_json_encode($group).','.wp_json_encode($id).')\'>Edit</button><button type="button" class="button-link-delete" onclick=\'neonDeleteOption('.wp_json_encode($group).','.wp_json_encode($id).')\'>Delete</button></div>';
        }
        echo '</div></section>';
    }

    private static function render_fonts($config){
        self::card('Font Library','Manage the fonts your React builder can use. Edit metadata or replace a font file without changing its Font ID.',
            '<form id="neon-font-form" class="neon-upload" method="post" enctype="multipart/form-data">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_font"><input type="hidden" name="font_original_id" id="font_original_id"><div class="neon-font-form-title"><div><strong id="neon-font-form-heading">Add a font</strong><span id="neon-font-form-help">Upload a new TTF, OTF, WOFF or WOFF2 file.</span></div><button type="button" class="button" id="neon-font-cancel" style="display:none" onclick="neonCancelFontEdit()">Cancel edit</button></div><div class="neon-upload-grid"><label>Font file <span class="neon-optional">(optional when editing)</span><input id="neon-font-file" type="file" name="font_file" accept=".woff,.woff2,.ttf,.otf"><small>WOFF, WOFF2, TTF or OTF · max 10 MB</small></label><label>Font ID<input id="neon-font-id" name="font_id" placeholder="arista-pro" required><small>Keep this stable after the font is used in React.</small></label><label>Display name<input id="neon-font-name" name="font_name" placeholder="Arista Pro" required></label><label>Languages<input id="neon-font-languages" name="font_languages" placeholder="english,marathi"><small>Comma or newline separated IDs</small></label></div><label class="neon-check"><input type="hidden" name="font_enabled" value="0"><input id="neon-font-enabled" name="font_enabled" type="checkbox" value="1" checked> Enabled</label><button id="neon-font-submit" class="button button-primary neon-primary">Add Font</button></form>'
        );
        $rows = '';
        foreach ( (array) $config['fonts'] as $f ) {
            $id = sanitize_key( $f['id'] ?? '' );
            $rows .= '<tr><td><strong>'.esc_html($f['name']??'').'</strong><br><code>'.esc_html($id).'</code></td><td>'.esc_html(implode(', ',(array)($f['languages']??[]))).'</td><td>'.esc_html(strtoupper($f['format']??'' )).'</td><td><span class="neon-pill '.(!empty($f['enabled'])?'on':'').'">'.(!empty($f['enabled'])?'Enabled':'Disabled').'</span></td><td class="neon-table-actions"><button type="button" class="button" onclick=\'neonEditFont('.wp_json_encode($id).')\'>Edit</button> <form method="post" class="neon-inline-form" onsubmit="return confirm(\'Remove this font from the configurator?\')">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="delete_font"><input type="hidden" name="font_id" value="'.esc_attr($id).'"><button class="button-link-delete">Remove</button></form></td></tr>';
        }
        self::card('Installed fonts','The Font ID stays stable when you edit a font, so existing React configurations do not break.',
            '<div class="neon-table-wrap"><table class="neon-table"><thead><tr><th>Font</th><th>Languages</th><th>Format</th><th>Status</th><th>Actions</th></tr></thead><tbody>'.($rows ?: '<tr><td colspan="5" class="neon-empty">No fonts uploaded yet.</td></tr>').'</tbody></table></div>'
        );
        echo '<script>window.neonFonts='.wp_json_encode(array_values($config['fonts'])).';</script>';
    }

    private static function render_languages($config){
        echo '<div class="neon-section-intro"><div><h2>Languages & Typing Engines</h2><p>Keep the language definition in WordPress; the actual phonetic/transliteration engine can stay in React.</p></div><button class="button neon-primary" onclick="neonOpenLanguage()">+ Add Language</button></div>';
        echo '<div class="neon-card"><div class="neon-table-wrap"><table class="neon-table"><thead><tr><th>Language</th><th>ID</th><th>Typing engine</th><th>Status</th><th></th></tr></thead><tbody id="neon-language-body">';
        foreach($config['languages'] as $l)echo '<tr data-language-id="'.esc_attr($l['id']).'"><td><strong>'.esc_html($l['name']).'</strong></td><td><code>'.esc_html($l['id']).'</code></td><td>'.esc_html($l['typing_engine']).'</td><td><span class="neon-pill '.(!empty($l['enabled'])?'on':'').'">'.(!empty($l['enabled'])?'Enabled':'Disabled').'</span></td><td><button class="button" onclick=\'neonEditLanguage('.wp_json_encode($l['id']).')\'>Edit</button> <button class="button-link-delete" onclick=\'neonDeleteLanguage('.wp_json_encode($l['id']).')\'>Delete</button></td></tr>';
        echo '</tbody></table></div></div>';
        echo '<div class="neon-modal" id="neon-language-modal"><div class="neon-modal-box"><button class="neon-close" onclick="neonCloseModal()">×</button><h2>Language</h2><form onsubmit="return neonSaveLanguage(event)"><input type="hidden" id="lang_original_id"><label>ID (slug)<input id="lang_id" required pattern="[a-z0-9_-]+"></label><label>Display name<input id="lang_name" required></label><label>Typing engine<select id="lang_engine"><option value="latin">Latin / normal keyboard</option><option value="phonetic">Phonetic transliteration</option><option value="custom">Custom React engine</option></select></label><label class="neon-check"><input id="lang_enabled" type="checkbox" checked> Enabled</label><div class="neon-modal-actions"><button type="button" class="button" onclick="neonCloseModal()">Cancel</button><button class="button button-primary neon-primary">Save Language</button></div></form></div></div>';
        echo '<form id="neon-builder-save-lang" method="post" style="display:none">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_builder"><textarea name="config_json" id="neon-lang-config-json"></textarea></form><script>window.neonFullConfig='.wp_json_encode($config).';</script>';
    }

    private static function render_integration($config){
        $base=rest_url('neon-stack/v2/');
        self::card('React API','No project-specific domain is hard-coded into this plugin.',
            '<div class="neon-api-box"><div><strong>Custom Neon</strong><code>'.esc_html($base.'config?configurator=custom_neon').'</code><button class="button" onclick="neonCopy(this.previousElementSibling.textContent)">Copy</button></div><div><strong>Mojo Mix</strong><code>'.esc_html($base.'config?configurator=mojo_mix').'</code><button class="button" onclick="neonCopy(this.previousElementSibling.textContent)">Copy</button></div><div><strong>Health</strong><code>'.esc_html($base.'health').'</code><button class="button" onclick="neonCopy(this.previousElementSibling.textContent)">Copy</button></div></div>'
        );
        self::card('CORS / frontend origins','Add the exact origins where your React app is hosted. One per line or comma-separated. Avoid * in production.',
            '<form method="post">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_settings"><label class="neon-full-label">Allowed frontend origins<textarea name="cors_origins" rows="5" placeholder="https://designedbykirtida.in&#10;https://www.yourreactsite.com">'.esc_textarea($config['settings']['cors_origins']??'').'</textarea></label><p class="description">This only affects the plugin REST endpoints. It does not grant WordPress admin access.</p><button class="button button-primary neon-primary">Save Origins</button></form>'
        );
        self::card('WooCommerce flow','Keep payment, customer accounts, checkout and orders in WooCommerce.',
            '<ol class="neon-steps"><li><b>React</b> builds the configuration.</li><li><b>React</b> sends <code>neon_stack</code> with the WooCommerce/WooGraphQL add-to-cart request.</li><li><b>Plugin</b> sanitizes and stores the configuration in the cart.</li><li><b>WooCommerce</b> calculates the authoritative price using configured option prices.</li><li><b>Checkout</b> creates the order.</li><li><b>Plugin</b> promotes only the final sign-only screenshot to a private attachment.</li></ol>'
        );
    }

    private static function render_advanced($config){
        self::card('Global settings','Small settings that apply across all configurators.',
            '<form method="post">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_settings"><div class="neon-two"><label>Currency label<input name="currency_label" value="'.esc_attr($config['settings']['currency_label']??'₹').'"></label><label>Temporary screenshot lifetime (hours)<input type="number" name="screenshot_ttl_hours" min="1" max="48" value="'.esc_attr($config['settings']['screenshot_ttl_hours']??6).'"></label></div><p class="description">The wall image is never accepted by this plugin. Only the sign-only preview data URL is processed.</p><button class="button button-primary neon-primary">Save Settings</button></form>'
        );
        self::card('Advanced JSON','Emergency escape hatch. Normal editing should use the polished controls.',
            '<form method="post">'.wp_nonce_field('neon_stack_admin','neon_stack_nonce',true,false).'<input type="hidden" name="neon_stack_action" value="save_json_direct"><textarea name="config_json" class="neon-json-editor" spellcheck="false">'.esc_textarea(wp_json_encode($config,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)).'</textarea><p><button class="button button-secondary">Save Advanced JSON</button></p></form>'
        );
    }

    public static function admin_assets($hook_suffix){
        // admin_enqueue_scripts passes the hook suffix string, not a WP_Screen object.
        if('toplevel_page_neon-stack-configurator'!==$hook_suffix)return;
        wp_register_style('neon-stack-admin',false,[],self::VERSION);
        wp_enqueue_style('neon-stack-admin');
        $css = <<<'CSS'
/* Neon Stack Configurator Engine — premium admin UI */
.neon-wrap{max-width:1480px;margin:24px 24px 50px 0;color:#172033;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif}
.neon-wrap *{box-sizing:border-box}
.neon-hero{position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;gap:30px;padding:32px 36px;border:1px solid #27213b;border-radius:20px;background:radial-gradient(circle at 85% 20%,rgba(123,61,255,.32),transparent 32%),linear-gradient(135deg,#0b0c12 0%,#171326 58%,#24133b 100%);color:#fff;box-shadow:0 18px 50px rgba(25,15,55,.18);margin-bottom:18px}
.neon-hero:after{content:"";position:absolute;width:260px;height:260px;right:-100px;bottom:-170px;border:1px solid rgba(255,255,255,.1);border-radius:50%;box-shadow:0 0 0 40px rgba(255,255,255,.025),0 0 0 80px rgba(255,255,255,.018);pointer-events:none}
.neon-hero h1{font-size:31px;line-height:1.15;margin:6px 0 9px;color:#fff;letter-spacing:-.5px}
.neon-hero h1 span{display:inline-flex;margin-left:8px;padding:4px 8px;border:1px solid rgba(255,255,255,.15);border-radius:999px;font-size:11px;vertical-align:middle;opacity:.78;font-weight:600;letter-spacing:.2px}
.neon-kicker{font-size:10px;letter-spacing:3px;color:#d96bff;font-weight:800}
.neon-hero p{margin:0;max-width:760px;opacity:.72;font-size:14px;line-height:1.55}
.neon-health{position:relative;z-index:1;white-space:nowrap;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.055);backdrop-filter:blur(8px);padding:11px 15px;border-radius:999px;font-size:12px;font-weight:600}
.neon-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#7bea61;margin-right:8px;box-shadow:0 0 0 4px rgba(123,234,97,.12),0 0 12px rgba(123,234,97,.6)}
.neon-tabs{display:flex;align-items:center;gap:5px;flex-wrap:wrap;background:#fff;border:1px solid #e1e5ee;border-radius:15px;padding:6px;margin-bottom:22px;box-shadow:0 5px 18px rgba(24,32,51,.055)}
.neon-tabs a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 15px!important;margin:0!important;border:1px solid transparent;border-radius:10px;text-decoration:none!important;color:#626b7d!important;font-weight:650!important;font-size:13px!important;line-height:1.2!important;white-space:nowrap;transition:all .16s ease}
.neon-tabs a:hover{background:#f7f5ff!important;color:#6338ed!important;border-color:#ebe5ff!important}
.neon-tabs a.active{background:linear-gradient(135deg,#6b38ff,#7a4cff)!important;color:#fff!important;border-color:#6b38ff!important;box-shadow:0 5px 13px rgba(107,56,255,.22)}
.neon-content{display:grid;gap:18px}
.neon-card{background:#fff;border:1px solid #e1e5ee;border-radius:17px;padding:24px;box-shadow:0 5px 22px rgba(24,32,51,.045)}
.neon-card-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:18px}
.neon-card h2{margin:0;font-size:19px;line-height:1.3;letter-spacing:-.15px}
.neon-card p{margin:6px 0 0;color:#70798b;line-height:1.5}
.neon-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.neon-stat{background:linear-gradient(180deg,#fff,#fbfbfe);border:1px solid #e2e6ef;border-radius:16px;padding:18px;display:flex;align-items:center;gap:15px;box-shadow:0 3px 12px rgba(24,32,51,.025)}
.neon-stat-number{font-size:29px;font-weight:800;color:#6b38ff;line-height:1}
.neon-stat strong{display:block}.neon-stat span{display:block;color:#7a8292;font-size:12px;margin-top:5px}
.neon-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:10px;align-items:center}
.neon-flow>div{padding:18px;border:1px solid #e9ebf2;border-radius:13px;background:#fbfbfd}
.neon-flow b{display:block;color:#6b38ff;font-size:10px;letter-spacing:.7px;margin-bottom:7px}
.neon-flow strong{display:block}.neon-flow span{display:block;color:#737b8c;font-size:12px;margin-top:5px;line-height:1.45}.neon-flow i{font-style:normal;font-size:22px;color:#b4bac6}
.neon-action-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.neon-action-grid a{border:1px solid #e1e4ec;border-radius:12px;padding:15px;text-decoration:none;color:#263047;font-weight:700;background:#fafbfc;transition:.16s ease}
.neon-action-grid a:hover{border-color:#bba8ff;background:#faf8ff;color:#6338ed;transform:translateY(-1px)}
.neon-section-intro{display:flex;justify-content:space-between;align-items:center;gap:20px}
.neon-section-intro h2{margin:0;font-size:24px;letter-spacing:-.3px}.neon-section-intro p{color:#6d7587;margin:5px 0 0}
.neon-primary{background:linear-gradient(135deg,#6b38ff,#7a4cff)!important;border-color:#6b38ff!important;color:#fff!important;box-shadow:0 5px 13px rgba(107,56,255,.2)!important}
.neon-row-card{display:flex;align-items:center;gap:15px;background:#fff;border:1px solid #e2e5ed;border-radius:14px;padding:16px;margin-top:10px;transition:border-color .15s,box-shadow .15s}
.neon-row-card:hover{border-color:#cfc4f9;box-shadow:0 5px 16px rgba(24,32,51,.04)}
.neon-row-icon{width:42px;height:42px;border-radius:12px;background:#f2eaff;color:#6b38ff;display:grid;place-items:center;font-size:21px;flex:0 0 42px}
.neon-row-main{flex:1;min-width:0}.neon-row-main strong{display:block}.neon-row-main span,.neon-row-main small{display:block;color:#747c8d;margin-top:4px}
.neon-row-meta{display:flex;gap:14px;align-items:center;color:#697184;font-size:12px}.neon-row-actions{display:flex;gap:8px}
.neon-pill{display:inline-flex;align-items:center;border:1px solid #dfe2e9;border-radius:999px;padding:5px 9px;font-size:11px;color:#7a8291;background:#fafbfc}.neon-pill.on{border-color:#bce5ad;background:#f1faed;color:#3f7c2f}
.neon-option-group{padding:0;overflow:hidden}.neon-option-group .neon-card-head{padding:20px 22px;margin:0;border-bottom:1px solid #eceef3;background:linear-gradient(180deg,#fff,#fcfcfe)}
.neon-group-actions{display:flex;gap:10px;align-items:center}.neon-option-list{padding:10px 16px}
.neon-option-row{display:flex;align-items:center;gap:12px;padding:13px 8px;border-bottom:1px solid #f0f1f5;cursor:grab}.neon-option-row:last-child{border-bottom:0}.neon-option-row.dragging{opacity:.45}
.neon-drag{font-size:20px;color:#adb3bf;cursor:grab}.neon-swatch{width:27px;height:27px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 0 1px #d9dce4;flex:0 0 27px}.neon-swatch.placeholder{background:#f1f2f6;display:grid;place-items:center;color:#6b38ff;font-size:12px}
.neon-option-info{flex:1;min-width:0}.neon-option-info strong{display:block}.neon-option-info span{display:block;color:#7a8290;font-size:12px;margin-top:3px}
.neon-option-price{font-weight:800;min-width:85px;text-align:right}.neon-add-group{display:flex;align-items:center;gap:12px}.neon-add-group span{color:#7a8290;font-size:12px}
.neon-modal{display:none;position:fixed;inset:0;background:rgba(8,9,16,.62);z-index:99999;align-items:center;justify-content:center;padding:25px;backdrop-filter:blur(3px)}.neon-modal.open{display:flex}
.neon-modal-box{position:relative;width:min(560px,100%);max-height:90vh;overflow:auto;background:#fff;border:1px solid #e4e7ef;border-radius:18px;padding:25px;box-shadow:0 30px 80px rgba(0,0,0,.3)}.neon-modal-wide{width:min(680px,100%)}
.neon-close{position:absolute;right:14px;top:10px;border:0;background:transparent;font-size:28px;color:#7b8290;cursor:pointer;border-radius:8px}.neon-close:hover{background:#f3f4f8;color:#222}
.neon-modal-box h2{margin:0 0 20px}.neon-modal-box label,.neon-upload label,.neon-full-label{display:block;font-weight:700;font-size:12px;margin:0 0 14px}
.neon-modal-box input,.neon-modal-box textarea,.neon-modal-box select,.neon-upload input,.neon-full-label textarea,.neon-two input,.neon-two select{display:block;width:100%;box-sizing:border-box;margin-top:6px;border:1px solid #d9dde6;border-radius:9px;padding:9px 10px;background:#fff;min-height:40px}
.neon-modal-box input:focus,.neon-modal-box textarea:focus,.neon-modal-box select:focus,.neon-full-label textarea:focus{border-color:#7a55ef;box-shadow:0 0 0 2px rgba(107,56,255,.12);outline:none}
.neon-check{display:flex!important;gap:8px;align-items:center}.neon-check input{width:auto;margin:0;min-height:0}
.neon-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.neon-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #eee}
.neon-upload-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:15px}.neon-upload small{display:block;color:#7a8290;margin-top:5px;font-weight:400}
.neon-table-wrap{overflow:auto}.neon-table{width:100%;border-collapse:separate;border-spacing:0}.neon-table th,.neon-table td{padding:13px 10px;text-align:left;border-bottom:1px solid #eceef3}.neon-table th{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#7c8390;background:#fafbfc}
.neon-table tr:last-child td{border-bottom:0}.neon-api-box{display:grid;gap:10px}.neon-api-box>div{display:grid;grid-template-columns:130px 1fr auto;gap:12px;align-items:center;padding:12px;background:#fafbfc;border:1px solid #eceef3;border-radius:10px}.neon-api-box code{word-break:break-all}
.neon-steps{margin:0;padding-left:22px}.neon-steps li{margin:10px 0}.neon-notice{padding:13px 16px;border-radius:11px;margin-bottom:15px;background:#ecf8e9;border:1px solid #bce4ae;color:#386c2b}.neon-notice.error{background:#fff0f0;border-color:#efb7b7;color:#9a2d2d}
.neon-json-editor{width:100%;min-height:600px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}.neon-empty{text-align:center;padding:28px;color:#89909f}
.neon-mojo-banner{display:flex;align-items:flex-start;gap:14px;padding:18px 20px;border-color:#ddd4ff;background:linear-gradient(135deg,#fbf9ff,#fff)}
.neon-mojo-badge{width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;border-radius:10px;background:linear-gradient(135deg,#6b38ff,#b05cff);color:#fff;box-shadow:0 7px 18px rgba(107,56,255,.2)}
.neon-mojo-banner strong{font-size:14px}.neon-mojo-banner p{margin:4px 0 0;color:#6f7788;font-size:12px;line-height:1.55}
.neon-font-form-title{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:15px;padding-bottom:14px;border-bottom:1px solid #eceef3}
.neon-font-form-title strong{display:block;font-size:16px}.neon-font-form-title span{display:block;color:#7a8290;font-size:12px;margin-top:3px}.neon-optional{font-weight:500;color:#8b92a0}
.neon-table-actions{white-space:nowrap}.neon-inline-form{display:inline;margin:0}.neon-inline-form button{vertical-align:middle}

.neon-stack-admin-preview{margin-top:10px;padding:12px;background:#f8f8fb;border:1px solid #e0e2e8;border-radius:10px;max-width:360px}.neon-stack-preview-title{font-weight:700;margin-bottom:8px}.neon-stack-admin-preview img{display:block;max-width:100%;height:auto;background:#050509;border-radius:7px}.neon-stack-admin-preview p{margin:7px 0 0;font-size:12px}
@media(max-width:1000px){.neon-stat-grid{grid-template-columns:repeat(2,1fr)}.neon-flow{grid-template-columns:1fr}.neon-flow i{display:none}.neon-action-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:650px){.neon-wrap{margin-right:10px}.neon-hero,.neon-section-intro{align-items:flex-start;flex-direction:column}.neon-stat-grid,.neon-upload-grid,.neon-two,.neon-action-grid{grid-template-columns:1fr}.neon-tabs{overflow:auto;flex-wrap:nowrap}.neon-tabs a{flex:0 0 auto}.neon-option-row{flex-wrap:wrap}.neon-row-card{flex-wrap:wrap}.neon-row-main{min-width:200px}.neon-row-meta{width:100%}.neon-health{white-space:normal}}
CSS;
        wp_add_inline_style('neon-stack-admin',$css);
        wp_register_script('neon-stack-admin',false,['jquery'],self::VERSION,true);
        wp_enqueue_script('neon-stack-admin');
        $js = <<<'JS'
(function(){
'use strict';
var cfg=window.neonFullConfig||null;
window.neonCloseModal=function(){document.querySelectorAll('.neon-modal').forEach(function(x){x.classList.remove('open');});};
window.neonOpenConfigurator=function(){
 document.getElementById('neon-config-modal-title').textContent='Add Configurator';
 document.getElementById('cfg_original_id').value='';
 document.getElementById('cfg_id').value='';document.getElementById('cfg_id').disabled=false;
 document.getElementById('cfg_name').value='';document.getElementById('cfg_desc').value='';
 document.getElementById('cfg_product').value='0';document.getElementById('cfg_product').readOnly=false;document.getElementById('cfg_price_mode').value='product_plus_options';
 document.getElementById('cfg_enabled').checked=true;document.getElementById('neon-configurator-modal').classList.add('open');
};
window.neonEditConfigurator=function(id){
 var c=window.neonConfigurators[id]||{};document.getElementById('neon-config-modal-title').textContent='Edit Configurator';
 document.getElementById('cfg_original_id').value=id;document.getElementById('cfg_id').value=id;document.getElementById('cfg_id').disabled=true;
 document.getElementById('cfg_name').value=c.name||'';document.getElementById('cfg_desc').value=c.description||'';
 document.getElementById('cfg_product').value=c.product_id||0;document.getElementById('cfg_product').readOnly=(id==='custom_neon'||id==='mojo_mix');document.getElementById('cfg_price_mode').value=c.price_mode||'product_plus_options';document.getElementById('cfg_enabled').checked=c.enabled!==false;
 document.getElementById('neon-configurator-modal').classList.add('open');
};
window.neonSaveConfigurator=function(e){
 e.preventDefault();var id=document.getElementById('cfg_id').value.trim();var old=document.getElementById('cfg_original_id').value;
 if(!id)return false;if(!cfg)cfg=window.neonFullConfig;
 if(old&&old!==id){delete cfg.configurators[old];cfg.options[id]=cfg.options[old]||{};}else{cfg.options[id]=cfg.options[id]||{};}
 cfg.configurators[id]={name:document.getElementById('cfg_name').value.trim(),description:document.getElementById('cfg_desc').value.trim(),product_id:parseInt(document.getElementById('cfg_product').value||0,10),price_mode:document.getElementById('cfg_price_mode').value,enabled:document.getElementById('cfg_enabled').checked};
 if(!cfg.options[id])cfg.options[id]={};neonSubmitConfig();return false;
};
window.neonDeleteConfigurator=function(id){
 if(!confirm('Delete this configurator and all of its option groups?'))return;
 if(Object.keys(cfg.configurators||{}).length<=1){alert('Keep at least one configurator.');return;}
 delete cfg.configurators[id];delete cfg.options[id];neonSubmitConfig();
};
window.neonAddGroup=function(){document.getElementById('group_id').value='';document.getElementById('group_name').value='';document.getElementById('neon-group-modal').classList.add('open');};
window.neonSaveGroup=function(e){
 e.preventDefault();var id=document.getElementById('group_id').value.trim(),name=document.getElementById('group_name').value.trim();
 if(!id||!name)return false;cfg=window.neonFullConfig;var type=window.neonSelectedConfigurator;
 if(cfg.options[type][id]){alert('That group ID already exists.');return false;}
 cfg.options[type][id]=[];neonSubmitConfig();return false;
};
window.neonDeleteGroup=function(group){
 if(!confirm('Delete the entire "'+group+'" group and its options?'))return;
 delete window.neonFullConfig.options[window.neonSelectedConfigurator][group];neonSubmitConfig();
};
window.neonAddOption=function(group){
 document.getElementById('neon-option-modal-title').textContent='Add option';
 ['opt_original_id','opt_id','opt_name','opt_desc','opt_hex','opt_icon'].forEach(function(x){document.getElementById(x).value='';});
 document.getElementById('opt_price').value='0';document.getElementById('opt_enabled').checked=true;document.getElementById('opt_group').value=group;document.getElementById('opt_id').disabled=false;
 document.getElementById('neon-option-modal').classList.add('open');
};
window.neonEditOption=function(group,id){
 var arr=window.neonFullConfig.options[window.neonSelectedConfigurator][group]||[];var item=arr.find(function(x){return x.id===id;})||{};
 document.getElementById('neon-option-modal-title').textContent='Edit option';document.getElementById('opt_original_id').value=id;document.getElementById('opt_group').value=group;
 document.getElementById('opt_id').value=item.id||'';document.getElementById('opt_id').disabled=true;document.getElementById('opt_name').value=item.name||'';document.getElementById('opt_desc').value=item.description||'';
 document.getElementById('opt_price').value=item.price||0;document.getElementById('opt_hex').value=item.hex||'';document.getElementById('opt_icon').value=item.icon||item.value||'';document.getElementById('opt_enabled').checked=item.enabled!==false;
 document.getElementById('neon-option-modal').classList.add('open');
};
window.neonSaveOption=function(e){
 e.preventDefault();var group=document.getElementById('opt_group').value,id=document.getElementById('opt_id').value.trim();if(!id)return false;
 var arr=window.neonFullConfig.options[window.neonSelectedConfigurator][group]||[];var old=document.getElementById('opt_original_id').value;
 var obj={id:id,name:document.getElementById('opt_name').value.trim(),description:document.getElementById('opt_desc').value.trim(),price:parseFloat(document.getElementById('opt_price').value||0),enabled:document.getElementById('opt_enabled').checked};
 var hex=document.getElementById('opt_hex').value.trim(),icon=document.getElementById('opt_icon').value.trim();if(hex)obj.hex=hex;if(icon)obj.icon=icon;
 if(old){var ix=arr.findIndex(function(x){return x.id===old;});if(ix>=0)arr[ix]=obj;else arr.push(obj);}else{if(arr.some(function(x){return x.id===id;})){alert('That option ID already exists in this group.');return false;}arr.push(obj);}
 window.neonFullConfig.options[window.neonSelectedConfigurator][group]=arr;neonSubmitConfig();return false;
};
window.neonDeleteOption=function(group,id){if(!confirm('Delete this option?'))return;var arr=window.neonFullConfig.options[window.neonSelectedConfigurator][group]||[];window.neonFullConfig.options[window.neonSelectedConfigurator][group]=arr.filter(function(x){return x.id!==id;});neonSubmitConfig();};
window.neonEditFont=function(id){
 var fonts=window.neonFonts||[], f=fonts.find(function(x){return x.id===id;})||{};
 document.getElementById('neon-font-form-heading').textContent='Edit font';
 document.getElementById('neon-font-form-help').textContent='Update the display name, languages or replace the font file.';
 document.getElementById('font_original_id').value=f.id||id;
 document.getElementById('neon-font-id').value=f.id||id;
 document.getElementById('neon-font-id').disabled=true;
 document.getElementById('neon-font-name').value=f.name||'';
 document.getElementById('neon-font-languages').value=(f.languages||[]).join(',');
 document.getElementById('neon-font-enabled').checked=f.enabled!==false;
 document.getElementById('neon-font-file').required=false;
 document.getElementById('neon-font-submit').textContent='Save Font Changes';
 document.getElementById('neon-font-cancel').style.display='inline-flex';
 document.getElementById('neon-font-form').scrollIntoView({behavior:'smooth',block:'center'});
};
window.neonCancelFontEdit=function(){
 var form=document.getElementById('neon-font-form');
 if(form)form.reset();
 document.getElementById('font_original_id').value='';
 document.getElementById('neon-font-id').disabled=false;
 document.getElementById('neon-font-file').required=false;
 document.getElementById('neon-font-form-heading').textContent='Add a font';
 document.getElementById('neon-font-form-help').textContent='Upload a new TTF, OTF, WOFF or WOFF2 file.';
 document.getElementById('neon-font-submit').textContent='Add Font';
 document.getElementById('neon-font-cancel').style.display='none';
};
window.neonOpenLanguage=function(){document.getElementById('lang_original_id').value='';document.getElementById('lang_id').value='';document.getElementById('lang_name').value='';document.getElementById('lang_engine').value='latin';document.getElementById('lang_enabled').checked=true;document.getElementById('neon-language-modal').classList.add('open');};
window.neonEditLanguage=function(id){var l=(window.neonFullConfig.languages||[]).find(function(x){return x.id===id;})||{};document.getElementById('lang_original_id').value=id;document.getElementById('lang_id').value=l.id||'';document.getElementById('lang_name').value=l.name||'';document.getElementById('lang_engine').value=l.typing_engine||'latin';document.getElementById('lang_enabled').checked=l.enabled!==false;document.getElementById('neon-language-modal').classList.add('open');};
window.neonSaveLanguage=function(e){e.preventDefault();var old=document.getElementById('lang_original_id').value,id=document.getElementById('lang_id').value.trim();if(!id)return false;var arr=window.neonFullConfig.languages||[];var obj={id:id,name:document.getElementById('lang_name').value.trim(),typing_engine:document.getElementById('lang_engine').value,enabled:document.getElementById('lang_enabled').checked};if(old){var ix=arr.findIndex(function(x){return x.id===old;});if(ix>=0)arr[ix]=obj;}else{if(arr.some(function(x){return x.id===id;})){alert('That language ID already exists.');return false;}arr.push(obj);}window.neonFullConfig.languages=arr;neonSubmitConfig();return false;};
window.neonDeleteLanguage=function(id){if(!confirm('Delete this language?'))return;window.neonFullConfig.languages=(window.neonFullConfig.languages||[]).filter(function(x){return x.id!==id;});neonSubmitConfig();};
function neonSubmitConfig(){var form=document.getElementById('neon-builder-save')||document.getElementById('neon-builder-save-lang');if(!form){alert('Save form not available on this page.');return;}var area=form.querySelector('textarea');area.value=JSON.stringify(window.neonFullConfig);form.submit();}
window.neonCopy=function(text){navigator.clipboard&&navigator.clipboard.writeText(text).then(function(){alert('Copied.');});};
document.addEventListener('DOMContentLoaded',function(){
 document.querySelectorAll('.neon-option-list').forEach(function(list){
   var drag=null;
   list.querySelectorAll('.neon-option-row').forEach(function(row){
    row.addEventListener('dragstart',function(){drag=row;row.classList.add('dragging');});
    row.addEventListener('dragend',function(){row.classList.remove('dragging');drag=null;neonPersistOrder(list);});
    row.addEventListener('dragover',function(e){e.preventDefault();if(!drag||drag===row)return;var rect=row.getBoundingClientRect();var after=(e.clientY-rect.top)>rect.height/2;list.insertBefore(drag,after?row.nextSibling:row);});
   });
 });
});
function neonPersistOrder(list){
 if(!window.neonFullConfig)return;var type=window.neonSelectedConfigurator,group=list.closest('.neon-option-group').getAttribute('data-group');var arr=window.neonFullConfig.options[type][group]||[];var map={};arr.forEach(function(x){map[x.id]=x;});var order=[];list.querySelectorAll('.neon-option-row').forEach(function(r){order.push(r.getAttribute('data-option-id'));});window.neonFullConfig.options[type][group]=order.map(function(id){return map[id];});neonSubmitConfig();
}
window.addEventListener('click',function(e){if(e.target.classList.contains('neon-modal'))e.target.classList.remove('open');});
document.addEventListener('keydown',function(e){if(e.key==='Escape')neonCloseModal();});
})();
JS;
        wp_add_inline_script('neon-stack-admin',$js);
    }

    private static function sanitize_design( $payload ) {
        if ( is_array( $payload ) ) {
            $encoded_payload = wp_json_encode( $payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
            if ( false === $encoded_payload || strlen( $encoded_payload ) > self::MAX_DESIGN_JSON_BYTES ) return [];
        }
        $payload = self::decode_json( $payload );
        if ( ! is_array( $payload ) ) return [];

        $out = [];
        $scalar_keys = [ 'configurator', 'text', 'font', 'fontId', 'language', 'textMode', 'textColor', 'size', 'glowStyle', 'colorMode', 'alignment', 'product_id', 'screenshot_token', 'notes' ];
        foreach ( $scalar_keys as $key ) {
            if ( isset( $payload[ $key ] ) && is_scalar( $payload[ $key ] ) ) {
                $value = 'notes' === $key
                    ? sanitize_textarea_field( (string) $payload[ $key ] )
                    : sanitize_text_field( (string) $payload[ $key ] );

                if ( 'configurator' === $key || 'fontId' === $key || 'language' === $key || 'size' === $key || 'glowStyle' === $key ) {
                    $value = sanitize_key( $value );
                }
                if ( 'product_id' === $key ) $value = absint( $value );
                if ( 'screenshot_token' === $key ) $value = preg_replace( '/[^a-f0-9]/', '', strtolower( $value ) );

                $max = 'text' === $key ? 500 : ( 'notes' === $key ? 2000 : 200 );
                if ( strlen( $value ) > $max ) $value = substr( $value, 0, $max );
                if ( '' !== (string) $value ) $out[ $key ] = $value;
            }
        }

        foreach ( [ 'colors', 'shapes', 'letterColors', 'shapeColors', 'effects' ] as $key ) {
            if ( isset( $payload[ $key ] ) && is_array( $payload[ $key ] ) ) {
                $out[ $key ] = self::sanitize_nested( $payload[ $key ] );
            }
        }

        // Mojo Mix never accepts a customer-selected text colour or effect.
        // Keep the browser free to send extra UI state, but remove unsupported
        // fields before the cart/order snapshot is created.
        $sanitized_type = sanitize_key( (string) ( $out['configurator'] ?? '' ) );
        if ( 'mojo_mix' === $sanitized_type ) {
            unset( $out['colors'], $out['textColor'], $out['colorMode'], $out['glowStyle'], $out['effects'] );
        }

        foreach ( [ 'backboard', 'hardware', 'sizeOption' ] as $key ) {
            if ( isset( $payload[ $key ] ) && ( is_scalar( $payload[ $key ] ) || is_array( $payload[ $key ] ) ) ) {
                $out[ $key ] = self::sanitize_nested( $payload[ $key ] );
            }
        }

        if ( isset( $payload['screenshot'] ) && is_string( $payload['screenshot'] ) ) {
            $s = trim( $payload['screenshot'] );
            if ( strlen( $s ) <= 2100000 && preg_match( '#^data:image/(png|jpeg|jpg);base64,#i', $s ) ) {
                $out['screenshot'] = $s;
            }
        }

        return $out;
    }

private static function sanitize_nested($v, $depth = 0, &$nodes = null){
        if ( null === $nodes ) $nodes = 0;
        $nodes++;
        if ( $nodes > self::MAX_DESIGN_NODES || $depth > self::MAX_NESTED_DEPTH ) return null;
        if ( is_array($v) ) {
            $out = [];
            foreach ( array_slice($v, 0, 50, true) as $k => $x ) {
                $key = is_int($k) ? $k : sanitize_key((string)$k);
                $clean = self::sanitize_nested($x, $depth + 1, $nodes);
                if ( null !== $clean ) $out[$key] = $clean;
                if ( $nodes > self::MAX_DESIGN_NODES ) break;
            }
            return $out;
        }
        if ( is_bool($v) || is_int($v) || is_float($v) ) return $v;
        return sanitize_text_field((string)$v);
    }
    private static function decode_json($value){
        if ( is_array($value) ) return $value;
        if ( ! is_string($value) || '' === trim($value) ) return null;
        if ( strlen($value) > self::MAX_DESIGN_JSON_BYTES ) return null;
        $d = json_decode($value, true);
        return ( json_last_error() === JSON_ERROR_NONE && is_array($d) ) ? $d : null;
    }
    private static function summarize_array($v){if(!is_array($v))return self::summarize_value($v);$parts=[];foreach($v as $k=>$x){if(is_array($x)){$parts[]=self::summarize_value($x);}elseif(is_scalar($x))$parts[]=(is_int($k)?'':$k.': ').(string)$x;}return implode(', ',$parts);}
    private static function summarize_value($v){if(is_array($v)){if(isset($v['name']))return (string)$v['name'];if(isset($v['id']))return (string)$v['id'];return self::summarize_array($v);}return is_scalar($v)?(string)$v:'';}
}
register_activation_hook(__FILE__, ['Neon_Stack_Configurator','activate']);
register_deactivation_hook(__FILE__, ['Neon_Stack_Configurator','deactivate']);
add_action('plugins_loaded',function(){
    if ( class_exists('WooCommerce') ) {
        Neon_Stack_Configurator::init();
    }
});
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
