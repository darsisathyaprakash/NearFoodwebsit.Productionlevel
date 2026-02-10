'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { insforge } from '@/lib/insforge';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail, getPasswordStrength } from '@/utils/validation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) router.push('/');
    }, [user, router]);

    const passwordStrength = password ? getPasswordStrength(password) : null;

    const validate = () => {
        const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Invalid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else {
            // Check for password complexity
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            if (!hasUpperCase) {
                newErrors.password = 'Password must contain at least one uppercase letter';
            } else if (!hasLowerCase) {
                newErrors.password = 'Password must contain at least one lowercase letter';
            } else if (!hasNumbers) {
                newErrors.password = 'Password must contain at least one number';
            } else if (!hasSpecialChar) {
                newErrors.password = 'Password must contain at least one special character';
            }
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const { error } = await insforge.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            showToast('Signup successful! Please check your email for confirmation link.', 'success');
            router.push('/login');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error signing up';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = (strength: string) => {
        switch (strength) {
            case 'weak':
                return 'bg-red-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'strong':
                return 'bg-green-500';
            default:
                return 'bg-gray-300';
        }
    };

    return (
        <div className="container max-w-md mx-auto px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Get Started</h1>
                <p className="text-gray-500 text-center mb-8">Create your account to start ordering</p>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}

                        {/* Password Strength Indicator */}
                        {password && passwordStrength && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${getStrengthColor(passwordStrength)}`}
                                            style={{
                                                width:
                                                    passwordStrength === 'weak'
                                                        ? '33%'
                                                        : passwordStrength === 'medium'
                                                            ? '66%'
                                                            : '100%',
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 capitalize">
                                        {passwordStrength}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Must contain: uppercase, lowercase, number, and special character
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            required
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                            }}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Passwords match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-sm text-gray-400">or continue with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Sign-up */}
                <GoogleAuthButton mode="signup" />

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="/login" className="text-orange-600 font-medium hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
