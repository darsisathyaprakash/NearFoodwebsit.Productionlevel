// Admin orders API
// GET: Fetch all orders with pagination and filtering
// PATCH: Update order status
// DELETE: Delete an order
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
import { updateOrderStatusSchema } from '@/utils/admin-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = adminClient.database
            .from('orders')
            .select('*, order_items(*)', { count: 'exact' });

        // Apply status filter
        if (status && status !== 'ALL') {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Admin orders fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({
            orders: data || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (error) {
        console.error('Admin orders GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
