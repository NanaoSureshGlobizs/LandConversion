

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
    accessKey: 'llmc_recommendations',
     subItems: [
        { href: '/dashboard/llmc-recommendations', label: 'Conversion', type: 'conversion', accessKey: 'llmc_recommendations' },
    ]
  },
  {
    label: 'LLMC',
    icon: Library,
    accessKey: 'llmc_meeting',
    subItems: [
        { href: '/dashboard/llmc-meeting', label: 'LLMC Meeting', accessKey: 'llmc_meeting' },
        { href: '/dashboard/llmc-review', label: 'LLMC Review', type: 'conversion', accessKey: 'llmc_review' },
    ]
  },
  {
    href: '/dashboard/reports-from-dlc',
    label: 'Reports from DLC',
    icon: FileBarChart,
    accessKey: 'dlc_report',
  },
    {
    href: '/dashboard/report',
    label: 'Report',
    icon: FileText,
    accessKey: 'report',
     subItems: [
        { href: '/dashboard/report', label: 'Conversion', type: 'conversion', accessKey: 'report' },
        { href: '/dashboard/report', label: 'Diversion', type: 'diversion', accessKey: 'report' }
    ]
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
    
    if (exact || (href && href.includes('?'))) {
        if (itemType) {
            return currentPath === href && currentType === itemType;
        }
        return currentPath === href && !searchParams.has('type');
    }
    
    if (itemType) {
      return currentPath === href && currentType === itemType;
    }
    
    return currentPath.startsWith(href) && (currentPath.length === href.length || currentPath[href.length] === '/');
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      const hasAccessToParent = !item.accessKey || userAccessSet.has(item.accessKey);

      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(subItem => 
            !subItem.accessKey || userAccessSet.has(subItem.accessKey)
        );

        if (visibleSubItems.length > 0) {
            return { ...item, subItems: visibleSubItems };
        }
        // If parent is accessible on its own but has no visible children, show it as a single item
        if (hasAccessToParent && item.href) {
            const newItem = {...item};
            delete newItem.subItems;
            return newItem;
        }
        return null; // Hide parent if it's not accessible and has no visible children
      }
      
      return hasAccessToParent ? item : null;

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
