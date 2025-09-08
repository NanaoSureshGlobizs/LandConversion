
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

  const isParentActive = (item: typeof allMenuItems[number]) => {
    const currentPath = pathname;
    const currentType = searchParams.get('type');
    if (!item.subItems) return false;
    
    return item.subItems.some(sub => {
      if (sub.type) {
        return currentPath === sub.href && currentType === sub.type;
      }
      return currentPath.startsWith(sub.href!);
    });
  };
  

  const isLinkActive = (href?: string, itemType?: string, exact: boolean = false) => {
    const currentPath = pathname;
    const currentType = searchParams.get('type');
    
    if (exact) {
      return currentPath === href;
    }

    if (href && itemType) {
        return currentPath === href && currentType === itemType;
    }
    
    if (href && !itemType) { // For links that don't have types like my-applications
      return currentPath.startsWith(href);
    }
    
    return false;
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      // If the user doesn't have the main access key for the item, skip it.
      if (!userAccessSet.has(item.accessKey)) {
        return null;
      }

      // If the item has sub-items, filter them based on access.
      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(subItem => {
          // A sub-item is visible if the user has access to its specific key.
          return userAccessSet.has(subItem.accessKey);
        });

        // Special handling for DC role: If they have 'conversion' or 'diversion' access,
        // show the parent menu even if there are no visible sub-items.
        if (visibleSubItems.length === 0) {
            if (item.accessKey === 'conversion' && userAccessSet.has('conversion')) {
                 return { ...item, subItems: [] };
            }
            if (item.accessKey === 'diversion' && userAccessSet.has('diversion')) {
                 return { ...item, subItems: [] };
            }
            if(item.accessKey === 'enquiries' && userAccessSet.has('enquiries')) {
                return { ...item, subItems: visibleSubItems };
            }
            return null;
        }
        
        return { ...item, subItems: visibleSubItems };
      }

      // If it's a regular item with no sub-items, it's visible.
      return item;
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
              {item.subItems ? (
                 <Collapsible defaultOpen={isParentActive(item)}>
                    <CollapsibleTrigger asChild>
                         <SidebarMenuButton
                            isActive={isParentActive(item)}
                            className="w-full"
                        >
                            <item.icon />
                            <span>{item.label}</span>
                             {item.subItems && item.subItems.length > 0 && (
                                <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            )}
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {item.subItems && item.subItems.length > 0 && (
                        <CollapsibleContent>
                            <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                                    <SidebarMenuSubItem key={`${item.label}-${subItem.label}`}>
                                        <SidebarMenuSubButton asChild isActive={isLinkActive(subItem.href, subItem.type)}>
                                            <Link href={`${subItem.href}?type=${subItem.type}`}>
                                                <span>{subItem.label}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    )}
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
