// Admin individual order API
// PATCH: Update order status
// DELETE: Delete an order
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
import { updateOrderStatusSchema } from '@/utils/admin-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateOrderStatusSchema.parse(body);

        // Build update object with status timestamps
        const updateData: Record<string, unknown> = {
            status: validated.status,
            updated_at: new Date().toISOString(),
        };

        // Set status-specific timestamps
        const now = new Date().toISOString();
        switch (validated.status) {
            case 'PLACED':
                updateData.placed_at = now;
                break;
            case 'PREPARING':
                updateData.preparing_at = now;
                break;
            case 'OUT_FOR_DELIVERY':
                updateData.out_for_delivery_at = now;
                break;
            case 'DELIVERED':
                updateData.delivered_at = now;
                updateData.actual_delivery_time = now;
                break;
            case 'CANCELLED':
                updateData.cancelled_at = now;
                break;
        }

        const { data, error } = await adminClient.database
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Order status update error:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        // Audit log
        await logAdminAction(auth.userId!, 'updated_order_status', 'order', id, {
            new_status: validated.status,
        });

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Order PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete order items first
        await adminClient.database.from('order_items').delete().eq('order_id', id);

        // Delete order
        const { error } = await adminClient.database
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Order delete error:', error);
            return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
        }

        // Audit log
        await logAdminAction(auth.userId!, 'deleted_order', 'order', id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Order DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
