

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilePlus2, Files, LogOut, Home, FileBarChart, ThumbsUp, FileSearch, ShieldCheck, FileText, Gavel, ChevronDown, History, Users, Building2, Briefcase, Trees, Map } from 'lucide-react';
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
    href: '/dashboard/unprocessed-applications?type=conversion',
    label: 'Conversion',
    icon: FileText,
    accessKey: 'conversion',
    type: 'conversion'
  },
  {
    href: '/dashboard/pending-enquiries?type=diversion',
    label: 'Diversion',
    icon: FileText,
    accessKey: 'diversion',
    type: 'diversion'
  }
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
    if (!item.subItems) return item.type ? currentType === item.type : false;
    
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
    
    if(href) {
        return currentPath.startsWith(href);
    }
    
    return false;
  };
  
 const visibleMenuItems = useMemo(() => {
    // For testing: show all items if access array is empty. Remove this for production.
    if (access.length === 0) {
        // return allMenuItems; 
    }

    const userAccessSet = new Set(access);

    return allMenuItems.map(item => {
      // If user doesn't have access to the main item, skip it
      if (item.accessKey && !userAccessSet.has(item.accessKey)) {
        return null;
      }
      
      // If item has sub-items, filter them based on user access
      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(subItem => !subItem.accessKey || userAccessSet.has(subItem.accessKey));
        
        // If no sub-items are visible, don't show the parent menu
        if (visibleSubItems.length === 0) {
            return null;
        }
        return { ...item, subItems: visibleSubItems };
      }

      // If it's a regular item, just return it
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
                     <SidebarMenuButton asChild isActive={isLinkActive(item.href, item.type, item.exact)}>
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

    