'use client';

import { useEffect, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { StatsCard } from '@/components/admin/StatsCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ShoppingCart, DollarSign, UtensilsCrossed, Users } from 'lucide-react';
import type { AdminStats } from '@/types/types';

function DashboardContent() {
    const { adminUser, loading: authLoading, adminFetch } = useAdminAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adminUser) return;

        const fetchStats = async () => {
            try {
                const res = await adminFetch('/api/admin/stats');
                if (!res.ok) {
                    throw new Error("API request failed");
                }
                const json = await res.json();
                setStats(json?.data || null);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [adminUser, adminFetch]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar />
                <main className="flex-1 p-6 overflow-auto">
                    {/* Welcome header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {adminUser?.name || 'Admin'} 👋
                        </h1>
                        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                                    <div className="h-8 bg-gray-200 rounded w-16" />
                                </div>
                            ))}
                        </div>
                    ) : stats ? (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatsCard
                                    title="Total Orders"
                                    value={stats.totalOrders}
                                    icon={<ShoppingCart className="h-6 w-6" />}
                                    color="orange"
                                />
                                <StatsCard
                                    title="Total Revenue"
                                    value={`₹${stats.totalRevenue.toFixed(2)}`}
                                    icon={<DollarSign className="h-6 w-6" />}
                                    color="green"
                                />
                                <StatsCard
                                    title="Menu Items"
                                    value={stats.totalMenuItems}
                                    icon={<UtensilsCrossed className="h-6 w-6" />}
                                    color="blue"
                                />
                                <StatsCard
                                    title="Total Users"
                                    value={stats.totalUsers}
                                    icon={<Users className="h-6 w-6" />}
                                    color="purple"
                                />
                            </div>

                            {/* Revenue Chart + Recent Orders */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <RevenueChart data={stats.revenueByDay} />

                                {/* Recent Orders */}
                                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                                    <div className="space-y-3">
                                        {(stats.recentOrders || []).length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
                                        ) : (
                                            (stats.recentOrders || []).map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            #{order.id.slice(0, 8)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <StatusBadge status={order.status} />
                                                        <span className="text-sm font-semibold text-gray-700">
                                                            ₹{Number(order.total_amount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-12">Failed to load dashboard data</p>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <AdminAuthProvider>
            <DashboardContent />
        </AdminAuthProvider>
    );
}
