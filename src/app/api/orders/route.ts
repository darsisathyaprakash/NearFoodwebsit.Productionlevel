import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { createOrderSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';
import { MenuItem } from '@/types/types';

export const dynamic = 'force-dynamic';

// Helper function to safely get menu item data
function getMenuItemData(menuItem: MenuItem | MenuItem[] | null | undefined): MenuItem {
    if (Array.isArray(menuItem)) {
        return menuItem[0] || {} as MenuItem;
    }
    return menuItem || {} as MenuItem;
}

export async function POST(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        // Validate request body
        const body = await request.json();
        const validated = createOrderSchema.parse(body);
        const { delivery_address, delivery_phone, delivery_name } = validated;

        // 1. Fetch Cart with Items and Prices
        const { data: cart, error: cartError } = await insforge.database
            .from('carts')
            .select('*, cart_items(*, menu_items(*))')
            .eq('user_id', user.id)
            .single();

        if (cartError || !cart || !cart.cart_items || cart.cart_items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const cartItems = cart.cart_items;

        // 2. Calculate Total and validate items
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
            const menuItem = getMenuItemData(item.menu_items);
            const price = menuItem?.price;
            const name = menuItem?.name;
            const id = menuItem?.id;

            if (!price || !name || !id) {
                console.error('Invalid menu item data:', item);
                return NextResponse.json(
                    { error: 'Invalid cart data: missing item information' },
                    { status: 400 }
                );
            }

            const quantity = item.quantity;
            totalAmount += price * quantity;

            orderItemsData.push({
                menu_item_id: id,
                name: name,
                price: price,
                quantity: quantity,
            });
        }

        if (orderItemsData.length === 0) {
            return NextResponse.json({ error: 'No valid items in cart' }, { status: 400 });
        }

        // Add delivery fee and tax
        const deliveryFee = 2.99;
        const tax = totalAmount * 0.08;
        const finalTotal = Math.round((totalAmount + deliveryFee + tax) * 100) / 100;

        // 3. Create Order
        const { data: order, error: orderError } = await insforge.database
            .from('orders')
            .insert({
                user_id: user.id,
                restaurant_id: cart.restaurant_id,
                total_amount: finalTotal,
                status: 'PLACED',
                delivery_address: delivery_address,
                delivery_phone: delivery_phone,
                delivery_name: delivery_name,
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // 4. Create Order Items
        const itemsToInsert = orderItemsData.map((item) => ({
            order_id: order.id,
            ...item,
        }));

        const { error: itemsError } = await insforge.database
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            // Attempt to rollback order
            await insforge.database.from('orders').delete().eq('id', order.id);
            return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
        }

        // 5. Clear Cart
        const { error: deleteError } = await insforge.database
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        if (deleteError) {
            console.error('Cart items delete error:', deleteError);
            // Non-critical error, order is already created
        }

        const { error: updateError } = await insforge.database
            .from('carts')
            .update({ restaurant_id: null })
            .eq('id', cart.id);

        if (updateError) {
            console.error('Cart update error:', updateError);
            // Non-critical error, order is already created
        }

        return NextResponse.json({ success: true, orderId: order.id });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        const { data: orders, error } = await insforge.database
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Orders fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json(orders || []);
    } catch (error) {
        console.error('Orders GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
