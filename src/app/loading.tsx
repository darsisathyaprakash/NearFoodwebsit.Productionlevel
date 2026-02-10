'use client';

import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 via-white to-amber-50 animate-page-enter">
            {/* Animated spinner container */}
            <div className="relative mb-8">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-pulse" />

                {/* Middle rotating ring */}
                <div className="absolute inset-2 rounded-full border-4 border-orange-300 animate-spin-slow" />

                {/* Inner spinner */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                </div>
            </div>

            {/* Logo/Icon with bounce animation */}
            <div className="mb-6 animate-bounce-subtle">
                <UtensilsCrossed className="w-12 h-12 text-orange-500" />
            </div>

            {/* Loading text */}
            <div className="space-y-3 text-center">
                <p className="text-2xl font-bold text-gray-800 animate-pulse">
                    Loading...
                </p>
                <p className="text-sm text-gray-500">
                    Preparing your delicious experience
                </p>
            </div>

            {/* Animated dots */}
            <div className="mt-8 flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            {/* Progress bar */}
            <div className="mt-8 w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-shimmer" />
            </div>
        </div>
    );
}
