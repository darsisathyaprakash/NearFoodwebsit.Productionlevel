'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
