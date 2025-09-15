

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilePlus2, Files, LogOut, Home, FileBarChart, ThumbsUp, FileSearch, ShieldCheck, FileText, Gavel, ChevronDown, History, Users, Building2, Briefcase, Trees, Map, Library, AreaChart } from 'lucide-react';
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
  {
    href: '/dashboard/user-management',
    label: 'User Management',
    icon: Users,
    accessKey: 'user_management',
  },
  {
    href: '/dashboard/legacy-data',
    label: 'Legacy Data',
    icon: History,
    accessKey: 'legacy_data',
  },
  {
    href: '/dashboard/pending-enquiries',
    label: 'Pending Enquiries',
    icon: FileSearch,
    accessKey: 'enquiry',
    subItems: [
        { href: '/dashboard/pending-enquiries', label: 'Conversion', type: 'conversion', accessKey: 'enquiry' },
        { href: '/dashboard/pending-enquiries', label: 'Diversion', type: 'diversion', accessKey: 'enquiry' }
    ]
  },
   {
    href: '/dashboard/sdao-enquiries',
    label: 'SDAO Enquiries',
    icon: FileSearch,
    accessKey: 'sdao_enquiries',
    subItems: [
        { href: '/dashboard/sdao-enquiries', label: 'Conversion', type: 'conversion', accessKey: 'sdao_enquiries' },
        { href: '/dashboard/sdao-enquiries', label: 'Diversion', type: 'diversion', accessKey: 'sdao_enquiries' }
    ]
  },
  {
    href: '/dashboard/sdo-dao-report',
    label: 'SDO/DAO Report',
    icon: FileBarChart,
    accessKey: 'sdo_dao_report',
    subItems: [
        { href: '/dashboard/sdo-dao-report', label: 'Conversion', type: 'conversion', accessKey: 'sdo_dao_report' },
        { href: '/dashboard/sdo-dao-report', label: 'Diversion', type: 'diversion', accessKey: 'sdo_dao_report' }
    ]
  },
  {
    href: '/dashboard/area-lesser',
    label: '< 0.5 Hectare',
    icon: AreaChart,
    accessKey: 'less_then',
  },
  {
    href: '/dashboard/area-greater',
    label: '> 0.5 Hectare',
    icon: AreaChart,
    accessKey: 'greater_then',
  },
  {
    href: '/dashboard/area',
    label: 'Area-wise List (All)',
    icon: AreaChart,
    accessKey: 'both_hectare',
  },
  {
    href: '/dashboard/llmc-recommendations',
    label: 'LLMC Recommendations',
    icon: ThumbsUp,
    accessKey: 'llmc_meeting',
  },
  {
    href: '/dashboard/reports-from-dlc',
    label: 'Reports from DLC',
    icon: FileBarChart,
    accessKey: 'dlc_report',
  },
  {
    href: '/dashboard/final-orders',
    label: 'Final Orders',
    icon: Gavel,
    accessKey: 'final_order',
     subItems: [
        { href: '/dashboard/final-orders', label: 'Diversion', type: 'diversion', accessKey: 'final_order' }
    ]
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

  const isParentActive = (item: typeof allMenuItems[0]) => {
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
    
    if (!href) return false;
    
    // Check for exact match first for sub-items or exact routes
    if (exact || itemType) {
        if (itemType) {
            return currentPath === href && currentType === itemType;
        }
        return currentPath === href;
    }
    
    // Fallback for non-exact matches where href is a prefix of the pathname
    if (currentPath.startsWith(href) && (currentPath.length === href.length || currentPath[href.length] === '/')) {
        return true;
    }
    
    return false;
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      // If the parent item has an accessKey and the user doesn't have it, skip it.
      if (item.accessKey && !userAccessSet.has(item.accessKey)) {
        // However, if it's a menu with sub-items, we need to check if any sub-item is accessible.
        if (!item.subItems || item.subItems.length === 0) {
          return null;
        }
      }
      
      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(subItem => 
            !subItem.accessKey || userAccessSet.has(subItem.accessKey)
        );
        
        // If the parent has no access key itself, but no sub-items are visible, hide the parent.
        if (!item.accessKey && visibleSubItems.length === 0) {
            return null;
        }

        // If the user has direct access to the parent item, show it with its filtered sub-items.
        if (item.accessKey && userAccessSet.has(item.accessKey)) {
            return { ...item, subItems: visibleSubItems };
        }

        // If the parent has no access key, it's a container. Show if it has visible children.
        if (!item.accessKey && visibleSubItems.length > 0) {
            return { ...item, subItems: visibleSubItems };
        }

        return null;
      }

      // If it's a regular item, just return it (access check already passed or no key)
      return item;
    }).filter(Boolean) as (typeof allMenuItems[0])[];

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
          {visibleMenuItems.map((item) => {
            const hasVisibleSubItems = item.subItems && item.subItems.length > 0;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.label}>
                {hasVisibleSubItems ? (
                   <Collapsible defaultOpen={isParentActive(item)}>
                      <CollapsibleTrigger asChild>
                           <SidebarMenuButton
                              isActive={isParentActive(item)}
                              className="w-full"
                          >
                              {Icon && <Icon />}
                              <span>{item.label}</span>
                               <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                          <SidebarMenuSub>
                          {item.subItems!.map((subItem) => (
                                  <SidebarMenuSubItem key={`${item.label}-${subItem.label}`}>
                                      <SidebarMenuSubButton asChild isActive={isLinkActive(subItem.href, subItem.type, true)}>
                                          <Link href={subItem.type ? `${subItem.href}?type=${subItem.type}` : subItem.href!}>
                                              <span>{subItem.label}</span>
                                          </Link>
                                      </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                              ))}
                          </SidebarMenuSub>
                      </CollapsibleContent>
                   </Collapsible>
                ) : (
                   item.href && (
                     <SidebarMenuButton asChild isActive={isLinkActive(item.href, undefined, item.exact)}>
                       <Link href={item.href}>
                           {Icon && <Icon />}
                           <span>{item.label}</span>
                       </Link>
                     </SidebarMenuButton>
                   )
                )}
              </SidebarMenuItem>
            );
          })}
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
