'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { insforge } from '@/lib/insforge';

/**
 * Admin Login Page
 * Signs in using the client-side SDK (to persist session in browser),
 * then verifies admin role via the server API.
 */
export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Sign in using the CLIENT-SIDE SDK so the session
            // token is stored in the browser (cookie/localStorage).
            const { data: signInData, error: signInError } = await insforge.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError || !signInData?.user) {
                setError(signInError?.message || 'Invalid email or password');
                setLoading(false);
                return;
            }

            // Step 2: Get the access token from the session
            const { data: sessionData } = await insforge.auth.getCurrentSession();
            const accessToken = sessionData?.session?.accessToken;

            if (!accessToken) {
                setError('Failed to retrieve session token. Please try again.');
                setLoading(false);
                return;
            }

            // Step 3: Verify admin role via the server API,
            // forwarding the access token so the server can authenticate.
            const res = await fetch('/api/admin/auth', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) {
                // Not an admin — sign out and show error
                await insforge.auth.signOut();
                const data = await res.json().catch(() => ({}));
                setError(data.error || 'Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            const data = await res.json();
            if (!data.isAdmin) {
                await insforge.auth.signOut();
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Step 3: Redirect to admin dashboard
            router.replace('/admin');
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please check if the server is running.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl shadow-orange-500/30 mb-4">
                        <span className="text-white font-bold text-2xl">N</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Sign in to manage your restaurant</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error alert */}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-slide-up">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Only authorized administrators can access this panel.
                </p>
            </div>
        </div>
    );
}
