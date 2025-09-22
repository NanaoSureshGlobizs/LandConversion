

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilePlus2, Files, LogOut, Home, FileBarChart, ThumbsUp, FileSearch, ShieldCheck, FileText, Gavel, ChevronDown, History, Users, Building2, Briefcase, Trees, Map, Library, AreaChart, Mountain } from 'lucide-react';
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
import { Badge } from '../ui/badge';

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
    href: '/dashboard/hill-applications',
    label: 'Hill Applications',
    icon: Mountain,
    accessKey: 'hill_application',
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
    label: 'Conversion',
    icon: FileText,
    accessKey: 'conversion',
    subItems: [
        { href: '/dashboard/pending-enquiries', label: 'Pending Enquiries', type: 'conversion', accessKey: 'pending_enquiries' },
        { href: '/dashboard/enquiries', label: 'Enquiries', type: 'conversion', accessKey: 'enquiries' },
        { href: '/dashboard/sdao-enquiries', label: 'SDAO Enquiries', type: 'conversion', accessKey: 'SDAO_enquiries' },
        { href: '/dashboard/llmc-review', label: 'LLMC Review', type: 'conversion', accessKey: 'llmc_review' },
        { href: '/dashboard/report', label: 'Report', type: 'conversion', accessKey: 'report' },
        { href: '/dashboard/dlc-recommendations', label: 'DLC Recommendations', type: 'conversion', accessKey: 'dlc_recommendations' },
        { href: '/dashboard/lrd-decision', label: 'LRD Decision', type: 'conversion', accessKey: 'lrd_decision' },
        { href: '/dashboard/decision-and-fees', label: 'Decision & Fees', type: 'conversion', accessKey: 'decision_and_fees' },
        { href: '/dashboard/dc-office', label: 'DC Office', type: 'conversion', accessKey: 'dc_office' },
        { href: '/dashboard/dfo-report', label: 'DFO Report', type: 'conversion', accessKey: 'dfo_report' },
        { href: '/dashboard/sdo-dao-report', label: 'SDO/DAO Report', type: 'conversion', accessKey: 'sdo_dao_report' },
        { href: '/dashboard/llmc-recommendations', label: 'LLMC Recommendations', type: 'conversion', accessKey: 'llmc_recommendations' },
        { href: '/dashboard/sdc-report', label: 'SDC Report', type: 'conversion', accessKey: 'sdc_report' },
        { href: '/dashboard/marsac-report', label: 'MARSAC Report', type: 'conversion', accessKey: 'marsac_report' },
        { href: '/dashboard/unprocessed-applications', label: 'Unprocessed Applications', type: 'conversion', accessKey: 'unprocessed_applications' },
    ]
  },
  {
    label: 'Diversion',
    icon: ShieldCheck,
    accessKey: 'diversion',
    subItems: [
        { href: '/dashboard/pending-enquiries', label: 'Pending Enquiries', type: 'diversion', accessKey: 'pending_enquiries' },
        { href: '/dashboard/sdc-report', label: 'SDC Report', type: 'diversion', accessKey: 'sdc_report' },
        { href: '/dashboard/dc-office', label: 'DC Office', type: 'diversion', accessKey: 'dc_office' },
        { href: '/dashboard/sdo-dao-report', label: 'SDO/DAO Report', type: 'diversion', accessKey: 'sdo_dao_report' },
        { href: '/dashboard/sdao-enquiries', label: 'SDAO Enquiries', type: 'diversion', accessKey: 'SDAO_enquiries' },
        { href: '/dashboard/dlc-recommendations', label: 'DLC Recommendations', type: 'diversion', accessKey: 'dlc_recommendations' },
        { href: '/dashboard/final-orders', label: 'Final Orders', type: 'diversion', accessKey: 'final_order' },
        { href: '/dashboard/marsac-report', label: 'MARSAC Report', type: 'diversion', accessKey: 'marsac_report' },
        { href: '/dashboard/cabinet', label: 'Cabinet', type: 'diversion', accessKey: 'cabinet' },
        { href: '/dashboard/unprocessed-applications', label: 'Unprocessed Applications', type: 'diversion', accessKey: 'unprocessed_applications' },
        { href: '/dashboard/enquiries', label: 'Enquiries', type: 'diversion', accessKey: 'enquiries' },
    ]
  },
  {
    href: '/dashboard/area-lesser',
    label: '< 0.5 Hectare',
    icon: AreaChart,
    accessKey: 'less_than',
  },
  {
    href: '/dashboard/area-greater',
    label: '> 0.5 Hectare',
    icon: AreaChart,
    accessKey: 'greater_than',
  },
  {
    href: '/dashboard/area',
    label: 'Area-wise List (All)',
    icon: AreaChart,
    accessKey: 'both_hectare',
  },
  /*
  {
    href: '/dashboard/llmc-meeting',
    label: 'LLMC Meeting',
    icon: Library,
    accessKey: 'llmc_meeting',
  },
  */
  {
    label: 'LLMC',
    icon: Library,
    accessKey: 'llmc_menu',
    subItems: [
        { href: '/dashboard/llmc-review', label: 'LLMC Review', type: 'conversion', accessKey: 'llmc_review' },
    ]
  },
  {
    href: '/dashboard/reports-from-dlc',
    label: 'Reports from DLC',
    icon: FileBarChart,
    accessKey: 'dlc_report',
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, access, role } = useAuth();
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
    
    if (exact) {
        return currentPath === href;
    }
    
    if (itemType) {
      return currentPath === href && currentType === itemType;
    }
    
    // Fallback for non-exact, non-typed links
    return currentPath === href;
  };
  
 const visibleMenuItems = useMemo(() => {
    const userAccessSet = new Set(access);
    const finalItems: (typeof allMenuItems[0])[] = [];

    allMenuItems.forEach(item => {
        // If it's a top-level link without sub-items
        if (!item.subItems) {
            if (!item.accessKey || userAccessSet.has(item.accessKey)) {
                finalItems.push(item);
            }
            return;
        }

        // If it has sub-items, filter them first
        const visibleSubItems = item.subItems.filter(subItem => 
            !subItem.accessKey || userAccessSet.has(subItem.accessKey)
        );

        // Special handling for MARSAC role to show MARSAC Report as top-level
        if (role === 'MARSAC' && visibleSubItems.length > 0) {
            const marsacItem = visibleSubItems.find(sub => sub.accessKey === 'marsac_report');
            if (marsacItem && !finalItems.some(fi => fi.href === marsacItem.href)) {
                 finalItems.push({
                    href: marsacItem.href,
                    label: 'MARSAC Report',
                    icon: Trees,
                    accessKey: 'marsac_report'
                });
            }
            return; // Stop processing this parent item (Conversion/Diversion)
        }


        if (visibleSubItems.length > 0) {
            // If there's more than one sub-item, or the parent itself is a menu group, show the parent.
            if (visibleSubItems.length > 1 || !item.href) {
                finalItems.push({ ...item, subItems: visibleSubItems });
            } else {
                // If only one sub-item is visible, promote it to a top-level item
                const singleSubItem = visibleSubItems[0];
                finalItems.push({
                    ...singleSubItem,
                    label: singleSubItem.label,
                    icon: item.icon, // Use parent icon
                    href: singleSubItem.type ? `${singleSubItem.href}?type=${singleSubItem.type}` : singleSubItem.href
                });
            }
        }
    });

    return finalItems;
}, [access, role]);


  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/image/kanglasha.png" alt="Kanglasha Logo" width={40} height={40} />
          <div className='flex flex-col'>
            <span className="text-xl font-bold font-headline">Change of Land Use</span>
            <span className="text-sm text-muted-foreground">Government of Manipur</span>
          </div>
        </div>
        {role && (
          <div className="mt-2">
              <Badge variant="outline" className="w-full justify-center">
                  Role: {role}
              </Badge>
          </div>
        )}
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
                                      <SidebarMenuSubButton asChild isActive={isLinkActive(subItem.href, subItem.type)}>
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
        {process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && (
          <div className="flex items-center space-x-2 p-2">
            <Label htmlFor="debug-mode">Debug Mode</Label>
            <Switch
              id="debug-mode"
              checked={isDebugMode}
              onCheckedChange={setIsDebugMode}
            />
          </div>
        )}
        <SidebarSeparator />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="size-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
