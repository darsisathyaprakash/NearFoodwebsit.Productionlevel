'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, Truck, Clock, MapPin, ArrowRight } from 'lucide-react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    orderId: string;
    amount: number;
    deliveryAddress?: string;
    onClose: () => void;
    onViewOrders: () => void;
}

export function PaymentSuccessModal({
    isOpen,
    orderId,
    amount,
    deliveryAddress,
    onClose,
    onViewOrders,
}: PaymentSuccessModalProps) {
    const [showContent, setShowContent] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isOpen) {
            setShowContent(true);
            setCountdown(5);

            // Countdown timer
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    // Separate effect to handle onViewOrders when countdown reaches 0
    useEffect(() => {
        if (isOpen && countdown === 0) {
            onViewOrders();
        }
    }, [isOpen, countdown, onViewOrders]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-page-enter"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden ${showContent ? 'animate-scale-in' : 'opacity-0'}`}>
                {/* Success Header with Gradient */}
                <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-8 text-center relative overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9zdmc+')] animate-pulse" />
                    </div>

                    {/* Success Icon */}
                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg animate-bounce-subtle">
                            <CheckCircle className="w-14 h-14 text-green-500" />
                        </div>
                    </div>

                    {/* Sparkles */}
                    <div className="absolute top-4 right-8 animate-pulse">
                        <Sparkles className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="absolute bottom-4 left-8 animate-pulse" style={{ animationDelay: '0.5s' }}>
                        <Sparkles className="w-5 h-5 text-white/80" />
                    </div>

                    {/* Title */}
                    <h2 className="relative mt-6 text-3xl font-bold text-white">
                        Payment Successful!
                    </h2>
                    <p className="relative mt-2 text-white/90">
                        Your order has been placed
                    </p>
                </div>

                {/* Order Details */}
                <div className="p-6 space-y-4">
                    {/* Order ID */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-mono font-bold text-gray-800">{orderId}</p>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">
                            ${amount.toFixed(2)}
                        </span>
                    </div>

                    {/* Estimated Delivery */}
                    <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Truck className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                <p className="font-semibold text-gray-800">25-35 minutes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Order Status</p>
                                <p className="font-semibold text-green-600">Preparing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-semibold text-gray-800 text-sm line-clamp-2">
                                    {deliveryAddress || 'Your saved address'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-redirect notice */}
                    <div className="text-center py-2">
                        <p className="text-sm text-gray-500">
                            Redirecting to orders in <span className="font-bold text-orange-600">{countdown}</span> seconds...
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Stay Here
                        </button>
                        <button
                            onClick={onViewOrders}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                        >
                            View Orders
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccessModal;
