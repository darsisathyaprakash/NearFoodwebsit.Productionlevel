'use client';

type OrderStatus = 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    PLACED: {
        label: 'Placed',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    PREPARING: {
        label: 'Preparing',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    OUT_FOR_DELIVERY: {
        label: 'Out for Delivery',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    DELIVERED: {
        label: 'Delivered',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-50 text-red-700 border-red-200',
    },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
    pending: {
        label: 'Pending',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    paid: {
        label: 'Paid',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    failed: {
        label: 'Failed',
        className: 'bg-red-50 text-red-700 border-red-200',
    },
    refunded: {
        label: 'Refunded',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
    },
};

export function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as OrderStatus] || {
        label: status,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.className}`}>
            {config.label}
        </span>
    );
}

export function PaymentBadge({ status }: { status: string }) {
    const config = paymentStatusConfig[status as PaymentStatus] || {
        label: status,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.className}`}>
            {config.label}
        </span>
    );
}
