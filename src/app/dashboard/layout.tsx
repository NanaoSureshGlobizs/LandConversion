
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, access } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && access.length > 0) {
      // If the user lands on the base dashboard path, redirect them to the first accessible route.
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        // The 'dashboard' key might grant access to the overview, otherwise find the first valid key.
        if (access.includes('dashboard')) {
          router.replace('/dashboard');
        } else {
          const firstAllowedRoute = access[0];
          if (firstAllowedRoute) {
            router.replace(`/dashboard/${firstAllowedRoute.replace(/_/g, '-')}`);
          } else {
            // Fallback if for some reason access array is empty but authenticated
            router.replace('/dashboard/my-applications'); 
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, access, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // While redirecting, show a loader as well to prevent flashing content
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <div className="p-4 md:p-8 pt-6">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
