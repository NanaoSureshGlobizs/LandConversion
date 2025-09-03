
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
    if (isLoading) {
      return; // Do nothing while auth state is loading
    }

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    // If authenticated, check for redirection from the base dashboard path
    if (isAuthenticated && access.length > 0 && (pathname === '/dashboard' || pathname === '/dashboard/')) {
        // The 'dashboard' key might grant access to the overview, otherwise find the first valid key.
        if (access.includes('dashboard')) {
          // If they have dashboard access and are on dashboard, no need to redirect.
          // This check prevents potential redirect loops.
          return; 
        }

        const firstAllowedRoute = access[0];
        if (firstAllowedRoute) {
          router.replace(`/dashboard/${firstAllowedRoute.replace(/_/g, '-')}`);
        } else {
          // Fallback if for some reason access array is empty but authenticated
          router.replace('/dashboard/my-applications'); 
        }
    }
  }, [isAuthenticated, isLoading, access, router, pathname]);

  if (isLoading || !isAuthenticated) {
    // Show a loader while verifying auth or redirecting
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
