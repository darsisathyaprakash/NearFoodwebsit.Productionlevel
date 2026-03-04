'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { insforge } from '@/lib/insforge';

// Admin user type
interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'admin';
}

type AdminAuthContextType = {
    adminUser: AdminUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    /** Wrapper around fetch() that auto-injects the admin Bearer token. */
    adminFetch: (url: string, init?: RequestInit) => Promise<Response>;
};

const AdminAuthContext = createContext<AdminAuthContextType>({
    adminUser: null,
    loading: true,
    signOut: async () => { },
    adminFetch: (url, init) => fetch(url, init),
});

/**
 * AdminAuthProvider — wraps admin routes to verify admin role.
 * Redirects non-admin users to /admin/login.
 * Provides `adminFetch` that auto-injects the Authorization header.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const accessTokenRef = useRef<string | null>(null);

    /**
     * adminFetch — a fetch wrapper that injects the admin access token.
     */
    const adminFetch = useCallback(async (url: string, init?: RequestInit): Promise<Response> => {
        // Get latest token
        let token = accessTokenRef.current;
        if (!token) {
            const { data } = await insforge.auth.getCurrentSession();
            token = data?.session?.accessToken || null;
            accessTokenRef.current = token;
        }

        const headers = new Headers(init?.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (!headers.has('credentials')) {
            // credentials: 'include' is set separately
        }

        return fetch(url, {
            ...init,
            headers,
            credentials: 'include',
        });
    }, []);

    const checkAdmin = useCallback(async () => {
        if (!isMountedRef.current) return;

        try {
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            const accessToken = sessionData?.session?.accessToken;

            if (!accessToken) {
                accessTokenRef.current = null;
                setAdminUser(null);
                setLoading(false);
                if (pathname !== '/admin/login') {
                    router.replace('/admin/login');
                }
                return false;
            }

            // Store the token
            accessTokenRef.current = accessToken;

            const res = await fetch('/api/admin/auth', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.isAdmin) {
                    setAdminUser({
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: 'admin',
                    });
                    setLoading(false);
                    return true;
                }
            }
            accessTokenRef.current = null;
            setAdminUser(null);
            setLoading(false);
            if (pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
            return false;
        } catch {
            accessTokenRef.current = null;
            setAdminUser(null);
            setLoading(false);
            if (pathname !== '/admin/login') {
                router.replace('/admin/login');
            }
            return false;
        }
    }, [router, pathname]);

    useEffect(() => {
        isMountedRef.current = true;
        checkAdmin();

        intervalRef.current = setInterval(() => {
            if (isMountedRef.current) {
                checkAdmin();
            }
        }, 30000);

        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [checkAdmin]);

    const signOut = useCallback(async () => {
        try {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            await insforge.auth.signOut();
            accessTokenRef.current = null;
            setAdminUser(null);
            router.replace('/admin/login');
        } catch (error) {
            console.error('Admin sign out error:', error);
            accessTokenRef.current = null;
            setAdminUser(null);
            router.replace('/admin/login');
        }
    }, [router]);

    return (
        <AdminAuthContext.Provider value={{ adminUser, loading, signOut, adminFetch }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
