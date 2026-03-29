import type { Metadata } from 'next';
import ClientWrapper from '@/components/ClientWrapper';

export const metadata: Metadata = {
  title: 'mvee.in',
  description: 'Premium Billing and Invoice System for Mvee Clicks',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'mvee.in',
  },
  icons: {
    apple: '/icon-192x192.png',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
