
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
            href: '/dashboard/enquiries',
            label: 'Enquiries',
            accessKey: 'enquiries',
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
            href: '/dashboard/enquiries',
            label: 'Enquiries',
            accessKey: 'enquiries',
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
        {
            href: '/dashboard/final-orders',
            label: 'Final Orders',
            accessKey: 'final_orders', 
        }
    ]
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

    const currentPath = pathname;
    const currentType = searchParams.get('type');
    
    // For sub-menu items, we need to check both path and type
    if (itemType) {
        return currentPath === href && currentType === itemType;
    }
    
    if (exact) {
      return currentPath === href;
    }
    
    // For parent menu items, check if the current path starts with its base path
    // and if the types match. This is important for keeping the parent open.
    if(item.type) {
        const hasSubItemMatch = allMenuItems
            .find(item => item.type === item.type)?.subItems
            ?.some(sub => currentPath === sub.href);
            
        return hasSubItemMatch && currentType === item.type;
    }

    return currentPath.startsWith(href);
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      // Create a mutable copy of the item to modify subItems
      const newItem = { ...item };

      if (newItem.subItems) {
        // Filter sub-items based on user access
        newItem.subItems = newItem.subItems.filter(subItem => 
          userAccessSet.has(subItem.accessKey)
        );
      }
      return newItem;
    }).filter(item => {
      // Keep the item if it's a dashboard and user has access
      if (item.accessKey === 'dashboard') {
        return userAccessSet.has('dashboard');
      }
      // Keep the item if it has its own access key and it's not a parent container
      if (userAccessSet.has(item.accessKey) && !item.subItems) {
        return true;
      }
      // Keep the item if it's a parent container and has visible sub-items
      if (item.subItems && item.subItems.length > 0) {
        return userAccessSet.has(item.accessKey);
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
              {item.subItems && item.subItems.length > 0 ? (
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
                                <SidebarMenuSubItem key={`${item.type}-${subItem.label}`}>
                                    <SidebarMenuSubButton asChild isActive={isLinkActive(subItem.href, item.type)}>
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
