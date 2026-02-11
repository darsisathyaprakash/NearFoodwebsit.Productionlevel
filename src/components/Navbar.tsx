'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useState, useEffect, useCallback } from 'react';
import { NavbarSkeleton } from './ui/LoadingSkeleton';
import { UserProfile } from './UserProfile';
import { insforge } from '@/lib/insforge';

export function Navbar() {
    const { user, signOut, loading } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count
    const fetchCartCount = useCallback(async () => {
        if (!user) {
            setCartCount(0);
            return;
        }

        try {
            const { data, error } = await insforge.database
                .from('carts')
                .select('cart_items(quantity)')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching cart count:', error);
                return;
            }

            if (data?.cart_items) {
                const count = (data.cart_items as any[]).reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    // Poll for cart updates every 30 seconds
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            fetchCartCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, fetchCartCount]);

    if (loading) {
        return <NavbarSkeleton />;
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 shadow-lg shadow-black/5">
            {/* Subtle top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo */}
                <Link className="flex items-center gap-2 font-bold text-xl text-orange-600" href="/">
                    NearFood
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/restaurants" className="text-sm font-medium hover:text-orange-600 transition-colors">
                        Explore
                    </Link>

                    <Link href="/cart" className="relative p-2 hover:text-orange-600 transition-colors group" aria-label="Cart">
                        <ShoppingBag className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <UserProfile />
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-sm font-medium hover:text-orange-600 transition-colors"
                        >
                            <User className="h-5 w-5" />
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white animate-in slide-in-from-top-2 duration-200">
                    <div className="container mx-auto px-4 py-4 space-y-3">
                        <Link
                            href="/restaurants"
                            className="block py-2 text-sm font-medium hover:text-orange-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Explore Restaurants
                        </Link>
                        <Link
                            href="/cart"
                            className="flex items-center justify-between py-2 text-sm font-medium hover:text-orange-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                        {user ? (
                            <>
                                <div className="py-2 border-t border-gray-100">
                                    <div className="flex items-center gap-2 px-2 py-1">
                                        <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {(user.profile?.name || user.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.profile?.name || user.email?.split('@')[0] || 'User'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 px-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            {user.emailVerified ? (
                                                <>
                                                    <span className="text-green-600">✓ Email Verified</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-amber-600">⚠ Email Not Verified</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/orders"
                                    className="block py-2 text-sm font-medium hover:text-orange-600 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    My Orders
                                </Link>
                                <button
                                    onClick={() => {
                                        signOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="block py-2 text-sm font-medium hover:text-orange-600 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
