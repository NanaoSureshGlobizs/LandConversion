
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilePlus2, Files, LogOut, Home, FileClock, FileBarChart, ThumbsUp, FileSearch, ShieldCheck, FileText, Gavel, ChevronDown } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDebug } from '@/context/DebugContext';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '@/lib/utils';

export const allMenuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    accessKey: 'dashboard',
    exact: true,
  },
  {
    href: '/dashboard/unprocessed-applications',
    label: 'Unprocessed Applications',
    icon: FileSearch,
    accessKey: 'unprocessed_applications',
  },
  {
    href: '/dashboard/pending-enquiries',
    label: 'Conversion',
    icon: FileText,
    accessKey: 'conversion',
    // subItems are kept for access control but won't be rendered as a collapsible menu
    subItems: [
        {
            href: '/dashboard/pending-enquiries',
            label: 'Pending Enquiries',
            accessKey: 'pending_enquiries',
        },
        {
            href: '/dashboard/llmc-recommendations',
            label: 'LLMC Recommendations',
            accessKey: 'llmc_recommendations',
        },
        {
            href: '/dashboard/report',
            label: 'Report',
            accessKey: 'report',
        },
    ]
  },
  {
    href: '/dashboard/pending-enquiries',
    label: 'Diversion',
    icon: FileText,
    accessKey: 'diversion',
     // subItems are kept for access control but won't be rendered as a collapsible menu
    subItems: [
         {
            href: '/dashboard/pending-enquiries',
            label: 'Pending Enquiries',
            accessKey: 'pending_enquiries',
        },
        {
            href: '/dashboard/llmc-recommendations',
            label: 'LLMC Recommendations',
            accessKey: 'llmc_recommendations',
        },
        {
            href: '/dashboard/report',
            label: 'Report',
            accessKey: 'report',
        },
    ]
  },
  {
    href: '/dashboard/enquiries',
    label: 'Enquiries',
    icon: FileSearch,
    accessKey: 'enquiries',
  },
  {
    href: '/dashboard/dlc-recommendations',
    label: 'DLC Recommendations',
    icon: ThumbsUp,
    accessKey: 'dlc_recommendations',
  },
  {
    href: '/dashboard/reports-from-dlc',
    label: 'Reports from DLC',
    icon: FileText,
    accessKey: 'report_from_dlc',
  },
  {
    href: '/dashboard/lrd-decision',
    label: 'LRD Decision',
    icon: ShieldCheck,
    accessKey: 'lrd_decision',
  },
  {
    href: '/dashboard/decision-and-fees',
    label: 'Decision & Fees',
    icon: Gavel,
    accessKey: 'decision_and_fee',
  },
  {
    href: '/dashboard/my-applications',
    label: 'My Applications',
    icon: Files,
    accessKey: 'view_application',
  },
  {
    href: '/dashboard/new-application',
    label: 'New Application',
    icon: FilePlus2,
    accessKey: 'create_application',
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, access } = useAuth();
  const { isDebugMode, setIsDebugMode } = useDebug();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const isLinkActive = (href?: string, exact: boolean = false) => {
    if (!href) return false;
    const fromPath = searchParams.get('from');
    const currentPath = fromPath || pathname;

    if (exact) {
      return currentPath === href;
    }
    
    return currentPath.startsWith(href) && (currentPath.length === href.length || currentPath[href.length] === '/');
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.filter(item => {
        if (item.accessKey && userAccessSet.has(item.accessKey)) {
            // This logic is now simplified. If the parent has access, show it.
            // Sub-item access is implicitly handled by the API response which grants access to the parent key.
            return true;
        }
        return false;
    });
  }, [access]);


  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/image/kanglasha.png" alt="Kanglasha Logo" width={40} height={40} />
          <div className='flex flex-col'>
            <span className="text-xl font-bold font-headline">Change of Land Use</span>
            <span className="text-sm text-muted-foreground">Government of Manipur</span>
          </div>
          <div className="flex-1" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
             <SidebarMenuItem key={item.label}>
                {/* Simplified: No more collapsible menus for Conversion/Diversion */}
                <SidebarMenuButton asChild isActive={isLinkActive(item.href, !!item.exact)}>
                    <Link href={item.href!}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center space-x-2 p-2">
          <Label htmlFor="debug-mode">Debug Mode</Label>
          <Switch
            id="debug-mode"
            checked={isDebugMode}
            onCheckedChange={setIsDebugMode}
          />
        </div>
        <SidebarSeparator />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

