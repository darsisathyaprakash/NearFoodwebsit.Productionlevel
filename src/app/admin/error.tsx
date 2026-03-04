'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-500 mb-6 text-sm">
                    {error.message || 'An unexpected error occurred while loading the admin page.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </div>
    );
}
