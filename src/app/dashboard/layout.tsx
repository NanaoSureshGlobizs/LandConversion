
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
    const routeMap = new Map(allMenuItems.map(item => [item.accessKey, item.href]));
    return access.map(key => routeMap.get(key)).filter((route): route is string => !!route);
  }, [access]);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until the auth state is confirmed
    }

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    // Now that we know the user is authenticated, check their routes
    if (allowedRoutes.length > 0) {
      const isAllowed = allowedRoutes.includes(pathname);
      const isRootDashboard = pathname === '/dashboard' || pathname === '/dashboard/';
      
      // If user is on the base /dashboard OR a page they don't have access to, redirect.
      if (isRootDashboard || !isAllowed) {
        const destination = allowedRoutes[0];
        if (pathname !== destination) {
          router.replace(destination);
        }
      }
    } else if (role) {
      // Fallback for a user with a role but no specific access rights defined in allMenuItems.
      // This could be a page that doesn't require a specific access key, like a profile page.
      // We can redirect to a default safe page.
      const fallbackDestination = '/dashboard/my-applications';
      if (pathname !== fallbackDestination && allMenuItems.some(item => item.href === fallbackDestination)) {
        router.replace(fallbackDestination);
      }
    }
    // If a user has a role but no allowedRoutes and no fallback, they might see a blank page.
    // This state indicates a potential configuration issue (role assigned but no permissions).

  }, [isAuthenticated, isLoading, access, role, router, pathname, allowedRoutes]);

  // Show a loader while verifying auth or if we are about to redirect.
  // The second condition prevents a flash of the old page content before redirection.
  if (isLoading || !isAuthenticated || (allowedRoutes.length > 0 && !allowedRoutes.includes(pathname))) {
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
