'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { StatusBadge, PaymentBadge } from '@/components/admin/StatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Trash2,
    X,
    Filter,
} from 'lucide-react';
import type { Order } from '@/types/types';

const ORDER_STATUSES = ['ALL', 'PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

function OrdersContent() {
    const { adminUser, loading: authLoading, adminFetch } = useAdminAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
            });
            const res = await adminFetch(`/api/admin/orders?${params}`);
            if (!res.ok) {
                throw new Error("API request failed");
            }
            const json = await res.json();
            setOrders(json?.data || []);
            setTotalPages(json?.totalPages || 1);
            setTotal(json?.total || 0);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, adminFetch]);

    useEffect(() => {
        if (!adminUser) return;
        fetchOrders();
    }, [adminUser, fetchOrders]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const res = await adminFetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setAlert({ type: 'success', message: 'Order status updated successfully' });
                fetchOrders();
            } else {
                setAlert({ type: 'error', message: 'Failed to update order status' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        }
        setTimeout(() => setAlert(null), 3000);
    };

    const handleDelete = async () => {
        if (!deleteOrderId) return;
        setDeleting(true);
        try {
            const res = await adminFetch(`/api/admin/orders/${deleteOrderId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setAlert({ type: 'success', message: 'Order deleted successfully' });
                fetchOrders();
            } else {
                setAlert({ type: 'error', message: 'Failed to delete order' });
            }
        } catch {
            setAlert({ type: 'error', message: 'An error occurred' });
        } finally {
            setDeleting(false);
            setDeleteOrderId(null);
            setTimeout(() => setAlert(null), 3000);
        }
    };

    const handleExport = async () => {
        try {
            const res = await adminFetch('/api/admin/orders/export');
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch {
            setAlert({ type: 'error', message: 'Export failed' });
            setTimeout(() => setAlert(null), 3000);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar />
                <main className="flex-1 p-6 overflow-auto">
                    {/* Alert */}
                    {alert && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium animate-slide-down ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {alert.message}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                            <p className="text-gray-500 text-sm mt-1">{total} total orders</p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        {ORDER_STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setPage(1); }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${statusFilter === status
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'ALL' ? 'All' : status.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td colSpan={7} className="px-4 py-4">
                                                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (orders || []).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-400">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        (orders || []).map((order) => (
                                            <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                                                    #{order.id.slice(0, 8)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900 text-sm">{order.delivery_name || '—'}</p>
                                                    <p className="text-xs text-gray-500">{order.delivery_phone || ''}</p>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-900">
                                                    ₹{Number(order.total_amount).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                                    >
                                                        {ORDER_STATUSES.filter(s => s !== 'ALL').map((s) => (
                                                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <PaymentBadge status={order.payment_status || 'pending'} />
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteOrderId(order.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete order"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 animate-scale-in">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Order #{selectedOrder.id.slice(0, 8)}
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Payment</p>
                                    <PaymentBadge status={selectedOrder.payment_status || 'pending'} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-semibold">₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Date</p>
                                    <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-500 mb-1">Delivery Info</p>
                                <p className="text-sm font-medium">{selectedOrder.delivery_name || '—'}</p>
                                <p className="text-sm text-gray-600">{selectedOrder.delivery_phone || ''}</p>
                                <p className="text-sm text-gray-600">{selectedOrder.delivery_address || ''}</p>
                            </div>

                            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs text-gray-500 mb-2">Items</p>
                                    <div className="space-y-2">
                                        {selectedOrder.order_items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span>{item.name} × {item.quantity}</span>
                                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteOrderId}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteOrderId(null)}
            />
        </div>
    );
}

export default function AdminOrdersPage() {
    return (
        <AdminAuthProvider>
            <OrdersContent />
        </AdminAuthProvider>
    );
}
