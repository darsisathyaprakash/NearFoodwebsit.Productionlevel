import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LayoutShell } from '@/components/LayoutShell';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ea580c',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://nearfood.app'),
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
        url: '/og-image.jpg',
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
          <LayoutShell>{children}</LayoutShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
