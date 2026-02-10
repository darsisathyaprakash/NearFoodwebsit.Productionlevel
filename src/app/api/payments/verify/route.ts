import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { verifyPaymentSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

// Stripe secret key (optional — if not set, dummy mode skips verification)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        // Validate request body
        const body = await request.json();
        const validated = verifyPaymentSchema.parse(body);
        const { session_id, cart_id, amount } = validated;

        // ─── Verify payment ───
        let paymentId = session_id;

        if (session_id.startsWith('dummy_')) {
            // Dummy mode — skip Stripe verification, treat as paid
            paymentId = `dummy_pay_${Date.now()}`;
        } else if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_dummy') {
            // Real Stripe mode — verify the checkout session
            const Stripe = (await import('stripe')).default;
            const stripe = new Stripe(STRIPE_SECRET_KEY);

            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (session.payment_status !== 'paid') {
                return NextResponse.json(
                    { error: 'Payment not completed' },
                    { status: 400 }
                );
            }

            paymentId = session.payment_intent as string || session_id;
        }

        // ─── Create order in database ───

        // Get cart items with restaurant info
        const { data: cartItems, error: cartError } = await insforge.database
            .from('cart_items')
            .select('*, menu_items(*, restaurants!inner(id, name))')
            .eq('cart_id', cart_id);

        if (cartError) {
            console.error('Cart items fetch error:', cartError);
            return NextResponse.json(
                { error: 'Failed to retrieve cart items' },
                { status: 500 }
            );
        }

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Validate all items are from the same restaurant
        const restaurantIds = new Set(
            cartItems
                .map(item => item.menu_items?.restaurants?.id)
                .filter(Boolean)
        );

        if (restaurantIds.size === 0) {
            return NextResponse.json(
                { error: 'Invalid cart data: missing restaurant information' },
                { status: 400 }
            );
        }

        if (restaurantIds.size > 1) {
            return NextResponse.json(
                { error: 'Cart contains items from multiple restaurants' },
                { status: 400 }
            );
        }

        const restaurant_id = [...restaurantIds][0];

        // Calculate total from cart items
        const calculatedTotal = cartItems.reduce((sum, item) => {
            const price = item.menu_items?.price || 0;
            return sum + (price * item.quantity);
        }, 0);

        // Verify amount matches (with small tolerance for rounding)
        const amountDifference = Math.abs(calculatedTotal - amount);
        if (amountDifference > 1) {
            console.error('Amount mismatch:', { calculatedTotal, providedAmount: amount });
            return NextResponse.json(
                { error: 'Payment amount does not match cart total' },
                { status: 400 }
            );
        }

        // Create DB order
        const { data: order, error: orderError } = await insforge.database
            .from('orders')
            .insert({
                user_id: user.id,
                restaurant_id: restaurant_id,
                total_amount: amount,
                status: 'PLACED',
                payment_id: paymentId,
                payment_status: 'paid',
                delivery_address: 'User Address (To be updated)',
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            );
        }

        // Create order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            name: item.menu_items?.name || 'Unknown Item',
            price: item.menu_items?.price || 0,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await insforge.database
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            // Attempt to rollback order
            await insforge.database.from('orders').delete().eq('id', order.id);
            return NextResponse.json(
                { error: 'Failed to create order items' },
                { status: 500 }
            );
        }

        // Clear cart (delete items, keep cart record)
        const { error: clearError } = await insforge.database
            .from('cart_items')
            .delete()
            .eq('cart_id', cart_id);

        if (clearError) {
            console.error('Cart clear error:', clearError);
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
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
