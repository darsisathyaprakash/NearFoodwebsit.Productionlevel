'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Order } from '@/types/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/utils/formatting';
import { useToast } from '@/components/ui/Toast';
import { insforge } from '@/lib/insforge';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showToast } = useToast();

    const fetchOrders = async () => {
        try {
            // Use client-side SDK directly
            const { data, error } = await insforge.database
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setOrders((data as Order[]) || []);
        } catch (error) {
            console.error(error);
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Orders</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PLACED':
                return 'bg-blue-100 text-blue-700';
            case 'PREPARING':
                return 'bg-yellow-100 text-yellow-700';
            case 'OUT_FOR_DELIVERY':
                return 'bg-purple-100 text-purple-700';
            case 'DELIVERED':
                return 'bg-green-100 text-green-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Orders</h1>

            {orders.length === 0 ? (
                <EmptyState
                    icon={<Package className="w-16 h-16" />}
                    title="No orders yet"
                    description="Start your food journey by ordering from our amazing restaurants"
                    actionLabel="Hungry? Order Now"
                    actionHref="/restaurants"
                />
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-3 border-b">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        Order #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-400">{formatDateTime(order.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3 mb-4">
                                    {order.order_items?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-gray-700 font-medium">
                                                {item.quantity}x {item.name}
                                            </span>
                                            <span className="text-gray-900 font-bold">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                {order.delivery_address && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                            Delivery Address
                                        </p>
                                        <p className="text-sm text-gray-700">{order.delivery_address}</p>
                                    </div>
                                )}
                                <div className="pt-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        {formatPrice(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
