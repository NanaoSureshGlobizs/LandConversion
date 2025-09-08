
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
    label: 'Enquiries',
    icon: FileSearch,
    accessKey: 'enquiries',
    type: 'enquiries',
    subItems: [
        {
            href: '/dashboard/enquiries',
            label: 'Conversion',
            accessKey: 'conversion',
            type: 'conversion',
        },
        {
            href: '/dashboard/enquiries',
            label: 'Diversion',
            accessKey: 'diversion',
            type: 'diversion',
        },
    ]
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
            type: 'conversion'
        },
        {
            href: '/dashboard/llmc-recommendations',
            label: 'LLMC Recommendations',
            accessKey: 'llmc_recommendations',
            type: 'conversion'
        },
        {
            href: '/dashboard/report',
            label: 'Report',
            accessKey: 'report',
            type: 'conversion'
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
            type: 'diversion'
        },
        {
            href: '/dashboard/llmc-recommendations',
            label: 'LLMC Recommendations',
            accessKey: 'llmc_recommendations',
            type: 'diversion'
        },
        {
            href: '/dashboard/report',
            label: 'Report',
            accessKey: 'report',
            type: 'diversion'
        },
        {
            href: '/dashboard/final-orders',
            label: 'Final Orders',
            accessKey: 'final_orders', 
            type: 'diversion'
        }
    ]
  },
  {
    label: 'SDAO Enquiries',
    icon: FileSearch,
    accessKey: 'SDAO_enquiries',
    type: 'sdao',
     subItems: [
        {
            href: '/dashboard/sdao-enquiries',
            label: 'Conversion',
            accessKey: 'conversion',
            type: 'conversion'
        },
        {
            href: '/dashboard/sdao-enquiries',
            label: 'Diversion',
            accessKey: 'diversion',
            type: 'diversion'
        },
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

    if(itemType === 'enquiries') {
        return currentPath === '/dashboard/enquiries';
    }
    if (itemType === 'sdao') {
        return currentPath === '/dashboard/sdao-enquiries';
    }
    
    // For Conversion/Diversion, check if any sub-item is active with the correct type
    const parentItem = allMenuItems.find(i => i.type === itemType);
    if(parentItem && parentItem.subItems) {
        return parentItem.subItems.some(sub => isLinkActive(sub.href, sub.type));
    }

    return false;
  }

  const isLinkActive = (href?: string, itemType?: string, exact: boolean = false) => {
    const currentPath = pathname;
    const currentType = searchParams.get('type');
    
    if (href && itemType) {
        return currentPath === href && currentType === itemType;
    }
    
    if (exact) {
      return currentPath === href;
    }
    
    if (href) {
      return currentPath.startsWith(href) && href !== '/dashboard';
    }
    
    return false;
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      // Handle parent menu items with sub-items
      if (item.subItems) {
        // Parent must have access key
        if (!userAccessSet.has(item.accessKey)) return null;

        let visibleSubItems = item.subItems.filter(sub => {
           // Special case for final_orders, it requires its own key AND diversion key on parent
           if (sub.accessKey === 'final_orders') {
               return userAccessSet.has('final_orders');
           }
           // For SDAO and Enquiries, the sub-items depend on conversion/diversion keys
           if (item.accessKey === 'SDAO_enquiries' || item.accessKey === 'enquiries') {
                return userAccessSet.has(sub.accessKey);
           }
           // For main Conversion/Diversion menus, sub-items need their own keys
           return userAccessSet.has(sub.accessKey);
        });
        
        if (visibleSubItems.length > 0) {
          return { ...item, subItems: visibleSubItems };
        }
        return null; // Hide parent if no sub-items are visible
      }

      // Handle regular, non-parent menu items
      if (userAccessSet.has(item.accessKey)) {
        return item;
      }

      return null;
    }).filter(Boolean) as typeof allMenuItems;

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
                                    <SidebarMenuSubButton asChild isActive={isLinkActive(subItem.href, subItem.type)}>
                                        <Link href={`${subItem.href}?type=${subItem.type}`}>
                                            <span>{subItem.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                 </Collapsible>
              ) : (
                <SidebarMenuButton asChild isActive={isLinkActive(item.href, undefined, item.exact)}>
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
