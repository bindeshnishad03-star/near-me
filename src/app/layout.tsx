import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';
import SocketProvider from '@/context/SocketContext';
import LocationProvider from '@/context/LocationContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NearMe | Hyperlocal Social Network',
  description: 'Connect with people, groups, events, and marketplace listings in your exact neighborhood.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500/30">
        <AuthProvider>
          <SocketProvider>
            <LocationProvider>
              {children}
            </LocationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
