// Admin orders CSV export API
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: orders, error } = await adminClient.database
            .from('orders')
            .select('*, order_items(name, price, quantity)')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        // Build CSV
        const headers = [
            'Order ID', 'Status', 'Total Amount', 'Delivery Name', 'Delivery Phone',
            'Delivery Address', 'Payment Status', 'Items', 'Created At'
        ];

        const rows = (orders || []).map((order) => {
            const items = (order.order_items || [])
                .map((item: { name: string; quantity: number; price: number }) =>
                    `${item.name} x${item.quantity} (₹${item.price})`
                )
                .join('; ');

            return [
                order.id,
                order.status,
                order.total_amount,
                `"${(order.delivery_name || '').replace(/"/g, '""')}"`,
                order.delivery_phone || '',
                `"${(order.delivery_address || '').replace(/"/g, '""')}"`,
                order.payment_status || '',
                `"${items.replace(/"/g, '""')}"`,
                order.created_at,
            ].join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Orders export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
