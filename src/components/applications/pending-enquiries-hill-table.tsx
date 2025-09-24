
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ApplicationListItem, PaginatedApplications, ApplicationStatusOption, FullApplicationResponse } from '@/lib/definitions';
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
import { Loader2, CalendarIcon, FileText } from 'lucide-react';
import { getApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';

interface PendingEnquiriesHillTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  workflowId: number | null;
  statuses: ApplicationStatusOption[];
}

export function PendingEnquiriesHillTable({ initialData, accessToken, workflowId, statuses }: PendingEnquiriesHillTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [status, setStatus] = useState('');

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const { data: newData, log } = await getApplications(accessToken, 1, 10, workflowId);
    addLog(log || "Log for getApplications refresh");
    if (newData && Array.isArray(newData.applications)) {
        setApplications(newData.applications);
        setPage(newData.pagination.currentPage);
        setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    }
    setIsLoading(false);
  }, [accessToken, workflowId, addLog]);

  useEffect(() => {
    setApplications(initialData?.applications || []);
    setPage(initialData?.pagination.currentPage || 1);
    setHasMore((initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1));
  }, [initialData]);

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getApplications(accessToken, nextPage, 10, workflowId);
    addLog(log || "Log for getApplications");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken, workflowId]);
  
  useEffect(() => {
    if (isNearScreen) {
        loadMoreApplications();
    }
  }, [isNearScreen, loadMoreApplications]);


  const filteredData = useMemo(() => {
    if (!searchTerm) return applications;
    const lowercasedFilter = searchTerm.toLowerCase();
    return applications.filter(
      (item: any) =>
        item.application_id?.toLowerCase().includes(lowercasedFilter) ||
        item.status_name.toLowerCase().includes(lowercasedFilter)
    );
  }, [applications, searchTerm]);
  
  const handleRowClick = (app: ApplicationListItem) => {
    router.push(`/dashboard/application/${app.id}?from=/dashboard/pending-enquiries-hill&actionContext=${app.form_type}&workflow_sequence_id=${app.workflow_sequence_id}`);
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by Application ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
         <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !fromDate && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, 'PPP') : <span>From Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
            </PopoverContent>
        </Popover>
         <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !toDate && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, 'PPP') : <span>To Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
            </PopoverContent>
        </Popover>
        <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
        </Select>
        <Button>Search</Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App-ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Land Address</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app: any) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app)} className="cursor-pointer">
                  <TableCell className="font-medium font-mono">{app.application_id || ''}</TableCell>
                  <TableCell>
                    <div className="font-medium">{app.district_name}</div>
                    <div className="text-sm text-muted-foreground">{app.sub_division_name}</div>
                  </TableCell>
                  <TableCell>{app.land_address}</TableCell>
                  <TableCell>{app.created_at}</TableCell>
                  <TableCell>
                     <Badge variant="secondary">{app.status_name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                       <Button variant="outline" size="sm" asChild>
                         <Link href={`/dashboard/application/${app.id}?from=/dashboard/pending-enquiries-hill&actionContext=${app.form_type}&workflow_sequence_id=${app.workflow_sequence_id}`}>View Details</Link>
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No pending enquiries found.
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
