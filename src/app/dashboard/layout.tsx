import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkAuth } from '../actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = await checkAuth();

  if (!isLoggedIn) {
    redirect('/');
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
