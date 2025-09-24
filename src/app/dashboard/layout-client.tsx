
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav, allMenuItems } from '@/components/layout/sidebar-nav';

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, access } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allowedRoutes = useMemo(() => {
    const getAllowedRoutesRecursive = (items: typeof allMenuItems): string[] => {
      let routes: string[] = [];
      items.forEach(item => {
        // Check if user has access to the parent item, or if it has no access key (for testing)
        if (!item.accessKey || access.includes(item.accessKey)) {
          if (item.href) {
            routes.push(item.href);
          }
          // If there are sub-items, user has access to the parent, so recurse
          if (item.subItems) {
            // Add the base hrefs of sub-items without query params for the check
            item.subItems.forEach(sub => {
                if (!sub.accessKey || access.includes(sub.accessKey)) {
                     routes.push(sub.href);
                }
            });
          }
        }
      });
      return routes;
    };
    
    let routes = getAllowedRoutesRecursive(allMenuItems);
    // Ensure dashboard is always a potential route if other routes exist, but check access for it.
    const hasDashboardAccess = access.includes('dashboard');
    if (hasDashboardAccess && !routes.includes('/dashboard')) {
        // Add to the beginning if not already present
        routes.unshift('/dashboard');
    }
    // Remove duplicates
    return [...new Set(routes)];

  }, [access]);

  useEffect(() => {
    if (!isClient || isLoading) {
      return; // Wait until the auth state is confirmed and we are on the client
    }

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    const isRootDashboard = pathname === '/dashboard' || pathname === '/dashboard/';
    const hasDashboardAccess = allowedRoutes.includes('/dashboard');
    const firstAllowedRoute = allowedRoutes.length > 0 ? allowedRoutes[0] : '/dashboard';

    // If on the root dashboard and the user does NOT have dashboard access, redirect them immediately.
    if (isRootDashboard && !hasDashboardAccess && firstAllowedRoute !== '/dashboard') {
        router.replace(firstAllowedRoute);
        return;
    }
    
    // Whitelist generic detail pages that any logged-in user should be able to see
    const isGenericViewerPage = pathname.startsWith('/dashboard/application/') || pathname.startsWith('/dashboard/my-applications/');
    if(isGenericViewerPage) return;


    // Check if the current route is allowed by checking the pathname against the allowed routes list.
    const isAllowed = allowedRoutes.some(route => {
        return pathname.startsWith(route) && (pathname.length === route.length || pathname[route.length] === '/');
    });

    // If not on an allowed route, redirect to the first one.
    if (allowedRoutes.length > 0 && !isAllowed) {
        // Exception: If the user lands on the dashboard but doesn't have explicit access, but has other routes, let them stay.
        if(isRootDashboard) return;

        // When redirecting, preserve the type query param if it exists for conversion/diversion pages
        const typeParam = searchParams.get('type');
        const redirectUrl = typeParam ? `${firstAllowedRoute}?type=${typeParam}` : firstAllowedRoute;
        router.replace(redirectUrl);
        return;
    }
    
    // If the user is authenticated but has no allowed routes, keep them on the dashboard page.
    if (allowedRoutes.length === 0 && !isRootDashboard) {
        router.replace('/dashboard');
    }


  }, [isAuthenticated, isLoading, router, pathname, allowedRoutes, searchParams, isClient]);

  if (!isClient || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // If we've confirmed we're not authenticated on the client, show loader until redirect happens.
  if (isClient && !isAuthenticated) {
       return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const isRootDashboard = pathname === '/dashboard' || pathname === '/dashboard/';
  const hasDashboardAccess = allowedRoutes.includes('/dashboard');
  
  // Prevent rendering dashboard content if the user doesn't have access and is on the dashboard path
  if (isRootDashboard && !hasDashboardAccess && allowedRoutes.length > 0) {
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
