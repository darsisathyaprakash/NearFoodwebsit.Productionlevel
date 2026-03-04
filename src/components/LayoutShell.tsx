'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * LayoutShell — conditionally renders customer UI (Navbar, Cart, Toast)
 * only on non-admin routes. Admin routes get a clean slate.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute) {
        // Admin routes — no Navbar, no Cart, no customer Auth/Toast
        return <>{children}</>;
    }

    // Customer routes — full layout with Navbar, Cart, Auth, Toast
    return (
        <ToastProvider>
            <AuthProvider>
                <Navbar />
                <main className="min-h-screen bg-gray-50 pb-20">{children}</main>
                <FloatingCartButton />
            </AuthProvider>
        </ToastProvider>
    );
}
