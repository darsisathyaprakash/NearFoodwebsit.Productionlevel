import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ea580c',
};

export const metadata: Metadata = {
  title: 'NearFood - Fresh Food Delivered Fast',
  description:
    'Order delicious food from the best restaurants near you. Fast delivery, great prices, and amazing variety.',
  keywords: ['food delivery', 'restaurants', 'order food online', 'fast delivery', 'takeout', 'local food'],
  authors: [{ name: 'NearFood' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'NearFood - Fresh Food Delivered Fast',
    description: 'Order delicious food from the best restaurants near you. Fast delivery, great prices, and amazing variety.',
    type: 'website',
    locale: 'en_US',
    siteName: 'NearFood',
    images: [
      {
        url: '/og-image.jpg', // Ensure this file exists in public/ folder or update path
        width: 1200,
        height: 630,
        alt: 'NearFood - Fresh Food Delivered Fast',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NearFood - Fresh Food Delivered Fast',
    description: 'Order delicious food from the best restaurants near you.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans text-gray-900">
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <Navbar />
              <main className="min-h-screen bg-gray-50 pb-20">{children}</main>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
