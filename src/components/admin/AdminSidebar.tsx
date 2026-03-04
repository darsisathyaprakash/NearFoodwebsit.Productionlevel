'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
import { useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAdminAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col ${collapsed ? 'w-[70px]' : 'w-[250px]'
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Admin
                            </span>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon
                                    className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-orange-400' : 'text-gray-500 group-hover:text-white'
                                        }`}
                                />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className="px-3 py-4 border-t border-gray-700/50 space-y-1">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
                        title={collapsed ? 'Sign Out' : undefined}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-800 hover:text-white transition-all duration-200 w-full"
                    >
                        {collapsed ? (
                            <ChevronRight className="h-5 w-5 flex-shrink-0 mx-auto" />
                        ) : (
                            <>
                                <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Spacer to push content right */}
            <div className={`flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-[250px]'}`} />
        </>
    );
}
