
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && access.length > 0) {
      const defaultRoute = '/dashboard/my-applications'; // A reasonable default
      const firstAllowedRoute = `/dashboard/${access[0].replace(/_/g, '-')}`;
      
      // A simple check to see if we are at the base dashboard URL
      if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
         if (access.includes('dashboard')) {
            router.replace('/dashboard');
         } else if (access.length > 0) {
            // Find a valid route from the access list
            const validRoute = access.find(key => key !== 'dashboard');
            if (validRoute) {
               router.replace(`/dashboard/${validRoute.replace(/_/g, '-')}`);
            } else {
               router.replace(defaultRoute); // Fallback
            }
         }
      }
    }
  }, [isAuthenticated, isLoading, access, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null or a loader while redirecting
    return null;
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
