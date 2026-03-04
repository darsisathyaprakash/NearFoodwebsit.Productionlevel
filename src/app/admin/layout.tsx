import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard - NearFood',
    description: 'NearFood admin management dashboard',
};

/**
 * Admin layout — completely separate from customer layout.
 * Does NOT render the customer Navbar, FloatingCartButton, or ToastProvider.
 * The admin pages have their own sidebar + topbar structure.
 */
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}
