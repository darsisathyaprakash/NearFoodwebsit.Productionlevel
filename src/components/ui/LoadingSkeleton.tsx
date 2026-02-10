'use client';

export function RestaurantCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-shimmer">
            <div className="aspect-[16/9] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
                <div className="flex items-center justify-between pt-2">
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-12" />
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
                </div>
            </div>
        </div>
    );
}

export function MenuItemSkeleton() {
    return (
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-shimmer">
            <div className="flex-grow p-4 space-y-2">
                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16" />
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
            </div>
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className="flex justify-between items-center py-4 border-b animate-shimmer">
            <div className="flex items-center gap-4 flex-1">
                <div className="h-8 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3" />
                </div>
            </div>
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16" />
        </div>
    );
}

export function NavbarSkeleton() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container mx-auto flex h-14 items-center justify-between px-4 animate-shimmer">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
                <div className="flex items-center gap-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16" />
                    <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
                    <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
                </div>
            </div>
        </nav>
    );
}

export function PageLoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6 animate-shimmer">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[...Array(6)].map((_, i) => (
                    <RestaurantCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export function OrderCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-shimmer">
            <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-32" />
                    </div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
                </div>
                <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20" />
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
                </div>
            </div>
        </div>
    );
}

export function PaymentButtonSkeleton() {
    return (
        <div className="space-y-3">
            <div className="w-full h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-shimmer" />
            <div className="flex items-center justify-center gap-2">
                <div className="h-3 w-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
                <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>
        </div>
    );
}

export function UserProfileSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-shimmer">
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full" />
                    <div className="space-y-2">
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-48" />
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-64" />
                    </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
                </div>
            </div>
        </div>
    );
}

export function RestaurantDetailSkeleton() {
    return (
        <div className="space-y-6 animate-shimmer">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="aspect-[21/9] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                <div className="p-6 space-y-3">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/2" />
                    <div className="flex gap-4 pt-2">
                        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16" />
                        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20" />
                        <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-16" />
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/4" />
                {[...Array(4)].map((_, i) => (
                    <MenuItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
