'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Toast as ToastType } from '@/types/types';
import { CheckCircle, XCircle, Info, AlertTriangle, X, Sparkles, AlertCircle } from 'lucide-react';

interface ToastContextType {
    showToast: (message: string, type?: ToastType['type'], duration?: number) => void;
    clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastType[]>([]);

    const showToast = useCallback((message: string, type: ToastType['type'] = 'info', duration: number = 7000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: ToastType = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, duration);
        }
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, clearAllToasts }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none max-w-sm w-full">
                {toasts.map((toast, index) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                        index={index}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose, index }: { toast: ToastType; onClose: () => void; index: number }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        return () => {
            setIsExiting(true);
        };
    }, []);

    const icons = {
        success: <CheckCircle className="w-6 h-6" />,
        error: <XCircle className="w-6 h-6" />,
        info: <Info className="w-6 h-6" />,
        warning: <AlertTriangle className="w-6 h-6" />,
    };

    const secondaryIcons = {
        success: <Sparkles className="w-4 h-4" />,
        error: <AlertCircle className="w-4 h-4" />,
        info: <Sparkles className="w-4 h-4" />,
        warning: <AlertCircle className="w-4 h-4" />,
    };

    const gradients = {
        success: 'from-green-50 to-emerald-50 border-green-200',
        error: 'from-red-50 to-rose-50 border-red-200',
        info: 'from-blue-50 to-indigo-50 border-blue-200',
        warning: 'from-amber-50 to-yellow-50 border-amber-200',
    };

    const textColors = {
        success: 'text-green-800',
        error: 'text-red-800',
        info: 'text-blue-800',
        warning: 'text-amber-800',
    };

    const iconColors = {
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
        warning: 'text-amber-500',
    };

    const secondaryIconColors = {
        success: 'text-green-400',
        error: 'text-red-400',
        info: 'text-blue-400',
        warning: 'text-amber-400',
    };

    return (
        <div
            className={`pointer-events-auto relative overflow-hidden rounded-xl border-2 shadow-2xl min-w-[320px] max-w-md bg-gradient-to-br ${gradients[toast.type]} ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}`}
            style={{
                animationDelay: `${index * 50}ms`,
            }}
        >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')] animate-pulse" />
            </div>

            {/* Progress bar for auto-dismiss */}
            {toast.duration && toast.duration > 0 && (
                <div
                    className={`absolute bottom-0 left-0 h-1 ${iconColors[toast.type]} bg-current opacity-50 transition-all duration-100 ease-linear`}
                    style={{
                        animation: `toast-progress ${toast.duration}ms linear forwards`,
                    }}
                />
            )}

            <div className="relative flex items-start gap-4 p-4">
                {/* Icon */}
                <div className={`flex-shrink-0 p-2 rounded-full bg-white/50 ${iconColors[toast.type]} shadow-sm`}>
                    {icons[toast.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${textColors[toast.type]} leading-relaxed`}>
                        {toast.message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-black/10 transition-all duration-200 ${textColors[toast.type]} opacity-60 hover:opacity-100`}
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Decorative elements */}
            <div className={`absolute top-2 right-2 ${secondaryIconColors[toast.type]} opacity-30`}>
                {secondaryIcons[toast.type]}
            </div>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
