
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ApplicationListItem, PaginatedApplications, ApplicationStatusOption } from '@/lib/definitions';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { MultipleForwardForm } from './multiple-forward-form';

const WORKFLOW_ID = 20;

interface CabinetDecisionTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  statuses: ApplicationStatusOption[];
}

export function CabinetDecisionTable({ initialData, accessToken, statuses }: CabinetDecisionTableProps) {
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const router = useRouter();
  const isInitialLoad = useRef(true);

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const { data: newData, log } = await getApplications(accessToken, 1, 10, WORKFLOW_ID);
    addLog(log || "Log for getApplications refresh in Cabinet Decision");
    if (newData && Array.isArray(newData.applications)) {
        setApplications(newData.applications);
        setPage(newData.pagination.currentPage);
        setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    }
    setIsLoading(false);
    setSelectedRows({});
  }, [accessToken, addLog]);

  useEffect(() => {
    setApplications(initialData?.applications || []);
    setPage(initialData?.pagination.currentPage || 1);
    setHasMore((initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1));
  }, [initialData]);

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getApplications(accessToken, nextPage, 10, WORKFLOW_ID);
    addLog(log || "Log for getApplications in Cabinet Decision");

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
  
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      applications.forEach(app => {
        newSelectedRows[app.id.toString()] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  const selectedIds = useMemo(() => {
      return Object.keys(selectedRows).filter(id => selectedRows[id]);
  }, [selectedRows]);

  const isAllSelected = applications.length > 0 && selectedIds.length === applications.length;

  const handleRowClick = (app: ApplicationListItem) => {
    router.push(`/dashboard/application/${app.id}?from=/dashboard/cabinet-decision&workflow_sequence_id=${app.workflow_sequence_id}`);
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <MultipleForwardForm
                applicationIds={selectedIds}
                accessToken={accessToken}
                onSuccess={refreshData}
            >
                <Button disabled={selectedIds.length === 0}>
                    Forward ({selectedIds.length})
                </Button>
            </MultipleForwardForm>
        </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Application ID</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={selectedRows[app.id.toString()] || false}
                            onCheckedChange={(checked) => handleSelectRow(app.id.toString(), !!checked)}
                            aria-label={`Select row ${app.id}`}
                        />
                    </TableCell>
                  <TableCell className="font-medium font-mono cursor-pointer" onClick={() => handleRowClick(app)}>{app.application_id || 'N/A'}</TableCell>
                   <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>{app.patta_no}</TableCell>
                   <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>{parseFloat(app.applied_area).toFixed(2)} {app.area_type}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>{app.created_at}</TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>
                    <Badge variant="secondary">{app.application_status.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className='flex justify-end items-center gap-2' onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/application/${app.id}?from=/dashboard/cabinet-decision&workflow_sequence_id=${app.workflow_sequence_id}`}>View</Link>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
