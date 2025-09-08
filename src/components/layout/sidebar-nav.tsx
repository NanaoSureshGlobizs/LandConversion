
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

  const isParentActive = (itemType?: string) => {
    if (!itemType) return false;
    const currentPath = pathname;
    const currentType = searchParams.get('type');

    // Check if any sub-item under this parent is active
    const parentItem = allMenuItems.find(i => i.type === itemType);
    if (parentItem && parentItem.subItems) {
      const hasActiveSubItem = parentItem.subItems.some(sub => currentPath === sub.href);
      return hasActiveSubItem && currentType === itemType;
    }
    return false;
  }

  const isLinkActive = (href?: string, itemType?: string, exact: boolean = false) => {
    const currentPath = pathname;
    const currentType = searchParams.get('type');

    if (itemType) { // This is for sub-menu items
      return currentPath === href && currentType === itemType;
    }

    if (exact) { // For exact routes like /dashboard
      return currentPath === href;
    }
    
    // For regular, non-exact-match menu items
    if (href) {
      return currentPath.startsWith(href);
    }
    
    return false;
  };

  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    const menu = allMenuItems.map(item => {
      // Return dashboard if user has access
      if (item.accessKey === 'dashboard' && userAccessSet.has('dashboard')) {
        return item;
      }
      
      // Handle parent menu items (Conversion, Diversion)
      if (item.subItems) {
        if (!userAccessSet.has(item.accessKey)) return null;

        const visibleSubItems = item.subItems.filter(sub => {
            // Special case for final_orders
            if (sub.accessKey === 'final_orders') {
                return item.type === 'diversion' && userAccessSet.has('final_orders');
            }
            return userAccessSet.has(sub.accessKey);
        });

        if (visibleSubItems.length > 0) {
          return { ...item, subItems: visibleSubItems };
        }
        return null; // Hide parent if no sub-items are visible
      }

      // Handle regular menu items
      if (userAccessSet.has(item.accessKey)) {
        return item;
      }

      return null;
    }).filter(Boolean); // remove nulls

    return menu as typeof allMenuItems;

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
                 <Collapsible defaultOpen={isParentActive(item.type)}>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isParentActive(item.type)}
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
