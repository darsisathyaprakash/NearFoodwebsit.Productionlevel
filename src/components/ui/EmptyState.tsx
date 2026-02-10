import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-4 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200">
            <div className="flex justify-center mb-4 text-gray-300">
                {icon || <PackageOpen className="w-16 h-16" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}

            {(actionLabel && (actionHref || onAction)) && (
                actionHref ? (
                    <Link
                        href={actionHref}
                        className="inline-block bg-orange-600 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
                    >
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="inline-block bg-orange-600 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors"
                    >
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
}
