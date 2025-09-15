
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ApplicationListItem, PaginatedApplications, ApplicationStatusOption } from '@/lib/definitions';
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
import { getApplications, forwardApplication } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import Link from 'next/link';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface DlcRecommendationsTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  statuses: ApplicationStatusOption[];
}

export function DlcRecommendationsTable({ initialData, accessToken, statuses }: DlcRecommendationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') || 'conversion') as 'conversion' | 'diversion';
  const { addLog } = useDebug();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const [isForwarding, setIsForwarding] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const externalRef = useRef(null);
  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });
  
  const WORKFLOW_MAP = {
    conversion: 23,
    diversion: 20,
  };

  // This effect resets the state when the initial data prop changes.
  useEffect(() => {
    setApplications(initialData?.applications || []);
    setPage(initialData?.pagination.currentPage || 1);
    setHasMore((initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1));
    setSelectedRows({});
  }, [initialData]);

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const workflowId = WORKFLOW_MAP[type];
    const { data: newData, log } = await getApplications(accessToken, nextPage, 10, workflowId);
    addLog(log || "Log for getApplications DLC Recommendations");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken, type, WORKFLOW_MAP]);
  
  useEffect(() => {
    if (isNearScreen) {
        loadMoreApplications();
    }
  }, [isNearScreen, loadMoreApplications]);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      filteredData.forEach(app => {
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
    addLog(`Forwarding applications with IDs: [${selectedIds.join(', ')}] from DLC Recommendations`);

    const results = await Promise.all(
        selectedIds.map(id => {
            const payload = {
                application_details_id: parseInt(id),
                verification_status_id: 6, // This is a placeholder status for 'Forward'
                remark: "Forwarded from DLC Recommendations",
                attachment: "",
                status: 1, 
            };
            return forwardApplication(payload, accessToken);
        })
    );
    
    const successfulForwards = results.filter(r => r.success).length;
    const failedForwards = results.length - successfulForwards;

    if (successfulForwards > 0) {
        toast({
            title: "Forward Successful",
            description: `${successfulForwards} application(s) have been forwarded.`
        });
        setSelectedRows({});
        // Consider a data refresh here
    }

    if (failedForwards > 0) {
         toast({
            title: "Forward Failed",
            description: `${failedForwards} application(s) could not be forwarded. Check logs for details.`,
            variant: "destructive"
        });
    }

    setIsForwarding(false);
  };


  const filteredData = useMemo(() => {
    if (!searchTerm) return applications;
    const lowercasedFilter = searchTerm.toLowerCase();
    return applications.filter(
      (item) =>
        item.application_id?.toLowerCase().includes(lowercasedFilter) ||
        item.patta_no.toLowerCase().includes(lowercasedFilter)
    );
  }, [applications, searchTerm]);

  const handleRowClick = (appId: number) => {
    router.push(`/dashboard/application/${appId}?from=/dashboard/dlc-recommendations&type=${type}`);
  };

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by App ID, Patta No."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md pl-10"
          />
        </div>
         <Button onClick={handleForward} disabled={isForwarding || selectedIds.length === 0}>
            {isForwarding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Forward to LRD ({selectedIds.length})
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
              <TableHead>App-ID</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app.id)} className="cursor-pointer">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRows[app.id] || false}
                      onCheckedChange={(checked) => handleSelectRow(app.id.toString(), !!checked)}
                      aria-label={`Select row ${app.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium font-mono">{app.application_id || 'N/A'}</TableCell>
                  <TableCell>{app.patta_no}</TableCell>
                  <TableCell>{parseFloat(app.applied_area).toFixed(2)} {app.area_type}</TableCell>
                  <TableCell>
                    <div className='flex justify-end items-center gap-2' onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/application/${app.id}?from=/dashboard/dlc-recommendations&type=${type}`}>Review</Link>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No recommendations found.
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
