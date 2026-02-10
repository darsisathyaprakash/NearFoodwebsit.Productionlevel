'use client';

import { useEffect, useState } from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';

interface PageTransitionProps {
    children: React.ReactNode;
    isLoading?: boolean;
    loadingText?: string;
    minDisplayTime?: number;
}

export function PageTransition({
    children,
    isLoading = false,
    loadingText = 'Loading...',
    minDisplayTime = 500
}: PageTransitionProps) {
    const [showLoader, setShowLoader] = useState(isLoading);
    const [showContent, setShowContent] = useState(!isLoading);

    useEffect(() => {
        if (isLoading) {
            setShowLoader(true);
            setShowContent(false);
        } else {
            // Keep loader visible for at least minDisplayTime
            const timer = setTimeout(() => {
                setShowLoader(false);
                setTimeout(() => {
                    setShowContent(true);
                }, 100);
            }, minDisplayTime);

            return () => clearTimeout(timer);
        }
    }, [isLoading, minDisplayTime]);

    return (
        <div className="relative min-h-screen">
            {/* Loading State */}
            {showLoader && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 animate-page-enter">
                    <div className="relative">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse" />

                        {/* Middle ring */}
                        <div className="absolute inset-2 rounded-full border-4 border-orange-300 animate-spin-slow" />

                        {/* Inner spinner */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                        </div>
                    </div>

                    {/* Logo/Icon */}
                    <div className="mt-8 animate-bounce-subtle">
                        <UtensilsCrossed className="w-10 h-10 text-orange-500" />
                    </div>

                    {/* Loading text */}
                    <div className="mt-6 space-y-2 text-center">
                        <p className="text-xl font-semibold text-gray-800 animate-pulse">
                            {loadingText}
                        </p>
                        <div className="flex items-center gap-2 justify-center">
                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-8 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-shimmer" />
                    </div>
                </div>
            )}

            {/* Content */}
            {showContent && (
                <div className="animate-page-enter">
                    {children}
                </div>
            )}
        </div>
    );
}

export default PageTransition;
