
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { HillApplicationListItem, PaginatedHillApplications } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { getHillApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HillApplicationsTableProps {
  initialData: PaginatedHillApplications | null;
  accessToken: string;
}

export function HillApplicationsTable({ initialData, accessToken }: HillApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<HillApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const router = useRouter();
  const isInitialLoad = useRef(true);

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getHillApplications(accessToken, nextPage);
    addLog(log || "Log for getHillApplications");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken]);
  
  useEffect(() => {
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }
    if (isNearScreen) {
        loadMoreApplications();
    }
  }, [isNearScreen, loadMoreApplications]);


  const filteredData = useMemo(() => {
    if (!searchTerm) return applications;
    const lowercasedFilter = searchTerm.toLowerCase();
    return applications.filter(
      (item) =>
        item.application_id?.toLowerCase().includes(lowercasedFilter) ||
        item.district_name.toLowerCase().includes(lowercasedFilter) ||
        item.sub_division_name.toLowerCase().includes(lowercasedFilter) ||
        item.land_address.toLowerCase().includes(lowercasedFilter)
    );
  }, [applications, searchTerm]);
  
  const handleRowClick = (app: HillApplicationListItem) => {
    router.push(`/dashboard/application/${app.id}?from=/dashboard/hill-applications&workflow_sequence_id=${app.workflow_sequence_id}`);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search by App ID, District, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            />
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Land Address</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app)} className="cursor-pointer">
                  <TableCell className="font-medium font-mono">{app.application_id || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="font-medium">{app.district_name}</div>
                    <div className="text-sm text-muted-foreground">{app.sub_division_name}</div>
                  </TableCell>
                  <TableCell>{app.land_address}</TableCell>
                  <TableCell>{parseFloat(app.applied_area).toFixed(2)} {app.applied_area_unit_name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{app.status_name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/application/${app.id}?from=/dashboard/hill-applications&workflow_sequence_id=${app.workflow_sequence_id}`}>View</Link>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hill applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <div ref={externalRef} className="h-10" />

       {isLoading && (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading more applications...</span>
        </div>
      )}
       {!isLoading && hasMore && (
        <div className="flex justify-center">
            <Button onClick={loadMoreApplications} variant="outline">
                Load More
            </Button>
        </div>
      )}
      {!hasMore && (
        <p className="text-center text-muted-foreground py-4">You have reached the end of the list.</p>
      )}
    </div>
  );
}
