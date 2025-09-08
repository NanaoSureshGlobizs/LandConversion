
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
    label: 'Conversion',
    icon: FileText,
    accessKey: 'conversion',
    type: 'conversion',
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
    label: 'Diversion',
    icon: FileText,
    accessKey: 'diversion',
    type: 'diversion',
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

  const isLinkActive = (href?: string, itemType?: string, exact: boolean = false) => {
    if (!href) return false;
    const fromPath = searchParams.get('from') || pathname;
    const typeParam = searchParams.get('type');

    // For parent items with sub-menus (Conversion/Diversion)
    if (itemType) {
        return typeParam === itemType && (itemType === 'conversion' || itemType === 'diversion');
    }

    const pathIsActive = exact ? fromPath === href : fromPath.startsWith(href);
    
    // For sub-menu items, we also need to check the type param
    if (href.includes('/pending-enquiries') || href.includes('/llmc-recommendations') || href.includes('/report')) {
       return pathIsActive && typeParam === searchParams.get('type');
    }

    return pathIsActive;
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.filter(item => {
        if (item.accessKey && userAccessSet.has(item.accessKey)) {
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
              {item.subItems ? (
                 <Collapsible defaultOpen={isLinkActive(undefined, item.type)}>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isLinkActive(undefined, item.type)}
                            className="w-full"
                        >
                            <item.icon />
                            <span>{item.label}</span>
                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                           {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                    <SidebarMenuSubButton asChild isActive={isLinkActive(`${subItem.href}?type=${item.type}`)}>
                                        <Link href={`${subItem.href}?type=${item.type}`}>
                                            <span>{subItem.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                 </Collapsible>
              ) : (
                <SidebarMenuButton asChild isActive={isLinkActive(item.href, undefined, !!item.exact)}>
                    <Link href={item.href!}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
              )}
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
