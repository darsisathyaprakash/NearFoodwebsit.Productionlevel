'use client';

import { useAdminAuth } from './AdminAuthProvider';
import { Bell, Search } from 'lucide-react';

export function AdminTopbar() {
    const { adminUser } = useAdminAuth();

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            {/* Left side */}
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
                    Admin Dashboard
                </h2>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Notifications bell */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </button>

                {/* Admin avatar */}
                {adminUser && (
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-700">{adminUser.name}</p>
                            <p className="text-xs text-gray-500">{adminUser.email}</p>
                        </div>
                        <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-orange-500/20">
                            {adminUser.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
