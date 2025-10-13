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
import { getApplicationsByArea, forwardMultipleApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface AreaGreaterTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  statuses: ApplicationStatusOption[];
}

export function AreaGreaterTable({ initialData, accessToken, statuses }: AreaGreaterTableProps) {
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const { toast } = useToast();
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
    const { data: newData, log } = await getApplicationsByArea(accessToken, 'greater', nextPage);
    addLog(log || "Log for getApplicationsByArea (greater)");

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

  const handleRowClick = (app: ApplicationListItem) => {
    router.push(`/dashboard/application/${app.id}?from=/dashboard/area-greater&workflow_sequence_id=${app.workflow_sequence_id}`);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      applications.forEach(app => {
        newSelectedRows[app.id] = true;
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

  const handleForward = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select at least one application to forward.",
        variant: "destructive"
      });
      return;
    }

    setIsForwarding(true);
    
    const payload = {
        application_details_id: selectedIds.map(id => parseInt(id)),
        verification_status_id: 6, // Placeholder for 'Forward'
        remark: "Forwarded from > 0.5 Hectare list",
        attachment: "",
        status: 1, 
    };

    addLog(`Forwarding applications with payload: ${JSON.stringify(payload)}`);

    const result = await forwardMultipleApplications(payload, accessToken);

    if (result.success) {
      toast({
          title: "Forward Successful",
          description: `${selectedIds.length} application(s) have been forwarded.`
      });
      setSelectedRows({});
      router.refresh();
    } else {
      toast({
          title: "Forward Failed",
          description: result.message || "An unknown error occurred while forwarding applications. Check logs for details.",
          variant: "destructive"
      });
    }

    setIsForwarding(false);
  };

  const getTypeVariant = (type: string) => {
      return type.includes('After') ? 'destructive' : 'default';
  }
  
  const isAllSelected = applications.length > 0 && selectedIds.length === applications.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleForward} disabled={isForwarding || selectedIds.length === 0}>
            {isForwarding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Forward ({selectedIds.length})
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Application ID</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead>Type</TableHead>
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
                      checked={selectedRows[app.id] || false}
                      onCheckedChange={(checked) => handleSelectRow(app.id.toString(), !!checked)}
                      aria-label={`Select row ${app.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium font-mono cursor-pointer" onClick={() => handleRowClick(app)}>{app.application_id || 'N/A'}</TableCell>
                   <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>{app.patta_no}</TableCell>
                   <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>{parseFloat(app.applied_area).toFixed(2)} {app.area_type}</TableCell>
                   <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>
                      <Badge variant={getTypeVariant(app.change_of_land_use_type)}>
                          {app.change_of_land_use_type.includes('After') ? 'Conversion' : 'Diversion'}
                      </Badge>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => handleRowClick(app)}>
                    <Badge variant="secondary">{app.application_status.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className='flex justify-end items-center gap-2' onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/application/${app.id}?from=/dashboard/area-greater&workflow_sequence_id=${app.workflow_sequence_id}`}>View</Link>
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
