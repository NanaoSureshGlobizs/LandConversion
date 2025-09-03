
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav, allMenuItems } from '@/components/layout/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, access, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedRoutes = useMemo(() => {
    return allMenuItems
      .filter(item => access.includes(item.accessKey))
      .map(item => item.href);
  }, [access]);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until the auth state is confirmed
    }

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const isRootDashboard = pathname === '/dashboard' || pathname === '/dashboard/';
    const isAllowed = allowedRoutes.includes(pathname);
    
    // If user is on the base /dashboard or on a page they don't have access to, redirect.
    if (isRootDashboard || !isAllowed) {
        if (allowedRoutes.length > 0) {
            const destination = allowedRoutes[0];
            // Only redirect if they aren't already at the destination
            if (pathname !== destination) {
                router.replace(destination);
            }
        } else if (role) {
            // Fallback for a user with a role but no specific access rights defined.
            // This could be a page that doesn't require a specific access key.
            const fallbackDestination = '/dashboard/my-applications';
            if (pathname !== fallbackDestination) {
                router.replace(fallbackDestination);
            }
        }
        // If no access and no role, they might see a blank page if no redirect happens,
        // which might be a valid state if dashboard has a default view for such users.
    }
  }, [isAuthenticated, isLoading, access, role, router, pathname, allowedRoutes]);

  if (isLoading || !isAuthenticated || (allowedRoutes.length > 0 && !allowedRoutes.includes(pathname))) {
    // Show a loader while verifying auth, before the initial redirect,
    // or if we are about to redirect because the current path is not allowed.
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
