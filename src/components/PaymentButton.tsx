'use client';

import { useState } from 'react';
import { useToast } from './ui/Toast';
import { PaymentSuccessModal } from './ui/PaymentSuccessModal';
import { UserAddress } from './ui/AddressForm';
import { Loader2, CreditCard, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { insforge } from '@/lib/insforge';

interface PaymentButtonProps {
    amount: number;
    cartId: string;
    onSuccess: (orderId: string) => void;
    userEmail?: string;
    userName?: string;
    selectedAddress?: UserAddress | null;
    disabled?: boolean;
}

type PaymentState = 'idle' | 'validating' | 'processing' | 'success' | 'error';

export function PaymentButton({
    amount,
    cartId,
    onSuccess,
    userEmail,
    userName,
    selectedAddress,
    disabled,
}: PaymentButtonProps) {
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [progress, setProgress] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const { showToast } = useToast();

    const handlePayment = async () => {
        setPaymentState('validating');
        setProgress(10);

        try {
            // 1. Verify user is authenticated (client-side)
            const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

            if (authError || !sessionData?.session?.user) {
                throw new Error('Please log in to continue with payment');
            }

            const user = sessionData.session.user;
            setProgress(20);

            // 2. Simulate payment processing with progress updates
            setPaymentState('processing');

            // Simulate processing steps
            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(40);
            showToast('🔒 Securing your payment...', 'info', 8000);

            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(60);
            showToast('💳 Processing payment...', 'info', 8000);

            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(80);

            const paymentId = `stripe_pay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

            // 3. Get cart items with restaurant info
            const { data: cartItems, error: cartError } = await insforge.database
                .from('cart_items')
                .select('*, menu_items(*, restaurants!inner(id, name))')
                .eq('cart_id', cartId);

            if (cartError) {
                console.error('Cart items fetch error:', cartError);
                throw new Error('Failed to retrieve cart items');
            }

            if (!cartItems || cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            setProgress(90);

            // 4. Get restaurant ID (all items should be from same restaurant)
            const restaurantIds = new Set(
                cartItems
                    .map((item) => item.menu_items?.restaurants?.id)
                    .filter((id): id is string => Boolean(id))
            );

            if (restaurantIds.size === 0) {
                throw new Error('Invalid cart data: missing restaurant information');
            }

            if (restaurantIds.size > 1) {
                throw new Error('Cart contains items from multiple restaurants');
            }

            const restaurant_id = [...restaurantIds][0];

            // 5. Create order in database
            let order;
            let orderError;

            // Build delivery address string from selected address
            const deliveryAddress = selectedAddress
                ? `${selectedAddress.address_line1}${selectedAddress.address_line2 ? ', ' + selectedAddress.address_line2 : ''}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code}, ${selectedAddress.country}`
                : 'User Address (To be updated)';

            // Calculate delivery fee and tax from cart items (amount passed is subtotal)
            const deliveryFee = 2.99;
            const tax = amount * 0.08;
            const finalTotal = Math.round((amount + deliveryFee + tax) * 100) / 100;

            // Prepare order items data
            const orderItemsData = cartItems.map((item) => ({
                menu_item_id: item.menu_item_id,
                name: item.menu_items?.name || 'Unknown Item',
                price: item.menu_items?.price || 0,
                quantity: item.quantity,
            }));

            // Try inserting with full schema (including payment_id, etc.)
            const fullOrderPayload = {
                user_id: user.id,
                restaurant_id: restaurant_id,
                total_amount: finalTotal,
                status: 'PLACED',
                payment_id: paymentId,
                payment_status: 'paid',
                delivery_address: deliveryAddress,
                delivery_phone: selectedAddress?.phone || '',
                delivery_name: userName || user.email || '',
                delivery_fee: deliveryFee,
                tax_amount: tax,
            };

            const response = await insforge.database
                .from('orders')
                .insert(fullOrderPayload)
                .select()
                .single();

            order = response.data;
            orderError = response.error;

            // Fallback: If 'payment_id' column is missing, try inserting only the base fields
            if (orderError && (orderError.message?.includes("column") || orderError.code === 'PGRST204')) {
                console.warn('Full order insert failed, trying fallback (legacy schema)...');
                const fallbackPayload = {
                    user_id: user.id,
                    restaurant_id: restaurant_id,
                    total_amount: finalTotal,
                    status: 'PLACED',
                };

                const fallbackResponse = await insforge.database
                    .from('orders')
                    .insert(fallbackPayload)
                    .select()
                    .single();

                order = fallbackResponse.data;
                orderError = fallbackResponse.error;
            }

            if (orderError) {
                console.error('Order creation error:', JSON.stringify(orderError, null, 2));
                throw new Error(`Failed to create order: ${orderError.message || JSON.stringify(orderError)}`);
            }

            // 6. Create order items
            const itemsToInsert = orderItemsData.map((item) => ({
                order_id: order.id,
                ...item,
            }));

            const { error: itemsError } = await insforge.database
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error('Order items creation error:', itemsError);
                // Attempt to rollback order
                await insforge.database.from('orders').delete().eq('id', order.id);
                throw new Error('Failed to create order items');
            }

            // 7. Clear cart items
            const { error: clearError } = await insforge.database
                .from('cart_items')
                .delete()
                .eq('cart_id', cartId);

            if (clearError) {
                console.error('Cart clear error (non-critical):', clearError);
            }

            setProgress(100);

            // 8. Show success!
            setPaymentState('success');
            setOrderId(order.id);
            showToast('💳 Payment successful!', 'success', 2000);

            setTimeout(() => {
                showToast('🎉 Order successfully placed!', 'success', 2000);
            }, 500);

            // Show success modal after a short delay
            setTimeout(() => {
                setShowSuccessModal(true);
            }, 800);

            // Store delivery address for the modal
            setDeliveryAddress(deliveryAddress);

        } catch (error) {
            console.error('Payment error:', error);
            setPaymentState('error');
            const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
            showToast(errorMessage, 'error', 8000);

            setTimeout(() => {
                setPaymentState('idle');
                setProgress(0);
            }, 2000);
        }
    };

    const getButtonStyles = () => {
        const baseStyles = 'w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden';

        switch (paymentState) {
            case 'success':
                return `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200 scale-[1.02]`;
            case 'error':
                return `${baseStyles} bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200`;
            case 'processing':
            case 'validating':
                return `${baseStyles} bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-orange-200 cursor-wait`;
            default:
                return `${baseStyles} bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 hover:shadow-orange-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:from-orange-600 disabled:hover:to-orange-700`;
        }
    };

    const getButtonContent = () => {
        switch (paymentState) {
            case 'success':
                return (
                    <>
                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                        <span className="text-lg">Payment Successful!</span>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </>
                );
            case 'error':
                return (
                    <>
                        <span className="text-lg">Payment Failed</span>
                    </>
                );
            case 'processing':
                return (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-lg">Processing Payment...</span>
                    </>
                );
            case 'validating':
                return (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-lg">Validating...</span>
                    </>
                );
            default:
                return (
                    <>
                        <CreditCard className="w-6 h-6" />
                        <span className="text-lg">Pay & Place Order</span>
                        <Lock className="w-4 h-4 opacity-70" />
                    </>
                );
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handlePayment}
                disabled={disabled || paymentState !== 'idle'}
                className={getButtonStyles()}
            >
                {getButtonContent()}

                {/* Progress bar overlay */}
                {(paymentState === 'processing' || paymentState === 'validating') && (
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                )}
            </button>

            {/* Security badge */}
            {paymentState === 'idle' && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Secure payment powered by Stripe</span>
                </div>
            )}

            {/* Payment Success Modal */}
            <PaymentSuccessModal
                isOpen={showSuccessModal}
                orderId={orderId}
                amount={amount}
                deliveryAddress={deliveryAddress}
                onClose={() => {
                    setShowSuccessModal(false);
                    setPaymentState('idle');
                    setProgress(0);
                    setDeliveryAddress('');
                }}
                onViewOrders={() => {
                    setShowSuccessModal(false);
                    setPaymentState('idle');
                    setProgress(0);
                    setDeliveryAddress('');
                    onSuccess(orderId);
                }}
            />
        </div>
    );
}

export default PaymentButton;
