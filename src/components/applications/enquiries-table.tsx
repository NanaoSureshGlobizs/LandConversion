

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ApplicationListItem, PaginatedApplications } from '@/lib/definitions';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, CalendarIcon, Search } from 'lucide-react';
import { getApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface EnquiriesTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  workflowId: number | null;
}

export function EnquiriesTable({ initialData, accessToken, workflowId }: EnquiriesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'conversion';

  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const isInitialLoad = useRef(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [status, setStatus] = useState('');

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const refreshData = useCallback(async (filters = {}) => {
    setIsLoading(true);
    const { data: newData, log } = await getApplications(accessToken, 1, 10, workflowId, filters);
    addLog(log || "Log for getApplications refresh");
    if (newData && Array.isArray(newData.applications)) {
      setApplications(newData.applications);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
      setApplications([]);
      setHasMore(false);
    }
    setIsLoading(false);
  }, [accessToken, workflowId, addLog]);

  const handleSearch = () => {
    const filters = {
      from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : '',
      to_date: toDate ? format(toDate, 'yyyy-MM-dd') : '',
      application_status_id: status === 'all' ? '' : status,
      patta_no: searchTerm,
    };
    refreshData(filters);
  };

  // This effect resets the state when the initial data prop changes.
  // This is crucial for when the user navigates between "Conversion" and "Diversion" tabs.
  useEffect(() => {
    setApplications(initialData?.applications || []);
    setPage(initialData?.pagination.currentPage || 1);
    setHasMore((initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1));
  }, [initialData]);


  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const filters = {
      from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : '',
      to_date: toDate ? format(toDate, 'yyyy-MM-dd') : '',
      application_status_id: status === 'all' ? '' : status,
      patta_no: searchTerm,
    };
    const { data: newData, log } = await getApplications(accessToken, nextPage, 10, workflowId, filters);
    addLog(log || "Log for getApplications");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken, workflowId, fromDate, toDate, status, searchTerm]);
  
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
    router.push(`/dashboard/application/${app.id}?from=/dashboard/enquiries&type=${type}&workflow_sequence_id=${app.workflow_sequence_id}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <Input
          placeholder="Search by Patta No."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
              <Button
                  variant={'outline'}
                  className={cn(
                  'w-full justify-start text-left font-normal',
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
                    'w-full justify-start text-left font-normal',
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
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <Search />}
          Search
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App-ID</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>Applied Area</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app)} className="cursor-pointer">
                  <TableCell className="font-medium font-mono">{app.application_id || 'N/A'}</TableCell>
                  <TableCell>{app.patta_no}</TableCell>
                  <TableCell>{parseFloat(app.applied_area).toFixed(2)} {app.area_type}</TableCell>
                  <TableCell>{app.district.name}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/application/${app.id}?from=/dashboard/enquiries&type=${type}&workflow_sequence_id=${app.workflow_sequence_id}`}>View Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No enquiries found.
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
