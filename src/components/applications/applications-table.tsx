
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ApplicationListItem, PaginatedApplications } from '@/lib/definitions';
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
import { Loader2 } from 'lucide-react';
import { getApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ApplicationsTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
}

export function ApplicationsTable({ initialData, accessToken }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.data || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(!!initialData?.pagination && initialData.pagination.currentPage < initialData.pagination.pageCount);
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const isInitialLoad = useRef(true);

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getApplications(accessToken, nextPage);
    addLog(log || "Log for getApplications");

    if (newData) {
      const newApps = newData.data || [];
      const newPagination = newData.pagination;

      if (Array.isArray(newApps)) {
        setApplications(prev => [...prev, ...newApps]);
        if (newPagination) {
            setPage(newPagination.currentPage);
            setHasMore(newPagination.currentPage < newPagination.pageCount);
        } else {
            setHasMore(false);
        }
      }
    } else {
        setHasMore(false); // Stop trying if API fails or returns unexpected data
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
        (item.patta_no && item.patta_no.toLowerCase().includes(lowercasedFilter)) ||
        (item.status_name && item.status_name.toLowerCase().includes(lowercasedFilter))
    );
  }, [applications, searchTerm]);

  const handleRowClick = (app: ApplicationListItem) => {
    const isHill = app.application_type === 'hill';
    router.push(`/dashboard/my-applications/${app.id}?workflow_sequence_id=${app.workflow_sequence_id}${isHill ? '&is_hill=true' : ''}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Search by Application ID, Patta, or Status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Patta Number</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={`${app.id}-${app.application_id}`} onClick={() => handleRowClick(app)} className="cursor-pointer">
                  <TableCell className="font-medium font-mono">{app.application_id || 'N/A'}</TableCell>
                  <TableCell>{app.patta_no || 'N/A'}</TableCell>
                  <TableCell>{parseFloat(app.applied_area).toFixed(2)} {app.area_type}</TableCell>
                  <TableCell>
                    {app.created_at}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{app.status_name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/my-applications/${app.id}?workflow_sequence_id=${app.workflow_sequence_id}`}>View</Link>
                        </Button>
                         <Button variant="default" size="sm" asChild>
                           <Link href={`/dashboard/my-applications/${app.id}/track`}>Track</Link>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No applications found.
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
