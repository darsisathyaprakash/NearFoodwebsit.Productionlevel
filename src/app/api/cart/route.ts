import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { addToCartSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        const { data: cart, error } = await insforge.database
            .from('carts')
            .select('*, cart_items(*, menu_items(name, price, image_url))')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "Row not found"
            console.error('Cart fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
        }

        return NextResponse.json(cart || { items: [] });
    } catch (error) {
        console.error('Cart GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const validated = addToCartSchema.parse(body);
        const { restaurantId, menuItemId, quantity } = validated;

        // 1. Get or Create Cart
        let { data: cart, error: cartError } = await insforge.database
            .from('carts')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (cartError && cartError.code !== 'PGRST116') {
            console.error('Cart fetch error:', cartError);
            return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
        }

        if (!cart) {
            const { data: newCart, error: createError } = await insforge.database
                .from('carts')
                .insert({ user_id: user.id, restaurant_id: restaurantId })
                .select()
                .single();

            if (createError) {
                console.error('Cart creation error:', createError);
                return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
            }
            cart = newCart;
        } else {
            // Check restaurant mismatch
            if (cart.restaurant_id !== restaurantId) {
                // Clear items if switching restaurants
                const { error: deleteError } = await insforge.database
                    .from('cart_items')
                    .delete()
                    .eq('cart_id', cart.id);

                if (deleteError) {
                    console.error('Cart items delete error:', deleteError);
                    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
                }

                const { error: updateError } = await insforge.database
                    .from('carts')
                    .update({ restaurant_id: restaurantId })
                    .eq('id', cart.id);

                if (updateError) {
                    console.error('Cart update error:', updateError);
                    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
                }
            }
        }

        // 2. Add/Update Item
        const { data: existingItem, error: existingError } = await insforge.database
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('menu_item_id', menuItemId)
            .single();

        if (existingError && existingError.code !== 'PGRST116') {
            console.error('Existing item fetch error:', existingError);
            return NextResponse.json({ error: 'Failed to check existing item' }, { status: 500 });
        }

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > 99) {
                return NextResponse.json({ error: 'Maximum quantity exceeded' }, { status: 400 });
            }

            const { error: updateError } = await insforge.database
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);

            if (updateError) {
                console.error('Cart item update error:', updateError);
                return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
            }
        } else {
            const { error: insertError } = await insforge.database
                .from('cart_items')
                .insert({ cart_id: cart.id, menu_item_id: menuItemId, quantity });

            if (insertError) {
                console.error('Cart item insert error:', insertError);
                return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Cart POST error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        const { data: cart, error: cartError } = await insforge.database
            .from('carts')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (cartError && cartError.code !== 'PGRST116') {
            console.error('Cart fetch error:', cartError);
            return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
        }

        if (cart) {
            const { error: deleteError } = await insforge.database
                .from('cart_items')
                .delete()
                .eq('cart_id', cart.id);

            if (deleteError) {
                console.error('Cart items delete error:', deleteError);
                return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cart DELETE error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
