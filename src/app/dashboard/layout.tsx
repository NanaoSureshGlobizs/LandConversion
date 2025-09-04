
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
  const { isAuthenticated, isLoading, access } = useAuth();
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
    
    // Once authenticated, check if the user has access to any routes.
    if (allowedRoutes.length > 0) {
      const isRootDashboard = pathname === '/dashboard' || pathname === '/dashboard/';
      
      const isAllowed = isRootDashboard || allowedRoutes.some(route => {
          const menuItem = allMenuItems.find(item => item.href === route);
          if (menuItem?.exact) return pathname === route;
          // Check if the current path starts with the allowed route, and is either an exact match or followed by a '/'
          return pathname.startsWith(route) && (pathname.length === route.length || pathname[route.length] === '/');
      });

      
      // If user is on a page they don't have access to, redirect.
      if (!isAllowed) {
        const destination = allowedRoutes[0];
        // Only redirect if they are not already at the destination
        if (pathname !== destination) {
          router.replace(destination);
        }
      }
    } else if (isAuthenticated && pathname !== '/dashboard' && pathname !== '/dashboard/') {
        // If logged in user has no allowed routes, but isn't on the dashboard, send them to the dashboard.
        router.replace('/dashboard');
    }

  }, [isAuthenticated, isLoading, access, router, pathname, allowedRoutes]);

  // Show a loader while verifying auth or if we are about to redirect.
  const isAuthenticating = isLoading;
  const isRedirecting = !isLoading && isAuthenticated && allowedRoutes.length > 0 && !allowedRoutes.some(route => (pathname === '/dashboard' || pathname === '/dashboard/') || pathname.startsWith(route));

  if (isAuthenticating || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If authenticated but no allowed routes, maybe show a message
  // Also check if they are on the root dashboard page itself.
  if (isAuthenticated && allowedRoutes.length === 0 && (pathname !== '/dashboard' && pathname !== '/dashboard/')) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-background">
              <div className='text-center'>
                  <h2 className='text-xl font-semibold'>No Access</h2>
                  <p className='text-muted-foreground'>You do not have permission to view any pages.</p>
              </div>
          </div>
      )
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
