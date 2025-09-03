
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
  const { isAuthenticated, isLoading, access, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until the auth state is confirmed
    }

    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    // Redirect if user is on the base /dashboard page and has access rights
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      if (access.length > 0) {
        // Redirect to dashboard overview if they have access, otherwise to the first available page
        const destination = access.includes('dashboard') 
          ? '/dashboard' 
          : `/dashboard/${access[0].replace(/_/g, '-')}`;
        
        // Only redirect if they aren't already at the destination (for the 'dashboard' case)
        if (pathname !== destination) {
            router.replace(destination);
        }
      } else if (role) {
        // Fallback for a user with a role but no specific access rights defined yet
        router.replace('/dashboard/my-applications');
      }
      // If no role and no access, they will see the default dashboard page if it exists
      // or a blank page if not, which is a valid state if no default is configured.
    }
  }, [isAuthenticated, isLoading, access, role, router, pathname]);

  if (isLoading || !isAuthenticated) {
    // Show a loader while verifying auth or before the initial redirect
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is authenticated but redirection logic hasn't kicked in yet,
  // we can still show a loader to prevent a flash of un-redirected content.
  if ((pathname === '/dashboard' || pathname === '/dashboard/') && access.length > 0 && !access.includes('dashboard')) {
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
