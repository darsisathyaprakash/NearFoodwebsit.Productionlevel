// Admin dashboard stats API
// GET: Fetch overview statistics for the admin dashboard
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

        // Fetch all stats in parallel
        const [ordersRes, menuItemsRes, usersRes] = await Promise.all([
            adminClient.database.from('orders').select('id, total_amount, status, created_at'),
            adminClient.database.from('menu_items').select('id', { count: 'exact' }),
            adminClient.database.from('user_profiles').select('id', { count: 'exact' }),
        ]);

        const orders = ordersRes.data || [];
        const totalMenuItems = menuItemsRes.count ?? 0;
        const totalUsers = usersRes.count ?? 0;

        // Calculate total revenue (sum of all completed/delivered orders)
        const totalRevenue = orders.reduce((sum, order) => {
            return sum + (Number(order.total_amount) || 0);
        }, 0);

        // Recent 5 orders
        const recentOrders = orders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        // Revenue by day (last 7 days)
        const now = new Date();
        const revenueByDay: { date: string; revenue: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayRevenue = orders
                .filter((o) => o.created_at && o.created_at.startsWith(dateStr))
                .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
            revenueByDay.push({ date: dateStr, revenue: Math.round(dayRevenue * 100) / 100 });
        }

        return NextResponse.json({
            success: true,
            data: {
                totalOrders: orders.length,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalMenuItems,
                totalUsers,
                recentOrders,
                revenueByDay,
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
