import { dbClient } from './db-client';

const TABLES_TO_CHECK = [
    'restaurants',
    'menu_categories',
    'menu_items',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'user_addresses'
];

async function checkTables() {
    console.log('Checking database tables and row counts...');

    let restaurantsCount = 0;

    for (const table of TABLES_TO_CHECK) {
        try {
            const { count, error } = await dbClient.database.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`[MISSING/ERROR] ${table}:`, error.message);
            } else {
                console.log(`[OK] ${table} exists. Rows: ${count}`);
                if (table === 'restaurants') restaurantsCount = count || 0;
            }
        } catch (err) {
            console.error(`[ERROR] calling client for ${table}:`, err);
        }
    }

    console.log('\nChecking for specific migration columns...');

    // Check orders for payment columns from add_payment_columns.sql
    try {
        const { error } = await dbClient.database.from('orders').select('payment_id, payment_status, delivery_fee, tax_amount').limit(1);
        if (error) {
            console.error('[FAIL] Orders table missing payment columns:', error.message);
        } else {
            console.log('[OK] Orders table has payment columns.');
        }
    } catch (e) {
        console.error('[FAIL] Error checking orders columns:', e);
    }

    // Check orders for status tracking columns from add_addresses_and_status_tracking.sql
    try {
        const { error } = await dbClient.database.from('orders').select('placed_at, preparing_at, out_for_delivery_at, delivered_at').limit(1);
        if (error) {
            console.error('[FAIL] Orders table missing status tracking columns:', error.message);
        } else {
            console.log('[OK] Orders table has status tracking columns.');
        }
    } catch (e) {
        console.error('[FAIL] Error checking orders status columns:', e);
    }

    // Check user_addresses table columns
    try {
        const { error } = await dbClient.database.from('user_addresses').select('id, user_id, address_line1, is_default').limit(1);
        if (error) {
            console.error('[FAIL] user_addresses table missing standard columns:', error.message);
        } else {
            console.log('[OK] user_addresses table columns verified.');
        }
    } catch (e) {
        console.error('[FAIL] Error checking user_addresses columns:', e);
    }

    if (restaurantsCount === 0) {
        console.log('\n[WARNING] Restaurants table is empty. Seeding may be required.');
    }
}

checkTables();
