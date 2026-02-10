'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { Cart, CartItem } from '@/types/types';
import { CartItemSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { AddressForm, UserAddress } from '@/components/ui/AddressForm';
import { ShoppingCart, Trash2, MapPin } from 'lucide-react';
import { formatPrice } from '@/utils/formatting';
import { insforge } from '@/lib/insforge';
import { PaymentButton } from '@/components/PaymentButton';

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [showClearModal, setShowClearModal] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
    const [processingOrder, setProcessingOrder] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const fetchCart = async () => {
        try {
            // Use client-side SDK directly
            const { data, error } = await insforge.database
                .from('carts')
                .select('*, cart_items(*, menu_items(name, price, image_url))')
                .eq('user_id', user!.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            setCart(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load cart', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, router]);

    const clearCart = async () => {
        if (!cart) return;

        try {
            await insforge.database.from('cart_items').delete().eq('cart_id', cart.id);
            showToast('Cart cleared', 'success');
            fetchCart();
        } catch (error) {
            showToast('Failed to clear cart', 'error');
        } finally {
            setShowClearModal(false);
        }
    };

    const handleAddressSelect = (address: UserAddress) => {
        setSelectedAddress(address);
        showToast('Address selected successfully', 'success');
    };

    if (authLoading || loading) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden p-6 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <CartItemSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const items = (cart?.cart_items || []) as CartItem[];
    const total = items.reduce((acc: number, item: CartItem) => {
        const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
        const price = menuItem?.price || 0;
        return acc + Number(price) * item.quantity;
    }, 0);

    const deliveryFee = items.length > 0 ? 2.99 : 0;
    const tax = total * 0.08;
    const finalTotal = total + deliveryFee + tax;

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Cart</h1>

            {items.length === 0 ? (
                <EmptyState
                    icon={<ShoppingCart className="w-16 h-16" />}
                    title="Your cart is empty"
                    description="Add some delicious items from our restaurants"
                    actionLabel="Browse Restaurants"
                    actionHref="/restaurants"
                />
            ) : (
                <div className="space-y-6">
                    {/* Address Selection */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                    Delivery Address
                                </h2>
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                                >
                                    {selectedAddress ? 'Change' : 'Add Address'}
                                </button>
                            </div>

                            {selectedAddress ? (
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedAddress.address_line1}</p>
                                            {selectedAddress.address_line2 && (
                                                <p className="text-gray-600">{selectedAddress.address_line2}</p>
                                            )}
                                            <p className="text-gray-600">
                                                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                                            </p>
                                            <p className="text-gray-600">{selectedAddress.country}</p>
                                            <p className="text-gray-600">📞 {selectedAddress.phone}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAddressForm(true)}
                                            className="text-orange-500 hover:text-orange-600"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAddressForm(true)}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors"
                                >
                                    + Add Delivery Address
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-6">
                            {items.map((item: CartItem) => {
                                const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
                                return (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center py-4 border-b last:border-0"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded font-bold">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{menuItem?.name}</h3>
                                                <p className="text-sm text-gray-500">{formatPrice(menuItem?.price || 0)}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900">
                                            {formatPrice((menuItem?.price || 0) * item.quantity)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gray-50 p-6 border-t space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Fee</span>
                                <span>{formatPrice(deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax (8%)</span>
                                <span>{formatPrice(tax)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-center text-xl font-bold text-gray-900">
                                <span>Total to Pay</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>

                            <div className="flex gap-4 pt-4 flex-col sm:flex-row">
                                <button
                                    onClick={() => setShowClearModal(true)}
                                    disabled={processingOrder}
                                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </button>
                                <div className="flex-grow">
                                    <PaymentButton
                                        amount={finalTotal}
                                        cartId={cart?.id || ''}
                                        userEmail={user?.email}
                                        userName={user?.profile?.name}
                                        selectedAddress={selectedAddress}
                                        onSuccess={(orderId: string) => {
                                            router.push('/orders');
                                        }}
                                        disabled={processingOrder || !selectedAddress}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={clearCart}
                title="Clear Cart?"
                message="Are you sure you want to remove all items from your cart?"
                confirmText="Clear Cart"
                cancelText="Cancel"
                variant="danger"
            />

            <AddressForm
                isOpen={showAddressForm}
                onClose={() => setShowAddressForm(false)}
                onSelectAddress={handleAddressSelect}
            />
        </div>
    );
}
