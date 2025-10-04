'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DebugProvider } from '@/context/DebugContext';
import { DebugPanel } from '@/components/debug/debug-panel';

// Metadata would need to be moved to a template or exported from here if needed statically.
// For now, we focus on the functionality.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = !pathname.startsWith('/kml-viewer') && !pathname.startsWith('/kml-upload');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Change of Land Use</title>
        <meta name="description" content="A modern system for managing land use applications." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DebugProvider>
          {isAuthRoute ? (
            <AuthProvider>
              {children}
              <DebugPanel />
            </AuthProvider>
          ) : (
            <>
              {children}
              <DebugPanel />
            </>
          )}
        </DebugProvider>
        <Toaster />
      </body>
    </html>
  );
}
