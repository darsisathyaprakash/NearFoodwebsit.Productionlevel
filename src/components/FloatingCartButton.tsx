'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { insforge } from '@/lib/insforge';
import { usePathname } from 'next/navigation';

export function FloatingCartButton() {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [prevCount, setPrevCount] = useState(0);
    const pathname = usePathname();

    // Hide floating cart on cart page
    useEffect(() => {
        setIsVisible(pathname !== '/cart');
    }, [pathname]);

    // Fetch cart data
    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartCount(0);
            setCartTotal(0);
            return;
        }

        try {
            const { data, error } = await insforge.database
                .from('carts')
                .select('*, cart_items(*, menu_items(price))')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching cart:', error);
                return;
            }

            if (data?.cart_items) {
                const items = data.cart_items as any[];
                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                const total = items.reduce((sum, item) => {
                    const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
                    return sum + (menuItem?.price || 0) * item.quantity;
                }, 0);

                // Animate if count changed
                if (count !== prevCount && count > 0) {
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 500);
                }

                setPrevCount(count);
                setCartCount(count);
                setCartTotal(total);
            } else {
                setCartCount(0);
                setCartTotal(0);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }, [user, prevCount]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Poll for cart updates every 30 seconds
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            fetchCart();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, fetchCart]);

    if (!isVisible) return null;

    return (
        <Link
            href="/cart"
            className="fixed bottom-6 right-6 z-50 group"
            aria-label="View cart"
        >
            {/* Main button */}
            <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg transition-opacity duration-300 ${cartCount > 0 ? 'opacity-60 animate-glow-pulse' : 'opacity-40 group-hover:opacity-60'}`} />

                {/* Button container */}
                <div className={`relative bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4 shadow-2xl shadow-orange-500/30 transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${cartCount > 0 ? 'animate-cart-float' : ''}`}>
                    {/* Cart icon */}
                    <ShoppingBag className="w-6 h-6 text-white" />

                    {/* Badge */}
                    {cartCount > 0 && (
                        <div
                            className={`absolute -top-2 -right-2 bg-white text-orange-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-orange-500 ${isAnimating ? 'animate-badge-pop' : ''}`}
                        >
                            {cartCount > 9 ? '9+' : cartCount}
                        </div>
                    )}
                </div>

                {/* Tooltip with total */}
                {cartCount > 0 && (
                    <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-xl whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span className="font-semibold">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="text-orange-400 font-bold mt-1">
                                ${cartTotal.toFixed(2)}
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full right-4 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-900" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
