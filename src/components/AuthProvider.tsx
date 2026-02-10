'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';

interface User {
    id: string;
    email: string;
    emailVerified?: boolean;
    profile?: {
        name?: string;
        avatar_url?: string;
    };
}

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refresh = useCallback(async () => {
        try {
            const { data, error } = await insforge.auth.getCurrentSession();
            if (error || !data?.session?.user) {
                setUser(null);
            } else {
                setUser(data.session.user as User);
            }
        } catch (error) {
            console.error('Error refreshing session:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const signOut = useCallback(async () => {
        try {
            setLoading(true);
            await insforge.auth.signOut();
            setUser(null);
            router.refresh();
            router.push('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
