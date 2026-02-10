import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';

export const dynamic = 'force-dynamic';

// GET - Fetch a single order
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const orderId = id;

        const { data: order, error } = await insforge.database
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Order fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
        }

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

// PATCH - Update order status (admin only or for status updates)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const orderId = id;
        const body = await request.json();

        // Verify the order belongs to the user
        const { data: existingOrder, error: fetchError } = await insforge.database
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Only allow updating specific fields
        const allowedUpdates: { [key: string]: any } = {};
        if (body.status !== undefined) {
            allowedUpdates.status = body.status;
        }
        if (body.payment_status !== undefined) {
            allowedUpdates.payment_status = body.payment_status;
        }
        if (body.delivery_address !== undefined) {
            allowedUpdates.delivery_address = body.delivery_address;
        }
        if (body.delivery_phone !== undefined) {
            allowedUpdates.delivery_phone = body.delivery_phone;
        }
        if (body.delivery_name !== undefined) {
            allowedUpdates.delivery_name = body.delivery_name;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data: updatedOrder, error: updateError } = await insforge.database
            .from('orders')
            .update(allowedUpdates)
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) {
            console.error('Order update error:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Order PATCH error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
