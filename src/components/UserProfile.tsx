'use client';

import { useState } from 'react';
import { User, Mail, CheckCircle, XCircle, LogOut, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

interface UserProfileProps {
    className?: string;
}

/**
 * User profile dropdown component showing user status and account information.
 * Displays email, verification status, and quick access to orders and cart.
 */
export function UserProfile({ className = '' }: UserProfileProps) {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) {
        return null;
    }

    const userName = user.profile?.name || user.email?.split('@')[0] || 'User';
    const isEmailVerified = user.emailVerified || false;

    return (
        <div className={`relative ${className}`}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User profile"
            >
                <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                    {userName}
                </span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{userName}</h3>
                                    <p className="text-sm text-white/80 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm">
                                {isEmailVerified ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-green-600 font-medium">Email Verified</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-amber-500" />
                                        <span className="text-amber-600 font-medium">Email Not Verified</span>
                                    </>
                                )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                                User ID: <span className="font-mono">{user.id.slice(0, 8)}...</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="p-2">
                            <Link
                                href="/orders"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium">My Orders</span>
                            </Link>
                            <Link
                                href="/cart"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                <ShoppingBag className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium">My Cart</span>
                            </Link>
                        </div>

                        {/* Sign Out */}
                        <div className="p-2 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default UserProfile;
